import { database } from '../database';
import { 
  Cycle, 
  Period, 
  DailyEntry, 
  Symptom, 
  FlowIntensity, 
  SymptomType, 
  SymptomSeverity,
  MoodType,
  CyclePhase 
} from '../../types';

export interface CycleData {
  id: string;
  startDate: string;
  endDate?: string;
  periodStartDate: string;
  periodEndDate?: string;
  ovulationDate?: string;
  cycleLength?: number;
  periodLength?: number;
  symptoms: Symptom[];
  dailyEntries: DailyEntry[];
  notes?: string;
  phase: CyclePhase;
}

export interface PredictionData {
  nextPeriodStart: string;
  nextPeriodEnd: string;
  nextOvulationDate: string;
  fertilityWindowStart: string;
  fertilityWindowEnd: string;
  cycleLength: number;
  confidence: number;
}

class CycleDataService {
  private static instance: CycleDataService;

  private constructor() {}

  public static getInstance(): CycleDataService {
    if (!CycleDataService.instance) {
      CycleDataService.instance = new CycleDataService();
    }
    return CycleDataService.instance;
  }

  // CYCLE CRUD OPERATIONS

  /**
   * Create a new cycle
   */
  async createCycle(data: {
    startDate: string;
    endDate?: string;
    notes?: string;
  }): Promise<string> {
    const cycleId = this.generateId();
    const cycle: Omit<Cycle, 'createdAt' | 'updatedAt' | 'periodDays'> = {
      id: cycleId,
      startDate: data.startDate,
      endDate: data.endDate,
      averageFlow: FlowIntensity.MEDIUM,
      notes: data.notes,
    };

    await database.createCycle(cycle);
    return cycleId;
  }

  /**
   * Get all cycles
   */
  async getAllCycles(): Promise<Cycle[]> {
    return await database.getCycles();
  }

  /**
   * Get cycle by ID
   */
  async getCycleById(cycleId: string): Promise<Cycle | null> {
    const cycles = await database.getCycles();
    return cycles.find(cycle => cycle.id === cycleId) || null;
  }

  /**
   * Update cycle
   */
  async updateCycle(cycleId: string, updates: Partial<Cycle>): Promise<void> {
    const existingCycle = await this.getCycleById(cycleId);
    if (!existingCycle) {
      throw new Error('Cycle not found');
    }

    const updatedCycle = { ...existingCycle, ...updates };
    await database.createCycle(updatedCycle); // Database needs update method
  }

  /**
   * Delete cycle
   */
  async deleteCycle(cycleId: string): Promise<void> {
    // Implementation needed in database layer
    console.log(`Deleting cycle: ${cycleId}`);
  }

  // PERIOD CRUD OPERATIONS

  /**
   * Log period start
   */
  async logPeriodStart(date: string, flow?: FlowIntensity): Promise<string> {
    const periodId = this.generateId();
    const cycleId = await this.getOrCreateCurrentCycle(date);
    
    const period: Omit<Period, 'createdAt' | 'updatedAt' | 'days'> = {
      id: periodId,
      cycleId,
      startDate: date,
    };

    await database.createPeriod(period);
    
    if (flow) {
      await database.addPeriodDay(periodId, date, flow);
    }

    return periodId;
  }

  /**
   * Log period end
   */
  async logPeriodEnd(periodId: string, date: string): Promise<void> {
    // Update period end date
    const periods = await this.getAllPeriods();
    const period = periods.find(p => p.id === periodId);
    
    if (period) {
      await database.createPeriod({
        ...period,
        endDate: date,
      });
    }
  }

  /**
   * Update period flow for a specific day
   */
  async updatePeriodFlow(date: string, flow: FlowIntensity): Promise<void> {
    const periods = await this.getAllPeriods();
    const period = periods.find(p => 
      new Date(p.startDate) <= new Date(date) && 
      (!p.endDate || new Date(date) <= new Date(p.endDate))
    );

    if (period) {
      await database.addPeriodDay(period.id, date, flow);
    } else {
      // Create new period if none exists
      const periodId = await this.logPeriodStart(date, flow);
    }
  }

  /**
   * Get all periods
   */
  async getAllPeriods(): Promise<Period[]> {
    // Need to implement in database
    return [];
  }

