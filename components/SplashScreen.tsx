import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationFinish }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Start animations
    const startAnimations = () => {
      // Fade in main content
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      // Slide up text
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }).start();

      // Pulsing heart animation
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => pulse());
      };
      pulse();
    };

    startAnimations();

    // Auto finish after 3 seconds
    const timer = setTimeout(() => {
      onAnimationFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primarySoft, Colors.primaryLight, Colors.primary]}
        style={styles.gradient}
        locations={[0, 0.7, 1]}
      >
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Floating elements */}
          <Animatable.View
            animation="bounceIn"
            delay={500}
            duration={1000}
            style={[styles.floatingElement, styles.element1]}
          >
            <Text style={styles.floatingEmoji}>🌸</Text>
          </Animatable.View>

          <Animatable.View
            animation="bounceIn"
            delay={700}
            duration={1000}
            style={[styles.floatingElement, styles.element2]}
          >
            <Text style={styles.floatingEmoji}>✨</Text>
          </Animatable.View>

          <Animatable.View
            animation="bounceIn"
            delay={900}
            duration={1000}
            style={[styles.floatingElement, styles.element3]}
          >
            <Text style={styles.floatingEmoji}>💖</Text>
          </Animatable.View>

          <Animatable.View
            animation="bounceIn"
            delay={1100}
            duration={1000}
            style={[styles.floatingElement, styles.element4]}
          >
            <Text style={styles.floatingEmoji}>🦋</Text>
          </Animatable.View>

          {/* Main logo area */}
          <View style={styles.logoContainer}>
            <Animated.View
              style={[
                styles.heartContainer,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDeep]}
                style={styles.heartBackground}
              >
                <Text style={styles.heartIcon}>💕</Text>
              </LinearGradient>
            </Animated.View>

            <Animatable.Text
              animation="fadeInUp"
              delay={800}
              style={styles.appName}
            >
              GentleCycle
            </Animatable.Text>

            <Animatable.Text
              animation="fadeInUp"
              delay={1000}
              style={styles.tagline}
            >
              Your gentle companion 🌙
            </Animatable.Text>
          </View>

          {/* Bottom decorative elements */}
          <View style={styles.bottomContainer}>
            <Animatable.View
              animation="pulse"
              iterationCount="infinite"
              delay={1200}
              style={styles.decorativeCircle}
            >
              <LinearGradient
                colors={[Colors.primaryLight + '40', 'transparent']}
                style={styles.circle}
              />
            </Animatable.View>
          </View>
        </Animated.View>

        {/* Subtle background pattern */}
        <View style={styles.backgroundPattern}>
          {[...Array(8)].map((_, i) => (
            <Animatable.View
              key={i}
              animation="fadeIn"
              delay={i * 200 + 1000}
              style={[
                styles.patternDot,
                {
                  top: Math.random() * height * 0.8,
                  left: Math.random() * width * 0.8,
                },
              ]}
            />
          ))}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  floatingElement: {
    position: 'absolute',
  },
  element1: {
    top: height * 0.15,
    left: width * 0.1,
  },
  element2: {
    top: height * 0.25,
    right: width * 0.1,
  },
  element3: {
    top: height * 0.65,
    left: width * 0.2,
  },
  element4: {
    top: height * 0.7,
    right: width * 0.15,
  },
  floatingEmoji: {
    fontSize: 32,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: -50,
  },
  heartContainer: {
    marginBottom: Theme.spacing.xl,
  },
  heartBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  heartIcon: {
    fontSize: 60,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appName: {
    fontSize: 42,
    fontWeight: Theme.typography.weights.bold,
    color: Colors.cardWhite,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tagline: {
    fontSize: 18,
    color: Colors.cardWhite,
    textAlign: 'center',
    opacity: 0.9,
    fontWeight: Theme.typography.weights.medium,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: height * 0.2,
    alignItems: 'center',
  },
  decorativeCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  patternDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.cardWhite,
    opacity: 0.3,
  },
});