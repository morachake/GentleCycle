import * as SQLite from 'expo-sqlite';
import { Cycle, Period, DailyEntry, Symptom, UserProfile, FlowIntensity, SymptomType, MoodType } from '../../types';

class DatabaseManager {
  private db: SQLite.SQLiteDatabase | null = null;

  async initializeDatabase(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('gentlecycle.db');
      await this.createTables();
      await this.createIndexes();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tables = [
      // User Profile Table
      `CREATE TABLE IF NOT EXISTS user_profiles (
        id TEXT PRIMARY KEY,
        age INTEGER,
        average_cycle_length INTEGER DEFAULT 28,
        average_period_length INTEGER DEFAULT 5,
        first_day_of_week INTEGER DEFAULT 0,
        notifications_json TEXT,
        privacy_json TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // Cycles Table
      `CREATE TABLE IF NOT EXISTS cycles (
        id TEXT PRIMARY KEY,
        start_date TEXT NOT NULL,
        end_date TEXT,
        cycle_length INTEGER,
        average_flow TEXT DEFAULT 'medium',
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // Periods Table
      `CREATE TABLE IF NOT EXISTS periods (
        id TEXT PRIMARY KEY,
        cycle_id TEXT,
        start_date TEXT NOT NULL,
        end_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cycle_id) REFERENCES cycles (id)
      )`,

      // Period Days Table
      `CREATE TABLE IF NOT EXISTS period_days (
        id TEXT PRIMARY KEY,
        period_id TEXT,
        date TEXT NOT NULL,
        flow TEXT NOT NULL,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (period_id) REFERENCES periods (id)
      )`,

      // Daily Entries Table
      `CREATE TABLE IF NOT EXISTS daily_entries (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        mood TEXT,
        energy_level INTEGER,
        weight REAL,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // Symptoms Table
      `CREATE TABLE IF NOT EXISTS symptoms (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        type TEXT NOT NULL,
        severity INTEGER DEFAULT 1,
        notes TEXT,
        daily_entry_id TEXT,
        period_day_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (daily_entry_id) REFERENCES daily_entries (id),
        FOREIGN KEY (period_day_id) REFERENCES period_days (id)
      )`,

      // Predictions Table (for storing AI predictions)
      `CREATE TABLE IF NOT EXISTS predictions (
        id TEXT PRIMARY KEY,
        prediction_date TEXT NOT NULL,
        next_period_start TEXT,
        next_period_end TEXT,
        ovulation_date TEXT,
        fertility_window_start TEXT,
        fertility_window_end TEXT,
        confidence REAL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
    ];

    for (const table of tables) {
      await this.db.execAsync(table);
    }
  }

  private async createIndexes(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_cycles_start_date ON cycles(start_date)',
      'CREATE INDEX IF NOT EXISTS idx_periods_start_date ON periods(start_date)',
      'CREATE INDEX IF NOT EXISTS idx_period_days_date ON period_days(date)',
      'CREATE INDEX IF NOT EXISTS idx_daily_entries_date ON daily_entries(date)',
      'CREATE INDEX IF NOT EXISTS idx_symptoms_date ON symptoms(date)',
      'CREATE INDEX IF NOT EXISTS idx_symptoms_type ON symptoms(type)',
    ];

    for (const index of indexes) {
      await this.db.execAsync(index);
    }
  }

  // User Profile Methods
  async createUserProfile(profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      `INSERT INTO user_profiles 
       (id, age, average_cycle_length, average_period_length, first_day_of_week, notifications_json, privacy_json) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        profile.id,
        profile.age || null,
        profile.averageCycleLength,
        profile.averagePeriodLength,
        profile.firstDayOfWeek,
        JSON.stringify(profile.notifications),
        JSON.stringify(profile.privacy),
      ]
    );
  }

  async getUserProfile(): Promise<UserProfile | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync<any>(
      'SELECT * FROM user_profiles ORDER BY created_at DESC LIMIT 1'
    );

    if (!result) return null;

    return {
      id: result.id,
      age: result.age,
      averageCycleLength: result.average_cycle_length,
      averagePeriodLength: result.average_period_length,
      firstDayOfWeek: result.first_day_of_week,
      notifications: JSON.parse(result.notifications_json || '{}'),
      privacy: JSON.parse(result.privacy_json || '{}'),
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  }

  // Cycle Methods
  async createCycle(cycle: Omit<Cycle, 'createdAt' | 'updatedAt' | 'periodDays'>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      `INSERT INTO cycles (id, start_date, end_date, cycle_length, average_flow, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        cycle.id,
        cycle.startDate,
        cycle.endDate || null,
        cycle.cycleLength || null,
        cycle.averageFlow,
        cycle.notes || null,
      ]
    );
  }

