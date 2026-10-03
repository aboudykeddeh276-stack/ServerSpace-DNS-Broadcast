import React from 'react';
import {
  Server,
  HardDrive,
  Folder,
  BarChart3,
  Star,
  Clock,
  Trash2,
  Users,
  Plus,
  Sparkles,
  ChevronRight,
  Database,
  Cloud,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Terminal,
  BookOpen
} from 'lucide-react';
import { GoogleDriveQuota, GoogleDriveUser, NavTab, StoragePlan } from '../types';
import { formatBytes } from '../data/initialData';
import { GoogleSignInButton } from './GoogleSignInButton';
import { BrainkSidebarConsole } from './BrainkSidebarConsole';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  usedBytes: number;
  currentPlan: StoragePlan;
  onOpenUpload: () => void;
  onOpenCreateFolder: () => void;
  onOpenUpgrade: () => void;
  starredCount: number;
  trashCount: number;
  onBootOs?: () => void;
  onBootKex?: () => void;
  onOpenBrainkStudio?: () => void;
  onOpenIsoStandards?: () => void;
  // Google Drive integration props
  isDriveConnected: boolean;
  isDriveLoading: boolean;
  driveUser: GoogleDriveUser | null;
  driveQuota: GoogleDriveQuota | null;
  activeSource: 'drive' | 'local';
  setActiveSource: (source: 'drive' | 'local') => void;
  onConnectDrive: () => void;
  onDisconnectDrive: () => void;
  onRefreshDrive: () => void;
  isSyncing: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  usedBytes,
  currentPlan,
  onOpenUpload,
  onOpenCreateFolder,
  onOpenUpgrade,
  starredCount,
  trashCount,
  onBootOs,
  onBootKex,
  onOpenBrainkStudio,
  onOpenIsoStandards,
  isDriveConnected,
  isDriveLoading,
  driveUser,
  driveQuota,
  activeSource,
  setActiveSource,
  onConnectDrive,
  onDisconnectDrive,
  onRefreshDrive,
  isSyncing,
}) => {
  // Determine effective storage quota
  const effectiveLimit =
    activeSource === 'drive' && driveQuota
      ? driveQuota.limit
      : currentPlan.limitBytes;

  const effectiveUsed =
    activeSource === 'drive' && driveQuota
      ? driveQuota.usage
      : usedBytes;

  const percentage = Math.min(
    100,
    Math.round((effectiveUsed / (effectiveLimit || 1)) * 100)
  );

  // Storage meter color
  let meterColor = 'bg-blue-600';
  if (percentage > 85) {
    meterColor = 'bg-rose-500';
  } else if (percentage > 70) {
    meterColor = 'bg-amber-500';
  }

  const navItems = [
    {
      id: 'server' as NavTab,
      label: 'Virtual Cloud Server',
      icon: Server,
      badge: 'Cluster Online',
      highlight: true,
    },
    {
      id: 'files' as NavTab,
      label: activeSource === 'drive' ? 'Google Drive Files' : 'VFS Vault Files',
      icon: Folder,
      count: null,
    },
    {
      id: 'index' as NavTab,
      label: 'Full Master Index',
      icon: BookOpen,
      badge: '100% Full',
    },
    {
      id: 'apps' as NavTab,
      label: 'HTML5 Technologies',
      icon: Sparkles,
    },
    {
      id: 'analytics' as NavTab,
      label: 'Server & Storage Analytics',
      icon: BarChart3,
    },
    {
      id: 'starred' as NavTab,
      label: 'Starred Items',
      icon: Star,
      count: starredCount,
    },
    {
      id: 'recent' as NavTab,
      label: 'Recent Activity',
      icon: Clock,
    },
    {
      id: 'shared' as NavTab,
      label: 'Shared with Me',
      icon: Users,
    },
    {
      id: 'trash' as NavTab,
      label: 'Trash / Bin',
      icon: Trash2,
      count: trashCount,
      alert: trashCount > 0,
    },
  ];

  return (
    <aside
      id="app-sidebar"
      className="w-68 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen select-none text-slate-300 overflow-y-auto no-scrollbar"
    >
      {/* Top Header & Brand */}
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3 px-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-white tracking-wide text-sm leading-tight truncate">
              SERVERspace
            </h1>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <span>Cloud Server</span>
              <span className="text-cyan-400 font-bold">• v6.8</span>
            </p>
          </div>
        </div>

        {/* Source Switcher: Google Drive vs Local Vault */}
        <div className="bg-slate-950 p-1 rounded-xl border border-slate-800/80 flex gap-1">
          <button
            id="source-tab-drive"
            onClick={() => setActiveSource('drive')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeSource === 'drive'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Google Drive</span>
            {isDriveConnected && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            )}
          </button>
          <button
            id="source-tab-local"
            onClick={() => setActiveSource('local')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeSource === 'local'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Local Vault</span>
          </button>
        </div>

        {/* Google Drive Account Card (if connected) or Connect Card */}
        {activeSource === 'drive' && (
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-2.5">
            {isDriveConnected && driveUser ? (
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {driveUser.photoLink ? (
                      <img
                        src={driveUser.photoLink}
                        alt={driveUser.displayName}
                        className="w-7 h-7 rounded-full border border-slate-700 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                        {driveUser.displayName.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">
                        {driveUser.displayName}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {driveUser.emailAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      id="sync-drive-btn"
                      onClick={onRefreshDrive}
                      disabled={isSyncing}
                      className={`p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors cursor-pointer ${
                        isSyncing ? 'animate-spin text-blue-400' : ''
                      }`}
                      title="Sync from Google Drive"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id="disconnect-drive-btn"
                      onClick={onDisconnectDrive}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Sign Out of Google Drive"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Connected with Drive Permissions</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-xs text-slate-300">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-300 leading-tight">
                    Connect Google Drive to browse, organize, and upload your real cloud files.
                  </p>
                </div>
                <GoogleSignInButton
                  onClick={onConnectDrive}
                  isLoading={isDriveLoading}
                  text="Sign in with Google"
                  className="w-full py-2"
                />
              </div>
            )}
          </div>
        )}

        {/* Quick Create Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            id="sidebar-upload-btn"
            onClick={onOpenUpload}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-xs transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload</span>
          </button>
          <button
            id="sidebar-new-folder-btn"
            onClick={onOpenCreateFolder}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-slate-200 border border-slate-700 font-medium text-xs transition-colors cursor-pointer"
          >
            <Folder className="w-4 h-4 text-amber-400" />
            <span>New Folder</span>
          </button>
        </div>

        {/* Primary Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
                    {item.badge}
                  </span>
                )}
                {item.highlight && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                    Insights
                  </span>
                )}
                {item.count !== null && item.count !== undefined && item.count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono shrink-0 ${
                      item.alert
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          {(onBootKex || onBootOs) && (
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              {onBootKex && (
                <button
                  id="sidebar-boot-kex-btn"
                  onClick={onBootKex}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 text-cyan-200 hover:text-white hover:border-cyan-400 transition-all cursor-pointer group shadow-sm"
                  title="Boot KEX Linux Terminal by A. Keddeh (Braink AI)"
                >
                  <div className="flex items-center gap-2.5">
                    <Terminal className="w-4 h-4 text-cyan-400 group-hover:animate-pulse" />
                    <span>Boot KEX Linux</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30 font-bold">
                    KEX
                  </span>
                </button>
              )}

              {onBootOs && (
                <button
                  id="sidebar-boot-os-btn"
                  onClick={onBootOs}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-700/40 text-blue-200 hover:text-white hover:border-blue-500 transition-all cursor-pointer group shadow-sm"
                  title="Boot AetherOS Linux 6.12 Kernel with DOM Rigour Lab"
                >
                  <div className="flex items-center gap-2.5">
                    <Terminal className="w-4 h-4 text-blue-400 group-hover:animate-pulse" />
                    <span>Boot AetherOS</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono border border-blue-500/30 font-bold">
                    OS
                  </span>
                </button>
              )}

              {onOpenIsoStandards && (
                <button
                  id="sidebar-iso-standards-btn"
                  onClick={onOpenIsoStandards}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold bg-slate-950/80 border border-slate-800 text-cyan-300 hover:text-white hover:border-cyan-500/40 transition-all cursor-pointer group shadow-sm"
                  title="ISO 9241-110 & ISO 25010 Systems Architecture Inspector"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-cyan-400 group-hover:text-cyan-200" />
                    <span>ISO Standards</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30 font-bold">
                    ISO
                  </span>
                </button>
              )}
            </div>
          )}
        </nav>

        {/* Software 'Braink' Neural Activity Console with Pulsing Light Animations */}
        <div className="pt-2 border-t border-slate-800/60">
          <BrainkSidebarConsole onOpenBrainkStudio={onOpenBrainkStudio} />
        </div>
      </div>

      {/* Bottom Storage Meter & Plan Widget */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/50 space-y-3">
        <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>
                {activeSource === 'drive' ? 'Google Drive Quota' : 'Vault Storage'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">{percentage}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${meterColor} transition-all duration-500 rounded-full`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>{formatBytes(effectiveUsed)} used</span>
            <span>{formatBytes(effectiveLimit)}</span>
          </div>

          {activeSource === 'local' ? (
            <button
              onClick={onOpenUpgrade}
              className="w-full mt-1 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-900/40 to-blue-900/40 hover:from-indigo-800/50 hover:to-blue-800/50 border border-indigo-500/30 text-indigo-300 text-[11px] font-medium transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentPlan.name}</span>
              </div>
              <div className="flex items-center text-slate-400 group-hover:text-white">
                <span>Upgrade</span>
                <ChevronRight className="w-3 h-3 ml-0.5" />
              </div>
            </button>
          ) : (
            <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
              <span>Drive Cloud Quota</span>
              <span>15 GB Default</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
