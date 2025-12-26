import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTaskStore } from '../store/taskStore';
import { Colors, Spacing, BorderRadius, FontSizes } from '../constants/theme';
import { FocusTimer } from './FocusTimer';
import { format } from 'date-fns';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FloatingActionButtonProps {
  defaultFolder?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  defaultFolder = 'Inbox',
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTimerVisible, setIsTimerVisible] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(defaultFolder);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  const { folders, addTask, selectionMode } = useTaskStore();
  const scale = useSharedValue(1);

  // In normal mode: open task creation
  // In selection mode: open focus timer
  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (selectionMode) {
      setIsTimerVisible(true);
    } else {
      setIsModalVisible(true);
    }
  }, [selectionMode]);

  const handleClose = useCallback(() => {
    setIsModalVisible(false);
    setTaskName('');
    setSelectedFolder(defaultFolder);
    setSelectedDate(null);
    setShowDatePicker(false);
    setShowFolderPicker(false);
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

  return (
    <>
      {/* Main FAB - changes icon based on selection mode */}
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
        <Ionicons
          name={selectionMode ? "time-outline" : "add"}
          size={28}
          color="#FFFFFF"
        />
      </AnimatedPressable>

      {/* Focus Timer Modal */}
      <FocusTimer
        visible={isTimerVisible}
        onClose={() => setIsTimerVisible(false)}
      />

      {/* Task Creation Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable style={styles.modalBackground} onPress={handleClose} />
          <View style={styles.modalContent}>
            <View style={styles.dragHandle} />

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

              {/* Folder selector chip */}
              <Pressable
                style={styles.selectorChip}
                onPress={() => setShowFolderPicker(!showFolderPicker)}
              >
                <Ionicons name="folder-outline" size={18} color={Colors.light.textSecondary} />
                <Text style={styles.selectorChipText}>{selectedFolder}</Text>
              </Pressable>

              {/* Date selector chip */}
              <Pressable
                style={styles.selectorChip}
                onPress={() => setShowDatePicker(!showDatePicker)}
              >
                <Ionicons name="calendar-outline" size={18} color={Colors.light.textSecondary} />
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
                    <Ionicons name="close-circle" size={16} color={Colors.light.textSecondary} />
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
                <Ionicons name="checkmark-circle" size={36} color="#FFFFFF" />
              </Pressable>
            </View>

            {/* Folder picker dropdown */}
            {showFolderPicker && (
              <ScrollView style={styles.pickerList} nestedScrollEnabled>
                {folders
                  .filter(f => f.name !== 'Completed')
                  .map(folder => (
                    <Pressable
                      key={folder.id}
                      style={[
                        styles.pickerItem,
                        selectedFolder === folder.name && styles.pickerItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedFolder(folder.name);
                        setShowFolderPicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedFolder === folder.name && styles.pickerItemTextSelected,
                        ]}
                      >
                        {folder.name}
                      </Text>
                    </Pressable>
                  ))}
              </ScrollView>
            )}

            {/* Date picker */}
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 76,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContent: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
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
  pickerList: {
    maxHeight: 150,
    backgroundColor: Colors.light.cardBackground,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  pickerItem: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  pickerItemSelected: {
    backgroundColor: 'rgba(29, 29, 29, 0.1)',
  },
  pickerItemText: {
    fontSize: FontSizes.md,
    color: Colors.light.text,
  },
  pickerItemTextSelected: {
    fontWeight: '600',
  },
});
