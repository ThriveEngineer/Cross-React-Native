import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Platform,
  InteractionManager,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTaskStore } from '../store/taskStore';
import { Colors, Spacing, FontSizes } from '../constants/theme';
import { format } from 'date-fns';
import { showM3DatePicker, showM3TaskCreationSheet } from 'material3-expressive';
import { NativeDropdown, NativeBottomSheet } from './native';
import { Icon } from './Icon';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FloatingActionButtonProps {
  defaultFolder?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  defaultFolder = 'Inbox',
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(defaultFolder);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { folders, addTask, selectionMode } = useTaskStore();
  const scale = useSharedValue(1);

  const availableFolders = folders.filter(f => f.name !== 'Completed');
  const defaultFolderIndex = Math.max(0, availableFolders.findIndex(f => f.name === defaultFolder));

  // Open task creation (only in normal mode, FAB is hidden in selection mode)
  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // On Android, use native sheet - defer to allow button animation to complete
    if (Platform.OS === 'android') {
      InteractionManager.runAfterInteractions(() => {
        showM3TaskCreationSheet({
          folders: availableFolders.map(f => f.name),
          selectedFolderIndex: defaultFolderIndex,
        }).then((result) => {
          if (!result.cancelled && result.taskName) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const folderName = availableFolders[result.folderIndex ?? 0]?.name ?? defaultFolder;
            const dueDate = result.dueDateMillis ? new Date(result.dueDateMillis).toISOString() : undefined;
            addTask(result.taskName, folderName, dueDate);
          }
        });
      });
    } else {
      setIsModalVisible(true);
    }
  }, [availableFolders, defaultFolderIndex, defaultFolder, addTask]);

  const handleClose = useCallback(() => {
    setIsModalVisible(false);
    setTaskName('');
    setSelectedFolder(defaultFolder);
    setSelectedDate(null);
    setShowDatePicker(false);
  }, [defaultFolder]);

  const handleCreate = useCallback(() => {
    if (taskName.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addTask(
        taskName.trim(),
        selectedFolder,
        selectedDate?.toISOString()
      );
      handleClose();
    }
  }, [taskName, selectedFolder, selectedDate, addTask, handleClose]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleDateChange = (_event: unknown, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  // Hide FAB in selection mode (timer is shown in selection bar instead)
  if (selectionMode) {
    return null;
  }

  return (
    <>
      {/* Main FAB - only shown in normal mode */}
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={() => {
          scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        }}
        style={[styles.fab, animatedStyle]}
      >
        <Icon
          name="add"
          size={28}
          color="#FFFFFF"
        />
      </AnimatedPressable>

      {/* Task Creation Bottom Sheet - iOS only */}
      {Platform.OS !== 'android' && (
        <NativeBottomSheet visible={isModalVisible} onClose={handleClose}>
          <View style={styles.createForm}>
            <TextInput
              style={styles.input}
              placeholder="Task name"
              placeholderTextColor={Colors.light.textSecondary}
              value={taskName}
              onChangeText={setTaskName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />

            {/* Folder selector - Native Dropdown */}
            <NativeDropdown
              options={availableFolders.map(f => f.name)}
              selectedIndex={Math.max(0, availableFolders.findIndex(f => f.name === selectedFolder))}
              onSelectionChange={(index, value) => {
                setSelectedFolder(value);
              }}
            />

            {/* Date selector chip */}
            <Pressable
              style={styles.selectorChip}
              onPress={async () => {
                if (Platform.OS === 'android') {
                  try {
                    const result = await showM3DatePicker({
                      selectedDate: selectedDate?.getTime(),
                      title: 'Select due date',
                    });
                    if (!result.cancelled && result.dateMillis) {
                      setSelectedDate(new Date(result.dateMillis));
                    }
                  } catch (error) {
                    // M3 date picker not available, fall back to standard picker
                    setShowDatePicker(true);
                  }
                } else {
                  setShowDatePicker(!showDatePicker);
                }
              }}
            >
              <Icon name="calendar" size={18} color={Colors.light.textSecondary} />
              <Text style={styles.selectorChipText}>
                {selectedDate ? format(selectedDate, 'MMM d') : 'No date'}
              </Text>
              {selectedDate && (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    setSelectedDate(null);
                  }}
                  hitSlop={10}
                >
                  <Icon name="close-circle" size={16} color={Colors.light.textSecondary} />
                </Pressable>
              )}
            </Pressable>

            {/* Create button */}
            <Pressable
              style={[
                styles.tickButton,
                !taskName.trim() && styles.tickButtonDisabled,
              ]}
              onPress={handleCreate}
              disabled={!taskName.trim()}
            >
              <Icon name="tick-circle" size={36} color="#FFFFFF" variant="Bold" />
            </Pressable>
          </View>

          {/* Date picker fallback (iOS always, Android when M3 not available) */}
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </NativeBottomSheet>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  createForm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  input: {
    flex: 1,
    minWidth: 150,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.light.text,
  },
  selectorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  selectorChipText: {
    fontSize: FontSizes.sm,
    color: Colors.light.text,
  },
  tickButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 18,
    padding: 0,
  },
  tickButtonDisabled: {
    backgroundColor: Colors.light.textSecondary,
  },
});
