import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTaskStore, useIsNotionConnected } from '../store/taskStore';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

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
    selectedTasks,
    selectAllTasks,
    clearSelection,
  } = useTaskStore();
  const [menuVisible, setMenuVisible] = useState(false);
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

  const handleMenuSelect = useCallback(() => {
    setMenuVisible(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleSelectionMode();
  }, [toggleSelectionMode]);

  const handleMenuView = useCallback(() => {
    setMenuVisible(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onOpenViewSettings();
  }, [onOpenViewSettings]);

  const handleMenuSettings = useCallback(() => {
    setMenuVisible(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onOpenSettings();
  }, [onOpenSettings]);

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
        <Ionicons name={iconName} size={20} color={iconColor} />
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
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setMenuVisible(true);
          }}
          hitSlop={10}
        >
          <Ionicons name="menu" size={24} color={Colors.light.text} />
        </Pressable>
      </View>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <Pressable style={styles.menuItem} onPress={handleMenuView}>
              <Ionicons name="eye-outline" size={20} color={Colors.light.text} />
              <Text style={styles.menuText}>View</Text>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable style={styles.menuItem} onPress={handleMenuSelect}>
              <Ionicons name="checkbox-outline" size={20} color={Colors.light.text} />
              <Text style={styles.menuText}>Select</Text>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable style={styles.menuItem} onPress={handleMenuSettings}>
              <Ionicons name="settings-outline" size={20} color={Colors.light.text} />
              <Text style={styles.menuText}>Settings</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
    gap: Spacing.md,
  },
  actionText: {
    color: Colors.light.primary,
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  syncIndicator: {
    padding: Spacing.xs,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: Spacing.lg,
  },
  menuContainer: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  menuText: {
    fontSize: FontSizes.md,
    color: Colors.light.text,
  },
  menuDivider: {
    height: 0.5,
    backgroundColor: Colors.light.border,
  },
});
