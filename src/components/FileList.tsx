import React from 'react';
import {
  Folder,
  Star,
  Trash2,
  Share2,
  Eye,
  Check,
  MoreHorizontal,
  Play,
  Sparkles
} from 'lucide-react';
import { FileItem, FolderItem } from '../types';
import { CategoryBadge, CategoryIcon } from './CategoryIcon';
import { formatBytes, formatDate } from '../data/initialData';

interface FileListProps {
  folders: FolderItem[];
  files: FileItem[];
  selectedIds: string[];
  activeFileId: string | null;
  onSelectFolder: (folderId: string) => void;
  onSelectFile: (file: FileItem, e: React.MouseEvent) => void;
  onToggleSelectId: (id: string, e: React.MouseEvent) => void;
  onToggleStarFile: (fileId: string, e: React.MouseEvent) => void;
  onToggleStarFolder: (folderId: string, e: React.MouseEvent) => void;
  onTrashFile: (fileId: string, e: React.MouseEvent) => void;
  onTrashFolder: (folderId: string, e: React.MouseEvent) => void;
  onPreviewFile: (file: FileItem, e: React.MouseEvent) => void;
  onShareFile: (file: FileItem, e: React.MouseEvent) => void;
  getFolderStats: (folderId: string) => { count: number; totalBytes: number };
  onLaunchApp?: (file: FileItem) => void;
}

export const FileList: React.FC<FileListProps> = ({
  folders,
  files,
  selectedIds,
  activeFileId,
  onSelectFolder,
  onSelectFile,
  onToggleSelectId,
  onToggleStarFile,
  onToggleStarFolder,
  onTrashFile,
  onTrashFolder,
  onPreviewFile,
  onShareFile,
  getFolderStats,
  onLaunchApp,
}) => {
  return (
    <div className="p-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4 w-10"></th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4 hidden md:table-cell">Category</th>
              <th className="py-3 px-4 hidden sm:table-cell">Size</th>
              <th className="py-3 px-4 hidden lg:table-cell">Last Modified</th>
              <th className="py-3 px-4 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {/* Render Folders First */}
            {folders.map((folder) => {
              const isSelected = selectedIds.includes(folder.id);
              const stats = getFolderStats(folder.id);

              return (
                <tr
                  key={folder.id}
                  onClick={() => onSelectFolder(folder.id)}
                  className={`group hover:bg-slate-850 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-950/30' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200 group-hover:text-white">
                        {folder.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell text-slate-400">Folder</td>
                  <td className="py-3 px-4 hidden sm:table-cell text-slate-400 font-mono">
                    {stats.count} items ({formatBytes(stats.totalBytes)})
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell text-slate-400 font-mono">
                    {formatDate(folder.updatedAt)}
                  </td>
                  <td className="py-3 px-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => onToggleStarFolder(folder.id, e)}
                        className={`p-1.5 rounded hover:bg-slate-800 ${
                          folder.starred ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${folder.starred ? 'fill-amber-400' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => onTrashFolder(folder.id, e)}
                        className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Render Files */}
            {files.map((file) => {
              const isSelected = selectedIds.includes(file.id);
              const isActive = activeFileId === file.id;

              const isHtml = file.isHtml5App || file.name.endsWith('.html') || file.name.endsWith('.htm') || file.mimeType === 'text/html';
              const isKexLinux = file.name === 'KEX_Linux_Terminal.html' || file.id === 'file-html5-kex-linux-terminal' || file.name.toLowerCase().includes('kex');
              const isOsFile = file.name === 'Open_Source_Operating_System.html' || file.id === 'file-html5-open-source-os' || isKexLinux;

              return (
                <tr
                  key={file.id}
                  onClick={(e) => onSelectFile(file, e)}
                  onDoubleClick={(e) => {
                    if (isHtml && onLaunchApp) {
                      onLaunchApp(file);
                    } else {
                      onPreviewFile(file, e);
                    }
                  }}
                  className={`group hover:bg-slate-850 cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-blue-950/40 border-l-2 border-l-blue-500'
                      : isSelected
                      ? 'bg-blue-950/20'
                      : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <button
                      onClick={(e) => onToggleSelectId(file.id, e)}
                      className={`p-1 rounded border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'border-slate-700 text-slate-600 opacity-0 group-hover:opacity-100 hover:text-white'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <CategoryIcon category={file.category} className="w-4 h-4 shrink-0" />
                      <div className="flex items-center gap-2 truncate max-w-xs">
                        <span className="font-medium text-slate-200 group-hover:text-white truncate">
                          {file.name}
                        </span>
                        {isKexLinux ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0 font-bold">
                            KEX LINUX
                          </span>
                        ) : isOsFile ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/40 shrink-0 font-bold">
                            BOOTABLE OS
                          </span>
                        ) : isHtml && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                            HTML5
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <CategoryBadge category={file.category} />
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell text-slate-400 font-mono">
                    {formatBytes(file.size)}
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell text-slate-400 font-mono">
                    {formatDate(file.updatedAt)}
                  </td>
                  <td className="py-3 px-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                      {isHtml && onLaunchApp && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onLaunchApp(file);
                          }}
                          className={`px-2.5 py-1 rounded text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm transition-colors cursor-pointer mr-1 ${
                            isKexLinux
                              ? 'bg-cyan-600 hover:bg-cyan-500 ring-1 ring-cyan-400/40'
                              : isOsFile
                              ? 'bg-blue-600 hover:bg-blue-500 ring-1 ring-blue-400/40'
                              : 'bg-emerald-600 hover:bg-emerald-500'
                          }`}
                          title={isKexLinux ? 'Boot KEX Linux Terminal' : isOsFile ? 'Boot Operating System' : 'Run HTML5 App'}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>{isKexLinux ? 'Boot KEX' : isOsFile ? 'Boot OS' : 'Run'}</span>
                        </button>
                      )}
                      <button
                        onClick={(e) => onPreviewFile(file, e)}
                        className="p-1.5 rounded text-slate-500 hover:text-blue-400 hover:bg-slate-800"
                        title="Preview File"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => onShareFile(file, e)}
                        className="p-1.5 rounded text-slate-500 hover:text-blue-400 hover:bg-slate-800"
                        title="Share"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => onToggleStarFile(file.id, e)}
                        className={`p-1.5 rounded hover:bg-slate-800 ${
                          file.starred ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'
                        }`}
                        title="Star"
                      >
                        <Star className={`w-3.5 h-3.5 ${file.starred ? 'fill-amber-400' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => onTrashFile(file.id, e)}
                        className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                        title="Trash"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {folders.length === 0 && files.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            No files or folders found in this space.
          </div>
        )}
      </div>
    </div>
  );
};
