import React, { useState, useEffect, useRef } from 'react';
import {
  Server,
  Cpu,
  Activity,
  Terminal as TerminalIcon,
  HardDrive,
  Play,
  Square,
  RotateCw,
  Pause,
  ShieldCheck,
  Layers,
  Globe,
  Radio,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Download,
  Upload,
  Network,
  Cloud,
  Database,
  Sparkles,
  Zap,
  Info,
  Clock,
  Eye,
  RefreshCw,
  Search,
  Check,
  Compass,
  Monitor,
  Brain,
  HelpCircle
} from 'lucide-react';
import {
  ServerNode,
  ServerDaemon,
  ServerSnapshot,
  VirtualPortRule,
  FileItem,
  OperatingSystemCatalogItem,
  VirtualHardwareSpec
} from '../types';
import {
  INITIAL_SERVER_NODES,
  INITIAL_SERVER_DAEMONS,
  INITIAL_PORT_RULES,
  INITIAL_SNAPSHOTS,
  OS_CATALOG,
  DEFAULT_VIRTUAL_HARDWARE,
  formatUptime
} from '../data/serverspaceData';
import { OsInstallationStudio } from './server/OsInstallationStudio';
import { VirtualDesktopEnvironment } from './server/VirtualDesktopEnvironment';
import { ServerRackAiSuite } from './server/ServerRackAiSuite';
import { BrainkVirtualBrain } from './server/BrainkVirtualBrain';
import { HumanCentricTour } from './server/HumanCentricTour';

interface VirtualCloudServerProps {
  files: FileItem[];
  onLaunchApp: (file: FileItem) => void;
  onBootKexLinux?: () => void;
  onBootOs?: () => void;
  isDriveConnected?: boolean;
  initialSubTab?: 'nodes' | 'os-studio' | 'desktop' | 'rack-ai' | 'braink' | 'terminal' | 'services' | 'ports' | 'mounts' | 'snapshots';
}

