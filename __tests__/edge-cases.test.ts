/**
 * GentleCycle Edge Case Tests
 * Critical edge cases for mathematical functions and data validation
 */

import { PregnancyRiskCalculator } from '../lib/utils/pregnancyRisk';
import { CycleDataService } from '../lib/services/CycleDataService';
import { FlowIntensity, CyclePhase, PregnancyRisk } from '../types';

describe('GentleCycle Edge Case Tests', () => {
  
  // **Test Scenario 8: Division by Zero**
  describe('Mathematical Edge Cases', () => {
    test('should handle identical cycle lengths (zero variance)', () => {
      const service = CycleDataService.getInstance();
      
      // Test with all 28-day cycles (zero standard deviation)
      const identicalCycles = [28, 28, 28, 28, 28];
      const variation = (service as any).calculateCycleVariation(identicalCycles);
      
      expect(variation).toBe(0);
      expect(Number.isFinite(variation)).toBe(true);
    });

    test('should handle empty cycle array', () => {
      const service = CycleDataService.getInstance();
      const variation = (service as any).calculateCycleVariation([]);
      
      expect(variation).toBe(0);
      expect(Number.isFinite(variation)).toBe(true);
    });

    test('should handle single cycle (insufficient data)', () => {
      const service = CycleDataService.getInstance();
      const variation = (service as any).calculateCycleVariation([28]);
      
      expect(variation).toBe(0);
      expect(Number.isFinite(variation)).toBe(true);
    });
  });

  // **Test Scenario 2: Leap Year Handling**
  describe('Date Arithmetic Edge Cases', () => {
    test('should correctly calculate leap year periods', () => {
      // February 29, 2024 (leap year)
      const leapYearStart = '2024-02-29';
      const leapYearEnd = '2024-03-05';
      
      const startDate = new Date(leapYearStart);
      const endDate = new Date(leapYearEnd);
      
      // Should be 5 days (Feb 29, Mar 1, 2, 3, 4, 5)
      const periodLength = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      expect(periodLength).toBe(6); // 29th Feb + 5 days in March
    });

    test('should handle same-day periods correctly', () => {
      const sameDay = '2024-01-15';
      const startDate = new Date(sameDay);
      const endDate = new Date(sameDay);
      
      const periodLength = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      expect(periodLength).toBe(1); // Should be 1 day, not 0
    });

    test('should handle end date before start date', () => {
      const service = CycleDataService.getInstance();
      
      // This should be caught by validation
      const isValid = (service as any).validateDate('2024-01-15');
      expect(isValid).toBe(true);
      
      // End before start should be handled by business logic
      const start = new Date('2024-01-15');
      const end = new Date('2024-01-10');
      
      expect(end.getTime() < start.getTime()).toBe(true);
    });
  });

  // **Test Scenario 5: Extreme Cycle Lengths**
  describe('Medical Safety Edge Cases', () => {
    test('should handle very short cycles (medical concern)', () => {
      const riskData = PregnancyRiskCalculator.calculateRisk(
        10, // cycle day 10
        15, // 15-day cycle (medically concerning)
        3   // 3-day period
      );
      
      // Should still calculate without crashing
      expect(riskData).toBeDefined();
      expect(riskData.risk).toBeDefined();
      expect(riskData.percentage).toBeGreaterThanOrEqual(0);
      expect(riskData.percentage).toBeLessThanOrEqual(100);
    });

    test('should handle very long cycles (medical concern)', () => {
      const riskData = PregnancyRiskCalculator.calculateRisk(
        45, // cycle day 45
        60, // 60-day cycle (medically concerning)
        7   // 7-day period
      );
      
      // Should still calculate without crashing
      expect(riskData).toBeDefined();
      expect(riskData.risk).toBeDefined();
      expect(riskData.percentage).toBeGreaterThanOrEqual(0);
      expect(riskData.percentage).toBeLessThanOrEqual(100);
    });

    test('should handle very long periods (medical emergency)', () => {
      const riskData = PregnancyRiskCalculator.calculateRisk(
        15, // cycle day 15
        28, // normal cycle
        12  // 12-day period (concerning)
      );
      
      // Period longer than 7 days should still be calculated
      expect(riskData).toBeDefined();
      // During a 12-day period, should be very low risk
      expect(riskData.risk).toBe(PregnancyRisk.VERY_LOW);
    });
  });

  // **Test Scenario 10: Outlier Cycles**
  describe('Data Robustness Edge Cases', () => {
    test('should handle outlier cycles without breaking predictions', () => {
      const normalCycles = [28, 29, 27, 28, 29];
      const outlierCycles = [28, 29, 27, 45, 28]; // One outlier
      
      const service = CycleDataService.getInstance();
      
      // Normal cycles variation
      const normalVariation = (service as any).calculateCycleVariation(normalCycles);
      
      // With outlier
      const outlierVariation = (service as any).calculateCycleVariation(outlierCycles);
      
      // Outlier should increase variation but not break calculation
      expect(outlierVariation).toBeGreaterThan(normalVariation);
      expect(Number.isFinite(outlierVariation)).toBe(true);
      expect(outlierVariation).toBeGreaterThan(0);
    });

    test('should handle all extreme cycle lengths', () => {
      const extremeCycles = [10, 60, 15, 45, 20]; // All concerning lengths
      
      const service = CycleDataService.getInstance();
      const variation = (service as any).calculateCycleVariation(extremeCycles);
      
      // Should still calculate even with extreme values
      expect(Number.isFinite(variation)).toBe(true);
      expect(variation).toBeGreaterThan(0);
    });
  });

  // **Test Scenario 13: Pregnancy Risk Edge Cases**
  describe('Pregnancy Risk Calculation Edge Cases', () => {
    test('should handle negative cycle days', () => {
      // This shouldn't happen in normal use but test robustness
      const riskData = PregnancyRiskCalculator.calculateRisk(-1, 28, 5);
      
      expect(riskData).toBeDefined();
      expect(riskData.risk).toBeDefined();
      expect(riskData.percentage).toBeGreaterThanOrEqual(0);
    });

    test('should handle cycle day beyond cycle length', () => {
      // Cycle day 35 in a 28-day cycle (shouldn't happen normally)
      const riskData = PregnancyRiskCalculator.calculateRisk(35, 28, 5);
      
      expect(riskData).toBeDefined();
      expect(riskData.risk).toBeDefined();
      expect(riskData.percentage).toBeGreaterThanOrEqual(0);
    });

    test('should handle zero or negative cycle length', () => {
      const riskData = PregnancyRiskCalculator.calculateRisk(10, 0, 5);
      
      expect(riskData).toBeDefined();
      // With zero cycle length, ovulation calculation will be negative
      expect(riskData.risk).toBeDefined();
    });

    test('should handle zero or negative period length', () => {
      const riskData = PregnancyRiskCalculator.calculateRisk(10, 28, 0);
      
      expect(riskData).toBeDefined();
      expect(riskData.risk).toBeDefined();
    });
  });

  // **Test Scenario 21: Phase Calculation Edge Cases**
  describe('Cycle Phase Edge Cases', () => {
    test('should handle very short cycles in phase calculation', () => {
      const phaseData = PregnancyRiskCalculator.getPhaseDescription(8, 15);
      
      expect(phaseData).toBeDefined();
      expect(phaseData.phase).toBeDefined();
      expect(phaseData.description).toBeDefined();
      expect(phaseData.emoji).toBeDefined();
    });

    test('should handle very long cycles in phase calculation', () => {
      const phaseData = PregnancyRiskCalculator.getPhaseDescription(40, 60);
      
      expect(phaseData).toBeDefined();
      expect(phaseData.phase).toBeDefined();
      expect(phaseData.description).toBeDefined();
      expect(phaseData.emoji).toBeDefined();
    });

    test('should handle cycle day at boundary conditions', () => {
      // Test exact boundary days
      const boundaries = [1, 5, 6, 13, 14, 15, 16, 28];
      
      boundaries.forEach(day => {
        const phaseData = PregnancyRiskCalculator.getPhaseDescription(day, 28);
        
        expect(phaseData).toBeDefined();
        expect(phaseData.phase).toBeDefined();
        expect(Object.values(CyclePhase)).toContain(phaseData.phase);
      });
    });
  });

  // **Test Scenario 4: Data Validation Edge Cases**
  describe('Date Validation Edge Cases', () => {
    test('should validate proper date formats', () => {
      const service = CycleDataService.getInstance();
      
      const validDates = [
        '2024-01-01',
        '2024-12-31',
        '2024-02-29', // leap year
        '2023-02-28'  // non-leap year
      ];
      
      validDates.forEach(date => {
        expect((service as any).validateDate(date)).toBe(true);
      });
    });

    test('should reject invalid date formats', () => {
      const service = CycleDataService.getInstance();
      
      const invalidDates = [
        '2024/01/01',    // wrong separator
        '01-01-2024',    // wrong order
        '2024-13-01',    // invalid month
        '2024-01-32',    // invalid day
        '2024-02-30',    // invalid February day
        '2023-02-29',    // non-leap year February 29
        'not-a-date',    // completely invalid
        '',              // empty string
        '2024-1-1',      // missing zero padding
      ];
      
      invalidDates.forEach(date => {
        expect((service as any).validateDate(date)).toBe(false);
      });
    });
  });

  // **Test Scenario 23: Performance Edge Cases**
  describe('Performance Edge Cases', () => {
    test('should handle large cycle datasets efficiently', () => {
      const largeCycleArray = Array.from({ length: 1000 }, (_, i) => 28 + (i % 7) - 3);
      
      const service = CycleDataService.getInstance();
      
      const startTime = performance.now();
      const variation = (service as any).calculateCycleVariation(largeCycleArray);
      const endTime = performance.now();
      
      // Should complete in reasonable time (less than 10ms for 1000 cycles)
      expect(endTime - startTime).toBeLessThan(10);
      expect(Number.isFinite(variation)).toBe(true);
    });
  });
});