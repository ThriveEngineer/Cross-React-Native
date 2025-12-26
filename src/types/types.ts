// Task structure matching Flutter: [taskName, isCompleted, folderName, previousFolder, dateValue, notionPageId, lastModified]
export interface Task {
  id: string; // Unique local ID
  name: string; // Index 0
  completed: boolean; // Index 1
  folder: string; // Index 2
  previousFolder?: string; // Index 3
  dueDate?: string; // Index 4 - ISO8601 format
  notionPageId?: string; // Index 5
  lastModified: string; // Index 6 - ISO8601 UTC format
}

export interface Folder {
  id: string;
  name: string;
  icon: string; // Icon name from @expo/vector-icons
  isDefault: boolean;
}

export type SortOption = 'manual' | 'name' | 'date' | 'folder';

export interface NotionCredentials {
  apiKey: string;
  databaseId: string;
}

export interface SyncResult {
  success: number;
  failed: number;
  created: number;
  updated: number;
  errors: string[];
}

export type SyncDirection = 'none' | 'toNotion' | 'fromNotion' | 'bidirectional';

export interface SyncState {
  lastSyncTime?: string;
  syncDirection: SyncDirection;
  isSyncing: boolean;
  errorCount: number;
}
