import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { SymptomType, SymptomSeverity } from '@/types';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Badge } from '@/components/ui';

interface SymptomSelectorProps {
  selectedSymptoms: { type: SymptomType; severity: SymptomSeverity }[];
  onSymptomsChange: (symptoms: { type: SymptomType; severity: SymptomSeverity }[]) => void;
  style?: any;
}

const symptomCategories = {
  physical: {
    title: 'Physical Symptoms',
    symptoms: [
      { type: SymptomType.CRAMPS, label: 'Cramps', emoji: '😖' },
      { type: SymptomType.BLOATING, label: 'Bloating', emoji: '🎈' },
      { type: SymptomType.HEADACHE, label: 'Headache', emoji: '🤕' },
      { type: SymptomType.BREAST_TENDERNESS, label: 'Breast Tenderness', emoji: '🤱' },
      { type: SymptomType.NAUSEA, label: 'Nausea', emoji: '🤢' },
      { type: SymptomType.FATIGUE, label: 'Fatigue', emoji: '😴' },
      { type: SymptomType.BACKACHE, label: 'Back Pain', emoji: '🔗' },
    ],
  },
  emotional: {
    title: 'Emotional Symptoms',
    symptoms: [
      { type: SymptomType.MOOD_SWINGS, label: 'Mood Swings', emoji: '🎭' },
      { type: SymptomType.IRRITABILITY, label: 'Irritability', emoji: '😠' },
      { type: SymptomType.ANXIETY, label: 'Anxiety', emoji: '😰' },
      { type: SymptomType.DEPRESSION, label: 'Sadness', emoji: '😢' },
    ],
  },
  skin: {
    title: 'Skin & Hair',
    symptoms: [
      { type: SymptomType.ACNE, label: 'Acne', emoji: '🔴' },
      { type: SymptomType.OILY_SKIN, label: 'Oily Skin', emoji: '💧' },
      { type: SymptomType.DRY_SKIN, label: 'Dry Skin', emoji: '🌵' },
    ],
  },
  energy: {
    title: 'Energy & Sleep',
    symptoms: [
      { type: SymptomType.INSOMNIA, label: 'Insomnia', emoji: '🌙' },
      { type: SymptomType.LOW_ENERGY, label: 'Low Energy', emoji: '🔋' },
      { type: SymptomType.HIGH_ENERGY, label: 'High Energy', emoji: '⚡' },
    ],
  },
};

const severityLevels = [
  { value: SymptomSeverity.MILD, label: 'Mild', color: Colors.success },
  { value: SymptomSeverity.MODERATE, label: 'Moderate', color: Colors.warning },
  { value: SymptomSeverity.SEVERE, label: 'Severe', color: Colors.error },
];

export const SymptomSelector: React.FC<SymptomSelectorProps> = ({
  selectedSymptoms,
  onSymptomsChange,
  style,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const isSymptomSelected = (symptomType: SymptomType) => {
    return selectedSymptoms.find(s => s.type === symptomType);
  };

  const toggleSymptom = (symptomType: SymptomType) => {
    const existing = selectedSymptoms.find(s => s.type === symptomType);
    if (existing) {
      // Remove symptom
      onSymptomsChange(selectedSymptoms.filter(s => s.type !== symptomType));
    } else {
      // Add symptom with mild severity
      onSymptomsChange([
        ...selectedSymptoms,
        { type: symptomType, severity: SymptomSeverity.MILD },
      ]);
    }
  };

  const updateSymptomSeverity = (symptomType: SymptomType, severity: SymptomSeverity) => {
    onSymptomsChange(
      selectedSymptoms.map(s =>
        s.type === symptomType ? { ...s, severity } : s
      )
    );
  };

  const renderSymptomCategory = (categoryKey: string, category: any) => (
    <View key={categoryKey} style={styles.category}>
      <Text style={[styles.categoryTitle, { color: colors.text }]}>
        {category.title}
      </Text>
      <View style={styles.symptomsContainer}>
        {category.symptoms.map((symptom: any) => {
          const selected = isSymptomSelected(symptom.type);
          return (
            <View key={symptom.type}>
              <TouchableOpacity
                style={[
                  styles.symptomButton,
                  {
                    backgroundColor: selected ? Colors.primary : colors.card,
                    borderColor: selected ? Colors.primary : colors.border,
                  },
                ]}
                onPress={() => toggleSymptom(symptom.type)}
              >
                <Text style={styles.symptomEmoji}>{symptom.emoji}</Text>
                <Text
                  style={[
                    styles.symptomLabel,
                    { color: selected ? Colors.cardWhite : colors.text },
                  ]}
                >
                  {symptom.label}
                </Text>
              </TouchableOpacity>
              
              {selected && (
                <View style={styles.severityContainer}>
                  {severityLevels.map((level) => (
                    <TouchableOpacity
                      key={level.value}
                      style={[
                        styles.severityButton,
                        {
                          backgroundColor: selected.severity === level.value 
                            ? level.color 
                            : colors.card,
                        },
                      ]}
                      onPress={() => updateSymptomSeverity(symptom.type, level.value)}
                    >
                      <Text
                        style={[
                          styles.severityText,
                          {
                            color: selected.severity === level.value
                              ? Colors.cardWhite
                              : colors.text,
                          },
                        ]}
                      >
                        {level.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, style]} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: colors.text }]}>
        How are you feeling?
      </Text>
      
      {selectedSymptoms.length > 0 && (
        <View style={styles.selectedContainer}>
          <Text style={[styles.selectedTitle, { color: colors.text }]}>
            Selected ({selectedSymptoms.length})
          </Text>
          <View style={styles.selectedSymptoms}>
            {selectedSymptoms.map((symptom, index) => (
              <Badge
                key={index}
                text={`${symptom.type.replace('_', ' ')} - ${severityLevels.find(l => l.value === symptom.severity)?.label}`}
                variant="primary"
                size="sm"
              />
            ))}
          </View>
        </View>
      )}

      {Object.entries(symptomCategories).map(([key, category]) =>
        renderSymptomCategory(key, category)
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
    marginBottom: Theme.spacing.lg,
  },
  selectedContainer: {
    marginBottom: Theme.spacing.lg,
  },
  selectedTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.medium,
    marginBottom: Theme.spacing.sm,
  },
  selectedSymptoms: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.xs,
  },
  category: {
    marginBottom: Theme.spacing.lg,
  },
  categoryTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.semibold,
    marginBottom: Theme.spacing.md,
  },
  symptomsContainer: {
    gap: Theme.spacing.sm,
  },
  symptomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
  },
  symptomEmoji: {
    fontSize: 20,
    marginRight: Theme.spacing.sm,
  },
  symptomLabel: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
  },
  severityContainer: {
    flexDirection: 'row',
    marginTop: Theme.spacing.xs,
    marginLeft: Theme.spacing.xl,
    gap: Theme.spacing.xs,
  },
  severityButton: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  severityText: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.medium,
  },
});