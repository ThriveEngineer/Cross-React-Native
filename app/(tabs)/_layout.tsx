import { Platform, DynamicColorIOS } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/theme';

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

// Fallback JS tabs layout
function JSTabLayout() {
  return (
    <Tabs
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

export default function TabLayout() {
  // Use native tabs on iOS if available for Liquid Glass effect
  if (Platform.OS === 'ios' && NativeTabs) {
    return <NativeTabLayout />;
  }

  // Fallback to JS tabs
  return <JSTabLayout />;
}
