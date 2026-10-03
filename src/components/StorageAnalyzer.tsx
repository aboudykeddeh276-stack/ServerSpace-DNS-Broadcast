import React, { useState } from 'react';
import {
  BarChart3,
  HardDrive,
  Sparkles,
  Trash2,
  Copy,
  AlertTriangle,
  Zap,
  CheckCircle2,
  PieChart,
  Layers,
  ArrowRight
} from 'lucide-react';
import { FileCategory, FileItem, StoragePlan } from '../types';
import { CATEGORY_CONFIG, formatBytes } from '../data/initialData';
import { CategoryIcon } from './CategoryIcon';

interface StorageAnalyzerProps {
  files: FileItem[];
  usedBytes: number;
  currentPlan: StoragePlan;
  onDeleteFile: (fileId: string) => void;
  onEmptyTrash: () => void;
  trashCount: number;
  trashBytes: number;
  onOpenUpgrade: () => void;
}

export const StorageAnalyzer: React.FC<StorageAnalyzerProps> = ({
  files,
  usedBytes,
  currentPlan,
  onDeleteFile,
  onEmptyTrash,
  trashCount,
  trashBytes,
  onOpenUpgrade,
}) => {
  const [selectedCleanupIds, setSelectedCleanupIds] = useState<string[]>([]);
  const [activeCleanTab, setActiveCleanTab] = useState<'large' | 'duplicates' | 'old'>('large');

  // Filter non-trashed files for category calculation
  const activeFiles = files.filter((f) => !f.inTrash);

  // Group size by category
  const categoryStats = (Object.keys(CATEGORY_CONFIG) as FileCategory[]).map((cat) => {
    const catFiles = activeFiles.filter((f) => f.category === cat);
    const totalCatBytes = catFiles.reduce((acc, f) => acc + f.size, 0);
    const percent = usedBytes > 0 ? (totalCatBytes / usedBytes) * 100 : 0;
    return {
      category: cat,
      info: CATEGORY_CONFIG[cat],
      count: catFiles.length,
      bytes: totalCatBytes,
      percentage: percent,
    };
  });

  // Large files (> 100 MB)
  const largeFiles = activeFiles.filter((f) => f.size > 100 * 1024 * 1024);

  // Duplicates
  const duplicateFiles = activeFiles.filter((f) => f.isDuplicate);

  // Old files (older than 6 months, simulated)
  const oldFiles = activeFiles.filter((f) => {
    const date = new Date(f.updatedAt);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 2); // 2 months for demo purposes
    return date < sixMonthsAgo;
  });

  const handleToggleSelectClean = (id: string) => {
    if (selectedCleanupIds.includes(id)) {
      setSelectedCleanupIds(selectedCleanupIds.filter((i) => i !== id));
    } else {
      setSelectedCleanupIds([...selectedCleanupIds, id]);
    }
  };

  const handleBulkCleanup = () => {
    selectedCleanupIds.forEach((id) => onDeleteFile(id));
    setSelectedCleanupIds([]);
  };

  const overallPercentage = Math.min(100, Math.round((usedBytes / currentPlan.limitBytes) * 100));

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider">
              <PieChart className="w-4 h-4" />
              <span>Storage Intelligence & Usage</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {formatBytes(usedBytes)} <span className="text-slate-400 font-normal text-lg">of {formatBytes(currentPlan.limitBytes)} used</span>
            </h1>
            <p className="text-slate-400 text-xs max-w-lg">
              You are currently utilizing {overallPercentage}% of your {currentPlan.name} quota. Clean up heavy or duplicate files to recover space.
            </p>
          </div>

          <button
            onClick={onOpenUpgrade}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Expand Vault Storage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Multi-Segment Storage Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
            {categoryStats.map((stat) =>
              stat.bytes > 0 ? (
                <div
                  key={stat.category}
                  className="h-full rounded-sm transition-all duration-300"
                  style={{
                    width: `${(stat.bytes / currentPlan.limitBytes) * 100}%`,
                    backgroundColor: stat.info.color,
                  }}
                  title={`${stat.info.label}: ${formatBytes(stat.bytes)} (${stat.percentage.toFixed(1)}%)`}
                />
              ) : null
            )}
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
            {categoryStats.map((stat) => (
              <div key={stat.category} className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: stat.info.color }}
                />
                <span className="text-slate-400">{stat.info.label.split(' ')[0]}:</span>
                <span className="font-semibold text-slate-200">{formatBytes(stat.bytes)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown Cards */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Storage Breakdown by Category
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categoryStats.map((stat) => (
            <div
              key={stat.category}
              className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <div
                  className="p-2.5 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${stat.info.color}18` }}
                >
                  <CategoryIcon category={stat.category} className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-semibold text-slate-400">
                  {stat.percentage.toFixed(1)}%
                </span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white">{stat.info.label}</h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  {stat.count} file{stat.count !== 1 ? 's' : ''} • {formatBytes(stat.bytes)}
                </p>
              </div>

              {/* Category Mini Progress Meter */}
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, stat.percentage)}%`,
                    backgroundColor: stat.info.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Smart Space Cleaner Module */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Smart Storage Optimizer</h2>
              <p className="text-xs text-slate-400">Identify heavy, duplicate, and old files to free up space instantly.</p>
            </div>
          </div>

          {/* Quick Trash Empty Button */}
          {trashCount > 0 && (
            <button
              onClick={onEmptyTrash}
              className="px-3.5 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-200 text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Empty Trash ({formatBytes(trashBytes)})</span>
            </button>
          )}
        </div>

        {/* Cleaner Filter Tabs */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => { setActiveCleanTab('large'); setSelectedCleanupIds([]); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeCleanTab === 'large' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Large Files ({largeFiles.length})
            </button>
            <button
              onClick={() => { setActiveCleanTab('duplicates'); setSelectedCleanupIds([]); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeCleanTab === 'duplicates' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Duplicates ({duplicateFiles.length})
            </button>
            <button
              onClick={() => { setActiveCleanTab('old'); setSelectedCleanupIds([]); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeCleanTab === 'old' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Old Files ({oldFiles.length})
            </button>
          </div>

          {selectedCleanupIds.length > 0 && (
            <button
              onClick={handleBulkCleanup}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center gap-1.5 shadow cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedCleanupIds.length})</span>
            </button>
          )}
        </div>

        {/* Cleaner Item List */}
        <div className="space-y-2">
          {activeCleanTab === 'large' && (
            largeFiles.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No large files over 100MB found.</p>
            ) : (
              largeFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <input
                      type="checkbox"
                      checked={selectedCleanupIds.includes(file.id)}
                      onChange={() => handleToggleSelectClean(file.id)}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <CategoryIcon category={file.category} className="w-4 h-4 shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-slate-200 truncate">{file.name}</p>
                      <p className="text-[11px] font-mono text-slate-400">{formatBytes(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteFile(file.id)}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )
          )}

          {activeCleanTab === 'duplicates' && (
            duplicateFiles.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No duplicate files detected in your vault.</p>
            ) : (
              duplicateFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <input
                      type="checkbox"
                      checked={selectedCleanupIds.includes(file.id)}
                      onChange={() => handleToggleSelectClean(file.id)}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <Copy className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-slate-200 truncate">{file.name}</p>
                      <p className="text-[11px] font-mono text-slate-400">{formatBytes(file.size)} • Duplicate copy</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteFile(file.id)}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )
          )}

          {activeCleanTab === 'old' && (
            oldFiles.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No old or stale files found.</p>
            ) : (
              oldFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <input
                      type="checkbox"
                      checked={selectedCleanupIds.includes(file.id)}
                      onChange={() => handleToggleSelectClean(file.id)}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <CategoryIcon category={file.category} className="w-4 h-4 shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-slate-200 truncate">{file.name}</p>
                      <p className="text-[11px] font-mono text-slate-400">{formatBytes(file.size)} • Modified months ago</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteFile(file.id)}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )
          )}
        </div>
      </section>
    </div>
  );
};
