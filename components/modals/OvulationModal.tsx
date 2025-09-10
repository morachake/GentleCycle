import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { Button, Card } from '@/components/ui';
import { cycleDataService } from '@/lib/services/CycleDataService';
import { PregnancyRiskCalculator } from '@/lib/utils/pregnancyRisk';

interface OvulationModalProps {
  isVisible: boolean;
  onClose: () => void;
  initialDate?: string;
  mode: 'add' | 'edit';
  onSave?: (date: string) => void;
}

export const OvulationModal: React.FC<OvulationModalProps> = ({
  isVisible,
  onClose,
  initialDate,
  mode,
  onSave,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [symptoms, setSymptoms] = useState<string[]>([]);

  const ovulationSymptoms = [
    { key: 'cervical_mucus', label: 'Clear, stretchy discharge', emoji: '💧' },
    { key: 'slight_pain', label: 'Slight abdominal pain', emoji: '🤏' },
    { key: 'temperature_rise', label: 'Body temperature rise', emoji: '🌡️' },
    { key: 'increased_libido', label: 'Increased libido', emoji: '💕' },
    { key: 'breast_tenderness', label: 'Breast tenderness', emoji: '🤱' },
    { key: 'bloating', label: 'Light bloating', emoji: '🎈' },
  ];

  useEffect(() => {
    if (isVisible && initialDate) {
      setSelectedDate(new Date(initialDate));
    }
  }, [isVisible, initialDate]);

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      
      if (mode === 'edit' && initialDate) {
        await cycleDataService.updateOvulationDate(initialDate, dateString);
      } else {
        await cycleDataService.logOvulationDate(dateString);
      }
      
      // Also log selected symptoms if any
      if (symptoms.length > 0) {
        // Implementation to log ovulation symptoms
      }
      
      Alert.alert(
        '🥚 Ovulation Recorded!',
        'Your ovulation date has been saved. This will help improve cycle predictions and fertility tracking.',
        [{ text: 'Perfect!' }]
      );
      
      onSave?.(dateString);
      onClose();
    } catch (error) {
      console.error('Error saving ovulation data:', error);
      Alert.alert(
        'Error',
        'Failed to save ovulation data. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const toggleSymptom = (symptomKey: string) => {
    setSymptoms(prev => 
      prev.includes(symptomKey) 
        ? prev.filter(s => s !== symptomKey)
        : [...prev, symptomKey]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCycleDay = (date: Date) => {
    // Mock calculation - in real app this would be based on actual cycle data
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return 14 + diffDays; // Mock cycle day
  };

  const cycleDay = getCycleDay(selectedDate);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
    >
      <View style={styles.modalContent}>
        {/* Header */}
        <LinearGradient
          colors={[Colors.ovulationOrange, '#FF7043']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.dragHandle} />
          <Animatable.Text animation="bounceIn" style={styles.modalTitle}>
            🥚 {mode === 'edit' ? 'Edit Ovulation' : 'Log Ovulation'}
          </Animatable.Text>
          <Text style={styles.modalDescription}>
            {mode === 'edit' 
              ? 'Update your ovulation date and symptoms'
              : 'When did you ovulate?'
            }
          </Text>
        </LinearGradient>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Date Selection */}
          <Animatable.View animation="fadeInUp" delay={200}>
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>📅 Ovulation Date</Text>
              
              <TouchableOpacity
                style={styles.dateSelector}
                onPress={() => setShowDatePicker(true)}
              >
                <LinearGradient
                  colors={[Colors.ovulationOrange + '20', Colors.cardWhite]}
                  style={styles.dateGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <View>
                    <Text style={styles.selectedDate}>
                      {formatDate(selectedDate)}
                    </Text>
                    <Text style={styles.cycleDay}>
                      Cycle day {cycleDay}
                    </Text>
                  </View>
                  <Text style={styles.editIcon}>📝</Text>
                </LinearGradient>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
            </Card>
          </Animatable.View>

          {/* Ovulation Symptoms */}
          <Animatable.View animation="fadeInUp" delay={400}>
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>🔍 Ovulation Signs</Text>
              <Text style={styles.sectionSubtitle}>
                Select any symptoms you experienced (optional)
              </Text>
              
              <View style={styles.symptomsGrid}>
                {ovulationSymptoms.map((symptom, index) => (
                  <Animatable.View
                    key={symptom.key}
                    animation="fadeInUp"
                    delay={600 + index * 100}
                  >
                    <TouchableOpacity
                      style={[
                        styles.symptomCard,
                        {
                          backgroundColor: symptoms.includes(symptom.key) 
                            ? Colors.ovulationOrange + '20' 
                            : Colors.cardWhite,
                          borderColor: symptoms.includes(symptom.key)
                            ? Colors.ovulationOrange
                            : Colors.divider,
                        },
                      ]}
                      onPress={() => toggleSymptom(symptom.key)}
                    >
                      <Text style={styles.symptomEmoji}>{symptom.emoji}</Text>
                      <Text style={[
                        styles.symptomText,
                        {
                          color: symptoms.includes(symptom.key)
                            ? Colors.ovulationOrange
                            : Colors.textDark,
                          fontWeight: symptoms.includes(symptom.key)
                            ? Theme.typography.weights.semibold
                            : Theme.typography.weights.regular,
                        },
                      ]}>
                        {symptom.label}
                      </Text>
                      
                      {symptoms.includes(symptom.key) && (
                        <Animatable.View
                          animation="zoomIn"
                          style={[styles.checkmark, { backgroundColor: Colors.ovulationOrange }]}
                        >
                          <Text style={styles.checkmarkText}>✓</Text>
                        </Animatable.View>
                      )}
                    </TouchableOpacity>
                  </Animatable.View>
                ))}
              </View>
            </Card>
          </Animatable.View>

          {/* Fertility Window Info */}
          <Animatable.View animation="fadeInUp" delay={800}>
            <Card style={[styles.infoCard, { backgroundColor: Colors.fertilityGreen + '10' }]}>
              <Text style={styles.infoTitle}>🌟 Fertility Window</Text>
              <Text style={styles.infoText}>
                Your most fertile days are typically from 5 days before ovulation until 1 day after. 
                Based on your selected date, your fertility window would be approximately:
              </Text>
              <View style={styles.fertilityDates}>
                <Text style={styles.fertilityText}>
                  📅 {new Date(selectedDate.getTime() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString()} - {new Date(selectedDate.getTime() + 1 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </Text>
              </View>
            </Card>
          </Animatable.View>

          {/* Tips */}
          <Animatable.View animation="fadeInUp" delay={1000}>
            <Card style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>💡 Ovulation Tracking Tips</Text>
              <View style={styles.tipsList}>
                <Text style={styles.tipItem}>
                  • Track basal body temperature for more accurate detection
                </Text>
                <Text style={styles.tipItem}>
                  • Monitor cervical mucus changes throughout your cycle
                </Text>
                <Text style={styles.tipItem}>
                  • Use ovulation predictor kits for additional confirmation
                </Text>
                <Text style={styles.tipItem}>
                  • Note any mid-cycle pain or spotting
                </Text>
              </View>
            </Card>
          </Animatable.View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Cancel"
            onPress={onClose}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title={isLoading ? 'Saving...' : 'Save Ovulation'}
            onPress={handleSave}
            loading={isLoading}
            style={styles.saveButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: Colors.cardWhite,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    maxHeight: '90%',
    minHeight: '70%',
  },
  header: {
    padding: Theme.spacing.xl,
    paddingBottom: Theme.spacing.lg,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    alignItems: 'center',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.cardWhite,
    borderRadius: 2,
    marginBottom: Theme.spacing.lg,
    opacity: 0.7,
  },
  modalTitle: {
    fontSize: Theme.typography.sizes.xxl,
    fontWeight: Theme.typography.weights.bold,
    color: Colors.cardWhite,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  modalDescription: {
    fontSize: Theme.typography.sizes.md,
    color: Colors.cardWhite,
    textAlign: 'center',
    opacity: 0.9,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
  },
  sectionCard: {
    marginVertical: Theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.semibold,
    color: Colors.textDark,
    marginBottom: Theme.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: Theme.typography.sizes.sm,
    color: Colors.textMedium,
    marginBottom: Theme.spacing.md,
  },
  dateSelector: {
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
  },
  dateGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  selectedDate: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
    color: Colors.textDark,
    marginBottom: Theme.spacing.xs,
  },
  cycleDay: {
    fontSize: Theme.typography.sizes.sm,
    color: Colors.ovulationOrange,
    fontWeight: Theme.typography.weights.medium,
  },
  editIcon: {
    fontSize: 20,
  },
  symptomsGrid: {
    gap: Theme.spacing.sm,
  },
  symptomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    position: 'relative',
  },
  symptomEmoji: {
    fontSize: 20,
    marginRight: Theme.spacing.md,
  },
  symptomText: {
    flex: 1,
    fontSize: Theme.typography.sizes.sm,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: Theme.spacing.md,
  },
  checkmarkText: {
    color: Colors.cardWhite,
    fontSize: 12,
    fontWeight: Theme.typography.weights.bold,
  },
  infoCard: {
    marginVertical: Theme.spacing.sm,
  },
  infoTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.semibold,
    color: Colors.textDark,
    marginBottom: Theme.spacing.sm,
  },
  infoText: {
    fontSize: Theme.typography.sizes.sm,
    color: Colors.textMedium,
    lineHeight: 20,
    marginBottom: Theme.spacing.md,
  },
  fertilityDates: {
    backgroundColor: Colors.cardWhite,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  fertilityText: {
    fontSize: Theme.typography.sizes.sm,
    color: Colors.fertilityGreen,
    fontWeight: Theme.typography.weights.semibold,
    textAlign: 'center',
  },
  tipsCard: {
    marginVertical: Theme.spacing.sm,
    backgroundColor: Colors.ovulationOrange + '10',
  },
  tipsTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.semibold,
    color: Colors.textDark,
    marginBottom: Theme.spacing.sm,
  },
  tipsList: {
    gap: Theme.spacing.xs,
  },
  tipItem: {
    fontSize: Theme.typography.sizes.sm,
    color: Colors.textMedium,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    padding: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    backgroundColor: Colors.background,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
});