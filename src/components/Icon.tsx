import React from 'react';
import { SvgProps } from 'react-native-svg';
import {
  // Navigation & Arrows
  ArrowLeft,
  ArrowLeft2,
  ArrowRight,
  ArrowRight3,
  ArrowUp3,
  ArrowDown,
  ArrowDown2,
  // Messages & Notifications
  DirectboxNotif,
  // Favorites & Ratings
  Heart,
  Star,
  Star1,
  Like1,
  // Checkmarks & Status
  TickSquare,
  TickCircle,
  CloseSquare,
  CloseCircle,
  // Menu & UI
  HamburgerMenu,
  Menu,
  // Sync & Cloud
  Refresh,
  Cloud,
  CloudChange,
  CloudCross,
  // Settings
  Setting,
  Setting3,
  Setting4,
  // Mouse & Selection
  MouseSquare,
  // Calendar & Time
  Calendar,
  Calendar1,
  Clock,
  Timer1,
  // Folders & Files
  Folder,
  Folder2,
  FolderOpen,
  FolderFavorite,
  FolderCross,
  FolderAdd,
  // Archive & Tasks
  Archive,
  TaskSquare,
  Note,
  // Work & Categories
  Briefcase,
  Home,
  Home2,
  ShoppingCart,
  Book,
  Book1,
  // Charts & Trends
  TrendUp,
  // Actions
  Trash,
  Add,
  AddCircle,
  Minus,
  MinusCirlce,
  // Info
  InfoCircle,
  // Other
  Autobrightness,
  Global,
  Component,
  // Sorting & Organization
  Sort,
  Blend,
  Category,
  Category2,
  Text,
  // Visual
  Paintbucket,
  Colorfilter,
  // Messages
  Messages2,
  // Additional icons for UI
  Eye,
  EyeSlash,
  Edit,
  Edit2,
  More,
  More2,
  Grid1,
  // Mail/Inbox
  DirectInbox,
  Sms,
  // Additional folder icons
  Bookmark,
  Bookmark2,
  Flag,
  Flag2,
  Gift,
  Lamp,
  Music,
  Musicnote,
  Camera,
  Airplane,
  Car,
  // Health & Fitness
  Health,
  // Education
  Teacher,
  // Checkmark
  Check,
} from 'iconsax-react-nativejs';

// Icon variant types matching iconsax-react-nativejs
export type IconVariant = 'Linear' | 'Outline' | 'Broken' | 'Bold' | 'Bulk' | 'TwoTone';

// All available icon names used in the app
export type IconName =
  // Navigation
  | 'arrow-left'
  | 'arrow-left-2'
  | 'arrow-right'
  | 'arrow-right-3'
  | 'arrow-up-3'
  | 'arrow-down'
  | 'arrow-down-2'
  | 'chevron-back'
  | 'chevron-forward'
  | 'chevron-up'
  | 'chevron-down'
  // Messages & Notifications
  | 'directbox-notif'
  | 'inbox'
  // Favorites & Ratings
  | 'heart'
  | 'star'
  | 'like'
  // Checkmarks & Status
  | 'tick-square'
  | 'tick-circle'
  | 'close-square'
  | 'close-circle'
  | 'checkmark'
  | 'checkmark-circle'
  // Menu & UI
  | 'menu'
  | 'hamburger-menu'
  // Sync & Cloud
  | 'refresh'
  | 'sync'
  | 'cloud'
  | 'cloud-change'
  | 'cloud-done'
  | 'cloud-cross'
  | 'cloud-offline'
  // Settings
  | 'setting'
  | 'setting-3'
  | 'setting-4'
  | 'settings'
  // Mouse & Selection
  | 'mouse-square'
  | 'checkbox'
  | 'ellipse'
  // Calendar & Time
  | 'calendar'
  | 'calendar-1'
  | 'today'
  | 'clock'
  | 'timer'
  // Folders & Files
  | 'folder'
  | 'folder-open'
  | 'folder-favorite'
  | 'folder-cross'
  | 'folder-add'
  // Archive & Tasks
  | 'archive'
  | 'task-square'
  | 'note'
  // Work & Categories
  | 'briefcase'
  | 'home'
  | 'shopping-cart'
  | 'cart'
  | 'book'
  // Charts & Trends
  | 'trend-up'
  // Actions
  | 'trash'
  | 'add'
  | 'add-circle'
  | 'minus'
  | 'minus-circle'
  // Info
  | 'info-circle'
  // Other features
  | 'autobrightness'
  | 'global'
  | 'globe'
  | 'component'
  | 'apps'
  // Sorting & Organization
  | 'sort'
  | 'blend'
  | 'category'
  | 'text'
  | 'list'
  | 'options'
  | 'grid'
  // Visual
  | 'paintbucket'
  | 'color-palette'
  // Messages
  | 'messages'
  | 'chatbubbles'
  // Eye
  | 'eye'
  | 'eye-slash'
  // Edit
  | 'edit'
  // More
  | 'more'
  // Additional folder icons
  | 'bookmark'
  | 'flag'
  | 'gift'
  | 'bulb'
  | 'lamp'
  | 'fitness'
  | 'health'
  | 'music'
  | 'musical-notes'
  | 'camera'
  | 'airplane'
  | 'car'
  | 'restaurant'
  | 'cafe'
  | 'medical'
  | 'school'
  | 'library'
  | 'lock-closed'
  | 'thumbs-up';