  /**
   * Delete period
   */
  async deletePeriod(periodId: string): Promise<void> {
    console.log(`Deleting period: ${periodId}`);
  }

  // OVULATION CRUD OPERATIONS

  /**
   * Log ovulation date
   */
  async logOvulationDate(date: string): Promise<void> {
    const cycleId = await this.getOrCreateCurrentCycle(date);
    
    // Store ovulation as a special daily entry
    const dailyEntry: Omit<DailyEntry, 'createdAt' | 'updatedAt' | 'symptoms'> = {
      id: this.generateId(),
      date,
      mood: MoodType.NEUTRAL,
      energyLevel: 3,
      notes: 'Ovulation day',
    };

    await database.createDailyEntry(dailyEntry);
  }

  /**
   * Update ovulation date
   */
  async updateOvulationDate(oldDate: string, newDate: string): Promise<void> {
    // Remove old ovulation entry
    await this.deleteDailyEntry(oldDate);
    
    // Add new ovulation entry
    await this.logOvulationDate(newDate);
  }

  /**
   * Get ovulation dates for a cycle
   */
  async getOvulationDates(cycleId: string): Promise<string[]> {
    // Implementation needed to get ovulation dates
    return [];
  }

  // SYMPTOM CRUD OPERATIONS

  /**
   * Log symptoms for a date
   */
  async logSymptoms(date: string, symptoms: { type: SymptomType; severity: SymptomSeverity; notes?: string }[]): Promise<void> {
    for (const symptom of symptoms) {
      const symptomData: Omit<Symptom, 'id'> = {
        type: symptom.type,
        severity: symptom.severity,
        date,
        notes: symptom.notes,
      };
      await database.addSymptom(symptomData);
    }
  }

  /**
   * Update symptoms for a date
   */
  async updateSymptoms(date: string, symptoms: { type: SymptomType; severity: SymptomSeverity; notes?: string }[]): Promise<void> {
    // Delete existing symptoms for the date
    await this.deleteSymptomsForDate(date);
    
    // Add new symptoms
    await this.logSymptoms(date, symptoms);
  }

  /**
   * Get symptoms for a date
   */
  async getSymptomsForDate(date: string): Promise<Symptom[]> {
    return await database.getSymptomsByDate(date);
  }

  /**
   * Delete symptoms for a date
   */
  async deleteSymptomsForDate(date: string): Promise<void> {
    // Implementation needed in database
    console.log(`Deleting symptoms for date: ${date}`);
  }

  // DAILY ENTRY CRUD OPERATIONS

  /**
   * Create or update daily entry
   */
  async saveDailyEntry(data: {
    date: string;
    mood?: MoodType;
    energyLevel?: number;
    weight?: number;
    notes?: string;
    symptoms: { type: SymptomType; severity: SymptomSeverity; notes?: string }[];
  }): Promise<void> {
    const existingEntry = await database.getDailyEntry(data.date);
    
    if (existingEntry) {
      // Update existing entry
      const updatedEntry: Omit<DailyEntry, 'createdAt' | 'updatedAt' | 'symptoms'> = {
        id: existingEntry.id,
        date: data.date,
        mood: data.mood || existingEntry.mood,
        energyLevel: data.energyLevel || existingEntry.energyLevel,
        weight: data.weight || existingEntry.weight,
        notes: data.notes || existingEntry.notes,
      };
      await database.createDailyEntry(updatedEntry);
    } else {
      // Create new entry
      const dailyEntry: Omit<DailyEntry, 'createdAt' | 'updatedAt' | 'symptoms'> = {
        id: this.generateId(),
        date: data.date,
        mood: data.mood,
        energyLevel: data.energyLevel || 3,
        weight: data.weight,
        notes: data.notes,
      };
      await database.createDailyEntry(dailyEntry);
    }

    // Update symptoms separately
    if (data.symptoms.length > 0) {
      await this.updateSymptoms(data.date, data.symptoms);
    }
  }

  /**
   * Get daily entry for a date
   */
  async getDailyEntry(date: string): Promise<DailyEntry | null> {
    return await database.getDailyEntry(date);
  }

