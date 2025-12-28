import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTaskStore } from '../../src/store/taskStore';
import { CustomAppBar } from '../../src/components/CustomAppBar';
import { ViewSettingsSheet } from '../../src/components/ViewSettingsSheet';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../src/constants/theme';
import { Folder } from '../../src/types/types';
import { showM3FolderCreationSheet } from 'material3-expressive';

// Icon mapping for folders
const FOLDER_ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  'inbox': 'mail-outline',
  'heart': 'heart-outline',
  'check-square': 'checkbox-outline',
  'folder': 'folder-outline',
  'star': 'star-outline',
  'bookmark': 'bookmark-outline',
  'flag': 'flag-outline',
  'briefcase': 'briefcase-outline',
  'home': 'home-outline',
  'cart': 'cart-outline',
  'gift': 'gift-outline',
  'bulb': 'bulb-outline',
  'fitness': 'fitness-outline',
  'musical-notes': 'musical-notes-outline',
  'camera': 'camera-outline',
  'airplane': 'airplane-outline',
  'car': 'car-outline',
  'restaurant': 'restaurant-outline',
  'cafe': 'cafe-outline',
  'medical': 'medical-outline',
  'school': 'school-outline',
  'library': 'library-outline',
};

// Available icons for new folders
const AVAILABLE_ICONS = [
  'folder', 'heart', 'star', 'bookmark', 'flag',
  'briefcase', 'home', 'cart', 'gift', 'bulb',
  'fitness', 'musical-notes',
];

interface FolderTileProps {
  folder: Folder;
  taskCount: number;
  isSelected: boolean;
  isSelectionMode: boolean;
  onPress: () => void;
}

const FolderTile: React.FC<FolderTileProps> = ({
  folder,
  taskCount,
  isSelected,
  isSelectionMode,
  onPress,
}) => {
  const iconName = FOLDER_ICON_MAP[folder.icon] || 'folder-outline';

  return (
    <Pressable
      style={[
        styles.folderTile,
        isSelected && styles.folderTileSelected,
      ]}
      onPress={onPress}
    >
      {isSelectionMode && (
        <View style={styles.selectionCheckbox}>
          {folder.isDefault ? (
            <Ionicons name="lock-closed-outline" size={24} color={Colors.light.textSecondary} />
          ) : isSelected ? (
            <Ionicons name="checkmark-circle" size={24} color={Colors.light.primary} />
          ) : (
            <Ionicons name="ellipse-outline" size={24} color={Colors.light.textSecondary} />
          )}
        </View>
      )}
      <Ionicons name={iconName} size={24} color={Colors.light.text} />
      <Text style={styles.folderName}>{folder.name}</Text>
      <View style={styles.folderSpacer} />
      {!isSelectionMode && (
        <Ionicons name="chevron-forward" size={24} color={Colors.light.textSecondary} />
      )}
    </Pressable>
  );
};

