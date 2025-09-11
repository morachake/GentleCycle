import { PregnancyRiskIndicator } from '@/components/pregnancy/PregnancyRiskIndicator';
import { Card } from '@/components/ui';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PregnancyRiskCalculator } from '@/lib/utils/pregnancyRisk';
import { CyclePhase, FlowIntensity } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Calendar, CalendarProps } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DataEntryScreen } from '@/components/screens/DataEntryScreen';
import Modal from 'react-native-modal';
import { cycleDataService } from '@/lib/services/CycleDataService';
import { DayDetailModal } from '@/components/modals/DayDetailModal';

interface MarkedDate {
  selected?: boolean;
  marked?: boolean;
  dotColor?: string;
  selectedColor?: string;
  customStyles?: {
    container?: any;
    text?: any;
  };
  dots?: Array<{
    key: string;
    color: string;
    selectedDotColor?: string;
  }>;
}

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDataEntryScreen, setShowDataEntryScreen] = useState(false);
  const [showDayDetailModal, setShowDayDetailModal] = useState(false);
  const [userPeriodDates, setUserPeriodDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cycleStats, setCycleStats] = useState({
    averageCycleLength: 28,
    averagePeriodLength: 5,
  });

  // Load real user data on component mount
  useEffect(() => {
    loadUserCycleData();
  }, []);

  const loadUserCycleData = async () => {
    try {
      setIsLoading(true);
      
      // Get user's period data from service
      const periods = await cycleDataService.getAllPeriods();
      const stats = await cycleDataService.getCycleStatistics();
      
      // Extract period start dates
      const periodStartDates = periods.map(period => period.startDate).sort();
      
      setUserPeriodDates(periodStartDates);
      setCycleStats({
        averageCycleLength: stats.averageCycleLength,
        averagePeriodLength: stats.averagePeriodLength,
      });
      
    } catch (error) {
      console.error('Error loading cycle data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get today's date for current context
  const today = new Date().toISOString().split('T')[0];

  // Calculate cycle data based on user's logged period start dates
  const calculateCycleData = () => {
    const cycleData: Record<string, { 
      phase: CyclePhase; 
      flow: FlowIntensity; 
      isOvulation?: boolean;
      pregnancyRisk?: 'high' | 'medium' | 'low' | 'very_high' | 'very_low';
      pregnancyRiskData?: any;
      cycleDay?: number;
      isPredicted?: boolean;
      isStart?: boolean;
      isEnd?: boolean;
    }> = {};

    const avgCycleLength = cycleStats.averageCycleLength || 28;
    const avgPeriodLength = cycleStats.averagePeriodLength || 5;

    userPeriodDates.forEach((periodStart, index) => {
      const startDate = new Date(periodStart);
      
      // Add actual period days with proper pregnancy risk calculation
      for (let i = 0; i < avgPeriodLength; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];
        const cycleDay = i + 1;
        
        // Calculate pregnancy risk using the actual calculator
        const riskData = PregnancyRiskCalculator.calculateRisk(cycleDay, avgCycleLength, avgPeriodLength);
        
        cycleData[dateString] = {
          phase: CyclePhase.MENSTRUAL,
          flow: i === 0 ? FlowIntensity.HEAVY : i === 1 ? FlowIntensity.HEAVY : i === 2 ? FlowIntensity.MEDIUM : i === 3 ? FlowIntensity.LIGHT : FlowIntensity.SPOTTING,
          pregnancyRisk: riskData.risk.toLowerCase() as 'high' | 'medium' | 'low' | 'very_high' | 'very_low',
          pregnancyRiskData: riskData,
          cycleDay,
          isStart: i === 0,
          isEnd: i === avgPeriodLength - 1,
        };
      }

      // Add follicular phase (days 6-13 of cycle)
      for (let i = avgPeriodLength; i < 13; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];
        const cycleDay = i + 1;
        
        // Calculate pregnancy risk using the actual calculator
        const riskData = PregnancyRiskCalculator.calculateRisk(cycleDay, avgCycleLength, avgPeriodLength);
        
        cycleData[dateString] = {
          phase: CyclePhase.FOLLICULAR,
          flow: FlowIntensity.NONE,
          pregnancyRisk: riskData.risk.toLowerCase() as 'high' | 'medium' | 'low' | 'very_high' | 'very_low',
          pregnancyRiskData: riskData,
          cycleDay,
        };
      }

      // Calculate ovulation day (14 days before expected next period)
      const ovulationDay = avgCycleLength - 14;
      const fertileWindowStart = Math.max(ovulationDay - 5, avgPeriodLength);
      const fertileWindowEnd = Math.min(ovulationDay + 2, avgCycleLength - 1);
      
      // Add fertile window with proper pregnancy risk calculation
      for (let i = fertileWindowStart; i <= fertileWindowEnd; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];
        const cycleDay = i + 1;
        
        // Calculate pregnancy risk using the actual calculator
        const riskData = PregnancyRiskCalculator.calculateRisk(cycleDay, avgCycleLength, avgPeriodLength);
        
        // Peak ovulation day
        const isOvulationPeak = i === ovulationDay;
        
        cycleData[dateString] = {
          phase: isOvulationPeak ? CyclePhase.OVULATION : CyclePhase.FOLLICULAR,
          flow: FlowIntensity.NONE,
          isOvulation: isOvulationPeak,
          pregnancyRisk: riskData.risk.toLowerCase() as 'high' | 'medium' | 'low' | 'very_high' | 'very_low',
          pregnancyRiskData: riskData,
          cycleDay,
        };
      }

      // Add luteal phase (after ovulation until next period)
      const lutealStart = fertileWindowEnd + 1;
      for (let i = lutealStart; i < avgCycleLength; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];
        const cycleDay = i + 1;
        
        // Calculate pregnancy risk using the actual calculator
        const riskData = PregnancyRiskCalculator.calculateRisk(cycleDay, avgCycleLength, avgPeriodLength);
        
        cycleData[dateString] = {
          phase: CyclePhase.LUTEAL,
          flow: FlowIntensity.NONE,
          pregnancyRisk: riskData.risk.toLowerCase() as 'high' | 'medium' | 'low' | 'very_high' | 'very_low',
          pregnancyRiskData: riskData,
          cycleDay,
        };
      }

      // Predict multiple cycles ahead (6 months into the future)
      const today = new Date();
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
      
      for (let cycleCount = 1; cycleCount <= 6; cycleCount++) {
        const nextPeriodStart = new Date(startDate);
        nextPeriodStart.setDate(nextPeriodStart.getDate() + (avgCycleLength * cycleCount));
        
        // Only add predictions for future dates and within 6 months
        if (nextPeriodStart > today && nextPeriodStart <= sixMonthsFromNow) {
          // Predict period days
          for (let i = 0; i < avgPeriodLength; i++) {
            const currentDate = new Date(nextPeriodStart);
            currentDate.setDate(currentDate.getDate() + i);
            const dateString = currentDate.toISOString().split('T')[0];
            const cycleDay = i + 1;
            
            // Calculate pregnancy risk using the actual calculator
            const riskData = PregnancyRiskCalculator.calculateRisk(cycleDay, avgCycleLength, avgPeriodLength);
            
            cycleData[dateString] = {
              phase: CyclePhase.MENSTRUAL,
              flow: i === 0 ? FlowIntensity.MEDIUM : i === 1 ? FlowIntensity.HEAVY : i === 2 ? FlowIntensity.MEDIUM : i === 3 ? FlowIntensity.LIGHT : FlowIntensity.LIGHT,
              pregnancyRisk: riskData.risk.toLowerCase() as 'high' | 'medium' | 'low' | 'very_high' | 'very_low',
              pregnancyRiskData: riskData,
              cycleDay,
              isPredicted: true,
              isStart: i === 0,
              isEnd: i === avgPeriodLength - 1,
            };
          }

          // Predict ovulation for this cycle
          const ovulationDayInCycle = avgCycleLength - 14;
          const fertileStart = Math.max(ovulationDayInCycle - 5, avgPeriodLength);
          const fertileEnd = Math.min(ovulationDayInCycle + 2, avgCycleLength - 1);
          
          // Add fertile window
          for (let i = fertileStart; i <= fertileEnd; i++) {
            const currentDate = new Date(nextPeriodStart);
            currentDate.setDate(currentDate.getDate() + i);
            const dateString = currentDate.toISOString().split('T')[0];
            const cycleDay = i + 1;
            
            const isOvulationPeak = i === ovulationDayInCycle;
            
            // Don't overwrite period days
            if (!cycleData[dateString]) {
              // Calculate pregnancy risk using the actual calculator
              const riskData = PregnancyRiskCalculator.calculateRisk(cycleDay, avgCycleLength, avgPeriodLength);
              
              cycleData[dateString] = {
                phase: isOvulationPeak ? CyclePhase.OVULATION : CyclePhase.FOLLICULAR,
                flow: FlowIntensity.NONE,
                isOvulation: isOvulationPeak,
                pregnancyRisk: riskData.risk.toLowerCase() as 'high' | 'medium' | 'low' | 'very_high' | 'very_low',
                pregnancyRiskData: riskData,
                cycleDay,
                isPredicted: true,
              };
            }
          }
        }
      }
    });

    return cycleData;
  };

  const cycleData = calculateCycleData();

  // Handle date press - show day detail modal
  const handleDatePress = (day: any) => {
    const pressedDate = day.dateString;
    setSelectedDate(pressedDate);
    setShowDayDetailModal(true);
  };

  const getMarkedDates = () => {
    const marked: { [key: string]: MarkedDate } = {};
    
    // Enhanced cycle data with better visual indicators and risk labels
    Object.entries(cycleData).forEach(([date, data]) => {
      let dotColor = 'transparent'; // Remove dots, use borders instead
      let customStyles: any = {};
      let isSelected = date === selectedDate;
      let isToday = date === today;
      
      // Base styling - updated to accommodate risk labels
      const baseContainerStyle = {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        position: 'relative' as const,
      };
      
      const baseTextStyle = {
        fontSize: 14,
        fontWeight: '500' as const,
        textAlign: 'center' as const,
        color: Colors.textDark,
        lineHeight: 16,
      };

      // Determine border styling based on cycle data
      let borderColor = 'transparent';
      let borderWidth = 0;
      let backgroundColor = 'transparent';
      let textColor = Colors.textDark;
      let borderStyle: 'solid' | 'dashed' = 'solid';

      // Priority 1: Period days (most important)
      if (data.phase === CyclePhase.MENSTRUAL) {
        if (data.isPredicted) {
          // Future expected period - dashed red border
          borderColor = Colors.calendarRed;
          borderWidth = data.isStart || data.isEnd ? 3 : 2; // Thicker border for start/end
          borderStyle = 'dashed';
          backgroundColor = 'transparent'; // Keep background transparent
          textColor = Colors.textDark; // Use dark text for visibility
        } else {
          // Actual logged period - solid red border with very light fill
          borderColor = Colors.calendarRed;
          borderWidth = data.isStart || data.isEnd ? 4 : 3; // Extra thick for start/end
          backgroundColor = 'transparent'; // Keep background transparent
          textColor = Colors.textDark; // Use dark text for visibility
        }
      }
      // Priority 2: Ovulation days
      else if (data.isOvulation) {
        if (data.isPredicted) {
          // Predicted ovulation - dashed orange border
          borderColor = Colors.ovulationOrange;
          borderWidth = 2;
          borderStyle = 'dashed';
          backgroundColor = 'transparent';
          textColor = Colors.textDark;
        } else {
          // Actual ovulation - solid orange border
          borderColor = Colors.ovulationOrange;
          borderWidth = 3;
          backgroundColor = 'transparent';
          textColor = Colors.textDark;
        }
      }
      // Priority 3: Pregnancy risk levels (very high, high, medium, low, very low)
      else if (data.pregnancyRisk === 'very_high') {
        borderColor = '#D32F2F'; // Dark red for very high
        borderWidth = 3;
        backgroundColor = '#D32F2F15';
        textColor = '#D32F2F';
      }
      else if (data.pregnancyRisk === 'high') {
        borderColor = Colors.error;
        borderWidth = 2;
        backgroundColor = Colors.error + '10';
        textColor = Colors.error;
      }
      // Priority 4: Medium pregnancy risk
      else if (data.pregnancyRisk === 'medium') {
        borderColor = Colors.warning;
        borderWidth = 2;
        backgroundColor = Colors.warning + '10';
        textColor = Colors.warning;
      }
      // Priority 5: Low and very low risk
      else if (data.pregnancyRisk === 'low') {
        borderColor = Colors.success;
        borderWidth = 1;
        backgroundColor = 'transparent';
        textColor = Colors.textDark;
      }
      else if (data.pregnancyRisk === 'very_low') {
        borderColor = Colors.success;
        borderWidth = 1;
        backgroundColor = 'transparent';
        textColor = Colors.textDark;
      }
      // Priority 5: Other cycle phases
      else {
        switch (data.phase) {
          case CyclePhase.FOLLICULAR:
            borderColor = Colors.fertilityGreen;
            borderWidth = 1;
            backgroundColor = 'transparent';
            textColor = Colors.textDark;
            break;
          case CyclePhase.LUTEAL:
            borderColor = Colors.pmsLavender;
            borderWidth = 1;
            backgroundColor = 'transparent';
            textColor = Colors.textDark;
            break;
        }
      }

      // Get risk label for display
      const getRiskLabel = (risk?: string) => {
        switch (risk) {
          case 'very_high': return 'VH';
          case 'high': return 'H';
          case 'medium': return 'M';
          case 'low': return 'L';
          case 'very_low': return 'VL';
          default: return '';
        }
      };

      const riskLabel = getRiskLabel(data.pregnancyRisk);

      // Apply styling if we have markers
      if (borderWidth > 0) {
        customStyles = {
          container: {
            ...baseContainerStyle,
            borderColor,
            borderWidth,
            borderStyle,
            backgroundColor,
            flexDirection: 'column' as const,
          },
          text: {
            ...baseTextStyle,
            color: textColor,
            fontWeight: borderWidth >= 3 ? 'bold' : borderWidth >= 2 ? '600' : '500',
            fontSize: riskLabel ? 12 : 14, // Smaller font if we have risk label
            marginBottom: riskLabel ? -2 : 0,
          }
        };
      }

      // Handle today's date (add subtle glow effect)
      if (isToday && customStyles.container) {
        customStyles.container = {
          ...customStyles.container,
          shadowColor: customStyles.container.borderColor || Colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 3,
        };
      } else if (isToday && !customStyles.container) {
        // Today but no other markers
        customStyles = {
          container: {
            ...baseContainerStyle,
            borderColor: Colors.primary,
            borderWidth: 2,
            backgroundColor: Colors.primary + '08',
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 3,
          },
          text: {
            ...baseTextStyle,
            color: Colors.primary,
            fontWeight: '600',
          }
        };
      }

      // Handle selected date (highest priority - scale and stronger border)
      if (isSelected && customStyles.container) {
        customStyles.container = {
          ...customStyles.container,
          borderWidth: Math.max(customStyles.container.borderWidth || 0, 3),
          transform: [{ scale: 1.15 }],
          shadowColor: customStyles.container.borderColor || Colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 6,
        };
        customStyles.text = {
          ...customStyles.text,
          fontWeight: 'bold',
        };
      } else if (isSelected && !customStyles.container) {
        // Selected but no other markers
        customStyles = {
          container: {
            ...baseContainerStyle,
            borderColor: Colors.primary,
            borderWidth: 3,
            backgroundColor: Colors.primary + '12',
            transform: [{ scale: 1.15 }],
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 6,
          },
          text: {
            ...baseTextStyle,
            color: Colors.primary,
            fontWeight: 'bold',
          }
        };
      }
      
      marked[date] = {
        marked: borderWidth > 0,
        dotColor, // Keep as transparent
        selectedColor: isSelected ? (borderColor || Colors.primary) : undefined,
        selected: isSelected,
        customStyles: Object.keys(customStyles).length > 0 ? customStyles : undefined,
        // Add a dots array for multi-dot display if needed
        dots: riskLabel ? [{
          key: 'risk',
          color: borderColor || Colors.primary,
          selectedDotColor: borderColor || Colors.primary,
        }] : undefined,
      };
    });
    
    // Ensure selected date is marked even if no cycle data
    if (!marked[selectedDate]) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: Colors.primary,
      };
    }
    
    return marked;
  };

  const getSelectedDateInfo = () => {
    const data = cycleData[selectedDate];
    
    // Use actual cycle day from data if available, otherwise calculate properly
    let cycleDay = data?.cycleDay || 1;
    
    // If no cycle day in data, calculate based on period dates
    if (!data?.cycleDay && userPeriodDates.length > 0) {
      const selectedDateObj = new Date(selectedDate);
      
      // Find the most recent period start before or on the selected date
      const periodsBeforeSelected = userPeriodDates
        .filter(periodDate => new Date(periodDate) <= selectedDateObj)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      
      if (periodsBeforeSelected.length > 0) {
        const lastPeriodDate = new Date(periodsBeforeSelected[0]);
        const daysDiff = Math.floor((selectedDateObj.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24));
        cycleDay = Math.max(1, daysDiff + 1);
      }
    }
    
    if (!data) {
      return {
        phase: 'No data',
        message: 'No cycle data for this date',
        flow: FlowIntensity.NONE,
        color: Colors.textMedium,
        cycleDay,
      };
    }
    
    let message = '';
    let color = Colors.primary;
    
    switch (data.phase) {
      case CyclePhase.MENSTRUAL:
        message = 'Period day';
        color = Colors.calendarRed;
        break;
      case CyclePhase.FOLLICULAR:
        message = 'Follicular phase';
        color = Colors.fertilityGreen;
        break;
      case CyclePhase.OVULATION:
        message = 'Ovulation window';
        color = Colors.ovulationOrange;
        break;
      case CyclePhase.LUTEAL:
        message = 'Luteal phase';
        color = Colors.pmsLavender;
        break;
    }
    
    return {
      phase: data.phase,
      message,
      flow: data.flow,
      color,
      cycleDay,
    };
  };

  const selectedDateInfo = getSelectedDateInfo();

  const calendarTheme: CalendarProps['theme'] = {
    backgroundColor: colors.card,
    calendarBackground: colors.card,
    textSectionTitleColor: colors.text,
    selectedDayBackgroundColor: 'transparent', // We handle selection in customStyles
    selectedDayTextColor: Colors.primary,
    todayTextColor: Colors.primary,
    dayTextColor: colors.text,
    textDisabledColor: Colors.textLight,
    dotColor: 'transparent', // We use custom styling instead
    selectedDotColor: 'transparent',
    arrowColor: Colors.primary,
    monthTextColor: colors.text,
    indicatorColor: Colors.primary,
    textDayFontFamily: 'System',
    textMonthFontFamily: 'System',
    textDayHeaderFontFamily: 'System',
    textDayFontWeight: '500',
    textMonthFontWeight: '700',
    textDayHeaderFontWeight: '600',
    textDayFontSize: 16,
    textMonthFontSize: 20,
    textDayHeaderFontSize: 12,
  };

  // Show loading state while data loads
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading your cycle calendar...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Period Calendar
          </Text>
          <Text style={[styles.subtitle, { color: Colors.textMedium }]}>
            Track your cycle and symptoms
          </Text>
        </View>

        <Card style={styles.calendarCard}>
          <Calendar
            current={selectedDate}
            onDayPress={handleDatePress}
            markedDates={getMarkedDates()}
            theme={calendarTheme}
            firstDay={0}
            showWeekNumbers={false}
            hideExtraDays={false}
            enableSwipeMonths={true}
            style={styles.calendar}
          />
        </Card>

        {/* Selected Date Info */}
        <Animatable.View animation="fadeInUp" duration={600}>
          <Card style={styles.dateInfoCard}>
            <Text style={[styles.dateInfoTitle, { color: colors.text }]}>
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            
            <View style={[styles.phaseIndicator, { borderColor: selectedDateInfo.color }]}>
              <View style={[styles.phaseDot, { backgroundColor: selectedDateInfo.color }]} />
              <Text style={[styles.phaseText, { color: selectedDateInfo.color }]}>
                {selectedDateInfo.message}
              </Text>
            </View>

            {/* Flow Information */}
            {selectedDateInfo.flow !== FlowIntensity.NONE && (
              <View style={styles.flowInfo}>
                <Text style={[styles.flowLabel, { color: Colors.textMedium }]}>
                  Flow:
                </Text>
                <Text style={[styles.flowValue, { color: colors.text }]}>
                  {selectedDateInfo.flow.charAt(0).toUpperCase() + selectedDateInfo.flow.slice(1)}
                </Text>
              </View>
            )}

            {/* Pregnancy Risk Indicator */}
            {cycleData[selectedDate]?.pregnancyRisk && (
              <View style={styles.riskInfo}>
                <Text style={[styles.flowLabel, { color: Colors.textMedium }]}>
                  Pregnancy Risk:
                </Text>
                <View style={[
                  styles.riskBadge, 
                  { 
                    backgroundColor: cycleData[selectedDate]?.pregnancyRisk === 'very_high' ? '#D32F2F20' :
                                   cycleData[selectedDate]?.pregnancyRisk === 'high' ? Colors.error + '20' :
                                   cycleData[selectedDate]?.pregnancyRisk === 'medium' ? Colors.warning + '20' : 
                                   Colors.success + '20',
                    borderColor: cycleData[selectedDate]?.pregnancyRisk === 'very_high' ? '#D32F2F' :
                               cycleData[selectedDate]?.pregnancyRisk === 'high' ? Colors.error :
                               cycleData[selectedDate]?.pregnancyRisk === 'medium' ? Colors.warning : 
                               Colors.success
                  }
                ]}>
                  <Text style={[
                    styles.riskText,
                    { 
                      color: cycleData[selectedDate]?.pregnancyRisk === 'very_high' ? '#D32F2F' :
                             cycleData[selectedDate]?.pregnancyRisk === 'high' ? Colors.error :
                             cycleData[selectedDate]?.pregnancyRisk === 'medium' ? Colors.warning : 
                             Colors.success
                    }
                  ]}>
                    {cycleData[selectedDate]?.pregnancyRisk?.replace('_', ' ').toUpperCase()} 
                    {cycleData[selectedDate]?.pregnancyRisk === 'very_high' ? ' 🔴' :
                     cycleData[selectedDate]?.pregnancyRisk === 'high' ? ' 🚨' : 
                     cycleData[selectedDate]?.pregnancyRisk === 'medium' ? ' ⚠️' : ' ✅'}
                  </Text>
                </View>
              </View>
            )}

            {/* Predicted Date Notice */}
            {cycleData[selectedDate]?.isPredicted && (
              <View style={styles.predictedInfo}>
                <Text style={[styles.predictedLabel, { color: Colors.primary }]}>
                  📊 This is a predicted date - you can adjust if your period comes early or late
                </Text>
              </View>
            )}

            {/* Ovulation Day Notice */}
            {cycleData[selectedDate]?.isOvulation && (
              <View style={styles.ovulationInfo}>
                <Text style={[styles.ovulationLabel, { color: Colors.ovulationOrange }]}>
                  🥚 Peak fertility day - highest chance of conception
                </Text>
              </View>
            )}

            {/* Period Start Notice */}
            {cycleData[selectedDate]?.isStart && !cycleData[selectedDate]?.isPredicted && (
              <View style={styles.periodStartInfo}>
                <Text style={[styles.periodStartLabel, { color: Colors.calendarRed }]}>
                  🩸 Period start date - logged by you
                </Text>
              </View>
            )}

            {/* Add Period Start Button for unmarked dates */}
            {!cycleData[selectedDate] && (
              <View style={styles.addPeriodInfo}>
                <Text style={[styles.addPeriodLabel, { color: Colors.textMedium }]}>
                  💭 Tap &ldquo;Edit This Date&rdquo; to log your period start
                </Text>
              </View>
            )}
            
            {/* Edit Button */}
            <Animatable.View animation="fadeInUp" delay={400}>
              <TouchableOpacity
                style={styles.editDateButton}
                onPress={() => setShowDataEntryScreen(true)}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryDeep]}
                  style={styles.editButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.editButtonText}>📝 Edit This Date</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>
          </Card>
        </Animatable.View>

        {/* Pregnancy Risk for Selected Date */}
        {selectedDateInfo.cycleDay > 0 && selectedDateInfo.cycleDay <= 35 && (
          <PregnancyRiskIndicator 
            riskData={PregnancyRiskCalculator.calculateRisk(selectedDateInfo.cycleDay)}
            showAnimation={true}
            compact={false}
          />
        )}

        {/* Enhanced Visual Legend with Border-Based System */}
        <Card style={styles.legendCard}>
          <Text style={[styles.legendTitle, { color: colors.text }]}>
            📋 Calendar Legend
          </Text>
          <Text style={[styles.legendSubtitle, { color: Colors.textMedium }]}>
            Date numbers are always visible. Borders and background colors show cycle information.
          </Text>
          
          <View style={styles.legendSection}>
            <Text style={[styles.legendSectionTitle, { color: colors.text }]}>🩸 Period Tracking</Text>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, { 
                  backgroundColor: Colors.calendarRed + '15',
                  borderWidth: 3,
                  borderColor: Colors.calendarRed,
                }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Logged Period</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, { 
                  backgroundColor: Colors.calendarRed + '08',
                  borderWidth: 2,
                  borderColor: Colors.calendarRed,
                  borderStyle: 'dashed',
                }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Expected Period</Text>
              </View>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, { 
                  backgroundColor: Colors.calendarRed + '25',
                  borderWidth: 4,
                  borderColor: Colors.calendarRed,
                }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Period Start/End</Text>
              </View>
            </View>
          </View>

          <View style={styles.legendSection}>
            <Text style={[styles.legendSectionTitle, { color: colors.text }]}>🥚 Fertility & Ovulation</Text>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, { 
                  backgroundColor: Colors.ovulationOrange + '15',
                  borderWidth: 3,
                  borderColor: Colors.ovulationOrange,
                }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Logged Ovulation</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, { 
                  backgroundColor: Colors.ovulationOrange + '08',
                  borderWidth: 2,
                  borderColor: Colors.ovulationOrange,
                  borderStyle: 'dashed',
                }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Predicted Ovulation</Text>
              </View>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, { 
                  backgroundColor: Colors.fertilityGreen + '05',
                  borderWidth: 1,
                  borderColor: Colors.fertilityGreen,
                }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Fertile Window</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, { 
                  backgroundColor: Colors.pmsLavender + '05',
                  borderWidth: 1,
                  borderColor: Colors.pmsLavender,
                }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>PMS Phase</Text>
              </View>
            </View>
          </View>

          <View style={styles.legendSection}>
            <Text style={[styles.legendSectionTitle, { color: colors.text }]}>⚠️ Pregnancy Risk Levels</Text>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, { 
                  backgroundColor: '#D32F2F15',
                  borderWidth: 3,
                  borderColor: '#D32F2F',
                }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Very High (VH) 🔴</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, { 
                  backgroundColor: Colors.error + '10',
                  borderWidth: 2,
                  borderColor: Colors.error,
                }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>High (H) 🚨</Text>
              </View>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, { 
                  backgroundColor: Colors.warning + '10',
                  borderWidth: 2,
                  borderColor: Colors.warning,
                }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Medium (M) ⚠️</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, { 
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: Colors.success,
                }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Low/Safe (L/VL) ✅</Text>
              </View>
            </View>
          </View>

          <View style={styles.legendSection}>
            <Text style={[styles.legendSectionTitle, { color: colors.text }]}>📍 Special Markers</Text>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, { 
                  backgroundColor: Colors.primary + '08',
                  borderWidth: 2,
                  borderColor: Colors.primary,
                  shadowColor: Colors.primary,
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.3,
                  shadowRadius: 2,
                  elevation: 2,
                }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Today</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, { 
                  backgroundColor: Colors.primary + '12',
                  borderWidth: 3,
                  borderColor: Colors.primary,
                  transform: [{ scale: 0.85 }], // Scaled for legend
                }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Selected Date</Text>
              </View>
            </View>
          </View>

          <View style={styles.noteSection}>
            <Text style={[styles.noteText, { color: Colors.textMedium }]}>
              💡 Tips: Thicker borders indicate period start/end dates. Dashed borders show predictions.
              {'\n'}🏷️ Risk labels: VH=Very High, H=High, M=Medium, L=Low, VL=Very Low
            </Text>
          </View>
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Data Entry Modal */}
      <Modal
        isVisible={showDataEntryScreen}
        style={styles.dataEntryModal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0}
        onSwipeComplete={() => setShowDataEntryScreen(false)}
        swipeDirection="down"
      >
        <DataEntryScreen
          selectedDate={selectedDate}
          onClose={() => setShowDataEntryScreen(false)}
          onDataUpdated={() => {
            // Refresh calendar data here
            console.log('Data updated for date:', selectedDate);
          }}
        />
      </Modal>

      {/* Day Detail Modal */}
      <DayDetailModal
        isVisible={showDayDetailModal}
        onClose={() => setShowDayDetailModal(false)}
        selectedDate={selectedDate}
        cycleData={cycleData[selectedDate]}
        onDateUpdated={async () => {
          await loadUserCycleData();
          setShowDayDetailModal(false);
        }}
        onEditEntry={() => {
          setShowDayDetailModal(false);
          setShowDataEntryScreen(true);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
  },
  title: {
    fontSize: Theme.typography.sizes.xxl,
    fontWeight: Theme.typography.weights.bold,
    marginBottom: Theme.spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Theme.typography.sizes.md,
    marginBottom: Theme.spacing.lg,
    lineHeight: Theme.typography.lineHeights.normal * Theme.typography.sizes.md,
    opacity: 0.8,
  },
  calendarCard: {
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    padding: Theme.spacing.sm,
    overflow: 'hidden',
    ...Theme.shadows.sm,
  },
  calendar: {
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: 0,
  },
  dateInfoCard: {
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    ...Theme.shadows.sm,
  },
  dateInfoTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
    marginBottom: Theme.spacing.md,
    lineHeight: Theme.typography.lineHeights.normal * Theme.typography.sizes.lg,
    letterSpacing: -0.3,
  },
  phaseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.sm,
  },
  phaseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Theme.spacing.sm,
  },
  phaseText: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.medium,
    lineHeight: Theme.typography.lineHeights.normal * Theme.typography.sizes.md,
  },
  flowInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flowLabel: {
    fontSize: Theme.typography.sizes.md,
  },
  flowValue: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.medium,
  },
  legendCard: {
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    ...Theme.shadows.sm,
  },
  legendTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
    marginBottom: Theme.spacing.sm,
    letterSpacing: -0.3,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    paddingVertical: Theme.spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Theme.spacing.sm,
  },
  editDateButton: {
    marginTop: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    ...Theme.shadows.sm,
  },
  editButtonGradient: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.semibold,
    color: Colors.cardWhite,
  },
  dataEntryModal: {
    margin: 0,
  },
  riskInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  riskBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
  },
  riskText: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.semibold,
  },
  predictedInfo: {
    backgroundColor: Colors.primary + '10',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    marginBottom: Theme.spacing.sm,
  },
  predictedLabel: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
    lineHeight: 18,
  },
  ovulationInfo: {
    backgroundColor: Colors.ovulationOrange + '10',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.ovulationOrange,
    marginBottom: Theme.spacing.sm,
  },
  ovulationLabel: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
    lineHeight: 18,
  },
  legendText: {
    fontSize: Theme.typography.sizes.sm,
    color: Colors.textDark,
    fontWeight: Theme.typography.weights.medium,
  },
  legendSubtitle: {
    fontSize: Theme.typography.sizes.sm,
    lineHeight: 18,
    marginBottom: Theme.spacing.lg,
    fontStyle: 'italic',
  },
  legendSection: {
    marginBottom: Theme.spacing.lg,
  },
  legendSectionTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.semibold,
    marginBottom: Theme.spacing.sm,
    color: Colors.textDark,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.sm,
  },
  legendIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: Theme.spacing.sm,
  },
  noteSection: {
    marginTop: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  noteText: {
    fontSize: Theme.typography.sizes.xs,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 16,
  },
  periodStartInfo: {
    backgroundColor: Colors.calendarRed + '10',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.calendarRed,
    marginBottom: Theme.spacing.sm,
  },
  periodStartLabel: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
    lineHeight: 18,
  },
  addPeriodInfo: {
    backgroundColor: Colors.textLight + '10',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.textLight,
    marginBottom: Theme.spacing.sm,
  },
  addPeriodLabel: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xxl,
  },
  loadingText: {
    fontSize: Theme.typography.sizes.md,
    marginTop: Theme.spacing.md,
    textAlign: 'center',
  },
});