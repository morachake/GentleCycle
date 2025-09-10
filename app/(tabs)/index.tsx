import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Card, Button, Badge } from '@/components/ui';
import { FlowIntensity, CyclePhase } from '@/types';
import { PregnancyRiskIndicator } from '@/components/pregnancy/PregnancyRiskIndicator';
import { PregnancyRiskCalculator } from '@/lib/utils/pregnancyRisk';
import { PeriodLogModal } from '@/components/modals/PeriodLogModal';
import { OvulationModal } from '@/components/modals/OvulationModal';

const { width } = Dimensions.get('window');

interface CycleData {
  currentDay: number;
  phase: CyclePhase;
  daysUntilNextPeriod: number;
  averageCycleLength: number;
  currentStreak: number;
}

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [cycleData, setCycleData] = useState<CycleData>({
    currentDay: 14,
    phase: CyclePhase.FOLLICULAR,
    daysUntilNextPeriod: 14,
    averageCycleLength: 28,
    currentStreak: 5,
  });

  const [todayFlow, setTodayFlow] = useState<FlowIntensity>(FlowIntensity.NONE);

  // Calculate pregnancy risk for today
  const pregnancyRiskData = PregnancyRiskCalculator.calculateRisk(
    cycleData.currentDay,
    cycleData.averageCycleLength
  );

  // Get phase info with enhanced descriptions
  const phaseData = PregnancyRiskCalculator.getPhaseDescription(
    cycleData.currentDay,
    cycleData.averageCycleLength
  );

  const getPhaseInfo = (phase: CyclePhase) => {
    switch (phase) {
      case CyclePhase.MENSTRUAL:
        return { emoji: '🔴', color: Colors.calendarRed, message: 'Your period is here' };
      case CyclePhase.FOLLICULAR:
        return { emoji: '🌱', color: Colors.success, message: 'Recovery phase' };
      case CyclePhase.OVULATION:
        return { emoji: '🥚', color: Colors.ovulationOrange, message: 'Fertility window' };
      case CyclePhase.LUTEAL:
        return { emoji: '🌙', color: Colors.pmsLavender, message: 'Pre-menstrual phase' };
      default:
        return { emoji: '📅', color: Colors.primary, message: 'Tracking your cycle' };
    }
  };

  const phaseInfo = getPhaseInfo(cycleData.phase);

  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showOvulationModal, setShowOvulationModal] = useState(false);

  const quickActions = [
    { title: 'Log Period', emoji: '🩸', action: () => setShowPeriodModal(true) },
    { title: 'Add Ovulation', emoji: '🥚', action: () => setShowOvulationModal(true) },
    { title: 'Add Symptoms', emoji: '🤕', action: () => console.log('Add symptoms') },
    { title: 'Mood Check', emoji: '😊', action: () => console.log('Mood check') },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.text }]}>
            Good morning! 👋
          </Text>
          <Text style={[styles.date, { color: Colors.textMedium }]}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        {/* Cycle Overview Card with Gradient */}
        <Animatable.View animation="fadeInUp" duration={800} delay={200}>
          <LinearGradient
            colors={[Colors.primarySoft, Colors.cardWhite]}
            style={styles.cycleCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cycleHeader}>
              <View style={styles.cycleDay}>
                <Animatable.Text 
                  animation="bounceIn" 
                  delay={400}
                  style={[styles.cycleDayNumber, { color: colors.text }]}
                >
                  Day {cycleData.currentDay}
                </Animatable.Text>
                <Text style={[styles.cycleDayLabel, { color: Colors.textMedium }]}>
                  of your cycle
                </Text>
              </View>
              <View style={styles.phaseIndicator}>
                <Animatable.Text 
                  animation="bounceIn" 
                  delay={600}
                  style={styles.phaseEmoji}
                >
                  {phaseData.emoji}
                </Animatable.Text>
                <Badge 
                  text={cycleData.phase.toUpperCase()} 
                  variant="secondary"
                  style={{ backgroundColor: phaseInfo.color + '20' }}
                  textStyle={{ color: phaseInfo.color }}
                />
              </View>
            </View>

            <Text style={[styles.phaseMessage, { color: Colors.textMedium }]}>
              {phaseData.description}
            </Text>

            {cycleData.daysUntilNextPeriod > 0 && (
              <Animatable.View 
                animation="fadeInUp" 
                delay={800}
                style={styles.nextPeriodContainer}
              >
                <Text style={[styles.nextPeriodText, { color: colors.text }]}>
                  Next period in{' '}
                  <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>
                    {cycleData.daysUntilNextPeriod} days
                  </Text>
                </Text>
              </Animatable.View>
            )}
          </LinearGradient>
        </Animatable.View>

        {/* Pregnancy Risk Indicator */}
        <PregnancyRiskIndicator 
          riskData={pregnancyRiskData}
          showAnimation={true}
        />

        {/* Today's Tracking Card */}
        <Card style={styles.trackingCard}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Today's Tracking
          </Text>
          
          <View style={styles.trackingItem}>
            <Text style={[styles.trackingLabel, { color: Colors.textMedium }]}>
              Flow:
            </Text>
            <Text style={[styles.trackingValue, { color: colors.text }]}>
              {todayFlow === FlowIntensity.NONE ? 'None' : todayFlow.charAt(0).toUpperCase() + todayFlow.slice(1)}
            </Text>
          </View>
          
          <View style={styles.trackingItem}>
            <Text style={[styles.trackingLabel, { color: Colors.textMedium }]}>
              Symptoms:
            </Text>
            <Text style={[styles.trackingValue, { color: colors.text }]}>
              Not logged
            </Text>
          </View>
          
          <View style={styles.trackingItem}>
            <Text style={[styles.trackingLabel, { color: Colors.textMedium }]}>
              Mood:
            </Text>
            <Text style={[styles.trackingValue, { color: colors.text }]}>
              Not logged
            </Text>
          </View>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={action.action}
              >
                <Text style={styles.actionEmoji}>{action.emoji}</Text>
                <Text style={[styles.actionTitle, { color: colors.text }]}>
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Cycle Stats */}
        <Card style={styles.statsCard}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Cycle Stats
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {cycleData.averageCycleLength}
              </Text>
              <Text style={[styles.statLabel, { color: Colors.textMedium }]}>
                Avg Cycle Length
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {cycleData.currentStreak}
              </Text>
              <Text style={[styles.statLabel, { color: Colors.textMedium }]}>
                Days Tracked
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                96%
              </Text>
              <Text style={[styles.statLabel, { color: Colors.textMedium }]}>
                Accuracy
              </Text>
            </View>
          </View>
        </Card>

        {/* Bottom padding for tab bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Modals */}
      <PeriodLogModal
        isVisible={showPeriodModal}
        onClose={() => setShowPeriodModal(false)}
        mode="start"
        onSave={(data) => {
          console.log('Period logged:', data);
          // Refresh cycle data
        }}
      />

      <OvulationModal
        isVisible={showOvulationModal}
        onClose={() => setShowOvulationModal(false)}
        mode="add"
        onSave={(date) => {
          console.log('Ovulation logged:', date);
          // Refresh cycle data
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Theme.spacing.md,
  },
  header: {
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  greeting: {
    fontSize: Theme.typography.sizes.xxl,
    fontWeight: Theme.typography.weights.bold,
    marginBottom: Theme.spacing.xs,
  },
  date: {
    fontSize: Theme.typography.sizes.md,
  },
  cycleCard: {
    marginBottom: Theme.spacing.lg,
  },
  cycleCardGradient: {
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    ...Theme.shadows.sm,
  },
  cycleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.md,
  },
  cycleDay: {
    flex: 1,
  },
  cycleDayNumber: {
    fontSize: Theme.typography.sizes.xxxl,
    fontWeight: Theme.typography.weights.bold,
    marginBottom: Theme.spacing.xs,
  },
  cycleDayLabel: {
    fontSize: Theme.typography.sizes.sm,
  },
  phaseIndicator: {
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  phaseEmoji: {
    fontSize: 32,
  },
  phaseMessage: {
    fontSize: Theme.typography.sizes.md,
    marginBottom: Theme.spacing.md,
  },
  nextPeriodContainer: {
    padding: Theme.spacing.md,
    backgroundColor: Colors.primarySoft,
    borderRadius: Theme.borderRadius.md,
  },
  nextPeriodText: {
    fontSize: Theme.typography.sizes.sm,
    textAlign: 'center',
  },
  trackingCard: {
    marginBottom: Theme.spacing.lg,
  },
  cardTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
    marginBottom: Theme.spacing.md,
  },
  trackingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
  },
  trackingLabel: {
    fontSize: Theme.typography.sizes.md,
  },
  trackingValue: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.medium,
  },
  actionsCard: {
    marginBottom: Theme.spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width - Theme.spacing.md * 2 - Theme.spacing.lg * 2 - Theme.spacing.md) / 2,
    aspectRatio: 1.2,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.sm,
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: Theme.spacing.xs,
  },
  actionTitle: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
    textAlign: 'center',
  },
  statsCard: {
    marginBottom: Theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
    marginBottom: Theme.spacing.xs,
  },
  statLabel: {
    fontSize: Theme.typography.sizes.xs,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 100,
  },
});
