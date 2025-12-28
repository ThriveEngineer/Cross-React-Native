import React from 'react';
import { Platform, Switch as RNSwitch, View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';
import { M3Switch, isM3SwitchAvailable } from 'material3-expressive';

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
  // Use M3 Switch on Android if available
  if (isM3SwitchAvailable) {
    return (
      <View style={styles.m3SwitchContainer}>
        <M3Switch
          value={value}
          onValueChange={onValueChange}
          enabled={!disabled}
          style={styles.m3Switch}
        />
      </View>
    );
  }

  // Fallback: React Native switch (iOS or Android fallback)
  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{
        false: '#E9E9EA',
        true: Colors.light.primary,
      }}
      thumbColor={Platform.OS === 'android' ? (value ? Colors.light.primary : '#f4f3f4') : undefined}
      ios_backgroundColor="#E9E9EA"
    />
  );
};

const styles = StyleSheet.create({
  m3SwitchContainer: {
    width: 52,
    height: 32,
  },
  m3Switch: {
    width: 52,
    height: 32,
  },
});