  /**
   * Delete daily entry
   */
  async deleteDailyEntry(date: string): Promise<void> {
    // Implementation needed in database
    console.log(`Deleting daily entry for: ${date}`);
  }

  // PREDICTION ALGORITHMS

  /**
   * Calculate cycle predictions based on historical data
   */
  async calculatePredictions(): Promise<PredictionData> {
    const cycles = await this.getAllCycles();
    const periods = await this.getAllPeriods();
    
    if (cycles.length === 0) {
      throw new Error('No cycle data available for predictions');
    }

    // Calculate average cycle length
    const cycleLengths = cycles
      .filter(cycle => cycle.cycleLength)
      .map(cycle => cycle.cycleLength!);
    
    const averageCycleLength = cycleLengths.length > 0 
      ? Math.round(cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length)
      : 28;

    // Calculate average period length
    const periodLengths = periods
      .filter(period => period.endDate)
      .map(period => {
        const start = new Date(period.startDate);
        const end = new Date(period.endDate!);
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      });
    
    const averagePeriodLength = periodLengths.length > 0
      ? Math.round(periodLengths.reduce((sum, length) => sum + length, 0) / periodLengths.length)
      : 5;

    // Get last period start date
    const sortedPeriods = periods.sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
    
    if (sortedPeriods.length === 0) {
      throw new Error('No period data available for predictions');
    }

    const lastPeriodStart = new Date(sortedPeriods[0].startDate);
    
    // Calculate next period predictions
    const nextPeriodStart = new Date(lastPeriodStart);
    nextPeriodStart.setDate(nextPeriodStart.getDate() + averageCycleLength);
    
    const nextPeriodEnd = new Date(nextPeriodStart);
    nextPeriodEnd.setDate(nextPeriodEnd.getDate() + averagePeriodLength - 1);
    
    // Calculate ovulation (typically 14 days before next period)
    const nextOvulationDate = new Date(nextPeriodStart);
    nextOvulationDate.setDate(nextOvulationDate.getDate() - 14);
    
    // Calculate fertility window (5 days before ovulation to 1 day after)
    const fertilityWindowStart = new Date(nextOvulationDate);
    fertilityWindowStart.setDate(fertilityWindowStart.getDate() - 5);
    
    const fertilityWindowEnd = new Date(nextOvulationDate);
    fertilityWindowEnd.setDate(fertilityWindowEnd.getDate() + 1);

    // Calculate confidence based on cycle regularity
    const cycleVariation = this.calculateCycleVariation(cycleLengths);
    const confidence = Math.max(0.3, 1 - (cycleVariation / averageCycleLength));

    return {
      nextPeriodStart: nextPeriodStart.toISOString().split('T')[0],
      nextPeriodEnd: nextPeriodEnd.toISOString().split('T')[0],
      nextOvulationDate: nextOvulationDate.toISOString().split('T')[0],
      fertilityWindowStart: fertilityWindowStart.toISOString().split('T')[0],
      fertilityWindowEnd: fertilityWindowEnd.toISOString().split('T')[0],
      cycleLength: averageCycleLength,
      confidence,
    };
  }

