import React from 'react';
import {
  Server,
  Search,
  LayoutGrid,
  List,
  ArrowUpDown,
  ChevronRight,
  Folder,
  Star,
  Trash2,
  X,
  Filter,
  CheckSquare,
  Square,
  Cloud,
  RefreshCw,
  HardDrive,
  Terminal,
  BookOpen
} from 'lucide-react';
import { FileCategory, FolderItem, SortOption, ViewMode } from '../types';

interface HeaderProps {
  currentFolder: FolderItem | null;
  folderBreadcrumbs: FolderItem[];
  onNavigateFolder: (folderId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: FileCategory | 'all';
  setCategoryFilter: (cat: FileCategory | 'all') => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  sortOption: SortOption;
  setSortOption: (sort: SortOption) => void;
  selectedIds: string[];
  onClearSelection: () => void;
  onBatchStar: () => void;
  onBatchTrash: () => void;
  onSelectAll: () => void;
  isAllSelected: boolean;
  totalCount: number;
  onBootOs?: () => void;
  onOpenIsoStandards?: () => void;
  // Google Drive integration
  activeSource?: 'drive' | 'local';
  isDriveConnected?: boolean;
  onConnectDrive?: () => void;
  onRefreshDrive?: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentFolder,
  folderBreadcrumbs,
  onNavigateFolder,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  viewMode,
  setViewMode,
  sortOption,
  setSortOption,
  selectedIds,
  onClearSelection,
  onBatchStar,
  onBatchTrash,
  onSelectAll,
  isAllSelected,
  totalCount,
  onBootOs,
  onOpenIsoStandards,
  activeSource = 'local',
  isDriveConnected = false,
  onConnectDrive,
  onRefreshDrive,
  isSyncing = false,
}) => {
  const categories: { id: FileCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Files' },
    { id: 'images', label: 'Images' },
    { id: 'documents', label: 'Documents' },
    { id: 'videos', label: 'Videos' },
    { id: 'audio', label: 'Audio' },
    { id: 'code', label: 'Code' },
    { id: 'archives', label: 'Archives' },
  ];

  const rootLabel = activeSource === 'drive' ? 'Google Drive' : 'SERVERspace Vault';

  return (
    <header className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-3 space-y-3">
      {/* Top Row: Breadcrumbs & Search & Sync */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Folder Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-sm overflow-x-auto py-1 no-scrollbar">
          <button
            onClick={() => onNavigateFolder(null)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              currentFolder === null
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {activeSource === 'drive' ? (
              <Cloud className="w-4 h-4 text-blue-400" />
            ) : (
              <Server className="w-4 h-4 text-cyan-400" />
            )}
            <span>{rootLabel}</span>
          </button>

          {folderBreadcrumbs.map((crumb) => (
            <React.Fragment key={crumb.id}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <button
                onClick={() => onNavigateFolder(crumb.id)}
                className={`px-2 py-1 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  currentFolder?.id === crumb.id
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Search Bar & Sync Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeSource === 'drive'
                  ? 'Search Google Drive files...'
                  : 'Search vault files, tags...'
              }
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/80 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {activeSource === 'drive' && (
            <div className="flex items-center gap-1.5 shrink-0">
              {isDriveConnected ? (
                <button
                  onClick={onRefreshDrive}
                  disabled={isSyncing}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                  title="Sync files from Google Drive"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 text-blue-400 ${
                      isSyncing ? 'animate-spin' : ''
                    }`}
                  />
                  <span className="hidden sm:inline">
                    {isSyncing ? 'Syncing...' : 'Sync'}
                  </span>
                </button>
              ) : (
                <button
                  onClick={onConnectDrive}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Connect Drive</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected Items Quick Bar vs. Filter Pills */}
      {selectedIds.length > 0 ? (
        <div className="flex items-center justify-between bg-blue-950/60 border border-blue-800/60 rounded-lg px-4 py-2 text-xs text-blue-200 animate-fadeIn">
          <div className="flex items-center gap-3">
            <button
              onClick={onSelectAll}
              className="flex items-center gap-1.5 hover:text-white cursor-pointer"
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-blue-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span className="font-medium">{selectedIds.length} item(s) selected</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBatchStar}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-900/60 hover:bg-blue-800 text-blue-100 cursor-pointer transition-colors"
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Star</span>
            </button>
            <button
              onClick={onBatchTrash}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-900/40 hover:bg-rose-900/80 text-rose-200 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Delete</span>
            </button>
            <button
              onClick={onClearSelection}
              className="p-1 hover:bg-blue-900/40 rounded text-slate-400 hover:text-white cursor-pointer"
              title="Cancel Selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-1" />
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-all cursor-pointer text-xs font-medium ${
                  categoryFilter === cat.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* View Toggles & Sort */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Item Counter */}
            <span className="text-slate-500 font-mono text-[11px]">
              {totalCount} item{totalCount !== 1 ? 's' : ''}
            </span>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-transparent text-slate-300 text-xs outline-none cursor-pointer"
              >
                <option value="name" className="bg-slate-900 text-slate-200">Sort by Name</option>
                <option value="updatedAt" className="bg-slate-900 text-slate-200">Sort by Modified</option>
                <option value="size" className="bg-slate-900 text-slate-200">Sort by Size</option>
                <option value="type" className="bg-slate-900 text-slate-200">Sort by Category</option>
              </select>
            </div>

            {/* Grid / List Mode */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-slate-800 text-blue-400' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-slate-800 text-blue-400' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* ISO Standards & HCI Architecture Inspector */}
            {onOpenIsoStandards && (
              <button
                type="button"
                onClick={onOpenIsoStandards}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                title="ISO 9241-110 & ISO/IEC 25010 Systems & Architecture Inspector"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>ISO Standards</span>
              </button>
            )}

            {/* Quick Boot OS Shortcut */}
            {onBootOs && (
              <button
                onClick={onBootOs}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/40 text-xs font-semibold transition-colors cursor-pointer"
                title="Boot Open-Source AetherOS in Execution Sandbox"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Boot OS</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
