import React, { useCallback } from 'react';
import { Platform, DynamicColorIOS, View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Colors } from '../../src/constants/theme';
import { M3NavigationBar } from 'material3-expressive';

// Try to use native tabs with Liquid Glass on iOS
let NativeTabs: any = null;
let NativeIcon: any = null;
let Label: any = null;

try {
  const nativeTabsModule = require('expo-router/unstable-native-tabs');
  NativeTabs = nativeTabsModule.NativeTabs;
  NativeIcon = nativeTabsModule.Icon;
  Label = nativeTabsModule.Label;
} catch (e) {
  // Native tabs not available
}

// Tab configuration - icon names match both Iconsax (Android drawables) and are used for SF Symbols mapping
const TABS = [
  { name: 'index', label: 'Today', icon: 'today', sfSymbol: 'calendar.day.timeline.left' },
  { name: 'upcoming', label: 'Upcoming', icon: 'calendar', sfSymbol: 'calendar' },
  { name: 'folders', label: 'Folders', icon: 'folder', sfSymbol: 'folder.fill' },
];

// Native tabs layout for iOS with Liquid Glass and SF Symbols
function NativeTabLayout() {
  if (!NativeTabs) return null;

  const tintColor = Platform.OS === 'ios'
    ? DynamicColorIOS({ dark: 'white', light: 'black' })
    : Colors.light.primary;

  return (
    <NativeTabs
      labelStyle={{
        color: tintColor,
      }}
      tintColor={tintColor}
    >
      {TABS.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <NativeIcon sf={tab.sfSymbol} />
          <Label>{tab.label}</Label>
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}

// Native M3 Navigation Bar for Android using custom Iconsax drawables
function M3TabBar({ state, navigation }: any) {
  const handleItemSelected = useCallback((index: number) => {
    const route = state.routes[index];
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  }, [state.routes, navigation]);

  return (
    <View style={styles.tabBarContainer}>
      <M3NavigationBar
        items={TABS.map(tab => tab.label)}
        icons={TABS.map(tab => tab.icon)}
        selectedIcons={TABS.map(tab => tab.icon)}
        selectedIndex={state.index}
        onItemSelected={(index) => handleItemSelected(index)}
        style={styles.navigationBar}
      />
    </View>
  );
}

// Fallback JS tabs layout
function JSTabLayout() {
  const isAndroid = Platform.OS === 'android';

  return (
    <Tabs
      tabBar={isAndroid ? (props) => <M3TabBar {...props} /> : undefined}
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.light.surface,
          borderTopColor: '#CACACA',
          borderTopWidth: 0.5,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarShowLabel: true,
        headerShown: false,
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{ title: tab.label }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: Colors.light.surface,
  },
  navigationBar: {
    height: 80,
  },
});

export default function TabLayout() {
  // Use native tabs on iOS if available for Liquid Glass effect
  if (Platform.OS === 'ios' && NativeTabs) {
    return <NativeTabLayout />;
  }

  // Use JS tabs with native M3NavigationBar on Android
  return <JSTabLayout />;
}
