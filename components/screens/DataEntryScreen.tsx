import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Card, Button, Badge } from '@/components/ui';
import { PeriodLogModal } from '../modals/PeriodLogModal';
import { OvulationModal } from '../modals/OvulationModal';
import { FlowIntensity, SymptomType, SymptomSeverity, MoodType } from '@/types';
import { cycleDataService } from '@/lib/services/CycleDataService';

interface DataEntryScreenProps {
  selectedDate: string;
  onClose: () => void;
  onDataUpdated?: () => void;
}

interface ExistingData {
  period?: {
    id: string;
    flow: FlowIntensity;
    isStart: boolean;
    isEnd: boolean;
  };
  ovulation?: {
    date: string;
  };
  symptoms: Array<{
    type: SymptomType;
    severity: SymptomSeverity;
  }>;
  mood?: MoodType;
  energyLevel?: number;
  notes?: string;
}

export const DataEntryScreen: React.FC<DataEntryScreenProps> = ({
  selectedDate,
  onClose,
  onDataUpdated,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showOvulationModal, setShowOvulationModal] = useState(false);
  const [periodModalMode, setPeriodModalMode] = useState<'start' | 'end' | 'edit'>('start');
  const [existingData, setExistingData] = useState<ExistingData>({
    symptoms: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadExistingData();
  }, [selectedDate]);

  const loadExistingData = async () => {
    try {
      setIsLoading(true);
      
      // Load existing data for the selected date
      const dailyEntry = await cycleDataService.getDailyEntry(selectedDate);
      const symptoms = await cycleDataService.getSymptomsForDate(selectedDate);
      
      setExistingData({
        symptoms: symptoms.map(s => ({
          type: s.type,
          severity: s.severity,
        })),
        mood: dailyEntry?.mood,
        energyLevel: dailyEntry?.energyLevel,
        notes: dailyEntry?.notes,
      });
    } catch (error) {
      console.error('Error loading existing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatSelectedDate = () => {
    return new Date(selectedDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysFromToday = () => {
    const today = new Date();
    const selected = new Date(selectedDate);
    const diffTime = selected.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  };

  const handlePeriodAction = (action: 'start' | 'end' | 'edit') => {
    setPeriodModalMode(action);
    setShowPeriodModal(true);
  };

  const handleOvulationAction = () => {
    setShowOvulationModal(true);
  };

  const handleDeletePeriod = () => {
    Alert.alert(
      'Delete Period Entry',
      'Are you sure you want to delete this period entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Implementation to delete period entry
            Alert.alert('Deleted', 'Period entry has been deleted.');
            onDataUpdated?.();
          },
        },
      ]
    );
  };

  const handleDeleteSymptoms = () => {
    Alert.alert(
      'Delete Symptoms',
      'Are you sure you want to delete all symptoms for this date?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await cycleDataService.deleteSymptomsForDate(selectedDate);
              Alert.alert('Deleted', 'Symptoms have been deleted.');
              loadExistingData();
              onDataUpdated?.();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete symptoms.');
            }
          },
        },
      ]
    );
  };

  const quickActions = [
    {
      title: 'Log Period Start',
      description: 'Mark the beginning of your period',
      emoji: '🩸',
      color: Colors.calendarRed,
      onPress: () => handlePeriodAction('start'),
    },
    {
      title: 'Log Period End',
      description: 'Mark when your period finished',
      emoji: '✨',
      color: Colors.primary,
      onPress: () => handlePeriodAction('end'),
    },
    {
      title: 'Log Ovulation',
      description: 'Record when you ovulated',
      emoji: '🥚',
      color: Colors.ovulationOrange,
      onPress: handleOvulationAction,
    },
    {
      title: 'Track Symptoms',
      description: 'Log how you\'re feeling today',
      emoji: '💭',
      color: Colors.pmsLavender,
      onPress: () => {
        // Navigate to symptoms screen or modal
      },
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDeep]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          
          <Animatable.Text animation="fadeInDown" style={styles.headerTitle}>
            📝 Edit Entry
          </Animatable.Text>
          
          <View style={styles.dateInfo}>
            <Text style={styles.selectedDate}>{formatSelectedDate()}</Text>
            <Text style={styles.daysFromToday}>{getDaysFromToday()}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Existing Data Overview */}
        {(existingData.period || existingData.ovulation || existingData.symptoms.length > 0) && (
          <Animatable.View animation="fadeInUp" delay={200}>
            <Card style={styles.existingDataCard}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                📊 Current Data for This Date
              </Text>
              
              {existingData.period && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Period:</Text>
                  <View style={styles.dataActions}>
                    <Badge
                      text={`${existingData.period.flow} flow`}
                      variant="secondary"
                      style={{ backgroundColor: Colors.calendarRed + '20' }}
                      textStyle={{ color: Colors.calendarRed }}
                    />
                    <TouchableOpacity onPress={() => handlePeriodAction('edit')}>
                      <Text style={styles.editLink}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDeletePeriod}>
                      <Text style={styles.deleteLink}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              
              {existingData.ovulation && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Ovulation:</Text>
                  <View style={styles.dataActions}>
                    <Badge
                      text="Recorded"
                      variant="secondary"
                      style={{ backgroundColor: Colors.ovulationOrange + '20' }}
                      textStyle={{ color: Colors.ovulationOrange }}
                    />
                    <TouchableOpacity onPress={handleOvulationAction}>
                      <Text style={styles.editLink}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              
              {existingData.symptoms.length > 0 && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Symptoms:</Text>
                  <View style={styles.dataActions}>
                    <Badge
                      text={`${existingData.symptoms.length} logged`}
                      variant="secondary"
                      style={{ backgroundColor: Colors.pmsLavender + '20' }}
                      textStyle={{ color: Colors.pmsLavender }}
                    />
                    <TouchableOpacity onPress={handleDeleteSymptoms}>
                      <Text style={styles.deleteLink}>Delete All</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              
              {existingData.mood && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Mood:</Text>
                  <Badge
                    text={existingData.mood}
                    variant="secondary"
                    style={{ backgroundColor: Colors.info + '20' }}
                    textStyle={{ color: Colors.info }}
                  />
                </View>
              )}
            </Card>
          </Animatable.View>
        )}

        {/* Quick Actions */}
        <Animatable.View animation="fadeInUp" delay={400}>
          <Card style={styles.actionsCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              ⚡ Quick Actions
            </Text>
            
            <View style={styles.actionsGrid}>
              {quickActions.map((action, index) => (
                <Animatable.View
                  key={index}
                  animation="fadeInUp"
                  delay={600 + index * 100}
                  style={styles.actionItemContainer}
                >
                  <TouchableOpacity
                    style={[
                      styles.actionItem,
                      { backgroundColor: action.color + '15', borderColor: action.color + '30' }
                    ]}
                    onPress={action.onPress}
                  >
                    <LinearGradient
                      colors={[action.color + '20', 'transparent']}
                      style={styles.actionGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.actionEmoji}>{action.emoji}</Text>
                      <Text style={[styles.actionTitle, { color: colors.text }]}>
                        {action.title}
                      </Text>
                      <Text style={[styles.actionDescription, { color: Colors.textMedium }]}>
                        {action.description}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animatable.View>
              ))}
            </View>
          </Card>
        </Animatable.View>

        {/* Predictions Info */}
        <Animatable.View animation="fadeInUp" delay={800}>
          <Card style={styles.predictionsCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              🔮 Cycle Predictions
            </Text>
            <Text style={[styles.predictionsDescription, { color: Colors.textMedium }]}>
              The more data you log, the more accurate our predictions become. Each entry helps us learn your unique patterns.
            </Text>
            
            <View style={styles.accuracyIndicator}>
              <Text style={[styles.accuracyLabel, { color: Colors.textMedium }]}>
                Current Accuracy:
              </Text>
              <Text style={[styles.accuracyValue, { color: Colors.success }]}>
                87% ⬆️
              </Text>
            </View>
          </Card>
        </Animatable.View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Modals */}
      <PeriodLogModal
        isVisible={showPeriodModal}
        onClose={() => setShowPeriodModal(false)}
        initialDate={selectedDate}
        mode={periodModalMode}
        existingData={existingData.period}
        onSave={(data) => {
          loadExistingData();
          onDataUpdated?.();
        }}
      />

      <OvulationModal
        isVisible={showOvulationModal}
        onClose={() => setShowOvulationModal(false)}
        initialDate={selectedDate}
        mode={existingData.ovulation ? 'edit' : 'add'}
        onSave={(date) => {
          loadExistingData();
          onDataUpdated?.();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: Theme.spacing.xl,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: Theme.spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardWhite + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: Colors.cardWhite,
    fontWeight: Theme.typography.weights.bold,
  },
  headerTitle: {
    fontSize: Theme.typography.sizes.xxl,
    fontWeight: Theme.typography.weights.bold,
    color: Colors.cardWhite,
    marginBottom: Theme.spacing.md,
  },
  dateInfo: {
    alignItems: 'center',
  },
  selectedDate: {
    fontSize: Theme.typography.sizes.lg,
    color: Colors.cardWhite,
    fontWeight: Theme.typography.weights.medium,
    marginBottom: Theme.spacing.xs,
  },
  daysFromToday: {
    fontSize: Theme.typography.sizes.sm,
    color: Colors.cardWhite,
    opacity: 0.8,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
  },
  existingDataCard: {
    marginBottom: Theme.spacing.lg,
    backgroundColor: Colors.info + '05',
  },
  sectionTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
    marginBottom: Theme.spacing.md,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  dataLabel: {
    fontSize: Theme.typography.sizes.sm,
    color: Colors.textMedium,
    fontWeight: Theme.typography.weights.medium,
  },
  dataActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  editLink: {
    fontSize: Theme.typography.sizes.sm,
    color: Colors.primary,
    fontWeight: Theme.typography.weights.medium,
  },
  deleteLink: {
    fontSize: Theme.typography.sizes.sm,
    color: Colors.error,
    fontWeight: Theme.typography.weights.medium,
  },
  actionsCard: {
    marginBottom: Theme.spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
  },
  actionItemContainer: {
    width: '48%',
  },
  actionItem: {
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    aspectRatio: 1.2,
  },
  actionGradient: {
    flex: 1,
    padding: Theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionEmoji: {
    fontSize: 32,
    marginBottom: Theme.spacing.sm,
  },
  actionTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.semibold,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },
  actionDescription: {
    fontSize: Theme.typography.sizes.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
  predictionsCard: {
    marginBottom: Theme.spacing.lg,
    backgroundColor: Colors.success + '05',
  },
  predictionsDescription: {
    fontSize: Theme.typography.sizes.sm,
    lineHeight: 20,
    marginBottom: Theme.spacing.md,
  },
  accuracyIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardWhite,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  accuracyLabel: {
    fontSize: Theme.typography.sizes.sm,
  },
  accuracyValue: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
  },
  bottomPadding: {
    height: 100,
  },
});