import React, { useState, useCallback } from 'react';
import { Platform, DynamicColorIOS, View, StyleSheet } from 'react-native';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/theme';
import { M3NavigationBar } from 'material3-expressive';

// Try to use native tabs with Liquid Glass on iOS
let NativeTabs: any = null;
let Icon: any = null;
let Label: any = null;

try {
  const nativeTabsModule = require('expo-router/unstable-native-tabs');
  NativeTabs = nativeTabsModule.NativeTabs;
  Icon = nativeTabsModule.Icon;
  Label = nativeTabsModule.Label;
} catch (e) {
  // Native tabs not available
}

// Tab configuration
const TABS = [
  { name: 'index', label: 'Today', icon: 'today', selectedIcon: 'today' },
  { name: 'upcoming', label: 'Upcoming', icon: 'calendar', selectedIcon: 'calendar' },
  { name: 'folders', label: 'Folders', icon: 'folder', selectedIcon: 'folder' },
];

// Native tabs layout for iOS with Liquid Glass
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
      <NativeTabs.Trigger name="index">
        <Icon sf="calendar.day.timeline.left" />
        <Label>Today</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="upcoming">
        <Icon sf="calendar" />
        <Label>Upcoming</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="folders">
        <Icon sf="folder.fill" />
        <Label>Folders</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

// Custom M3 Tab Bar for Android
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
    <View style={m3Styles.tabBarContainer}>
      <M3NavigationBar
        items={TABS.map(t => t.label)}
        selectedIndex={state.index}
        icons={TABS.map(t => t.icon)}
        selectedIcons={TABS.map(t => t.selectedIcon)}
        onItemSelected={handleItemSelected}
        style={m3Styles.navigationBar}
      />
    </View>
  );
}

// Set to true after running: npx expo run:android
// This requires a native rebuild to work
const USE_M3_NAVIGATION_BAR = true;

// Fallback JS tabs layout (iOS fallback and non-M3)
function JSTabLayout() {
  const isAndroid = Platform.OS === 'android';
  const useM3TabBar = isAndroid && USE_M3_NAVIGATION_BAR;

  return (
    <Tabs
      tabBar={useM3TabBar ? (props) => <M3TabBar {...props} /> : undefined}
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
        tabBarShowLabel: false,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "today" : "today-outline"}
              size={focused ? 30 : 28}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="upcoming"
        options={{
          title: 'Upcoming',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              size={focused ? 30 : 28}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="folders"
        options={{
          title: 'Folders',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "folder" : "folder-outline"}
              size={focused ? 30 : 28}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const m3Styles = StyleSheet.create({
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

  // Fallback to JS tabs
  return <JSTabLayout />;
}