  async getCycles(limit?: number): Promise<Cycle[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT * FROM cycles ORDER BY start_date DESC ${limit ? `LIMIT ${limit}` : ''}`;
    const results = await this.db.getAllAsync<any>(query);

    return results.map(row => ({
      id: row.id,
      startDate: row.start_date,
      endDate: row.end_date,
      cycleLength: row.cycle_length,
      averageFlow: row.average_flow as FlowIntensity,
      notes: row.notes,
      periodDays: [], // Will be populated by separate query if needed
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  // Period Methods
  async createPeriod(period: Omit<Period, 'createdAt' | 'updatedAt' | 'days'>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      `INSERT INTO periods (id, cycle_id, start_date, end_date) VALUES (?, ?, ?, ?)`,
      [period.id, period.cycleId, period.startDate, period.endDate || null]
    );
  }

  async addPeriodDay(periodId: string, date: string, flow: FlowIntensity, notes?: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    await this.db.runAsync(
      `INSERT INTO period_days (id, period_id, date, flow, notes) VALUES (?, ?, ?, ?, ?)`,
      [id, periodId, date, flow, notes || null]
    );
  }

  async getAllPeriods(): Promise<Period[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const periodResults = await this.db.getAllAsync<any>('SELECT * FROM periods ORDER BY start_date DESC');
    
    const periods = await Promise.all(
      periodResults.map(async (row) => {
        // Get period days for this period
        const dayResults = await this.db!.getAllAsync<any>(
          'SELECT * FROM period_days WHERE period_id = ? ORDER BY date',
          [row.id]
        );
        
        const days = dayResults.map(dayRow => ({
          id: dayRow.id,
          periodId: dayRow.period_id,
          date: dayRow.date,
          flow: dayRow.flow as FlowIntensity,
          symptoms: [], // Will be populated separately if needed
          notes: dayRow.notes,
        }));
        
        return {
          id: row.id,
          cycleId: row.cycle_id,
          startDate: row.start_date,
          endDate: row.end_date,
          days,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      })
    );
    
    return periods;
  }

  // Daily Entry Methods
  async createDailyEntry(entry: Omit<DailyEntry, 'createdAt' | 'updatedAt' | 'symptoms'>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      `INSERT INTO daily_entries (id, date, mood, energy_level, weight, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        entry.id,
        entry.date,
        entry.mood || null,
        entry.energyLevel,
        entry.weight || null,
        entry.notes || null,
      ]
    );
  }

  async updateDailyEntry(entry: Omit<DailyEntry, 'createdAt' | 'updatedAt' | 'symptoms'>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync(
      `UPDATE daily_entries 
       SET mood = ?, energy_level = ?, weight = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        entry.mood || null,
        entry.energyLevel,
        entry.weight || null,
        entry.notes || null,
        entry.id,
      ]
    );
  }

  async getDailyEntry(date: string): Promise<DailyEntry | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync<any>(
      'SELECT * FROM daily_entries WHERE date = ?',
      [date]
    );

    if (!result) return null;

    const symptoms = await this.getSymptomsByDate(date);

    return {
      id: result.id,
      date: result.date,
      mood: result.mood as MoodType,
      energyLevel: result.energy_level,
      weight: result.weight,
      notes: result.notes,
      symptoms,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  }

  // Symptom Methods
  async addSymptom(symptom: Omit<Symptom, 'id'>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);

    await this.db.runAsync(
      `INSERT INTO symptoms (id, date, type, severity, notes) VALUES (?, ?, ?, ?, ?)`,
      [id, symptom.date, symptom.type, symptom.severity, symptom.notes || null]
    );
  }

  async deleteSymptomsByDate(date: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync(
      'DELETE FROM symptoms WHERE date = ?',
      [date]
    );
  }

  async getSymptomsByDate(date: string): Promise<Symptom[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM symptoms WHERE date = ?',
      [date]
    );

    return results.map(row => ({
      id: row.id,
      type: row.type as SymptomType,
      severity: row.severity,
      date: row.date,
      notes: row.notes,
    }));
  }

  /**
   * Get all symptoms for analytics
   */
  async getAllSymptoms(): Promise<Symptom[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.getAllAsync<any>('SELECT * FROM symptoms ORDER BY date DESC');

    return results.map(row => ({
      id: row.id,
      type: row.type as SymptomType,
      severity: row.severity,
      date: row.date,
      notes: row.notes,
    }));
  }

  /**
   * Get all daily entries for analytics
   */
  async getAllDailyEntries(): Promise<DailyEntry[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.getAllAsync<any>('SELECT * FROM daily_entries ORDER BY date DESC');

    const dailyEntries = await Promise.all(
      results.map(async (row) => {
        const symptoms = await this.getSymptomsByDate(row.date);
        return {
          id: row.id,
          date: row.date,
          mood: row.mood as MoodType,
          energyLevel: row.energy_level,
          weight: row.weight,
          notes: row.notes,
          symptoms,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      })
    );

    return dailyEntries;
  }

  // Utility Methods
  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tables = ['symptoms', 'period_days', 'periods', 'cycles', 'daily_entries', 'predictions', 'user_profiles'];
    
    for (const table of tables) {
      await this.db.runAsync(`DELETE FROM ${table}`);
    }
  }

  async closeDatabase(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

export const database = new DatabaseManager();