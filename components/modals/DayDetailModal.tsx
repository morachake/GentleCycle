import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Modal from 'react-native-modal';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Card, Button, Badge } from '@/components/ui';
import { PregnancyRiskCalculator } from '@/lib/utils/pregnancyRisk';
import { CyclePhase, FlowIntensity, MoodType, SymptomType, SymptomSeverity } from '@/types';
import { cycleDataService } from '@/lib/services/CycleDataService';

interface DayDetailModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedDate: string;
  cycleData?: {
    phase: CyclePhase;
    flow: FlowIntensity;
    isOvulation?: boolean;
    pregnancyRisk?: 'high' | 'medium' | 'low';
    isPredicted?: boolean;
    isStart?: boolean;
    isEnd?: boolean;
  };
  onDateUpdated?: () => void;
  onEditEntry?: () => void;
}

export function DayDetailModal({ 
  isVisible, 
  onClose, 
  selectedDate, 
  cycleData, 
  onDateUpdated,
  onEditEntry
}: DayDetailModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [dailyEntry, setDailyEntry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVisible && selectedDate) {
      loadDailyEntry();
    }
  }, [isVisible, selectedDate]);

  const loadDailyEntry = async () => {
    try {
      setIsLoading(true);
      const entry = await cycleDataService.getDailyEntry(selectedDate);
      setDailyEntry(entry);
    } catch (error) {
      console.error('Error loading daily entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPregnancyRiskDisplay = () => {
    if (!cycleData) return null;

    const riskLevel = cycleData.pregnancyRisk || 'low';
    const riskColors = {
      high: Colors.calendarRed,
      medium: Colors.warning,
      low: Colors.success
    };

    const riskEmojis = {
      high: '🔴',
      medium: '🟡', 
      low: '🟢'
    };

    const riskDescriptions = {
      high: 'High fertility window - peak chance of conception',
      medium: 'Moderate fertility - some chance of conception',
      low: 'Low fertility window - minimal chance of conception'
    };

    return (
      <Card style={[styles.riskCard, { borderColor: riskColors[riskLevel] }]}>
        <View style={styles.riskHeader}>
          <Text style={styles.riskEmoji}>{riskEmojis[riskLevel]}</Text>
          <Text style={[styles.riskTitle, { color: riskColors[riskLevel] }]}>
            {riskLevel.toUpperCase()} PREGNANCY RISK
          </Text>
        </View>
        <Text style={[styles.riskDescription, { color: colors.text }]}>
          {riskDescriptions[riskLevel]}
        </Text>
      </Card>
    );
  };

  const getCyclePhaseDisplay = () => {
    if (!cycleData) return null;

    const phaseColors = {
      [CyclePhase.MENSTRUAL]: Colors.calendarRed,
      [CyclePhase.FOLLICULAR]: Colors.success,
      [CyclePhase.OVULATION]: Colors.ovulationOrange,
      [CyclePhase.LUTEAL]: Colors.pmsLavender
    };

    const phaseEmojis = {
      [CyclePhase.MENSTRUAL]: '🩸',
      [CyclePhase.FOLLICULAR]: '🌱',
      [CyclePhase.OVULATION]: '🥚',
      [CyclePhase.LUTEAL]: '🌙'
    };

    const phaseDescriptions = {
      [CyclePhase.MENSTRUAL]: 'Menstrual phase - your period is here',
      [CyclePhase.FOLLICULAR]: 'Follicular phase - recovery and energy building',
      [CyclePhase.OVULATION]: 'Ovulation phase - peak fertility time',
      [CyclePhase.LUTEAL]: 'Luteal phase - post-ovulation'
    };

    return (
      <View style={styles.phaseContainer}>
        <Text style={styles.phaseEmoji}>{phaseEmojis[cycleData.phase]}</Text>
        <View style={styles.phaseTextContainer}>
          <Badge 
            text={cycleData.phase.toUpperCase()}
            style={{ backgroundColor: phaseColors[cycleData.phase] + '20' }}
            textStyle={{ color: phaseColors[cycleData.phase] }}
          />
          <Text style={[styles.phaseDescription, { color: colors.text }]}>
            {phaseDescriptions[cycleData.phase]}
          </Text>
          {cycleData.isPredicted && (
            <Text style={[styles.predictedText, { color: Colors.textMedium }]}>
              (Predicted)
            </Text>
          )}
        </View>
      </View>
    );
  };

  const handleLogPeriod = async () => {
    try {
      await cycleDataService.logPeriodStart(selectedDate, FlowIntensity.MEDIUM);
      Alert.alert('Period Logged!', 'Your cycle has been updated.');
      onDateUpdated?.();
      onClose();
    } catch (error) {
      console.error('Error logging period:', error);
      Alert.alert('Error', 'Failed to log period. Please try again.');
    }
  };

  const handleEditEntry = () => {
    onClose(); // Close the day detail modal
    onEditEntry?.(); // Trigger the edit entry functionality in parent
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={styles.modal}
      backdropOpacity={0.5}
    >
      <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
        <View style={styles.dragHandle} />
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.dateTitle, { color: colors.text }]}>
              {formatDate(selectedDate)}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: Colors.textMedium }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Cycle Phase Info */}
          {cycleData && getCyclePhaseDisplay()}

          {/* Pregnancy Risk */}
          {cycleData && getPregnancyRiskDisplay()}

          {/* Daily Entry Info */}
          <Card style={styles.entryCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Today&apos;s Entry
            </Text>
            
            {dailyEntry ? (
              <View style={styles.entryInfo}>
                <View style={styles.entryRow}>
                  <Text style={[styles.entryLabel, { color: Colors.textMedium }]}>Mood:</Text>
                  <Text style={[styles.entryValue, { color: colors.text }]}>
                    {dailyEntry.mood ? dailyEntry.mood.charAt(0).toUpperCase() + dailyEntry.mood.slice(1) : 'Not logged'}
                  </Text>
                </View>
                
                <View style={styles.entryRow}>
                  <Text style={[styles.entryLabel, { color: Colors.textMedium }]}>Energy:</Text>
                  <Text style={[styles.entryValue, { color: colors.text }]}>
                    {dailyEntry.energyLevel ? `${dailyEntry.energyLevel}/5` : 'Not logged'}
                  </Text>
                </View>
                
                <View style={styles.entryRow}>
                  <Text style={[styles.entryLabel, { color: Colors.textMedium }]}>Symptoms:</Text>
                  <Text style={[styles.entryValue, { color: colors.text }]}>
                    {dailyEntry.symptoms && dailyEntry.symptoms.length > 0 
                      ? `${dailyEntry.symptoms.length} symptom${dailyEntry.symptoms.length > 1 ? 's' : ''}`
                      : 'None logged'
                    }
                  </Text>
                </View>
                
                {dailyEntry.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={[styles.entryLabel, { color: Colors.textMedium }]}>Notes:</Text>
                    <Text style={[styles.notesText, { color: colors.text }]}>
                      {dailyEntry.notes}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <Text style={[styles.noEntryText, { color: Colors.textMedium }]}>
                No entry recorded for this date
              </Text>
            )}
          </Card>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {!cycleData?.phase || cycleData.phase !== CyclePhase.MENSTRUAL ? (
              <Button
                title="Log Period Start"
                onPress={handleLogPeriod}
                variant="outline"
                style={styles.actionButton}
              />
            ) : null}
            
            <Button
              title={dailyEntry ? "Edit Entry" : "Add Entry"}
              onPress={handleEditEntry}
              variant="primary"
              style={styles.actionButton}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.divider,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  dateTitle: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
    flex: 1,
  },
  closeButton: {
    padding: Theme.spacing.sm,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: Theme.typography.weights.bold,
  },
  phaseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    padding: Theme.spacing.md,
    backgroundColor: Colors.primarySoft,
    borderRadius: Theme.borderRadius.lg,
  },
  phaseEmoji: {
    fontSize: 32,
    marginRight: Theme.spacing.md,
  },
  phaseTextContainer: {
    flex: 1,
  },
  phaseDescription: {
    fontSize: Theme.typography.sizes.sm,
    marginTop: Theme.spacing.xs,
  },
  predictedText: {
    fontSize: Theme.typography.sizes.xs,
    fontStyle: 'italic',
    marginTop: Theme.spacing.xs,
  },
  riskCard: {
    marginBottom: Theme.spacing.lg,
    borderWidth: 2,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  riskEmoji: {
    fontSize: 24,
    marginRight: Theme.spacing.sm,
  },
  riskTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
  },
  riskDescription: {
    fontSize: Theme.typography.sizes.sm,
    lineHeight: 20,
  },
  entryCard: {
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
    marginBottom: Theme.spacing.md,
  },
  entryInfo: {
    gap: Theme.spacing.sm,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryLabel: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
  },
  entryValue: {
    fontSize: Theme.typography.sizes.sm,
  },
  notesContainer: {
    marginTop: Theme.spacing.sm,
  },
  notesText: {
    fontSize: Theme.typography.sizes.sm,
    marginTop: Theme.spacing.xs,
    fontStyle: 'italic',
  },
  noEntryText: {
    fontSize: Theme.typography.sizes.sm,
    textAlign: 'center',
    padding: Theme.spacing.lg,
  },
  actionButtons: {
    gap: Theme.spacing.md,
  },
  actionButton: {
    width: '100%',
  },
});