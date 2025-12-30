import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomAppBar } from '../../src/components/CustomAppBar';
import { FloatingActionButton } from '../../src/components/FloatingActionButton';
import { FocusTimer } from '../../src/components/FocusTimer';
import { MoveToFolderSheet } from '../../src/components/MoveToFolderSheet';
import { TaskList } from '../../src/components/TaskList';
import { TaskTile } from '../../src/components/TaskTile';
import { ViewSettingsSheet } from '../../src/components/ViewSettingsSheet';
import { Icon } from '../../src/components/Icon';
import { Colors, FontSizes, Spacing } from '../../src/constants/theme';
import { notionAutoSync } from '../../src/services/notionService';
import { useCompletedTasks, useIncompleteTasks, useTaskStore } from '../../src/store/taskStore';
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
            <Icon name="close-square" size={16} color={Colors.light.text} variant="Bold" />
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
            <Icon name="tick-square" size={16} color={Colors.light.text} variant="Bold" />
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
            <Pressable
              style={[styles.selectionActionButton, !hasSelection && styles.selectionActionDisabled]}
              onPress={() => hasSelection && setMoveToFolderVisible(true)}
              disabled={!hasSelection}
            >
              <Icon
                name="folder"
                size={24}
                color={hasSelection ? Colors.light.text : Colors.light.textSecondary}
              />
            </Pressable>
            <Pressable
              style={[styles.selectionActionButton, !hasSelection && styles.selectionActionDisabled]}
              onPress={() => hasSelection && handleDeleteSelected()}
              disabled={!hasSelection}
            >
              <Icon
                name="trash"
                size={24}
                color={hasSelection ? Colors.light.text : Colors.light.textSecondary}
              />
            </Pressable>
          </View>
        )}

        {/* Timer Button - separate, only in selection mode */}
        {selectionMode && (
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
            <Icon
              name="timer"
              size={24}
              color="#FFFFFF"
            />
          </Pressable>
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
          <Pressable
            style={[styles.selectionActionButton, !hasSelection && styles.selectionActionDisabled]}
            onPress={() => hasSelection && setMoveToFolderVisible(true)}
            disabled={!hasSelection}
          >
            <Icon
              name="folder"
              size={24}
              color={hasSelection ? Colors.light.text : Colors.light.textSecondary}
            />
          </Pressable>
          <Pressable
            style={[styles.selectionActionButton, !hasSelection && styles.selectionActionDisabled]}
            onPress={() => hasSelection && handleDeleteSelected()}
            disabled={!hasSelection}
          >
            <Icon
              name="trash"
              size={24}
              color={hasSelection ? Colors.light.text : Colors.light.textSecondary}
            />
          </Pressable>
        </View>
      )}

      {/* Timer Button - separate, only in selection mode */}
      {selectionMode && (
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
          <Icon
            name="timer"
            size={24}
            color="#FFFFFF"
          />
        </Pressable>
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
    right: 84,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffffff',
    borderRadius: 99,
    paddingLeft: 14,
    paddingRight: 10,
    paddingVertical: 8,
    boxShadow: '0px 4px 35px rgba(0, 0, 0, 0.15)',
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
    position: 'absolute',
    bottom: 16,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 35px rgba(0, 0, 0, 0.15)',
  },
  selectionActionDisabled: {
    opacity: 0.5,
  },
});
