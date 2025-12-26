import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Folder, SortOption, SyncState } from '../types/types';
import { getCurrentTimestamp } from '../utils/dates';
import { useMemo } from 'react';

// Storage keys
const STORAGE_KEYS = {
  TASKS: 'tasks_list',
  FOLDERS: 'folders_list',
  SHOW_COMPLETED: 'show_completed_in_today',
  SHOW_FOLDER_NAMES: 'show_folder_names',
  SORT_OPTION: 'task_sort_option',
  NOTION_API_KEY: 'notion_api_key',
  NOTION_DATABASE_ID: 'notion_database_id',
};

// Default folders matching Flutter app
const DEFAULT_FOLDERS: Folder[] = [
  { id: '1', name: 'Inbox', icon: 'inbox', isDefault: true },
  { id: '2', name: 'Important', icon: 'heart', isDefault: true },
  { id: '3', name: 'Completed', icon: 'check-square', isDefault: true },
];

interface TaskStore {
  // Data
  tasks: Task[];
  folders: Folder[];

  // Settings
  showCompletedInToday: boolean;
  showFolderNames: boolean;
  sortOption: SortOption;
  selectionMode: boolean;
  selectedTasks: Set<string>; // Task IDs
  selectedFolders: Set<string>; // Folder IDs

  // Notion
  notionApiKey: string | null;
  notionDatabaseId: string | null;
  syncState: SyncState;

  // Loading state
  isLoading: boolean;
  isInitialized: boolean;

  // Actions - Tasks
  addTask: (name: string, folder?: string, dueDate?: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  deleteTasks: (ids: string[]) => void;
  toggleTaskCompletion: (id: string) => void;
  moveTasksToFolder: (ids: string[], folder: string) => void;
  reorderTasks: (fromIndex: number, toIndex: number) => void;

  // Actions - Folders
  addFolder: (name: string, icon: string) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  deleteFolders: (ids: string[]) => void;

  // Actions - Settings
  setShowCompletedInToday: (value: boolean) => void;
  setShowFolderNames: (value: boolean) => void;
  setSortOption: (option: SortOption) => void;
  toggleSelectionMode: () => void;
  toggleTaskSelection: (id: string) => void;
  toggleFolderSelection: (id: string) => void;
  selectAllTasks: () => void;
  clearSelection: () => void;

  // Actions - Notion
  setNotionCredentials: (apiKey: string, databaseId: string) => Promise<void>;
  clearNotionCredentials: () => Promise<void>;
  updateSyncState: (state: Partial<SyncState>) => void;
  updateTaskNotionId: (taskId: string, notionPageId: string) => void;

  // Actions - Persistence
  loadAllData: () => Promise<void>;
  saveTasks: () => Promise<void>;
  saveFolders: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

// Generate unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Sort tasks based on sort option
const sortTasks = (tasks: Task[], sortOption: SortOption): Task[] => {
  const sorted = [...tasks];

  switch (sortOption) {
    case 'manual':
      return sorted;

    case 'name':
      return sorted.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );

    case 'date':
      return sorted.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });

    case 'folder':
      return sorted.sort((a, b) =>
        a.folder.toLowerCase().localeCompare(b.folder.toLowerCase())
      );

