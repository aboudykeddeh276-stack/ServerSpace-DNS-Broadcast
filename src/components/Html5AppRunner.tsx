import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  RotateCcw,
  Maximize2,
  Minimize2,
  Code,
  Terminal,
  Download,
  ExternalLink,
  Save,
  Check,
  AlertCircle,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Cloud,
  FileCode,
  Eye,
  Columns,
  Zap,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { FileItem } from '../types';
import { fetchDriveFileText, saveDriveFileText } from '../services/googleDriveApi';
import { OPEN_SOURCE_OS_HTML } from '../data/openSourceOsTemplate';
import { KEX_LINUX_TERMINAL_HTML } from '../data/kexLinuxTerminalTemplate';
import { KEX_MICROKERNEL_VFS_BOOTCHAIN_HTML } from '../data/kexBootchainTemplate';
import { KexMicrokernelVfsBootchain } from './KexMicrokernelVfsBootchain';
import { DomRigourSuite } from './DomRigourSuite';

interface ConsoleLog {
  id: string;
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
  time: string;
}

interface Html5AppRunnerProps {
  file: FileItem | null;
  isOpen?: boolean;
  onClose: () => void;
  isDriveMode?: boolean;
  onSaveCode?: (file: FileItem, newCode: string) => Promise<void> | void;
}

