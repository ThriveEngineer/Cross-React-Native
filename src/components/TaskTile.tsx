import * as Haptics from 'expo-haptics';
import { TickSquare } from 'iconsax-react-nativejs';
import React, { memo, useCallback, useMemo } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors, FontSizes, Spacing } from '../constants/theme';
import { useTaskStore } from '../store/taskStore';
import { Task } from '../types/types';
import { Icon } from './Icon';

interface TaskTileProps {
  task: Task;
  onPress?: () => void;
  onLongPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Pre-load image to avoid loading on every render
const STRANGER_THINGS_IMAGE = require('../../assets/demo_head.png');

const TaskTileComponent: React.FC<TaskTileProps> = ({ task, onPress, onLongPress }) => {
  const {
    showFolderNames,
    selectionMode,
    selectedTasks,
    toggleTaskSelection,
    toggleTaskCompletion,
  } = useTaskStore();

  const isSelected = selectedTasks.has(task.id);
  // Memoize expensive string check
  const isStrangerThings = useMemo(
    () => task.name.toLowerCase().includes('stranger things'),
    [task.name]
  );

  const scale = useSharedValue(1);
  const checkScale = useSharedValue(task.completed ? 1 : 0);
  const opacity = useSharedValue(task.completed ? 0.6 : 1);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (selectionMode) {
      toggleTaskSelection(task.id);
    } else {
      // Animate checkbox
      checkScale.value = withSpring(task.completed ? 0 : 1, {
        damping: 15,
        stiffness: 200,
      });
      opacity.value = withTiming(task.completed ? 1 : 0.6, { duration: 200 });

      toggleTaskCompletion(task.id);
      onPress?.();
    }
  }, [selectionMode, task.id, task.completed, toggleTaskSelection, toggleTaskCompletion, onPress, checkScale, opacity]);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress?.();
  }, [onLongPress]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedCheckStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  // Update animation values when task changes
  React.useEffect(() => {
    checkScale.value = withSpring(task.completed ? 1 : 0, {
      damping: 15,
      stiffness: 200,
    });
    opacity.value = withTiming(task.completed ? 0.6 : 1, { duration: 200 });
  }, [task.completed, checkScale, opacity]);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      style={[
        styles.container,
        animatedContainerStyle,
        isStrangerThings && styles.strangerThingsContainer,
        isSelected && styles.selectedContainer,
      ]}
    >
      {/* Task Checkbox */}
      {isStrangerThings ? (
        <View style={styles.checkboxContainer}>
          <Image
            source={STRANGER_THINGS_IMAGE}
            style={styles.strangerThingsIcon}
            resizeMode="contain"
          />
        </View>
      ) : (
        <View style={styles.checkboxContainer}>
          <Animated.View style={animatedCheckStyle}>
            <TickSquare size={22} color="#000000" variant="Bold" />
          </Animated.View>
          {!task.completed && (
            <View style={styles.checkbox} />
          )}
        </View>
      )}

      {/* Task name */}
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.taskName,
            task.completed && styles.taskNameCompleted,
          ]}
          numberOfLines={2}
        >
          {task.name}
        </Text>
      </View>

      {/* Folder name */}
      {showFolderNames && (
        <Text style={styles.folderName}>{task.folder}</Text>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 14,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  strangerThingsContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  },
  selectedContainer: {
    backgroundColor: 'rgba(29, 29, 29, 0.2)',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.light.checkbox.unchecked,
    backgroundColor: 'transparent',
    position: 'absolute',
  },
  checkboxContainer: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  strangerThingsIcon: {
    width: 20,
    height: 20,
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
  taskName: {
    fontSize: FontSizes.md,
    color: Colors.light.text,
  },
  taskNameCompleted: {
    color: Colors.light.textSecondary,
    textDecorationLine: 'line-through',
  },
  folderName: {
    fontSize: FontSizes.sm,
    color: Colors.light.textSecondary,
    marginLeft: 10,
  },
});

// Wrap with React.memo for performance - only re-render when task props change
export const TaskTile = memo(TaskTileComponent, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.name === nextProps.task.name &&
    prevProps.task.completed === nextProps.task.completed &&
    prevProps.task.folder === nextProps.task.folder &&
    prevProps.onPress === nextProps.onPress &&
    prevProps.onLongPress === nextProps.onLongPress
  );
});
