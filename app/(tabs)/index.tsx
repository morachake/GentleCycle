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
import { cycleDataService } from '@/lib/services/CycleDataService';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

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
  
  const [isLoading, setIsLoading] = useState(true);
  const [cycleData, setCycleData] = useState<CycleData>({
    currentDay: 1,
    phase: CyclePhase.FOLLICULAR,
    daysUntilNextPeriod: 28,
    averageCycleLength: 28,
    currentStreak: 0,
  });
  const [todayFlow, setTodayFlow] = useState<FlowIntensity>(FlowIntensity.NONE);
  const [todaysEntry, setTodaysEntry] = useState<any>(null);
  const [stats, setStats] = useState({
    totalCycles: 0,
    averageCycleLength: 28,
    averagePeriodLength: 5,
    regularityScore: 0,
  });

  // Load real user data on mount and when screen comes into focus
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Reload data when user navigates back to this screen
  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's entry
      const dailyEntry = await cycleDataService.getDailyEntry(today);
      console.log('Today\'s entry loaded:', dailyEntry);
      console.log('Symptoms count:', dailyEntry?.symptoms?.length || 0);
      setTodaysEntry(dailyEntry);
      
      // Get today's flow data
      const todaysFlow = await cycleDataService.getFlowForDate(today);
      setTodayFlow(todaysFlow);
      
      // Get cycle statistics
      const cycleStats = await cycleDataService.getCycleStatistics();
      setStats(cycleStats);
      
      // Get all periods to calculate current cycle day
      const periods = await cycleDataService.getAllPeriods();
      
      // Filter out any future periods (likely test/invalid data)
      const validPeriods = periods.filter(period => {
        const periodDate = new Date(period.startDate);
        const today = new Date();
        return periodDate <= today;
      });
      
      console.log('Period data loaded:', {
        totalPeriods: periods.length,
        validPeriods: validPeriods.length,
        futurePeriods: periods.length - validPeriods.length
      });
      
      if (validPeriods.length > 0) {
        try {
          // Try to get predictions, but handle gracefully if no data
          const predictions = await cycleDataService.calculatePredictions();
          
          // Find the most recent period
          const recentPeriods = validPeriods.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
          const lastPeriod = recentPeriods[0];
          
          console.log('Dashboard cycle calculation:', {
            today,
            lastPeriodDate: lastPeriod.startDate,
            totalPeriods: periods.length
          });
          
          // Calculate current cycle day
          const lastPeriodDate = new Date(lastPeriod.startDate);
          const todayDate = new Date(today);
          const daysDiff = Math.floor((todayDate.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Ensure cycle day is always positive and reasonable
          let currentCycleDay = Math.max(1, daysDiff + 1);
          
          // If the last period is in the future or cycle day is unreasonably high, handle gracefully
          if (daysDiff < 0) {
            console.warn('Last period date is in the future, using cycle day 1');
            currentCycleDay = 1;
          } else if (currentCycleDay > 60) {
            // If it's been more than 60 days, likely need a new cycle
            console.warn('Cycle day is very high, possible missed period tracking');
            currentCycleDay = Math.min(currentCycleDay, 60);
          }
          
          console.log('Calculated cycle day:', {
            daysDiff,
            currentCycleDay,
            lastPeriodDate: lastPeriod.startDate,
            today
          });
          
          // Calculate days until next period
          const daysUntilNext = Math.max(0, cycleStats.averageCycleLength - currentCycleDay + 1);
          
          // Determine current phase
          const currentPhase = await cycleDataService.getCurrentCyclePhase(today);
          
          setCycleData({
            currentDay: currentCycleDay,
            phase: currentPhase,
            daysUntilNextPeriod: daysUntilNext,
            averageCycleLength: cycleStats.averageCycleLength,
            currentStreak: validPeriods.length,
          });
        } catch (predictionError) {
          console.log('Using basic cycle calculation due to limited data');
          // Use basic calculation if predictions fail
          const recentPeriods = validPeriods.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
          const lastPeriod = recentPeriods[0];
          
          const lastPeriodDate = new Date(lastPeriod.startDate);
          const todayDate = new Date(today);
          const daysDiff = Math.floor((todayDate.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Ensure cycle day is always positive and reasonable
          let currentCycleDay = Math.max(1, daysDiff + 1);
          
          // If the last period is in the future or cycle day is unreasonably high, handle gracefully
          if (daysDiff < 0) {
            console.warn('Last period date is in the future, using cycle day 1');
            currentCycleDay = 1;
          } else if (currentCycleDay > 60) {
            console.warn('Cycle day is very high, possible missed period tracking');
            currentCycleDay = Math.min(currentCycleDay, 60);
          }
          
          setCycleData({
            currentDay: currentCycleDay,
            phase: CyclePhase.FOLLICULAR,
            daysUntilNextPeriod: Math.max(0, 28 - currentCycleDay + 1),
            averageCycleLength: cycleStats.averageCycleLength || 28,
            currentStreak: validPeriods.length,
          });
        }
      } else {
        // No period data at all - use defaults
        setCycleData({
          currentDay: 1,
          phase: CyclePhase.FOLLICULAR,
          daysUntilNextPeriod: 28,
          averageCycleLength: 28,
          currentStreak: 0,
        });
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set safe defaults
      setCycleData({
        currentDay: 1,
        phase: CyclePhase.FOLLICULAR,
        daysUntilNextPeriod: 28,
        averageCycleLength: 28,
        currentStreak: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  // Helper function for dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    { title: 'Log Period', emoji: '🩸', action: () => setShowPeriodModal(true) },
    { title: 'Add Symptoms', emoji: '🤕', action: () => router.push('/symptoms') },
    { title: 'View Calendar', emoji: '📅', action: () => router.push('/calendar') },
    { title: 'See Analytics', emoji: '📊', action: () => router.push('/analytics') },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.text }]}>
            {getGreeting()} 👋
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
              {todaysEntry?.symptoms && todaysEntry.symptoms.length > 0 
                ? `${todaysEntry.symptoms.length} symptom${todaysEntry.symptoms.length > 1 ? 's' : ''}`
                : 'Not logged'
              }
            </Text>
          </View>
          
          <View style={styles.trackingItem}>
            <Text style={[styles.trackingLabel, { color: Colors.textMedium }]}>
              Mood:
            </Text>
            <Text style={[styles.trackingValue, { color: colors.text }]}>
              {todaysEntry?.mood 
                ? todaysEntry.mood.charAt(0).toUpperCase() + todaysEntry.mood.slice(1)
                : 'Not logged'
              }
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
                {stats.averagePeriodLength}
              </Text>
              <Text style={[styles.statLabel, { color: Colors.textMedium }]}>
                Avg Period Length
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.totalCycles}
              </Text>
              <Text style={[styles.statLabel, { color: Colors.textMedium }]}>
                Total Cycles
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
    fontSize: 20,
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
