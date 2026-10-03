import React, { useEffect, useRef, useState } from 'react';
import {
  Rotate3d,
  Compass,
  Eye,
  Maximize2,
  RefreshCw,
  Sparkles,
  Activity,
  Layers,
  Zap,
  Info,
  Sliders,
  Send,
  CheckCircle2,
  AlertOctagon,
  Binary
} from 'lucide-react';
import { evokeBrainkWasmKernel, WasmLatticeSnapshot } from '../../services/brainkKernel.wasm';
import { BrainkKernelTelemetry } from '../../types';
import { IsoContextBadge } from '../common/IsoContextInspector';

interface Node3D {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  centrality: number;
  color: string;
}

interface Edge3D {
  from: string;
  to: string;
  weight: number;
  isTransitive: boolean;
}

export const BrainkManifoldVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [telemetry, setTelemetry] = useState<BrainkKernelTelemetry>(
    evokeBrainkWasmKernel().getTelemetry()
  );
  const [latticeSnapshot, setLatticeSnapshot] = useState<WasmLatticeSnapshot>({
    edges: [],
    concepts: [],
    centrality: {}
  });

  const [selectedNode, setSelectedNode] = useState<Node3D | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Node3D | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [showZeroExclusionCore, setShowZeroExclusionCore] = useState<boolean>(true);
  const [showTransitiveArcs, setShowTransitiveArcs] = useState<boolean>(true);
  const [activeProjectionMode, setActiveProjectionMode] = useState<'MOEBIUS_TORUS' | 'SPHERICAL_MANIFOLD' | 'CENTRALITY_SPECTRUM'>('MOEBIUS_TORUS');

  // Interactive 3D Camera Angles
  const rotationRef = useRef({ x: 0.35, y: -0.65, zoom: 1.1 });
  const isDraggingRef = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Real-time animation pulses
  const pulsesRef = useRef<Array<{ fromX: number; fromY: number; fromZ: number; toX: number; toY: number; toZ: number; progress: number; speed: number; color: string }>>([]);

  // Subscribe to Wasm background worker updates
  useEffect(() => {
    const unsubTele = evokeBrainkWasmKernel().subscribeTelemetry(setTelemetry);
    const unsubLattice = evokeBrainkWasmKernel().subscribeLattice(setLatticeSnapshot);

    return () => {
      unsubTele();
      unsubLattice();
    };
  }, []);

  // Compute 3D node coordinates based on S_K calculus and selected projection
  const nodes3D: Node3D[] = React.useMemo(() => {
    const concepts = latticeSnapshot.concepts.length > 0
      ? latticeSnapshot.concepts
      : [
          'SOVEREIGN_NODE',
          'S_K_CALCULUS',
          'ZERO_FREE_INVARIANT',
          'BRAINK_REASONING',
          'DETERMINISTIC_PROOF',
          'HMAC_PROVENANCE',
          'CONTENT_VFS',
          'MOEBIUS_WIRE',
          'NEURAL_SUBSTRATE',
          'WASM_MICROKERNEL',
          'PERSISTENT_DAEMON'
        ];

    const N = concepts.length;
    const colors = [
      '#06b6d4', // cyan
      '#8b5cf6', // violet
      '#10b981', // emerald
      '#f59e0b', // amber
      '#ec4899', // pink
      '#3b82f6', // blue
      '#a855f7'  // purple
    ];

    return concepts.map((name, idx) => {
      const centrality = latticeSnapshot.centrality[name] ?? (0.15 + (idx % 5) * 0.08);
      const color = colors[idx % colors.length];

      let x = 0, y = 0, z = 0;

      if (activeProjectionMode === 'MOEBIUS_TORUS') {
        // Moebius strip parametric topology in 3D:
        // u in [0, 2*pi], v in [-1, 1]
        const u = (idx / N) * 2 * Math.PI;
        const v = Math.sin(idx * 1.7) * 0.55;
        const R = 1.35;
        x = (R + (v / 2) * Math.cos(u / 2)) * Math.cos(u);
        y = (R + (v / 2) * Math.cos(u / 2)) * Math.sin(u);
        z = (v / 2) * Math.sin(u / 2);
      } else if (activeProjectionMode === 'SPHERICAL_MANIFOLD') {
        // Fibonacci sphere distribution enforcing non-zero origin exclusion
        const phi = Math.acos(1 - (2 * (idx + 0.5)) / N);
        const theta = Math.PI * (1 + Math.sqrt(5)) * idx;
        const radius = 1.25 + centrality * 0.6;
        x = radius * Math.sin(phi) * Math.cos(theta);
        y = radius * Math.sin(phi) * Math.sin(theta);
        z = radius * Math.cos(phi);
      } else {
        // Centrality Spectrum: x = index, y = centrality, z = S_K magnitude
        const angle = (idx / N) * 2 * Math.PI;
        const dist = 0.5 + centrality * 1.4;
        x = dist * Math.cos(angle);
        y = (centrality - 0.2) * 2.2;
        z = dist * Math.sin(angle);
      }

      // Enforce mathematical non-zero invariant: distance from origin must be >= 0.35
      const originDist = Math.sqrt(x * x + y * y + z * z);
      if (originDist < 0.35) {
        x += 0.35;
        y += 0.35;
      }

      return {
        id: `node-${idx}`,
        name,
        x,
        y,
        z,
        centrality,
        color
      };
    });
  }, [latticeSnapshot, activeProjectionMode]);

  const nodeMap = React.useMemo(() => {
    const map = new Map<string, Node3D>();
    for (const node of nodes3D) {
      map.set(node.name, node);
    }
    return map;
  }, [nodes3D]);

  const edges3D: Edge3D[] = React.useMemo(() => {
    if (latticeSnapshot.edges.length > 0) {
      return latticeSnapshot.edges.map((e) => ({
        from: e.from,
        to: e.to,
        weight: e.weight,
        isTransitive: e.isTransitive ?? false
      }));
    }

    // Default fallback edges
    return [
      { from: 'SOVEREIGN_NODE', to: 'S_K_CALCULUS', weight: 0.98, isTransitive: false },
      { from: 'S_K_CALCULUS', to: 'ZERO_FREE_INVARIANT', weight: 1.0, isTransitive: false },
      { from: 'BRAINK_REASONING', to: 'DETERMINISTIC_PROOF', weight: 0.95, isTransitive: false },
      { from: 'DETERMINISTIC_PROOF', to: 'HMAC_PROVENANCE', weight: 0.96, isTransitive: false },
      { from: 'CONTENT_VFS', to: 'MOEBIUS_WIRE', weight: 0.92, isTransitive: false },
      { from: 'NEURAL_SUBSTRATE', to: 'WASM_MICROKERNEL', weight: 0.99, isTransitive: false },
      { from: 'WASM_MICROKERNEL', to: 'PERSISTENT_DAEMON', weight: 0.97, isTransitive: false },
      { from: 'SOVEREIGN_NODE', to: 'ZERO_FREE_INVARIANT', weight: 0.95, isTransitive: true },
      { from: 'BRAINK_REASONING', to: 'HMAC_PROVENANCE', weight: 0.91, isTransitive: true }
    ];
  }, [latticeSnapshot]);

  // Main 3D Rendering Loop on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.parentElement.clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const project3D = (x: number, y: number, z: number, width: number, height: number) => {
      const rot = rotationRef.current;
      // Rotate around Y axis
      const cosY = Math.cos(rot.y);
      const sinY = Math.sin(rot.y);
      const x1 = x * cosY + z * sinY;
      const y1 = y;
      const z1 = -x * sinY + z * cosY;

      // Rotate around X axis
      const cosX = Math.cos(rot.x);
      const sinX = Math.sin(rot.x);
      const x2 = x1;
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;

      // Perspective projection
      const cameraDistance = 3.6;
      const fov = 380 * rot.zoom;
      const depth = cameraDistance + z2;
      const scale = fov / Math.max(0.2, depth);

      const screenX = width / 2 + x2 * scale;
      const screenY = height / 2 + y2 * scale;

      return { x: screenX, y: screenY, depth, scale };
    };

    const render = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, width, height);

      // Background subtle grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = -width; i < width * 2; i += 40) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
      }
      for (let j = -height; j < height * 2; j += 40) {
        ctx.moveTo(0, j);
        ctx.lineTo(width, j);
      }
      ctx.stroke();

      if (autoRotate && !isDraggingRef.current) {
        rotationRef.current.y += 0.004;
      }

      // 1. Draw Zero-Exclusion Singularity Core (Red Forbidden Sphere at [0,0,0])
      if (showZeroExclusionCore) {
        const core = project3D(0, 0, 0, width, height);
        const grad = ctx.createRadialGradient(core.x, core.y, 2, core.x, core.y, 24 * core.scale * 0.05);
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.7)');
        grad.addColorStop(0.6, 'rgba(239, 68, 68, 0.25)');
        grad.addColorStop(1, 'rgba(239, 68, 68, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(core.x, core.y, 24 * core.scale * 0.05, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.arc(core.x, core.y, 14 * core.scale * 0.05, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = '9px monospace';
        ctx.fillStyle = 'rgba(248, 113, 113, 0.7)';
        ctx.fillText('FORBIDDEN (S_K = [0,0,0])', core.x + 12, core.y - 6);
      }

      // 2. Draw Parametric Moebius / Coordinate Wireframe Grid
      if (activeProjectionMode === 'MOEBIUS_TORUS') {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
        ctx.lineWidth = 0.8;
        const steps = 36;
        for (let vStep = -1; vStep <= 1; vStep += 0.5) {
          ctx.beginPath();
          for (let s = 0; s <= steps; s++) {
            const u = (s / steps) * 2 * Math.PI;
            const v = vStep * 0.5;
            const R = 1.35;
            const mx = (R + (v / 2) * Math.cos(u / 2)) * Math.cos(u);
            const my = (R + (v / 2) * Math.cos(u / 2)) * Math.sin(u);
            const mz = (v / 2) * Math.sin(u / 2);
            const pt = project3D(mx, my, mz, width, height);
            if (s === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          }
          ctx.stroke();
        }
      }

      // 3. Draw Edges and Semiring Transitive Arcs
      for (const edge of edges3D) {
        if (!showTransitiveArcs && edge.isTransitive) continue;

        const nodeA = nodeMap.get(edge.from);
        const nodeB = nodeMap.get(edge.to);
        if (!nodeA || !nodeB) continue;

        const pA = project3D(nodeA.x, nodeA.y, nodeA.z, width, height);
        const pB = project3D(nodeB.x, nodeB.y, nodeB.z, width, height);

        ctx.lineWidth = edge.isTransitive ? 1 : Math.max(1, edge.weight * 2.8);
        if (edge.isTransitive) {
          ctx.strokeStyle = `rgba(139, 92, 246, ${Math.min(0.7, edge.weight * 0.75)})`;
          ctx.setLineDash([4, 4]);
        } else {
          ctx.strokeStyle = `rgba(6, 182, 212, ${Math.min(0.85, edge.weight * 0.9)})`;
          ctx.setLineDash([]);
        }

        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        // Quadratic arc curve for depth visual
        const midX = (nodeA.x + nodeB.x) / 2;
        const midY = (nodeA.y + nodeB.y) / 2 + (edge.isTransitive ? 0.35 : 0.1);
        const midZ = (nodeA.z + nodeB.z) / 2;
        const pMid = project3D(midX, midY, midZ, width, height);
        ctx.quadraticCurveTo(pMid.x, pMid.y, pB.x, pB.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 4. Update and Draw 168-Byte Moebius Wire Packet Impulses
      if (Math.random() < 0.12 && edges3D.length > 0) {
        const randomEdge = edges3D[Math.floor(Math.random() * edges3D.length)];
        const nA = nodeMap.get(randomEdge.from);
        const nB = nodeMap.get(randomEdge.to);
        if (nA && nB) {
          pulsesRef.current.push({
            fromX: nA.x,
            fromY: nA.y,
            fromZ: nA.z,
            toX: nB.x,
            toY: nB.y,
            toZ: nB.z,
            progress: 0,
            speed: 0.025 + Math.random() * 0.025,
            color: randomEdge.isTransitive ? '#a855f7' : '#06b6d4'
          });
        }
      }

      pulsesRef.current = pulsesRef.current.filter((p) => {
        p.progress += p.speed;
        const currX = p.fromX + (p.toX - p.fromX) * p.progress;
        const currY = p.fromY + (p.toY - p.fromY) * p.progress;
        const currZ = p.fromZ + (p.toZ - p.fromZ) * p.progress;
        const screenPt = project3D(currX, currY, currZ, width, height);

        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(screenPt.x, screenPt.y, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        return p.progress < 1.0;
      });

      // 5. Draw 3D Nodes (Sorted by Depth)
      const projectedNodes = nodes3D.map((node) => {
        const pt = project3D(node.x, node.y, node.z, width, height);
        return { node, pt };
      });

      projectedNodes.sort((a, b) => b.pt.depth - a.pt.depth);

      for (const { node, pt } of projectedNodes) {
        const isHovered = hoveredNode?.id === node.id;
        const isSelected = selectedNode?.id === node.id;
        const radius = Math.max(3.5, (4 + node.centrality * 14) * (pt.scale / 120));

        // Outer glow
        const glowRadius = radius * (isHovered || isSelected ? 2.8 : 1.8);
        const glowGrad = ctx.createRadialGradient(pt.x, pt.y, radius * 0.3, pt.x, pt.y, glowRadius);
        glowGrad.addColorStop(0, node.color + 'aa');
        glowGrad.addColorStop(1, node.color + '00');

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Solid Core
        ctx.fillStyle = isSelected ? '#ffffff' : node.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Active Ring
        ctx.strokeStyle = isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius + 2, 0, Math.PI * 2);
        ctx.stroke();

        // Label
        ctx.font = `${isHovered || isSelected ? 'bold 11px' : '9px'} monospace`;
        ctx.fillStyle = isSelected ? '#38bdf8' : '#e2e8f0';
        ctx.fillText(node.name, pt.x + radius + 4, pt.y + 3);

        if (isHovered || isSelected) {
          ctx.font = '8px monospace';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(`c: ${node.centrality.toFixed(3)} | S_K`, pt.x + radius + 4, pt.y + 13);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [nodes3D, edges3D, nodeMap, autoRotate, showZeroExclusionCore, showTransitiveArcs, activeProjectionMode, hoveredNode, selectedNode]);

  // Mouse drag interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDraggingRef.current) {
      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;
      rotationRef.current.y += deltaX * 0.008;
      rotationRef.current.x += deltaY * 0.008;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    } else {
      // Hit testing for hover
      const width = rect.width;
      const height = rect.height;
      let hitNode: Node3D | null = null;

      for (const node of nodes3D) {
        // Project node to screen
        const rot = rotationRef.current;
        const cosY = Math.cos(rot.y);
        const sinY = Math.sin(rot.y);
        const x1 = node.x * cosY + node.z * sinY;
        const y1 = node.y;
        const z1 = -node.x * sinY + node.z * cosY;

        const cosX = Math.cos(rot.x);
        const sinX = Math.sin(rot.x);
        const x2 = x1;
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;

        const depth = 3.6 + z2;
        const scale = (380 * rot.zoom) / Math.max(0.2, depth);
        const sx = width / 2 + x2 * scale;
        const sy = height / 2 + y2 * scale;

        const dist = Math.hypot(mouseX - sx, mouseY - sy);
        if (dist < 14) {
          hitNode = node;
          break;
        }
      }

      setHoveredNode(hitNode);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.08 : 0.08;
    rotationRef.current.zoom = Math.max(0.4, Math.min(2.5, rotationRef.current.zoom + zoomDelta));
  };

  const handleInjectPulse = () => {
    evokeBrainkWasmKernel().evokeProjectSKManifold('TOPOLOGICAL_MANIFOLD_SENSORY_STIMULUS', 'symbolic');
  };

  const handleRunClosure = () => {
    evokeBrainkWasmKernel().evokeMatrixSnapshot();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Spatial Invariant Topology
              </span>
              <IsoContextBadge conceptId="S_K_COORDINATE" label="Zero-Free Calculus" />
              <IsoContextBadge conceptId="MOEBIUS_WIRE_PACKET" label="Moebius Manifold" />
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                40Hz Wasm Gamma Engine
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Rotate3d className="w-5 h-5 text-cyan-400" />
              <span>Zeroless S_K Moebius Manifold &amp; Transitive Semiring Visualizer</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Interactive 3D projection of the 64-node relational lattice and non-zero manifold invariant. Concept nodes scale dynamically by <strong>Wasm Eigenvector Centrality</strong> (offset <code>0x8000</code>), while edges render active max-product semiring paths without UI thread contention.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleInjectPulse}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Inject Stimulus Pulse</span>
            </button>
            <button
              type="button"
              onClick={handleRunClosure}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Wasm Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 3D Canvas Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3D Canvas Container (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col h-[560px]">
          {/* Canvas Toolbar Controls */}
          <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 z-10">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-300">Topology:</span>
              <button
                type="button"
                onClick={() => setActiveProjectionMode('MOEBIUS_TORUS')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono cursor-pointer transition-all ${
                  activeProjectionMode === 'MOEBIUS_TORUS'
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Moebius Torus
              </button>
              <button
                type="button"
                onClick={() => setActiveProjectionMode('SPHERICAL_MANIFOLD')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono cursor-pointer transition-all ${
                  activeProjectionMode === 'SPHERICAL_MANIFOLD'
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Spherical Manifold
              </button>
              <button
                type="button"
                onClick={() => setActiveProjectionMode('CENTRALITY_SPECTRUM')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono cursor-pointer transition-all ${
                  activeProjectionMode === 'CENTRALITY_SPECTRUM'
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Centrality Spectrum
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRotate}
                  onChange={(e) => setAutoRotate(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-600 focus:ring-0"
                />
                <span>Auto-Spin</span>
              </label>

              <label className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showZeroExclusionCore}
                  onChange={(e) => setShowZeroExclusionCore(e.target.checked)}
                  className="rounded border-slate-700 text-rose-600 focus:ring-0"
                />
                <span>Zero Core</span>
              </label>

              <label className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTransitiveArcs}
                  onChange={(e) => setShowTransitiveArcs(e.target.checked)}
                  className="rounded border-slate-700 text-violet-600 focus:ring-0"
                />
                <span>Transitive Arcs</span>
              </label>
            </div>
          </div>

          {/* Canvas Element */}
          <div
            ref={containerRef}
            className="flex-1 relative cursor-grab active:cursor-grabbing w-full h-full"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* Overlay Telemetry HUD */}
            <div className="absolute left-3 bottom-3 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 text-[10px] font-mono space-y-1 pointer-events-none">
              <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>WASM LINEAR MEMORY METRIC</span>
              </div>
              <div className="text-slate-300">Active Nodes: {nodes3D.length} / 64 max</div>
              <div className="text-slate-300">Matrix Offsets: 0x0000..0x3FFF (Weights)</div>
              <div className="text-slate-300">Centrality Offsets: 0x8000..0x80FF</div>
              <div className="text-emerald-400">Throughput: {telemetry.throughputOpsPerSec} ops/sec</div>
            </div>

            {/* Instruction Badge */}
            <div className="absolute right-3 bottom-3 bg-slate-900/70 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-mono text-slate-400 pointer-events-none">
              Drag to Rotate • Scroll to Zoom • Hover Node to Inspect
            </div>
          </div>
        </div>

        {/* Right Column: Node Inspector & Mathematical Rigor (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Node Inspector Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">Attractor Inspector</h4>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                TOPOLOGICAL NODE
              </span>
            </div>

            {hoveredNode || selectedNode ? (
              (() => {
                const n = hoveredNode || selectedNode!;
                return (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="text-[10px] font-mono text-slate-500">CONCEPT IDENTIFIER</div>
                      <div className="font-bold text-cyan-300 text-sm font-mono break-all">{n.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Eigenvector Centrality: <span className="text-amber-400 font-bold">{n.centrality.toFixed(4)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 block">S_K_X</span>
                        <span className="text-slate-200 font-bold">{n.x.toFixed(2)}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 block">S_K_Y</span>
                        <span className="text-slate-200 font-bold">{n.y.toFixed(2)}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 block">S_K_Z</span>
                        <span className="text-slate-200 font-bold">{n.z.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-900/40 text-[11px] text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Invariant Valid: Origin distance = {Math.hypot(n.x, n.y, n.z).toFixed(2)} &gt; 0</span>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 font-mono">
                Hover over or click any 3D node attractor on the canvas to inspect its mathematical coordinates and Wasm linear memory offset.
              </div>
            )}
          </div>

          {/* Mathematical Formulation Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Binary className="w-4 h-4 text-violet-400" />
                <h4 className="text-sm font-bold text-white">Mathematical Invariants</h4>
              </div>
              <span className="text-[10px] font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                S_K CALC
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
                <span className="text-cyan-400 font-bold block">1. Zero-Free Domain:</span>
                <p className="text-slate-400 text-[10px]">
                  S_K = [s_x, s_y, s_z] ∈ ℤ³ \ {'{[0,0,0]}'}. The red origin sphere represents a forbidden singularity.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
                <span className="text-violet-400 font-bold block">2. Max-Product Semiring:</span>
                <p className="text-slate-400 text-[10px]">
                  w(A → C) = max_B [ w(A → B) · w(B → C) ]. Transitive arcs are shown as purple dashed curves.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
                <span className="text-amber-400 font-bold block">3. Power Iteration Centrality:</span>
                <p className="text-slate-400 text-[10px]">
                  x^(k+1) = (A · x^k) / ||A · x^k||. Visual attractor radius directly mirrors node centrality score.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
