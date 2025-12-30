import React, { useCallback, useState, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useShallow } from 'zustand/react/shallow';
import { useTaskStore, useIsNotionConnected } from '../src/store/taskStore';
import { NotionService, notionAutoSync } from '../src/services/notionService';
import { Colors, Spacing, FontSizes, BorderRadius } from '../src/constants/theme';

export default function IntegrationsScreen() {
  // Use selective subscription - only subscribe to Notion-related state
  const {
    notionApiKey,
    notionDatabaseId,
    syncState,
    setNotionCredentials,
    clearNotionCredentials,
  } = useTaskStore(
    useShallow(state => ({
      notionApiKey: state.notionApiKey,
      notionDatabaseId: state.notionDatabaseId,
      syncState: state.syncState,
      setNotionCredentials: state.setNotionCredentials,
      clearNotionCredentials: state.clearNotionCredentials,
    }))
  );

  const isNotionConnected = useIsNotionConnected();

  const [apiKey, setApiKey] = useState(notionApiKey || '');
  const [databaseId, setDatabaseId] = useState(notionDatabaseId || '');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleTestConnection = useCallback(async () => {
    if (!apiKey.trim() || !databaseId.trim()) {
      Alert.alert('Error', 'Please enter both API key and Database ID');
      return;
    }

    setIsTestingConnection(true);
    try {
      await setNotionCredentials(apiKey.trim(), databaseId.trim());
      const success = await NotionService.testConnection();

      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'Connection to Notion successful!');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Connection Failed', 'Could not connect to Notion. Please check your credentials.');
        await clearNotionCredentials();
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', `Connection failed: ${error}`);
      await clearNotionCredentials();
    } finally {
      setIsTestingConnection(false);
    }
  }, [apiKey, databaseId, setNotionCredentials, clearNotionCredentials]);

  const handleDisconnect = useCallback(async () => {
    Alert.alert(
      'Disconnect from Notion',
      'Are you sure you want to disconnect? Your local tasks will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await clearNotionCredentials();
            setApiKey('');
            setDatabaseId('');
          },
        },
      ]
    );
  }, [clearNotionCredentials]);

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      await notionAutoSync.triggerImmediateSync();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Sync completed!');
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', `Sync failed: ${error}`);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const showHelp = useCallback(() => {
    Alert.alert(
      'How to Connect Notion',
      '1. Go to notion.so and sign in\n\n2. Go to Settings & Members > Integrations\n\n3. Create a new integration and copy the API key\n\n4. Create a database with properties:\n   • Name (title)\n   • Status (status)\n   • Folder (select)\n   • Due Date (date)\n\n5. Share your database with the integration\n\n6. Copy the database ID from the URL',
      [{ text: 'OK' }]
    );
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={Colors.light.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Integrations</Text>
        <Pressable onPress={showHelp} hitSlop={10}>
          <Ionicons name="help-circle-outline" size={24} color={Colors.light.text} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Integrations Container */}
        <View style={styles.integrationsContainer}>
          {/* Notion */}
          <View style={styles.integrationRow}>
            <View style={styles.notionLogo}>
              <Text style={styles.notionLogoText}>N</Text>
            </View>
            <Text style={styles.integrationName}>Notion</Text>
            <View style={styles.spacer} />
            <View style={styles.statusBadge}>
              {isNotionConnected ? (
                <>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.light.success} />
                  <Text style={[styles.statusText, { color: Colors.light.success }]}>Connected</Text>
                </>
              ) : (
                <>
                  <Ionicons name="alert-circle" size={14} color="#FF9500" />
                  <Text style={[styles.statusText, { color: '#FF9500' }]}>Not connected</Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Obsidian - Coming Soon */}
          <View style={[styles.integrationRow, styles.disabledRow]}>
            <View style={[styles.notionLogo, styles.obsidianLogo]}>
              <Text style={styles.notionLogoText}>O</Text>
            </View>
            <Text style={[styles.integrationName, styles.disabledText]}>Obsidian</Text>
            <View style={styles.spacer} />
            <Text style={styles.comingSoonText}>Coming soon</Text>
          </View>
        </View>

        {/* Notion Configuration */}
        <View style={styles.configSection}>
          <Text style={styles.sectionTitle}>Notion Configuration</Text>

          <View style={styles.configContainer}>
            {/* API Key */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>API Key</Text>
              <TextInput
                style={styles.input}
                placeholder="secret_xxxxxxxxxxxxx"
                placeholderTextColor={Colors.light.textSecondary}
                value={apiKey}
                onChangeText={setApiKey}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Database ID */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Database ID</Text>
              <TextInput
                style={styles.input}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                placeholderTextColor={Colors.light.textSecondary}
                value={databaseId}
                onChangeText={setDatabaseId}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Actions */}
            {isNotionConnected ? (
              <View style={styles.connectedActions}>
                <Pressable
                  style={styles.syncButton}
                  onPress={handleSync}
                  disabled={isSyncing || syncState.isSyncing}
                >
                  {isSyncing || syncState.isSyncing ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="sync" size={18} color="#FFFFFF" />
                      <Text style={styles.syncButtonText}>Force Sync Now</Text>
                    </>
                  )}
                </Pressable>

                <Pressable style={styles.disconnectButton} onPress={handleDisconnect}>
                  <Text style={styles.disconnectButtonText}>Disconnect</Text>
                </Pressable>

                {syncState.lastSyncTime && (
                  <Text style={styles.lastSyncText}>
                    Last synced: {new Date(syncState.lastSyncTime).toLocaleString()}
                  </Text>
                )}
              </View>
            ) : (
              <Pressable
                style={styles.connectButton}
                onPress={handleTestConnection}
                disabled={isTestingConnection}
              >
                {isTestingConnection ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.connectButtonText}>Connect</Text>
                )}
              </Pressable>
            )}
          </View>

          {/* Info Text */}
          <Text style={styles.infoText}>
            {isNotionConnected
              ? 'Bi-directional sync is enabled. Local changes sync to Notion within 3 seconds. Changes from Notion are fetched every 5 minutes or when you pull to refresh.'
              : 'Your tasks will be synced to your Notion database with their folder and due date information.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: '#F2F2F7',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.light.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 50,
  },
  integrationsContainer: {
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    width: 353,
    alignSelf: 'center',
  },
  integrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 13,
  },
  disabledRow: {
    opacity: 0.5,
  },
  notionLogo: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: Colors.light.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  obsidianLogo: {
    backgroundColor: '#7C3AED',
  },
  notionLogoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  integrationName: {
    fontSize: FontSizes.md,
    color: Colors.light.text,
  },
  disabledText: {
    color: Colors.light.textSecondary,
  },
  spacer: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: FontSizes.sm,
  },
  comingSoonText: {
    fontSize: FontSizes.sm,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
  },
  divider: {
    height: 0.5,
    backgroundColor: '#C2C2C2',
    marginLeft: 50,
  },
  configSection: {
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  configContainer: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: Spacing.md,
    fontSize: FontSizes.sm,
    color: Colors.light.text,
    fontFamily: 'monospace',
  },
  connectedActions: {
    gap: Spacing.sm,
  },
  connectButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  syncButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 48,
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  disconnectButton: {
    borderWidth: 1,
    borderColor: Colors.light.error,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
  },
  disconnectButtonText: {
    color: Colors.light.error,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  lastSyncText: {
    fontSize: FontSizes.xs,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  infoText: {
    fontSize: FontSizes.xs,
    color: Colors.light.textSecondary,
    marginTop: Spacing.md,
    lineHeight: 18,
    paddingHorizontal: Spacing.xs,
  },
});
