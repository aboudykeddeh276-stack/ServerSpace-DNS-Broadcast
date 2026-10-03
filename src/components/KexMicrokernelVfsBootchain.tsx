import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Cpu,
  Layers,
  FileCode,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Zap,
  FolderTree,
  FileText,
  Activity
} from 'lucide-react';
import { sha256Hex } from '../services/brainkCognitiveSubstrate';

export interface KexMicrokernelVfsBootchainProps {
  onClose?: () => void;
  className?: string;
}

// ----------------------------------------------------------------------------
// 1. PRELOADED VFS IMAGE (The Immutable Disk Blueprint)
// ----------------------------------------------------------------------------
export const PRELOADED_VFS_IMAGE: Record<string, string> = {
  '/boot/kexboot.json': JSON.stringify(
    {
      schema: 'kexboot/v1',
      authority: 'A.KEDDEH',
      kernel_entry: '/kernel/microkernel.kex',
      init_entry: '/micro-os/init.kex',
      assembly_spec: '/build/terminal/spec.json',
      required_manifest: [
        '/boot/kexboot.json',
        '/kernel/microkernel.kex',
        '/micro-os/init.kex',
        '/micro-os/services.json',
        '/build/terminal/spec.json'
      ],
      hash_algorithm: 'SHA-256',
      zero_policy: 'strictly non-zero weighted live state'
    },
    null,
    2
  ),

  '/kernel/microkernel.kex': [
    '# KEX MICROKERNEL RING-0 DIRECTIVE',
    'ARCH: x86_64-wasm',
    'AUTHORITY: A.KEDDEH',
    'PAGE_SIZE: 4096',
    'MEM_MAPPING: [0x00000000 -> 0x00400000]',
    'VFS_ROOT_INODE: 2',
    'PROCESS_CAPACITY: 128',
    'INIT_EXEC_ENTRY: /micro-os/init.kex',
    'STATUS: RING-0 VERIFIED'
  ].join('\n'),

  '/micro-os/init.kex': [
    '#!/bin/kex-sh',
    '# KEX MICRO-OS INIT DAEMON (PID 1)',
    'mount -t vfs /dev/vfs0 /',
    'load-services /micro-os/services.json',
    'verify-lineage --authority A.KEDDEH',
    'assemble-terminal --spec /build/terminal/spec.json --out /run/terminal.vnext.html',
    'exec /run/terminal.vnext.html'
  ].join('\n'),

  '/micro-os/services.json': JSON.stringify(
    {
      services: [
        { id: 'kex-volume-mnt', name: 'KEX Volume Storage Engine', state: 'STARTING', pid: 2, port: 8420 },
        { id: 'braink-ai-mesh', name: 'Braink AI Neural Bus', state: 'STARTING', pid: 3, port: 9001 },
        { id: 'proof-ledgerd', name: 'SHA-256 Lineage Ledger', state: 'STARTING', pid: 4, port: 8080 },
        { id: 'terminal-assembler', name: 'VNext Terminal Compiler', state: 'RUNNING', pid: 5, port: 3000 }
      ]
    },
    null,
    2
  ),

  '/build/terminal/spec.json': JSON.stringify(
    {
      spec_version: 'terminal.vnext.2026',
      authority: 'A.KEDDEH',
      title: 'KEX Linux Workstation vNext',
      theme: 'cyber-cyan',
      features: [
        'VFS Inode Explorer',
        'Process Scheduler Reflection',
        'Interactive Shell Execution',
        'Microkernel Proof Verification'
      ],
      default_prompt: 'ak@kex-linux:~$'
    },
    null,
    2
  ),

  '/etc/os-release': [
    'NAME="KEX Linux Microkernel"',
    'VERSION="6.0.297-bootchain"',
    'ID=kex-linux',
    'AUTHORITY="A.KEDDEH"',
    'PRETTY_NAME="KEX Linux 6.0 (Assembled by Microkernel)"'
  ].join('\n'),

  '/etc/hostname': 'kex-microkernel\n',

  '/kex-volume/proof/SEED_HASH.txt': '3807f83f9af105b87a40f7532ba961ad7826dd82b3d59fd518b0e679624fee8d\n'
};

export type BootStage = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface LogEntry {
  id: string;
  time: string;
  text: string;
  type: 'info' | 'success' | 'warn' | 'error' | 'cmd' | 'header';
}

interface ServiceItem {
  id: string;
  name: string;
  state: string;
  pid: number;
  port?: number;
}

