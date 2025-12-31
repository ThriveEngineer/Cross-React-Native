import { Task, SyncResult } from '../types/types';
import { useTaskStore } from '../store/taskStore';
import { formatDateForNotion, getCurrentTimestamp, compareTimestamps } from '../utils/dates';

const NOTION_API_VERSION = '2022-06-28';
const NOTION_API_BASE = 'https://api.notion.com/v1';

interface NotionPage {
  id: string;
  name: string;
  completed: boolean;
  folder: string;
  dueDate?: string;
  lastModified: string;
}

export class NotionService {
  private static getCredentials() {
    const { notionApiKey, notionDatabaseId } = useTaskStore.getState();
    return { apiKey: notionApiKey, databaseId: notionDatabaseId };
  }

  static async testConnection(): Promise<boolean> {
    const { apiKey, databaseId } = this.getCredentials();
    if (!apiKey || !databaseId) return false;

    try {
      const response = await fetch(`${NOTION_API_BASE}/databases/${databaseId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Notion-Version': NOTION_API_VERSION,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  static async createTask(task: Task): Promise<string | null> {
    const { apiKey, databaseId } = this.getCredentials();
    if (!apiKey || !databaseId) {
      throw new Error('Notion not configured');
    }

    const dueDateFormatted = formatDateForNotion(task.dueDate);

    const body: Record<string, unknown> = {
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [{ text: { content: task.name } }],
        },
        Status: {
          status: { name: task.completed ? 'Done' : 'Not started' },
        },
        Folder: {
          select: { name: task.folder },
        },
        ...(dueDateFormatted && {
          'Due Date': {
            date: { start: dueDateFormatted },
          },
        }),
      },
    };

    try {
      const response = await fetch(`${NOTION_API_BASE}/pages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Notion-Version': NOTION_API_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        return data.id as string;
      } else {
        console.error('Notion API error:', response.status, await response.text());
        return null;
      }
    } catch (error) {
      console.error('Failed to create task in Notion:', error);
      return null;
    }
  }

  static async archiveTask(notionPageId: string): Promise<boolean> {
    const { apiKey } = this.getCredentials();
    if (!apiKey || !notionPageId) {
      console.log('archiveTask skipped: missing apiKey or notionPageId');
      return false;
    }

    try {
      const response = await fetch(`${NOTION_API_BASE}/pages/${notionPageId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Notion-Version': NOTION_API_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ archived: true }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Notion archive failed:', response.status, errorText);
      }

      return response.ok;
    } catch (error) {
      console.error('Failed to archive task in Notion:', error);
      return false;
    }
  }

  static async archiveTasks(notionPageIds: string[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const pageId of notionPageIds) {
      const result = await this.archiveTask(pageId);
      if (result) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }

  static async updateTask(task: Task): Promise<boolean> {
    const { apiKey } = this.getCredentials();
    if (!apiKey || !task.notionPageId) {
      console.log('updateTask skipped: missing apiKey or notionPageId');
      return false;
    }

    const dueDateFormatted = formatDateForNotion(task.dueDate);

    const properties: Record<string, unknown> = {
      Name: {
        title: [{ text: { content: task.name } }],
      },
      Status: {
        status: { name: task.completed ? 'Done' : 'Not started' },
      },
      Folder: {
        select: { name: task.folder },
      },
    };

    if (dueDateFormatted) {
      properties['Due Date'] = {
        date: { start: dueDateFormatted },
      };
    }

    try {
      const response = await fetch(`${NOTION_API_BASE}/pages/${task.notionPageId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Notion-Version': NOTION_API_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Notion update failed:', response.status, errorText);
      }

      return response.ok;
    } catch (error) {
      console.error('Failed to update task in Notion:', error);
      return false;
    }
  }