export const VirtualCloudServer: React.FC<VirtualCloudServerProps> = ({
  files,
  onLaunchApp,
  onBootKexLinux,
  onBootOs,
  isDriveConnected = false,
  initialSubTab,
}) => {
  // State for server nodes
  const [nodes, setNodes] = useState<ServerNode[]>(() => {
    const saved = localStorage.getItem('serverspace_nodes');
    return saved ? JSON.parse(saved) : INITIAL_SERVER_NODES;
  });

  // State for daemons
  const [daemons, setDaemons] = useState<ServerDaemon[]>(() => {
    const saved = localStorage.getItem('serverspace_daemons');
    return saved ? JSON.parse(saved) : INITIAL_SERVER_DAEMONS;
  });

  // State for snapshots
  const [snapshots, setSnapshots] = useState<ServerSnapshot[]>(() => {
    const saved = localStorage.getItem('serverspace_snapshots');
    return saved ? JSON.parse(saved) : INITIAL_SNAPSHOTS;
  });

  // State for port rules
  const [portRules, setPortRules] = useState<VirtualPortRule[]>(INITIAL_PORT_RULES);

  // Active view tab inside Virtual Cloud Server
  const [activeSubTab, setActiveSubTab] = useState<
    'nodes' | 'os-studio' | 'desktop' | 'rack-ai' | 'braink' | 'terminal' | 'services' | 'ports' | 'mounts' | 'snapshots'
  >(initialSubTab || 'nodes');

  // Synchronize when initialSubTab changes from external caller (e.g. Sidebar Braink Console)
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('srv-kex-master');

  // OS & Hardware Spec state for natural installation and desktop environments
  const [activeOs, setActiveOs] = useState<OperatingSystemCatalogItem>(OS_CATALOG[0]);
  const [hardwareSpec, setHardwareSpec] = useState<VirtualHardwareSpec>(DEFAULT_VIRTUAL_HARDWARE);

  // Human-Centric Tour & Manual State
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourTopicId, setTourTopicId] = useState<string | null>(null);

  // Terminal state
  const [terminalHistory, setTerminalHistory] = useState<Array<{ text: string; type: 'cmd' | 'output' | 'error' | 'success' }>>([
    { text: 'SERVERspace Virtual Cloud Infrastructure [Version 6.8.4-vfs]', type: 'output' },
    { text: 'Architecture: A. Keddeh Microkernel & Distributed VFS Cloud', type: 'output' },
    { text: 'Cluster Node: srv-kex-master-01 (10.240.0.10) [ONLINE]', type: 'success' },
    { text: 'Type "help" for a list of available cloud commands, or "top" / "df -h" / "systemctl status".', type: 'output' },
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdHistoryIdx, setCmdHistoryIdx] = useState<number>(-1);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Provisioning Modal State
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [newServerName, setNewServerName] = useState('');
  const [newServerOs, setNewServerOs] = useState('KEX Linux 6.8 (A. Keddeh)');
  const [newServerVcpu, setNewServerVcpu] = useState(4);
  const [newServerRamGb, setNewServerRamGb] = useState(8);
  const [newServerDiskGb, setNewServerDiskGb] = useState(120);

  // Snapshot Creation Modal State
  const [isCreateSnapOpen, setIsCreateSnapOpen] = useState(false);
  const [newSnapName, setNewSnapName] = useState('');
  const [newSnapDesc, setNewSnapDesc] = useState('');

  // Selected Service Log inspection
  const [selectedServiceLogs, setSelectedServiceLogs] = useState<string | null>(null);

  // Toast / feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('serverspace_nodes', JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem('serverspace_snapshots', JSON.stringify(snapshots));
  }, [snapshots]);

  // Real-time telemetry monitoring driven by event-loop lag and VFS activity
  useEffect(() => {
    let lastTick = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      const actualElapsed = now - lastTick;
      lastTick = now;

      // Real event loop latency ratio: excess elapsed time represents thread contention
      const latencyLagMs = Math.max(0, actualElapsed - 3000);
      const measuredCpuPercent = Math.min(95, Math.max(7, Math.round(12 + (latencyLagMs / 40) * 15)));

      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.status !== 'running') return node;

          const baseRx = 140 + (node.vCpu * 25);
          const baseTx = 280 + (node.vCpu * 45);

          return {
            ...node,
            cpuUsage: measuredCpuPercent,
            netRxKbps: baseRx,
            netTxKbps: baseTx,
            uptimeSeconds: node.uptimeSeconds + 3,
          };
        })
      );
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (activeSubTab === 'terminal') {
      terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory, activeSubTab]);

  const activeNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  // Aggregated cluster metrics
  const totalNodesCount = nodes.length;
  const runningNodesCount = nodes.filter((n) => n.status === 'running').length;
  const totalVcpu = nodes.reduce((sum, n) => sum + n.vCpu, 0);
  const totalRamGb = Math.round(nodes.reduce((sum, n) => sum + n.vRamMb, 0) / 1024);
  const totalDiskGb = nodes.reduce((sum, n) => sum + n.diskGb, 0);
  const avgCpuUsage = Math.round(
    nodes.filter((n) => n.status === 'running').reduce((sum, n) => sum + n.cpuUsage, 0) / (runningNodesCount || 1)
  );

  // Node Lifecycle Handlers
  const handleToggleNodePower = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          const newStatus = n.status === 'running' ? 'stopped' : 'running';
          showToast(`Server ${n.name} is now ${newStatus.toUpperCase()}`);
          return {
            ...n,
            status: newStatus,
            cpuUsage: newStatus === 'running' ? 20 : 0,
            ramUsage: newStatus === 'running' ? 35 : 0,
          };
        }
        return n;
      })
    );
  };

  const handleRebootNode = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, status: 'rebooting' } : n))
    );
    showToast(`Rebooting virtual cloud server ${nodeId}...`);
    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId
            ? { ...n, status: 'running', uptimeSeconds: 10, cpuUsage: 35 }
            : n
        )
      );
      showToast(`Server ${nodeId} rebooted successfully with clean VFS mounts`);
    }, 1600);
  };

  // Daemon Lifecycle Handlers
  const handleToggleDaemon = (daemonId: string) => {
    setDaemons((prev) =>
      prev.map((d) => {
        if (d.id === daemonId) {
          const nextStatus = d.status === 'active' ? 'inactive' : 'active';
          showToast(`Daemon ${d.serviceName} is now ${nextStatus}`);
          return { ...d, status: nextStatus };
        }
        return d;
      })
    );
  };

  const handleRestartDaemon = (daemonId: string) => {
    setDaemons((prev) =>
      prev.map((d) => (d.id === daemonId ? { ...d, status: 'restarting' } : d))
    );
    setTimeout(() => {
      setDaemons((prev) =>
        prev.map((d) => (d.id === daemonId ? { ...d, status: 'active' } : d))
      );
      showToast(`Service restarted successfully`);
    }, 1000);
  };

  // Terminal Command Executor
  const handleExecuteTerminal = (e: React.FormEvent) => {
    e.preventDefault();
    const rawCmd = terminalInput.trim();
    if (!rawCmd) return;

    setCmdHistory((prev) => [...prev, rawCmd]);
    setCmdHistoryIdx(-1);
    setTerminalInput('');

    const newEntries: Array<{ text: string; type: 'cmd' | 'output' | 'error' | 'success' }> = [
      { text: `root@${activeNode.name}:~# ${rawCmd}`, type: 'cmd' },
    ];

    const parts = rawCmd.split(' ');
    const command = parts[0].toLowerCase();

    switch (command) {
      case 'help':
        newEntries.push(
          { text: 'SERVERspace Virtual Cloud Terminal - Commands Available:', type: 'output' },
          { text: '  uname -a          : Display virtual kernel and OS version', type: 'output' },
          { text: '  top / htop        : Monitor live cluster processes and CPU cores', type: 'output' },
          { text: '  df -h             : Inspect virtual disk and VFS mount usage', type: 'output' },
          { text: '  free -m           : Memory and swap allocation statistics', type: 'output' },
          { text: '  systemctl status  : View active systemd daemons and services', type: 'output' },
          { text: '  ps aux            : List active virtual processes', type: 'output' },
          { text: '  netstat -tlpn     : Show open listening virtual ports and sockets', type: 'output' },
          { text: '  uptime            : Check system run-time and load averages', type: 'output' },
          { text: '  curl <url>        : Send virtual HTTP request through ingress router', type: 'output' },
          { text: '  kex boot          : Launch A. Keddeh KEX Linux microkernel session', type: 'output' },
          { text: '  os boot           : Boot full open-source web operating system', type: 'output' },
          { text: '  vfs ls /mnt       : View mounted cloud storage and Google Drive inodes', type: 'output' },
          { text: '  reboot            : Cycle power and re-initialize virtual server node', type: 'output' },
          { text: '  clear             : Clear the terminal console', type: 'output' }
        );
        break;

      case 'clear':
        setTerminalHistory([]);
        return;

      case 'uname':
        newEntries.push({
          text: `${activeNode.kernelVersion} #1 SMP PREEMPT_DYNAMIC GNU/Linux (SERVERspace Cloud Architecture)`,
          type: 'output',
        });
        break;

      case 'uptime':
        newEntries.push({
          text: ` 23:14:02 up ${formatUptime(activeNode.uptimeSeconds)},  1 user,  load average: 0.${Math.round(
            activeNode.cpuUsage / 2
          )}, 0.${Math.round(activeNode.cpuUsage / 3)}, 0.${Math.round(activeNode.cpuUsage / 4)}`,
          type: 'output',
        });
        break;

      case 'free':
      case 'free -m':
        newEntries.push(
          { text: '               total        used        free      shared  buff/cache   available', type: 'output' },
          {
            text: `Mem:           ${activeNode.vRamMb}        ${Math.round(
              (activeNode.vRamMb * activeNode.ramUsage) / 100
            )}        ${Math.round(
              (activeNode.vRamMb * (100 - activeNode.ramUsage)) / 100
            )}          64         512        ${Math.round(
              (activeNode.vRamMb * (95 - activeNode.ramUsage)) / 100
            )}`,
            type: 'output',
          },
          { text: 'Swap:          4096           0        4096', type: 'output' }
        );
        break;

      case 'df':
      case 'df -h':
        newEntries.push(
          { text: 'Filesystem      Size  Used Avail Use% Mounted on', type: 'output' },
          {
            text: `/dev/sda1       ${activeNode.diskGb}G   ${Math.round(
              (activeNode.diskGb * activeNode.diskUsage) / 100
            )}G   ${Math.round(
              (activeNode.diskGb * (100 - activeNode.diskUsage)) / 100
            )}G  ${activeNode.diskUsage}% /`,
            type: 'output',
          },
          { text: 'tmpfs           3.9G   64M  3.8G   2% /run', type: 'output' },
          { text: 'vfs-vault       15G   4.2G   10G  30% /mnt/vault (Local VFS)', type: 'output' },
          {
            text: isDriveConnected
              ? 'vfs-gdrive     100G    15G   85G  15% /mnt/gdrive (Google Drive v3 Synced)'
              : 'vfs-gdrive     100G      0  100G   0% /mnt/gdrive (Disconnected / Standby)',
            type: 'output',
          },
          { text: 'srv-apps        50G   8.6G   41G  18% /srv/apps (HTML5 App Hub)', type: 'output' }
        );
        break;

      case 'top':
      case 'htop':
        newEntries.push(
          {
            text: `top - 23:14:15 up ${formatUptime(activeNode.uptimeSeconds)}, 4 tasks: 4 running, 120 sleeping, 0 stopped`,
            type: 'output',
          },
          {
            text: `%Cpu(s): ${activeNode.cpuUsage}.2 us,  3.1 sy,  0.0 ni, ${100 - activeNode.cpuUsage}.7 id,  0.1 wa`,
            type: 'output',
          },
          { text: 'PID   USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND', type: 'output' },
          { text: ' 1042 root      20   0  482.4M 148.2M  32.0M S   4.8   1.8   4:12.18 serverspace-vfsd', type: 'output' },
          { text: ' 1088 kex-core  20   0  612.0M 210.4M  48.0M S   3.2   2.5   6:45.90 kex-microkernel', type: 'output' },
          { text: ' 1420 www-data  20   0  890.1M 320.0M  64.0M S   4.5   3.9   8:20.11 html5-app-sandbox', type: 'output' },
          { text: '  890 nginx     20   0  124.0M  64.2M  16.0M S   0.9   0.8   1:02.40 nginx: worker', type: 'output' },
          { text: '  512 root      20   0   48.0M  42.0M  12.0M S   0.1   0.5   0:14.22 sshd: root@pts/0', type: 'output' }
        );
        break;

      case 'systemctl':
        if (parts[1] === 'status') {
          newEntries.push(
            { text: `● ${activeNode.name} - SERVERspace Virtual Node Subsystem`, type: 'success' },
            { text: `   Loaded: loaded (/etc/systemd/system/serverspace.target; enabled)`, type: 'output' },
            { text: `   Active: active (running) since Thu 2026-08-15 04:22:00 UTC; ${formatUptime(activeNode.uptimeSeconds)} ago`, type: 'success' },
            { text: `   Main PID: 1 (systemd-kex-vfs)`, type: 'output' },
            { text: `   Tasks: 7 daemons active (vfsd, kex, nginx, sandbox, sshd, crond, telemetry)`, type: 'output' },
            { text: `   Memory: ${Math.round((activeNode.vRamMb * activeNode.ramUsage) / 100)}M (limit: ${activeNode.vRamMb}M)`, type: 'output' },
            { text: `   CGroup: /system.slice/serverspace.service`, type: 'output' }
          );
        } else {
          newEntries.push({ text: 'Usage: systemctl status | systemctl restart <service>', type: 'output' });
        }
        break;

      case 'netstat':
      case 'netstat -tlpn':
        newEntries.push(
          { text: 'Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name', type: 'output' },
          { text: 'tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      890/nginx: master', type: 'output' },
          { text: 'tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN      890/nginx: master', type: 'output' },
          { text: 'tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      512/sshd', type: 'output' },
          { text: 'tcp        0      0 0.0.0.0:3000            0.0.0.0:*               LISTEN      1420/html5-sandbox', type: 'output' },
          { text: 'tcp        0      0 0.0.0.0:8080            0.0.0.0:*               LISTEN      1088/kex-rpc', type: 'output' },
          { text: 'tcp        0      0 0.0.0.0:50051           0.0.0.0:*               LISTEN      1042/serverspace-vfsd', type: 'output' }
        );
        break;

      case 'ps':
      case 'ps aux':
        newEntries.push(
          { text: 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND', type: 'output' },
          { text: 'root         1  0.0  0.1  22500  4200 ?        Ss   Aug15   0:04 /sbin/init-serverspace', type: 'output' },
          { text: 'root       512  0.1  0.5  48000 42000 ?        Ss   Aug15   0:14 /usr/sbin/sshd -D', type: 'output' },
          { text: 'root       612  0.0  0.4  38000 38000 ?        Ss   Aug15   0:08 /usr/sbin/crond -n', type: 'output' },
          { text: 'nginx      890  0.9  0.8 124000 64200 ?        S    Aug15   1:02 nginx: worker process', type: 'output' },
          { text: 'root      1042  1.8  1.8 482400 148200 ?       Sl   Aug15   4:12 /usr/bin/serverspace-vfsd --gdrive-sync', type: 'output' },
          { text: 'kex       1088  3.2  2.5 612000 210400 ?       Sl   Aug15   6:45 /boot/kex-microkernel --proof-ledger', type: 'output' },
          { text: 'www-data  1420  4.5  3.9 890100 320000 ?       Sl   Aug15   8:20 /usr/bin/html5-sandbox-host --worker-pool', type: 'output' }
        );
        break;

      case 'kex':
        if (parts[1] === 'boot') {
          newEntries.push(
            { text: 'Booting A. Keddeh KEX Linux Microkernel Userspace session...', type: 'success' },
            { text: 'Initializing CPU register state, proof ledger, and stateful shell...', type: 'output' }
          );
          if (onBootKexLinux) {
            setTimeout(onBootKexLinux, 400);
          }
        } else {
          newEntries.push(
            { text: 'KEX Linux Subsystem by A. Keddeh', type: 'output' },
            { text: 'Type "kex boot" to launch the full interactive KEX Linux Terminal and microkernel GUI.', type: 'output' }
          );
        }
        break;

      case 'os':
        if (parts[1] === 'boot') {
          newEntries.push(
            { text: 'Booting full Open-Source Web Operating System with GRUB...', type: 'success' }
          );
          if (onBootOs) {
            setTimeout(onBootOs, 400);
          }
        } else {
          newEntries.push({ text: 'Type "os boot" to initialize the complete web desktop environment.', type: 'output' });
        }
        break;

      case 'curl':
        const targetUrl = parts[1] || 'http://localhost:80';
        newEntries.push(
          { text: `* Trying 127.0.0.1:80...`, type: 'output' },
          { text: `* Connected to ${targetUrl} port 80`, type: 'output' },
          { text: `> GET / HTTP/1.1\n> Host: serverspace.cloud\n> User-Agent: curl/8.5.0`, type: 'output' },
          { text: `< HTTP/1.1 200 OK\n< Server: SERVERspace-Edge/6.8\n< Content-Type: text/html; charset=UTF-8\n< X-Powered-By: KEX-Microkernel (A. Keddeh)`, type: 'success' },
          { text: `<!DOCTYPE html><html><head><title>SERVERspace Cloud</title></head><body><h1>SERVERspace Node Online</h1><p>Virtual Cloud Server & VFS Ready.</p></body></html>`, type: 'output' }
        );
        break;

      case 'vfs':
        newEntries.push(
          { text: 'SERVERspace Virtual File System (VFS) Mount Point Inodes:', type: 'output' },
          { text: '  /mnt/vault       -> 12 inodes [KEX Linux, Open Source OS, Paint, Breakout, SQL Studio]', type: 'output' },
          {
            text: isDriveConnected
              ? '  /mnt/gdrive      -> Active Google Drive v3 OAuth Mount (/root/Drive)'
              : '  /mnt/gdrive      -> Standby (Sign in to Google Drive in sidebar to mount)',
            type: 'output',
          },
          { text: '  /srv/apps        -> 8 containerized HTML5 runtime modules', type: 'output' }
        );
        break;

      case 'reboot':
        handleRebootNode(activeNode.id);
        newEntries.push({ text: `Broadcast message from root@${activeNode.name}: Node is going down for reboot NOW!`, type: 'error' });
        break;

      default:
        newEntries.push({
          text: `bash: ${command}: command not found. Type "help" for a list of valid SERVERspace commands.`,
          type: 'error',
        });
        break;
    }

    setTerminalHistory((prev) => [...prev, ...newEntries]);
  };

  // Quick Command Injection
  const injectCmd = (cmd: string) => {
    setTerminalInput(cmd);
  };

  // Provision New Server Node Handler
  const handleProvisionServer = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newServerName.trim() || `srv-worker-0${nodes.length + 1}`;
    const cleanId = `srv-${Date.now().toString(36)}`;
    const nodeIndex = nodes.length + 1;
    const deterministicIp = `10.240.0.${40 + (nodeIndex * 7) % 200}`;
    const deterministicPubIp = `34.142.${(nodeIndex * 29) % 240 + 10}.${(nodeIndex * 37) % 240 + 2}`;

    const newNode: ServerNode = {
      id: cleanId,
      name: cleanName,
      label: `${cleanName} (Custom Cloud Node)`,
      os: newServerOs,
      kernelVersion: newServerOs.includes('KEX') ? 'Linux 6.8.4-kex-vfs-x86_64' : 'Linux 6.8.0-cloud-amd64',
      ip: deterministicIp,
      publicIp: deterministicPubIp,
      status: 'running',
      uptimeSeconds: 15,
      vCpu: newServerVcpu,
      vRamMb: newServerRamGb * 1024,
      diskGb: newServerDiskGb,
      cpuUsage: 12,
      ramUsage: 24,
      diskUsage: 10,
      netRxKbps: 220,
      netTxKbps: 450,
      mountedStorage: ['/mnt/vault', '/srv/apps'],
      openPorts: [22, 80, 3000],
      activeServices: ['serverspace-vfs.service', 'sshd.service', 'html5-runtime-sandbox.service'],
      location: 'Cloud Vertex (Dynamic Provision)',
      createdAt: new Date().toISOString(),
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    setIsProvisionOpen(false);
    setNewServerName('');
    showToast(`New Virtual Cloud Server "${cleanName}" provisioned and booted!`);
  };

  // Create Snapshot Handler
  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newSnapName.trim() || `${activeNode.name}-snapshot-${new Date().toISOString().slice(0, 10)}`;
    const vfsStoredBytes = (localStorage.getItem('serverspace_files')?.length || 32000) * 8;
    const computedSizeBytes = Math.round(activeNode.diskGb * 1024 * 1024 * 1024 * 0.15 + vfsStoredBytes);

    const newSnap: ServerSnapshot = {
      id: `snap-${Date.now().toString(36)}`,
      serverId: activeNode.id,
      serverName: activeNode.name,
      name,
      sizeBytes: computedSizeBytes,
      createdAt: new Date().toISOString(),
      description: newSnapDesc.trim() || `Instant point-in-time image of ${activeNode.name} with VFS state.`,
      status: 'ready',
    };

    setSnapshots((prev) => [newSnap, ...prev]);
    setIsCreateSnapOpen(false);
    setNewSnapName('');
    setNewSnapDesc('');
    showToast(`Server snapshot "${name}" saved to immutable cloud backup`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto no-scrollbar">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-6 z-50 bg-slate-900 border border-blue-500/50 shadow-2xl shadow-blue-500/20 px-4 py-2.5 rounded-xl text-xs font-medium text-white flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero / Header Section: SERVERspace Cluster Overview */}
      <div className="p-6 pb-4 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white tracking-tight">SERVERspace</h1>
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[11px] font-semibold">
                    VIRTUAL CLOUD SERVER
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    CLUSTER HEALTHY
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans">
                  Next-generation cloud infrastructure uniting virtual Linux microkernel nodes, distributed VFS storage, and containerized runtime services.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsTourOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition-all cursor-pointer ring-1 ring-cyan-400/40"
              title="Launch Human-Centric Tour: Master every button, function, and utility"
            >
              <Compass className="w-4 h-4 text-cyan-200" />
              <span>Guided Learning Tour</span>
            </button>
            <button
              onClick={() => {
                setTourTopicId('btn-reboot');
                setIsTourOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Every Single Button Manual"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Button Manual</span>
            </button>
            <button
              onClick={() => setActiveSubTab('os-studio')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Install Any OS</span>
            </button>
            <button
              onClick={() => setActiveSubTab('desktop')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Monitor className="w-3.5 h-3.5 text-blue-400" />
              <span>Virtual Desktop</span>
            </button>
            <button
              onClick={() => setActiveSubTab('braink')}
              className="px-3 py-2 rounded-xl bg-violet-950/60 hover:bg-violet-900/80 text-violet-200 text-xs font-medium border border-violet-800/60 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Brain className="w-3.5 h-3.5 text-violet-400" />
              <span>Braink Virtual Brain</span>
            </button>
            <button
              onClick={() => setIsProvisionOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Provision Server Node</span>
            </button>
            <button
              onClick={() => setActiveSubTab('terminal')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <TerminalIcon className="w-4 h-4 text-cyan-400" />
              <span>Virtual SSH Console</span>
            </button>
            <button
              onClick={() => setIsCreateSnapOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-blue-400" />
              <span>Snapshot Cluster</span>
            </button>
            {onBootKexLinux && (
              <button
                onClick={onBootKexLinux}
                className="px-3 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 text-xs font-medium border border-purple-800/60 flex items-center gap-1.5 transition-all cursor-pointer"
                title="Launch A. Keddeh KEX Linux Userspace"
              >
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>KEX Linux Shell</span>
              </button>
            )}
          </div>
        </div>

        {/* Real-time Cluster Telemetry Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {/* Active Nodes */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-medium">Server Nodes</span>
              <Server className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-white font-mono">{runningNodesCount}</span>
              <span className="text-xs text-slate-400 font-mono">/ {totalNodesCount} online</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all"
                style={{ width: `${(runningNodesCount / totalNodesCount) * 100}%` }}
              />
            </div>
          </div>

          {/* Virtual Compute (vCPUs) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-medium">Virtual CPUs</span>
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-white font-mono">{totalVcpu}</span>
              <span className="text-xs text-slate-400 font-mono">vCores</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Avg Load</span>
              <span className="text-cyan-400 font-semibold">{avgCpuUsage}%</span>
            </div>
          </div>

          {/* Virtual Memory (vRAM) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-medium">Allocated RAM</span>
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-white font-mono">{totalRamGb}</span>
              <span className="text-xs text-slate-400 font-mono">GB Total</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: '42%' }} />
            </div>
          </div>

          {/* Virtual Disk Pool */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-medium">VFS Disk Pool</span>
              <HardDrive className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-white font-mono">{totalDiskGb}</span>
              <span className="text-xs text-slate-400 font-mono">GB Cloud</span>
            </div>
            <div className="text-[10px] text-purple-400 font-mono truncate">
              {isDriveConnected ? 'Google Drive Linked' : 'Local VFS Mounted'}
            </div>
          </div>

          {/* Active Daemons */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-medium">Systemd Services</span>
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-white font-mono">
                {daemons.filter((d) => d.status === 'active').length}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ {daemons.length} active</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-mono truncate">
              kex, vfs, nginx, sshd
            </div>
          </div>

          {/* Virtual Network Throughput */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-medium">Virtual I/O Net</span>
              <Network className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1 text-[11px] font-mono text-slate-300">
              <span className="text-amber-400 font-bold">RX:</span>{' '}
              {Math.round(nodes.reduce((s, n) => s + n.netRxKbps, 0) / 1024 * 10) / 10} Mb/s
            </div>
            <div className="flex items-baseline gap-1 text-[11px] font-mono text-slate-300">
              <span className="text-cyan-400 font-bold">TX:</span>{' '}
              {Math.round(nodes.reduce((s, n) => s + n.netTxKbps, 0) / 1024 * 10) / 10} Mb/s
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-800 pt-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSubTab('nodes')}
            className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'nodes'
                ? 'border-blue-500 text-white bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-blue-400" />
            <span>Virtual Server Nodes</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
              {nodes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('os-studio')}
            className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'os-studio'
                ? 'border-cyan-500 text-white bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Install Any OS</span>
            <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
              Studio
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('desktop')}
            className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'desktop'
                ? 'border-blue-500 text-white bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-blue-400" />
            <span>Virtual Desktop</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveSubTab('rack-ai')}
            className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'rack-ai'
                ? 'border-indigo-500 text-white bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Server Rack AI &amp; Stress</span>
            <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-500/30">
              Peak
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('braink')}
            className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'braink'
                ? 'border-violet-500 text-white bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-violet-400" />
            <span>Braink Virtual Brain</span>
            <span className="px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-mono border border-violet-500/30">
              Bio-Centric
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('terminal')}
            className={`px-3.5 py-2 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'terminal'
                ? 'border-cyan-500 text-white bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>SSH Shell &amp; KEX Console</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveSubTab('services')}
            className={`px-3.5 py-2 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'services'
                ? 'border-emerald-500 text-white bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Systemd Daemons</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
              {daemons.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('ports')}
            className={`px-3.5 py-2 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'ports'
                ? 'border-indigo-500 text-white bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>Virtual Port Router</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
              {portRules.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('mounts')}
            className={`px-3.5 py-2 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'mounts'
                ? 'border-purple-500 text-white bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-purple-400" />
            <span>VFS Storage Mounts</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
              {isDriveConnected ? 'Drive + Vault' : 'Vault'}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('snapshots')}
            className={`px-3.5 py-2 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'snapshots'
                ? 'border-amber-500 text-white bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Copy className="w-3.5 h-3.5 text-amber-400" />
            <span>Cluster Snapshots</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
              {snapshots.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Tab Content Area */}
      <div className="p-6 flex-1">
        {/* TAB 1: SERVER NODES / VPS INSTANCES */}
        {activeSubTab === 'nodes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Active Server Instances</h2>
                <p className="text-xs text-slate-400">
                  Manage individual virtual cloud compute nodes, inspect hardware allocation, and execute control operations.
                </p>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Cluster Subnet: <span className="text-cyan-400">10.240.0.0/24</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nodes.map((node) => {
                const isSelected = node.id === selectedNodeId;
                const isRunning = node.status === 'running';

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`bg-slate-900 border rounded-2xl p-5 space-y-4 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/50'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Node Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                            isRunning
                              ? 'bg-blue-600/20 border border-blue-500/40 text-blue-400'
                              : 'bg-slate-800 border border-slate-700 text-slate-500'
                          }`}
                        >
                          <Server className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white font-mono">{node.name}</h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono flex items-center gap-1 ${
                                isRunning
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : node.status === 'rebooting'
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                                }`}
                              />
                              {node.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-sans">{node.label}</p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleNodePower(node.id)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                            isRunning
                              ? 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                          }`}
                          title={isRunning ? 'Stop Server' : 'Start Server'}
                        >
                          {isRunning ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleRebootNode(node.id)}
                          className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs transition-colors cursor-pointer"
                          title="Reboot Server"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedNodeId(node.id);
                            setActiveSubTab('terminal');
                          }}
                          className="p-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 text-xs transition-colors cursor-pointer"
                          title="Open SSH Console"
                        >
                          <TerminalIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Specs Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-[11px] font-mono">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Private IP</span>
                        <span className="text-slate-300 font-semibold">{node.ip}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Public Gateway</span>
                        <span className="text-cyan-400 font-semibold">{node.publicIp}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Compute Spec</span>
                        <span className="text-slate-300">
                          {node.vCpu} vCPU / {Math.round(node.vRamMb / 1024)}GB
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Uptime</span>
                        <span className="text-slate-300">{formatUptime(node.uptimeSeconds)}</span>
                      </div>
                    </div>

                    {/* Hardware Gauges */}
                    <div className="space-y-2 pt-1">
                      {/* CPU Usage Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                            <span>vCPU Load</span>
                          </span>
                          <span className="font-mono text-cyan-400 font-bold">{node.cpuUsage}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              node.cpuUsage > 80
                                ? 'bg-rose-500'
                                : node.cpuUsage > 50
                                ? 'bg-amber-400'
                                : 'bg-cyan-400'
                            }`}
                            style={{ width: `${node.cpuUsage}%` }}
                          />
                        </div>
                      </div>

                      {/* RAM Usage Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                            <Activity className="w-3.5 h-3.5 text-indigo-400" />
                            <span>vRAM Allocation</span>
                          </span>
                          <span className="font-mono text-indigo-300 font-bold">
                            {Math.round((node.vRamMb * node.ramUsage) / 100)} / {node.vRamMb} MB ({node.ramUsage}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${node.ramUsage}%` }}
                          />
                        </div>
                      </div>

                      {/* Storage Mounts & Ports */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <div className="flex items-center gap-1.5 truncate max-w-[65%]">
                          <HardDrive className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span className="truncate">{node.mountedStorage.join(', ')}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 font-mono text-[10px] text-cyan-400">
                          <span>Ports: {node.openPorts.join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Author Credit Tag if present */}
                    {node.authorNote && (
                      <div className="text-[11px] text-purple-300/80 bg-purple-950/20 border border-purple-900/40 p-2 rounded-lg flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>{node.authorNote}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: IN-BROWSER VIRTUAL SSH TERMINAL */}
        {activeSubTab === 'terminal' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-white font-mono">
                  SSH Connected: root@{activeNode.name} ({activeNode.ip}:22)
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-cyan-400">
                  {activeNode.os}
                </span>
              </div>

              {/* Node Switcher for Terminal */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Switch Node:</span>
                <select
                  value={selectedNodeId}
                  onChange={(e) => {
                    setSelectedNodeId(e.target.value);
                    const switchedNode = nodes.find((n) => n.id === e.target.value);
                    if (switchedNode) {
                      setTerminalHistory((prev) => [
                        ...prev,
                        {
                          text: `Switched SSH session to ${switchedNode.name} (${switchedNode.ip})`,
                          type: 'success',
                        },
                      ]);
                    }
                  }}
                  className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-cyan-500"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.ip})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Command Shortcuts Toolbar */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-cyan-400" /> Quick Commands:
              </span>
              {[
                'top',
                'systemctl status',
                'df -h',
                'free -m',
                'netstat -tlpn',
                'ps aux',
                'kex boot',
                'vfs ls /mnt',
                'curl http://localhost:80',
                'uptime',
                'clear',
              ].map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => injectCmd(cmd)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-cyan-300 hover:text-white transition-colors cursor-pointer"
                >
                  {cmd}
                </button>
              ))}
            </div>

            {/* Terminal Window */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs shadow-2xl flex flex-col h-[520px]">
              {/* Window Title Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-slate-300 font-semibold pl-2">
                    bash - 80x24 (SERVERspace Cloud Console)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span>VFS Mounted: OK</span>
                  <span>SSL: ACTIVE</span>
                  <button
                    onClick={() => setTerminalHistory([])}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Clear Output
                  </button>
                </div>
              </div>

              {/* Terminal Logs & History */}
              <div className="flex-1 overflow-y-auto space-y-1 pr-2 no-scrollbar">
                {terminalHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`leading-relaxed whitespace-pre-wrap ${
                      item.type === 'cmd'
                        ? 'text-cyan-300 font-bold'
                        : item.type === 'error'
                        ? 'text-rose-400'
                        : item.type === 'success'
                        ? 'text-emerald-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {item.text}
                  </div>
                ))}
                <div ref={terminalBottomRef} />
              </div>

              {/* Terminal Input Line */}
              <form onSubmit={handleExecuteTerminal} className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2">
                <span className="text-cyan-400 font-bold shrink-0">root@{activeNode.name}:~#</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder="Enter command (e.g. top, df -h, systemctl status, kex boot)..."
                  className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none placeholder-slate-600"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  Run
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: SYSTEMD DAEMONS & SERVICES */}
        {activeSubTab === 'services' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">System Daemons & Background Workers</h2>
                <p className="text-xs text-slate-400">
                  Virtual systemd controllers managing storage sync, microkernel processes, and edge proxying.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setDaemons((prev) => prev.map((d) => ({ ...d, status: 'active' })));
                    showToast('All server daemons restarted and verified healthy');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Restart All Services</span>
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {daemons.map((daemon) => {
                const isActive = daemon.status === 'active';
                return (
                  <div
                    key={daemon.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-white font-mono">{daemon.serviceName}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                              isActive
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {daemon.status.toUpperCase()}
                          </span>
                          {daemon.port && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-cyan-400 font-mono">
                              Port {daemon.port}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-sans mt-0.5">{daemon.description}</p>
                      </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                      <div className="text-right text-[11px] font-mono">
                        <span className="text-slate-400 block">PID: {daemon.pid}</span>
                        <span className="text-slate-300">
                          {daemon.memoryMb} MB | {daemon.cpuPercent}% CPU
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleDaemon(daemon.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                            isActive
                              ? 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                          }`}
                        >
                          {isActive ? 'Stop' : 'Start'}
                        </button>
                        <button
                          onClick={() => handleRestartDaemon(daemon.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
                        >
                          Restart
                        </button>
                        <button
                          onClick={() =>
                            setSelectedServiceLogs(
                              `journalctl -u ${daemon.serviceName} -n 20:\n` +
                                `[${new Date().toISOString()}] Started ${daemon.name}.\n` +
                                `[${new Date().toISOString()}] Bound to virtual socket (PID: ${daemon.pid}).\n` +
                                `[${new Date().toISOString()}] VFS Inode buffer synchronized with cloud storage.\n` +
                                `[${new Date().toISOString()}] Health probe: 200 OK (0.2ms latency).`
                            )
                          }
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
                        >
                          Logs
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Service Log Inspection Modal */}
            {selectedServiceLogs && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
                      <TerminalIcon className="w-4 h-4 text-cyan-400" />
                      <span>Journalctl Service Log Stream</span>
                    </h3>
                    <button
                      onClick={() => setSelectedServiceLogs(null)}
                      className="text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {selectedServiceLogs}
                  </pre>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setSelectedServiceLogs(null)}
                      className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700 cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: VIRTUAL PORT ROUTER & PROXY */}
        {activeSubTab === 'ports' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Virtual Ingress Port Map & Reverse Proxy</h2>
                <p className="text-xs text-slate-400">
                  Routes external web requests and local socket listeners directly into SERVERspace hosted applications.
                </p>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Ingress Host: <span className="text-cyan-400">edge.serverspace.cloud</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <tr>
                    <th className="p-3.5">Port</th>
                    <th className="p-3.5">Protocol</th>
                    <th className="p-3.5">Target Service & Route</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {portRules.map((rule) => (
                    <tr key={rule.port} className="hover:bg-slate-850/60 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-white">
                        <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-cyan-400">
                          :{rule.port}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-300">
                        <span className="px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-800/60 text-blue-300 text-[10px]">
                          {rule.protocol}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-300 font-mono">{rule.targetService}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {rule.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {rule.port === 80 || rule.port === 3000 ? (
                          <button
                            onClick={() => {
                              const demoApp = files.find((f) => f.isHtml5App);
                              if (demoApp) onLaunchApp(demoApp);
                              else showToast('Port 80/3000: Web app ingress verified');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer"
                          >
                            Open Route
                          </button>
                        ) : rule.port === 22 ? (
                          <button
                            onClick={() => setActiveSubTab('terminal')}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-medium cursor-pointer"
                          >
                            SSH Connect
                          </button>
                        ) : (
                          <button
                            onClick={() => showToast(`Port ${rule.port} probe: 200 OK (Virtual socket listening)`)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium cursor-pointer"
                          >
                            Test Ping
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: VFS STORAGE MOUNT BRIDGE */}
        {activeSubTab === 'mounts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Cloud Filesystem (VFS) & Mount Bridges</h2>
                <p className="text-xs text-slate-400">
                  How local and Google Drive storage assets are mounted as virtual server devices and directory trees.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Mount 1: Local Vault */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-400" />
                    <h3 className="text-xs font-bold text-white font-mono">/mnt/vault</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    MOUNTED
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Local offline storage vault containing KEX Linux microkernel binaries, OS bootloader, and default system schemas.
                </p>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                  <div>Type: virtio-vfs (memory block)</div>
                  <div>Inodes: {files.filter((f) => !f.isDriveFile).length} files indexed</div>
                  <div>Permissions: rw,relatime,sync</div>
                </div>
              </div>

              {/* Mount 2: Google Drive v3 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-xs font-bold text-white font-mono">/mnt/gdrive</h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      isDriveConnected
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {isDriveConnected ? 'OAUTH ACTIVE' : 'UNMOUNTED'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Direct Google Drive cloud filesystem sync. Provides persistent cloud backup and cross-device sync.
                </p>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                  <div>Type: gdrive-v3-fuse</div>
                  <div>
                    Status: {isDriveConnected ? 'Connected & Synchronized' : 'Standby / Sign In Required'}
                  </div>
                  <div>Sync Mode: Two-way automatic</div>
                </div>
              </div>

              {/* Mount 3: HTML5 App Sandbox */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <h3 className="text-xs font-bold text-white font-mono">/srv/apps</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/15 text-purple-400 border border-purple-500/30">
                    CONTAINERIZED
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Dedicated directory for running self-contained HTML5 technologies (Paint, SQL Studio, Breakout, Synthesizer).
                </p>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                  <div>Type: overlayfs-sandbox</div>
                  <div>Apps Active: {files.filter((f) => f.isHtml5App).length} installed</div>
                  <div>Isolation: iframe sandboxed worker</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CLUSTER SNAPSHOTS & DISASTER RECOVERY */}
        {activeSubTab === 'snapshots' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Server State Snapshots & Golden Images</h2>
                <p className="text-xs text-slate-400">
                  Point-in-time immutable disk and kernel memory backups for instant restore and deployment.
                </p>
              </div>
              <button
                onClick={() => setIsCreateSnapOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Snapshot</span>
              </button>
            </div>

            <div className="space-y-3">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Copy className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-white font-mono">{snap.name}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          READY
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">from {snap.serverName}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{snap.description}</p>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        Size: {(snap.sizeBytes / (1024 * 1024 * 1024)).toFixed(2)} GB • Created:{' '}
                        {new Date(snap.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => showToast(`Restored server state from snapshot "${snap.name}"`)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium cursor-pointer"
                    >
                      Restore to Node
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(snap, null, 2)], {
                          type: 'application/json',
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${snap.name}-manifest.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        showToast('Snapshot manifest exported');
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                      title="Download Manifest"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: NATURAL OS INSTALLATION STUDIO */}
        {activeSubTab === 'os-studio' && (
          <OsInstallationStudio
            initialSpec={hardwareSpec}
            activeNode={activeNode}
            onInstallComplete={(installedOs, finalSpec) => {
              setActiveOs(installedOs);
              setHardwareSpec(finalSpec);
              showToast(`${installedOs.name} deployed with ${finalSpec.gpuModel} & ${finalSpec.displayResolution}`);
              setActiveSubTab('desktop');
            }}
            onLaunchDesktop={() => setActiveSubTab('desktop')}
            onRequestHelp={(topicId) => {
              setTourTopicId(topicId);
              setIsTourOpen(true);
            }}
          />
        )}

        {/* TAB 8: VIRTUAL DESKTOP & RUNTIMES */}
        {activeSubTab === 'desktop' && (
          <VirtualDesktopEnvironment
            os={activeOs}
            spec={hardwareSpec}
            onOpenOsStudio={() => setActiveSubTab('os-studio')}
            onOpenBraink={() => setActiveSubTab('braink')}
            onOpenRackAi={() => setActiveSubTab('rack-ai')}
            onRequestHelp={(topicId) => {
              setTourTopicId(topicId);
              setIsTourOpen(true);
            }}
          />
        )}

        {/* TAB 9: SERVER RACK AI SUITE & HIGH-PEAK STRESS TESTING */}
        {activeSubTab === 'rack-ai' && (
          <ServerRackAiSuite
            activeNode={activeNode}
            onRequestHelp={(topicId) => {
              setTourTopicId(topicId);
              setIsTourOpen(true);
            }}
            onDeployBraink={() => setActiveSubTab('braink')}
          />
        )}

        {/* TAB 10: BRAINK AUGMENTED INTELLIGENCE VIRTUAL BRAIN */}
        {activeSubTab === 'braink' && (
          <BrainkVirtualBrain
            activeNode={activeNode}
            onRequestHelp={(topicId) => {
              setTourTopicId(topicId);
              setIsTourOpen(true);
            }}
            onDeploySuccess={(msg) => {
              showToast(msg);
              setNodes((prev) =>
                prev.map((n) =>
                  n.id === activeNode.id
                    ? {
                        ...n,
                        label: `${n.name} (Braink-Enhanced Node)`,
                      }
                    : n
                )
              );
            }}
          />
        )}
      </div>

      {/* PROVISION VIRTUAL SERVER MODAL */}
      {isProvisionOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Provision New Virtual Cloud Server</h3>
              </div>
              <button
                onClick={() => setIsProvisionOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleProvisionServer} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Server Hostname</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. srv-worker-05"
                  value={newServerName}
                  onChange={(e) => setNewServerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Base OS Image</label>
                <select
                  value={newServerOs}
                  onChange={(e) => setNewServerOs(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                >
                  <option value="KEX Linux 6.8 (A. Keddeh)">KEX Linux 6.8 Microkernel (A. Keddeh)</option>
                  <option value="Alpine Linux 3.20 Minimal (VFS-Optimized)">Alpine Linux 3.20 Minimal (VFS)</option>
                  <option value="Ubuntu 24.04 LTS Cloud Server">Ubuntu 24.04 LTS Cloud Server</option>
                  <option value="Debian 12 Bookworm (Containerized Userspace)">Debian 12 Bookworm Userspace</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">vCPUs</label>
                  <select
                    value={newServerVcpu}
                    onChange={(e) => setNewServerVcpu(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  >
                    <option value={1}>1 Core</option>
                    <option value={2}>2 Cores</option>
                    <option value={4}>4 Cores</option>
                    <option value={8}>8 Cores</option>
                    <option value={16}>16 Cores</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">vRAM</label>
                  <select
                    value={newServerRamGb}
                    onChange={(e) => setNewServerRamGb(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  >
                    <option value={2}>2 GB</option>
                    <option value={4}>4 GB</option>
                    <option value={8}>8 GB</option>
                    <option value={16}>16 GB</option>
                    <option value={32}>32 GB</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Disk</label>
                  <select
                    value={newServerDiskGb}
                    onChange={(e) => setNewServerDiskGb(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  >
                    <option value={50}>50 GB</option>
                    <option value={120}>120 GB</option>
                    <option value={250}>250 GB</option>
                    <option value={500}>500 GB</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProvisionOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md cursor-pointer"
                >
                  Deploy Server
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SNAPSHOT MODAL */}
      {isCreateSnapOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Create Virtual Server Snapshot</h3>
              </div>
              <button
                onClick={() => setIsCreateSnapOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateSnapshot} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Target Server Node</label>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono text-cyan-400">
                  {activeNode.name} ({activeNode.ip})
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Snapshot Label</label>
                <input
                  type="text"
                  placeholder="e.g. golden-production-backup-v1"
                  value={newSnapName}
                  onChange={(e) => setNewSnapName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description / Changelog</label>
                <textarea
                  rows={3}
                  placeholder="Notes on current server configuration and mounted volumes..."
                  value={newSnapDesc}
                  onChange={(e) => setNewSnapDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateSnapOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold shadow-md cursor-pointer"
                >
                  Save Snapshot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HUMAN-CENTRIC LEARNING TOUR & LOGICAL SYSTEM CONTROL DIRECTORY */}
      <HumanCentricTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigateSection={(sectionId) => {
          if (['nodes', 'os-studio', 'desktop', 'rack-ai', 'braink', 'terminal', 'services', 'ports', 'mounts', 'snapshots'].includes(sectionId)) {
            setActiveSubTab(sectionId as any);
          }
        }}
        defaultTopicId={tourTopicId}
      />
    </div>
  );
};
