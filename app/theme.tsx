import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSizes } from '../src/constants/theme';
import { M3DropdownMenu } from 'material3-expressive';
import { Icon } from '../src/components/Icon';

type ThemeOption = 'system' | 'light' | 'dark';
const THEME_OPTIONS = ['System', 'Light', 'Dark'] as const;

interface ThemeRowProps {
  title: string;
  description: string;
  isSelected: boolean;
  onPress: () => void;
}

const ThemeRow: React.FC<ThemeRowProps> = ({
  title,
  description,
  isSelected,
  onPress,
}) => (
  <Pressable style={styles.themeRow} onPress={onPress}>
    <View style={styles.themeInfo}>
      <Text style={styles.themeTitle}>{title}</Text>
      <Text style={styles.themeDescription}>{description}</Text>
    </View>
    {isSelected && (
      <Icon name="tick-circle" size={24} color={Colors.light.primary} variant="Bold" />
    )}
  </Pressable>
);

export default function ThemeScreen() {
  // For now, theme is always light. This is a placeholder for future implementation.
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>('light');
  const selectedIndex = THEME_OPTIONS.findIndex(
    (opt) => opt.toLowerCase() === selectedTheme
  );

  const handleThemeSelect = useCallback((theme: ThemeOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTheme(theme);
    // TODO: Implement actual theme switching when dark mode is added
  }, []);

  const handleDropdownChange = useCallback((index: number, value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTheme(value.toLowerCase() as ThemeOption);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Icon name="chevron-back" size={24} color={Colors.light.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Theme</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Theme Options - M3 Dropdown on Android, list on iOS */}
        {Platform.OS === 'android' ? (
          <View style={styles.dropdownContainer}>
            <M3DropdownMenu
              options={[...THEME_OPTIONS]}
              selectedIndex={selectedIndex >= 0 ? selectedIndex : 1}
              label="Theme"
              onSelectionChange={handleDropdownChange}
            />
          </View>
        ) : (
          <View style={styles.optionsContainer}>
            <ThemeRow
              title="System"
              description="Follow your device's appearance settings"
              isSelected={selectedTheme === 'system'}
              onPress={() => handleThemeSelect('system')}
            />

            <View style={styles.divider} />

            <ThemeRow
              title="Light"
              description="Always use light theme"
              isSelected={selectedTheme === 'light'}
              onPress={() => handleThemeSelect('light')}
            />

            <View style={styles.divider} />

            <ThemeRow
              title="Dark"
              description="Always use dark theme"
              isSelected={selectedTheme === 'dark'}
              onPress={() => handleThemeSelect('dark')}
            />
          </View>
        )}

        {/* Info Text */}
        <Text style={styles.infoText}>
          Dark mode is coming soon! Currently, only light theme is available.
        </Text>
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
  optionsContainer: {
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    overflow: 'hidden',
    width: 353,
    alignSelf: 'center',
  },
  dropdownContainer: {
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    padding: Spacing.md,
    width: 353,
    alignSelf: 'center',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  themeInfo: {
    flex: 1,
  },
  themeTitle: {
    fontSize: FontSizes.md,
    color: Colors.light.text,
    fontWeight: '500',
  },
  themeDescription: {
    fontSize: FontSizes.sm,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#C2C2C2',
    marginLeft: 50,
  },
  infoText: {
    fontSize: FontSizes.sm,
    color: Colors.light.textSecondary,
    marginTop: Spacing.lg,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
