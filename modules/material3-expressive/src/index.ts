import { requireNativeView, requireNativeModule } from 'expo';
import * as React from 'react';
import { ViewProps, Platform, View, StyleSheet, NativeSyntheticEvent } from 'react-native';

// Native Module for function-based APIs
const Material3ExpressiveModule = Platform.OS === 'android'
  ? requireNativeModule('Material3Expressive')
  : null;

// ============ DATE PICKER FUNCTION ============
export interface ShowDatePickerOptions {
  selectedDate?: number; // milliseconds
  title?: string;
}

export interface DatePickerResult {
  cancelled: boolean;
  dateMillis?: number;
}

export async function showM3DatePicker(options: ShowDatePickerOptions = {}): Promise<DatePickerResult> {
  if (Platform.OS !== 'android' || !Material3ExpressiveModule) {
    return { cancelled: true };
  }

  return Material3ExpressiveModule.showDatePicker(options);
}

// ============ SELECTION SHEET FUNCTION ============
export interface SelectionItem {
  id: string;
  title: string;
  icon?: string;
  subtitle?: string;
}

export interface ShowSelectionSheetOptions {
  title: string;
  subtitle?: string;
  items: SelectionItem[];
}

export interface SelectionSheetResult {
  cancelled: boolean;
  selectedId?: string;
  selectedIndex?: number;
  selectedTitle?: string;
}

/**
 * Shows a native Material 3 bottom sheet with a list of items to select from.
 * On Android uses Jetpack Compose ModalBottomSheet.
 * Falls back to returning cancelled on iOS (use NativeBottomSheet there).
 */
export async function showM3SelectionSheet(options: ShowSelectionSheetOptions): Promise<SelectionSheetResult> {
  if (Platform.OS !== 'android' || !Material3ExpressiveModule) {
    return { cancelled: true };
  }

  return Material3ExpressiveModule.showSelectionSheet(options);
}

// ============ SETTINGS SHEET FUNCTION ============
export interface SettingsToggle {
  id: string;
  title: string;
  icon?: string;
  value: boolean;
}

export interface SettingsDropdown {
  id: string;
  title: string;
  icon?: string;
  options: string[];
  selectedIndex: number;
}

export interface ShowSettingsSheetOptions {
  title: string;
  toggles?: SettingsToggle[];
  dropdowns?: SettingsDropdown[];
}

export interface SettingsSheetResult {
  cancelled: boolean;
  toggles?: Record<string, boolean>;
  dropdowns?: Record<string, number>;
}

/**
 * Shows a native Material 3 bottom sheet with settings controls (toggles and dropdowns).
 * On Android uses Jetpack Compose ModalBottomSheet with native Switch and ExposedDropdownMenu.
 * Falls back to returning cancelled on iOS (use NativeBottomSheet there).
 */
export async function showM3SettingsSheet(options: ShowSettingsSheetOptions): Promise<SettingsSheetResult> {
  if (Platform.OS !== 'android' || !Material3ExpressiveModule) {
    return { cancelled: true };
  }

  return Material3ExpressiveModule.showSettingsSheet({
    ...options,
    toggles: options.toggles ?? [],
    dropdowns: options.dropdowns ?? [],
  });
}

// ============ TASK CREATION SHEET FUNCTION ============
export interface ShowTaskCreationSheetOptions {
  folders: string[];
  selectedFolderIndex?: number;
}

export interface TaskCreationSheetResult {
  cancelled: boolean;
  taskName?: string;
  folderIndex?: number;
  dueDateMillis?: number | null;
}

/**
 * Shows a native Material 3 bottom sheet for task creation.
 * Includes a text input, folder dropdown, and date picker.
 * On Android uses Jetpack Compose ModalBottomSheet with native controls.
 * Falls back to returning cancelled on iOS (use NativeBottomSheet there).
 */
export async function showM3TaskCreationSheet(options: ShowTaskCreationSheetOptions): Promise<TaskCreationSheetResult> {
  if (Platform.OS !== 'android' || !Material3ExpressiveModule) {
    return { cancelled: true };
  }

  return Material3ExpressiveModule.showTaskCreationSheet({
    ...options,
    selectedFolderIndex: options.selectedFolderIndex ?? 0,
  });
}

// ============ FOLDER CREATION SHEET FUNCTION ============
export interface FolderCreationSheetResult {
  cancelled: boolean;
  folderName?: string;
  icon?: string;
}

/**
 * Shows a native Material 3 bottom sheet for folder creation.
 * Simple input with folder icon and submit button.
 */
export async function showM3FolderCreationSheet(): Promise<FolderCreationSheetResult> {
  if (Platform.OS !== 'android' || !Material3ExpressiveModule) {
    return { cancelled: true };
  }

  return Material3ExpressiveModule.showFolderCreationSheet();
}

// ============ BUTTON ============
export type ButtonVariant = 'filled' | 'filledTonal' | 'outlined' | 'elevated' | 'text';

