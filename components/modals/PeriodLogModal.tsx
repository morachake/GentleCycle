import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { Button, Card } from '@/components/ui';
import { FlowSelector } from '@/components/period/FlowSelector';
import { FlowIntensity } from '@/types';
import { cycleDataService } from '@/lib/services/CycleDataService';

interface PeriodLogModalProps {
  isVisible: boolean;
  onClose: () => void;
  initialDate?: string;
  mode: 'start' | 'end' | 'edit';
  existingData?: {
    periodId?: string;
    startDate?: string;
    endDate?: string;
    flow?: FlowIntensity;
  };
  onSave?: (data: any) => void;
}

export const PeriodLogModal: React.FC<PeriodLogModalProps> = ({
  isVisible,
  onClose,
  initialDate,
  mode,
  existingData,
  onSave,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedFlow, setSelectedFlow] = useState<FlowIntensity>(FlowIntensity.MEDIUM);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isVisible) {
      // Initialize with provided data
      if (initialDate) {
        setSelectedDate(new Date(initialDate));
      }
      
      if (existingData) {
        if (existingData.startDate) {
          setSelectedDate(new Date(existingData.startDate));
        }
        if (existingData.flow) {
          setSelectedFlow(existingData.flow);
        }
      }
    }
  }, [isVisible, initialDate, existingData]);

  const getModalTitle = () => {
    switch (mode) {
      case 'start':
        return '🩸 Log Period Start';
      case 'end':
        return '✨ Mark Period End';
      case 'edit':
        return '📝 Edit Period';
      default:
        return 'Log Period';
    }
  };

  const getModalDescription = () => {
    switch (mode) {
      case 'start':
        return 'When did your period start?';
      case 'end':
        return 'When did your period end?';
      case 'edit':
        return 'Update your period information';
      default:
        return '';
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      
      switch (mode) {
        case 'start':
          const periodId = await cycleDataService.logPeriodStart(dateString, selectedFlow);
          Alert.alert(
            '🎉 Period Logged!',
            'Your period start has been recorded. We\'ll track your cycle and send helpful reminders.',
            [{ text: 'OK' }]
          );
          break;
          
        case 'end':
          if (existingData?.periodId) {
            await cycleDataService.logPeriodEnd(existingData.periodId, dateString);
            Alert.alert(
              '✅ Period Ended!',
              'Your cycle is complete. We\'ll use this data to improve future predictions.',
              [{ text: 'OK' }]
            );
          }
          break;
          
        case 'edit':
          await cycleDataService.updatePeriodFlow(dateString, selectedFlow);
          Alert.alert(
            '📝 Updated!',
            'Your period information has been updated successfully.',
            [{ text: 'OK' }]
          );
          break;
      }
      
      onSave?.(
        mode === 'start' 
          ? { periodId: Date.now().toString(), startDate: dateString, flow: selectedFlow }
          : { endDate: dateString, flow: selectedFlow }
      );
      onClose();
    } catch (error) {
      console.error('Error saving period data:', error);
      Alert.alert(
        'Error',
        'Failed to save period data. Please try again.',
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysAgo = (date: Date) => {
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays > 0) return `${diffDays} days ago`;
    return `In ${Math.abs(diffDays)} days`;
  };

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
          colors={[Colors.primary, Colors.primaryDeep]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.dragHandle} />
          <Animatable.Text animation="fadeInDown" style={styles.modalTitle}>
            {getModalTitle()}
          </Animatable.Text>
          <Text style={styles.modalDescription}>
            {getModalDescription()}
          </Text>
        </LinearGradient>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Date Selection */}
          <Animatable.View animation="fadeInUp" delay={200}>
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>📅 Date</Text>
              
              <TouchableOpacity
                style={styles.dateSelector}
                onPress={() => setShowDatePicker(true)}
              >
                <LinearGradient
                  colors={[Colors.primarySoft, Colors.cardWhite]}
                  style={styles.dateGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <View>
                    <Text style={styles.selectedDate}>
                      {formatDate(selectedDate)}
                    </Text>
                    <Text style={styles.daysAgo}>
                      {getDaysAgo(selectedDate)}
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

          {/* Flow Selection */}
          {mode !== 'end' && (
            <Animatable.View animation="fadeInUp" delay={400}>
              <Card style={styles.sectionCard}>
                <FlowSelector
                  selectedFlow={selectedFlow}
                  onFlowSelect={setSelectedFlow}
                />
              </Card>
            </Animatable.View>
          )}

          {/* Quick Tips */}
          <Animatable.View animation="fadeInUp" delay={600}>
            <Card style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
              <View style={styles.tipsList}>
                {mode === 'start' && (
                  <>
                    <Text style={styles.tipItem}>
                      • Log your period as soon as it starts for accurate predictions
                    </Text>
                    <Text style={styles.tipItem}>
                      • You can always edit the flow intensity later
                    </Text>
                    <Text style={styles.tipItem}>
                      • Track symptoms daily for better insights
                    </Text>
                  </>
                )}
                {mode === 'end' && (
                  <>
                    <Text style={styles.tipItem}>
                      • Marking the end helps calculate your cycle length
                    </Text>
                    <Text style={styles.tipItem}>
                      • This data improves future predictions
                    </Text>
                  </>
                )}
                {mode === 'edit' && (
                  <>
                    <Text style={styles.tipItem}>
                      • Update any details that have changed
                    </Text>
                    <Text style={styles.tipItem}>
                      • Your edits will improve prediction accuracy
                    </Text>
                  </>
                )}
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
            title={isLoading ? 'Saving...' : 'Save'}
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
    minHeight: '60%',
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
  daysAgo: {
    fontSize: Theme.typography.sizes.sm,
    color: Colors.textMedium,
  },
  editIcon: {
    fontSize: 20,
  },
  tipsCard: {
    marginVertical: Theme.spacing.sm,
    backgroundColor: Colors.info + '10',
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