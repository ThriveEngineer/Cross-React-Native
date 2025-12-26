import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { Colors, Spacing, FontSizes } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FocusTimerProps {
  visible: boolean;
  onClose: () => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ visible, onClose }) => {
  const [duration, setDuration] = useState(45); // Default 45 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(45 * 60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progress = useSharedValue(0);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle duration change
  const adjustDuration = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newDuration = Math.max(1, Math.min(180, duration + delta));
    setDuration(newDuration);
    setRemainingSeconds(newDuration * 60);
  };

  // Start timer
  const startTimer = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsRunning(true);
    setRemainingSeconds(duration * 60);
    progress.value = withTiming(1, { duration: duration * 60 * 1000 });

    // Keep screen awake
    try {
      await activateKeepAwakeAsync('focus-timer');
    } catch (e) {
      console.log('Keep awake not available');
    }
  }, [duration, progress]);

  // Stop timer
  const stopTimer = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    progress.value = withTiming(0, { duration: 300 });
    setRemainingSeconds(duration * 60);

    // Allow screen to sleep
    try {
      deactivateKeepAwake('focus-timer');
    } catch (e) {
      console.log('Keep awake not available');
    }
  }, [duration, progress]);

  // Timer countdown effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            // Timer complete
            stopTimer();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, stopTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      try {
        deactivateKeepAwake('focus-timer');
      } catch (e) {
        // Ignore
      }
    };
  }, []);

  // Handle close
  const handleClose = useCallback(() => {
    if (isRunning) {
      stopTimer();
    }
    onClose();
  }, [isRunning, stopTimer, onClose]);

  // Animated styles for progress ring
  const animatedProgressStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      progress.value,
      [0, 1],
      [0, 360],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  // Setup view (before timer starts) - matches Flutter layout
  const renderSetupView = () => (
    <View style={styles.setupContainer}>
      <View style={styles.dragHandle} />

      {/* Duration adjuster */}
      <View style={styles.durationContainer}>
        <Pressable
          style={styles.adjustButton}
          onPress={() => adjustDuration(-5)}
          disabled={duration <= 1}
        >
          <Ionicons
            name="remove"
            size={32}
            color={duration <= 1 ? Colors.light.textSecondary : Colors.light.text}
          />
        </Pressable>

        <View style={styles.durationDisplay}>
          <Text style={styles.durationText}>{formatTime(duration * 60)}</Text>
        </View>

        <Pressable
          style={styles.adjustButton}
          onPress={() => adjustDuration(5)}
          disabled={duration >= 180}
        >
          <Ionicons
            name="add"
            size={32}
            color={duration >= 180 ? Colors.light.textSecondary : Colors.light.text}
          />
        </Pressable>
      </View>

      {/* Start button */}
      <Pressable style={styles.startButton} onPress={startTimer}>
        <Ionicons name="play" size={24} color="#FFFFFF" />
        <Text style={styles.startButtonText}>Start Focus Session</Text>
      </Pressable>
    </View>
  );

  // Running view (fullscreen timer)
  const renderRunningView = () => (
    <View style={styles.runningContainer}>
      {/* Close button */}
      <Pressable style={styles.closeButton} onPress={handleClose}>
        <Ionicons name="close" size={28} color={Colors.light.textSecondary} />
      </Pressable>

      {/* Timer display */}
      <View style={styles.timerCircle}>
        <Animated.View style={[styles.progressRing, animatedProgressStyle]} />
        <View style={styles.timerInner}>
          <Text style={styles.timerText}>{formatTime(remainingSeconds)}</Text>
          <Text style={styles.timerLabel}>remaining</Text>
        </View>
      </View>

      {/* Stop button */}
      <Pressable style={styles.stopButton} onPress={stopTimer}>
        <Ionicons name="stop" size={24} color="#FFFFFF" />
        <Text style={styles.stopButtonText}>Stop Session</Text>
      </Pressable>

      {/* Motivational text */}
      <Text style={styles.motivationalText}>
        Stay focused. You've got this!
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={!isRunning}
      onRequestClose={handleClose}
    >
      <View style={[styles.modalContainer, isRunning && styles.fullscreenContainer]}>
        {!isRunning && (
          <Pressable style={styles.backdrop} onPress={handleClose} />
        )}
        {isRunning ? renderRunningView() : renderSetupView()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  fullscreenContainer: {
    justifyContent: 'center',
    backgroundColor: Colors.light.background,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  setupContainer: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
    width: 365,
    alignSelf: 'center',
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: 2,
    marginBottom: Spacing.xl,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  adjustButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationDisplay: {
    width: 160,
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
  },
  durationText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 75,
    paddingVertical: 9,
    borderRadius: 16,
    gap: Spacing.sm,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  runningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    padding: Spacing.lg,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: Spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerCircle: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    borderRadius: SCREEN_WIDTH * 0.35,
    backgroundColor: Colors.light.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  progressRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: SCREEN_WIDTH * 0.35,
    borderWidth: 4,
    borderColor: Colors.light.primary,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  timerInner: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 96,
    fontWeight: 'bold',
    color: Colors.light.text,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: FontSizes.md,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.error,
    paddingHorizontal: 80,
    paddingVertical: 16,
    borderRadius: 16,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  motivationalText: {
    fontSize: FontSizes.md,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
  },
});