export function KexMicrokernelVfsBootchain({ onClose, className = '' }: KexMicrokernelVfsBootchainProps) {
  // Bootchain state tracking
  const [stage, setStage] = useState<BootStage>(0);
  const [isBooting, setIsBooting] = useState(false);
  const [t0Input, setT0Input] = useState('');
  const [t0Logs, setT0Logs] = useState<LogEntry[]>([]);
  const [vfs, setVfs] = useState<Record<string, string>>(PRELOADED_VFS_IMAGE);
  const [selectedFile, setSelectedFile] = useState<string>('/boot/kexboot.json');
  const [verifiedHashes, setVerifiedHashes] = useState<Record<string, string>>({});
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [assembledHtml, setAssembledHtml] = useState<string | null>(null);

  // Terminal_1 interactive state (post-assembly)
  const [t1Input, setT1Input] = useState('');
  const [t1Logs, setT1Logs] = useState<Array<{ text: string; color?: string }>>([]);

  const t0BottomRef = useRef<HTMLDivElement>(null);
  const t1BottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    t0BottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [t0Logs]);

  useEffect(() => {
    t1BottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [t1Logs]);

  // Initial prompt banner for TERMINAL_0
  useEffect(() => {
    resetBootchain();
  }, []);

  const addT0Log = (text: string, type: LogEntry['type'] = 'info') => {
    setT0Logs((prev) => {
      const entry: LogEntry = {
        id: `log_${Date.now()}_${prev.length + 1}`,
        time: new Date().toLocaleTimeString(),
        text,
        type
      };
      return [...prev, entry];
    });
  };

  const computeHash = async (content: string): Promise<string> => {
    try {
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const enc = new TextEncoder().encode(content);
        const buf = await crypto.subtle.digest('SHA-256', enc);
        return Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
      }
      return sha256Hex(content);
    } catch {
      return sha256Hex(content);
    }
  };

  const resetBootchain = () => {
    setStage(0);
    setIsBooting(false);
    setVfs(PRELOADED_VFS_IMAGE);
    setSelectedFile('/boot/kexboot.json');
    setVerifiedHashes({});
    setServices([]);
    setAssembledHtml(null);
    setT1Logs([]);

    setT0Logs([
      {
        id: 'init-1',
        time: new Date().toLocaleTimeString(),
        text: '=== KEX BOOTSTRAP CARRIER · TERMINAL_0 ===',
        type: 'header'
      },
      {
        id: 'init-2',
        time: new Date().toLocaleTimeString(),
        text: 'Authority: A. KEDDEH // BRAINK AI',
        type: 'info'
      },
      {
        id: 'init-3',
        time: new Date().toLocaleTimeString(),
        text: `VFS Preloaded: ${Object.keys(PRELOADED_VFS_IMAGE).length} immutable inodes present in carrier image.`,
        type: 'info'
      },
      {
        id: 'init-4',
        time: new Date().toLocaleTimeString(),
        text: "Terminal_0 only accepts bootstrap directives. Type 'boot' to commence bootchain, or 'vfs inspect'.\n",
        type: 'warn'
      }
    ]);
  };

  // ----------------------------------------------------------------------------
  // THE BOOTCHAIN ORCHESTRATOR
  // ----------------------------------------------------------------------------
  const runBootchainSequence = async () => {
    if (isBooting) return;
    setIsBooting(true);

    addT0Log('>>> INITIATING BOOTCHAIN PIPELINE...', 'cmd');

    // Step 1: Preload VFS
    setStage(1);
    addT0Log('[1/6] Mounting preloaded VFS image table into memory...');
    await new Promise((r) => setTimeout(r, 280));
    setVfs({ ...PRELOADED_VFS_IMAGE });
    addT0Log(`      -> Mounted ${Object.keys(PRELOADED_VFS_IMAGE).length} system inodes (/boot, /kernel, /micro-os, /build, /etc).`, 'success');

    // Step 2: Bootloader reads /boot/kexboot.json
    setStage(2);
    addT0Log('[2/6] Bootloader parsing /boot/kexboot.json descriptor...');
    await new Promise((r) => setTimeout(r, 320));

    const kexbootRaw = PRELOADED_VFS_IMAGE['/boot/kexboot.json'];
    if (!kexbootRaw) {
      addT0Log('[FATAL] Missing /boot/kexboot.json in VFS image!', 'error');
      setIsBooting(false);
      return;
    }
    const bootConfig = JSON.parse(kexbootRaw);
    addT0Log(`      -> Authority: ${bootConfig.authority}`, 'info');
    addT0Log(`      -> Kernel entry: ${bootConfig.kernel_entry}`, 'info');
    addT0Log(`      -> Init entry:   ${bootConfig.init_entry}`, 'info');

    // Step 3: Microkernel Validation & Ring-0 Mount
    setStage(3);
    addT0Log('[3/6] Microkernel booting: Verifying cryptographic manifest hashes...');
    await new Promise((r) => setTimeout(r, 380));

    const hashes: Record<string, string> = {};
    for (const filePath of bootConfig.required_manifest) {
      const content = PRELOADED_VFS_IMAGE[filePath];
      if (!content) {
        addT0Log(`[FATAL] Manifest inode ${filePath} not found!`, 'error');
        setIsBooting(false);
        return;
      }
      const hash = await computeHash(content);
      hashes[filePath] = hash;
      addT0Log(`      -> Verified ${filePath.padEnd(26)} [SHA256: ${hash.slice(0, 10)}...]`, 'success');
    }
    setVerifiedHashes(hashes);
    addT0Log('      -> Ring-0 microkernel memory boundaries locked [0x00000000 -> 0x00400000].', 'info');

    // Step 4: Micro-OS Service Activation
    setStage(4);
    addT0Log('[4/6] Micro-OS spawning init daemon (PID 1) and core daemons...');
    await new Promise((r) => setTimeout(r, 380));

    const servicesRaw = PRELOADED_VFS_IMAGE['/micro-os/services.json'];
    const serviceList: ServiceItem[] = JSON.parse(servicesRaw).services.map((s: any) => ({
      ...s,
      state: 'RUNNING'
    }));
    setServices(serviceList);

    for (const s of serviceList) {
      addT0Log(`      -> [PID ${s.pid}] ${s.name.padEnd(30)} [ONLINE]`, 'success');
    }

    // Step 5: Assembler builds terminal.vnext
    setStage(5);
    addT0Log('[5/6] Assembler generating production TERMINAL_1 from /build/terminal/spec.json...');
    await new Promise((r) => setTimeout(r, 450));

    const spec = JSON.parse(PRELOADED_VFS_IMAGE['/build/terminal/spec.json']);
    const assembled = [
      `<!-- KEX LINUX WORKSTATION vNEXT (TERMINAL_1) -->`,
      `<!-- Generated by Micro-OS Assembler from ${spec.spec_version} -->`,
      `Authority: ${spec.authority}`,
      `Title: ${spec.title}`,
      `Mounted Inodes: ${Object.keys(PRELOADED_VFS_IMAGE).length}`,
      `Active Daemons: ${serviceList.length}`
    ].join('\n');

    setAssembledHtml(assembled);

    // Save assembled terminal artifact into VFS at /run/terminal.vnext.html
    setVfs((prev) => ({
      ...prev,
      '/run/terminal.vnext.html': assembled
    }));
    addT0Log('      -> Successfully assembled /run/terminal.vnext.html', 'success');

    // Step 6: Spawn Terminal_1 in controlled runtime membrane
    setStage(6);
    addT0Log('[6/6] Controlled membrane transition: Activating TERMINAL_1 runtime!', 'success');
    setIsBooting(false);

    // Seed Terminal_1 logs
    setT1Logs([
      { text: '=== KEX LINUX WORKSTATION vNEXT (TERMINAL_1) ===', color: 'text-cyan-400 font-bold' },
      { text: 'Booted from /kernel/microkernel.kex & /micro-os/init.kex', color: 'text-emerald-400' },
      { text: `Authority: ${spec.authority} · Ring-3 Application Container`, color: 'text-slate-400' },
      { text: "Type 'help', 'ls', 'cat <file>', 'ps', 'uname -a', or 'services'.\n", color: 'text-amber-400' }
    ]);
  };

  // ----------------------------------------------------------------------------
  // TERMINAL_0 COMMAND EVALUATOR (Bootstrap Carrier)
  // ----------------------------------------------------------------------------
  const handleT0Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = t0Input.trim();
    if (!cmd) return;
    setT0Input('');

    addT0Log(`kex-bootldr# ${cmd}`, 'cmd');
    const [action, ...args] = cmd.split(/\s+/);

    switch (action.toLowerCase()) {
      case 'boot':
        runBootchainSequence();
        break;

      case 'vfs':
        if (args[0] === 'inspect' || !args[0]) {
          addT0Log('Preloaded VFS Inode Manifest:');
          Object.keys(vfs).forEach((path) => {
            const bytes = vfs[path].length;
            addT0Log(`  ${path.padEnd(36)} (${bytes} bytes)`);
          });
        } else {
          addT0Log("usage: vfs inspect", 'warn');
        }
        break;

      case 'cat':
        if (!args[0]) {
          addT0Log("usage: cat <path>", 'warn');
          break;
        }
        const targetPath = args[0].startsWith('/') ? args[0] : '/' + args[0];
        if (vfs[targetPath]) {
          addT0Log(`--- INODE: ${targetPath} ---`, 'info');
          addT0Log(vfs[targetPath]);
          setSelectedFile(targetPath);
        } else {
          addT0Log(`cat: ${args[0]}: Inode not found in VFS image`, 'error');
        }
        break;

      case 'status':
        addT0Log(`Current Stage: ${stage} / 6`);
        addT0Log(`VFS Inodes: ${Object.keys(vfs).length}`);
        addT0Log(`Services: ${services.length} active`);
        break;

      case 'help':
        addT0Log('TERMINAL_0 Bootstrap Directives:');
        addT0Log('  boot           Execute complete bootchain (/boot/kexboot.json -> Assembler)');
        addT0Log('  vfs inspect    Enumerate preloaded VFS disk image');
        addT0Log('  cat <path>     Inspect raw file contents in preloaded VFS');
        addT0Log('  status         Report bootchain stage and kernel boundaries');
        addT0Log('  reset          Reinitialize carrier to Stage 0');
        break;

      case 'reset':
      case 'reboot':
        resetBootchain();
        break;

      default:
        addT0Log(`bootldr: unknown directive '${action}'. Type 'boot' or 'help'.`, 'error');
    }
  };

  // ----------------------------------------------------------------------------
  // TERMINAL_1 COMMAND EVALUATOR (Assembled Workstation)
  // ----------------------------------------------------------------------------
  const handleT1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const line = t1Input.trim();
    if (!line) return;
    setT1Input('');

    setT1Logs((prev) => [...prev, { text: `ak@kex-linux:~$ ${line}`, color: 'text-slate-300' }]);

    const [c, ...args] = line.split(/\s+/);
    switch (c.toLowerCase()) {
      case 'help':
        setT1Logs((prev) => [
          ...prev,
          { text: 'TERMINAL_1 Assembled Workstation Commands:', color: 'text-cyan-400' },
          { text: '  ls [path]      List files in mounted VFS' },
          { text: '  cat <file>     Display contents of file' },
          { text: '  ps             List processes spawned by Micro-OS' },
          { text: '  services       Inspect active microkernel background daemons' },
          { text: '  uname -a       Show microkernel release and architecture' },
          { text: '  clear          Clear workstation screen' }
        ]);
        break;

      case 'ls': {
        const dir = args[0] || '/';
        const matches = Object.keys(vfs).filter((k) => k.startsWith(dir === '/' ? '/' : dir));
        if (!matches.length) {
          setT1Logs((prev) => [...prev, { text: `ls: cannot access '${dir}': No such file`, color: 'text-rose-400' }]);
        } else {
          setT1Logs((prev) => [...prev, { text: matches.join('   '), color: 'text-cyan-300' }]);
        }
        break;
      }

      case 'cat': {
        if (!args[0]) {
          setT1Logs((prev) => [...prev, { text: 'usage: cat <file>', color: 'text-amber-400' }]);
          break;
        }
        const p = args[0].startsWith('/') ? args[0] : '/' + args[0];
        if (vfs[p]) {
          setT1Logs((prev) => [...prev, { text: vfs[p], color: 'text-slate-200' }]);
          setSelectedFile(p);
        } else {
          setT1Logs((prev) => [...prev, { text: `cat: ${args[0]}: No such file or directory`, color: 'text-rose-400' }]);
        }
        break;
      }

      case 'ps':
        setT1Logs((prev) => [
          ...prev,
          { text: 'UID   PID  PPID  C STIME TTY      TIME CMD', color: 'text-slate-400 font-bold' },
          { text: 'root    1     0  0 12:00 ?    00:00:01 /micro-os/init.kex', color: 'text-emerald-400' },
          ...services.map((s) => ({
            text: `root  ${String(s.pid).padStart(3)}     1  0 12:00 ?    00:00:00 ${s.name}`,
            color: 'text-slate-200'
          })),
          { text: 'ak    104     1  0 12:00 pts/00:00:00 /bin/bash (terminal.vnext)', color: 'text-cyan-400' }
        ]);
        break;

      case 'services':
        setT1Logs((prev) => [
          ...prev,
          { text: 'UNIT                    LOAD   ACTIVE   SUB     DESCRIPTION', color: 'text-slate-400 font-bold' },
          ...services.map((s) => ({
            text: `${(s.id + '.service').padEnd(23)} loaded active   running ${s.name} (PID ${s.pid})`,
            color: 'text-emerald-400'
          }))
        ]);
        break;

      case 'uname':
        setT1Logs((prev) => [
          ...prev,
          {
            text: 'Linux kex-linux 6.0.297-bootchain #1 SMP PREEMPT 2026 x86_64-wasm GNU/Linux (Authority: A. Keddeh)',
            color: 'text-emerald-300'
          }
        ]);
        break;

      case 'clear':
        setT1Logs([]);
        break;

      default:
        setT1Logs((prev) => [...prev, { text: `bash: ${c}: command not found. Type 'help'.`, color: 'text-rose-400' }]);
    }
  };

  const PIPELINE_STEPS = [
    { id: 0, title: '1. TERMINAL_0', desc: 'Bootstrap Carrier' },
    { id: 1, title: '2. PRELOAD_VFS', desc: 'Image Validation' },
    { id: 2, title: '3. BOOTLOADER', desc: '/boot/kexboot.json' },
    { id: 3, title: '4. MICROKERNEL', desc: 'Ring-0 VFS Mount' },
    { id: 4, title: '5. MICRO-OS', desc: 'Init & Daemons' },
    { id: 5, title: '6. ASSEMBLER', desc: 'Spec → Terminal vNext' },
    { id: 6, title: '7. TERMINAL_1', desc: 'Running Workstation' }
  ];

  return (
    <div className={`w-full flex flex-col bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden ${className}`}>
      {/* Top Banner */}
      <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-lg text-sky-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-sm font-bold tracking-wide text-white">KEX MICROKERNEL VFS BOOTCHAIN</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                A. KEDDEH // BRAINK AI
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Deterministic bootloader chain: Preloaded VFS → Microkernel → Micro-OS → Assembler → Terminal vNext
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border ${
              stage === 6
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : stage > 0
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                stage === 6 ? 'bg-emerald-400 animate-pulse' : stage > 0 ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span>
              {stage === 0
                ? 'STAGE 0: BOOTSTRAP TERMINAL'
                : stage === 6
                ? 'STAGE 6: TERMINAL_1 ASSEMBLED'
                : `BOOTING STAGE ${stage}/6`}
            </span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Close"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      {/* 7-Step Bootchain Pipeline Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 px-6 py-3 bg-slate-900/50 border-b border-slate-800 text-xs font-mono">
        {PIPELINE_STEPS.map((step) => {
          const isComplete = stage > step.id;
          const isActive = stage === step.id;
          return (
            <div
              key={step.id}
              className={`p-2.5 rounded-lg border transition ${
                isActive
                  ? 'border-amber-400/60 bg-amber-500/10 text-amber-300 shadow-sm'
                  : isComplete
                  ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400'
                  : 'border-slate-800 bg-slate-900/30 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">{step.title}</span>
                {isComplete ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : isActive ? (
                  <Activity className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                ) : null}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">{step.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Main Workspace: Left = Terminal Active Stage, Right = Preloaded VFS Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 flex-1 min-h-[560px]">
        {/* Left Column: Active Terminal (Terminal_0 OR Terminal_1) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {stage < 6 ? (
            /* ========================================================= */
            /* STAGE 0-5: TERMINAL_0 BOOTSTRAP CARRIER                   */
            /* ========================================================= */
            <div className="flex-1 flex flex-col bg-black/90 border border-slate-800 rounded-xl p-4 font-mono text-xs">
              {/* Carrier Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3 text-slate-400">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span className="text-white font-semibold">TERMINAL_0</span>
                  <span className="text-slate-500">[Bootstrap Carrier Shell]</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => runBootchainSequence()}
                    disabled={isBooting}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 disabled:opacity-50 transition"
                  >
                    <Play className="w-3 h-3" />
                    <span>boot</span>
                  </button>
                  <button
                    onClick={() => {
                      setT0Input('vfs inspect');
                      addT0Log('kex-bootldr# vfs inspect', 'cmd');
                      addT0Log('Preloaded VFS Inode Manifest:');
                      Object.keys(vfs).forEach((p) => addT0Log(`  ${p}`));
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition"
                  >
                    inspect
                  </button>
                  <button
                    onClick={resetBootchain}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 transition"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>reset</span>
                  </button>
                </div>
              </div>

              {/* Log Output Area */}
              <div className="flex-1 overflow-y-auto max-h-[460px] space-y-1.5 pr-2">
                {t0Logs.map((log) => (
                  <div
                    key={log.id}
                    className={`leading-relaxed ${
                      log.type === 'header'
                        ? 'text-sky-400 font-bold border-b border-sky-500/20 pb-1'
                        : log.type === 'cmd'
                        ? 'text-amber-300 font-semibold'
                        : log.type === 'success'
                        ? 'text-emerald-400'
                        : log.type === 'warn'
                        ? 'text-amber-400'
                        : log.type === 'error'
                        ? 'text-rose-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {log.text}
                  </div>
                ))}
                <div ref={t0BottomRef} />
              </div>

              {/* Terminal_0 Input Line */}
              <form onSubmit={handleT0Submit} className="flex items-center gap-2 pt-3 border-t border-slate-800/80 mt-3">
                <span className="text-amber-400 font-bold whitespace-nowrap">kex-bootldr#</span>
                <input
                  type="text"
                  value={t0Input}
                  onChange={(e) => setT0Input(e.target.value)}
                  disabled={isBooting}
                  placeholder="type 'boot' to trigger bootchain, 'vfs inspect', or 'help'..."
                  className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder-slate-600"
                />
              </form>
            </div>
          ) : (
            /* ========================================================= */
            /* STAGE 6: TERMINAL_1 ASSEMBLED WORKSTATION (Runtime)       */
            /* ========================================================= */
            <div className="flex-1 flex flex-col bg-black/95 border border-emerald-500/40 rounded-xl p-4 font-mono text-xs shadow-2xl">
              {/* Assembled Header */}
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 mb-3 text-slate-400">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-white font-bold">TERMINAL_1</span>
                  <span className="text-emerald-400">[Workstation vNext · Ring-3 Container]</span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-slate-400">Authority: A. KEDDEH</span>
                  <button
                    onClick={resetBootchain}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reboot Carrier</span>
                  </button>
                </div>
              </div>

              {/* Workstation Output Area */}
              <div className="flex-1 overflow-y-auto max-h-[460px] space-y-1 pr-2">
                {t1Logs.map((log, idx) => (
                  <div key={idx} className={log.color || 'text-slate-200'}>
                    {log.text}
                  </div>
                ))}
                <div ref={t1BottomRef} />
              </div>

              {/* Terminal_1 Input Line */}
              <form onSubmit={handleT1Submit} className="flex items-center gap-2 pt-3 border-t border-slate-800 mt-3">
                <span className="text-emerald-400 font-bold whitespace-nowrap">ak@kex-linux:~$</span>
                <input
                  type="text"
                  value={t1Input}
                  onChange={(e) => setT1Input(e.target.value)}
                  placeholder="type 'help', 'ls', 'cat <file>', 'ps', 'uname -a'..."
                  className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder-slate-600"
                />
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Preloaded VFS & Inode Inspector */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <FolderTree className="w-4 h-4" />
                <span>PRELOADED VFS INODES</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {Object.keys(vfs).length} FILES
              </span>
            </div>

            {/* Tree File List */}
            <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
              {Object.keys(vfs).map((path) => {
                const isSelected = selectedFile === path;
                const isVerified = verifiedHashes[path];
                return (
                  <button
                    key={path}
                    onClick={() => setSelectedFile(path)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition ${
                      isSelected
                        ? 'bg-sky-500/20 text-sky-200 border border-sky-500/30'
                        : 'hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{path}</span>
                    </div>
                    {isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Inode Content Viewer */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                <span className="font-semibold text-slate-300">INSPECTED INODE</span>
                <span className="text-sky-400 truncate max-w-[180px]">{selectedFile}</span>
              </div>
              <div className="bg-black/70 border border-slate-800/80 rounded-lg p-3 text-[11px] text-slate-300 max-h-[200px] overflow-y-auto whitespace-pre font-mono">
                {vfs[selectedFile] || '[empty or not found]'}
              </div>
            </div>

            {/* Microkernel Ring-0 Memory & SHA Status */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Kernel Authority:</span>
                <span className="text-white font-bold">A. KEDDEH</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Ring-0 Memory:</span>
                <span className="text-sky-400">0x00000000 - 0x00400000</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Init Daemon:</span>
                <span className="text-emerald-400">/micro-os/init.kex (PID 1)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
