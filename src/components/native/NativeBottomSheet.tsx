import React, { useEffect } from 'react';
import { Platform, View, Modal, Pressable, StyleSheet, KeyboardAvoidingView, Dimensions, useColorScheme } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  useAnimatedKeyboard,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { Colors } from '../../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DISMISS_THRESHOLD = 100;

interface NativeBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const NativeBottomSheet: React.FC<NativeBottomSheetProps> = ({
  visible,
  onClose,
  children,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <BottomSheetImpl visible={visible} onClose={onClose} isDark={isDark}>
      {children}
    </BottomSheetImpl>
  );
};

// Implementation with proper keyboard handling
const BottomSheetImpl: React.FC<NativeBottomSheetProps & { isDark: boolean }> = ({
  visible,
  onClose,
  children,
  isDark,
}) => {
  const translateY = useSharedValue(0);
  const keyboardOffset = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  // Use Reanimated's keyboard hook for smooth keyboard-aware animations
  const keyboard = useAnimatedKeyboard();

  useEffect(() => {
    if (visible) {
      translateY.value = 0;
    }
  }, [visible]);

  // React to keyboard height changes
  useAnimatedReaction(
    () => keyboard.height.value,
    (currentHeight) => {
      keyboardOffset.value = withSpring(currentHeight, {
        damping: 20,
        stiffness: 300,
      });
    },
    [keyboard]
  );

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      // Only allow dragging down
      translateY.value = Math.max(0, context.value.y + event.translationY);
    })
    .onEnd((event) => {
      if (translateY.value > DISMISS_THRESHOLD || event.velocityY > 500) {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 });
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
    ],
  }));

  // Animate the sheet container to move up with keyboard
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    paddingBottom: keyboardOffset.value,
  }));

  const dynamicStyles = {
    sheet: {
      backgroundColor: isDark ? '#1D1B20' : '#F3EDF7',
    },
    dragHandle: {
      backgroundColor: isDark ? '#938F99' : '#79747E',
    },
  };

  // Material 3 Bottom Sheet design
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* M3 Scrim - 32% opacity */}
        <Pressable style={styles.scrim} onPress={onClose} />

        {/* M3 Bottom Sheet with keyboard-aware animation */}
        <Animated.View style={[styles.sheetWrapper, containerAnimatedStyle]}>
          <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.sheet, dynamicStyles.sheet, animatedStyle]}>
              {/* M3 Drag Handle */}
              <View style={styles.dragHandleContainer}>
                <View style={[styles.dragHandle, dynamicStyles.dragHandle]} />
              </View>

              {/* Content */}
              <View style={styles.content}>
                {children}
              </View>
            </Animated.View>
          </GestureDetector>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.32)', // M3 scrim opacity
  },
  sheetWrapper: {
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  sheet: {
    borderTopLeftRadius: 28, // M3 corner radius
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 22,
    paddingBottom: 22,
  },
  dragHandle: {
    width: 32, // M3 drag handle width
    height: 4, // M3 drag handle height
    borderRadius: 2,
    opacity: 0.4,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
});
