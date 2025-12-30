import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { TaskTile } from './TaskTile';
import { Task } from '../types/types';
import { Colors, Spacing, FontSizes } from '../constants/theme';

interface TaskListProps {
  tasks: Task[];
  emptyMessage?: string;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
  ListHeaderComponent?: React.ReactElement | null;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  emptyMessage = 'No tasks',
  onRefresh,
  isRefreshing = false,
  ListHeaderComponent,
}) => {
  const renderItem = useCallback(
    ({ item }: { item: Task }) => <TaskTile task={item} />,
    []
  );

  const keyExtractor = useCallback((item: Task) => item.id, []);

  if (tasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        {ListHeaderComponent}
        <View style={styles.emptyContent}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      </View>
    );
  }

  return (
    <FlashList
      data={tasks}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeaderComponent}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Colors.light.primary}
          />
        ) : undefined
      }
    />
  );
};

interface GroupedTaskListProps {
  groups: Map<string, Task[]>;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

// Flattened list item types for FlashList
type GroupedListItem =
  | { type: 'header'; title: string }
  | { type: 'task'; task: Task };

export const GroupedTaskList: React.FC<GroupedTaskListProps> = ({
  groups,
  onRefresh,
  isRefreshing = false,
}) => {
  // Flatten groups into a single array for FlashList - better performance
  const flatData = useMemo((): GroupedListItem[] => {
    const items: GroupedListItem[] = [];
    groups.forEach((tasks, title) => {
      items.push({ type: 'header', title });
      tasks.forEach(task => {
        items.push({ type: 'task', task });
      });
    });
    return items;
  }, [groups]);

  const renderItem = useCallback(
    ({ item }: { item: GroupedListItem }) => {
      if (item.type === 'header') {
        return (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
          </View>
        );
      }
      return <TaskTile task={item.task} />;
    },
    []
  );

  const keyExtractor = useCallback((item: GroupedListItem) => {
    if (item.type === 'header') return `header-${item.title}`;
    return `task-${item.task.id}`;
  }, []);

  const getItemType = useCallback((item: GroupedListItem) => item.type, []);

  // Use FlashList for better performance with large lists
  return (
    <FlashList
      data={flatData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemType={getItemType}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Colors.light.primary}
          />
        ) : undefined
      }
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