// Map icon names to actual Iconsax components
const IconMap: Record<IconName, React.FC<SvgProps & { variant?: IconVariant }>> = {
  // Navigation
  'arrow-left': ArrowLeft,
  'arrow-left-2': ArrowLeft2,
  'arrow-right': ArrowRight,
  'arrow-right-3': ArrowRight3,
  'arrow-up-3': ArrowUp3,
  'arrow-down': ArrowDown,
  'arrow-down-2': ArrowDown2,
  'chevron-back': ArrowLeft2,
  'chevron-forward': ArrowRight3,
  'chevron-up': ArrowUp3,
  'chevron-down': ArrowDown2,
  // Messages & Notifications
  'directbox-notif': DirectboxNotif,
  'inbox': DirectboxNotif,
  // Favorites & Ratings
  'heart': Heart,
  'star': Star1,
  'like': Like1,
  // Checkmarks & Status
  'tick-square': TickSquare,
  'tick-circle': TickCircle,
  'close-square': CloseSquare,
  'close-circle': CloseCircle,
  'checkmark': TickCircle,
  'checkmark-circle': TickCircle,
  // Menu & UI
  'menu': HamburgerMenu,
  'hamburger-menu': HamburgerMenu,
  // Sync & Cloud
  'refresh': Refresh,
  'sync': Refresh,
  'cloud': Cloud,
  'cloud-change': CloudChange,
  'cloud-done': CloudChange,
  'cloud-cross': CloudCross,
  'cloud-offline': CloudCross,
  // Settings
  'setting': Setting,
  'setting-3': Setting3,
  'setting-4': Setting4,
  'settings': Setting,
  // Mouse & Selection
  'mouse-square': MouseSquare,
  'checkbox': TickSquare,
  'ellipse': CloseCircle,
  // Calendar & Time
  'calendar': Calendar,
  'calendar-1': Calendar1,
  'today': Calendar1,
  'clock': Clock,
  'timer': Timer1,
  // Folders & Files
  'folder': Folder,
  'folder-open': FolderOpen,
  'folder-favorite': FolderFavorite,
  'folder-cross': FolderCross,
  'folder-add': FolderAdd,
  // Archive & Tasks
  'archive': Archive,
  'task-square': TaskSquare,
  'note': Note,
  // Work & Categories
  'briefcase': Briefcase,
  'home': Home2,
  'shopping-cart': ShoppingCart,
  'cart': ShoppingCart,
  'book': Book1,
  // Charts & Trends
  'trend-up': TrendUp,
  // Actions
  'trash': Trash,
  'add': Add,
  'add-circle': AddCircle,
  'minus': Minus,
  'minus-circle': MinusCirlce,
  // Info
  'info-circle': InfoCircle,
  // Other features
  'autobrightness': Autobrightness,
  'global': Global,
  'globe': Global,
  'component': Component,
  'apps': Component,
  // Sorting & Organization
  'sort': Sort,
  'blend': Blend,
  'category': Category2,
  'text': Text,
  'list': Menu,
  'options': Setting4,
  'grid': Grid1,
  // Visual
  'paintbucket': Paintbucket,
  'color-palette': Colorfilter,
  // Messages
  'messages': Messages2,
  'chatbubbles': Messages2,
  // Eye
  'eye': Eye,
  'eye-slash': EyeSlash,
  // Edit
  'edit': Edit2,
  // More
  'more': More2,
  // Additional folder icons
  'bookmark': Bookmark2,
  'flag': Flag2,
  'gift': Gift,
  'bulb': Lamp,
  'lamp': Lamp,
  'fitness': Health,
  'health': Health,
  'music': Musicnote,
  'musical-notes': Musicnote,
  'camera': Camera,
  'airplane': Airplane,
  'car': Car,
  'restaurant': Home2, // No direct match, using Home as placeholder
  'cafe': Home2, // No direct match
  'medical': Health,
  'school': Teacher,
  'library': Book1,
  'lock-closed': Setting, // Using Setting as placeholder
  'thumbs-up': Like1,
};

