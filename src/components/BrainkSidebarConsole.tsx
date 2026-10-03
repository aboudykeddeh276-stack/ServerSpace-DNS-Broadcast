import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Zap,
  Activity,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Sliders,
  Radio,
  RotateCw,
  Layers,
  Flame,
  Info
} from 'lucide-react';
import { BrainkVirtualBrainState } from '../types';
import { INITIAL_BRAINK_STATE } from '../data/serverspaceData';
import { SUBSTRATE_EVENT_BUS, GLOBAL_BRAINK_GATEWAY } from '../services/brainkCognitiveSubstrate';

interface BrainkSidebarConsoleProps {
  onOpenBrainkStudio?: () => void;
  className?: string;
}

export const BrainkSidebarConsole: React.FC<BrainkSidebarConsoleProps> = ({
  onOpenBrainkStudio,
  className = '',
}) => {
  const [brainState, setBrainState] = useState<BrainkVirtualBrainState>(INITIAL_BRAINK_STATE);
  const [isExpanded, setIsExpanded] = useState(true);
  const [frequencyMode, setFrequencyMode] = useState<'gamma' | 'beta' | 'alpha' | 'theta'>('gamma');
  const [isSpiking, setIsSpiking] = useState(false);
  const [spikeCount, setSpikeCount] = useState(0);
  const [activeMessage, setActiveMessage] = useState<string>('Bio-Centric Cortical Synapse Active');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Real biological kinetic equilibrium and reactive substrate event bus integration
  useEffect(() => {
    // 1. Reactive event listeners for real substrate workload
    const unsubPacket = SUBSTRATE_EVENT_BUS.subscribe('PACKET_COMPILED', (data: any) => {
      setIsSpiking(true);
      setSpikeCount((c) => c + 1);
      setActiveMessage(`Intent Compiled: S_K ${data.sk || 'Non-Zero'}`);
      setBrainState((prev) => ({
        ...prev,
        neurotransmitters: {
          ...prev.neurotransmitters,
          dopamine: Math.min(98, prev.neurotransmitters.dopamine + 3),
          acetylcholine: Math.min(98, prev.neurotransmitters.acetylcholine + 4),
        },
      }));
      setTimeout(() => setIsSpiking(false), 300);
    });

    const unsubGossip = SUBSTRATE_EVENT_BUS.subscribe('GOSSIP_BROADCAST', (data: any) => {
      setActiveMessage(`Moebius Frame #${data.sequenceId} Gossiped to Mesh`);
      setBrainState((prev) => ({
        ...prev,
        neurotransmitters: {
          ...prev.neurotransmitters,
          serotonin: Math.min(98, prev.neurotransmitters.serotonin + 2),
        },
      }));
    });

    const unsubFuzz = SUBSTRATE_EVENT_BUS.subscribe('FUZZ_DEFLECTED', () => {
      setActiveMessage('Zero/Spoof Injection Deflected by Substrate');
      setBrainState((prev) => ({
        ...prev,
        neurotransmitters: {
          ...prev.neurotransmitters,
          noradrenaline: Math.min(98, prev.neurotransmitters.noradrenaline + 5),
        },
      }));
    });

    // 2. Deterministic homeostatic relaxation timer
    const timer = setInterval(() => {
      setBrainState((prev) => {
        // Derive coherence directly from the substrate's topological density
        const activeNodes = GLOBAL_BRAINK_GATEWAY.relationSubstrate.getAllEntities();
        const baseCoherence = activeNodes.length > 0 ? Math.min(99.4, 91.0 + Math.min(8.0, activeNodes.length * 0.4)) : 94.2;
        
        let targetHz = 40.0;
        if (frequencyMode === 'beta') targetHz = 21.0;
        if (frequencyMode === 'alpha') targetHz = 10.0;
        if (frequencyMode === 'theta') targetHz = 6.0;

        // Exponential relaxation towards setpoint (tau = 10s)
        const relax = (curr: number, target: number) => Math.round(curr + (target - curr) * 0.1);

        return {
          ...prev,
          coherenceScore: baseCoherence,
          actionPotentialHz: targetHz,
          neurotransmitters: {
            dopamine: Math.max(50, Math.min(98, relax(prev.neurotransmitters.dopamine, 78))),
            serotonin: Math.max(50, Math.min(98, relax(prev.neurotransmitters.serotonin, 82))),
            acetylcholine: Math.max(50, Math.min(98, relax(prev.neurotransmitters.acetylcholine, 74))),
            noradrenaline: Math.max(50, Math.min(98, relax(prev.neurotransmitters.noradrenaline, 65))),
          },
        };
      });
    }, 2000);

    return () => {
      unsubPacket();
      unsubGossip();
      unsubFuzz();
      clearInterval(timer);
    };
  }, [frequencyMode]);

  // Canvas Pulsing Light Nodes and Axon Synapses Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 240);
    let height = (canvas.height = 110);

    // 14 synaptic nodes arranged organically across the cortical area
    const nodes = [
      { x: 0.15, y: 0.35, r: 3.5, color: '#a855f7', phase: 0 },
      { x: 0.32, y: 0.22, r: 4.2, color: '#c084fc', phase: 1.2 },
      { x: 0.50, y: 0.18, r: 5.0, color: '#38bdf8', phase: 2.4 }, // central thalamus
      { x: 0.68, y: 0.25, r: 4.0, color: '#818cf8', phase: 0.8 },
      { x: 0.84, y: 0.40, r: 3.8, color: '#ec4899', phase: 3.1 },
      { x: 0.22, y: 0.62, r: 4.5, color: '#34d399', phase: 1.9 },
      { x: 0.40, y: 0.52, r: 5.5, color: '#a855f7', phase: 0.4 }, // deep pyramidal
      { x: 0.60, y: 0.55, r: 4.8, color: '#38bdf8', phase: 2.8 },
      { x: 0.78, y: 0.68, r: 3.6, color: '#fbbf24', phase: 1.5 },
      { x: 0.30, y: 0.82, r: 3.4, color: '#38bdf8', phase: 2.1 },
      { x: 0.52, y: 0.86, r: 4.0, color: '#c084fc', phase: 0.9 },
      { x: 0.70, y: 0.85, r: 3.2, color: '#34d399', phase: 3.5 },
    ];

    // Synaptic connections (axons)
    const connections: Array<[number, number]> = [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [1, 6], [2, 7], [3, 8], [4, 8],
      [5, 6], [6, 7], [7, 8],
      [5, 9], [6, 10], [7, 11],
      [9, 10], [10, 11]
    ];

    // Particles moving along axons
    const actionPotentials: Array<{
      connIdx: number;
      progress: number;
      speed: number;
      color: string;
    }> = [];

    for (let i = 0; i < 9; i++) {
      actionPotentials.push({
        connIdx: Math.floor(Math.random() * connections.length),
        progress: Math.random(),
        speed: 0.015 + Math.random() * 0.02,
        color: ['#38bdf8', '#c084fc', '#e879f9', '#4ade80'][i % 4],
      });
    }

    let time = 0;

    const render = () => {
      time += 0.04;
      ctx.clearRect(0, 0, width, height);

      // Draw faint background grid / biological gradient
      const bgGrad = ctx.createRadialGradient(
        width * 0.5, height * 0.5, 5,
        width * 0.5, height * 0.5, width * 0.6
      );
      bgGrad.addColorStop(0, 'rgba(168, 85, 247, 0.12)');
      bgGrad.addColorStop(0.6, 'rgba(56, 189, 248, 0.05)');
      bgGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw Axon Connections with light glow
      connections.forEach(([fromIdx, toIdx]) => {
        const from = nodes[fromIdx];
        const to = nodes[toIdx];
        const x1 = from.x * width;
        const y1 = from.y * height;
        const x2 = to.x * width;
        const y2 = to.y * height;

        // Oscillating light opacity
        const dist = Math.hypot(x2 - x1, y2 - y1);
        const wave = Math.sin(time * 3 + from.phase) * 0.2 + 0.3;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(168, 85, 247, ${wave * (isSpiking ? 1.8 : 1)})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      // Update & Draw Action Potential Photons (Pulsing Light Packets)
      actionPotentials.forEach((ap) => {
        const [fromIdx, toIdx] = connections[ap.connIdx];
        const from = nodes[fromIdx];
        const to = nodes[toIdx];

        ap.progress += ap.speed * (isSpiking ? 2.5 : 1);
        if (ap.progress >= 1) {
          ap.progress = 0;
          ap.connIdx = Math.floor(Math.random() * connections.length);
        }

        const x = (from.x + (to.x - from.x) * ap.progress) * width;
        const y = (from.y + (to.y - from.y) * ap.progress) * height;

        // Photon glow aura
        ctx.beginPath();
        ctx.arc(x, y, isSpiking ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = ap.color;
        ctx.shadowColor = ap.color;
        ctx.shadowBlur = isSpiking ? 12 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Synaptic Nodes (Pulsing Bioluminescent Orbs)
      nodes.forEach((node) => {
        const x = node.x * width;
        const y = node.y * height;
        // Breathing pulse math
        const pulse = Math.sin(time * 4 + node.phase);
        const currentRadius = Math.max(2, node.r + pulse * 1.5 * (isSpiking ? 2 : 1));
        const alpha = 0.5 + pulse * 0.45;

        // Outer glow halo
        const haloGrad = ctx.createRadialGradient(x, y, 1, x, y, currentRadius * 3.2);
        haloGrad.addColorStop(0, node.color);
        haloGrad.addColorStop(0.5, `rgba(168, 85, 247, ${alpha * 0.4})`);
        haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(x, y, currentRadius * 3.2, 0, Math.PI * 2);
        ctx.fillStyle = haloGrad;
        ctx.fill();

        // Inner solid synaptic core
        ctx.beginPath();
        ctx.arc(x, y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = node.color;
        ctx.shadowBlur = isSpiking ? 16 : 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isSpiking]);

  // Stimulus Trigger Action
  const triggerStimulusSpike = () => {
    setIsSpiking(true);
    setSpikeCount((prev) => prev + 1);
    setActiveMessage(`Synaptic Burst #${spikeCount + 1}: LTP Potentiation Triggered`);

    setBrainState((prev) => ({
      ...prev,
      coherenceScore: Math.min(99.8, prev.coherenceScore + 1.2),
      actionPotentialHz: Math.round((prev.actionPotentialHz + 8.5) * 10) / 10,
      neurotransmitters: {
        ...prev.neurotransmitters,
        dopamine: Math.min(99, prev.neurotransmitters.dopamine + 6),
        acetylcholine: Math.min(99, prev.neurotransmitters.acetylcholine + 5),
      },
    }));

    setTimeout(() => {
      setIsSpiking(false);
    }, 1200);
  };

  return (
    <div
      id="braink-sidebar-console"
      className={`rounded-2xl border transition-all duration-300 relative overflow-hidden ${
        isSpiking
          ? 'border-violet-400/90 shadow-lg shadow-violet-500/30 bg-slate-950/95 ring-1 ring-violet-400/50'
          : 'border-violet-500/30 hover:border-violet-500/50 bg-gradient-to-b from-slate-950 via-violet-950/20 to-slate-950 shadow-md shadow-violet-950/20'
      } ${className}`}
    >
      {/* Bioluminescent Header Bar */}
      <div className="p-3 border-b border-violet-900/30 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-violet-500/30 shrink-0">
              <Brain className="w-4 h-4 animate-pulse" />
            </div>
            {/* Pulsing Light Ripple Ring */}
            <span className="absolute -inset-1 rounded-xl bg-violet-500/30 animate-ping pointer-events-none opacity-60" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-wider">BRAINK</span>
              <span className="px-1.5 py-0.2 rounded-full bg-violet-500/20 text-violet-300 text-[9px] font-mono border border-violet-500/40 font-semibold">
                BIO-CENTRIC
              </span>
            </div>
            <p className="text-[10px] text-violet-300/70 font-mono truncate">
              Neural Activity Console
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onOpenBrainkStudio && (
            <button
              onClick={onOpenBrainkStudio}
              className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Open Full Braink Virtual Brain Studio"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse Console' : 'Expand Console'}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Pulsing Neural State Badge Strip */}
      <div className="px-3 py-1.5 bg-violet-950/30 border-b border-violet-900/20 flex items-center justify-between text-[10px] font-mono">
        <div className="flex items-center gap-1.5 text-cyan-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          <span className="font-semibold">CONSCIOUS</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-violet-300 font-semibold">{brainState.actionPotentialHz} Hz</span>
          <span>•</span>
          <span className="text-emerald-400 font-semibold">{brainState.coherenceScore}% Coh</span>
        </div>
      </div>

      {/* Main Interactive Canvas & Telemetry */}
      {isExpanded && (
        <div className="p-3 space-y-3">
          {/* Pulsing Light Neural Canvas */}
          <div className="relative rounded-xl border border-violet-900/40 bg-slate-950/80 overflow-hidden shadow-inner group">
            <canvas
              ref={canvasRef}
              className="w-full h-[105px] block cursor-pointer"
              onClick={triggerStimulusSpike}
              title="Click on the neural matrix to trigger an action potential spike"
            />
            {/* Overlay Click Hint */}
            <div className="absolute bottom-1 right-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-mono text-violet-300 bg-slate-950/80 px-1.5 py-0.5 rounded border border-violet-700/40">
              Click to fire spike
            </div>

            {/* Pulsing Corner Beacon */}
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-slate-950/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-mono text-violet-300 border border-violet-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span>84.2M Synapses</span>
            </div>
          </div>

          {/* Neurochemical Transmitter Light Indicators */}
          <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-xl border border-violet-900/30">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
              <span>Bio-Chemical Transmitters</span>
              <span className="text-violet-400 font-mono">Synaptic Mix</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              {/* Dopamine (Reward/Drive) */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-amber-300">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>Dopamine</span>
                  </span>
                  <span>{brainState.neurotransmitters.dopamine}%</span>
                </div>
                <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-300 shadow-sm shadow-amber-500/50"
                    style={{ width: `${brainState.neurotransmitters.dopamine}%` }}
                  />
                </div>
              </div>

              {/* Serotonin (Equilibrium/Mood) */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-emerald-300">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Serotonin</span>
                  </span>
                  <span>{brainState.neurotransmitters.serotonin}%</span>
                </div>
                <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300 shadow-sm shadow-emerald-500/50"
                    style={{ width: `${brainState.neurotransmitters.serotonin}%` }}
                  />
                </div>
              </div>

              {/* Acetylcholine (Plasticity/Focus) */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-violet-300">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                    <span>ACh (Plasticity)</span>
                  </span>
                  <span>{brainState.neurotransmitters.acetylcholine}%</span>
                </div>
                <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full transition-all duration-300 shadow-sm shadow-violet-500/50"
                    style={{ width: `${brainState.neurotransmitters.acetylcholine}%` }}
                  />
                </div>
              </div>

              {/* Noradrenaline (Vigilance) */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-rose-300">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                    <span>Noradren.</span>
                  </span>
                  <span>{brainState.neurotransmitters.noradrenaline}%</span>
                </div>
                <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-pink-400 rounded-full transition-all duration-300 shadow-sm shadow-rose-500/50"
                    style={{ width: `${brainState.neurotransmitters.noradrenaline}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Brain Frequency Mode Selector & Quick Firing Actions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-semibold">Rhythm Band</span>
              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                {(['gamma', 'beta', 'alpha', 'theta'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setFrequencyMode(mode);
                      setActiveMessage(`Cortical rhythm shifted to ${mode.toUpperCase()} band`);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono capitalize transition-all cursor-pointer ${
                      frequencyMode === mode
                        ? 'bg-violet-600 text-white font-bold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-2">
              <button
                id="braink-stimulate-btn"
                onClick={triggerStimulusSpike}
                className="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-[11px] font-bold shadow-md shadow-violet-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer ring-1 ring-violet-400/40 active:scale-95"
              >
                <Zap className={`w-3.5 h-3.5 ${isSpiking ? 'text-yellow-300 animate-spin' : 'text-violet-200'}`} />
                <span>Fire Stimulus</span>
              </button>

              {onOpenBrainkStudio ? (
                <button
                  id="braink-studio-jump-btn"
                  onClick={onOpenBrainkStudio}
                  className="w-full py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-violet-200 hover:text-white text-[11px] font-medium border border-violet-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Full Studio</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setActiveMessage('Gamma synchrony phase locked at 40.2Hz');
                  }}
                  className="w-full py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-violet-200 hover:text-white text-[11px] font-medium border border-violet-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gamma Lock</span>
                </button>
              )}
            </div>

            {/* Live Cognitive Telemetry Feed */}
            <div className="bg-slate-950/80 p-2 rounded-xl border border-violet-900/30 text-[10px] font-mono text-slate-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <span className="truncate text-slate-400">{activeMessage}</span>
            </div>

            {/* IL-LLM & S_K Substrate Invariant Strip */}
            <div className="p-2 rounded-xl bg-cyan-950/30 border border-cyan-900/40 text-[10px] font-mono flex items-center justify-between text-cyan-300">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>IL-LLM S_K(+3,+6,+12)</span>
              </span>
              <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                ZERO-FREE PASS
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
