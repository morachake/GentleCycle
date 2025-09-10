import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { Card } from '@/components/ui';

const { width } = Dimensions.get('window');

interface PregnancyModeProps {
  weeksPregnant: number;
  daysPregnant: number;
  onClose?: () => void;
}

interface PregnancyWeekData {
  week: number;
  babySize: string;
  babyLength: string;
  fruitComparison: string;
  fruitEmoji: string;
  babyEmoji: string;
  milestone: string;
  tips: string[];
}

const pregnancyData: { [key: number]: PregnancyWeekData } = {
  4: {
    week: 4,
    babySize: '2 mm',
    babyLength: '0.08 in',
    fruitComparison: 'poppy seed',
    fruitEmoji: '🌰',
    babyEmoji: '👶🏻',
    milestone: 'Neural tube begins to form',
    tips: ['Take prenatal vitamins', 'Avoid alcohol and smoking', 'Get plenty of rest']
  },
  8: {
    week: 8,
    babySize: '1.6 cm',
    babyLength: '0.63 in',
    fruitComparison: 'kidney bean',
    fruitEmoji: '🫘',
    babyEmoji: '👶🏻',
    milestone: 'Tiny arms and legs are growing',
    tips: ['Morning sickness may begin', 'Stay hydrated', 'Schedule first prenatal appointment']
  },
  12: {
    week: 12,
    babySize: '5.4 cm',
    babyLength: '2.1 in',
    fruitComparison: 'lime',
    fruitEmoji: '🟢',
    babyEmoji: '🤱🏻',
    milestone: 'Can make a fist and suck thumb',
    tips: ['End of first trimester', 'Risk of miscarriage decreases', 'You might start showing']
  },
  20: {
    week: 20,
    babySize: '16.4 cm',
    babyLength: '6.5 in',
    fruitComparison: 'banana',
    fruitEmoji: '🍌',
    babyEmoji: '🤱🏻',
    milestone: 'Can hear sounds and recognize your voice',
    tips: ['Anatomy scan around this time', 'You might feel first movements', 'Time to think about nursery']
  },
  28: {
    week: 28,
    babySize: '35.6 cm',
    babyLength: '14 in',
    fruitComparison: 'eggplant',
    fruitEmoji: '🍆',
    babyEmoji: '👶🏻',
    milestone: 'Eyes can open and close',
    tips: ['Third trimester begins', 'May experience Braxton Hicks', 'Start thinking about birth plan']
  },
  36: {
    week: 36,
    babySize: '47.4 cm',
    babyLength: '18.7 in',
    fruitComparison: 'romaine lettuce',
    fruitEmoji: '🥬',
    babyEmoji: '👶🏻',
    milestone: 'Lungs are nearly fully developed',
    tips: ['Baby is considered full-term soon', 'Pack your hospital bag', 'Practice breathing techniques']
  },
  40: {
    week: 40,
    babySize: '51.2 cm',
    babyLength: '20.2 in',
    fruitComparison: 'watermelon',
    fruitEmoji: '🍉',
    babyEmoji: '👶🏻',
    milestone: 'Ready to meet you!',
    tips: ['Due date arrived!', 'Stay calm and relaxed', 'Trust your body']
  }
};

