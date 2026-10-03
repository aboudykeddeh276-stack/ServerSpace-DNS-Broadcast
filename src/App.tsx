import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Cloud,
  HardDrive,
  RefreshCw,
  Folder,
  AlertTriangle,
  CheckCircle2,
  Database,
  ExternalLink,
  Lock,
  Search,
  Sparkles,
  Terminal,
  Server
} from 'lucide-react';
import {
  FileCategory,
  FileItem,
  FolderItem,
  GoogleDriveQuota,
  GoogleDriveUser,
  NavTab,
  SortOption,
  StoragePlan,
  ViewMode
} from './types';
import {
  INITIAL_FILES,
  INITIAL_FOLDERS,
  STORAGE_PLANS
} from './data/initialData';
import { OPEN_SOURCE_OS_HTML } from './data/openSourceOsTemplate';
import { KEX_LINUX_TERMINAL_HTML } from './data/kexLinuxTerminalTemplate';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { FileGrid } from './components/FileGrid';
import { FileList } from './components/FileList';
import { FileInspector } from './components/FileInspector';
import { StorageAnalyzer } from './components/StorageAnalyzer';
import { UploadModal } from './components/UploadModal';
import { CreateFolderModal } from './components/CreateFolderModal';
import { FilePreviewModal } from './components/FilePreviewModal';
import { ShareModal } from './components/ShareModal';
import { StoragePlanModal } from './components/StoragePlanModal';
import { TrashBin } from './components/TrashBin';
import { RecentActivity } from './components/RecentActivity';
import { GoogleSignInButton } from './components/GoogleSignInButton';
import { ConfirmActionModal } from './components/ConfirmActionModal';
import { Html5AppHub } from './components/Html5AppHub';
import { Html5AppRunner } from './components/Html5AppRunner';
import { MasterIndex } from './components/MasterIndex';
import { VirtualCloudServer } from './components/VirtualCloudServer';
import { IsoGlobalInspectorModal } from './components/common/IsoContextInspector';
import {
  initAuth,
  googleSignIn,
  logout,
  isDriveAuthenticated
} from './services/googleDriveAuth';
import {
  getDriveAbout,
  listDriveItems,
  createDriveFolder,
  uploadDriveFile,
  toggleStarDriveItem,
  trashDriveItem,
  restoreDriveItem,
  deleteDriveItemPermanently,
  emptyDriveTrash,
  updateDriveItem,
  saveDriveFileText
} from './services/googleDriveApi';

