import React from 'react';
import { Platform, View, Modal, Pressable, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { Colors } from '../../constants/theme';

// Note: @expo/ui requires a development build (npx expo prebuild)
// For Expo Go compatibility, we use a custom React Native Modal
// To enable native SwiftUI BottomSheet, run a development build

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
  // Custom modal sheet with native feel
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.dragHandle} />
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  sheet: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  dragHandle: {
    width: 36,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
});