export const PregnancyMode: React.FC<PregnancyModeProps> = ({
  weeksPregnant,
  daysPregnant,
  onClose,
}) => {
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const heartbeatAnim = useRef(new Animated.Value(1)).current;
  const [showWeeklyTip, setShowWeeklyTip] = useState(true);

  // Get the closest pregnancy data
  const getPregnancyData = (): PregnancyWeekData => {
    const availableWeeks = Object.keys(pregnancyData).map(Number).sort((a, b) => a - b);
    const closestWeek = availableWeeks.reduce((prev, curr) => 
      Math.abs(curr - weeksPregnant) < Math.abs(prev - weeksPregnant) ? curr : prev
    );
    return pregnancyData[closestWeek];
  };

  const currentData = getPregnancyData();

  useEffect(() => {
    // Baby bounce animation
    const bounce = () => {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(bounce, 2000);
      });
    };

    // Heartbeat animation
    const heartbeat = () => {
      Animated.sequence([
        Animated.timing(heartbeatAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(heartbeatAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(heartbeatAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(heartbeatAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(heartbeat, 2000);
      });
    };

    const bounceTimer = setTimeout(bounce, 500);
    const heartbeatTimer = setTimeout(heartbeat, 1000);

    return () => {
      clearTimeout(bounceTimer);
      clearTimeout(heartbeatTimer);
    };
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with gradient */}
      <LinearGradient
        colors={['#FFE5F1', '#FFF0F8', '#FFFFFF']}
        style={styles.headerGradient}
        locations={[0, 0.6, 1]}
      >
        <View style={styles.headerContent}>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          )}
          
          <Animatable.Text animation="fadeInDown" style={styles.congratsText}>
            Congratulations! 🎉
          </Animatable.Text>
          
          <Animatable.Text animation="fadeInUp" delay={200} style={styles.weeksText}>
            {weeksPregnant} weeks, {daysPregnant} days
          </Animatable.Text>
        </View>

        {/* Baby illustration */}
        <Animated.View
          style={[
            styles.babyContainer,
            { transform: [{ scale: bounceAnim }] }
          ]}
        >
          <LinearGradient
            colors={['#FFE5F1', '#FFF0F8']}
            style={styles.babyBackground}
          >
            <Text style={styles.babyEmoji}>{currentData.babyEmoji}</Text>
          </LinearGradient>
        </Animated.View>
      </LinearGradient>

      {/* Size comparison */}
      <Card style={styles.sizeCard}>
        <Animatable.View animation="fadeInUp" delay={400}>
          <View style={styles.sizeHeader}>
            <Text style={styles.sizeTitle}>Your baby is about the size of</Text>
            <Animated.Text
              style={[
                styles.fruitEmoji,
                { transform: [{ scale: heartbeatAnim }] }
              ]}
            >
              {currentData.fruitEmoji}
            </Animated.Text>
          </View>
          
          <Text style={styles.fruitComparison}>
            {currentData.fruitComparison}
          </Text>
          
          <View style={styles.measurementsContainer}>
            <View style={styles.measurement}>
              <Text style={styles.measurementLabel}>Length</Text>
              <Text style={styles.measurementValue}>{currentData.babyLength}</Text>
            </View>
            <View style={styles.measurementDivider} />
            <View style={styles.measurement}>
              <Text style={styles.measurementLabel}>Size</Text>
              <Text style={styles.measurementValue}>{currentData.babySize}</Text>
            </View>
          </View>
        </Animatable.View>
      </Card>

      {/* Milestone */}
      <Card style={styles.milestoneCard}>
        <Animatable.View animation="fadeInUp" delay={600}>
          <Text style={styles.milestoneTitle}>🌟 This week's milestone</Text>
          <Text style={styles.milestoneText}>{currentData.milestone}</Text>
        </Animatable.View>
      </Card>

      {/* Weekly tips */}
      {showWeeklyTip && (
        <Card style={styles.tipsCard}>
          <Animatable.View animation="fadeInUp" delay={800}>
            <View style={styles.tipsHeader}>
              <Text style={styles.tipsTitle}>💡 Tips for week {weeksPregnant}</Text>
              <TouchableOpacity 
                onPress={() => setShowWeeklyTip(false)}
                style={styles.dismissButton}
              >
                <Text style={styles.dismissButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            {currentData.tips.map((tip, index) => (
              <Animatable.View
                key={index}
                animation="fadeInLeft"
                delay={1000 + index * 100}
                style={styles.tipItem}
              >
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </Animatable.View>
            ))}
          </Animatable.View>
        </Card>
      )}

      {/* Progress visualization */}
      <Card style={styles.progressCard}>
        <Animatable.View animation="fadeInUp" delay={1000}>
          <Text style={styles.progressTitle}>Pregnancy Progress</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animatable.View
                animation="slideInLeft"
                delay={1200}
                duration={1500}
                style={[
                  styles.progressFill,
                  { width: `${(weeksPregnant / 40) * 100}%` }
                ]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>Conception</Text>
              <Text style={styles.progressLabel}>Due Date</Text>
            </View>
            <Text style={styles.progressText}>
              {Math.round((weeksPregnant / 40) * 100)}% Complete
            </Text>
          </View>
        </Animatable.View>
      </Card>

      {/* Fun facts */}
      <Card style={styles.factsCard}>
        <Animatable.View animation="fadeInUp" delay={1200}>
          <Text style={styles.factsTitle}>🎈 Fun Facts</Text>
          <View style={styles.factsList}>
            <Text style={styles.factItem}>
              💓 Your baby's heart beats 2x faster than yours
            </Text>
            <Text style={styles.factItem}>
              👂 Baby can hear your voice and recognize it
            </Text>
            <Text style={styles.factItem}>
              💭 Dreams are more vivid during pregnancy
            </Text>
          </View>
        </Animatable.View>
      </Card>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: -40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardWhite,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.sm,
  },
  closeButtonText: {
    fontSize: 24,
    color: Colors.textMedium,
    fontWeight: Theme.typography.weights.bold,
  },
  congratsText: {
    fontSize: Theme.typography.sizes.xxl,
    fontWeight: Theme.typography.weights.bold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  weeksText: {
    fontSize: Theme.typography.sizes.lg,
    color: Colors.textMedium,
    textAlign: 'center',
  },
  babyContainer: {
    marginTop: Theme.spacing.xl,
    alignItems: 'center',
  },
  babyBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.md,
  },
  babyEmoji: {
    fontSize: 60,
  },
  sizeCard: {
    margin: Theme.spacing.md,
  },
  sizeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
  },
  sizeTitle: {
    fontSize: Theme.typography.sizes.md,
    color: Colors.textMedium,
    marginRight: Theme.spacing.sm,
  },
  fruitEmoji: {
    fontSize: 32,
  },
  fruitComparison: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
    textTransform: 'capitalize',
  },
  measurementsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  measurement: {
    alignItems: 'center',
    flex: 1,
  },
  measurementDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.divider,
    marginHorizontal: Theme.spacing.lg,
  },
  measurementLabel: {
    fontSize: Theme.typography.sizes.sm,
    color: Colors.textMedium,
    marginBottom: Theme.spacing.xs,
  },
  measurementValue: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
    color: Colors.textDark,
  },
  milestoneCard: {
    margin: Theme.spacing.md,
    backgroundColor: Colors.success + '10',
  },
  milestoneTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.semibold,
    color: Colors.textDark,
    marginBottom: Theme.spacing.sm,
  },
  milestoneText: {
    fontSize: Theme.typography.sizes.md,
    color: Colors.textMedium,
    lineHeight: 22,
  },
  tipsCard: {
    margin: Theme.spacing.md,
    backgroundColor: Colors.info + '10',
  },
  tipsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  tipsTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.semibold,
    color: Colors.textDark,
  },
  dismissButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.textLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissButtonText: {
    fontSize: 16,
    color: Colors.cardWhite,
    fontWeight: Theme.typography.weights.bold,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.sm,
  },
  tipBullet: {
    fontSize: Theme.typography.sizes.md,
    color: Colors.info,
    marginRight: Theme.spacing.sm,
    marginTop: 2,
  },
  tipText: {
    fontSize: Theme.typography.sizes.sm,
    color: Colors.textMedium,
    flex: 1,
    lineHeight: 20,
  },
  progressCard: {
    margin: Theme.spacing.md,
  },
  progressTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.semibold,
    color: Colors.textDark,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.divider,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Theme.spacing.sm,
  },
  progressLabel: {
    fontSize: Theme.typography.sizes.xs,
    color: Colors.textLight,
  },
  progressText: {
    fontSize: Theme.typography.sizes.sm,
    color: Colors.primary,
    fontWeight: Theme.typography.weights.semibold,
  },
  factsCard: {
    margin: Theme.spacing.md,
    backgroundColor: Colors.primarySoft,
  },
  factsTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.semibold,
    color: Colors.textDark,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  factsList: {
    gap: Theme.spacing.sm,
  },
  factItem: {
    fontSize: Theme.typography.sizes.sm,
    color: Colors.textMedium,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100,
  },
});