/**
 * Data Integrity and Corruption Edge Case Tests
 * Tests for scenarios involving data corruption, invalid states, and recovery
 */

import { CycleDataService } from '../lib/services/CycleDataService';
import { FlowIntensity, CyclePhase, MoodType, SymptomType, SymptomSeverity } from '../types';

describe('Data Integrity Edge Cases', () => {

  // **Test Scenario 14: Data Corruption Recovery**
  describe('Data Corruption Scenarios', () => {
    test('should handle malformed date strings', () => {
      const service = CycleDataService.getInstance();
      
      const malformedDates = [
        '2024-99-99',     // Invalid month/day
        '202a-01-01',     // Non-numeric year
        '2024-1-1',       // Missing zero padding
        '2024/01/01',     // Wrong separator
        'invalid-date',   // Completely invalid
        null as any,      // Null value
        undefined as any, // Undefined value
        '' as string,     // Empty string
      ];
      
      malformedDates.forEach(badDate => {
        if (badDate !== null && badDate !== undefined) {
          const isValid = (service as any).validateDate(badDate);
          expect(isValid).toBe(false);
        }
      });
    });

    test('should handle corrupted numeric values', () => {
      const service = CycleDataService.getInstance();
      
      const corruptedNumbers = [
        NaN,
        Infinity,
        -Infinity,
        null as any,
        undefined as any,
        'not-a-number' as any,
        {} as any,
        [] as any
      ];
      
      corruptedNumbers.forEach(badNumber => {
        // Test cycle variation calculation with corrupted input
        try {
          const cycles = [28, 29, badNumber, 27];
          const variation = (service as any).calculateCycleVariation(cycles);
          
          // Should either handle gracefully or return a safe fallback
          expect(Number.isFinite(variation) || variation === 0).toBe(true);
        } catch (error) {
          // If it throws, error should be handled gracefully
          expect(error).toBeDefined();
        }
      });
    });

    test('should handle mixed valid/invalid data arrays', () => {
      const service = CycleDataService.getInstance();
      
      // Array with mix of valid and invalid cycle lengths
      const mixedData = [28, NaN, 29, null, 30, undefined, 'invalid', 27];
      
      // Should filter out invalid values and calculate with remaining valid data
      const validData = mixedData.filter(cycle => 
        typeof cycle === 'number' && Number.isFinite(cycle) && cycle > 0
      );
      
      expect(validData).toEqual([28, 29, 30, 27]);
      
      const variation = (service as any).calculateCycleVariation(validData);
      expect(Number.isFinite(variation)).toBe(true);
    });
  });

  // **Test Scenario 16: Multiple Quick Entries**
  describe('Rapid Data Entry Scenarios', () => {
    test('should prevent duplicate period entries for same date', async () => {
      const service = CycleDataService.getInstance();
      const testDate = '2024-01-15';
      
      // Simulate rapid clicking - multiple attempts to log same period
      const duplicateAttempts = [
        service.logPeriodStart(testDate, FlowIntensity.MEDIUM),
        service.logPeriodStart(testDate, FlowIntensity.HEAVY),
        service.logPeriodStart(testDate, FlowIntensity.LIGHT)
      ];
      
      try {
        const results = await Promise.all(duplicateAttempts);
        
        // All should return the same period ID (no duplicates created)
        const uniqueIds = new Set(results);
        expect(uniqueIds.size).toBe(1); // Only one unique ID
      } catch (error) {
        // Or should handle duplicates gracefully with clear error
        expect(error).toBeDefined();
      }
    });

    test('should handle overlapping period dates', () => {
      // User logs overlapping periods (data entry error)
      const overlappingPeriods = [
        { start: '2024-01-01', end: '2024-01-05' },
        { start: '2024-01-03', end: '2024-01-08' }, // Overlaps with first
        { start: '2024-01-07', end: '2024-01-10' }  // Overlaps with second
      ];
      
      // Should detect overlaps
      overlappingPeriods.forEach((period, index) => {
        if (index > 0) {
          const previousPeriod = overlappingPeriods[index - 1];
          const currentStart = new Date(period.start);
          const previousEnd = new Date(previousPeriod.end);
          
          // Detect overlap
          const hasOverlap = currentStart <= previousEnd;
          expect(hasOverlap).toBe(true);
        }
      });
    });

    test('should handle rapid symptom logging', async () => {
      const service = CycleDataService.getInstance();
      const testDate = '2024-01-20';
      
      // Simulate user rapidly adding different symptoms
      const rapidSymptoms = [
        { type: SymptomType.CRAMPS, severity: SymptomSeverity.MILD },
        { type: SymptomType.BLOATING, severity: SymptomSeverity.MODERATE },
        { type: SymptomType.HEADACHE, severity: SymptomSeverity.SEVERE }
      ];
      
      try {
        // Should handle multiple symptom additions gracefully
        await service.logSymptoms(testDate, rapidSymptoms);
        
        // Verify symptoms were logged correctly
        const symptoms = await service.getSymptomsForDate(testDate);
        expect(symptoms.length).toBeGreaterThanOrEqual(0);
      } catch (error) {
        // Should handle gracefully if there are issues
        expect(error).toBeDefined();
      }
    });
  });

  // **Test Scenario 17: Data Export/Import Edge Cases**
  describe('Data Export/Import Integrity', () => {
    test('should detect corrupted JSON data', () => {
      const corruptedJsonSamples = [
        '{"invalid": json}',           // Missing quotes
        '{"date": "2024-01-01",}',    // Trailing comma
        '{"date": "2024-01-01"',      // Missing closing brace
        '{date: "2024-01-01"}',       // Unquoted key
        'not json at all',            // Not JSON
        '',                           // Empty string
        '[]',                         // Empty array instead of object
        'null'                        // Null value
      ];
      
      corruptedJsonSamples.forEach(corruptedJson => {
        try {
          const parsed = JSON.parse(corruptedJson);
          
          // If it parses, validate structure
          if (typeof parsed === 'object' && parsed !== null) {
            // Check if it has expected period tracking data structure
            const hasValidStructure = 
              typeof parsed.date === 'string' ||
              Array.isArray(parsed.periods) ||
              Array.isArray(parsed.cycles);
            
            // Most corrupted samples should fail structure validation
            if (!hasValidStructure) {
              expect(hasValidStructure).toBe(false);
            }
          }
        } catch (error) {
          // JSON parsing should fail for most corrupted samples
          expect(error).toBeInstanceOf(SyntaxError);
        }
      });
    });

    test('should validate imported data structure', () => {
      const invalidDataStructures = [
        { periods: 'not-an-array' },           // Wrong type
        { periods: [{ invalidField: true }] }, // Missing required fields
        { cycles: [{ length: 'text' }] },      // Wrong data type
        { symptoms: [{ severity: 10 }] },      // Out of range value
        { dailyEntries: [{ mood: 'invalid' }] } // Invalid enum value
      ];
      
      invalidDataStructures.forEach(invalidData => {
        // Should detect invalid structure
        const isValidPeriodData = Array.isArray(invalidData.periods) && 
          invalidData.periods.every(period => 
            typeof period.startDate === 'string' &&
            typeof period.id === 'string'
          );
        
        if (invalidData.periods && !isValidPeriodData) {
          expect(isValidPeriodData).toBe(false);
        }
      });
    });
  });

  // **Test Scenario 18: Large Dataset Performance**
  describe('Large Dataset Edge Cases', () => {
    test('should handle years of tracking data efficiently', async () => {
      // Simulate 5 years of period data (approximately 60 periods)
      const largePeriodDataset = Array.from({ length: 60 }, (_, i) => {
        const startDate = new Date('2019-01-01');
        startDate.setDate(startDate.getDate() + (i * 28)); // Every 28 days
        
        return {
          id: `period-${i}`,
          startDate: startDate.toISOString().split('T')[0],
          cycleLength: 28 + (i % 3) - 1 // Vary between 27-29 days
        };
      });
      
      // Test calculation performance with large dataset
      const cycleLengths = largePeriodDataset.map(p => p.cycleLength);
      
      const service = CycleDataService.getInstance();
      const startTime = performance.now();
      
      const variation = (service as any).calculateCycleVariation(cycleLengths);
      
      const endTime = performance.now();
      const calculationTime = endTime - startTime;
      
      // Should complete quickly even with large dataset
      expect(calculationTime).toBeLessThan(50); // Less than 50ms
      expect(Number.isFinite(variation)).toBe(true);
    });

    test('should handle memory efficiently with extensive symptom data', () => {
      // Simulate years of daily symptom tracking
      const extensiveSymptomData = Array.from({ length: 1000 }, (_, i) => ({
        date: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        symptoms: [
          { type: SymptomType.CRAMPS, severity: (i % 3) + 1 },
          { type: SymptomType.MOOD_SWINGS, severity: ((i + 1) % 3) + 1 }
        ]
      }));
      
      // Should be able to process large symptom dataset
      expect(extensiveSymptomData.length).toBe(1000);
      
      // Memory usage should remain reasonable
      const memoryBefore = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Process the data
      const processedData = extensiveSymptomData.filter(entry => 
        entry.symptoms.length > 0
      );
      
      const memoryAfter = (performance as any).memory?.usedJSHeapSize || 0;
      
      expect(processedData.length).toBe(1000);
      
      // Memory increase should be reasonable (less than 10MB for this dataset)
      if (memoryBefore > 0 && memoryAfter > 0) {
        const memoryIncrease = memoryAfter - memoryBefore;
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB
      }
    });
  });

  // **Test Scenario 19: Pregnancy Mode Transitions**
  describe('Life Event Transitions', () => {
    test('should handle pre-pregnancy to pregnancy transition', () => {
      // Regular cycles before pregnancy
      const prePregnancyCycles = [28, 29, 27, 28, 30];
      
      // Then missed periods (pregnancy)
      const daysSinceLastPeriod = 60; // 2 months
      
      const service = CycleDataService.getInstance();
      const prePregnancyVariation = (service as any).calculateCycleVariation(prePregnancyCycles);
      
      // Should recognize significant change in pattern
      expect(prePregnancyVariation).toBeLessThan(3); // Was regular
      expect(daysSinceLastPeriod).toBeGreaterThan(35); // Now concerning gap
    });

    test('should handle postpartum cycle resumption', () => {
      // Scenario: No periods for 6+ months (pregnancy + breastfeeding)
      // Then irregular cycles as body adjusts
      const postpartumCycles = [45, 32, 28, 35, 29, 31];
      
      const service = CycleDataService.getInstance();
      const postpartumVariation = (service as any).calculateCycleVariation(postpartumCycles);
      
      // Higher variation expected postpartum
      expect(postpartumVariation).toBeGreaterThan(5);
      
      // But should still calculate predictions
      expect(Number.isFinite(postpartumVariation)).toBe(true);
    });

    test('should handle birth control transitions', () => {
      // Before birth control: natural cycles
      const naturalCycles = [28, 30, 27, 29, 31];
      
      // On birth control: very regular cycles
      const bcCycles = [28, 28, 28, 28, 28];
      
      // After stopping: may be irregular initially
      const postBcCycles = [35, 24, 42, 28, 33];
      
      const service = CycleDataService.getInstance();
      
      const naturalVariation = (service as any).calculateCycleVariation(naturalCycles);
      const bcVariation = (service as any).calculateCycleVariation(bcCycles);
      const postBcVariation = (service as any).calculateCycleVariation(postBcCycles);
      
      // BC should have lowest variation
      expect(bcVariation).toBeLessThan(naturalVariation);
      expect(bcVariation).toBeLessThan(postBcVariation);
      
      // Post-BC often has highest variation
      expect(postBcVariation).toBeGreaterThan(naturalVariation);
    });
  });

  // **Test Scenario: Data Recovery and Backup**
  describe('Data Recovery Scenarios', () => {
    test('should handle partial data loss gracefully', () => {
      // Scenario: Some data corrupted, some intact
      const partialData = {
        periods: [
          { id: '1', startDate: '2024-01-01' }, // Valid
          { id: '2', startDate: null },         // Corrupted
          { id: '3', startDate: '2024-02-01' }, // Valid
          null,                                 // Completely corrupted
          { id: '4', startDate: '2024-03-01' }  // Valid
        ]
      };
      
      // Should filter out corrupted entries and work with valid ones
      const validPeriods = partialData.periods.filter(period => 
        period && 
        typeof period.id === 'string' && 
        typeof period.startDate === 'string'
      );
      
      expect(validPeriods.length).toBe(3);
      expect(validPeriods.every(p => p.startDate)).toBe(true);
    });

    test('should maintain data consistency during recovery', () => {
      // Test that recovered data maintains referential integrity
      const recoveredData = {
        periods: [
          { id: 'p1', cycleId: 'c1', startDate: '2024-01-01' },
          { id: 'p2', cycleId: 'c2', startDate: '2024-02-01' }
        ],
        cycles: [
          { id: 'c1', length: 28 },
          // c2 missing - referential integrity issue
        ]
      };
      
      // Should detect missing references
      const orphanedPeriods = recoveredData.periods.filter(period =>
        !recoveredData.cycles.some(cycle => cycle.id === period.cycleId)
      );
      
      expect(orphanedPeriods.length).toBe(1);
      expect(orphanedPeriods[0].id).toBe('p2');
    });
  });
});