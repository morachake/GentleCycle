import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { MoodType } from '@/types';

const { width } = Dimensions.get('window');

interface MoodOption {
  type: MoodType;
  emoji: string;
  label: string;
  color: string;
  description: string;
}

interface EnhancedMoodSelectorProps {
  selectedMood: MoodType | null;
  onMoodSelect: (mood: MoodType | null) => void;
  style?: any;
}

const moodOptions: MoodOption[] = [
  {
    type: MoodType.HAPPY,
    emoji: '😊',
    label: 'Happy',
    color: Colors.success,
    description: 'Feeling great and positive!',
  },
  {
    type: MoodType.EXCITED,
    emoji: '🤩',
    label: 'Excited',
    color: Colors.primary,
    description: 'Full of energy and enthusiasm',
  },
  {
    type: MoodType.NEUTRAL,
    emoji: '😐',
    label: 'Neutral',
    color: Colors.textMedium,
    description: 'Just a regular day',
  },
  {
    type: MoodType.TIRED,
    emoji: '😴',
    label: 'Tired',
    color: Colors.pmsLavender,
    description: 'Feeling sleepy and low energy',
  },
  {
    type: MoodType.STRESSED,
    emoji: '😵',
    label: 'Stressed',
    color: Colors.warning,
    description: 'Overwhelmed and anxious',
  },
  {
    type: MoodType.SAD,
    emoji: '😢',
    label: 'Sad',
    color: Colors.info,
    description: 'Feeling down and emotional',
  },
  {
    type: MoodType.ANGRY,
    emoji: '😠',
    label: 'Angry',
    color: Colors.error,
    description: 'Frustrated and irritated',
  },
  {
    type: MoodType.ANXIOUS,
    emoji: '😰',
    label: 'Anxious',
    color: Colors.calendarRed,
    description: 'Worried and restless',
  },
];