  /**
   * Get current cycle phase for a given date
   */
  async getCurrentCyclePhase(date: string): Promise<CyclePhase> {
    const periods = await this.getAllPeriods();
    const predictions = await this.calculatePredictions();
    
    const currentDate = new Date(date);
    
    // Check if currently in period
    const activePeriod = periods.find(period => {
      const start = new Date(period.startDate);
      const end = period.endDate ? new Date(period.endDate) : new Date(start.getTime() + 5 * 24 * 60 * 60 * 1000);
      return currentDate >= start && currentDate <= end;
    });
    
    if (activePeriod) {
      return CyclePhase.MENSTRUAL;
    }
    
    // Check cycle phase based on predictions
    const ovulationDate = new Date(predictions.nextOvulationDate);
    const daysFromOvulation = Math.floor((currentDate.getTime() - ovulationDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (Math.abs(daysFromOvulation) <= 2) {
      return CyclePhase.OVULATION;
    } else if (daysFromOvulation < -2) {
      return CyclePhase.FOLLICULAR;
    } else {
      return CyclePhase.LUTEAL;
    }
  }

  // UTILITY METHODS

  /**
   * Get or create current cycle for a date
   */
  private async getOrCreateCurrentCycle(date: string): Promise<string> {
    const cycles = await this.getAllCycles();
    const currentDate = new Date(date);
    
    // Find existing cycle that contains this date
    const existingCycle = cycles.find(cycle => {
      const start = new Date(cycle.startDate);
      const end = cycle.endDate ? new Date(cycle.endDate) : new Date();
      return currentDate >= start && currentDate <= end;
    });
    
    if (existingCycle) {
      return existingCycle.id;
    }
    
    // Create new cycle
    return await this.createCycle({
      startDate: date,
    });
  }

  /**
   * Calculate cycle variation for confidence scoring
   */
  private calculateCycleVariation(cycleLengths: number[]): number {
    if (cycleLengths.length < 2) return 0;
    
    const mean = cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length;
    const variance = cycleLengths.reduce((sum, length) => sum + Math.pow(length - mean, 2), 0) / cycleLengths.length;
    return Math.sqrt(variance);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Validate date format
   */
  private validateDate(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    
    const parsedDate = new Date(date);
    return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
  }

  /**
   * Get cycle statistics
   */
  async getCycleStatistics(): Promise<{
    averageCycleLength: number;
    averagePeriodLength: number;
    totalCycles: number;
    regularityScore: number;
    mostCommonSymptoms: SymptomType[];
  }> {
    const cycles = await this.getAllCycles();
    const periods = await this.getAllPeriods();
    
    const cycleLengths = cycles.filter(c => c.cycleLength).map(c => c.cycleLength!);
    const periodLengths = periods
      .filter(p => p.endDate)
      .map(p => {
        const start = new Date(p.startDate);
        const end = new Date(p.endDate!);
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      });

    const averageCycleLength = cycleLengths.length > 0 
      ? cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length 
      : 28;

    const averagePeriodLength = periodLengths.length > 0
      ? periodLengths.reduce((sum, length) => sum + length, 0) / periodLengths.length
      : 5;

    const cycleVariation = this.calculateCycleVariation(cycleLengths);
    const regularityScore = Math.max(0, 1 - (cycleVariation / averageCycleLength));

    return {
      averageCycleLength: Math.round(averageCycleLength),
      averagePeriodLength: Math.round(averagePeriodLength),
      totalCycles: cycles.length,
      regularityScore: Math.round(regularityScore * 100),
      mostCommonSymptoms: [], // TODO: Implement symptom frequency analysis
    };
  }

  // DATA MANAGEMENT OPERATIONS

  /**
   * Export all user data to a JSON file
   */
  async exportAllData(): Promise<{ totalRecords: number; data: any }> {
    const cycles = await this.getAllCycles();
    const periods = await this.getAllPeriods();
    
    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      appName: 'GentleCycle',
      data: {
        cycles,
        periods,
        // Add more data types as needed
      }
    };

    const totalRecords = cycles.length + periods.length;

    // In a real app, this would write to a file
    console.log('Exporting data:', exportData);
    
    return { totalRecords, data: exportData };
  }

  /**
   * Import data from a backup file
   */
  async importData(): Promise<{ importedRecords: number }> {
    // In a real app, this would read from a file picker
    console.log('Importing data...');
    
    // Mock import - in reality would parse file and merge data
    const importedRecords = 10;
    
    return { importedRecords };
  }

  /**
   * Create a local backup of all data
   */
  async createLocalBackup(): Promise<void> {
    const exportData = await this.exportAllData();
    
    // In a real app, this would save to device storage
    console.log('Creating local backup with', exportData.totalRecords, 'records');
  }

  /**
   * Delete all user data permanently
   */
  async deleteAllData(): Promise<void> {
    // In a real app, this would clear all tables
    console.log('Deleting all data...');
    
    // Mock deletion - in reality would call database.clearAllTables() or similar
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  /**
   * Recalculate all predictions based on current data
   */
  async recalculatePredictions(): Promise<void> {
    // Recalculate and update stored predictions
    const predictions = await this.calculatePredictions();
    
    // In a real app, this would update stored prediction data
    console.log('Recalculated predictions:', predictions);
  }
}

export const cycleDataService = CycleDataService.getInstance();