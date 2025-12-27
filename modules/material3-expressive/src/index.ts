import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';
import { ViewProps, Platform, View, StyleSheet } from 'react-native';

// Types for M3 Expressive Button
export type ButtonVariant = 'filled' | 'filledTonal' | 'outlined' | 'elevated' | 'text';

export interface M3ButtonProps extends ViewProps {
  label: string;
  variant?: ButtonVariant;
  enabled?: boolean;
}

// Types for M3 Expressive Card
export type CardVariant = 'filled' | 'elevated' | 'outlined';

export interface M3CardProps extends ViewProps {
  variant?: CardVariant;
}

// Types for M3 Expressive FAB
export type FABIcon =
  | 'add' | 'edit' | 'delete' | 'check' | 'close'
  | 'search' | 'settings' | 'home' | 'favorite' | 'share'
  | 'menu' | 'refresh' | 'done' | 'info' | 'warning'
  | 'email' | 'phone' | 'person' | 'star' | 'send';

export interface M3FABProps extends ViewProps {
  icon?: FABIcon;
  label?: string;
  expanded?: boolean;
}

// Types for M3 Expressive Loading Indicator
export type LoadingVariant = 'circular' | 'linear';

export interface M3LoadingIndicatorProps extends ViewProps {
  variant?: LoadingVariant;
  progress?: number;
}

// Native View Managers (Android only)
const NativeM3Button = Platform.OS === 'android'
  ? requireNativeViewManager('M3ExpressiveButton')
  : null;

const NativeM3Card = Platform.OS === 'android'
  ? requireNativeViewManager('M3ExpressiveCard')
  : null;

const NativeM3FAB = Platform.OS === 'android'
  ? requireNativeViewManager('M3ExpressiveFAB')
  : null;

const NativeM3LoadingIndicator = Platform.OS === 'android'
  ? requireNativeViewManager('M3ExpressiveLoadingIndicator')
  : null;

// M3 Expressive Button Component
export function M3Button(props: M3ButtonProps) {
  const { label, variant = 'filled', enabled = true, style, ...viewProps } = props;

  if (Platform.OS !== 'android' || !NativeM3Button) {
    // Fallback for iOS
    return React.createElement(View, {
      style: [styles.fallback, style],
      ...viewProps
    });
  }

  return React.createElement(NativeM3Button, {
    style: [styles.button, style],
    ...viewProps,
    label,
    variant,
    enabled,
  });
}

// M3 Expressive Card Component
export function M3Card(props: M3CardProps) {
  const { variant = 'filled', style, ...viewProps } = props;

  if (Platform.OS !== 'android' || !NativeM3Card) {
    return React.createElement(View, {
      style: [styles.fallback, style],
      ...viewProps
    });
  }

  return React.createElement(NativeM3Card, {
    style: [styles.card, style],
    ...viewProps,
    variant,
  });
}

// M3 Expressive FAB Component
export function M3FAB(props: M3FABProps) {
  const { icon = 'add', label, expanded = true, style, ...viewProps } = props;

  if (Platform.OS !== 'android' || !NativeM3FAB) {
    return React.createElement(View, {
      style: [styles.fallback, style],
      ...viewProps
    });
  }

  return React.createElement(NativeM3FAB, {
    style: [styles.fab, style],
    ...viewProps,
    icon,
    label,
    expanded,
  });
}

// M3 Expressive Loading Indicator Component
export function M3LoadingIndicator(props: M3LoadingIndicatorProps) {
  const { variant = 'circular', progress, style, ...viewProps } = props;

  if (Platform.OS !== 'android' || !NativeM3LoadingIndicator) {
    return React.createElement(View, {
      style: [styles.fallback, style],
      ...viewProps
    });
  }

  return React.createElement(NativeM3LoadingIndicator, {
    style: [styles.indicator, style],
    ...viewProps,
    variant,
    progress,
  });
}

const styles = StyleSheet.create({
  fallback: {
    // Empty fallback for iOS
  },
  button: {
    alignSelf: 'flex-start',
  },
  card: {
    width: '100%',
  },
  fab: {
    alignSelf: 'flex-start',
  },
  indicator: {
    alignSelf: 'flex-start',
  },
});

// Export all components
export default {
  M3Button,
  M3Card,
  M3FAB,
  M3LoadingIndicator,
};
