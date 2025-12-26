import React from 'react';
import { Platform, Switch as RNSwitch } from 'react-native';
import { Colors } from '../../constants/theme';

// Note: @expo/ui requires a development build (npx expo prebuild)
// For Expo Go compatibility, we use React Native Switch directly
// To enable native SwiftUI/Jetpack components, run a development build

interface NativeSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export const NativeSwitch: React.FC<NativeSwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
}) => {
  // React Native Switch with native iOS/Android styling
  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{
        false: Platform.OS === 'ios' ? '#E9E9EA' : '#767577',
        true: Colors.light.primary,
      }}
      thumbColor={Platform.OS === 'android' ? (value ? Colors.light.primary : '#f4f3f4') : undefined}
      ios_backgroundColor="#E9E9EA"
    />
  );
};
