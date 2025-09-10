import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Theme } from '@/constants/Theme';

interface BadgeProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return Colors.primary;
      case 'secondary':
        return Colors.primaryLight;
      case 'success':
        return Colors.success;
      case 'warning':
        return Colors.warning;
      case 'error':
        return Colors.error;
      case 'info':
        return Colors.info;
      default:
        return Colors.primary;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'secondary':
        return Colors.primary;
      default:
        return Colors.cardWhite;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        styles[size],
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          styles[`text_${size}` as keyof typeof styles],
          { color: getTextColor() },
          textStyle,
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: Theme.borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  sm: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
    minHeight: 20,
  },
  md: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    minHeight: 24,
  },
  lg: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    minHeight: 32,
  },
  text: {
    fontWeight: Theme.typography.weights.medium,
    textAlign: 'center',
  },
  text_sm: {
    fontSize: Theme.typography.sizes.xs,
  },
  text_md: {
    fontSize: Theme.typography.sizes.sm,
  },
  text_lg: {
    fontSize: Theme.typography.sizes.md,
  },
});