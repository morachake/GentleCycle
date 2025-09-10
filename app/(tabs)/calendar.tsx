import { PregnancyRiskIndicator } from '@/components/pregnancy/PregnancyRiskIndicator';
import { Card } from '@/components/ui';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PregnancyRiskCalculator } from '@/lib/utils/pregnancyRisk';
import { CyclePhase, FlowIntensity } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Calendar, CalendarProps } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DataEntryScreen } from '@/components/screens/DataEntryScreen';
import Modal from 'react-native-modal';

interface MarkedDate {
  selected?: boolean;
  marked?: boolean;
  dotColor?: string;
  selectedColor?: string;
  customStyles?: {
    container?: any;
    text?: any;
  };
}

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDataEntryScreen, setShowDataEntryScreen] = useState(false);
  
  // Get today's date for current context
  const today = new Date().toISOString().split('T')[0];

  // Mock data for demonstration - Enhanced with comprehensive cycle data
  const mockCycleData: Record<string, { 
    phase: CyclePhase; 
    flow: FlowIntensity; 
    isOvulation?: boolean;
    pregnancyRisk?: 'high' | 'medium' | 'low';
    isPredicted?: boolean;
  }> = {
    // Previous period days (September)
    '2024-09-05': { phase: CyclePhase.MENSTRUAL, flow: FlowIntensity.HEAVY, pregnancyRisk: 'low' },
    '2024-09-06': { phase: CyclePhase.MENSTRUAL, flow: FlowIntensity.MEDIUM, pregnancyRisk: 'low' },
    '2024-09-07': { phase: CyclePhase.MENSTRUAL, flow: FlowIntensity.LIGHT, pregnancyRisk: 'low' },
    '2024-09-08': { phase: CyclePhase.MENSTRUAL, flow: FlowIntensity.SPOTTING, pregnancyRisk: 'low' },
    
    // Follicular phase progression
    '2024-09-09': { phase: CyclePhase.FOLLICULAR, flow: FlowIntensity.NONE, pregnancyRisk: 'low' },
    '2024-09-10': { phase: CyclePhase.FOLLICULAR, flow: FlowIntensity.NONE, pregnancyRisk: 'low' },
    '2024-09-11': { phase: CyclePhase.FOLLICULAR, flow: FlowIntensity.NONE, pregnancyRisk: 'low' },
    '2024-09-12': { phase: CyclePhase.FOLLICULAR, flow: FlowIntensity.NONE, pregnancyRisk: 'medium' },
    '2024-09-13': { phase: CyclePhase.FOLLICULAR, flow: FlowIntensity.NONE, pregnancyRisk: 'medium' },
    
    // Ovulation window (peak fertility - 3 day window)
    '2024-09-14': { phase: CyclePhase.OVULATION, flow: FlowIntensity.NONE, isOvulation: true, pregnancyRisk: 'high' },
    '2024-09-15': { phase: CyclePhase.OVULATION, flow: FlowIntensity.NONE, isOvulation: true, pregnancyRisk: 'high' },
    '2024-09-16': { phase: CyclePhase.OVULATION, flow: FlowIntensity.NONE, isOvulation: true, pregnancyRisk: 'high' },
    
    // Post-ovulation high risk days
    '2024-09-17': { phase: CyclePhase.LUTEAL, flow: FlowIntensity.NONE, pregnancyRisk: 'high' },
    '2024-09-18': { phase: CyclePhase.LUTEAL, flow: FlowIntensity.NONE, pregnancyRisk: 'medium' },
    '2024-09-19': { phase: CyclePhase.LUTEAL, flow: FlowIntensity.NONE, pregnancyRisk: 'medium' },
    
    // Luteal phase continuation
    '2024-09-20': { phase: CyclePhase.LUTEAL, flow: FlowIntensity.NONE, pregnancyRisk: 'low' },
    '2024-09-21': { phase: CyclePhase.LUTEAL, flow: FlowIntensity.NONE, pregnancyRisk: 'low' },
    '2024-09-25': { phase: CyclePhase.LUTEAL, flow: FlowIntensity.NONE, pregnancyRisk: 'low' },
    '2024-09-30': { phase: CyclePhase.LUTEAL, flow: FlowIntensity.NONE, pregnancyRisk: 'low' },
    
    // Predicted next period (October) - Show upcoming predictions
    '2024-10-03': { phase: CyclePhase.MENSTRUAL, flow: FlowIntensity.MEDIUM, pregnancyRisk: 'low', isPredicted: true },
    '2024-10-04': { phase: CyclePhase.MENSTRUAL, flow: FlowIntensity.MEDIUM, pregnancyRisk: 'low', isPredicted: true },
    '2024-10-05': { phase: CyclePhase.MENSTRUAL, flow: FlowIntensity.LIGHT, pregnancyRisk: 'low', isPredicted: true },
    '2024-10-06': { phase: CyclePhase.MENSTRUAL, flow: FlowIntensity.LIGHT, pregnancyRisk: 'low', isPredicted: true },
    
    // Future fertility window predictions
    '2024-10-17': { phase: CyclePhase.OVULATION, flow: FlowIntensity.NONE, isOvulation: true, pregnancyRisk: 'high', isPredicted: true },
    '2024-10-18': { phase: CyclePhase.OVULATION, flow: FlowIntensity.NONE, isOvulation: true, pregnancyRisk: 'high', isPredicted: true },
    '2024-10-19': { phase: CyclePhase.OVULATION, flow: FlowIntensity.NONE, isOvulation: true, pregnancyRisk: 'high', isPredicted: true },
  };

  const getMarkedDates = () => {
    const marked: { [key: string]: MarkedDate } = {};
    
    // Mark cycle data with enhanced visual indicators
    Object.entries(mockCycleData).forEach(([date, data]) => {
      let dotColor = Colors.primary;
      let selectedColor = Colors.primary;
      let customStyles: any = {};
      let backgroundColor = 'transparent';
      let textColor = Colors.textDark;
      let borderColor = 'transparent';
      let borderWidth = 0;
      let isSelected = date === selectedDate;
      
      // Base styling for all marked dates
      const baseStyles = {
        container: {
          borderRadius: 16,
          width: 32,
          height: 32,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        },
        text: {
          fontSize: 16,
          fontWeight: '600' as const,
          textAlign: 'center' as const,
        }
      };
      
      // Determine styling based on cycle phase and special conditions
      if (data.isOvulation) {
        // Ovulation days - highest priority styling
        backgroundColor = Colors.ovulationOrange + '25';
        borderColor = Colors.ovulationOrange;
        borderWidth = 2;
        textColor = Colors.ovulationOrange;
        dotColor = Colors.ovulationOrange;
        
        // Add ovulation indicator
        customStyles = {
          container: {
            ...baseStyles.container,
            backgroundColor,
            borderColor,
            borderWidth,
            position: 'relative',
          },
          text: {
            ...baseStyles.text,
            color: textColor,
            fontWeight: 'bold',
          }
        };
        
      } else if (data.phase === CyclePhase.MENSTRUAL) {
        // Period days
        if (data.isPredicted) {
          // Predicted period - dashed border
          backgroundColor = Colors.calendarRed + '15';
          borderColor = Colors.calendarRed;
          borderWidth = 2;
          textColor = Colors.calendarRed;
          customStyles = {
            container: {
              ...baseStyles.container,
              backgroundColor,
              borderColor,
              borderWidth,
              borderStyle: 'dashed',
              opacity: 0.8,
            },
            text: {
              ...baseStyles.text,
              color: textColor,
              fontWeight: 'bold',
            }
          };
        } else {
          // Actual period
          backgroundColor = Colors.calendarRed + '20';
          borderColor = Colors.calendarRed;
          borderWidth = 2;
          textColor = Colors.cardWhite;
          customStyles = {
            container: {
              ...baseStyles.container,
              backgroundColor: Colors.calendarRed,
              borderColor: Colors.calendarRed,
              borderWidth,
            },
            text: {
              ...baseStyles.text,
              color: textColor,
              fontWeight: 'bold',
            }
          };
        }
        dotColor = Colors.calendarRed;
        
      } else if (data.pregnancyRisk === 'high') {
        // High pregnancy risk days
        backgroundColor = Colors.error + '20';
        borderColor = Colors.error;
        borderWidth = 2;
        textColor = Colors.error;
        customStyles = {
          container: {
            ...baseStyles.container,
            backgroundColor,
            borderColor,
            borderWidth,
            // Add subtle pulse effect indicator
          },
          text: {
            ...baseStyles.text,
            color: textColor,
            fontWeight: 'bold',
          }
        };
        dotColor = Colors.error;
        
      } else if (data.pregnancyRisk === 'medium') {
        // Medium pregnancy risk days
        backgroundColor = Colors.warning + '15';
        borderColor = Colors.warning;
        borderWidth = 1.5;
        textColor = Colors.warning;
        customStyles = {
          container: {
            ...baseStyles.container,
            backgroundColor,
            borderColor,
            borderWidth,
          },
          text: {
            ...baseStyles.text,
            color: textColor,
            fontWeight: '600',
          }
        };
        dotColor = Colors.warning;
        
      } else {
        // Other cycle phases with subtle indicators
        switch (data.phase) {
          case CyclePhase.FOLLICULAR:
            backgroundColor = Colors.fertilityGreen + '10';
            borderColor = Colors.fertilityGreen;
            borderWidth = 1;
            textColor = Colors.fertilityGreen;
            dotColor = Colors.fertilityGreen;
            break;
          case CyclePhase.LUTEAL:
            backgroundColor = Colors.pmsLavender + '10';
            borderColor = Colors.pmsLavender;
            borderWidth = 1;
            textColor = Colors.pmsLavender;
            dotColor = Colors.pmsLavender;
            break;
          default:
            backgroundColor = 'transparent';
            textColor = Colors.textMedium;
            dotColor = Colors.primary;
        }
        
        if (backgroundColor !== 'transparent') {
          customStyles = {
            container: {
              ...baseStyles.container,
              backgroundColor,
              borderColor,
              borderWidth,
            },
            text: {
              ...baseStyles.text,
              color: textColor,
              fontWeight: '500',
            }
          };
        }
      }
      
      // Handle today's date special styling
      const isToday = date === today;
      if (isToday && !isSelected) {
        if (customStyles.container) {
          customStyles.container = {
            ...customStyles.container,
            borderWidth: Math.max(borderWidth, 2),
            borderColor: borderColor || Colors.primary,
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 3,
          };
        } else {
          customStyles = {
            container: {
              ...baseStyles.container,
              backgroundColor: Colors.primary + '15',
              borderColor: Colors.primary,
              borderWidth: 2,
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3,
            },
            text: {
              ...baseStyles.text,
              color: Colors.primary,
              fontWeight: 'bold',
            }
          };
        }
      }
      
      // Handle selected date override (highest priority)
      if (isSelected) {
        if (customStyles.container) {
          customStyles.container = {
            ...customStyles.container,
            borderWidth: Math.max(borderWidth, 3),
            borderColor: borderColor || Colors.primary,
            transform: [{ scale: 1.1 }],
            shadowColor: borderColor || Colors.primary,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.4,
            shadowRadius: 6,
            elevation: 5,
          };
        } else {
          customStyles = {
            container: {
              ...baseStyles.container,
              backgroundColor: Colors.primary + '20',
              borderColor: Colors.primary,
              borderWidth: 3,
              transform: [{ scale: 1.1 }],
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.4,
              shadowRadius: 6,
              elevation: 5,
            },
            text: {
              ...baseStyles.text,
              color: Colors.primary,
              fontWeight: 'bold',
            }
          };
        }
      }
      
      marked[date] = {
        marked: true,
        dotColor,
        selectedColor: isSelected ? (borderColor || Colors.primary) : undefined,
        selected: isSelected,
        customStyles,
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
    const data = mockCycleData[selectedDate];
    
    // Calculate cycle day for selected date
    const today = new Date();
    const selectedDateObj = new Date(selectedDate);
    const diffTime = selectedDateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const cycleDay = 14 + diffDays; // Mock current cycle day as 14
    
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
    // Enhanced spacing and padding consistency
    'stylesheet.calendar.header': {
      dayHeader: {
        marginTop: Theme.spacing.sm,
        marginBottom: Theme.spacing.sm,
        width: 32,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textMedium,
      }
    },
    'stylesheet.day.basic': {
      base: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: Theme.spacing.xs,
      },
      text: {
        marginTop: Platform.OS === 'android' ? 2 : 0,
        fontSize: 16,
        fontFamily: 'System',
        fontWeight: '500',
        color: colors.text,
      }
    }
  };

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
            onDayPress={(day) => setSelectedDate(day.dateString)}
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
            {mockCycleData[selectedDate]?.pregnancyRisk && (
              <View style={styles.riskInfo}>
                <Text style={[styles.flowLabel, { color: Colors.textMedium }]}>
                  Pregnancy Risk:
                </Text>
                <View style={[
                  styles.riskBadge, 
                  { 
                    backgroundColor: mockCycleData[selectedDate]?.pregnancyRisk === 'high' ? Colors.error + '20' :
                                   mockCycleData[selectedDate]?.pregnancyRisk === 'medium' ? Colors.warning + '20' : 
                                   Colors.success + '20',
                    borderColor: mockCycleData[selectedDate]?.pregnancyRisk === 'high' ? Colors.error :
                               mockCycleData[selectedDate]?.pregnancyRisk === 'medium' ? Colors.warning : 
                               Colors.success
                  }
                ]}>
                  <Text style={[
                    styles.riskText,
                    { 
                      color: mockCycleData[selectedDate]?.pregnancyRisk === 'high' ? Colors.error :
                             mockCycleData[selectedDate]?.pregnancyRisk === 'medium' ? Colors.warning : 
                             Colors.success
                    }
                  ]}>
                    {mockCycleData[selectedDate]?.pregnancyRisk?.toUpperCase()} 
                    {mockCycleData[selectedDate]?.pregnancyRisk === 'high' ? ' 🚨' : 
                     mockCycleData[selectedDate]?.pregnancyRisk === 'medium' ? ' ⚠️' : ' ✅'}
                  </Text>
                </View>
              </View>
            )}

            {/* Predicted Date Notice */}
            {mockCycleData[selectedDate]?.isPredicted && (
              <View style={styles.predictedInfo}>
                <Text style={[styles.predictedLabel, { color: Colors.primary }]}>
                  📊 This is a predicted date - you can adjust if your period comes early or late
                </Text>
              </View>
            )}

            {/* Ovulation Day Notice */}
            {mockCycleData[selectedDate]?.isOvulation && (
              <View style={styles.ovulationInfo}>
                <Text style={[styles.ovulationLabel, { color: Colors.ovulationOrange }]}>
                  🥚 Peak fertility day - highest chance of conception
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

        {/* Enhanced Visual Legend */}
        <Card style={styles.legendCard}>
          <Text style={[styles.legendTitle, { color: colors.text }]}>
            🎨 Visual Guide
          </Text>
          <Text style={[styles.legendSubtitle, { color: Colors.textMedium }]}>
            Each date is visually marked with colors and borders to show your cycle information
          </Text>
          
          <View style={styles.legendSection}>
            <Text style={[styles.legendSectionTitle, { color: colors.text }]}>Period Days</Text>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, { 
                  backgroundColor: Colors.calendarRed,
                  borderWidth: 2,
                  borderColor: Colors.calendarRed,
                }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Active Period</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, { 
                  backgroundColor: Colors.calendarRed + '15',
                  borderWidth: 2,
                  borderColor: Colors.calendarRed,
                  borderStyle: 'dashed',
                }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Predicted Period</Text>
              </View>
            </View>
          </View>

          <View style={styles.legendSection}>
            <Text style={[styles.legendSectionTitle, { color: colors.text }]}>Fertility & Ovulation</Text>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, { 
                  backgroundColor: Colors.ovulationOrange + '25',
                  borderWidth: 2,
                  borderColor: Colors.ovulationOrange,
                }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Ovulation Day</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, { 
                  backgroundColor: Colors.fertilityGreen + '10',
                  borderWidth: 1,
                  borderColor: Colors.fertilityGreen,
                }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Fertile Window</Text>
              </View>
            </View>
          </View>

          <View style={styles.legendSection}>
            <Text style={[styles.legendSectionTitle, { color: colors.text }]}>Pregnancy Risk Levels</Text>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, { 
                  backgroundColor: Colors.error + '20',
                  borderWidth: 2,
                  borderColor: Colors.error,
                }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>High Risk 🚨</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, { 
                  backgroundColor: Colors.warning + '15',
                  borderWidth: 1.5,
                  borderColor: Colors.warning,
                }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Medium Risk ⚠️</Text>
              </View>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, { 
                  backgroundColor: Colors.success + '10',
                  borderWidth: 1,
                  borderColor: Colors.success,
                }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Low Risk ✅</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, { 
                  backgroundColor: Colors.pmsLavender + '10',
                  borderWidth: 1,
                  borderColor: Colors.pmsLavender,
                }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>PMS Phase</Text>
              </View>
            </View>
          </View>

          <View style={styles.legendSection}>
            <Text style={[styles.legendSectionTitle, { color: colors.text }]}>Special Indicators</Text>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, { 
                  backgroundColor: Colors.primary + '15',
                  borderWidth: 2,
                  borderColor: Colors.primary,
                  shadowColor: Colors.primary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Today</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, { 
                  backgroundColor: Colors.primary + '20',
                  borderWidth: 3,
                  borderColor: Colors.primary,
                  transform: [{ scale: 0.9 }], // Scaled down for legend
                }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Selected</Text>
              </View>
            </View>
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
  bottomPadding: {
    height: 100,
  },
});