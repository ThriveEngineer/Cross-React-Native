import React, { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTaskStore, useIsNotionConnected } from '../store/taskStore';
import { Colors, Spacing, FontSizes } from '../constants/theme';
import { NativeContextMenu, MenuOption } from './native';

interface CustomAppBarProps {
  onOpenViewSettings: () => void;
  onOpenSettings: () => void;
}

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
      icon: 'eye-outline',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onOpenViewSettings();
      },
    },
    {
      label: 'Select',
      icon: 'checkbox-outline',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        toggleSelectionMode();
      },
    },
    {
      label: 'Settings',
      icon: 'settings-outline',
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

    let iconName: keyof typeof Ionicons.glyphMap = 'cloud-outline';
    let iconColor = Colors.light.textSecondary;

    if (syncState.isSyncing) {
      iconName = 'sync';
      iconColor = Colors.light.primary;
    } else if (syncState.errorCount > 0) {
      iconName = 'cloud-offline-outline';
      iconColor = Colors.light.error;
    } else if (syncState.lastSyncTime) {
      iconName = 'cloud-done-outline';
      iconColor = Colors.light.success;
    }

    return (
      <Pressable style={styles.syncIndicator} onPress={showSyncDetails}>
        <Ionicons name={iconName} size={22} color={iconColor} />
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
          <Ionicons name="menu" size={24} color={Colors.light.text} />
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
  syncIndicator: {
    padding: Spacing.xs,
  },
});
