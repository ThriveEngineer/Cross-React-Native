import * as Haptics from 'expo-haptics';
import { router, Stack } from 'expo-router';
import React, { useCallback } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, IconName, IconVariant } from '../src/components/Icon';
import { Colors, FontSizes, Spacing } from '../src/constants/theme';

interface SettingRowProps {
  icon: IconName;
  iconVariant?: IconVariant;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  arrowType?: 'right' | 'down' | 'none';
  disabled?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon,
  iconVariant = 'Linear',
  title,
  subtitle,
  onPress,
  arrowType = 'right',
  disabled = false,
}) => (
  <Pressable
    style={[styles.settingRow, disabled && styles.settingRowDisabled]}
    onPress={disabled ? undefined : onPress}
    disabled={disabled}
  >
    <Icon
      name={icon}
      size={22}
      color={disabled ? Colors.light.textSecondary : Colors.light.text}
      variant={iconVariant}
    />
    <View style={styles.settingContent}>
      <Text style={[styles.settingTitle, disabled && styles.settingTitleDisabled]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      )}
    </View>
    {arrowType !== 'none' && (
      <Icon
        name={arrowType === 'down' ? 'chevron-down' : 'chevron-forward'}
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
          <Icon name="chevron-back" size={24} color={Colors.light.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* First Card - App Settings */}
        <View style={styles.settingsCard}>
          {/* Theme */}
          <SettingRow
            icon="paintbucket"
            iconVariant="Bold"
            title="Theme"
            arrowType="down"
            onPress={handleTheme}
          />

          <View style={styles.divider} />

          {/* Language */}
          <SettingRow
            icon="global"
            iconVariant="Linear"
            title="Language | Coming soon!"
            arrowType="right"
            disabled={true}
          />

          <View style={styles.divider} />

          {/* Integrations */}
          <SettingRow
            icon="component"
            iconVariant="Linear"
            title="Integrations"
            arrowType="right"
            onPress={handleIntegrations}
          />
        </View>

        {/* Second Card - Support & Social */}
        <View style={styles.settingsCard}>
          {/* Feedback */}
          <SettingRow
            icon="like"
            iconVariant="Bold"
            title="Feedback"
            arrowType="right"
          />

          <View style={styles.divider} />

          {/* Follow Us */}
          <SettingRow
            icon="messages"
            iconVariant="Bold"
            title="Follow us"
            arrowType="right"
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
    paddingVertical: 25,
    alignItems: 'center',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    width: 353,
    marginBottom: 35,
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
    marginLeft: 20,
    marginRight: 20,
  },
});
