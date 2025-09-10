import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { PregnancyRisk, PregnancyRiskData } from '@/types';
import { PregnancyRiskCalculator } from '@/lib/utils/pregnancyRisk';

const { width } = Dimensions.get('window');

interface PregnancyRiskIndicatorProps {
  riskData: PregnancyRiskData;
  showAnimation?: boolean;
  compact?: boolean;
}

export const PregnancyRiskIndicator: React.FC<PregnancyRiskIndicatorProps> = ({
  riskData,
  showAnimation = true,
  compact = false,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const babyBounceAnim = useRef(new Animated.Value(1)).current;

  const riskColor = PregnancyRiskCalculator.getRiskColor(riskData.risk);
  const riskEmoji = PregnancyRiskCalculator.getRiskEmoji(riskData.risk);
  const babyEmoji = PregnancyRiskCalculator.getBabyEmoji(riskData.risk);

  useEffect(() => {
    if (showAnimation) {
      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: riskData.percentage / 100,
        duration: 1500,
        useNativeDriver: false,
      }).start();

      // Pulsing animation for high risk
      if (riskData.risk === PregnancyRisk.HIGH || riskData.risk === PregnancyRisk.VERY_HIGH) {
        const pulse = () => {
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]).start(() => pulse());
        };
        pulse();

        // Baby bounce animation
        if (babyEmoji) {
          const bounce = () => {
            Animated.sequence([
              Animated.timing(babyBounceAnim, {
                toValue: 1.3,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(babyBounceAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
            ]).start(() => {
              setTimeout(bounce, 2000); // Pause between bounces
            });
          };
          setTimeout(bounce, 1000);
        }
      }
    }
  }, [riskData.risk, showAnimation]);

  const getRiskTitle = () => {
    switch (riskData.risk) {
      case PregnancyRisk.VERY_LOW:
        return 'Very Low Risk';
      case PregnancyRisk.LOW:
        return 'Low Risk';
      case PregnancyRisk.MEDIUM:
        return 'Medium Risk';
      case PregnancyRisk.HIGH:
        return 'High Risk';
      case PregnancyRisk.VERY_HIGH:
        return 'Peak Fertility';
      default:
        return 'Unknown';
    }
  };

  const getGradientColors = () => {
    switch (riskData.risk) {
      case PregnancyRisk.VERY_LOW:
        return ['#E8F5E8', '#C8E6C9'];
      case PregnancyRisk.LOW:
        return ['#E3F2FD', '#BBDEFB'];
      case PregnancyRisk.MEDIUM:
        return ['#FFF3E0', '#FFCC80'];
      case PregnancyRisk.HIGH:
        return ['#FFEBEE', '#FFAB91'];
      case PregnancyRisk.VERY_HIGH:
        return ['#FFEBEE', '#EF9A9A'];
      default:
        return ['#F5F5F5', '#E0E0E0'];
    }
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactEmoji}>{riskEmoji}</Text>
        <Text style={[styles.compactRisk, { color: riskColor }]}>
          {riskData.percentage}%
        </Text>
        {babyEmoji && (
          <Animated.Text
            style={[
              styles.babyEmojiCompact,
              { transform: [{ scale: babyBounceAnim }] }
            ]}
          >
            {babyEmoji}
          </Animated.Text>
        )}
      </View>
    );
  }

  return (
    <Animatable.View
      animation={showAnimation ? "fadeInUp" : undefined}
      duration={800}
      style={styles.container}
    >
      <LinearGradient
        colors={getGradientColors()}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View
          style={[
            styles.content,
            riskData.risk === PregnancyRisk.VERY_HIGH && {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={[styles.riskEmoji]}>{riskEmoji}</Text>
              <View>
                <Text style={[styles.riskTitle, { color: riskColor }]}>
                  {getRiskTitle()}
                </Text>
                <Text style={styles.percentageText}>
                  {riskData.percentage}% chance
                </Text>
              </View>
            </View>
            
            {babyEmoji && (
              <Animated.Text
                style={[
                  styles.babyEmoji,
                  { transform: [{ scale: babyBounceAnim }] }
                ]}
              >
                {babyEmoji}
              </Animated.Text>
            )}
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Pregnancy Chance</Text>
            <View style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: riskColor,
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabelText}>0%</Text>
              <Text style={styles.progressLabelText}>100%</Text>
            </View>
          </View>

          {/* Message */}
          <Text style={styles.message}>{riskData.message}</Text>

          {/* Tips */}
          {riskData.tips.length > 0 && (
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>💡 Tips:</Text>
              {riskData.tips.slice(0, 2).map((tip, index) => (
                <Text key={index} style={styles.tipText}>
                  • {tip}
                </Text>
              ))}
            </View>
          )}

          {/* Special high-risk message */}
          {(riskData.risk === PregnancyRisk.HIGH || riskData.risk === PregnancyRisk.VERY_HIGH) && (
            <Animatable.View
              animation="pulse"
              iterationCount="infinite"
              style={[styles.specialMessage, { borderColor: riskColor }]}
            >
              <Text style={styles.specialMessageIcon}>🌟</Text>
              <Text style={[styles.specialMessageText, { color: riskColor }]}>
                {riskData.risk === PregnancyRisk.VERY_HIGH 
                  ? "Perfect time if trying to conceive!" 
                  : "High fertility window - plan accordingly"}
              </Text>
            </Animatable.View>
          )}
        </Animated.View>
      </LinearGradient>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Theme.spacing.sm,
  },
  gradient: {
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
  },
  content: {
    alignItems: 'stretch',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  riskEmoji: {
    fontSize: 24,
    marginRight: Theme.spacing.sm,
  },
  riskTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    marginBottom: Theme.spacing.xs,
  },
  percentageText: {
    fontSize: Theme.typography.sizes.sm,
    color: Colors.textMedium,
  },
  babyEmoji: {
    fontSize: 32,
  },
  progressContainer: {
    marginBottom: Theme.spacing.md,
  },
  progressLabel: {
    fontSize: Theme.typography.sizes.sm,
    color: Colors.textMedium,
    marginBottom: Theme.spacing.xs,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: Colors.cardWhite,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Theme.spacing.xs,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabelText: {
    fontSize: Theme.typography.sizes.xs,
    color: Colors.textLight,
  },
  message: {
    fontSize: Theme.typography.sizes.md,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
    fontWeight: Theme.typography.weights.medium,
  },
  tipsContainer: {
    marginTop: Theme.spacing.sm,
  },
  tipsTitle: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.semibold,
    color: Colors.textDark,
    marginBottom: Theme.spacing.xs,
  },
  tipText: {
    fontSize: Theme.typography.sizes.sm,
    color: Colors.textMedium,
    marginBottom: Theme.spacing.xs,
    paddingLeft: Theme.spacing.sm,
  },
  specialMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardWhite,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 2,
    marginTop: Theme.spacing.sm,
  },
  specialMessageIcon: {
    fontSize: 20,
    marginRight: Theme.spacing.sm,
  },
  specialMessageText: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.semibold,
    flex: 1,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Colors.cardWhite,
  },
  compactEmoji: {
    fontSize: 16,
    marginRight: Theme.spacing.xs,
  },
  compactRisk: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.semibold,
  },
  babyEmojiCompact: {
    fontSize: 14,
    marginLeft: Theme.spacing.xs,
  },
});