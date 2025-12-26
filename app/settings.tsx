import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSizes, BorderRadius } from '../src/constants/theme';

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  disabled?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
  disabled = false,
}) => (
  <Pressable
    style={[styles.settingRow, disabled && styles.settingRowDisabled]}
    onPress={disabled ? undefined : onPress}
    disabled={disabled}
  >
    <Ionicons
      name={icon}
      size={22}
      color={disabled ? Colors.light.textSecondary : Colors.light.text}
    />
    <View style={styles.settingContent}>
      <Text style={[styles.settingTitle, disabled && styles.settingTitleDisabled]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      )}
    </View>
    {showArrow && (
      <Ionicons
        name="chevron-forward"
        size={20}
        color={Colors.light.textSecondary}
      />
    )}
  </Pressable>
);

export default function SettingsScreen() {
  const handleTheme = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/theme' as any);
  }, []);

  const handleIntegrations = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/integrations');
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={Colors.light.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Settings Container */}
        <View style={styles.settingsContainer}>
          {/* Theme */}
          <SettingRow
            icon="color-palette"
            title="Theme"
            showArrow={true}
            onPress={handleTheme}
          />

          <View style={styles.divider} />

          {/* Language */}
          <SettingRow
            icon="globe-outline"
            title="Language | Coming soon!"
            disabled={true}
          />

          <View style={styles.divider} />

          {/* Integrations */}
          <SettingRow
            icon="apps-outline"
            title="Integrations"
            onPress={handleIntegrations}
          />

          <View style={styles.divider} />

          {/* Feedback */}
          <SettingRow
            icon="thumbs-up-outline"
            title="Feedback"
          />

          <View style={styles.divider} />

          {/* Follow Us */}
          <SettingRow
            icon="chatbubbles-outline"
            title="Follow us"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: '#F2F2F7',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.light.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  settingsContainer: {
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    overflow: 'hidden',
    width: 353,
    alignSelf: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 13,
  },
  settingRowDisabled: {
    opacity: 0.6,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FontSizes.md,
    color: Colors.light.text,
  },
  settingTitleDisabled: {
    color: Colors.light.textSecondary,
  },
  settingSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#C2C2C2',
    marginLeft: 50,
  },
});