export interface M3ButtonProps extends ViewProps {
  label: string;
  variant?: ButtonVariant;
  enabled?: boolean;
}

// ============ CARD ============
export type CardVariant = 'filled' | 'elevated' | 'outlined';

export interface M3CardProps extends ViewProps {
  variant?: CardVariant;
}

// ============ FAB ============
export type FABIcon =
  | 'add' | 'edit' | 'delete' | 'check' | 'close'
  | 'search' | 'settings' | 'home' | 'favorite' | 'share'
  | 'menu' | 'refresh' | 'done' | 'info' | 'warning'
  | 'email' | 'phone' | 'person' | 'star' | 'send';

export interface M3FABProps extends ViewProps {
  icon?: FABIcon;
  label?: string;
  expanded?: boolean;
}

// ============ LOADING INDICATOR ============
export type LoadingVariant = 'circular' | 'linear';

export interface M3LoadingIndicatorProps extends ViewProps {
  variant?: LoadingVariant;
  progress?: number;
}

// ============ SWITCH ============
export interface M3SwitchProps extends ViewProps {
  value: boolean;
  onValueChange?: (value: boolean) => void;
  enabled?: boolean;
}

// ============ BOTTOM SHEET ============
export interface M3BottomSheetProps extends ViewProps {
  visible: boolean;
  title?: string;
  onDismiss?: () => void;
  children?: React.ReactNode;
}

// ============ DROPDOWN MENU ============
export interface M3DropdownMenuProps extends ViewProps {
  options: string[];
  selectedIndex: number;
  label?: string;
  onSelectionChange?: (index: number, value: string) => void;
}

// ============ DATE PICKER ============
export interface M3DatePickerProps extends ViewProps {
  visible: boolean;
  selectedDate?: number; // milliseconds
  title?: string;
  onDateSelected?: (dateMillis: number) => void;
  onDismiss?: () => void;
}

// ============ NAVIGATION BAR ============
export interface M3NavigationBarProps extends ViewProps {
  items: string[];
  selectedIndex: number;
  icons?: string[];
  selectedIcons?: string[];
  onItemSelected?: (index: number, name: string) => void;
}

// Native Views (Android only)
// requireNativeView takes (moduleName, viewName)
const NativeM3Button: React.ComponentType<any> | null = Platform.OS === 'android'
  ? requireNativeView('Material3Expressive', 'M3ExpressiveButton') : null;
const NativeM3Card: React.ComponentType<any> | null = Platform.OS === 'android'
  ? requireNativeView('Material3Expressive', 'M3ExpressiveCard') : null;
const NativeM3FAB: React.ComponentType<any> | null = Platform.OS === 'android'
  ? requireNativeView('Material3Expressive', 'M3ExpressiveFAB') : null;
const NativeM3LoadingIndicator: React.ComponentType<any> | null = Platform.OS === 'android'
  ? requireNativeView('Material3Expressive', 'M3ExpressiveLoadingIndicator') : null;
const NativeM3Switch: React.ComponentType<any> | null = Platform.OS === 'android'
  ? requireNativeView('Material3Expressive', 'M3ExpressiveSwitch') : null;

// Export availability check
export const isM3SwitchAvailable = Platform.OS === 'android' && NativeM3Switch !== null;
const NativeM3BottomSheet: React.ComponentType<any> | null = Platform.OS === 'android'
  ? requireNativeView('Material3Expressive', 'M3ExpressiveBottomSheet') : null;
const NativeM3DropdownMenu: React.ComponentType<any> | null = Platform.OS === 'android'
  ? requireNativeView('Material3Expressive', 'M3ExpressiveDropdownMenu') : null;

// Export availability check for dropdown
export const isM3DropdownAvailable = Platform.OS === 'android' && NativeM3DropdownMenu !== null;
const NativeM3DatePicker: React.ComponentType<any> | null = Platform.OS === 'android'
  ? requireNativeView('Material3Expressive', 'M3ExpressiveDatePicker') : null;
const NativeM3NavigationBar: React.ComponentType<any> | null = Platform.OS === 'android'
  ? requireNativeView('Material3Expressive', 'M3ExpressiveNavigationBar') : null;

// ============ COMPONENT IMPLEMENTATIONS ============

export function M3Button(props: M3ButtonProps) {
  const { label, variant = 'filled', enabled = true, style, ...viewProps } = props;

  if (Platform.OS !== 'android' || !NativeM3Button) {
    return React.createElement(View, { style: [styles.fallback, style], ...viewProps });
  }

  return React.createElement(NativeM3Button, {
    style: [styles.button, style],
    ...viewProps,
    label,
    variant,
    enabled,
  });
}

export function M3Card(props: M3CardProps) {
  const { variant = 'filled', style, ...viewProps } = props;

  if (Platform.OS !== 'android' || !NativeM3Card) {
    return React.createElement(View, { style: [styles.fallback, style], ...viewProps });
  }

  return React.createElement(NativeM3Card, {
    style: [styles.card, style],
    ...viewProps,
    variant,
  });
}