// Props for the Icon component
export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  variant?: IconVariant;
  style?: any;
}

// Reusable Icon component
export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = '#000000',
  variant = 'Linear',
  style,
}) => {
  const IconComponent = IconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in IconMap`);
    return null;
  }

  return (
    <IconComponent
      size={size}
      color={color}
      variant={variant}
      style={style}
    />
  );
};

// Export icon map for folder icons (maps folder icon names to IconName)
export const FOLDER_ICON_MAP: Record<string, IconName> = {
  'inbox': 'inbox',
  'heart': 'heart',
  'favorite': 'heart',
  'check-square': 'tick-square',
  'folder': 'folder',
  'star': 'star',
  'bookmark': 'bookmark',
  'flag': 'flag',
  'briefcase': 'briefcase',
  'work': 'briefcase',
  'home': 'home',
  'cart': 'cart',
  'shopping': 'cart',
  'gift': 'gift',
  'bulb': 'bulb',
  'lightbulb': 'bulb',
  'fitness': 'fitness',
  'musical-notes': 'music',
  'music': 'music',
  'camera': 'camera',
  'airplane': 'airplane',
  'car': 'car',
  'restaurant': 'restaurant',
  'cafe': 'cafe',
  'medical': 'medical',
  'school': 'school',
  'library': 'library',
};

// Available icons for folder picker
export const AVAILABLE_FOLDER_ICONS: string[] = [
  'folder', 'heart', 'star', 'bookmark', 'flag',
  'briefcase', 'home', 'cart', 'gift', 'bulb',
  'fitness', 'music',
];

// Map for Android native Material icons
export const MATERIAL_ICON_MAP: Record<string, string> = {
  'inbox': 'inbox',
  'heart': 'favorite',
  'favorite': 'favorite',
  'check-square': 'check',
  'folder': 'folder',
  'star': 'star',
  'bookmark': 'bookmark',
  'flag': 'flag',
  'briefcase': 'work',
  'work': 'work',
  'home': 'home',
  'cart': 'shopping',
  'shopping': 'shopping',
  'gift': 'gift',
  'bulb': 'lightbulb',
  'lightbulb': 'lightbulb',
  'fitness': 'fitness',
  'musical-notes': 'music',
  'music': 'music',
  'camera': 'camera',
  'airplane': 'flight',
  'car': 'car',
  'restaurant': 'restaurant',
  'cafe': 'coffee',
  'medical': 'health',
  'school': 'school',
  'library': 'library',
};

export default Icon;