export default function App() {
  // Source selector: 'drive' (Google Drive) or 'local' (offline sandbox)
  const [activeSource, setActiveSource] = useState<'drive' | 'local'>(() => {
    const saved = localStorage.getItem('storage_space_active_source');
    if (saved === 'drive' || saved === 'local') return saved;
    return 'local';
  });

  // Google Drive auth and state
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [isDriveLoading, setIsDriveLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [driveUser, setDriveUser] = useState<GoogleDriveUser | null>(null);
  const [driveQuota, setDriveQuota] = useState<GoogleDriveQuota | null>(null);
  const [driveFiles, setDriveFiles] = useState<FileItem[]>([]);
  const [driveFolders, setDriveFolders] = useState<FolderItem[]>([]);
  const [driveError, setDriveError] = useState<string | null>(null);

  // Local storage state
  const [folders, setFolders] = useState<FolderItem[]>(() => {
    const saved = localStorage.getItem('storage_space_folders');
    return saved ? JSON.parse(saved) : INITIAL_FOLDERS;
  });

  const [files, setFiles] = useState<FileItem[]>(() => {
    const saved = localStorage.getItem('storage_space_files');
    if (!saved) return INITIAL_FILES;
    try {
      const parsed: FileItem[] = JSON.parse(saved);
      const initialMap = new Map(INITIAL_FILES.map((f) => [f.id, f]));
      // Merge initial files' rich production rawContent & attributes into existing parsed items
      const merged = parsed.map((item) => {
        const initial = initialMap.get(item.id);
        if (initial) {
          return {
            ...initial,
            starred: item.starred ?? initial.starred,
            inTrash: item.inTrash ?? initial.inTrash,
            trashedAt: item.trashedAt ?? initial.trashedAt,
            folderId: item.folderId !== undefined ? item.folderId : initial.folderId,
            tags: item.tags?.length ? item.tags : initial.tags,
            rawContent: item.rawContent || initial.rawContent,
            url: item.url || initial.url,
          };
        }
        return item;
      });
      const existingIds = new Set(merged.map((f) => f.id));
      const missingInitial = INITIAL_FILES.filter((initF) => !existingIds.has(initF.id));
      return [...merged, ...missingInitial];
    } catch {
      return INITIAL_FILES;
    }
  });

  const [currentPlan, setCurrentPlan] = useState<StoragePlan>(() => {
    const saved = localStorage.getItem('storage_space_plan');
    if (saved) {
      const planId = JSON.parse(saved);
      return STORAGE_PLANS.find((p) => p.id === planId) || STORAGE_PLANS[0];
    }
    return STORAGE_PLANS[0];
  });

  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    const saved = localStorage.getItem('serverspace_active_tab');
    if (saved) return saved as NavTab;
    return 'server';
  });

  const [serverSubTab, setServerSubTab] = useState<
    'nodes' | 'os-studio' | 'desktop' | 'rack-ai' | 'braink' | 'terminal' | 'services' | 'ports' | 'mounts' | 'snapshots'
  >('nodes');

  const handleOpenBrainkStudio = () => {
    setServerSubTab('braink');
    setActiveTab('server');
    setSelectedIds([]);
    setActiveFileId(null);
  };

  useEffect(() => {
    localStorage.setItem('serverspace_active_tab', activeTab);
  }, [activeTab]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FileCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('name');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [shareFile, setShareFile] = useState<FileItem | null>(null);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [runningAppFile, setRunningAppFile] = useState<FileItem | null>(null);
  const [isIsoStandardsOpen, setIsIsoStandardsOpen] = useState(false);

  const handleLaunchHtml5App = (file: FileItem) => {
    setRunningAppFile(file);
  };

  const handleBootKexLinux = () => {
    const kexFile =
      files.find(
        (f) => f.name === 'KEX_Linux_Terminal.html' || f.id === 'file-html5-kex-linux-terminal'
      ) ||
      driveFiles.find(
        (f) => f.name === 'KEX_Linux_Terminal.html' || f.id === 'file-html5-kex-linux-terminal'
      ) ||
      INITIAL_FILES.find((f) => f.id === 'file-html5-kex-linux-terminal');

    if (kexFile) {
      setRunningAppFile(kexFile);
    } else {
      setRunningAppFile({
        id: 'file-html5-kex-linux-terminal',
        name: 'KEX_Linux_Terminal.html',
        folderId: null,
        category: 'code',
        size: KEX_LINUX_TERMINAL_HTML.length,
        mimeType: 'text/html',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        starred: true,
        inTrash: false,
        rawContent: KEX_LINUX_TERMINAL_HTML,
        tags: ['KEX Linux', 'A. Keddeh', 'Braink AI', 'Terminal', 'CPU Registers'],
        isHtml5App: true,
        description: 'Auto-booted KEX Linux userspace emulator by A. Keddeh with live interactive shell, CPU registers, stateful filesystem tree, proof ledger, and process manager.',
      });
    }
  };

  const handleBootOs = () => {
    const osFile =
      files.find(
        (f) => f.name === 'Open_Source_Operating_System.html' || f.id === 'file-html5-open-source-os'
      ) ||
      driveFiles.find(
        (f) => f.name === 'Open_Source_Operating_System.html' || f.id === 'file-html5-open-source-os'
      ) ||
      INITIAL_FILES.find((f) => f.id === 'file-html5-open-source-os');

    if (osFile) {
      setRunningAppFile(osFile);
    } else {
      setRunningAppFile({
        id: 'file-html5-open-source-os',
        name: 'Open_Source_Operating_System.html',
        folderId: null,
        category: 'code',
        size: OPEN_SOURCE_OS_HTML.length,
        mimeType: 'text/html',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        starred: true,
        inTrash: false,
        rawContent: OPEN_SOURCE_OS_HTML,
        tags: ['Operating System', 'Linux Kernel', 'DOM Rigour'],
        isHtml5App: true,
        description: 'Complete open-source web operating system with GRUB bootloader, windowing compositor, and full DOM Rigour test suite.',
      });
    }
  };

  const handleSaveAppCode = async (file: FileItem, newCode: string) => {
    if (activeSource === 'drive' && isDriveConnected && file.isDriveFile) {
      try {
        await saveDriveFileText(file.id, newCode);
        setDriveFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  rawContent: newCode,
                  size: new Blob([newCode]).size,
                  updatedAt: new Date().toISOString(),
                }
              : f
          )
        );
      } catch (err: any) {
        console.error('Failed to save HTML5 app to Google Drive:', err);
      }
    } else {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id
            ? {
                ...f,
                rawContent: newCode,
                size: new Blob([newCode]).size,
                updatedAt: new Date().toISOString(),
              }
            : f
        )
      );
    }
  };

  const handleDeployTemplate = async (templateName: string, templateCode: string) => {
    if (activeSource === 'drive' && isDriveConnected) {
      const blob = new Blob([templateCode], { type: 'text/html' });
      const fileObj = new File([blob], templateName, { type: 'text/html' });
      const newDriveFile = await uploadDriveFile(fileObj, currentFolderId);
      setDriveFiles((prev) => [newDriveFile, ...prev]);
      setRunningAppFile(newDriveFile);
    } else {
      const newLocalFile: FileItem = {
        id: `file-html5-${Date.now()}`,
        name: templateName,
        folderId: currentFolderId,
        category: 'code',
        size: templateCode.length,
        mimeType: 'text/html',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        starred: true,
        inTrash: false,
        rawContent: templateCode,
        isHtml5App: true,
        tags: ['HTML5', 'App', 'Custom'],
        description: `Deployed interactive HTML5 application: ${templateName}`,
      };
      setFiles((prev) => [newLocalFile, ...prev]);
      setRunningAppFile(newLocalFile);
    }
  };

  // Destructive Action Confirmation Modal state (MANDATORY per Workspace guidelines)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    items?: string[];
    confirmLabel?: string;
    isDestructive?: boolean;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    items: [],
    confirmLabel: 'Confirm',
    isDestructive: true,
    action: async () => {},
  });
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Local persistence for fallback vault
  useEffect(() => {
    localStorage.setItem('storage_space_folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('storage_space_files', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem('storage_space_plan', JSON.stringify(currentPlan.id));
  }, [currentPlan]);

  useEffect(() => {
    localStorage.setItem('storage_space_active_source', activeSource);
  }, [activeSource]);

  // Load Google Drive content
  const loadDriveData = useCallback(
    async (folderId: string | null = null, tab: NavTab = 'files', query: string = '') => {
      if (!isDriveAuthenticated()) {
        return;
      }
      try {
        setIsSyncing(true);
        setDriveError(null);

        // Fetch User and Quota in parallel
        const aboutPromise = getDriveAbout().catch((err) => {
          console.warn('Quota fetch warning:', err);
          return null;
        });

        // Determine Drive query mode
        let driveMode: 'files' | 'starred' | 'trash' | 'shared' = 'files';
        if (tab === 'trash') driveMode = 'trash';
        else if (tab === 'starred') driveMode = 'starred';
        else if (tab === 'shared') driveMode = 'shared';

        const itemsPromise = listDriveItems({
          folderId: tab === 'files' ? folderId : null,
          mode: driveMode,
          searchQuery: query,
        });

        const [aboutData, itemsData] = await Promise.all([aboutPromise, itemsPromise]);

        if (aboutData) {
          setDriveUser(aboutData.user);
          setDriveQuota(aboutData.quota);
        }

        setDriveFiles(itemsData.files);
        setDriveFolders(itemsData.folders);
        setIsDriveConnected(true);
      } catch (err: any) {
        console.error('Error fetching Google Drive data:', err);
        setDriveError(err.message || 'Failed to sync with Google Drive');
      } finally {
        setIsSyncing(false);
      }
    },
    []
  );

  // Initialize Auth state listener on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setIsDriveConnected(true);
        setDriveUser({
          displayName: user.displayName || 'Google Drive User',
          emailAddress: user.email || '',
          photoLink: user.photoURL || undefined,
        });
        // Initial load
        loadDriveData(currentFolderId, activeTab, searchQuery);
      },
      () => {
        setIsDriveConnected(false);
        setDriveUser(null);
        setDriveQuota(null);
      }
    );

    return () => unsubscribe();
  }, [loadDriveData, currentFolderId, activeTab, searchQuery]);

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      setIsDriveLoading(true);
      setDriveError(null);
      const result = await googleSignIn();
      if (result) {
        setIsDriveConnected(true);
        setActiveSource('drive');
        setDriveUser({
          displayName: result.user.displayName || 'Google Drive User',
          emailAddress: result.user.email || '',
          photoLink: result.user.photoURL || undefined,
        });
        await loadDriveData(currentFolderId, activeTab, searchQuery);
      }
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      let msg = err.message || 'Failed to sign in with Google';
      if (err.code === 'auth/unauthorized-domain') {
        msg = 'This preview domain is not in Firebase OAuth authorized domains. You can use the fully functional Local Vault.';
      } else if (err.code === 'auth/popup-blocked') {
        msg = 'Sign-in popup was blocked by the browser. Please allow popups or open in a new window.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        msg = 'Google sign-in popup was closed before completing.';
      }
      setDriveError(msg);
    } finally {
      setIsDriveLoading(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await logout();
      setIsDriveConnected(false);
      setDriveUser(null);
      setDriveQuota(null);
      setDriveFiles([]);
      setDriveFolders([]);
      setActiveSource('local');
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  // Refresh current view
  const handleRefresh = () => {
    if (activeSource === 'drive') {
      loadDriveData(currentFolderId, activeTab, searchQuery);
    }
  };

  // Switch folder navigation
  const handleNavigateFolder = (folderId: string | null) => {
    setCurrentFolderId(folderId);
    setSelectedIds([]);
    setActiveFileId(null);
    if (activeSource === 'drive' && isDriveConnected) {
      loadDriveData(folderId, activeTab, searchQuery);
    }
  };

  // Re-fetch when tab or search changes in Drive mode
  useEffect(() => {
    if (activeSource === 'drive' && isDriveConnected) {
      loadDriveData(currentFolderId, activeTab, searchQuery);
    }
  }, [activeTab, searchQuery, activeSource, isDriveConnected, loadDriveData, currentFolderId]);

  // Current working datasets based on activeSource
  const currentFiles = activeSource === 'drive' ? driveFiles : files;
  const currentFolders = activeSource === 'drive' ? driveFolders : folders;

  // Active vs Trashed sets
  const activeFiles = useMemo(
    () => currentFiles.filter((f) => !f.inTrash),
    [currentFiles]
  );
  const activeFolders = useMemo(
    () => currentFolders.filter((f) => !f.inTrash),
    [currentFolders]
  );
  const trashedFiles = useMemo(
    () => currentFiles.filter((f) => f.inTrash),
    [currentFiles]
  );
  const trashedFolders = useMemo(
    () => currentFolders.filter((f) => f.inTrash),
    [currentFolders]
  );

  const usedBytes = useMemo(() => {
    if (activeSource === 'drive' && driveQuota) {
      return driveQuota.usage;
    }
    return activeFiles.reduce((acc, f) => acc + f.size, 0);
  }, [activeFiles, activeSource, driveQuota]);

  const trashBytes = useMemo(() => {
    if (activeSource === 'drive' && driveQuota) {
      return driveQuota.usageInDriveTrash;
    }
    return trashedFiles.reduce((acc, f) => acc + f.size, 0);
  }, [trashedFiles, activeSource, driveQuota]);

  const starredCount = useMemo(() => {
    return (
      activeFiles.filter((f) => f.starred).length +
      activeFolders.filter((f) => f.starred).length
    );
  }, [activeFiles, activeFolders]);

  // Folder breadcrumbs calculation
  const folderBreadcrumbs = useMemo(() => {
    const breadcrumbs: FolderItem[] = [];
    let currId = currentFolderId;
    while (currId) {
      const found = activeFolders.find((f) => f.id === currId);
      if (found) {
        breadcrumbs.unshift(found);
        currId = found.parentId;
      } else {
        break;
      }
    }
    return breadcrumbs;
  }, [currentFolderId, activeFolders]);

  const currentFolder = useMemo(() => {
    return activeFolders.find((f) => f.id === currentFolderId) || null;
  }, [currentFolderId, activeFolders]);

  // Folder stats calculator
  const getFolderStats = (folderId: string) => {
    const directFiles = activeFiles.filter((f) => f.folderId === folderId);
    const totalBytes = directFiles.reduce((acc, f) => acc + f.size, 0);
    return { count: directFiles.length, totalBytes };
  };

  // Filter & Sort Logic
  const filteredFolders = useMemo(() => {
    if (activeTab === 'starred') {
      return activeFolders.filter((f) => f.starred);
    }
    if (activeTab === 'shared' || activeTab === 'recent') {
      return [];
    }
    if (searchQuery.trim()) {
      return activeFolders.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return activeFolders.filter((f) => f.parentId === currentFolderId);
  }, [activeFolders, activeTab, searchQuery, currentFolderId]);

  const filteredFiles = useMemo(() => {
    let result = activeFiles;

    // Filter by Nav Tab
    if (activeTab === 'starred') {
      result = result.filter((f) => f.starred);
    } else if (activeTab === 'shared') {
      result = result.filter((f) => f.sharedWith && f.sharedWith.length > 0);
    } else if (activeTab === 'files') {
      if (!searchQuery.trim() && categoryFilter === 'all') {
        result = result.filter((f) => f.folderId === currentFolderId);
      }
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.tags.some((t) => t.toLowerCase().includes(q)) ||
          f.mimeType.toLowerCase().includes(q) ||
          (f.description && f.description.toLowerCase().includes(q))
      );
    }

    // Filter by Category
    if (categoryFilter !== 'all') {
      result = result.filter((f) => f.category === categoryFilter);
    }

    // Sorting Logic
    return [...result].sort((a, b) => {
      if (sortOption === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortOption === 'size') {
        return b.size - a.size;
      }
      if (sortOption === 'updatedAt') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sortOption === 'type') {
        return a.category.localeCompare(b.category);
      }
      return 0;
    });
  }, [activeFiles, activeTab, searchQuery, categoryFilter, currentFolderId, sortOption]);

  // Selection handlers
  const handleToggleSelectId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    const allCurrentIds = [
      ...filteredFolders.map((f) => f.id),
      ...filteredFiles.map((f) => f.id),
    ];
    if (selectedIds.length === allCurrentIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allCurrentIds);
    }
  };

  // Toggle Star
  const handleToggleStarFile = async (fileId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = currentFiles.find((f) => f.id === fileId);
    if (!target) return;
    const newStarred = !target.starred;

    // Optimistic UI update
    if (activeSource === 'drive') {
      setDriveFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, starred: newStarred } : f))
      );
      try {
        await toggleStarDriveItem(fileId, newStarred);
      } catch (err) {
        console.error('Failed to toggle star in Drive:', err);
        // Revert
        setDriveFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, starred: !newStarred } : f))
        );
      }
    } else {
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, starred: newStarred } : f))
      );
    }
  };

  const handleToggleStarFolder = async (folderId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = currentFolders.find((f) => f.id === folderId);
    if (!target) return;
    const newStarred = !target.starred;

    if (activeSource === 'drive') {
      setDriveFolders((prev) =>
        prev.map((f) => (f.id === folderId ? { ...f, starred: newStarred } : f))
      );
      try {
        await toggleStarDriveItem(folderId, newStarred);
      } catch (err) {
        console.error('Failed to star folder in Drive:', err);
        setDriveFolders((prev) =>
          prev.map((f) => (f.id === folderId ? { ...f, starred: !newStarred } : f))
        );
      }
    } else {
      setFolders((prev) =>
        prev.map((f) => (f.id === folderId ? { ...f, starred: newStarred } : f))
      );
    }
  };

  // Trigger Confirmation Modal for User-Owned Data mutation (Mandatory Workspace Directive)
  const requireUserConfirmation = (config: {
    title: string;
    description: string;
    items?: string[];
    confirmLabel?: string;
    isDestructive?: boolean;
    action: () => Promise<void>;
  }) => {
    setConfirmModal({
      isOpen: true,
      title: config.title,
      description: config.description,
      items: config.items || [],
      confirmLabel: config.confirmLabel || 'Confirm',
      isDestructive: config.isDestructive ?? true,
      action: config.action,
    });
  };

  // Move File to Trash (with confirmation)
  const handleTrashFile = (fileId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = currentFiles.find((f) => f.id === fileId);
    if (!target) return;

    requireUserConfirmation({
      title: `Move "${target.name}" to Trash?`,
      description:
        activeSource === 'drive'
          ? 'This item will be moved to your Google Drive trash and can be restored within 30 days.'
          : 'This item will be moved to the storage trash.',
      items: [target.name],
      confirmLabel: 'Move to Trash',
      isDestructive: true,
      action: async () => {
        if (activeSource === 'drive') {
          await trashDriveItem(fileId);
          setDriveFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? { ...f, inTrash: true, trashedAt: new Date().toISOString() }
                : f
            )
          );
        } else {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? { ...f, inTrash: true, trashedAt: new Date().toISOString() }
                : f
            )
          );
        }
        if (activeFileId === fileId) setActiveFileId(null);
      },
    });
  };

  // Move Folder to Trash (with confirmation)
  const handleTrashFolder = (folderId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = currentFolders.find((f) => f.id === folderId);
    if (!target) return;

    requireUserConfirmation({
      title: `Move Folder "${target.name}" to Trash?`,
      description:
        activeSource === 'drive'
          ? 'This folder and its contents will be moved to your Google Drive trash.'
          : 'This folder will be moved to your storage trash.',
      items: [target.name],
      confirmLabel: 'Move to Trash',
      isDestructive: true,
      action: async () => {
        if (activeSource === 'drive') {
          await trashDriveItem(folderId);
          setDriveFolders((prev) =>
            prev.map((f) => (f.id === folderId ? { ...f, inTrash: true } : f))
          );
        } else {
          setFolders((prev) =>
            prev.map((f) => (f.id === folderId ? { ...f, inTrash: true } : f))
          );
        }
      },
    });
  };

  // Batch Trash (with confirmation)
  const handleBatchTrash = () => {
    const selectedFiles = currentFiles.filter((f) => selectedIds.includes(f.id));
    const selectedFoldersList = currentFolders.filter((f) => selectedIds.includes(f.id));
    const allNames = [
      ...selectedFoldersList.map((f) => `${f.name} (Folder)`),
      ...selectedFiles.map((f) => f.name),
    ];

    requireUserConfirmation({
      title: `Move ${selectedIds.length} item(s) to Trash?`,
      description:
        activeSource === 'drive'
          ? `These ${selectedIds.length} items will be moved to your Google Drive trash.`
          : `These ${selectedIds.length} items will be moved to your storage trash.`,
      items: allNames,
      confirmLabel: 'Move to Trash',
      isDestructive: true,
      action: async () => {
        const now = new Date().toISOString();
        if (activeSource === 'drive') {
          for (const id of selectedIds) {
            try {
              await trashDriveItem(id);
            } catch (err) {
              console.error(`Failed to trash item ${id}:`, err);
            }
          }
          setDriveFiles((prev) =>
            prev.map((f) =>
              selectedIds.includes(f.id) ? { ...f, inTrash: true, trashedAt: now } : f
            )
          );
          setDriveFolders((prev) =>
            prev.map((f) =>
              selectedIds.includes(f.id) ? { ...f, inTrash: true } : f
            )
          );
        } else {
          setFiles((prev) =>
            prev.map((f) =>
              selectedIds.includes(f.id) ? { ...f, inTrash: true, trashedAt: now } : f
            )
          );
          setFolders((prev) =>
            prev.map((f) =>
              selectedIds.includes(f.id) ? { ...f, inTrash: true } : f
            )
          );
        }
        setSelectedIds([]);
      },
    });
  };

  // Batch Star
  const handleBatchStar = async () => {
    if (activeSource === 'drive') {
      for (const id of selectedIds) {
        try {
          await toggleStarDriveItem(id, true);
        } catch (err) {
          console.error(`Failed to star item ${id}:`, err);
        }
      }
      setDriveFiles((prev) =>
        prev.map((f) => (selectedIds.includes(f.id) ? { ...f, starred: true } : f))
      );
      setDriveFolders((prev) =>
        prev.map((f) => (selectedIds.includes(f.id) ? { ...f, starred: true } : f))
      );
    } else {
      setFiles((prev) =>
        prev.map((f) => (selectedIds.includes(f.id) ? { ...f, starred: true } : f))
      );
      setFolders((prev) =>
        prev.map((f) => (selectedIds.includes(f.id) ? { ...f, starred: true } : f))
      );
    }
    setSelectedIds([]);
  };

  // Restore file
  const handleRestoreFile = async (fileId: string) => {
    if (activeSource === 'drive') {
      await restoreDriveItem(fileId);
      setDriveFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, inTrash: false } : f))
      );
    } else {
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, inTrash: false } : f))
      );
    }
  };

  // Restore folder
  const handleRestoreFolder = async (folderId: string) => {
    if (activeSource === 'drive') {
      await restoreDriveItem(folderId);
      setDriveFolders((prev) =>
        prev.map((f) => (f.id === folderId ? { ...f, inTrash: false } : f))
      );
    } else {
      setFolders((prev) =>
        prev.map((f) => (f.id === folderId ? { ...f, inTrash: false } : f))
      );
    }
  };

  // Permanent Delete File (with confirmation)
  const handlePermanentDeleteFile = (fileId: string) => {
    const target = currentFiles.find((f) => f.id === fileId);
    requireUserConfirmation({
      title: `Permanently delete "${target?.name || 'this item'}"?`,
      description:
        'This item will be deleted forever from your cloud storage. This action CANNOT be undone.',
      items: target ? [target.name] : [],
      confirmLabel: 'Delete Forever',
      isDestructive: true,
      action: async () => {
        if (activeSource === 'drive') {
          await deleteDriveItemPermanently(fileId);
          setDriveFiles((prev) => prev.filter((f) => f.id !== fileId));
        } else {
          setFiles((prev) => prev.filter((f) => f.id !== fileId));
        }
      },
    });
  };

  // Permanent Delete Folder (with confirmation)
  const handlePermanentDeleteFolder = (folderId: string) => {
    const target = currentFolders.find((f) => f.id === folderId);
    requireUserConfirmation({
      title: `Permanently delete folder "${target?.name || 'this folder'}"?`,
      description:
        'This folder and all its contents will be deleted forever. This action CANNOT be undone.',
      items: target ? [target.name] : [],
      confirmLabel: 'Delete Forever',
      isDestructive: true,
      action: async () => {
        if (activeSource === 'drive') {
          await deleteDriveItemPermanently(folderId);
          setDriveFolders((prev) => prev.filter((f) => f.id !== folderId));
        } else {
          setFolders((prev) => prev.filter((f) => f.id !== folderId));
        }
      },
    });
  };

  // Empty Trash (with confirmation)
  const handleEmptyTrash = () => {
    const totalCount = trashedFiles.length + trashedFolders.length;
    requireUserConfirmation({
      title: `Permanently Empty Trash (${totalCount} items)?`,
      description:
        activeSource === 'drive'
          ? 'All items in your Google Drive trash will be permanently purged. This will free up storage space in your Google Account and cannot be undone.'
          : 'All items in the trash will be cleared permanently.',
      confirmLabel: 'Empty Trash',
      isDestructive: true,
      action: async () => {
        if (activeSource === 'drive') {
          await emptyDriveTrash();
          setDriveFiles((prev) => prev.filter((f) => !f.inTrash));
          setDriveFolders((prev) => prev.filter((f) => !f.inTrash));
          loadDriveData(currentFolderId, activeTab, searchQuery);
        } else {
          setFiles((prev) => prev.filter((f) => !f.inTrash));
          setFolders((prev) => prev.filter((f) => !f.inTrash));
        }
      },
    });
  };

  // Create folder
  const handleCreateFolder = async (name: string, color: string) => {
    if (activeSource === 'drive') {
      const created = await createDriveFolder(name, currentFolderId);
      setDriveFolders((prev) => [created, ...prev]);
    } else {
      const newFolder: FolderItem = {
        id: `folder-${Date.now()}`,
        name,
        parentId: currentFolderId,
        color,
        starred: false,
        inTrash: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setFolders((prev) => [newFolder, ...prev]);
    }
  };

  // Upload file
  const handleUploadDriveFile = async (
    file: File,
    onProgress?: (p: number) => void
  ): Promise<FileItem> => {
    const uploaded = await uploadDriveFile(file, currentFolderId, onProgress);
    setDriveFiles((prev) => [uploaded, ...prev]);
    return uploaded;
  };

  const handleUploadSuccess = (newFiles: FileItem[]) => {
    if (activeSource === 'drive') {
      setDriveFiles((prev) => [...newFiles, ...prev]);
    } else {
      setFiles((prev) => [...newFiles, ...prev]);
    }
  };

  // Update file metadata
  const handleUpdateFile = async (updated: FileItem) => {
    if (activeSource === 'drive') {
      setDriveFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      try {
        await updateDriveItem(updated.id, {
          name: updated.name,
          description: updated.description,
        });
      } catch (err) {
        console.error('Failed to update file in Drive:', err);
      }
    } else {
      setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    }
  };

  const activeInspectFile = useMemo(() => {
    return currentFiles.find((f) => f.id === activeFileId) || null;
  }, [currentFiles, activeFileId]);

  return (
    <div
      id="app-root"
      className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden antialiased select-none"
    >
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedIds([]);
          setActiveFileId(null);
        }}
        usedBytes={usedBytes}
        currentPlan={currentPlan}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenCreateFolder={() => setIsCreateFolderOpen(true)}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
        starredCount={starredCount}
        trashCount={trashedFiles.length + trashedFolders.length}
        onBootKex={handleBootKexLinux}
        onBootOs={handleBootOs}
        onOpenBrainkStudio={handleOpenBrainkStudio}
        onOpenIsoStandards={() => setIsIsoStandardsOpen(true)}
        isDriveConnected={isDriveConnected}
        isDriveLoading={isDriveLoading}
        driveUser={driveUser}
        driveQuota={driveQuota}
        activeSource={activeSource}
        setActiveSource={setActiveSource}
        onConnectDrive={handleGoogleSignIn}
        onDisconnectDrive={handleSignOut}
        onRefreshDrive={handleRefresh}
        isSyncing={isSyncing}
      />

      {/* Main Content Workspace Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {activeTab === 'server' ? (
          <VirtualCloudServer
            files={currentFiles}
            onLaunchApp={handleLaunchHtml5App}
            onBootKexLinux={handleBootKexLinux}
            onBootOs={handleBootOs}
            isDriveConnected={isDriveConnected}
            initialSubTab={serverSubTab}
          />
        ) : activeTab === 'index' ? (
          <MasterIndex
            files={currentFiles}
            folders={currentFolders}
            activeSource={activeSource}
            currentPlan={currentPlan}
            isDriveConnected={isDriveConnected}
            onPreviewFile={(file) => setPreviewFile(file)}
            onLaunchApp={handleLaunchHtml5App}
            onToggleStar={handleToggleStarFile}
            onNavigateFolder={handleNavigateFolder}
          />
        ) : activeTab === 'analytics' ? (
          <StorageAnalyzer
            files={currentFiles}
            usedBytes={usedBytes}
            currentPlan={
              activeSource === 'drive' && driveQuota
                ? {
                    id: 'gdrive',
                    name: 'Google One / Drive Storage',
                    limitBytes: driveQuota.limit,
                    badge: 'Google Account',
                    color: 'from-blue-600 to-indigo-600',
                  }
                : currentPlan
            }
            onDeleteFile={handleTrashFile}
            onEmptyTrash={handleEmptyTrash}
            trashCount={trashedFiles.length + trashedFolders.length}
            trashBytes={trashBytes}
            onOpenUpgrade={() => setIsUpgradeOpen(true)}
          />
        ) : activeTab === 'trash' ? (
          <TrashBin
            trashedFiles={trashedFiles}
            trashedFolders={trashedFolders}
            onRestoreFile={handleRestoreFile}
            onRestoreFolder={handleRestoreFolder}
            onPermanentDeleteFile={handlePermanentDeleteFile}
            onPermanentDeleteFolder={handlePermanentDeleteFolder}
            onEmptyTrash={handleEmptyTrash}
          />
        ) : activeTab === 'recent' ? (
          <RecentActivity files={currentFiles} />
        ) : activeTab === 'apps' ? (
          <Html5AppHub
            files={currentFiles}
            onLaunchApp={handleLaunchHtml5App}
            onInspectCode={(file) => {
              setPreviewFile(file);
            }}
            isDriveMode={activeSource === 'drive' && isDriveConnected}
            onRefresh={handleRefresh}
            isSyncing={isSyncing}
            onDeployTemplate={handleDeployTemplate}
          />
        ) : (
          <>
            {/* Header Toolbar */}
            <Header
              currentFolder={currentFolder}
              folderBreadcrumbs={folderBreadcrumbs}
              onNavigateFolder={handleNavigateFolder}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              viewMode={viewMode}
              setViewMode={setViewMode}
              sortOption={sortOption}
              setSortOption={setSortOption}
              selectedIds={selectedIds}
              onClearSelection={() => setSelectedIds([])}
              onBatchStar={handleBatchStar}
              onBatchTrash={handleBatchTrash}
              onSelectAll={handleSelectAll}
              isAllSelected={
                selectedIds.length > 0 &&
                selectedIds.length === filteredFolders.length + filteredFiles.length
              }
              totalCount={filteredFolders.length + filteredFiles.length}
              onBootOs={handleBootOs}
              onOpenIsoStandards={() => setIsIsoStandardsOpen(true)}
              activeSource={activeSource}
              isDriveConnected={isDriveConnected}
              onConnectDrive={handleGoogleSignIn}
              onRefreshDrive={handleRefresh}
              isSyncing={isSyncing}
            />

            {/* Google Drive Status Banner when activeSource is drive and disconnected */}
            {activeSource === 'drive' && !isDriveConnected && (
              <div className="mx-6 mt-3 p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Google Drive Mode (Disconnected)</p>
                    <p className="text-[11px] text-slate-400">
                      Sign in with your Google account to sync real cloud files, or switch to your preloaded Local Vault.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <GoogleSignInButton
                    onClick={handleGoogleSignIn}
                    isLoading={isDriveLoading}
                    text="Sign in with Google"
                    className="px-3 py-1.5 text-xs shadow-md"
                  />
                  <button
                    onClick={() => setActiveSource('local')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Database className="w-3.5 h-3.5 text-blue-400" />
                    <span>Use Local Vault</span>
                  </button>
                </div>
              </div>
            )}

            {/* Error Banner if any */}
            {driveError && activeSource === 'drive' && (
              <div className="mx-6 mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{driveError}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSource('local')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-[11px] font-medium hover:bg-slate-700 cursor-pointer"
                  >
                    Switch to Local
                  </button>
                  <button
                    onClick={handleRefresh}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-medium hover:bg-rose-500 cursor-pointer"
                  >
                    Retry Sync
                  </button>
                </div>
              </div>
            )}

            {/* Empty State when in Drive mode and disconnected without files */}
            {activeSource === 'drive' && !isDriveConnected && filteredFolders.length === 0 && filteredFiles.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4 max-w-md mx-auto my-auto">
                <div className="w-14 h-14 rounded-2xl bg-blue-950/60 border border-blue-800/80 flex items-center justify-center text-blue-400 shadow-lg">
                  <Cloud className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white">Google Drive Not Connected</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Connect your Google account to browse, search, and upload files to Google Drive, or explore the preloaded Local Vault.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <GoogleSignInButton
                    onClick={handleGoogleSignIn}
                    isLoading={isDriveLoading}
                    text="Sign in with Google"
                    className="px-4 py-2 text-xs shadow-md"
                  />
                  <button
                    onClick={() => setActiveSource('local')}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Database className="w-3.5 h-3.5 text-blue-400" />
                    <span>Open Local Vault</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Files & Folders View Pane */
              <div className="flex-1">
                {viewMode === 'grid' ? (
                  <FileGrid
                    folders={filteredFolders}
                    files={filteredFiles}
                    selectedIds={selectedIds}
                    activeFileId={activeFileId}
                    onSelectFolder={handleNavigateFolder}
                    onSelectFile={(file) => setActiveFileId(file.id)}
                    onToggleSelectId={handleToggleSelectId}
                    onToggleStarFile={handleToggleStarFile}
                    onToggleStarFolder={handleToggleStarFolder}
                    onTrashFile={handleTrashFile}
                    onTrashFolder={handleTrashFolder}
                    onPreviewFile={(file, e) => {
                      e.stopPropagation();
                      setPreviewFile(file);
                    }}
                    onShareFile={(file, e) => {
                      e.stopPropagation();
                      setShareFile(file);
                    }}
                    getFolderStats={getFolderStats}
                    onLaunchApp={handleLaunchHtml5App}
                  />
                ) : (
                  <FileList
                    folders={filteredFolders}
                    files={filteredFiles}
                    selectedIds={selectedIds}
                    activeFileId={activeFileId}
                    onSelectFolder={handleNavigateFolder}
                    onSelectFile={(file) => setActiveFileId(file.id)}
                    onToggleSelectId={handleToggleSelectId}
                    onToggleStarFile={handleToggleStarFile}
                    onToggleStarFolder={handleToggleStarFolder}
                    onTrashFile={handleTrashFile}
                    onTrashFolder={handleTrashFolder}
                    onPreviewFile={(file, e) => {
                      e.stopPropagation();
                      setPreviewFile(file);
                    }}
                    onShareFile={(file, e) => {
                      e.stopPropagation();
                      setShareFile(file);
                    }}
                    getFolderStats={getFolderStats}
                    onLaunchApp={handleLaunchHtml5App}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Right Slide-over Inspector Panel */}
      {activeInspectFile && (
        <FileInspector
          file={activeInspectFile}
          onClose={() => setActiveFileId(null)}
          onToggleStar={(id) => handleToggleStarFile(id)}
          onTrash={(id) => handleTrashFile(id)}
          onPreview={(file) => setPreviewFile(file)}
          onShare={(file) => setShareFile(file)}
          onUpdateFile={handleUpdateFile}
          folderName={
            currentFolder?.name ||
            (activeSource === 'drive' ? 'Google Drive' : 'Storage Space')
          }
          onLaunchApp={handleLaunchHtml5App}
        />
      )}

      {/* Upload Modal with direct Google Drive upload */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        currentFolderId={currentFolderId}
        folderName={
          currentFolder?.name ||
          (activeSource === 'drive' ? 'Google Drive Root' : 'Storage Space')
        }
        isDriveMode={activeSource === 'drive' && isDriveConnected}
        onUploadDriveFile={handleUploadDriveFile}
      />

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        onCreateFolder={handleCreateFolder}
        currentFolderId={currentFolderId}
        isDriveMode={activeSource === 'drive' && isDriveConnected}
      />

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        onShare={(file) => setShareFile(file)}
        onToggleStar={(id) => handleToggleStarFile(id)}
        onLaunchApp={handleLaunchHtml5App}
        onSaveContent={handleSaveAppCode}
      />

      {/* Share Modal */}
      <ShareModal file={shareFile} onClose={() => setShareFile(null)} />

      {/* Storage Plan Modal */}
      <StoragePlanModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        currentPlan={currentPlan}
        onSelectPlan={(plan) => setCurrentPlan(plan)}
        usedBytes={usedBytes}
      />

      {/* Confirmation Modal for destructive actions */}
      <ConfirmActionModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={async () => {
          setIsActionLoading(true);
          try {
            await confirmModal.action();
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          } catch (err: any) {
            console.error('Action failed:', err);
            setDriveError(err.message || 'Action failed');
          } finally {
            setIsActionLoading(false);
          }
        }}
        title={confirmModal.title}
        description={confirmModal.description}
        items={confirmModal.items}
        confirmLabel={confirmModal.confirmLabel}
        isDestructive={confirmModal.isDestructive}
        isLoading={isActionLoading}
      />

      {/* Interactive Sandboxed HTML5 App Runner Modal */}
      {runningAppFile && (
        <Html5AppRunner
          file={runningAppFile}
          isOpen={Boolean(runningAppFile)}
          onClose={() => setRunningAppFile(null)}
          onSaveCode={handleSaveAppCode}
          isDriveMode={activeSource === 'drive' && isDriveConnected}
        />
      )}

      {/* ISO 9241-110 & ISO/IEC 25010 Systems & Architecture Inspector */}
      <IsoGlobalInspectorModal
        isOpen={isIsoStandardsOpen}
        onClose={() => setIsIsoStandardsOpen(false)}
      />
    </div>
  );
}