export const EnhancedMoodSelector: React.FC<EnhancedMoodSelectorProps> = ({
  selectedMood,
  onMoodSelect,
  style,
}) => {
  const animatedValues = useRef(
    moodOptions.reduce((acc, mood) => {
      acc[mood.type] = new Animated.Value(1);
      return acc;
    }, {} as Record<MoodType, Animated.Value>)
  ).current;

  const rippleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate selected mood
    Object.entries(animatedValues).forEach(([moodType, animValue]) => {
      const isSelected = selectedMood === moodType;
      Animated.spring(animValue, {
        toValue: isSelected ? 1.2 : 1,
        useNativeDriver: true,
        tension: 150,
        friction: 4,
      }).start();
    });

    // Ripple effect when mood changes
    if (selectedMood) {
      Animated.sequence([
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rippleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedMood]);

  const handleMoodPress = (mood: MoodType) => {
    onMoodSelect(selectedMood === mood ? null : mood);
  };

  const getSelectedMoodData = () => {
    return moodOptions.find(mood => mood.type === selectedMood);
  };

  const selectedMoodData = getSelectedMoodData();

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>How are you feeling today?</Text>
      
      {/* Selected mood description */}
      {selectedMoodData && (
        <Animatable.View
          animation="fadeInDown"
          style={[styles.selectedMoodCard, { backgroundColor: selectedMoodData.color + '15' }]}
        >
          <LinearGradient
            colors={[selectedMoodData.color + '20', 'transparent']}
            style={styles.selectedMoodGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.selectedMoodEmoji}>{selectedMoodData.emoji}</Text>
            <View style={styles.selectedMoodInfo}>
              <Text style={[styles.selectedMoodLabel, { color: selectedMoodData.color }]}>
                {selectedMoodData.label}
              </Text>
              <Text style={styles.selectedMoodDescription}>
                {selectedMoodData.description}
              </Text>
            </View>
          </LinearGradient>
        </Animatable.View>
      )}

      {/* Mood grid */}
      <View style={styles.moodGrid}>
        {moodOptions.map((mood, index) => {
          const isSelected = selectedMood === mood.type;
          const animatedScale = animatedValues[mood.type];

          return (
            <Animatable.View
              key={mood.type}
              animation="bounceIn"
              delay={index * 100}
              style={styles.moodItemContainer}
            >
              <TouchableOpacity
                onPress={() => handleMoodPress(mood.type)}
                activeOpacity={0.8}
              >
                <Animated.View
                  style={[
                    styles.moodItem,
                    {
                      backgroundColor: isSelected ? mood.color + '20' : Colors.cardWhite,
                      borderColor: isSelected ? mood.color : Colors.divider,
                      borderWidth: isSelected ? 2 : 1,
                      transform: [{ scale: animatedScale }],
                    },
                  ]}
                >
                  {/* Ripple effect overlay */}
                  {isSelected && (
                    <Animated.View
                      style={[
                        styles.rippleOverlay,
                        {
                          backgroundColor: mood.color,
                          transform: [
                            {
                              scale: rippleAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 2],
                              }),
                            },
                          ],
                          opacity: rippleAnim.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [0, 0.3, 0],
                          }),
                        },
                      ]}
                    />
                  )}

                  <Animatable.Text
                    animation={isSelected ? "pulse" : undefined}
                    iterationCount={isSelected ? "infinite" : 1}
                    style={[
                      styles.moodEmoji,
                      isSelected && { transform: [{ scale: 1.1 }] }
                    ]}
                  >
                    {mood.emoji}
                  </Animatable.Text>
                  
                  <Text
                    style={[
                      styles.moodLabel,
                      {
                        color: isSelected ? mood.color : Colors.textDark,
                        fontWeight: isSelected 
                          ? Theme.typography.weights.semibold 
                          : Theme.typography.weights.regular,
                      },
                    ]}
                  >
                    {mood.label}
                  </Text>

                  {/* Selection indicator */}
                  {isSelected && (
                    <Animatable.View
                      animation="zoomIn"
                      style={[styles.selectionDot, { backgroundColor: mood.color }]}
                    />
                  )}
                </Animated.View>
              </TouchableOpacity>
            </Animatable.View>
          );
        })}
      </View>

      {/* Mood intensity slider (if mood selected) */}
      {selectedMoodData && (
        <Animatable.View
          animation="slideInUp"
          delay={200}
          style={styles.intensityContainer}
        >
          <Text style={styles.intensityLabel}>
            How intense is this feeling?
          </Text>
          <View style={styles.intensitySlider}>
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.intensityDot,
                  {
                    backgroundColor: level <= 3 ? selectedMoodData.color : Colors.divider,
                    transform: [{ scale: level <= 3 ? 1.1 : 1 }],
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.intensityLabels}>
            <Text style={styles.intensityLabelText}>Mild</Text>
            <Text style={styles.intensityLabelText}>Intense</Text>
          </View>
        </Animatable.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Theme.spacing.lg,
  },
  title: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  selectedMoodCard: {
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.lg,
    overflow: 'hidden',
  },
  selectedMoodGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  selectedMoodEmoji: {
    fontSize: 32,
    marginRight: Theme.spacing.md,
  },
  selectedMoodInfo: {
    flex: 1,
  },
  selectedMoodLabel: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    marginBottom: Theme.spacing.xs,
  },
  selectedMoodDescription: {
    fontSize: Theme.typography.sizes.sm,
    color: Colors.textMedium,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Theme.spacing.sm,
  },
  moodItemContainer: {
    width: (width - Theme.spacing.md * 2 - Theme.spacing.sm * 3) / 4,
  },
  moodItem: {
    aspectRatio: 1,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.sm,
    position: 'relative',
    overflow: 'hidden',
    ...Theme.shadows.sm,
  },
  rippleOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: Theme.borderRadius.lg,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: Theme.spacing.xs,
  },
  moodLabel: {
    fontSize: Theme.typography.sizes.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
  selectionDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  intensityContainer: {
    marginTop: Theme.spacing.lg,
    alignItems: 'center',
  },
  intensityLabel: {
    fontSize: Theme.typography.sizes.sm,
    color: Colors.textMedium,
    marginBottom: Theme.spacing.md,
  },
  intensitySlider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  intensityDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  intensityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '70%',
  },
  intensityLabelText: {
    fontSize: Theme.typography.sizes.xs,
    color: Colors.textLight,
  },
});