import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Card, Button } from '@/components/ui';
import { FlowSelector } from '@/components/period/FlowSelector';
import { SymptomSelector } from '@/components/period/SymptomSelector';
import { FlowIntensity, SymptomType, SymptomSeverity, MoodType } from '@/types';

interface MoodOption {
  type: MoodType;
  emoji: string;
  label: string;
  color: string;
}

const moodOptions: MoodOption[] = [
  { type: MoodType.HAPPY, emoji: '😊', label: 'Happy', color: Colors.success },
  { type: MoodType.NEUTRAL, emoji: '😐', label: 'Neutral', color: Colors.textMedium },
  { type: MoodType.SAD, emoji: '😢', label: 'Sad', color: Colors.info },
  { type: MoodType.ANGRY, emoji: '😠', label: 'Angry', color: Colors.error },
  { type: MoodType.ANXIOUS, emoji: '😰', label: 'Anxious', color: Colors.warning },
  { type: MoodType.EXCITED, emoji: '🤩', label: 'Excited', color: Colors.primary },
  { type: MoodType.TIRED, emoji: '😴', label: 'Tired', color: Colors.pmsLavender },
  { type: MoodType.STRESSED, emoji: '😵', label: 'Stressed', color: Colors.calendarRed },
];

export default function SymptomsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [selectedFlow, setSelectedFlow] = useState<FlowIntensity>(FlowIntensity.NONE);
  const [selectedSymptoms, setSelectedSymptoms] = useState<{ type: SymptomType; severity: SymptomSeverity }[]>([]);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [notes, setNotes] = useState<string>('');

  const handleSaveEntry = () => {
    const entry = {
      date: new Date().toISOString().split('T')[0],
      flow: selectedFlow,
      symptoms: selectedSymptoms,
      mood: selectedMood,
      energyLevel,
      notes,
    };
    
    console.log('Saving entry:', entry);
    
    Alert.alert(
      'Entry Saved',
      'Your daily entry has been saved successfully!',
      [{ text: 'OK' }]
    );
  };

  const hasAnyData = () => {
    return selectedFlow !== FlowIntensity.NONE || 
           selectedSymptoms.length > 0 || 
           selectedMood !== null;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Daily Check-in
          </Text>
          <Text style={[styles.date, { color: Colors.textMedium }]}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Flow Tracking */}
        <Card style={styles.sectionCard}>
          <FlowSelector
            selectedFlow={selectedFlow}
            onFlowSelect={setSelectedFlow}
          />
        </Card>

        {/* Mood Tracking */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            How are you feeling today?
          </Text>
          <View style={styles.moodGrid}>
            {moodOptions.map((mood) => {
              const isSelected = selectedMood === mood.type;
              return (
                <View
                  key={mood.type}
                  style={[
                    styles.moodOption,
                    {
                      backgroundColor: isSelected ? mood.color + '20' : colors.card,
                      borderColor: isSelected ? mood.color : colors.border,
                    },
                  ]}
                  onTouchStart={() => setSelectedMood(isSelected ? null : mood.type)}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text
                    style={[
                      styles.moodLabel,
                      {
                        color: isSelected ? mood.color : colors.text,
                        fontWeight: isSelected ? Theme.typography.weights.semibold : Theme.typography.weights.regular,
                      },
                    ]}
                  >
                    {mood.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Energy Level */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Energy Level
          </Text>
          <View style={styles.energyContainer}>
            <View style={styles.energyScale}>
              {[1, 2, 3, 4, 5].map((level) => (
                <View
                  key={level}
                  style={[
                    styles.energyLevel,
                    {
                      backgroundColor: level <= energyLevel ? Colors.primary : colors.border,
                    },
                  ]}
                  onTouchStart={() => setEnergyLevel(level)}
                />
              ))}
            </View>
            <View style={styles.energyLabels}>
              <Text style={[styles.energyLabelText, { color: Colors.textMedium }]}>
                Low
              </Text>
              <Text style={[styles.energyLevelText, { color: colors.text }]}>
                {energyLevel}/5
              </Text>
              <Text style={[styles.energyLabelText, { color: Colors.textMedium }]}>
                High
              </Text>
            </View>
          </View>
        </Card>

        {/* Symptoms */}
        <Card style={styles.sectionCard}>
          <SymptomSelector
            selectedSymptoms={selectedSymptoms}
            onSymptomsChange={setSelectedSymptoms}
          />
        </Card>

        {/* Save Button */}
        <View style={styles.saveContainer}>
          <Button
            title={hasAnyData() ? 'Save Entry' : 'Skip Today'}
            onPress={handleSaveEntry}
            variant={hasAnyData() ? 'primary' : 'outline'}
            size="lg"
            style={styles.saveButton}
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Theme.spacing.md,
    paddingBottom: 0,
  },
  title: {
    fontSize: Theme.typography.sizes.xxl,
    fontWeight: Theme.typography.weights.bold,
    marginBottom: Theme.spacing.xs,
  },
  date: {
    fontSize: Theme.typography.sizes.md,
    marginBottom: Theme.spacing.lg,
  },
  sectionCard: {
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
    marginBottom: Theme.spacing.md,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
    justifyContent: 'space-between',
  },
  moodOption: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.sm,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: Theme.spacing.xs,
  },
  moodLabel: {
    fontSize: Theme.typography.sizes.xs,
    textAlign: 'center',
  },
  energyContainer: {
    alignItems: 'center',
  },
  energyScale: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  energyLevel: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  energyLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  energyLabelText: {
    fontSize: Theme.typography.sizes.sm,
  },
  energyLevelText: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
  },
  saveContainer: {
    paddingHorizontal: Theme.spacing.md,
    marginTop: Theme.spacing.lg,
  },
  saveButton: {
    width: '100%',
  },
  bottomPadding: {
    height: 100,
  },
});