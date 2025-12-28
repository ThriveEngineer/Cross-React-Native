import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { TaskTile } from '../../src/components/TaskTile';
import { TaskList } from '../../src/components/TaskList';
import { FloatingActionButton } from '../../src/components/FloatingActionButton';
import { CustomAppBar } from '../../src/components/CustomAppBar';
import { ViewSettingsSheet } from '../../src/components/ViewSettingsSheet';
import { MoveToFolderSheet } from '../../src/components/MoveToFolderSheet';
import { FocusTimer } from '../../src/components/FocusTimer';
import { useTaskStore, useIncompleteTasks, useCompletedTasks } from '../../src/store/taskStore';
import { notionAutoSync } from '../../src/services/notionService';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../src/constants/theme';
import { getDayNumber, getMonthNameShort } from '../../src/utils/dates';

export default function TodayScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewSettingsVisible, setViewSettingsVisible] = useState(false);
  const [moveToFolderVisible, setMoveToFolderVisible] = useState(false);
  const [focusTimerVisible, setFocusTimerVisible] = useState(false);
  const {
    showCompletedInToday,
    isInitialized,
    loadAllData,
    selectionMode,
    selectedTasks,
    deleteTasks,
    clearSelection,
  } = useTaskStore();
  const incompleteTasks = useIncompleteTasks();
  const completedTasks = useCompletedTasks();

  const selectedTaskIds = Array.from(selectedTasks);
  const hasSelection = selectedTaskIds.length > 0;

  const handleDeleteSelected = useCallback(() => {
    if (!hasSelection) return;

    Alert.alert(
      'Delete Tasks',
      `Are you sure you want to delete ${selectedTaskIds.length} task(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            deleteTasks(selectedTaskIds);
            clearSelection();
          },
        },
      ]
    );
  }, [hasSelection, selectedTaskIds, deleteTasks, clearSelection]);

  useEffect(() => {
    if (!isInitialized) {
      loadAllData();
    }
  }, [isInitialized, loadAllData]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await notionAutoSync.triggerImmediateSync();
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const openSettings = useCallback(() => {
    router.push('/settings');
  }, []);

  if (!isInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show split view if showCompletedInToday is enabled
  if (showCompletedInToday) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <CustomAppBar
          onOpenViewSettings={() => setViewSettingsVisible(true)}
          onOpenSettings={openSettings}
        />

        {/* Header Row */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Today</Text>
          <View style={styles.dateContainer}>
            <Text style={styles.dayNumber}>{getDayNumber()}</Text>
            <Text style={styles.monthName}>{getMonthNameShort()}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.light.primary}
            />
          }
        >
          {/* Open Tasks Section */}
          <View style={styles.sectionHeader}>
            <Ionicons name="close-circle" size={16} color={Colors.light.text} />
            <Text style={styles.sectionTitle}>Open</Text>
          </View>
          <View style={styles.sectionContainer}>
            {incompleteTasks.length === 0 ? (
              <View style={styles.emptySectionContainer}>
                <Text style={styles.emptySectionText}>No open tasks</Text>
              </View>
            ) : (
              <View style={styles.taskListContainer}>
                {incompleteTasks.map(task => (
                  <TaskTile key={task.id} task={task} />
                ))}
              </View>
            )}
          </View>

          {/* Completed Tasks Section */}
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.light.text} />
            <Text style={styles.sectionTitle}>Completed</Text>
          </View>
          <View style={[styles.sectionContainer, styles.completedSection]}>
            {completedTasks.length === 0 ? (
              <View style={styles.emptySectionContainer}>
                <Text style={styles.emptySectionText}>No completed tasks</Text>
              </View>
            ) : (
              <View style={styles.taskListContainer}>
                {completedTasks.map(task => (
                  <TaskTile key={task.id} task={task} />
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* FAB - always visible, changes based on selection mode */}
        <FloatingActionButton />

        {/* Selection Mode Action Buttons */}
        {selectionMode && (
          <View style={styles.selectionBarContainer}>
            <View style={styles.selectionActionsContainer}>
              <Pressable
                style={[styles.selectionActionButton, !hasSelection && styles.selectionActionDisabled]}
                onPress={() => hasSelection && setMoveToFolderVisible(true)}
                disabled={!hasSelection}
              >
                <Ionicons
                  name="folder-outline"
                  size={24}
                  color={hasSelection ? Colors.light.text : Colors.light.textSecondary}
                />
              </Pressable>
              <Pressable
                style={[styles.selectionActionButton, !hasSelection && styles.selectionActionDisabled]}
                onPress={() => hasSelection && handleDeleteSelected()}
                disabled={!hasSelection}
              >
                <Ionicons
                  name="trash-outline"
                  size={24}
                  color={hasSelection ? Colors.light.text : Colors.light.textSecondary}
                />
              </Pressable>
            </View>
            <Pressable
              style={[styles.timerButton, !hasSelection && styles.selectionActionDisabled]}
              onPress={() => {
                if (hasSelection) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setFocusTimerVisible(true);
                }
              }}
              disabled={!hasSelection}
            >
              <Ionicons
                name="time-outline"
                size={24}
                color="#FFFFFF"
              />
            </Pressable>
          </View>
        )}

        <ViewSettingsSheet
          visible={viewSettingsVisible}
          onClose={() => setViewSettingsVisible(false)}
        />
        <MoveToFolderSheet
          visible={moveToFolderVisible}
          onClose={() => setMoveToFolderVisible(false)}
          taskIds={selectedTaskIds}
        />
        <FocusTimer
          visible={focusTimerVisible}
          onClose={() => setFocusTimerVisible(false)}
        />
      </SafeAreaView>
    );
  }

  // Default view - only show incomplete tasks
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CustomAppBar
        onOpenViewSettings={() => setViewSettingsVisible(true)}
        onOpenSettings={openSettings}
      />

      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Today</Text>
        <View style={styles.dateContainer}>
          <Text style={styles.dayNumber}>{getDayNumber()}</Text>
          <Text style={styles.monthName}>{getMonthNameShort()}</Text>
        </View>
      </View>

      {incompleteTasks.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyTitle}>Relax, you don't have anything left</Text>
          <Text style={styles.emptyTitle}>todo.</Text>
          <Pressable style={styles.createButton}>
            <Text style={styles.createButtonText}>Create new task</Text>
          </Pressable>
        </View>
      ) : (
        <TaskList
          tasks={incompleteTasks}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          emptyMessage="No tasks for today"
        />
      )}

      {/* FAB - always visible, changes based on selection mode */}
      <FloatingActionButton />

      {/* Selection Mode Action Buttons */}
      {selectionMode && (
        <View style={styles.selectionBarContainer}>
          <View style={styles.selectionActionsContainer}>
            <Pressable
              style={[styles.selectionActionButton, !hasSelection && styles.selectionActionDisabled]}
              onPress={() => hasSelection && setMoveToFolderVisible(true)}
              disabled={!hasSelection}
            >
              <Ionicons
                name="folder-outline"
                size={24}
                color={hasSelection ? Colors.light.text : Colors.light.textSecondary}
              />
            </Pressable>
            <Pressable
              style={[styles.selectionActionButton, !hasSelection && styles.selectionActionDisabled]}
              onPress={() => hasSelection && handleDeleteSelected()}
              disabled={!hasSelection}
            >
              <Ionicons
                name="trash-outline"
                size={24}
                color={hasSelection ? Colors.light.text : Colors.light.textSecondary}
              />
            </Pressable>
          </View>
          <Pressable
            style={[styles.timerButton, !hasSelection && styles.selectionActionDisabled]}
            onPress={() => {
              if (hasSelection) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setFocusTimerVisible(true);
              }
            }}
            disabled={!hasSelection}
          >
            <Ionicons
              name="time-outline"
              size={24}
              color="#FFFFFF"
            />
          </Pressable>
        </View>
      )}

      <ViewSettingsSheet
        visible={viewSettingsVisible}
        onClose={() => setViewSettingsVisible(false)}
      />
      <MoveToFolderSheet
        visible={moveToFolderVisible}
        onClose={() => setMoveToFolderVisible(false)}
        taskIds={selectedTaskIds}
      />
      <FocusTimer
        visible={focusTimerVisible}
        onClose={() => setFocusTimerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FontSizes.md,
    color: Colors.light.textSecondary,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  dateContainer: {
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    lineHeight: 32,
  },
  monthName: {
    fontSize: 16,
    color: '#919191',
    lineHeight: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  sectionContainer: {
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  completedSection: {
    marginBottom: 16,
  },
  taskListContainer: {
    paddingVertical: 0,
  },
  emptySectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 80,
  },
  emptySectionText: {
    fontSize: FontSizes.md,
    color: Colors.light.textSecondary,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
  },
  createButton: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
  },
  selectionBarContainer: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectionActionsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F3F3',
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
  },
  selectionActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionActionDisabled: {
    opacity: 0.5,
  },
});
