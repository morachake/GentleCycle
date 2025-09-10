import { PregnancyRisk, PregnancyRiskData, CyclePhase } from '@/types';

export class PregnancyRiskCalculator {
  
  /**
   * Calculate pregnancy risk based on cycle day and user data
   */
  static calculateRisk(
    cycleDay: number,
    averageCycleLength: number = 28,
    periodLength: number = 5
  ): PregnancyRiskData {
    const ovulationDay = Math.round(averageCycleLength - 14);
    const fertilityStart = ovulationDay - 5;
    const fertilityEnd = ovulationDay + 1;

    // Very low risk during menstruation (including very long periods)
    // For medical safety: if period is unusually long (>7 days), be extra cautious
    if (cycleDay <= periodLength || (periodLength > 7 && cycleDay <= periodLength + 3)) {
      return {
        risk: PregnancyRisk.VERY_LOW,
        percentage: 2,
        message: "Very low chance of pregnancy during your period",
        tips: [
          "This is generally the safest time",
          "However, sperm can survive up to 5 days",
          "Use protection if you have shorter cycles"
        ]
      };
    }

    // Low risk early follicular phase
    if (cycleDay > periodLength && cycleDay < fertilityStart) {
      return {
        risk: PregnancyRisk.LOW,
        percentage: 5,
        message: "Low pregnancy risk during early follicular phase",
        tips: [
          "Risk is low but not zero",
          "Your body is preparing for ovulation",
          "Track your symptoms for better accuracy"
        ]
      };
    }

    // High risk during fertile window
    if (cycleDay >= fertilityStart && cycleDay <= fertilityEnd) {
      let risk = PregnancyRisk.HIGH;
      let percentage = 25;

      // Very high risk on ovulation day
      if (cycleDay >= ovulationDay - 1 && cycleDay <= ovulationDay + 1) {
        risk = PregnancyRisk.VERY_HIGH;
        percentage = 30;
      }

      return {
        risk,
        percentage,
        message: risk === PregnancyRisk.VERY_HIGH 
          ? "Peak fertility - highest chance of pregnancy" 
          : "High fertility window - increased pregnancy chance",
        tips: [
          "This is your most fertile time",
          "Ovulation typically occurs around day " + ovulationDay,
          "Use protection if not trying to conceive",
          "Perfect time if you're trying to get pregnant"
        ]
      };
    }

    // Medium risk in late luteal phase
    if (cycleDay > fertilityEnd && cycleDay < averageCycleLength - 3) {
      return {
        risk: PregnancyRisk.MEDIUM,
        percentage: 10,
        message: "Medium risk during luteal phase",
        tips: [
          "Post-ovulation phase",
          "Risk decreases but remains present",
          "Your body is preparing for next cycle"
        ]
      };
    }

    // Low risk pre-menstrual
    return {
      risk: PregnancyRisk.LOW,
      percentage: 5,
      message: "Low risk approaching next period",
      tips: [
        "Pre-menstrual phase",
        "Body preparing for next cycle",
        "Track symptoms for cycle insights"
      ]
    };
  }

  /**
   * Get risk color for UI
   */
  static getRiskColor(risk: PregnancyRisk): string {
    switch (risk) {
      case PregnancyRisk.VERY_LOW:
        return '#4CAF50'; // Green
      case PregnancyRisk.LOW:
        return '#8BC34A'; // Light Green
      case PregnancyRisk.MEDIUM:
        return '#FF9800'; // Orange
      case PregnancyRisk.HIGH:
        return '#FF5722'; // Deep Orange
      case PregnancyRisk.VERY_HIGH:
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Grey
    }
  }

  /**
   * Get risk emoji for visual representation
   */
  static getRiskEmoji(risk: PregnancyRisk): string {
    switch (risk) {
      case PregnancyRisk.VERY_LOW:
        return '🟢';
      case PregnancyRisk.LOW:
        return '🔵';
      case PregnancyRisk.MEDIUM:
        return '🟡';
      case PregnancyRisk.HIGH:
        return '🟠';
      case PregnancyRisk.VERY_HIGH:
        return '🔴';
      default:
        return '⚪';
    }
  }

  /**
   * Get baby emoji for high risk days
   */
  static getBabyEmoji(risk: PregnancyRisk): string | null {
    if (risk === PregnancyRisk.HIGH || risk === PregnancyRisk.VERY_HIGH) {
      return '👶';
    }
    return null;
  }

  /**
   * Get fertility phase description
   */
  static getPhaseDescription(cycleDay: number, averageCycleLength: number = 28): {
    phase: CyclePhase;
    description: string;
    emoji: string;
  } {
    const ovulationDay = Math.round(averageCycleLength - 14);
    const periodLength = 5; // Default period length
    
    if (cycleDay <= periodLength) {
      return {
        phase: CyclePhase.MENSTRUAL,
        description: "Your period is here. Time for self-care and rest.",
        emoji: "🩸"
      };
    }
    
    if (cycleDay > periodLength && cycleDay < ovulationDay - 2) {
      return {
        phase: CyclePhase.FOLLICULAR,
        description: "Recovery phase. Your energy is building up.",
        emoji: "🌱"
      };
    }
    
    if (cycleDay >= ovulationDay - 2 && cycleDay <= ovulationDay + 2) {
      return {
        phase: CyclePhase.OVULATION,
        description: "Peak fertility time. Your body is ready for conception.",
        emoji: "🥚"
      };
    }
    
    return {
      phase: CyclePhase.LUTEAL,
      description: "Post-ovulation phase. Watch for PMS symptoms.",
      emoji: "🌙"
    };
  }
}