  static async queryAllTasks(): Promise<NotionPage[]> {
    const { apiKey, databaseId } = this.getCredentials();
    if (!apiKey || !databaseId) {
      throw new Error('Notion not configured');
    }

    const allTasks: NotionPage[] = [];
    let hasMore = true;
    let startCursor: string | undefined;

    try {
      while (hasMore) {
        const body: Record<string, unknown> = {
          page_size: 100,
          ...(startCursor && { start_cursor: startCursor }),
        };

        const response = await fetch(`${NOTION_API_BASE}/databases/${databaseId}/query`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Notion-Version': NOTION_API_VERSION,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          console.error('Notion query error:', response.status);
          break;
        }

        const data = await response.json();
        const results = data.results as unknown[];

        for (const page of results) {
          allTasks.push(this.parseNotionPage(page as Record<string, unknown>));
        }

        hasMore = data.has_more;
        startCursor = data.next_cursor;
      }

      console.log(`Fetched ${allTasks.length} tasks from Notion`);
      return allTasks;
    } catch (error) {
      console.error('Failed to query Notion tasks:', error);
      return [];
    }
  }

  private static parseNotionPage(page: Record<string, unknown>): NotionPage {
    const props = page.properties as Record<string, unknown>;

    // Extract task name
    let taskName = '';
    const nameProperty = props.Name as Record<string, unknown>;
    if (nameProperty?.title) {
      const titleArray = nameProperty.title as Array<{ text: { content: string } }>;
      if (titleArray.length > 0) {
        taskName = titleArray[0].text.content || '';
      }
    }

    // Extract completion status
    let isCompleted = false;
    const statusProperty = props.Status as Record<string, unknown>;
    if (statusProperty?.status) {
      const status = statusProperty.status as { name: string };
      isCompleted = status.name === 'Done';
    }

    // Extract folder
    let folder = 'Inbox';
    const folderProperty = props.Folder as Record<string, unknown>;
    if (folderProperty?.select) {
      const select = folderProperty.select as { name: string };
      folder = select.name || 'Inbox';
    }

    // Extract due date
    let dueDate: string | undefined;
    const dueDateProperty = props['Due Date'] as Record<string, unknown>;
    if (dueDateProperty?.date) {
      const date = dueDateProperty.date as { start: string };
      dueDate = date.start;
    }

    return {
      id: page.id as string,
      name: taskName,
      completed: isCompleted,
      folder,
      dueDate,
      lastModified: page.last_edited_time as string,
    };
  }

  static async syncAllTasks(localTasks: Task[]): Promise<{ result: SyncResult; updatedTasks: Task[] }> {
    let successCount = 0;
    let failCount = 0;
    let createdCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];
    const updatedTasks: Task[] = [];

    for (const task of localTasks) {
      try {
        if (task.notionPageId) {
          // Update existing task
          const success = await this.updateTask(task);
          if (success) {
            successCount++;
            updatedCount++;
            updatedTasks.push(task);
          } else {
            failCount++;
            errors.push(`Update failed: ${task.name}`);
            updatedTasks.push(task);
          }
        } else {
          // Create new task
          const pageId = await this.createTask(task);
          if (pageId) {
            successCount++;
            createdCount++;
            updatedTasks.push({ ...task, notionPageId: pageId });
          } else {
            failCount++;
            errors.push(`Create failed: ${task.name}`);
            updatedTasks.push(task);
          }
        }
      } catch (error) {
        failCount++;
        errors.push(`Error: ${error}`);
        updatedTasks.push(task);
      }
    }

