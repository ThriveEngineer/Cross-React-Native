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
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTaskStore } from '../store/taskStore';
import { Colors, Spacing, BorderRadius, FontSizes } from '../constants/theme';
import { FocusTimer } from './FocusTimer';
import { format } from 'date-fns';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

interface FloatingActionButtonProps {
  defaultFolder?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  defaultFolder = 'Inbox',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTimerVisible, setIsTimerVisible] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(defaultFolder);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  const { folders, addTask } = useTaskStore();
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const menuOpacity = useSharedValue(0);
  const menuTranslateY = useSharedValue(20);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsExpanded(!isExpanded);
    rotation.value = withSpring(isExpanded ? 0 : 45);
    menuOpacity.value = withTiming(isExpanded ? 0 : 1, { duration: 200 });
    menuTranslateY.value = withSpring(isExpanded ? 20 : 0);
  }, [isExpanded, rotation, menuOpacity, menuTranslateY]);

  const handleAddTask = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(false);
    rotation.value = withSpring(0);
    menuOpacity.value = withTiming(0, { duration: 150 });
    menuTranslateY.value = withSpring(20);
    setIsModalVisible(true);
  }, [rotation, menuOpacity, menuTranslateY]);

  const handleOpenTimer = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(false);
    rotation.value = withSpring(0);
    menuOpacity.value = withTiming(0, { duration: 150 });
    menuTranslateY.value = withSpring(20);
    setIsTimerVisible(true);
  }, [rotation, menuOpacity, menuTranslateY]);

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
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  const menuAnimatedStyle = useAnimatedStyle(() => ({
    opacity: menuOpacity.value,
    transform: [{ translateY: menuTranslateY.value }],
  }));

  const handleDateChange = (_event: unknown, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <>
      {/* Backdrop when expanded */}
      {isExpanded && (
        <Pressable
          style={styles.fabBackdrop}
          onPress={() => {
            setIsExpanded(false);
            rotation.value = withSpring(0);
            menuOpacity.value = withTiming(0, { duration: 150 });
            menuTranslateY.value = withSpring(20);
          }}
        />
      )}

      {/* Expanded menu items */}
      <AnimatedView style={[styles.fabMenu, menuAnimatedStyle]} pointerEvents={isExpanded ? 'auto' : 'none'}>
        {/* Timer button */}
        <Pressable style={styles.fabMenuItem} onPress={handleOpenTimer}>
          <View style={styles.fabMenuIcon}>
            <Ionicons name="timer-outline" size={22} color={Colors.light.text} />
          </View>
          <Text style={styles.fabMenuLabel}>Focus Timer</Text>
        </Pressable>

        {/* Add task button */}
        <Pressable style={styles.fabMenuItem} onPress={handleAddTask}>
          <View style={styles.fabMenuIcon}>
            <Ionicons name="checkbox-outline" size={22} color={Colors.light.text} />
          </View>
          <Text style={styles.fabMenuLabel}>New Task</Text>
        </Pressable>
      </AnimatedView>

      {/* Main FAB */}
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
        <Ionicons name="add" size={28} color="#FFFFFF" />
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Task</Text>
              <Pressable onPress={handleClose} hitSlop={10}>
                <Ionicons name="close" size={24} color={Colors.light.text} />
              </Pressable>
            </View>

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

            {/* Folder selector */}
            <Pressable
              style={styles.selector}
              onPress={() => setShowFolderPicker(!showFolderPicker)}
            >
              <Ionicons name="folder-outline" size={20} color={Colors.light.textSecondary} />
              <Text style={styles.selectorText}>{selectedFolder}</Text>
              <Ionicons
                name={showFolderPicker ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={Colors.light.textSecondary}
              />
            </Pressable>

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

            {/* Date selector */}
            <Pressable
              style={styles.selector}
              onPress={() => setShowDatePicker(!showDatePicker)}
            >
              <Ionicons name="calendar-outline" size={20} color={Colors.light.textSecondary} />
              <Text style={styles.selectorText}>
                {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'No date'}
              </Text>
              {selectedDate && (
                <Pressable
                  onPress={() => setSelectedDate(null)}
                  hitSlop={10}
                >
                  <Ionicons name="close-circle" size={20} color={Colors.light.textSecondary} />
                </Pressable>
              )}
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}

            <Pressable
              style={[styles.createButton, !taskName.trim() && styles.createButtonDisabled]}
              onPress={handleCreate}
              disabled={!taskName.trim()}
            >
              <Text style={styles.createButtonText}>Create Task</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fabBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  fabMenu: {
    position: 'absolute',
    bottom: 160,
    right: Spacing.lg,
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  fabMenuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  fabMenuLabel: {
    backgroundColor: Colors.light.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.light.text,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: Spacing.lg,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl + 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.light.text,
  },
  input: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  selectorText: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.light.text,
  },
  pickerList: {
    maxHeight: 150,
    backgroundColor: Colors.light.cardBackground,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
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
  createButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  createButtonDisabled: {
    backgroundColor: Colors.light.textSecondary,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
