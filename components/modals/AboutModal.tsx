import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import Modal from 'react-native-modal';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';
import { Card, Button } from '@/components/ui';

interface AboutModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'privacy' | 'terms' | 'help'>('about');

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@gentlecycle.com?subject=GentleCycle Support');
  };

  const handleVisitWebsite = () => {
    Linking.openURL('https://gentlecycle.com');
  };

  const renderAboutContent = () => (
    <View>
      <Animatable.View animation="fadeIn" delay={200}>
        <View style={styles.logoContainer}>
          <Text style={styles.appLogo}>🌸</Text>
          <Text style={styles.appName}>GentleCycle</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={400}>
        <Card style={styles.featureCard}>
          <Text style={styles.cardTitle}>🌺 Made for Women, by Women</Text>
          <Text style={styles.cardDescription}>
            GentleCycle is designed with empathy and understanding for the female experience. 
            Our app provides accurate period tracking, fertility insights, and health management 
            tools that respect your privacy and support your wellness journey.
          </Text>
        </Card>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={600}>
        <Card style={styles.featureCard}>
          <Text style={styles.cardTitle}>🔒 Privacy First</Text>
          <Text style={styles.cardDescription}>
            Your intimate health data stays completely private. All information is stored locally 
            on your device with optional encrypted cloud backup. We never sell or share your data.
          </Text>
        </Card>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={800}>
        <Card style={styles.featureCard}>
          <Text style={styles.cardTitle}>🧠 Smart Predictions</Text>
          <Text style={styles.cardDescription}>
            Our AI learns your unique patterns to provide accurate cycle predictions, 
            fertility windows, and personalized insights that improve over time.
          </Text>
        </Card>
      </Animatable.View>

      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Get in Touch</Text>
        <TouchableOpacity style={styles.contactButton} onPress={handleEmailSupport}>
          <Text style={styles.contactButtonText}>📧 support@gentlecycle.com</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactButton} onPress={handleVisitWebsite}>
          <Text style={styles.contactButtonText}>🌐 gentlecycle.com</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPrivacyContent = () => (
    <ScrollView style={styles.contentContainer}>
      <Text style={styles.sectionTitle}>🔐 Privacy Policy</Text>
      <Text style={styles.sectionText}>
        <Text style={styles.boldText}>Data Collection:</Text> We collect only the information you choose to input about your menstrual cycle, symptoms, and health data. This includes dates, flow intensity, mood, symptoms, and any notes you add.
      </Text>
      <Text style={styles.sectionText}>
        <Text style={styles.boldText}>Data Storage:</Text> All your data is stored locally on your device using secure, encrypted storage. You have full control over your information.
      </Text>
      <Text style={styles.sectionText}>
        <Text style={styles.boldText}>Data Sharing:</Text> We never share, sell, or monetize your personal health data. Your information remains completely private to you.
      </Text>
      <Text style={styles.sectionText}>
        <Text style={styles.boldText}>Backup:</Text> Optional cloud backup uses end-to-end encryption to ensure your data remains secure and accessible only to you.
      </Text>
    </ScrollView>
  );

  const renderTermsContent = () => (
    <ScrollView style={styles.contentContainer}>
      <Text style={styles.sectionTitle}>📋 Terms of Service</Text>
      <Text style={styles.sectionText}>
        <Text style={styles.boldText}>Medical Disclaimer:</Text> GentleCycle is for informational purposes only and is not intended as medical advice. Always consult healthcare professionals for medical concerns.
      </Text>
      <Text style={styles.sectionText}>
        <Text style={styles.boldText}>Accuracy:</Text> While we strive for accuracy, predictions are estimates based on your data patterns. Individual cycles can vary.
      </Text>
      <Text style={styles.sectionText}>
        <Text style={styles.boldText}>Age Requirement:</Text> You must be at least 13 years old to use this app. Users under 18 should use with parental guidance.
      </Text>
      <Text style={styles.sectionText}>
        <Text style={styles.boldText}>Updates:</Text> We may update these terms periodically. Continued use constitutes acceptance of updated terms.
      </Text>
    </ScrollView>
  );

  const renderHelpContent = () => (
    <ScrollView style={styles.contentContainer}>
      <Text style={styles.sectionTitle}>❓ Help & Support</Text>
      
      <Card style={styles.helpCard}>
        <Text style={styles.helpTitle}>🩸 Logging Your Period</Text>
        <Text style={styles.helpText}>
          • Tap the period icon to log the start of your cycle{'\n'}
          • Select flow intensity (light, medium, heavy, spotting){'\n'}
          • Mark the end date when your period finishes{'\n'}
          • Edit past entries by tapping calendar dates
        </Text>
      </Card>

      <Card style={styles.helpCard}>
        <Text style={styles.helpTitle}>🥚 Tracking Ovulation</Text>
        <Text style={styles.helpText}>
          • Log ovulation through symptoms or tests{'\n'}
          • Track cervical mucus changes{'\n'}
          • Monitor basal body temperature{'\n'}
          • Use ovulation predictor kit results
        </Text>
      </Card>

      <Card style={styles.helpCard}>
        <Text style={styles.helpTitle}>💭 Managing Symptoms</Text>
        <Text style={styles.helpText}>
          • Daily symptom tracking for patterns{'\n'}
          • Mood and energy level monitoring{'\n'}
          • Pain scale for cramps and discomfort{'\n'}
          • Custom notes for additional details
        </Text>
      </Card>

      <Card style={styles.helpCard}>
        <Text style={styles.helpTitle}>📊 Understanding Predictions</Text>
        <Text style={styles.helpText}>
          • Predictions improve with more data{'\n'}
          • Fertility windows are estimates{'\n'}
          • Adjust predictions for irregular cycles{'\n'}
          • Review insights for pattern recognition
        </Text>
      </Card>
    </ScrollView>
  );

  const getTabContent = () => {
    switch (activeTab) {
      case 'about':
        return renderAboutContent();
      case 'privacy':
        return renderPrivacyContent();
      case 'terms':
        return renderTermsContent();
      case 'help':
        return renderHelpContent();
      default:
        return renderAboutContent();
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
    >
      <View style={styles.modalContent}>
        {/* Header */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDeep]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.dragHandle} />
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          
          <Animatable.Text animation="fadeInDown" style={styles.modalTitle}>
            About GentleCycle
          </Animatable.Text>
        </LinearGradient>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {[
            { key: 'about', label: 'About', icon: 'ℹ️' },
            { key: 'privacy', label: 'Privacy', icon: '🔒' },
            { key: 'terms', label: 'Terms', icon: '📋' },
            { key: 'help', label: 'Help', icon: '❓' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab.key && styles.activeTabLabel,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {getTabContent()}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: Colors.cardWhite,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    maxHeight: '90%',
    minHeight: '80%',
  },
  header: {
    paddingTop: 20,
    paddingBottom: Theme.spacing.lg,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    alignItems: 'center',
    position: 'relative',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.cardWhite,
    borderRadius: 2,
    marginBottom: Theme.spacing.lg,
    opacity: 0.7,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: Theme.spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardWhite + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: Colors.cardWhite,
    fontWeight: Theme.typography.weights.bold,
  },
  modalTitle: {
    fontSize: Theme.typography.sizes.xxl,
    fontWeight: Theme.typography.weights.bold,
    color: Colors.cardWhite,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  tab: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
    opacity: 0.6,
  },
  activeTab: {
    opacity: 1,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: Theme.spacing.xs,
  },
  tabLabel: {
    fontSize: Theme.typography.sizes.xs,
    fontWeight: Theme.typography.weights.medium,
    color: Colors.textMedium,
  },
  activeTabLabel: {
    color: Colors.primary,
    fontWeight: Theme.typography.weights.semibold,
  },
  content: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
  },
  contentContainer: {
    paddingBottom: Theme.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.xl,
  },
  appLogo: {
    fontSize: 60,
    marginBottom: Theme.spacing.md,
  },
  appName: {
    fontSize: Theme.typography.sizes.xxl,
    fontWeight: Theme.typography.weights.bold,
    color: Colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  appVersion: {
    fontSize: Theme.typography.sizes.sm,
    color: Colors.textMedium,
  },
  featureCard: {
    marginBottom: Theme.spacing.lg,
    backgroundColor: Colors.primarySoft,
  },
  cardTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
    color: Colors.textDark,
    marginBottom: Theme.spacing.sm,
  },
  cardDescription: {
    fontSize: Theme.typography.sizes.sm,
    color: Colors.textMedium,
    lineHeight: 20,
  },
  contactSection: {
    paddingTop: Theme.spacing.xl,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
    color: Colors.textDark,
    marginBottom: Theme.spacing.md,
  },
  contactButton: {
    paddingVertical: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  contactButtonText: {
    fontSize: Theme.typography.sizes.md,
    color: Colors.primary,
    fontWeight: Theme.typography.weights.medium,
  },
  sectionTitle: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
    color: Colors.textDark,
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  },
  sectionText: {
    fontSize: Theme.typography.sizes.sm,
    color: Colors.textMedium,
    lineHeight: 22,
    marginBottom: Theme.spacing.md,
  },
  boldText: {
    fontWeight: Theme.typography.weights.semibold,
    color: Colors.textDark,
  },
  helpCard: {
    marginBottom: Theme.spacing.lg,
    backgroundColor: Colors.info + '10',
  },
  helpTitle: {
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.semibold,
    color: Colors.textDark,
    marginBottom: Theme.spacing.sm,
  },
  helpText: {
    fontSize: Theme.typography.sizes.sm,
    color: Colors.textMedium,
    lineHeight: 20,
  },
});