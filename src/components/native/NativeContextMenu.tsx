import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

// Note: @expo/ui requires a development build (npx expo prebuild)
// For Expo Go compatibility, we use a custom React Native Modal menu
// To enable native SwiftUI/Jetpack ContextMenu, run a development build

export interface MenuOption {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
}

interface NativeContextMenuProps {
  options: MenuOption[];
  children: React.ReactNode;
}

export const NativeContextMenu: React.FC<NativeContextMenuProps> = ({
  options,
  children,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  // Custom modal menu
  return (
    <>
      <Pressable onPress={() => setMenuVisible(true)}>
        {children}
      </Pressable>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            {options.map((option, index) => (
              <React.Fragment key={index}>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    option.onPress();
                  }}
                >
                  {option.icon && (
                    <Ionicons
                      name={option.icon}
                      size={20}
                      color={option.destructive ? Colors.light.error : Colors.light.text}
                    />
                  )}
                  <Text
                    style={[
                      styles.menuText,
                      option.destructive && styles.menuTextDestructive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
                {index < options.length - 1 && <View style={styles.menuDivider} />}
              </React.Fragment>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: Spacing.lg,
  },
  menuContainer: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  menuText: {
    fontSize: FontSizes.md,
    color: Colors.light.text,
  },
  menuTextDestructive: {
    color: Colors.light.error,
  },
  menuDivider: {
    height: 0.5,
    backgroundColor: Colors.light.border,
  },
});
