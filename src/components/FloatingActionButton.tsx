import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  InteractionManager,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTaskStore } from '../store/taskStore';
import { Colors, Spacing, FontSizes } from '../constants/theme';
import { showM3TaskCreationSheet, isNativeSheetsAvailable } from 'material3-expressive';
import { NativeDropdown, NativeBottomSheet } from './native';
import { Icon } from './Icon';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';

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

    // Use native sheet if available, otherwise use fallback modal
    if (isNativeSheetsAvailable) {
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
      // Fallback to React Native modal
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
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  // Hide FAB in selection mode (timer is shown in selection bar instead)
  if (selectionMode) {
    return null;
  }

  const useGlass = Platform.OS === 'ios' && GlassView && isLiquidGlassAvailable();

  const renderFabContent = () => (
    <Icon
      name="add"
      size={28}
      color={useGlass ? Colors.light.text : "#FFFFFF"}
    />
  );

  return (
    <>
      {useGlass ? (
        <AnimatedPressable
          onPress={handlePress}
          onPressIn={() => {
            scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
          }}
          onPressOut={() => {
            scale.value = withSpring(1, { damping: 15, stiffness: 300 });
          }}
          style={[styles.fabContainer, animatedStyle]}
        >
          <GlassView style={styles.glassFab} glassEffectStyle="regular">
            {renderFabContent()}
          </GlassView>
        </AnimatedPressable>
      ) : (
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
          {renderFabContent()}
        </AnimatedPressable>
      )}

      {/* Fallback modal when native sheets aren't available */}
      {!isNativeSheetsAvailable && (
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

            <NativeDropdown
              options={availableFolders.map(f => f.name)}
              selectedIndex={Math.max(0, availableFolders.findIndex(f => f.name === selectedFolder))}
              onSelectionChange={(index, value) => {
                setSelectedFolder(value);
              }}
            />

            <Pressable
              style={styles.selectorChip}
              onPress={() => setShowDatePicker(!showDatePicker)}
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

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display="spinner"
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
  fabContainer: {
    position: 'absolute',
    top: 0,
    right: 20,
  },
  glassFab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    top: 0,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
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