export default function FoldersScreen() {
  const {
    folders,
    tasks,
    selectionMode,
    selectedFolders,
    toggleFolderSelection,
    addFolder,
    deleteFolders,
    clearSelection,
  } = useTaskStore();

  const [viewSettingsVisible, setViewSettingsVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('folder');
  const [showIconPicker, setShowIconPicker] = useState(false);

  const getTaskCountForFolder = useCallback(
    (folderName: string) => {
      return tasks.filter(t => t.folder === folderName).length;
    },
    [tasks]
  );

  const handleFolderPress = useCallback(
    (folder: Folder) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (selectionMode) {
        if (!folder.isDefault) {
          toggleFolderSelection(folder.id);
        }
      } else {
        router.push(`/folder/${encodeURIComponent(folder.name)}`);
      }
    },
    [selectionMode, toggleFolderSelection]
  );

  const handleCreateFolder = useCallback(() => {
    if (newFolderName.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addFolder(newFolderName.trim(), selectedIcon);
      setNewFolderName('');
      setSelectedIcon('folder');
      setIsCreateModalVisible(false);
      setShowIconPicker(false);
    }
  }, [newFolderName, selectedIcon, addFolder]);

  const handleDeleteSelected = useCallback(() => {
    const selectedIds = Array.from(selectedFolders);
    if (selectedIds.length === 0) return;

    Alert.alert(
      'Delete Folders',
      `Are you sure you want to delete ${selectedIds.length} folder(s)? Tasks will be moved to Inbox.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            deleteFolders(selectedIds);
            clearSelection();
          },
        },
      ]
    );
  }, [selectedFolders, deleteFolders, clearSelection]);

  const openSettings = useCallback(() => {
    router.push('/settings');
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CustomAppBar
        onOpenViewSettings={() => setViewSettingsVisible(true)}
        onOpenSettings={openSettings}
      />

      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Folders</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {folders.map((folder, index) => (
          <Animated.View
            key={folder.id}
            entering={FadeIn.delay(index * 30).duration(200)}
          >
            <FolderTile
              folder={folder}
              taskCount={getTaskCountForFolder(folder.name)}
              isSelected={selectedFolders.has(folder.id)}
              isSelectionMode={selectionMode}
              onPress={() => handleFolderPress(folder)}
            />
          </Animated.View>
        ))}
      </ScrollView>

      {/* FAB - changes based on selection mode */}
      {selectionMode ? (
        // Delete button when in selection mode
        selectedFolders.size > 0 && (
          <Pressable style={styles.deleteFab} onPress={handleDeleteSelected}>
            <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
          </Pressable>
        )
      ) : (
        // Add folder button
        <Pressable
          style={styles.fab}
          onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            if (Platform.OS === 'android') {
              const result = await showM3FolderCreationSheet();
              if (!result.cancelled && result.folderName) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                addFolder(result.folderName, result.icon || 'folder');
              }
            } else {
              setIsCreateModalVisible(true);
            }
          }}
        >
          <Ionicons name="folder-open-outline" size={24} color="#FFFFFF" />
          <Ionicons
            name="add"
            size={16}
            color="#FFFFFF"
            style={styles.fabAddIcon}
          />
        </Pressable>
      )}

      {/* Create Folder Modal */}
      <Modal
        visible={isCreateModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsCreateModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsCreateModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <View style={styles.dragHandle} />

            <View style={styles.createForm}>
              <TextInput
                style={styles.input}
                placeholder="Folder name"
                placeholderTextColor={Colors.light.textSecondary}
                value={newFolderName}
                onChangeText={setNewFolderName}
                autoFocus
              />

              {/* Icon selector */}
              <Pressable
                style={styles.iconSelector}
                onPress={() => setShowIconPicker(!showIconPicker)}
              >
                <Ionicons
                  name={FOLDER_ICON_MAP[selectedIcon] || 'folder-outline'}
                  size={24}
                  color={Colors.light.text}
                />
                <Ionicons
                  name={showIconPicker ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={Colors.light.textSecondary}
                />
              </Pressable>

              {/* Save button */}
              <Pressable
                style={[
                  styles.saveButton,
                  !newFolderName.trim() && styles.saveButtonDisabled,
                ]}
                onPress={handleCreateFolder}
                disabled={!newFolderName.trim()}
              >
                <Ionicons name="checkmark-circle" size={36} color="#FFFFFF" />
              </Pressable>
            </View>

            {/* Icon picker grid */}
            {showIconPicker && (
              <View style={styles.iconGrid}>
                {AVAILABLE_ICONS.map(icon => (
                  <Pressable
                    key={icon}
                    style={[
                      styles.iconOption,
                      selectedIcon === icon && styles.iconOptionSelected,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedIcon(icon);
                    }}
                  >
                    <Ionicons
                      name={FOLDER_ICON_MAP[icon] || 'folder-outline'}
                      size={24}
                      color={
                        selectedIcon === icon
                          ? Colors.light.primary
                          : Colors.light.text
                      }
                    />
                  </Pressable>
                ))}
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <ViewSettingsSheet
        visible={viewSettingsVisible}
        onClose={() => setViewSettingsVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerRow: {
    paddingHorizontal: 25,
    marginBottom: 25,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: 100,
  },
  folderTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  folderTileSelected: {
    backgroundColor: 'rgba(29, 29, 29, 0.1)',
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  selectionCheckbox: {
    marginRight: 4,
  },
  folderName: {
    fontSize: 14,
    color: Colors.light.text,
  },
  folderSpacer: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabAddIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  deleteFab: {
    position: 'absolute',
    bottom: 16,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.error,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  createForm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.light.text,
  },
  iconSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: Spacing.md,
    gap: 4,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 18,
    padding: 0,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.light.textSecondary,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconOptionSelected: {
    backgroundColor: 'rgba(29, 29, 29, 0.1)',
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
});
