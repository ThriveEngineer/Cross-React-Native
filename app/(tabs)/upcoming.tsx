import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { TaskTile } from '../../src/components/TaskTile';
import { FloatingActionButton } from '../../src/components/FloatingActionButton';
import { CustomAppBar } from '../../src/components/CustomAppBar';
import { ViewSettingsSheet } from '../../src/components/ViewSettingsSheet';
import { MoveToFolderSheet } from '../../src/components/MoveToFolderSheet';
import { useTaskStore, useIncompleteTasks } from '../../src/store/taskStore';
import { notionAutoSync } from '../../src/services/notionService';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../src/constants/theme';
import { Task } from '../../src/types/types';
import { format, isToday, isTomorrow, parseISO, isValid } from 'date-fns';

interface DateGroup {
  label: string;
  date: Date | null;
  tasks: Task[];
}

export default function UpcomingScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewSettingsVisible, setViewSettingsVisible] = useState(false);
  const [moveToFolderVisible, setMoveToFolderVisible] = useState(false);
  const {
    selectionMode,
    selectedTasks,
    deleteTasks,
    clearSelection,
  } = useTaskStore();
  const incompleteTasks = useIncompleteTasks();

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

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await notionAutoSync.triggerImmediateSync();
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Group tasks by date - matching Flutter's format
  const dateGroups = useMemo((): DateGroup[] => {
    const groups = new Map<string, DateGroup>();

    incompleteTasks.forEach(task => {
      let label = 'No Date';
      let date: Date | null = null;

      if (task.dueDate) {
        try {
          const parsedDate = parseISO(task.dueDate);
          if (isValid(parsedDate)) {
            date = parsedDate;
            if (isToday(parsedDate)) {
              label = 'Today';
            } else if (isTomorrow(parsedDate)) {
              label = 'Tomorrow';
            } else {
              // Format: "Monday, January 1"
              label = format(parsedDate, 'EEEE, MMMM d');
            }
          }
        } catch {
          label = 'No Date';
        }
      }

      const existing = groups.get(label);
      if (existing) {
        existing.tasks.push(task);
      } else {
        groups.set(label, { label, date, tasks: [task] });
      }
    });

    // Sort groups: Today first, Tomorrow second, then by date, No Date last
    const sortedGroups = Array.from(groups.values()).sort((a, b) => {
      if (a.label === 'Today') return -1;
      if (b.label === 'Today') return 1;
      if (a.label === 'Tomorrow') return -1;
      if (b.label === 'Tomorrow') return 1;
      if (a.label === 'No Date') return 1;
      if (b.label === 'No Date') return -1;
      if (a.date && b.date) {
        return a.date.getTime() - b.date.getTime();
      }
      return 0;
    });

    return sortedGroups;
  }, [incompleteTasks]);

  const openSettings = useCallback(() => {
    router.push('/settings');
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CustomAppBar
        onOpenViewSettings={() => setViewSettingsVisible(true)}
        onOpenSettings={openSettings}
      />

      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Upcoming</Text>
      </View>

      {incompleteTasks.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyTitle}>No upcoming tasks</Text>
          <Text style={styles.emptySubtitle}>
            Create tasks with dates to see them here
          </Text>
        </View>
      ) : (
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
          {dateGroups.map((group, groupIndex) => (
            <Animated.View
              key={group.label}
              entering={FadeInDown.delay(groupIndex * 50).duration(400)}
            >
              {/* Date Header */}
              <Text style={styles.dateHeader}>{group.label}</Text>

              {/* Tasks Container */}
              <View style={styles.tasksContainer}>
                {group.tasks.map(task => (
                  <TaskTile key={task.id} task={task} />
                ))}
              </View>
            </Animated.View>
          ))}
        </ScrollView>
      )}

      {/* FAB - always visible, changes based on selection mode */}
      <FloatingActionButton />

      {/* Selection Mode Action Buttons */}
      {selectionMode && (
        <View style={styles.selectionActionsContainer}>
          <Pressable
            style={[styles.selectionActionButton, !hasSelection && styles.selectionActionDisabled]}
            onPress={() => hasSelection && setMoveToFolderVisible(true)}
            disabled={!hasSelection}
          >
            <Ionicons
              name="folder-outline"
              size={24}
              color={hasSelection ? Colors.light.primary : Colors.light.textSecondary}
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
              color={hasSelection ? Colors.light.error : Colors.light.textSecondary}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerRow: {
    paddingHorizontal: 25,
    marginBottom: 25,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: 100,
  },
  dateHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 12,
    marginTop: 8,
  },
  tasksContainer: {
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  selectionActionsContainer: {
    position: 'absolute',
    bottom: 16,
    right: 88,
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  selectionActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionActionDisabled: {
    opacity: 0.5,
  },
});