export const Html5AppRunner: React.FC<Html5AppRunnerProps> = ({
  file,
  isOpen = true,
  onClose,
  isDriveMode = false,
  onSaveCode,
}) => {
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<'run' | 'code' | 'split' | 'domtest'>('run');
  const [deviceFrame, setDeviceFrame] = useState<'responsive' | 'desktop' | 'tablet' | 'mobile'>('responsive');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [liveReload, setLiveReload] = useState(true);
  const [nativeBootchainMode, setNativeBootchainMode] = useState(false);

  const isBootchainFile = Boolean(
    file?.name === 'KEX_MICROKERNEL_VFS_BOOTCHAIN.html' ||
    file?.id === 'file-html5-kex-bootchain' ||
    file?.name?.toLowerCase().includes('bootchain')
  );

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load content when file changes
  useEffect(() => {
    if (!file || !isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);
    setConsoleLogs([]);
    setIsSaved(false);
    setSaveError(null);

    async function loadContent() {
      try {
        let content = '';

        // 1. Check if Open Source Operating System, KEX Bootchain, or KEX Linux Terminal
        if (
          file?.name === 'Open_Source_Operating_System.html' ||
          file?.id === 'file-html5-open-source-os'
        ) {
          content = file?.rawContent || OPEN_SOURCE_OS_HTML;
        } else if (
          file?.name === 'KEX_MICROKERNEL_VFS_BOOTCHAIN.html' ||
          file?.id === 'file-html5-kex-bootchain' ||
          file?.name?.toLowerCase().includes('bootchain')
        ) {
          content = file?.rawContent || KEX_MICROKERNEL_VFS_BOOTCHAIN_HTML;
        } else if (
          file?.name === 'KEX_Linux_Terminal.html' ||
          file?.id === 'file-html5-kex-linux-terminal' ||
          file?.name?.toLowerCase().includes('kex')
        ) {
          content = file?.rawContent || KEX_LINUX_TERMINAL_HTML;
        } else if (file?.rawContent) {
          content = file.rawContent;
        } else if (file?.isDriveFile) {
          try {
            content = await fetchDriveFileText(file.id);
          } catch (driveErr: any) {
            console.warn('Drive file fetch warning:', driveErr);
            setLoadError(driveErr.message || 'Unable to sync file text from Google Drive.');
            // Fallback to bootstrap template rather than blank
            content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${file?.name || 'HTML5 File'}</title>
  <style>
    body { background: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif; padding: 32px; text-align: center; }
    h2 { color: #38bdf8; }
    p { color: #94a3b8; max-width: 500px; margin: 12px auto; }
    .btn { background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
  </style>
</head>
<body>
  <h2>${file?.name || 'HTML5 Application'}</h2>
  <p>Live sandbox loaded. If this file was uploaded to Google Drive, connect your account or edit source code in the editor tab.</p>
  <button class="btn" onclick="alert('DOM Event captured in sandbox!')">Test DOM Event</button>
</body>
</html>`;
          }
        } else {
          content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${file?.name || 'HTML5 App'}</title>
  <style>
    body {
      background: #0f172a;
      color: #f8fafc;
      font-family: system-ui, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      text-align: center;
    }
    h1 { color: #38bdf8; margin-bottom: 8px; }
    p { color: #94a3b8; max-width: 480px; }
  </style>
</head>
<body>
  <h1>${file?.name || 'HTML5 Application'}</h1>
  <p>Ready to run your interactive web technology.</p>
</body>
</html>`;
        }

        if (isMounted) {
          setHtmlCode(content);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to load file content:', err);
          setLoadError(err.message || 'Failed to fetch content from storage');
          setIsLoading(false);
        }
      }
    }

    loadContent();

    return () => {
      isMounted = false;
    };
  }, [file, isOpen]);

  // Listen to postMessage from iframe for console logging
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.__runner_log) {
        const { type, message } = e.data.__runner_log;
        const now = new Date().toLocaleTimeString();
        setConsoleLogs((prev) => [
          ...prev.slice(-99),
          { id: Math.random().toString(), type, message: String(message), time: now },
        ]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Keyboard shortcut: Ctrl+S or Cmd+S to save, Ctrl+Enter to reload
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveToDrive();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleReload();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [htmlCode, file]);

  if (!isOpen || !file) return null;

  // Injected wrapper to intercept console.log and capture errors cleanly
  const injectTelemetry = (code: string) => {
    const telemetryScript = `
      <script>
        (function() {
          const originalLog = console.log;
          const originalWarn = console.warn;
          const originalError = console.error;
          const originalInfo = console.info;

          function send(type, args) {
            try {
              const message = Array.from(args).map(a => {
                if (typeof a === 'object') {
                  try { return JSON.stringify(a); } catch(e) { return String(a); }
                }
                return String(a);
              }).join(' ');
              window.parent.postMessage({ __runner_log: { type, message } }, '*');
            } catch(e) {}
          }

          console.log = function(...args) { originalLog.apply(console, args); send('log', args); };
          console.warn = function(...args) { originalWarn.apply(console, args); send('warn', args); };
          console.error = function(...args) { originalError.apply(console, args); send('error', args); };
          console.info = function(...args) { originalInfo.apply(console, args); send('info', args); };

          window.onerror = function(msg, url, line, col) {
            send('error', [msg + (line ? ' (Line ' + line + (col ? ':' + col : '') + ')' : '')]);
          };
          window.addEventListener('unhandledrejection', function(e) {
            send('error', ['Unhandled Promise Rejection: ' + (e.reason?.message || e.reason || 'Unknown error')]);
          });
        })();
      </script>
    `;

    if (code.includes('<head>')) {
      return code.replace('<head>', `<head>${telemetryScript}`);
    } else if (code.includes('<HEAD>')) {
      return code.replace('<HEAD>', `<HEAD>${telemetryScript}`);
    } else if (code.includes('<html>') || code.includes('<HTML>')) {
      return code.replace(/<html[^>]*>/i, `$&<head>${telemetryScript}</head>`);
    } else {
      return `<!DOCTYPE html><html><head><meta charset="utf-8">${telemetryScript}</head><body>${code}</body></html>`;
    }
  };

  const processedSrcDoc = injectTelemetry(htmlCode);

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = processedSrcDoc;
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          type: 'info',
          message: '--- Application Reloaded ---',
          time: new Date().toLocaleTimeString(),
        },
      ]);
    }
  };

  const handleSaveToDrive = async () => {
    if (!file) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      if (onSaveCode) {
        await onSaveCode(file, htmlCode);
      } else if (file.isDriveFile) {
        await saveDriveFileText(file.id, htmlCode, file.mimeType || 'text/html');
      } else {
        file.rawContent = htmlCode;
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      console.error('Failed to save to Google Drive:', err);
      setSaveError(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadFile = () => {
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.endsWith('.html') || file.name.endsWith('.htm') ? file.name : `${file.name}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenInNewTab = () => {
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const getFrameDimensions = () => {
    switch (deviceFrame) {
      case 'desktop':
        return 'w-[1024px] h-[640px] max-w-full max-h-full border-2 border-slate-700 shadow-2xl rounded-xl';
      case 'tablet':
        return 'w-[768px] h-[900px] max-w-full max-h-full border-2 border-slate-700 shadow-2xl rounded-xl';
      case 'mobile':
        return 'w-[375px] h-[667px] max-w-full max-h-full border-2 border-slate-700 shadow-2xl rounded-3xl';
      default:
        return 'w-full h-full';
    }
  };

  return (
    <div
      id="html5-app-runner-overlay"
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn"
    >
      <div
        ref={containerRef}
        id="html5-app-runner-container"
        className={`bg-slate-900 border border-slate-800 flex flex-col shadow-2xl overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? 'fixed inset-0 w-screen h-screen rounded-none z-50'
            : 'w-full max-w-6xl h-[90vh] rounded-2xl'
        }`}
      >
        {/* Top Control Bar */}
        <div className="h-14 px-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0 gap-3 select-none">
          {/* Left: App Info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white truncate">{file.name}</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-medium shrink-0">
                  HTML5 Runtime
                </span>
                {file.isDriveFile && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                    <Cloud className="w-2.5 h-2.5" />
                    <span>Google Drive</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Interactive web application executing live in sandboxed browser environment
              </p>
            </div>
          </div>

          {/* Center: Tabs & Device Switcher */}
          <div className="hidden md:flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewTab('run')}
              className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewTab === 'run'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Play className="w-3 h-3" />
              <span>Run Live</span>
            </button>
            <button
              onClick={() => setViewTab('domtest')}
              className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewTab === 'domtest'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>DOM Rigour Suite</span>
            </button>
            <button
              onClick={() => setViewTab('split')}
              className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewTab === 'split'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-3 h-3" />
              <span>Split View</span>
            </button>
            <button
              onClick={() => setViewTab('code')}
              className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewTab === 'code'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3 h-3" />
              <span>Source Code</span>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isBootchainFile && viewTab === 'run' && (
              <button
                onClick={() => setNativeBootchainMode(!nativeBootchainMode)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  nativeBootchainMode
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
                title="Toggle between Native React Bootchain Engine and Sandboxed HTML Membrane"
              >
                <Cpu className="w-3.5 h-3.5 text-sky-400" />
                <span>{nativeBootchainMode ? 'Native React Engine' : 'Sandboxed Membrane'}</span>
              </button>
            )}

            {(viewTab === 'run' || viewTab === 'split') && (
              <>
                {/* Device Frame selector (only in pure run mode) */}
                {viewTab === 'run' && (
                  <div className="hidden lg:flex items-center gap-0.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setDeviceFrame('responsive')}
                      className={`p-1.5 rounded text-xs cursor-pointer ${
                        deviceFrame === 'responsive'
                          ? 'bg-slate-800 text-blue-400'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Responsive Full"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeviceFrame('desktop')}
                      className={`p-1.5 rounded text-xs cursor-pointer ${
                        deviceFrame === 'desktop'
                          ? 'bg-slate-800 text-blue-400'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Desktop Frame (1024x640)"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeviceFrame('tablet')}
                      className={`p-1.5 rounded text-xs cursor-pointer ${
                        deviceFrame === 'tablet'
                          ? 'bg-slate-800 text-blue-400'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Tablet Frame (768x900)"
                    >
                      <Tablet className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeviceFrame('mobile')}
                      className={`p-1.5 rounded text-xs cursor-pointer ${
                        deviceFrame === 'mobile'
                          ? 'bg-slate-800 text-blue-400'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Mobile Frame (375x667)"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <button
                  onClick={handleReload}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Reload Application (Ctrl+Enter)"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}

            {(viewTab === 'code' || viewTab === 'split') && (
              <button
                onClick={handleSaveToDrive}
                disabled={isSaving}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                title="Save Changes (Ctrl+S)"
              >
                {isSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : isSaving ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{file.isDriveFile ? 'Save to Drive' : 'Apply Changes'}</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleDownloadFile}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Download HTML File"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsConsoleOpen(!isConsoleOpen)}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer relative ${
                isConsoleOpen
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Toggle Console Logs"
            >
              <Terminal className="w-4 h-4" />
              {consoleLogs.some((l) => l.type === 'error') && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-950" />
              )}
            </button>

            <button
              onClick={handleOpenInNewTab}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Open in new window"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              title="Close Runner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {(loadError || saveError) && (
          <div className="p-3 bg-rose-500/15 border-b border-rose-500/30 text-rose-300 text-xs flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{loadError || saveError}</span>
            </div>
            {loadError && (
              <button
                onClick={() => setHtmlCode(htmlCode)}
                className="px-2 py-0.5 bg-rose-600 text-white rounded text-[11px] font-medium"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* Main Stage Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-950 relative overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono">Loading HTML5 technology into execution sandbox...</p>
            </div>
          ) : viewTab === 'domtest' ? (
            <DomRigourSuite currentHtmlCode={htmlCode} iframeRef={iframeRef} />
          ) : viewTab === 'run' ? (
            isBootchainFile && nativeBootchainMode ? (
              <div className="flex-1 p-2 sm:p-4 bg-slate-950 overflow-y-auto">
                <KexMicrokernelVfsBootchain />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-2 sm:p-4 bg-slate-950 overflow-auto">
                <iframe
                  ref={iframeRef}
                  title={file.name}
                  srcDoc={processedSrcDoc}
                  allow="autoplay; fullscreen; camera; microphone; midi; encrypted-media; clipboard-read; clipboard-write; display-capture; geolocation"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-pointer-lock allow-downloads"
                  className={`bg-white transition-all duration-200 ${getFrameDimensions()}`}
                />
              </div>
            )
          ) : viewTab === 'split' ? (
            <div className="flex-1 flex flex-col md:flex-row min-h-0">
              {/* Left: Code Editor */}
              <div className="w-full md:w-1/2 flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-slate-800 p-3">
                <div className="flex items-center justify-between pb-2 text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-2">
                    <Code className="w-3.5 h-3.5 text-blue-400" />
                    <span>Source Editor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{htmlCode.length} chars</span>
                    <button
                      onClick={handleReload}
                      className="px-2 py-0.5 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>Update Live</span>
                    </button>
                  </div>
                </div>
                <textarea
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 focus:border-blue-500 outline-none resize-none leading-relaxed"
                  spellCheck={false}
                />
              </div>

              {/* Right: Live Runner Preview */}
              <div className="w-full md:w-1/2 flex flex-col min-h-0 bg-slate-950 p-2">
                <div className="flex items-center justify-between pb-2 px-1 text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Play className="w-3 h-3 text-emerald-400" />
                    <span>Live Output</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40">
                    Executing
                  </span>
                </div>
                <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-800 bg-white">
                  <iframe
                    ref={iframeRef}
                    title={file.name}
                    srcDoc={processedSrcDoc}
                    allow="autoplay; fullscreen; camera; microphone; midi; encrypted-media; clipboard-read; clipboard-write; display-capture; geolocation"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-pointer-lock allow-downloads"
                    className="w-full h-full border-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 p-4">
              <div className="flex items-center justify-between pb-2 text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <span>Edit HTML5 / CSS / JavaScript:</span>
                  <span className="text-slate-500 font-normal">(Press Ctrl+S to save, Ctrl+Enter to re-run)</span>
                </div>
                <span>{htmlCode.length} characters</span>
              </div>
              <textarea
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 focus:border-blue-500 outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>
          )}

          {/* Collapsible Console Drawer */}
          {isConsoleOpen && (
            <div className="h-44 bg-slate-900/95 border-t border-slate-800 flex flex-col shrink-0 font-mono text-xs">
              <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-semibold text-slate-200">Runtime Console Output</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                    {consoleLogs.length} events
                  </span>
                </div>
                <button
                  onClick={() => setConsoleLogs([])}
                  className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Clear Console
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1 select-text">
                {consoleLogs.length === 0 ? (
                  <p className="text-slate-500 italic text-[11px]">
                    No console output captured yet. Interaction events and errors will log here.
                  </p>
                ) : (
                  consoleLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`text-[11px] flex items-start gap-2 ${
                        log.type === 'error'
                          ? 'text-rose-400 bg-rose-500/10 p-1 rounded'
                          : log.type === 'warn'
                          ? 'text-amber-400'
                          : log.type === 'info'
                          ? 'text-cyan-400 font-semibold'
                          : 'text-slate-300'
                      }`}
                    >
                      <span className="text-slate-600 shrink-0">{log.time}</span>
                      <span className="font-bold shrink-0 uppercase text-[9px] px-1 py-0.2 rounded bg-slate-800">
                        {log.type}
                      </span>
                      <span className="break-all">{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
