import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Card, Button } from '@/components/ui';
import { AboutModal } from '@/components/modals/AboutModal';
import { cycleDataService } from '@/lib/services/CycleDataService';

interface SettingsOption {
  title: string;
  description?: string;
  type: 'switch' | 'navigation' | 'action';
  value?: boolean;
  onPress?: () => void;
  onValueChange?: (value: boolean) => void;
  icon?: string;
  destructive?: boolean;
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [notifications, setNotifications] = useState({
    periodReminder: true,
    fertilityReminder: false,
    symptomReminder: true,
    medicationReminder: false,
  });

  const [privacy, setPrivacy] = useState({
    requireAuth: true,
    useFingerprint: false,
    hideFromRecent: true,
  });

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      const data = await cycleDataService.exportAllData();
      Alert.alert(
        '📤 Export Complete',
        `Your data has been exported successfully. The file contains ${data.totalRecords} records and is ready to save or share.`,
        [
          { text: 'Done', style: 'default' }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Export Failed',
        'There was an error exporting your data. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportData = async () => {
    Alert.alert(
      'Import Data',
      'Select a GentleCycle backup file to import your data. This will merge with your existing data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Import', 
          onPress: async () => {
            setIsLoading(true);
            try {
              const result = await cycleDataService.importData();
              Alert.alert(
                '📥 Import Complete',
                `Successfully imported ${result.importedRecords} records. Your cycle predictions have been updated.`,
                [{ text: 'Great!' }]
              );
            } catch (error) {
              Alert.alert(
                'Import Failed',
                'The selected file could not be imported. Please ensure it\'s a valid GentleCycle backup file.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsLoading(false);
            }
          }
        },
      ]
    );
  };