export function M3FAB(props: M3FABProps) {
  const { icon = 'add', label, expanded = true, style, ...viewProps } = props;

  if (Platform.OS !== 'android' || !NativeM3FAB) {
    return React.createElement(View, { style: [styles.fallback, style], ...viewProps });
  }

  return React.createElement(NativeM3FAB, {
    style: [styles.fab, style],
    ...viewProps,
    icon,
    label,
    expanded,
  });
}

export function M3LoadingIndicator(props: M3LoadingIndicatorProps) {
  const { variant = 'circular', progress, style, ...viewProps } = props;

  if (Platform.OS !== 'android' || !NativeM3LoadingIndicator) {
    return React.createElement(View, { style: [styles.fallback, style], ...viewProps });
  }

  return React.createElement(NativeM3LoadingIndicator, {
    style: [styles.indicator, style],
    ...viewProps,
    variant,
    progress,
  });
}

export function M3Switch(props: M3SwitchProps) {
  const { value, onValueChange, enabled = true, style, ...viewProps } = props;

  if (Platform.OS !== 'android' || !NativeM3Switch) {
    // Fallback to nothing on iOS - use native iOS switch
    return null;
  }

  return React.createElement(NativeM3Switch, {
    style: [styles.switch, style],
    ...viewProps,
    value,
    enabled,
    onValueChange: onValueChange ? (event: any) => {
      onValueChange(event.nativeEvent?.value ?? event);
    } : undefined,
  });
}

export function M3BottomSheet(props: M3BottomSheetProps) {
  const { visible, title, onDismiss, style, children, ...viewProps } = props;

  if (Platform.OS !== 'android' || !NativeM3BottomSheet) {
    return null;
  }

  return React.createElement(NativeM3BottomSheet, {
    style: [styles.bottomSheet, style],
    ...viewProps,
    visible,
    title,
    onDismiss: onDismiss ? () => onDismiss() : undefined,
  }, children);
}

export function M3DropdownMenu(props: M3DropdownMenuProps) {
  const { options, selectedIndex, label = '', onSelectionChange, style, ...viewProps } = props;

  if (Platform.OS !== 'android' || !NativeM3DropdownMenu) {
    return null;
  }

  return React.createElement(NativeM3DropdownMenu, {
    style: [styles.dropdown, style],
    ...viewProps,
    options,
    selectedIndex,
    label,
    onSelectionChange: onSelectionChange ? (event: any) => {
      onSelectionChange(event.nativeEvent?.index ?? 0, event.nativeEvent?.value ?? '');
    } : undefined,
  });
}

export function M3DatePicker(props: M3DatePickerProps) {
  const { visible, selectedDate, title = 'Select date', onDateSelected, onDismiss, style, ...viewProps } = props;

  if (Platform.OS !== 'android' || !NativeM3DatePicker) {
    return null;
  }

  return React.createElement(NativeM3DatePicker, {
    style: [styles.datePicker, style],
    ...viewProps,
    visible,
    selectedDate,
    title,
    onDateSelected: onDateSelected ? (event: any) => {
      onDateSelected(event.nativeEvent?.dateMillis ?? event);
    } : undefined,
    onDismiss: onDismiss ? () => onDismiss() : undefined,
  });
}

export function M3NavigationBar(props: M3NavigationBarProps) {
  const { items, selectedIndex, icons = [], selectedIcons = [], onItemSelected, style, ...viewProps } = props;

  if (Platform.OS !== 'android' || !NativeM3NavigationBar) {
    return null;
  }

  return React.createElement(NativeM3NavigationBar, {
    style: [styles.navigationBar, style],
    ...viewProps,
    items,
    selectedIndex,
    icons,
    selectedIcons,
    onItemSelected: onItemSelected ? (event: any) => {
      onItemSelected(event.nativeEvent?.index ?? 0, event.nativeEvent?.name ?? '');
    } : undefined,
  });
}

const styles = StyleSheet.create({
  fallback: {},
  button: { alignSelf: 'flex-start' },
  card: { width: '100%' },
  fab: { alignSelf: 'flex-start' },
  indicator: { alignSelf: 'flex-start' },
  switch: { alignSelf: 'flex-start' },
  bottomSheet: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  dropdown: { flex: 1, width: '100%', minHeight: 56 },
  datePicker: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  navigationBar: { width: '100%' },
});

export default {
  M3Button,
  M3Card,
  M3FAB,
  M3LoadingIndicator,
  M3Switch,
  M3BottomSheet,
  M3DropdownMenu,
  M3DatePicker,
  M3NavigationBar,
  showM3DatePicker,
  showM3SelectionSheet,
  showM3SettingsSheet,
  showM3TaskCreationSheet,
  showM3FolderCreationSheet,
};
