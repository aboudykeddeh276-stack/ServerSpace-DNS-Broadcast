export type FileCategory = 'images' | 'documents' | 'videos' | 'audio' | 'archives' | 'code' | 'other';

export interface FileItem {
  id: string;
  name: string;
  folderId: string | null; // null means root
  category: FileCategory;
  size: number; // in bytes
  mimeType: string;
  updatedAt: string;
  createdAt: string;
  starred: boolean;
  inTrash: boolean;
  trashedAt?: string;
  url?: string; // Preview URL or data URL
  webViewLink?: string; // Google Drive Web View Link
  webContentLink?: string; // Google Drive direct download
  iconLink?: string;
  thumbnailLink?: string;
  isDriveFile?: boolean;
  isHtml5App?: boolean;
  rawContent?: string;
  tags: string[];
  dimensions?: string; // e.g., "1920x1080"
  duration?: string; // e.g., "03:42"
  description?: string;
  sharedWith?: string[];
  isDuplicate?: boolean;
}

export interface FolderItem {
  id: string;
  name: string;
  parentId: string | null; // null means root
  color: string;
  starred: boolean;
  inTrash: boolean;
  createdAt: string;
  updatedAt: string;
  isDriveFolder?: boolean;
}

export interface GoogleDriveUser {
  displayName: string;
  emailAddress: string;
  photoLink?: string;
}

export interface GoogleDriveQuota {
  limit: number; // Total quota in bytes
  usage: number; // Total used in bytes
  usageInDrive: number;
  usageInDriveTrash: number;
}

export interface StorageCategoryInfo {
  category: FileCategory;
  label: string;
  color: string;
  bgLight: string;
  iconName: string;
}

export type ViewMode = 'grid' | 'list';
export type SortOption = 'name' | 'size' | 'updatedAt' | 'type';
export type SortOrder = 'asc' | 'desc';

export type NavTab = 'server' | 'files' | 'index' | 'apps' | 'analytics' | 'starred' | 'recent' | 'trash' | 'shared';

export interface StoragePlan {
  id: string;
  name: string;
  limitBytes: number;
  price: string;
  badge?: string;
  features: string[];
}

export type ServerStatus = 'running' | 'stopped' | 'rebooting' | 'provisioning' | 'paused';

export interface ServerNode {
  id: string;
  name: string;
  label: string;
  os: string;
  kernelVersion: string;
  ip: string;
  publicIp: string;
  status: ServerStatus;
  uptimeSeconds: number;
  vCpu: number;
  vRamMb: number;
  diskGb: number;
  cpuUsage: number;
  ramUsage: number;
  diskUsage: number;
  netRxKbps: number;
  netTxKbps: number;
  mountedStorage: string[];
  openPorts: number[];
  activeServices: string[];
  location: string;
  createdAt: string;
  authorNote?: string;
}

export interface ServerDaemon {
  id: string;
  name: string;
  serviceName: string;
  status: 'active' | 'inactive' | 'failed' | 'restarting';
  description: string;
  pid: number;
  memoryMb: number;
  cpuPercent: number;
  uptime: string;
  port?: number;
}

export interface ServerSnapshot {
  id: string;
  serverId: string;
  serverName: string;
  name: string;
  sizeBytes: number;
  createdAt: string;
  description: string;
  status: 'ready' | 'creating';
}

export interface VirtualPortRule {
  port: number;
  protocol: 'HTTP' | 'HTTPS' | 'TCP' | 'SSH' | 'WS';
  targetService: string;
  status: 'OPEN' | 'FILTERED' | 'LISTENING';
  externalUrl?: string;
}

export interface OperatingSystemCatalogItem {
  id: string;
  name: string;
  version: string;
  category: 'linux' | 'bsd' | 'specialized' | 'minimal' | 'custom';
  architecture: 'x86_64' | 'arm64' | 'riscv64';
  kernel: string;
  defaultDesktop: 'GNOME 46' | 'KDE Plasma 6' | 'XFCE 4.18' | 'KEX MicroShell' | 'i3wm Minimal' | 'Headless Server';
  minVcpu: number;
  minRamGb: number;
  minDiskGb: number;
  description: string;
  tags: string[];
  isInstalled?: boolean;
  isoSizeMb: number;
  badge?: string;
}