    default:
      return sorted;
  }
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  // Initial state
  tasks: [],
  folders: DEFAULT_FOLDERS,
  showCompletedInToday: false,
  showFolderNames: true,
  sortOption: 'manual',
  selectionMode: false,
  selectedTasks: new Set(),
  selectedFolders: new Set(),
  notionApiKey: null,
  notionDatabaseId: null,
  syncState: {
    syncDirection: 'none',
    isSyncing: false,
    errorCount: 0,
  },
  isLoading: false,
  isInitialized: false,

  // Task Actions
  addTask: (name, folder = 'Inbox', dueDate) => {
    const newTask: Task = {
      id: generateId(),
      name,
      completed: false,
      folder,
      dueDate,
      lastModified: getCurrentTimestamp(),
    };
    set(state => ({ tasks: [...state.tasks, newTask] }));
    get().saveTasks();
  },

  updateTask: (id, updates) => {
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === id
          ? { ...task, ...updates, lastModified: getCurrentTimestamp() }
          : task
      ),
    }));
    get().saveTasks();
  },

  deleteTask: id => {
    set(state => ({
      tasks: state.tasks.filter(task => task.id !== id),
      selectedTasks: new Set([...state.selectedTasks].filter(tid => tid !== id)),
    }));
    get().saveTasks();
  },

  deleteTasks: ids => {
    const idSet = new Set(ids);
    set(state => ({
      tasks: state.tasks.filter(task => !idSet.has(task.id)),
      selectedTasks: new Set(
        [...state.selectedTasks].filter(tid => !idSet.has(tid))
      ),
    }));
    get().saveTasks();
  },

  toggleTaskCompletion: id => {
    set(state => ({
      tasks: state.tasks.map(task => {
        if (task.id !== id) return task;

        const newCompleted = !task.completed;
        if (newCompleted) {
          // Marking as completed: move to Completed folder
          return {
            ...task,
            completed: true,
            previousFolder: task.folder,
            folder: 'Completed',
            lastModified: getCurrentTimestamp(),
          };
        } else {
          // Marking as incomplete: restore previous folder
          return {
            ...task,
            completed: false,
            folder: task.previousFolder || 'Inbox',
            previousFolder: undefined,
            lastModified: getCurrentTimestamp(),
          };
        }
      }),
    }));
    get().saveTasks();
  },

  moveTasksToFolder: (ids, folder) => {
    const idSet = new Set(ids);
    set(state => ({
      tasks: state.tasks.map(task =>
        idSet.has(task.id)
          ? {
              ...task,
              folder,
              completed: folder === 'Completed',
              previousFolder: folder === 'Completed' ? task.folder : undefined,
              lastModified: getCurrentTimestamp(),
            }
          : task
      ),
    }));
    get().saveTasks();
  },

  reorderTasks: (fromIndex, toIndex) => {
    set(state => {
      const tasks = [...state.tasks];
      const [removed] = tasks.splice(fromIndex, 1);
      tasks.splice(toIndex, 0, removed);
      return { tasks };
    });
    get().saveTasks();
  },

  // Folder Actions
  addFolder: (name, icon) => {
    const newFolder: Folder = {
      id: generateId(),
      name,
      icon,
      isDefault: false,
    };
    set(state => ({ folders: [...state.folders, newFolder] }));
    get().saveFolders();
  },

  updateFolder: (id, updates) => {
    set(state => ({
      folders: state.folders.map(folder =>
        folder.id === id ? { ...folder, ...updates } : folder
      ),
    }));
    get().saveFolders();
  },

  deleteFolder: id => {
    const folder = get().folders.find(f => f.id === id);
    if (folder?.isDefault) return; // Cannot delete default folders

    // Move tasks from deleted folder to Inbox
    set(state => ({
      folders: state.folders.filter(f => f.id !== id),
      tasks: state.tasks.map(task =>
        task.folder === folder?.name
          ? { ...task, folder: 'Inbox', lastModified: getCurrentTimestamp() }
          : task
      ),
      selectedFolders: new Set(
        [...state.selectedFolders].filter(fid => fid !== id)
      ),
    }));
    get().saveFolders();
    get().saveTasks();
  },

  deleteFolders: ids => {
    const { folders } = get();
    const foldersToDelete = folders.filter(
      f => ids.includes(f.id) && !f.isDefault
    );
    const folderNames = new Set(foldersToDelete.map(f => f.name));

    set(state => ({
      folders: state.folders.filter(
        f => !ids.includes(f.id) || f.isDefault
      ),
      tasks: state.tasks.map(task =>
        folderNames.has(task.folder)
          ? { ...task, folder: 'Inbox', lastModified: getCurrentTimestamp() }
          : task
      ),
      selectedFolders: new Set(),
    }));
    get().saveFolders();
    get().saveTasks();
  },

  // Settings Actions
  setShowCompletedInToday: value => {
    set({ showCompletedInToday: value });
    get().saveSettings();
  },

  setShowFolderNames: value => {
    set({ showFolderNames: value });
    get().saveSettings();
  },

  setSortOption: option => {
    set({ sortOption: option });
    AsyncStorage.setItem(STORAGE_KEYS.SORT_OPTION, option);
  },

  toggleSelectionMode: () => {
    set(state => ({
      selectionMode: !state.selectionMode,
      selectedTasks: new Set(),
      selectedFolders: new Set(),
    }));
  },

  toggleTaskSelection: id => {
    set(state => {
      const newSet = new Set(state.selectedTasks);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return { selectedTasks: newSet };
    });
  },

  toggleFolderSelection: id => {
    set(state => {
      const newSet = new Set(state.selectedFolders);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return { selectedFolders: newSet };
    });
  },

  selectAllTasks: () => {
    set(state => {
      const allTaskIds = state.tasks
        .filter(t => t.folder !== 'Completed')
        .map(t => t.id);
      return { selectedTasks: new Set(allTaskIds) };
    });
  },

  clearSelection: () => {
    set({
      selectedTasks: new Set(),
      selectedFolders: new Set(),
      selectionMode: false,
    });
  },

  // Notion Actions
  setNotionCredentials: async (apiKey, databaseId) => {
    await AsyncStorage.setItem(STORAGE_KEYS.NOTION_API_KEY, apiKey);
    await AsyncStorage.setItem(STORAGE_KEYS.NOTION_DATABASE_ID, databaseId);
    set({ notionApiKey: apiKey, notionDatabaseId: databaseId });
  },

  clearNotionCredentials: async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.NOTION_API_KEY);
    await AsyncStorage.removeItem(STORAGE_KEYS.NOTION_DATABASE_ID);
    set({ notionApiKey: null, notionDatabaseId: null });
  },

  updateSyncState: state => {
    set(prev => ({
      syncState: { ...prev.syncState, ...state },
    }));
  },

  updateTaskNotionId: (taskId, notionPageId) => {
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === taskId ? { ...task, notionPageId } : task
      ),
    }));
    get().saveTasks();
  },

  // Persistence Actions
  loadAllData: async () => {
    set({ isLoading: true });
    try {
      // Load tasks
      const tasksJson = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      if (tasksJson) {
        const tasks = JSON.parse(tasksJson) as Task[];
        set({ tasks });
      }

      // Load folders
      const foldersJson = await AsyncStorage.getItem(STORAGE_KEYS.FOLDERS);
      if (foldersJson) {
        const folders = JSON.parse(foldersJson) as Folder[];
        // Ensure default folders exist
        const hasDefaults = DEFAULT_FOLDERS.every(df =>
          folders.some(f => f.name === df.name)
        );
        set({ folders: hasDefaults ? folders : [...DEFAULT_FOLDERS, ...folders.filter(f => !f.isDefault)] });
      }

      // Load settings
      const showCompleted = await AsyncStorage.getItem(STORAGE_KEYS.SHOW_COMPLETED);
      if (showCompleted !== null) {
        set({ showCompletedInToday: showCompleted === 'true' });
      }

      const showFolderNames = await AsyncStorage.getItem(STORAGE_KEYS.SHOW_FOLDER_NAMES);
      if (showFolderNames !== null) {
        set({ showFolderNames: showFolderNames === 'true' });
      }

      const sortOption = await AsyncStorage.getItem(STORAGE_KEYS.SORT_OPTION);
      if (sortOption) {
        set({ sortOption: sortOption as SortOption });
      }

      // Load Notion credentials
      const apiKey = await AsyncStorage.getItem(STORAGE_KEYS.NOTION_API_KEY);
      const databaseId = await AsyncStorage.getItem(STORAGE_KEYS.NOTION_DATABASE_ID);
      set({
        notionApiKey: apiKey,
        notionDatabaseId: databaseId,
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },

  saveTasks: async () => {
    try {
      const { tasks } = get();
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  },

  saveFolders: async () => {
    try {
      const { folders } = get();
      await AsyncStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
    } catch (error) {
      console.error('Failed to save folders:', error);
    }
  },

  saveSettings: async () => {
    try {
      const { showCompletedInToday, showFolderNames } = get();
      await AsyncStorage.setItem(
        STORAGE_KEYS.SHOW_COMPLETED,
        showCompletedInToday.toString()
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.SHOW_FOLDER_NAMES,
        showFolderNames.toString()
      );
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },
}));

// Selectors - use useShallow for stable references and useMemo for derived data
export const useIncompleteTasks = () => {
  const { tasks, sortOption } = useTaskStore(
    useShallow(state => ({ tasks: state.tasks, sortOption: state.sortOption }))
  );
  return useMemo(
    () => sortTasks(tasks.filter(t => t.folder !== 'Completed'), sortOption),
    [tasks, sortOption]
  );
};

export const useCompletedTasks = () => {
  const { tasks, sortOption } = useTaskStore(
    useShallow(state => ({ tasks: state.tasks, sortOption: state.sortOption }))
  );
  return useMemo(
    () => sortTasks(tasks.filter(t => t.folder === 'Completed'), sortOption),
    [tasks, sortOption]
  );
};

export const useTasksByFolder = (folderName: string) => {
  const { tasks, sortOption } = useTaskStore(
    useShallow(state => ({ tasks: state.tasks, sortOption: state.sortOption }))
  );
  return useMemo(
    () => sortTasks(tasks.filter(t => t.folder === folderName), sortOption),
    [tasks, sortOption, folderName]
  );
};

export const useFolderByName = (name: string) => {
  const folders = useTaskStore(useShallow(state => state.folders));
  return useMemo(
    () => folders.find(f => f.name === name),
    [folders, name]
  );
};

export const useIsNotionConnected = () =>
  useTaskStore(
    state => !!state.notionApiKey && !!state.notionDatabaseId
  );
