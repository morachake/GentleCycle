import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Card, Badge } from '@/components/ui';
import { CyclePhase, SymptomType, FlowIntensity } from '@/types';

interface CycleHistory {
  cycleNumber: number;
  startDate: string;
  endDate: string;
  length: number;
  symptoms: {
    type: SymptomType;
    severity: number;
    day: number;
  }[];
  mood: string;
  flow: FlowIntensity[];
}

interface DailyInsight {
  title: string;
  description: string;
  icon: string;
  color: string;
  type: 'symptom' | 'mood' | 'discharge' | 'energy' | 'sleep';
}

export default function InsightsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [showData, setShowData] = useState(true);
  const [selectedYear] = useState(2024);

  // Mock cycle history data
  const cycleHistory: CycleHistory[] = [
    {
      cycleNumber: 1,
      startDate: '2024-11-02',
      endDate: '2024-11-30',
      length: 28,
      symptoms: [
        { type: SymptomType.CRAMPS, severity: 2, day: 1 },
        { type: SymptomType.BLOATING, severity: 1, day: 2 },
        { type: SymptomType.MOOD_SWINGS, severity: 3, day: 24 },
      ],
      mood: 'Good',
      flow: [FlowIntensity.HEAVY, FlowIntensity.MEDIUM, FlowIntensity.LIGHT, FlowIntensity.SPOTTING],
    },
    {
      cycleNumber: 2,
      startDate: '2024-10-05',
      endDate: '2024-11-01',
      length: 27,
      symptoms: [
        { type: SymptomType.HEADACHE, severity: 2, day: 1 },
        { type: SymptomType.FATIGUE, severity: 3, day: 26 },
      ],
      mood: 'Sensitive',
      flow: [FlowIntensity.MEDIUM, FlowIntensity.LIGHT, FlowIntensity.LIGHT, FlowIntensity.SPOTTING],
    },
    {
      cycleNumber: 3,
      startDate: '2024-09-04',
      endDate: '2024-10-04',
      length: 30,
      symptoms: [
        { type: SymptomType.CRAMPS, severity: 3, day: 1 },
        { type: SymptomType.BREAST_TENDERNESS, severity: 2, day: 25 },
      ],
      mood: 'Energetic',
      flow: [FlowIntensity.HEAVY, FlowIntensity.HEAVY, FlowIntensity.MEDIUM, FlowIntensity.LIGHT],
    },
  ];

  const dailyInsights: DailyInsight[] = [
    {
      title: 'Period day 1',
      description: 'Cramps may be more intense',
      icon: '🩸',
      color: Colors.calendarRed,
      type: 'symptom',
    },
    {
      title: "Today's discharge",
      description: 'Light spotting expected',
      icon: '💧',
      color: Colors.info,
      type: 'discharge',
    },
    {
      title: 'Sleep Quality',
      description: 'Good - 8.2 hours',
      icon: '😴',
      color: Colors.pmsLavender,
      type: 'sleep',
    },
  ];

  const getSymptomColor = (type: SymptomType) => {
    switch (type) {
      case SymptomType.CRAMPS:
        return Colors.calendarRed;
      case SymptomType.BLOATING:
        return Colors.warning;
      case SymptomType.HEADACHE:
        return Colors.pmsLavender;
      case SymptomType.MOOD_SWINGS:
        return Colors.info;
      case SymptomType.FATIGUE:
        return Colors.textMedium;
      default:
        return Colors.primary;
    }
  };

  const getFlowColor = (flow: FlowIntensity) => {
    switch (flow) {
      case FlowIntensity.HEAVY:
        return Colors.calendarRed;
      case FlowIntensity.MEDIUM:
        return Colors.primary;
      case FlowIntensity.LIGHT:
        return Colors.primaryLight;
      case FlowIntensity.SPOTTING:
        return Colors.primarySoft;
      default:
        return Colors.textLight;
    }
  };

  const renderCycleHistoryItem = (cycle: CycleHistory, index: number) => (
    <Animatable.View
      key={cycle.cycleNumber}
      animation="fadeInUp"
      delay={index * 100}
      style={styles.cycleItem}
    >
      <LinearGradient
        colors={[Colors.cardWhite, Colors.primarySoft + '20']}
        style={styles.cycleGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.cycleHeader}>
          <View>
            <Text style={[styles.cycleTitle, { color: colors.text }]}>
              {cycle.length} days
            </Text>
            <Text style={[styles.cycleDates, { color: Colors.textMedium }]}>
              {new Date(cycle.startDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })} - {new Date(cycle.endDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </Text>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Text style={[styles.moreButtonText, { color: Colors.primary }]}>⋯</Text>
          </TouchableOpacity>
        </View>

        {/* Cycle visualization */}
        <View style={styles.cycleVisualization}>
          <View style={styles.daysContainer}>
            {[...Array(Math.min(cycle.length, 31))].map((_, dayIndex) => {
              const day = dayIndex + 1;
              const symptom = cycle.symptoms.find(s => s.day === day);
              const isFlowDay = dayIndex < cycle.flow.length;
              
              return (
                <View
                  key={day}
                  style={[
                    styles.dayDot,
                    {
                      backgroundColor: isFlowDay 
                        ? getFlowColor(cycle.flow[dayIndex])
                        : symptom 
                          ? getSymptomColor(symptom.type) 
                          : Colors.divider,
                    },
                  ]}
                >
                  <Text style={styles.dayNumber}>{day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Symptoms summary */}
        <View style={styles.symptomsContainer}>
          {cycle.symptoms.slice(0, 4).map((symptom, symptomIndex) => (
            <View key={symptomIndex} style={styles.symptomTag}>
              <View
                style={[
                  styles.symptomDot,
                  { backgroundColor: getSymptomColor(symptom.type) },
                ]}
              />
              <Text style={[styles.symptomText, { color: colors.text }]}>
                {symptom.type.replace('_', ' ')}
              </Text>
              <Text style={[styles.severityText, { color: Colors.textMedium }]}>
                {symptom.severity === 1 ? 'Mild' : symptom.severity === 2 ? 'Moderate' : 'Severe'}
              </Text>
            </View>
          ))}
        </View>

        {/* Mood indicator */}
        <View style={styles.moodContainer}>
          <Text style={[styles.moodLabel, { color: Colors.textMedium }]}>Mood:</Text>
          <Badge
            text={cycle.mood}
            variant="secondary"
            size="sm"
            style={{ backgroundColor: Colors.primary + '20' }}
            textStyle={{ color: Colors.primary }}
          />
        </View>
      </LinearGradient>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Cycle Insights
          </Text>
          <Text style={[styles.subtitle, { color: Colors.textMedium }]}>
            Discover patterns in your cycle
          </Text>
        </View>

        {/* Year selector and toggle */}
        <Card style={styles.controlsCard}>
          <View style={styles.controls}>
            <View style={styles.yearSelector}>
              <Text style={[styles.yearText, { color: colors.text }]}>
                {selectedYear}
              </Text>
            </View>
            <View style={styles.toggleContainer}>
              <Text style={[styles.toggleLabel, { color: Colors.textMedium }]}>
                Show data
              </Text>
              <Switch
                value={showData}
                onValueChange={setShowData}
                trackColor={{ false: Colors.textLight, true: Colors.primary + '40' }}
                thumbColor={showData ? Colors.primary : Colors.cardWhite}
              />
            </View>
          </View>
        </Card>

        {showData && (
          <>
            {/* Daily Insights */}
            <Card style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  My daily insights • Today
                </Text>
              </View>
              <View style={styles.insightsGrid}>
                {dailyInsights.map((insight, index) => (
                  <Animatable.View
                    key={index}
                    animation="fadeInUp"
                    delay={index * 150}
                    style={[styles.insightCard, { backgroundColor: insight.color + '15' }]}
                  >
                    <Text style={styles.insightIcon}>{insight.icon}</Text>
                    <Text style={[styles.insightTitle, { color: colors.text }]}>
                      {insight.title}
                    </Text>
                    <Text style={[styles.insightDescription, { color: Colors.textMedium }]}>
                      {insight.description}
                    </Text>
                  </Animatable.View>
                ))}
              </View>
            </Card>

            {/* Cycle History */}
            <Card style={styles.sectionCard}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Your cycle history
              </Text>
              <View style={styles.cycleHistoryContainer}>
                {cycleHistory.map((cycle, index) => renderCycleHistoryItem(cycle, index))}
              </View>
            </Card>
          </>
        )}

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
  controlsCard: {
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yearSelector: {
    padding: Theme.spacing.sm,
    backgroundColor: Colors.primary + '10',
    borderRadius: Theme.borderRadius.md,
  },
  yearText: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.semibold,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  toggleLabel: {
    fontSize: Theme.typography.sizes.sm,
  },
  sectionCard: {
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  sectionHeader: {
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
    marginBottom: Theme.spacing.sm,
  },
  insightsGrid: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    flexWrap: 'wrap',
  },
  insightCard: {
    flex: 1,
    minWidth: 100,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
  },
  insightIcon: {
    fontSize: 24,
    marginBottom: Theme.spacing.xs,
  },
  insightTitle: {
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.semibold,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },
  insightDescription: {
    fontSize: Theme.typography.sizes.xs,
    textAlign: 'center',
  },
  cycleHistoryContainer: {
    gap: Theme.spacing.md,
  },
  cycleItem: {
    marginBottom: Theme.spacing.sm,
  },
  cycleGradient: {
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
  },
  cycleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.md,
  },
  cycleTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    marginBottom: Theme.spacing.xs,
  },
  cycleDates: {
    fontSize: Theme.typography.sizes.sm,
  },
  moreButton: {
    padding: Theme.spacing.xs,
  },
  moreButtonText: {
    fontSize: 20,
    fontWeight: Theme.typography.weights.bold,
  },
  cycleVisualization: {
    marginBottom: Theme.spacing.md,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  dayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 1,
  },
  dayNumber: {
    fontSize: 6,
    color: 'transparent',
  },
  symptomsContainer: {
    marginBottom: Theme.spacing.sm,
  },
  symptomTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  symptomDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Theme.spacing.xs,
  },
  symptomText: {
    fontSize: Theme.typography.sizes.sm,
    textTransform: 'capitalize',
    marginRight: Theme.spacing.xs,
  },
  severityText: {
    fontSize: Theme.typography.sizes.xs,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  moodLabel: {
    fontSize: Theme.typography.sizes.sm,
  },
  bottomPadding: {
    height: 100,
  },
});