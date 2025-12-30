import React, { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTaskStore, useIsNotionConnected } from '../store/taskStore';
import { Colors, Spacing, FontSizes } from '../constants/theme';
import { NativeContextMenu, MenuOption } from './native';
import { Icon, IconName } from './Icon';

// Try to import GlassView for Liquid Glass effect
let GlassView: any = null;
let isLiquidGlassAvailable: () => boolean = () => false;

try {
  const glassModule = require('expo-glass-effect');
  GlassView = glassModule.GlassView;
  isLiquidGlassAvailable = glassModule.isLiquidGlassAvailable;
} catch (e) {
  // Glass effect not available
}

interface CustomAppBarProps {
  onOpenViewSettings: () => void;
  onOpenSettings: () => void;
}

// Glass icon wrapper component
const GlassIconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const useGlass = Platform.OS === 'ios' && GlassView && isLiquidGlassAvailable();

  if (useGlass) {
    return (
      <GlassView style={styles.glassIconContainer} glassEffectStyle="regular">
        {children}
      </GlassView>
    );
  }

  // Fallback for non-iOS or when glass is not available
  return (
    <View style={styles.iconContainer}>
      {children}
    </View>
  );
};

export const CustomAppBar: React.FC<CustomAppBarProps> = ({
  onOpenViewSettings,
  onOpenSettings,
}) => {
  const {
    selectionMode,
    toggleSelectionMode,
    selectAllTasks,
    clearSelection,
  } = useTaskStore();
  const isNotionConnected = useIsNotionConnected();
  const { syncState } = useTaskStore();

  const handleSelectAll = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    selectAllTasks();
  }, [selectAllTasks]);

  const handleCancelSelection = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clearSelection();
  }, [clearSelection]);

  const menuOptions: MenuOption[] = [
    {
      label: 'View',
      icon: 'setting-3',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onOpenViewSettings();
      },
    },
    {
      label: 'Select',
      icon: 'mouse-square',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        toggleSelectionMode();
      },
    },
    {
      label: 'Settings',
      icon: 'setting',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onOpenSettings();
      },
    },
  ];

  const showSyncDetails = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    let statusText = 'Idle';
    if (syncState.isSyncing) {
      statusText = 'Syncing...';
    } else if (syncState.errorCount > 0) {
      statusText = `Error (${syncState.errorCount} failed)`;
    } else if (syncState.lastSyncTime) {
      statusText = 'Connected';
    }

    const lastSyncText = syncState.lastSyncTime
      ? new Date(syncState.lastSyncTime).toLocaleString()
      : 'Never';

    const directionText = syncState.syncDirection === 'toNotion'
      ? 'Upload to Notion'
      : syncState.syncDirection === 'fromNotion'
      ? 'Download from Notion'
      : syncState.syncDirection === 'bidirectional'
      ? 'Bidirectional'
      : 'None';

    Alert.alert(
      'Notion Sync Status',
      `Status: ${statusText}\n\nLast Sync: ${lastSyncText}\n\nDirection: ${directionText}\n\nErrors: ${syncState.errorCount}`,
      [{ text: 'OK' }]
    );
  }, [syncState]);

  // Sync status indicator
  const renderSyncIndicator = () => {
    if (!isNotionConnected) return null;

    let iconName: IconName = 'cloud';
    let iconColor = Colors.light.textSecondary;

    if (syncState.isSyncing) {
      iconName = 'sync';
      iconColor = Colors.light.primary;
    } else if (syncState.errorCount > 0) {
      iconName = 'cloud-offline';
      iconColor = Colors.light.error;
    } else if (syncState.lastSyncTime) {
      iconName = 'cloud-done';
      iconColor = Colors.light.success;
    }

    return (
      <Pressable onPress={showSyncDetails}>
        <GlassIconWrapper>
          <Icon name={iconName} size={22} color={iconColor} />
        </GlassIconWrapper>
      </Pressable>
    );
  };

  if (selectionMode) {
    return (
      <View style={styles.container}>
        <Pressable onPress={handleCancelSelection} hitSlop={10}>
          <Text style={styles.actionText}>Cancel</Text>
        </Pressable>
        <View style={styles.spacer} />
        <Pressable onPress={handleSelectAll} hitSlop={10}>
          <Text style={styles.actionText}>Select All</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.spacer} />
      <View style={styles.rightActions}>
        {renderSyncIndicator()}
        <NativeContextMenu options={menuOptions}>
          <GlassIconWrapper>
            <Icon name="menu" size={24} color={Colors.light.text} />
          </GlassIconWrapper>
        </NativeContextMenu>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    height: 44,
  },
  spacer: {
    flex: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  actionText: {
    color: Colors.light.primary,
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  glassIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});
