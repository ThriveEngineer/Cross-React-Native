import React, { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { TaskTile } from './TaskTile';
import { Task } from '../types/types';
import { useTaskStore } from '../store/taskStore';
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
  const { sortOption } = useTaskStore();

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
    <FlatList
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

export const GroupedTaskList: React.FC<GroupedTaskListProps> = ({
  groups,
  onRefresh,
  isRefreshing = false,
}) => {
  const sections = Array.from(groups.entries()).map(([title, tasks]) => ({
    title,
    data: tasks,
  }));

  const renderSectionHeader = useCallback(
    (title: string) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
    ),
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: Task }) => <TaskTile task={item} />,
    []
  );

  return (
    <FlatList
      data={sections}
      renderItem={({ item: section }) => (
        <View key={section.title}>
          {renderSectionHeader(section.title)}
          {section.data.map(task => (
            <View key={task.id}>{renderItem({ item: task })}</View>
          ))}
        </View>
      )}
      keyExtractor={item => item.title}
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