  const handleBackupData = async () => {
    setIsLoading(true);
    try {
      await cycleDataService.createLocalBackup();
      Alert.alert(
        '💾 Backup Created',
        'Your data has been backed up locally on your device. You can access it from the Files app.',
        [{ text: 'Perfect!' }]
      );
    } catch (error) {
      Alert.alert(
        'Backup Failed',
        'Unable to create backup. Please ensure you have sufficient storage space.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      '⚠️ Delete All Data',
      'This will permanently delete ALL your cycle data, symptoms, notes, and settings. This action cannot be undone.\n\nAre you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Everything', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Last chance! This will delete everything permanently. Type your passcode to confirm.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete All Data',
                  style: 'destructive',
                  onPress: async () => {
                    setIsLoading(true);
                    try {
                      await cycleDataService.deleteAllData();
                      Alert.alert(
                        'Data Deleted',
                        'All your data has been permanently deleted. The app will restart.',
                        [{ text: 'OK', onPress: () => console.log('Restart app') }]
                      );
                    } catch (error) {
                      Alert.alert('Error', 'Failed to delete data. Please try again.');
                    } finally {
                      setIsLoading(false);
                    }
                  }
                }
              ]
            );
          }
        },
      ]
    );
  };

  const handleResetPredictions = async () => {
    Alert.alert(
      '🔄 Reset Predictions',
      'This will recalculate all your cycle predictions based on your current data. Useful if you\'ve made many data corrections.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            setIsLoading(true);
            try {
              await cycleDataService.recalculatePredictions();
              Alert.alert(
                '✅ Predictions Updated',
                'Your cycle predictions have been recalculated based on your latest data patterns.',
                [{ text: 'Great!' }]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to reset predictions. Please try again.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const notificationSettings: SettingsOption[] = [
    {
      title: 'Period Reminders',
      description: 'Get notified 1-3 days before your predicted period',
      type: 'switch',
      value: notifications.periodReminder,
      onValueChange: (value) => setNotifications({ ...notifications, periodReminder: value }),
    },
    {
      title: 'Fertility Window',
      description: 'Notifications for ovulation and fertile days',
      type: 'switch',
      value: notifications.fertilityReminder,
      onValueChange: (value) => setNotifications({ ...notifications, fertilityReminder: value }),
    },
    {
      title: 'Daily Check-ins',
      description: 'Gentle reminders to log symptoms and mood',
      type: 'switch',
      value: notifications.symptomReminder,
      onValueChange: (value) => setNotifications({ ...notifications, symptomReminder: value }),
    },
    {
      title: 'Medication Reminders',
      description: 'Reminders for birth control and supplements',
      type: 'switch',
      value: notifications.medicationReminder,
      onValueChange: (value) => setNotifications({ ...notifications, medicationReminder: value }),
    },
  ];

  const privacySettings: SettingsOption[] = [
    {
      title: 'App Lock',
      description: 'Require authentication to open the app',
      type: 'switch',
      value: privacy.requireAuth,
      onValueChange: (value) => setPrivacy({ ...privacy, requireAuth: value }),
    },
    {
      title: 'Biometric Authentication',
      description: 'Use fingerprint or face recognition',
      type: 'switch',
      value: privacy.useFingerprint,
      onValueChange: (value) => setPrivacy({ ...privacy, useFingerprint: value }),
    },
    {
      title: 'Hide from Recent Apps',
      description: 'Blur app content in task switcher',
      type: 'switch',
      value: privacy.hideFromRecent,
      onValueChange: (value) => setPrivacy({ ...privacy, hideFromRecent: value }),
    },
  ];

  const dataSettings: SettingsOption[] = [
    {
      title: 'Export All Data',
      description: 'Save your complete cycle data to a secure file',
      type: 'action',
      onPress: handleExportData,
      icon: '📤',
    },
    {
      title: 'Import Data',
      description: 'Import data from a backup file or another app',
      type: 'action',
      onPress: handleImportData,
      icon: '📥',
    },
    {
      title: 'Create Local Backup',
      description: 'Save a secure backup to your device',
      type: 'action',
      onPress: handleBackupData,
      icon: '💾',
    },
    {
      title: 'Reset Predictions',
      description: 'Recalculate cycle predictions from current data',
      type: 'action',
      onPress: handleResetPredictions,
      icon: '🔄',
    },
    {
      title: 'Data Statistics',
      description: 'View detailed statistics about your tracked data',
      type: 'navigation',
      onPress: () => console.log('Show data stats'),
      icon: '📊',
    },
  ];

  const aboutSettings: SettingsOption[] = [
    {
      title: 'About GentleCycle',
      description: 'App info, privacy policy, terms & help',
      type: 'navigation',
      onPress: () => setShowAboutModal(true),
      icon: 'ℹ️',
    },
    {
      title: 'Rate the App',
      description: 'Help other women discover GentleCycle',
      type: 'navigation',
      onPress: () => console.log('Rate app'),
      icon: '⭐',
    },
    {
      title: 'Share with Friends',
      description: 'Tell your friends about GentleCycle',
      type: 'navigation',
      onPress: () => console.log('Share app'),
      icon: '💗',
    },
    {
      title: 'Send Feedback',
      description: 'Report bugs or suggest improvements',
      type: 'navigation',
      onPress: () => console.log('Send feedback'),
      icon: '💌',
    },
  ];

  const renderSettingsSection = (title: string, options: SettingsOption[]) => (
    <Card style={styles.sectionCard}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {title}
      </Text>
      {options.map((option, index) => (
        <View key={index}>
          <TouchableOpacity
            style={[
              styles.settingsItem,
              option.type === 'switch' && styles.switchItem,
            ]}
            onPress={option.onPress}
            disabled={option.type === 'switch'}
          >
            <View style={styles.settingsItemLeft}>
              {option.icon && (
                <Text style={styles.settingsIcon}>{option.icon}</Text>
              )}
              <View style={styles.settingsTextContainer}>
                <Text style={[
                  styles.settingsTitle,
                  { color: option.destructive ? Colors.error : colors.text }
                ]}>
                  {option.title}
                </Text>
                {option.description && (
                  <Text style={[styles.settingsDescription, { color: Colors.textMedium }]}>
                    {option.description}
                  </Text>
                )}
              </View>
            </View>
            {option.type === 'switch' && option.onValueChange && (
              <Switch
                value={option.value}
                onValueChange={option.onValueChange}
                trackColor={{ false: Colors.textLight, true: Colors.primary + '40' }}
                thumbColor={option.value ? Colors.primary : Colors.cardWhite}
              />
            )}
            {option.type === 'navigation' && (
              <Text style={[styles.chevron, { color: Colors.textLight }]}>
                ›
              </Text>
            )}
          </TouchableOpacity>
          {index < options.length - 1 && (
            <View style={[styles.separator, { backgroundColor: Colors.divider }]} />
          )}
        </View>
      ))}
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Settings
          </Text>
          <Text style={[styles.subtitle, { color: Colors.textMedium }]}>
            Customize your experience
          </Text>
        </View>

        {/* Cycle Settings */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Cycle Settings
          </Text>
          <TouchableOpacity style={styles.settingsItem}>
            <View style={styles.settingsItemLeft}>
              <Text style={styles.settingsIcon}>📅</Text>
              <View style={styles.settingsTextContainer}>
                <Text style={[styles.settingsTitle, { color: colors.text }]}>
                  Cycle Length
                </Text>
                <Text style={[styles.settingsDescription, { color: Colors.textMedium }]}>
                  Average cycle length: 28 days
                </Text>
              </View>
            </View>
            <Text style={[styles.chevron, { color: Colors.textLight }]}>›</Text>
          </TouchableOpacity>
          <View style={[styles.separator, { backgroundColor: Colors.divider }]} />
          <TouchableOpacity style={styles.settingsItem}>
            <View style={styles.settingsItemLeft}>
              <Text style={styles.settingsIcon}>🩸</Text>
              <View style={styles.settingsTextContainer}>
                <Text style={[styles.settingsTitle, { color: colors.text }]}>
                  Period Length
                </Text>
                <Text style={[styles.settingsDescription, { color: Colors.textMedium }]}>
                  Average period length: 5 days
                </Text>
              </View>
            </View>
            <Text style={[styles.chevron, { color: Colors.textLight }]}>›</Text>
          </TouchableOpacity>
        </Card>

        {renderSettingsSection('Notifications', notificationSettings)}
        {renderSettingsSection('Privacy & Security', privacySettings)}
        {renderSettingsSection('Data Management', dataSettings)}
        
        {/* Danger Zone */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: Colors.error }]}>
            Danger Zone
          </Text>
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={handleDeleteAllData}
          >
            <View style={styles.settingsItemLeft}>
              <Text style={styles.settingsIcon}>🗑️</Text>
              <View style={styles.settingsTextContainer}>
                <Text style={[styles.settingsTitle, { color: Colors.error }]}>
                  Delete All Data
                </Text>
                <Text style={[styles.settingsDescription, { color: Colors.textMedium }]}>
                  Permanently delete all your data
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Card>

        {renderSettingsSection('About', aboutSettings)}

        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: Colors.textLight }]}>
            GentleCycle v1.0.0
          </Text>
          <Text style={[styles.privacyText, { color: Colors.textLight }]}>
            🔒 Your data stays private and secure on your device
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* About Modal */}
      <AboutModal
        isVisible={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />
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
    paddingVertical: Theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
    marginBottom: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
  },
  switchItem: {
    minHeight: 60,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIcon: {
    fontSize: 20,
    marginRight: Theme.spacing.md,
    width: 24,
    textAlign: 'center',
  },
  settingsTextContainer: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.medium,
    marginBottom: Theme.spacing.xs,
  },
  settingsDescription: {
    fontSize: Theme.typography.sizes.sm,
  },
  chevron: {
    fontSize: 20,
    fontWeight: Theme.typography.weights.medium,
  },
  separator: {
    height: 1,
    marginLeft: 56,
  },
  versionContainer: {
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xl,
  },
  versionText: {
    fontSize: Theme.typography.sizes.sm,
    marginBottom: Theme.spacing.sm,
  },
  privacyText: {
    fontSize: Theme.typography.sizes.xs,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 100,
  },
});