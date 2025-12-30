import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing } from '../constants/theme';
import { Icon } from './Icon';

interface FocusTimerProps {
  visible: boolean;
  onClose: () => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ visible, onClose }) => {
  const [duration, setDuration] = useState(45); // Default 45 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(45 * 60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const insets = useSafeAreaInsets();

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

    // Keep screen awake
    try {
      await activateKeepAwakeAsync('focus-timer');
    } catch (e) {
      console.log('Keep awake not available');
    }
  }, [duration]);

  // Stop timer
  const stopTimer = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRemainingSeconds(duration * 60);

    // Allow screen to sleep
    try {
      deactivateKeepAwake('focus-timer');
    } catch (e) {
      console.log('Keep awake not available');
    }
  }, [duration]);

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

  // Setup view (before timer starts) - black card design
  const renderSetupContent = () => (
    <View style={[styles.setupContainer, { paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.setupCard}>
        {/* Duration adjuster */}
        <View style={styles.durationContainer}>
          <Pressable
            style={styles.adjustButton}
            onPress={() => adjustDuration(-5)}
            disabled={duration <= 1}
          >
            <Text style={[styles.adjustButtonText, duration <= 1 && styles.adjustButtonDisabled]}>-</Text>
          </Pressable>

          <View style={styles.durationDisplay}>
            <Text style={styles.durationText}>{formatTime(duration * 60)}</Text>
          </View>

          <Pressable
            style={styles.adjustButton}
            onPress={() => adjustDuration(5)}
            disabled={duration >= 180}
          >
            <Text style={[styles.adjustButtonText, duration >= 180 && styles.adjustButtonDisabled]}>+</Text>
          </Pressable>
        </View>

        {/* Start button */}
        <Pressable style={styles.startButton} onPress={startTimer}>
          <Text style={styles.startButtonText}>Start The Session</Text>
        </Pressable>
      </View>
    </View>
  );

  // Running view (fullscreen black timer)
  const renderRunningView = () => (
    <View style={[styles.runningContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.runningCard}>
        {/* Timer display */}
        <View style={styles.timerContent}>
          <Text style={styles.taskLabel}>Focus Session</Text>
          <Text style={styles.timerText}>{formatTime(remainingSeconds)}</Text>
        </View>

        {/* Close button at bottom */}
        <Pressable style={styles.closeButton} onPress={handleClose}>
          <Icon name="close-circle" size={32} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );

  // When timer is running, show fullscreen Modal
  if (isRunning) {
    return (
      <Modal
        visible={visible}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={handleClose}
      >
        {renderRunningView()}
      </Modal>
    );
  }

  // When not running, show setup as floating card
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable onPress={e => e.stopPropagation()}>
          {renderSetupContent()}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  setupContainer: {
    paddingHorizontal: 20,
  },
  setupCard: {
    backgroundColor: '#1D1D1D',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    boxShadow: '0px 4px 13px 4px rgba(0, 0, 0, 0.30)',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  adjustButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustButtonText: {
    fontSize: 36,
    fontWeight: '300',
    color: '#FFFFFF',
  },
  adjustButtonDisabled: {
    color: '#666666',
  },
  durationDisplay: {
    width: 160,
    alignItems: 'center',
    marginHorizontal: Spacing.md,
  },
  durationText: {
    fontSize: 56,
    fontWeight: '600',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  startButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 60,
    paddingVertical: 14,
    borderRadius: 16,
    width: '100%',
  },
  startButtonText: {
    color: '#1D1D1D',
    fontSize: 16,
    fontWeight: '600',
  },
  runningContainer: {
    flex: 1,
    backgroundColor: '#1D1D1D',
  },
  runningCard: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  timerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskLabel: {
    fontSize: 18,
    color: '#888888',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 80,
    fontWeight: '600',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  closeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
