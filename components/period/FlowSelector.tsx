import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { FlowIntensity } from '@/types';
import { useColorScheme } from '@/hooks/useColorScheme';

interface FlowSelectorProps {
  selectedFlow: FlowIntensity;
  onFlowSelect: (flow: FlowIntensity) => void;
  style?: any;
}

const flowOptions = [
  { value: FlowIntensity.SPOTTING, label: 'Spotting', emoji: '💧', color: Colors.primarySoft },
  { value: FlowIntensity.LIGHT, label: 'Light', emoji: '🩸', color: Colors.primaryLight },
  { value: FlowIntensity.MEDIUM, label: 'Medium', emoji: '🔴', color: Colors.primary },
  { value: FlowIntensity.HEAVY, label: 'Heavy', emoji: '🌊', color: Colors.calendarRed },
];

export const FlowSelector: React.FC<FlowSelectorProps> = ({
  selectedFlow,
  onFlowSelect,
  style,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Flow Intensity
      </Text>
      <View style={styles.optionsContainer}>
        {flowOptions.map((option) => {
          const isSelected = selectedFlow === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                {
                  backgroundColor: isSelected ? option.color : colors.card,
                  borderColor: isSelected ? option.color : colors.border,
                },
              ]}
              onPress={() => onFlowSelect(option.value)}
            >
              <Text style={styles.emoji}>{option.emoji}</Text>
              <Text
                style={[
                  styles.label,
                  {
                    color: isSelected ? Colors.cardWhite : colors.text,
                    fontWeight: isSelected ? Theme.typography.weights.semibold : Theme.typography.weights.regular,
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.semibold,
    marginBottom: Theme.spacing.sm,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  option: {
    flex: 1,
    minWidth: 80,
    aspectRatio: 1,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.sm,
  },
  emoji: {
    fontSize: 24,
    marginBottom: Theme.spacing.xs,
  },
  label: {
    fontSize: Theme.typography.sizes.xs,
    textAlign: 'center',
  },
});