export interface VirtualHardwareSpec {
  cpuCores: number;
  cpuArchitecture: 'x86_64' | 'arm64' | 'riscv64';
  cpuClockGhz: number;
  cpuGovernor: 'performance' | 'schedutil' | 'powersave';
  nestedVirtualization: boolean;
  gpuModel: 'none' | 'nvidia-h100-vgpu' | 'braink-synaptic-npu' | 'amd-mi300x-vgpu' | 'virtio-gpu-3d' | 'webgpu-direct';
  gpuVramGb: number;
  displayResolution: '1920x1080' | '2560x1440' | '3840x2160' | '3440x1440';
  displayRefreshHz: 60 | 120 | 144 | 240;
  displayScale: 1 | 1.25 | 1.5 | 2;
  monitorCount: 1 | 2 | 3;
  ramGb: number;
  ramType: 'ECC DDR5-5600' | 'HBM3e Unified' | 'LPDDR5X';
  zramCompression: boolean;
  diskGb: number;
  storageBus: 'NVMe PCIe 5.0' | 'VirtIO SCSI' | 'VFS Cloud Block';
  iopsLimit: number;
  networkNic: 'VirtIO 100Gbps' | 'WireGuard Mesh' | 'Bridged Cloud';
}

export interface VirtualDesktopWindow {
  id: string;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  appType: 'terminal' | 'files' | 'editor' | 'monitor' | 'braink' | 'browser' | 'settings';
}

export interface StressBenchmarkMetric {
  timestamp: string;
  cpuLoadPercent: number;
  gpuTensorTflops: number;
  memBandwidthGbps: number;
  thermalDegC: number;
  powerWatts: number;
  tokensPerSec: number;
}

export interface BrainkCorticalLayer {
  id: string;
  name: string;
  layerNumber: number;
  function: string;
  activeRate: number; // 0 - 100%
  neuronsFiredPerSec: number;
  description: string;
}

export interface BrainkVirtualBrainState {
  status: 'dormant' | 'calibrating' | 'conscious' | 'hyper-plasticity';
  synapticConnections: number;
  actionPotentialHz: number;
  coherenceScore: number; // 0 - 100
  dominantFrequency: 'Delta (2Hz)' | 'Theta (6Hz)' | 'Alpha (10Hz)' | 'Beta (22Hz)' | 'Gamma (40Hz)';
  neurotransmitters: {
    dopamine: number; // 0 - 100
    serotonin: number;
    acetylcholine: number;
    noradrenaline: number;
  };
  corticalLayers: BrainkCorticalLayer[];
  recentThoughts: Array<{
    id: string;
    timestamp: string;
    stream: string;
    corticalOrigin: string;
    plasticityDelta: number;
    bioCentricProof: string;
  }>;
  activeStimuli: Array<{
    id: string;
    type: 'visual' | 'auditory' | 'symbolic' | 'sensorimotor';
    label: string;
    intensity: number;
  }>;
}

export interface BrainkKernelTelemetry {
  isWasmReady: boolean;
  wasmBinaryBytes: number;
  wasmMemoryPages: number;
  activeConcepts: number;
  activeEdges: number;
  epochCount: number;
  injectedPacketCount: number;
  lastPacketTimeNs: number;
  lastSkCoordinate: [number, number, number];
  lastMoebiusWireHex: string;
  transitiveClosurePathCount: number;
  averageEigenvectorCentrality: number;
  gammaFrequencyHz: number;
  kernelState: 'BOOTING' | 'ONLINE_WASM' | 'FALLBACK';
  workerThreadId: string;
  throughputOpsPerSec: number;
}

export interface BrainkWasmEdge {
  from: string;
  to: string;
  weight: number;
  isTransitive?: boolean;
}

export interface TourStep {
  id: string;
  stepNumber: number;
  title: string;
  section: 'overview' | 'nodes' | 'os-studio' | 'desktop' | 'rack-ai' | 'braink' | 'terminal' | 'storage';
  selector?: string;
  description: string;
  howToUse: string;
  proTip: string;
  badge?: string;
}

export interface SystemControlDoc {
  id: string;
  title: string;
  category: 'Virtual Compute' | 'Operating Systems' | 'Display & GPU' | 'AI & Neural' | 'Storage & I/O' | 'Networking';
  actionSummary: string;
  technicalFunction: string;
  operationalConsequence: string;
  keyboardShortcut?: string;
  statusIndicator: string;
}

