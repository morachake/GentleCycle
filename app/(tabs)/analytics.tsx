import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Card, Badge } from '@/components/ui';
import { SymptomType } from '@/types';

const { width } = Dimensions.get('window');
const chartWidth = width - (Theme.spacing.md * 2) - (Theme.spacing.lg * 2);

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Mock data for demonstrations
  const cycleLengthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [28, 30, 27, 29, 28, 31],
      color: () => Colors.primary,
      strokeWidth: 3,
    }],
  };

  const symptomFrequencyData = [
    { name: 'Cramps', population: 15, color: Colors.calendarRed, legendFontColor: colors.text },
    { name: 'Bloating', population: 12, color: Colors.warning, legendFontColor: colors.text },
    { name: 'Headache', population: 8, color: Colors.pmsLavender, legendFontColor: colors.text },
    { name: 'Mood', population: 10, color: Colors.info, legendFontColor: colors.text },
    { name: 'Fatigue', population: 7, color: Colors.success, legendFontColor: colors.text },
  ];

  const moodTrendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      data: [4, 3, 2, 3],
      color: () => Colors.primary,
      strokeWidth: 2,
    }],
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

  const stats = {
    averageCycle: 28.5,
    shortestCycle: 26,
    longestCycle: 31,
    averagePeriod: 5.2,
    regularityScore: 92,
    totalCycles: 12,
  };

  const insights = [
    {
      title: 'Cycle Regularity',
      value: '92%',
      description: 'Your cycles are very consistent',
      color: Colors.success,
    },
    {
      title: 'Most Common Symptom',
      value: 'Cramps',
      description: 'Occurs in 75% of your cycles',
      color: Colors.calendarRed,
    },
    {
      title: 'Best Mood Phase',
      value: 'Follicular',
      description: 'You feel happiest during this phase',
      color: Colors.fertilityGreen,
    },
    {
      title: 'Sleep Quality',
      value: '7.2/10',
      description: 'Average sleep score this month',
      color: Colors.info,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Analytics & Insights
          </Text>
          <Text style={[styles.subtitle, { color: Colors.textMedium }]}>
            Understanding your cycle patterns
          </Text>
        </View>

        {/* Stats Overview */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Cycle Overview
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.primary }]}>
                {stats.averageCycle}
              </Text>
              <Text style={[styles.statLabel, { color: Colors.textMedium }]}>
                Avg Cycle Length
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.primary }]}>
                {stats.averagePeriod}
              </Text>
              <Text style={[styles.statLabel, { color: Colors.textMedium }]}>
                Avg Period Length
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.primary }]}>
                {stats.regularityScore}%
              </Text>
              <Text style={[styles.statLabel, { color: Colors.textMedium }]}>
                Regularity Score
              </Text>
            </View>
          </View>
        </Card>

        {/* Cycle Length Trend */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Cycle Length Trend
          </Text>
          <Text style={[styles.chartDescription, { color: Colors.textMedium }]}>
            Your cycle lengths over the past 6 months
          </Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={cycleLengthData}
              width={chartWidth}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={false}
            />
          </View>
        </Card>

        {/* Symptom Frequency */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Symptom Frequency
          </Text>
          <Text style={[styles.chartDescription, { color: Colors.textMedium }]}>
            Most common symptoms this month
          </Text>
          <View style={styles.chartContainer}>
            <PieChart
              data={symptomFrequencyData}
              width={chartWidth}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </View>
        </Card>

        {/* Mood Trend */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Mood Patterns
          </Text>
          <Text style={[styles.chartDescription, { color: Colors.textMedium }]}>
            Average mood score by cycle week (1-5 scale)
          </Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={moodTrendData}
              width={chartWidth}
              height={200}
              chartConfig={chartConfig}
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={false}
            />
          </View>
        </Card>

        {/* Insights */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Personalized Insights
          </Text>
          <View style={styles.insightsContainer}>
            {insights.map((insight, index) => (
              <View key={index} style={styles.insightItem}>
                <View style={styles.insightHeader}>
                  <Text style={[styles.insightTitle, { color: colors.text }]}>
                    {insight.title}
                  </Text>
                  <Badge 
                    text={insight.value} 
                    variant="secondary"
                    style={{ backgroundColor: insight.color + '20' }}
                    textStyle={{ color: insight.color }}
                  />
                </View>
                <Text style={[styles.insightDescription, { color: Colors.textMedium }]}>
                  {insight.description}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Cycle Comparison */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Cycle Comparison
          </Text>
          <View style={styles.comparisonContainer}>
            <View style={styles.comparisonItem}>
              <Text style={[styles.comparisonLabel, { color: Colors.textMedium }]}>
                Shortest Cycle
              </Text>
              <Text style={[styles.comparisonValue, { color: colors.text }]}>
                {stats.shortestCycle} days
              </Text>
            </View>
            <View style={styles.comparisonDivider} />
            <View style={styles.comparisonItem}>
              <Text style={[styles.comparisonLabel, { color: Colors.textMedium }]}>
                Longest Cycle
              </Text>
              <Text style={[styles.comparisonValue, { color: colors.text }]}>
                {stats.longestCycle} days
              </Text>
            </View>
            <View style={styles.comparisonDivider} />
            <View style={styles.comparisonItem}>
              <Text style={[styles.comparisonLabel, { color: Colors.textMedium }]}>
                Total Tracked
              </Text>
              <Text style={[styles.comparisonValue, { color: colors.text }]}>
                {stats.totalCycles} cycles
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
  bottomPadding: {
    height: 100,
  },
});