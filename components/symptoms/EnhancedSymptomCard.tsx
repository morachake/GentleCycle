import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { SymptomType, SymptomSeverity } from '@/types';

interface EnhancedSymptomCardProps {
  symptom: {
    type: SymptomType;
    label: string;
    emoji: string;
    description?: string;
  };
  selected: boolean;
  severity?: SymptomSeverity;
  onPress: () => void;
  onSeverityChange: (severity: SymptomSeverity) => void;
  animationDelay?: number;
}

export const EnhancedSymptomCard: React.FC<EnhancedSymptomCardProps> = ({
  symptom,
  selected,
  severity = SymptomSeverity.MILD,
  onPress,
  onSeverityChange,
  animationDelay = 0,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const severityData = [
    { level: SymptomSeverity.MILD, label: 'Mild', color: Colors.success },
    { level: SymptomSeverity.MODERATE, label: 'Moderate', color: Colors.warning },
    { level: SymptomSeverity.SEVERE, label: 'Severe', color: Colors.error },
  ];

  const getSymptomColor = () => {
    switch (symptom.type) {
      case SymptomType.CRAMPS:
        return Colors.calendarRed;
      case SymptomType.BLOATING:
        return Colors.warning;
      case SymptomType.HEADACHE:
        return Colors.pmsLavender;
      case SymptomType.MOOD_SWINGS:
        return Colors.info;
      case SymptomType.BREAST_TENDERNESS:
        return Colors.primaryLight;
      case SymptomType.FATIGUE:
        return Colors.textMedium;
      case SymptomType.NAUSEA:
        return Colors.fertilityGreen;
      default:
        return Colors.primary;
    }
  };

  const symptomColor = getSymptomColor();

  useEffect(() => {
    if (selected) {
      // Scale animation when selected
      Animated.spring(scaleAnim, {
        toValue: 1.05,
        useNativeDriver: true,
        tension: 150,
        friction: 3,
      }).start();

      // Pulse animation for severe symptoms
      if (severity === SymptomSeverity.SEVERE) {
        const pulse = () => {
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ]).start(() => pulse());
        };
        pulse();
      }
    } else {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  }, [selected, severity]);

  const getGradientColors = () => {
    if (selected) {
      return [symptomColor + '20', symptomColor + '10'];
    }
    return [Colors.cardWhite, Colors.cardWhite];
  };

  return (
    <Animatable.View
      animation="fadeInUp"
      delay={animationDelay}
      duration={600}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { scale: scaleAnim },
              { scale: selected && severity === SymptomSeverity.SEVERE ? pulseAnim : 1 }
            ],
          },
        ]}
      >
        <LinearGradient
          colors={getGradientColors()}
          style={[
            styles.card,
            {
              borderColor: selected ? symptomColor : Colors.divider,
              borderWidth: selected ? 2 : 1,
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity
            onPress={onPress}
            style={styles.cardContent}
            activeOpacity={0.8}
          >
            {/* Emoji with bounce effect */}
            <Animatable.Text
              animation={selected ? "bounce" : undefined}
              style={[
                styles.emoji,
                selected && { transform: [{ scale: 1.2 }] }
              ]}
            >
              {symptom.emoji}
            </Animatable.Text>

            {/* Symptom info */}
            <View style={styles.symptomInfo}>
              <Text style={[
                styles.symptomLabel,
                { 
                  color: selected ? symptomColor : Colors.textDark,
                  fontWeight: selected ? Theme.typography.weights.semibold : Theme.typography.weights.regular,
                }
              ]}>
                {symptom.label}
              </Text>
              
              {symptom.description && (
                <Text style={[styles.symptomDescription, { color: Colors.textMedium }]}>
                  {symptom.description}
                </Text>
              )}
            </View>

            {/* Selection indicator */}
            {selected && (
              <Animatable.View
                animation="zoomIn"
                style={[styles.selectionIndicator, { backgroundColor: symptomColor }]}
              >
                <Text style={styles.checkmark}>✓</Text>
              </Animatable.View>
            )}
          </TouchableOpacity>

          {/* Severity selector */}
          {selected && (
            <Animatable.View
              animation="slideInUp"
              delay={200}
              style={styles.severityContainer}
            >
              <Text style={[styles.severityLabel, { color: Colors.textMedium }]}>
                Intensity:
              </Text>
              <View style={styles.severityButtons}>
                {severityData.map((item) => (
                  <TouchableOpacity
                    key={item.level}
                    onPress={() => onSeverityChange(item.level)}
                    style={[
                      styles.severityButton,
                      {
                        backgroundColor: severity === item.level ? item.color : Colors.cardWhite,
                        borderColor: item.color,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.severityButtonText,
                        {
                          color: severity === item.level ? Colors.cardWhite : item.color,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animatable.View>
          )}
        </LinearGradient>
      </Animated.View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.md,
  },
  card: {
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    ...Theme.shadows.sm,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  emoji: {
    fontSize: 28,
    marginRight: Theme.spacing.md,
    textAlign: 'center',
    width: 40,
  },
  symptomInfo: {
    flex: 1,
  },
  symptomLabel: {
    fontSize: Theme.typography.sizes.md,
    marginBottom: Theme.spacing.xs,
  },
  symptomDescription: {
    fontSize: Theme.typography.sizes.sm,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: Colors.cardWhite,
    fontSize: 12,
    fontWeight: Theme.typography.weights.bold,
  },
  severityContainer: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  severityLabel: {
    fontSize: Theme.typography.sizes.sm,
    marginBottom: Theme.spacing.sm,
  },
  severityButtons: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  severityButton: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  severityButtonText: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.medium,
  },
});