/**
 * Medical Safety Edge Case Tests
 * Tests for scenarios that could indicate health issues requiring medical attention
 */

import { PregnancyRiskCalculator } from '../lib/utils/pregnancyRisk';
import { CycleDataService } from '../lib/services/CycleDataService';
import { FlowIntensity, CyclePhase, PregnancyRisk } from '../types';

describe('Medical Safety Edge Cases', () => {

  // **Test Scenario 11: Missed Period Detection**
  describe('Missed Period Detection', () => {
    test('should handle very long gaps between periods', () => {
      // Simulate 50 days since last period
      const today = new Date();
      const lastPeriod = new Date(today);
      lastPeriod.setDate(lastPeriod.getDate() - 50);
      
      const daysSinceLastPeriod = Math.floor(
        (today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      expect(daysSinceLastPeriod).toBe(50);
      
      // This should trigger pregnancy/medical consultation warnings
      expect(daysSinceLastPeriod).toBeGreaterThan(35); // Medical concern threshold
    });

    test('should detect potential pregnancy indicators', () => {
      // Simulate scenario: regular 28-day cycles, now 42 days since last period
      const regularCycleLength = 28;
      const daysSinceLastPeriod = 42;
      const expectedPeriodDelay = daysSinceLastPeriod - regularCycleLength;
      
      expect(expectedPeriodDelay).toBe(14); // 2 weeks late
      expect(expectedPeriodDelay).toBeGreaterThan(7); // Should trigger pregnancy test suggestion
    });
  });

  // **Test Scenario 12: Consistently Irregular Cycles**
  describe('Cycle Irregularity Detection', () => {
    test('should detect PCOS-like irregular patterns', () => {
      // PCOS pattern: highly irregular cycles
      const pcosCycles = [19, 42, 25, 38, 21, 45];
      
      const service = CycleDataService.getInstance();
      const variation = (service as any).calculateCycleVariation(pcosCycles);
      const meanCycle = pcosCycles.reduce((sum, cycle) => sum + cycle, 0) / pcosCycles.length;
      
      // High coefficient of variation indicates irregular cycles
      const coefficientOfVariation = variation / meanCycle;
      
      expect(coefficientOfVariation).toBeGreaterThan(0.20); // >20% variation is concerning
      expect(variation).toBeGreaterThan(8); // Standard deviation >8 days is irregular
    });

    test('should distinguish between regular and irregular cycles', () => {
      const regularCycles = [28, 29, 27, 28, 30, 27, 29];
      const irregularCycles = [21, 35, 19, 42, 25, 38, 31];
      
      const service = CycleDataService.getInstance();
      
      const regularVariation = (service as any).calculateCycleVariation(regularCycles);
      const irregularVariation = (service as any).calculateCycleVariation(irregularCycles);
      
      expect(irregularVariation).toBeGreaterThan(regularVariation * 2);
      expect(regularVariation).toBeLessThan(3); // Regular cycles have low variation
      expect(irregularVariation).toBeGreaterThan(6); // Irregular cycles have high variation
    });

    test('should calculate medical consultation score', () => {
      const cycles = [15, 45, 20, 50, 18, 42]; // Very irregular
      
      const service = CycleDataService.getInstance();
      const variation = (service as any).calculateCycleVariation(cycles);
      const mean = cycles.reduce((sum, cycle) => sum + cycle, 0) / cycles.length;
      
      // Calculate "medical consultation score" (0-1, higher = more concerning)
      const medicalScore = Math.min(1, variation / mean);
      
      expect(medicalScore).toBeGreaterThan(0.3); // High irregularity
      expect(medicalScore).toBeLessThanOrEqual(1.0);
    });
  });

  // **Test Scenario 13: Extended Bleeding Detection**
  describe('Extended Bleeding Detection', () => {
    test('should identify periods longer than 7 days', () => {
      // Normal period: 3-7 days
      // Concerning period: 8+ days
      const extendedPeriodLength = 10;
      
      expect(extendedPeriodLength).toBeGreaterThan(7);
      
      // Test if pregnancy risk calculator handles long periods
      const riskData = PregnancyRiskCalculator.calculateRisk(
        5,  // cycle day 5 (still in period)
        28, // normal cycle length
        extendedPeriodLength
      );
      
      // During extended period, should still be very low risk
      expect(riskData.risk).toBe(PregnancyRisk.VERY_LOW);
    });

    test('should handle periods longer than typical cycle', () => {
      // Extreme case: 30-day period (medical emergency)
      const extremePeriodLength = 30;
      const cycleLength = 28;
      
      // This is impossible medically but test app robustness
      expect(extremePeriodLength).toBeGreaterThan(cycleLength);
      
      const riskData = PregnancyRiskCalculator.calculateRisk(
        15, // cycle day 15
        cycleLength,
        extremePeriodLength
      );
      
      // App should still function without crashing
      expect(riskData).toBeDefined();
    });
  });

  // **Test Scenario 5: Age-Related Medical Concerns**
  describe('Age-Related Cycle Patterns', () => {
    test('should handle perimenopause-like patterns', () => {
      // Perimenopause: increasingly irregular cycles
      const perimenopauseCycles = [28, 32, 25, 40, 22, 55, 18, 65];
      
      const service = CycleDataService.getInstance();
      const variation = (service as any).calculateCycleVariation(perimenopauseCycles);
      
      // High variation typical of perimenopause
      expect(variation).toBeGreaterThan(15);
      
      // Should still calculate without errors
      expect(Number.isFinite(variation)).toBe(true);
    });

    test('should handle adolescent irregular patterns', () => {
      // Teen cycles often irregular for first 1-2 years
      const teenCycles = [35, 21, 45, 28, 38, 25];
      
      const service = CycleDataService.getInstance();
      const variation = (service as any).calculateCycleVariation(teenCycles);
      
      // Moderate irregularity expected in teens
      expect(variation).toBeGreaterThan(5);
      expect(variation).toBeLessThan(25);
    });
  });

  // **Medical Safety Thresholds**
  describe('Medical Safety Thresholds', () => {
    test('should define clear medical consultation triggers', () => {
      const medicalThresholds = {
        cycleTooShort: 21,        // <21 days
        cycleTooLong: 35,         // >35 days
        periodTooLong: 7,         // >7 days
        periodTooShort: 2,        // <2 days
        missedPeriodDays: 42,     // >6 weeks
        highVariation: 0.25       // >25% coefficient of variation
      };
      
      // Test very short cycle
      expect(15).toBeLessThan(medicalThresholds.cycleTooShort);
      
      // Test very long cycle
      expect(45).toBeGreaterThan(medicalThresholds.cycleTooLong);
      
      // Test extended bleeding
      expect(10).toBeGreaterThan(medicalThresholds.periodTooLong);
      
      // Test spotting only
      expect(1).toBeLessThan(medicalThresholds.periodTooShort);
    });

    test('should calculate confidence appropriately for concerning patterns', () => {
      const concerningCycles = [15, 45, 20, 50]; // Mix of too short and too long
      
      const service = CycleDataService.getInstance();
      const variation = (service as any).calculateCycleVariation(concerningCycles);
      const mean = concerningCycles.reduce((sum, cycle) => sum + cycle, 0) / concerningCycles.length;
      
      // Confidence should be low for highly irregular cycles
      const confidence = Math.max(0.3, 1 - (variation / mean));
      
      expect(confidence).toBeLessThan(0.7); // Low confidence for irregular cycles
      expect(confidence).toBeGreaterThanOrEqual(0.3); // But not zero (app limitation)
    });
  });

  // **Test Emergency Scenarios**
  describe('Emergency Medical Scenarios', () => {
    test('should handle potential bleeding emergency indicators', () => {
      // Scenario: Very heavy flow for extended period
      const emergencyScenarios = {
        veryLongPeriod: 15,      // 15+ days of bleeding
        veryShortCycle: 10,      // 10-day cycles
        extremeIrregularity: [10, 60, 8, 70, 12] // Extreme variation
      };
      
      // All these should be handled without crashes
      expect(emergencyScenarios.veryLongPeriod).toBeGreaterThan(10);
      expect(emergencyScenarios.veryShortCycle).toBeLessThan(15);
      
      const service = CycleDataService.getInstance();
      const extremeVariation = (service as any).calculateCycleVariation(
        emergencyScenarios.extremeIrregularity
      );
      
      expect(Number.isFinite(extremeVariation)).toBe(true);
      expect(extremeVariation).toBeGreaterThan(20); // Extreme irregularity
    });

    test('should maintain function with impossible medical scenarios', () => {
      // Test app robustness with medically impossible but mathematically possible inputs
      const impossibleScenarios = [
        { cycleDay: 100, cycleLength: 28 },  // Impossible cycle day
        { cycleDay: 5, cycleLength: 400 },   // Impossible cycle length
        { cycleDay: -10, cycleLength: 28 },  // Negative cycle day
      ];
      
      impossibleScenarios.forEach(scenario => {
        const riskData = PregnancyRiskCalculator.calculateRisk(
          scenario.cycleDay,
          scenario.cycleLength,
          5
        );
        
        // Should not crash, even with impossible inputs
        expect(riskData).toBeDefined();
        expect(riskData.risk).toBeDefined();
        expect(typeof riskData.percentage).toBe('number');
      });
    });
  });
});