    return {
      result: {
        success: successCount,
        failed: failCount,
        created: createdCount,
        updated: updatedCount,
        errors,
      },
      updatedTasks,
    };
  }

  static async performBidirectionalSync(): Promise<SyncResult> {
    const store = useTaskStore.getState();
    const localTasks = store.tasks;

    try {
      // Fetch tasks from Notion
      const notionTasks = await this.queryAllTasks();

      // Create maps for easy lookup
      const localByNotionId = new Map<string, Task>();
      const localWithoutNotionId: Task[] = [];

      for (const task of localTasks) {
        if (task.notionPageId) {
          localByNotionId.set(task.notionPageId, task);
        } else {
          localWithoutNotionId.push(task);
        }
      }

      const notionById = new Map(notionTasks.map(t => [t.id, t]));

      let successCount = 0;
      let failCount = 0;
      let createdCount = 0;
      let updatedCount = 0;
      const errors: string[] = [];

      // Process tasks that exist in both places (conflict resolution by timestamp)
      for (const [notionId, localTask] of localByNotionId) {
        const notionTask = notionById.get(notionId);
        if (!notionTask) continue;

        const comparison = compareTimestamps(localTask.lastModified, notionTask.lastModified);

        if (comparison > 0) {
          // Local is newer - push to Notion
          console.log(`Pushing to Notion: "${localTask.name}" (folder: ${localTask.folder})`);
          const success = await this.updateTask(localTask);
          if (success) {
            successCount++;
            updatedCount++;
            console.log(`Successfully updated: "${localTask.name}"`);
          } else {
            failCount++;
            errors.push(`Failed to push: ${localTask.name}`);
            console.error(`Failed to update: "${localTask.name}"`);
          }
        } else if (comparison < 0) {
          // Notion is newer - update local
          console.log(`Pulling from Notion: "${notionTask.name}" (folder: ${notionTask.folder})`);
          store.updateTask(localTask.id, {
            name: notionTask.name,
            completed: notionTask.completed,
            folder: notionTask.completed ? 'Completed' : notionTask.folder,
            dueDate: notionTask.dueDate,
            lastModified: notionTask.lastModified,
          });
          successCount++;
          updatedCount++;
        }
      }

      // Push local tasks without Notion ID
      for (const task of localWithoutNotionId) {
        const pageId = await this.createTask(task);
        if (pageId) {
          store.updateTaskNotionId(task.id, pageId);
          successCount++;
          createdCount++;
        } else {
          failCount++;
          errors.push(`Failed to create: ${task.name}`);
        }
      }

      // Pull tasks from Notion that don't exist locally
      for (const [notionId, notionTask] of notionById) {
        if (!localByNotionId.has(notionId)) {
          store.addTask(notionTask.name, notionTask.folder, notionTask.dueDate);
          // Update with Notion ID
          const newTasks = useTaskStore.getState().tasks;
          const newTask = newTasks[newTasks.length - 1];
          if (newTask) {
            store.updateTask(newTask.id, {
              notionPageId: notionId,
              completed: notionTask.completed,
              folder: notionTask.completed ? 'Completed' : notionTask.folder,
              lastModified: notionTask.lastModified,
            });
          }
          successCount++;
          createdCount++;
        }
      }

      return {
        success: successCount,
        failed: failCount,
        created: createdCount,
        updated: updatedCount,
        errors,
      };
    } catch (error) {
      console.error('Bidirectional sync failed:', error);
      return {
        success: 0,
        failed: 1,
        created: 0,
        updated: 0,
        errors: [`Sync failed: ${error}`],
      };
    }
  }
}

// Auto-sync service singleton
class NotionAutoSyncService {
  private static instance: NotionAutoSyncService;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private debounceTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly SYNC_INTERVAL = 30 * 1000; // 30 seconds
  private readonly DEBOUNCE_DELAY = 1000; // 1 second

  private constructor() {}

  static getInstance(): NotionAutoSyncService {
    if (!NotionAutoSyncService.instance) {
      NotionAutoSyncService.instance = new NotionAutoSyncService();
    }
    return NotionAutoSyncService.instance;
  }

  initialize(): void {
    this.startPolling();
  }

  startPolling(): void {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(() => {
      this.triggerSync();
    }, this.SYNC_INTERVAL);
  }

  stopPolling(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  debouncedSync(): void {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      this.triggerSync();
    }, this.DEBOUNCE_DELAY);
  }

  async triggerSync(): Promise<void> {
    const store = useTaskStore.getState();
    const { notionApiKey, notionDatabaseId, syncState } = store;

    if (!notionApiKey || !notionDatabaseId || syncState.isSyncing) {
      console.log('Sync skipped:', !notionApiKey ? 'no API key' : !notionDatabaseId ? 'no database ID' : 'already syncing');
      return;
    }

    console.log('Starting Notion sync...');
    store.updateSyncState({ isSyncing: true });

    try {
      const result = await NotionService.performBidirectionalSync();
      console.log(`Sync completed: ${result.success} success, ${result.failed} failed, ${result.created} created, ${result.updated} updated`);
      store.updateSyncState({
        isSyncing: false,
        lastSyncTime: getCurrentTimestamp(),
        errorCount: result.failed,
      });
    } catch (error) {
      console.error('Auto-sync failed:', error);
      store.updateSyncState({
        isSyncing: false,
        errorCount: (store.syncState.errorCount || 0) + 1,
      });
    }
  }

  async triggerImmediateSync(): Promise<void> {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }
    await this.triggerSync();
  }
}

export const notionAutoSync = NotionAutoSyncService.getInstance();
