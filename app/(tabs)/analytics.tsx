import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Card, Badge } from '@/components/ui';
import { cycleDataService } from '@/lib/services/CycleDataService';
import { SymptomType } from '@/types';

const { width } = Dimensions.get('window');
const chartWidth = width - (Theme.spacing.md * 2) - (Theme.spacing.lg * 2);

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // State for real user data
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    averageCycleLength: 28,
    averagePeriodLength: 5,
    totalCycles: 0,
    regularityScore: 0,
  });
  const [cycleLengthData, setCycleLengthData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [28, 28, 28, 28, 28, 28],
      color: () => Colors.primary,
      strokeWidth: 3,
    }],
  });
  const [symptomFrequencyData, setSymptomFrequencyData] = useState<{
    name: string;
    population: number;
    color: string;
    legendFontColor: string;
  }[]>([]);
  const [moodTrendData, setMoodTrendData] = useState({
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      data: [3, 3, 3, 3],
      color: () => Colors.primary,
      strokeWidth: 2,
    }],
  });
  const [insights, setInsights] = useState<{
    title: string;
    value: string;
    description: string;
    color: string;
  }[]>([]);

  // Load user data on component mount
  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Load all analytics data in parallel
      const [cycleStats, cycleChartData, symptomData, moodData, insightData] = await Promise.all([
        cycleDataService.getCycleStatistics(),
        cycleDataService.getCycleLengthTrendData(),
        cycleDataService.getSymptomAnalytics(),
        cycleDataService.getMoodTrendData(),
        cycleDataService.getPersonalizedInsights(),
      ]);
      
      setStats({
        averageCycleLength: cycleStats.averageCycleLength,
        averagePeriodLength: cycleStats.averagePeriodLength,
        totalCycles: cycleStats.totalCycles,
        regularityScore: cycleStats.regularityScore,
      });
      
      setCycleLengthData(cycleChartData);
      setSymptomFrequencyData(symptomData);
      setMoodTrendData(moodData);
      setInsights(insightData);
      
    } catch (error) {
      console.error('Error loading analytics data:', error);
      // Keep default values if error occurs
    } finally {
      setIsLoading(false);
    }
  };

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => Colors.primary + Math.round(opacity * 255).toString(16).padStart(2, '0'),
    labelColor: () => colors.text,
    style: {
      borderRadius: Theme.borderRadius.md,
    },
    propsForLabels: {
      fontSize: Theme.typography.sizes.sm,
    },
  };

  // Show loading indicator
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading your analytics...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Analytics & Insights
          </Text>
          <Text style={[styles.subtitle, { color: Colors.textMedium }]}>
            {stats.totalCycles > 0 
              ? `Based on ${stats.totalCycles} tracked cycles`
              : 'Start tracking to see insights'
            }
          </Text>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsOverview}>
          <View style={styles.statsRow}>
            <Card style={StyleSheet.flatten([styles.statCard, { backgroundColor: Colors.primary + '15' }])}>
              <View style={styles.statContent}>
                <Text style={[styles.statValue, { color: Colors.primary }]}>
                  {stats.averageCycleLength}
                </Text>
                <Text style={[styles.statLabel, { color: Colors.textMedium }]}>
                  Avg Cycle
                </Text>
              </View>
            </Card>
            <Card style={StyleSheet.flatten([styles.statCard, { backgroundColor: Colors.calendarRed + '15' }])}>
              <View style={styles.statContent}>
                <Text style={[styles.statValue, { color: Colors.calendarRed }]}>
                  {stats.averagePeriodLength}
                </Text>
                <Text style={[styles.statLabel, { color: Colors.textMedium }]}>
                  Avg Period
                </Text>
              </View>
            </Card>
          </View>
          <Card style={StyleSheet.flatten([styles.regularityCard, { backgroundColor: Colors.success + '15' }])}>
            <View style={styles.regularityContent}>
              <View style={styles.regularityHeader}>
                <Text style={[styles.regularityValue, { color: Colors.success }]}>
                  {stats.regularityScore}%
                </Text>
                <Text style={[styles.regularityLabel, { color: colors.text }]}>
                  Cycle Regularity
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${stats.regularityScore}%`, backgroundColor: Colors.success }]} />
              </View>
            </View>
          </Card>
        </View>

        {/* Cycle Length Trend */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Cycle Length Trend
            </Text>
            <Badge 
              text="6 months" 
              variant="secondary"
              style={{ backgroundColor: Colors.primary + '15' }}
              textStyle={{ color: Colors.primary, fontSize: Theme.typography.sizes.xs }}
            />
          </View>
          <View style={styles.compactChartContainer}>
            <LineChart
              data={cycleLengthData}
              width={chartWidth}
              height={160}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={false}
            />
          </View>
        </Card>

        {/* Symptoms Overview */}
        <View style={styles.symptomsSection}>
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Top Symptoms
              </Text>
              <Badge 
                text="This month" 
                variant="secondary"
                style={{ backgroundColor: Colors.warning + '15' }}
                textStyle={{ color: Colors.warning, fontSize: Theme.typography.sizes.xs }}
              />
            </View>
            <View style={styles.symptomsGrid}>
              {symptomFrequencyData.length > 0 ? (
                symptomFrequencyData.slice(0, 3).map((symptom, index) => (
                  <View key={index} style={[styles.symptomCard, { borderLeftColor: symptom.color }]}>
                    <Text style={[styles.symptomName, { color: colors.text }]}>
                      {symptom.name}
                    </Text>
                    <Text style={[styles.symptomCount, { color: symptom.color }]}>
                      {symptom.population} days
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={[styles.noDataText, { color: Colors.textMedium }]}>
                    💭 No symptoms tracked yet
                  </Text>
                  <Text style={[styles.noDataSubtext, { color: Colors.textLight }]}>
                    Start logging daily symptoms to see insights
                  </Text>
                </View>
              )}
            </View>
          </Card>
        </View>

        {/* Mood & Insights Row */}
        <View style={styles.insightsRow}>
          <Card style={styles.moodCard}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Mood Trend
            </Text>
            <View style={styles.moodIndicators}>
              {moodTrendData.datasets[0].data.map((mood, index) => (
                <View key={index} style={styles.moodWeek}>
                  <View style={[styles.moodBar, { height: mood * 15, backgroundColor: Colors.primary }]} />
                  <Text style={[styles.weekLabel, { color: Colors.textMedium }]}>
                    W{index + 1}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
          
          <Card style={styles.quickInsightCard}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Quick Insights
            </Text>
            <View style={styles.quickInsights}>
              <View style={styles.insightRow}>
                <Text style={[styles.insightEmoji]}>🎯</Text>
                <Text style={[styles.insightText, { color: Colors.textMedium }]}>
                  Very regular
                </Text>
              </View>
              <View style={styles.insightRow}>
                <Text style={[styles.insightEmoji]}>😊</Text>
                <Text style={[styles.insightText, { color: Colors.textMedium }]}>
                  Good mood avg
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Detailed Insights */}
        <Card style={styles.detailedInsightsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Health Insights
          </Text>
          <View style={styles.compactInsightsGrid}>
            {insights.map((insight, index) => (
              <View key={index} style={[styles.compactInsightItem, { borderColor: insight.color + '30' }]}>
                <View style={[styles.insightColorBar, { backgroundColor: insight.color }]} />
                <Text style={[styles.compactInsightTitle, { color: colors.text }]}>
                  {insight.title}
                </Text>
                <Text style={[styles.compactInsightValue, { color: insight.color }]}>
                  {insight.value}
                </Text>
                <Text style={[styles.compactInsightDesc, { color: Colors.textMedium }]}>
                  {insight.description}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Cycle Stats Summary */}
        <Card style={styles.summaryCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Cycle Summary
          </Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: Colors.success }]}>
                {Math.max(stats.averageCycleLength - 3, 21)}
              </Text>
              <Text style={[styles.summaryLabel, { color: Colors.textMedium }]}>
                Shortest
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: Colors.warning }]}>
                {stats.averageCycleLength + 3}
              </Text>
              <Text style={[styles.summaryLabel, { color: Colors.textMedium }]}>
                Longest
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: Colors.info }]}>
                {stats.totalCycles}
              </Text>
              <Text style={[styles.summaryLabel, { color: Colors.textMedium }]}>
                Total Tracked
              </Text>
            </View>
          </View>
        </Card>

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
  subtitle: {
    fontSize: Theme.typography.sizes.md,
    marginBottom: Theme.spacing.lg,
  },
  sectionCard: {
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  // New optimized layouts
  statsOverview: {
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
  },
  regularityCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  regularityContent: {
    // No additional styles needed
  },
  regularityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  regularityValue: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
  },
  regularityLabel: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.medium,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.divider,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
    marginBottom: Theme.spacing.sm,
  },
  chartDescription: {
    fontSize: Theme.typography.sizes.sm,
    marginBottom: Theme.spacing.md,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartCard: {
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    padding: Theme.spacing.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  compactChartContainer: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: Theme.borderRadius.md,
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
  insightsContainer: {
    gap: Theme.spacing.md,
  },
  insightItem: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  insightTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.medium,
  },
  insightDescription: {
    fontSize: Theme.typography.sizes.sm,
  },
  comparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comparisonItem: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.divider,
    marginHorizontal: Theme.spacing.sm,
  },
  comparisonLabel: {
    fontSize: Theme.typography.sizes.xs,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },
  comparisonValue: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.semibold,
    textAlign: 'center',
  },
  // Symptoms section
  symptomsSection: {
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  symptomsGrid: {
    gap: Theme.spacing.sm,
  },
  symptomCard: {
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderLeftWidth: 4,
    backgroundColor: Colors.cardWhite,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symptomName: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.medium,
  },
  symptomCount: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.semibold,
  },
  // Mood and insights row
  insightsRow: {
    flexDirection: 'row',
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  moodCard: {
    flex: 1,
    padding: Theme.spacing.md,
    backgroundColor: Colors.cardWhite,
    borderRadius: Theme.borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickInsightCard: {
    flex: 1,
    padding: Theme.spacing.md,
    backgroundColor: Colors.cardWhite,
    borderRadius: Theme.borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.semibold,
    marginBottom: Theme.spacing.sm,
  },
  moodIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 60,
  },
  moodWeek: {
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  moodBar: {
    width: 12,
    borderRadius: 2,
    minHeight: 8,
  },
  weekLabel: {
    fontSize: Theme.typography.sizes.xs,
  },
  quickInsights: {
    gap: Theme.spacing.sm,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  insightEmoji: {
    fontSize: 16,
  },
  insightText: {
    fontSize: Theme.typography.sizes.sm,
    flex: 1,
  },
  // Detailed insights
  detailedInsightsCard: {
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    padding: Theme.spacing.md,
  },
  compactInsightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  compactInsightItem: {
    flex: 1,
    minWidth: '48%',
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  insightColorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  compactInsightTitle: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.medium,
    marginBottom: Theme.spacing.xs,
  },
  compactInsightValue: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.semibold,
    marginBottom: Theme.spacing.xs,
  },
  compactInsightDesc: {
    fontSize: Theme.typography.sizes.xs,
    lineHeight: 14,
  },
  // Summary section
  summaryCard: {
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    padding: Theme.spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    marginBottom: Theme.spacing.xs,
  },
  summaryLabel: {
    fontSize: Theme.typography.sizes.xs,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xxl,
  },
  loadingText: {
    fontSize: Theme.typography.sizes.md,
    marginTop: Theme.spacing.md,
    textAlign: 'center',
  },
  noDataContainer: {
    padding: Theme.spacing.lg,
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Theme.borderRadius.md,
    margin: Theme.spacing.sm,
  },
  noDataText: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.medium,
    marginBottom: Theme.spacing.xs,
    textAlign: 'center',
  },
  noDataSubtext: {
    fontSize: Theme.typography.sizes.sm,
    textAlign: 'center',
  },
});