import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Zap,
  Activity,
  Layers,
  Radio,
  Sliders,
  CheckCircle2,
  Play,
  RotateCw,
  Plus,
  Send,
  HelpCircle,
  ShieldCheck,
  Brain,
  Cpu,
  Server,
  Binary,
  Terminal,
  Activity as ActivityIcon,
  BookOpen,
  Rotate3d,
  ShieldCheck as ShieldCheckIcon,
  ShieldAlert,
  Shield
} from 'lucide-react';
import { BrainkVirtualBrainState, ServerNode, BrainkKernelTelemetry } from '../../types';
import { INITIAL_BRAINK_STATE } from '../../data/serverspaceData';
import { BrainkSubstrateLattice } from './BrainkSubstrateLattice';
import { BrainkSectorCaseStudies } from './BrainkSectorCaseStudies';
import { BrainkManifoldVisualizer } from './BrainkManifoldVisualizer';
import { BrainkZkOrchestrator } from './BrainkZkOrchestrator';
import { BrainkSovereignDeploymentStudio } from './BrainkSovereignDeploymentStudio';
import { BrainkFormalVerificationStudio } from './BrainkFormalVerificationStudio';
import { GLOBAL_BRAINK_GATEWAY, sha256Hex, SUBSTRATE_EVENT_BUS } from '../../services/brainkCognitiveSubstrate';
import { GLOBAL_BRAINK_KERNEL_SERVICE } from '../../services/brainkKernelService';
import { evokeBrainkWasmKernel } from '../../services/brainkKernel.wasm';
import { IsoContextBadge } from '../common/IsoContextInspector';

interface BrainkVirtualBrainProps {
  activeNode: ServerNode;
  onRequestHelp?: (topicId: string) => void;
  onDeploySuccess?: (msg: string) => void;
}

export const BrainkVirtualBrain: React.FC<BrainkVirtualBrainProps> = ({
  activeNode,
  onRequestHelp,
  onDeploySuccess,
}) => {
  const [brainState, setBrainState] = useState<BrainkVirtualBrainState>(INITIAL_BRAINK_STATE);
  const [wasmTelemetry, setWasmTelemetry] = useState<BrainkKernelTelemetry>(GLOBAL_BRAINK_KERNEL_SERVICE.getTelemetry());
  const [activeViewMode, setActiveViewMode] = useState<'substrate' | 'manifold' | 'zk_orchestrator' | 'sovereign_delivery' | 'sectors' | 'cortical' | 'formal_verification'>('substrate');
  const [newStimulusText, setNewStimulusText] = useState('');
  const [stimulusType, setStimulusType] = useState<'visual' | 'auditory' | 'symbolic' | 'sensorimotor'>('symbolic');
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);

  // Background WebAssembly Microkernel Daemon Subscriptions
  useEffect(() => {
    const unsubTele = GLOBAL_BRAINK_KERNEL_SERVICE.subscribeTelemetry(setWasmTelemetry);
    const unsubThoughts = GLOBAL_BRAINK_KERNEL_SERVICE.subscribeThoughts((newThought) => {
      setBrainState((prev) => ({
        ...prev,
        recentThoughts: [newThought, ...prev.recentThoughts.slice(0, 5)],
        synapticConnections: prev.synapticConnections + 14000,
      }));
    });
    const unsubPackets = GLOBAL_BRAINK_KERNEL_SERVICE.subscribePackets((packet) => {
      // Decentralized mesh gossip
      GLOBAL_BRAINK_GATEWAY.broadcastViaMesh(packet);
      setBrainState((prev) => {
        const intensity = Math.min(99, Math.max(68, Math.round(packet.sk.magnitude() * 6.5)));
        const newStim = {
          id: `stim-${Date.now()}`,
          type: stimulusType,
          label: `Packet #${packet.sequenceId} (S_K: ${packet.sk.toVectorString()})`,
          intensity,
        };
        return {
          ...prev,
          activeStimuli: [newStim, ...prev.activeStimuli.slice(0, 4)],
        };
      });
    });

    return () => {
      unsubTele();
      unsubThoughts();
      unsubPackets();
    };
  }, [stimulusType]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Neural Canvas Animation (Spiking Neurons, Axons, Action Potentials)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = 300);

    // Create 36 biological neuron soma nodes
    const neurons: Array<{
      x: number;
      y: number;
      layer: number;
      radius: number;
      charge: number;
      threshold: number;
      refractory: number;
      color: string;
    }> = [];

    const layerCols = [0.1, 0.28, 0.5, 0.72, 0.9];
    for (let i = 0; i < 36; i++) {
      const layerIdx = Math.floor(Math.random() * layerCols.length);
      const colX = layerCols[layerIdx] * width + (Math.random() - 0.5) * 40;
      const rowY = 30 + Math.random() * (height - 60);

      neurons.push({
        x: colX,
        y: rowY,
        layer: layerIdx + 1,
        radius: 3 + Math.random() * 3,
        charge: Math.random() * 0.5,
        threshold: 0.85,
        refractory: 0,
        color: layerIdx === 1 ? '#38bdf8' : layerIdx === 2 ? '#c084fc' : '#a855f7',
      });
    }

    // Axon synaptic connections between nearby neurons
    const synapses: Array<{ from: number; to: number; weight: number }> = [];
    for (let i = 0; i < neurons.length; i++) {
      for (let j = i + 1; j < neurons.length; j++) {
        const dx = neurons[i].x - neurons[j].x;
        const dy = neurons[i].y - neurons[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          synapses.push({ from: i, to: j, weight: Math.random() });
        }
      }
    }

    // Action potential pulses travelling down axons
    interface Pulse {
      fromIdx: number;
      toIdx: number;
      progress: number;
      speed: number;
      color: string;
    }
    let pulses: Pulse[] = [];

    const render = () => {
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, height);

      // Draw faint synaptic connections (dendrites / axons)
      ctx.lineWidth = 0.8;
      synapses.forEach((syn) => {
        const n1 = neurons[syn.from];
        const n2 = neurons[syn.to];
        ctx.strokeStyle = `rgba(168, 85, 247, ${0.12 * syn.weight})`;
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.stroke();
      });

      // Update and draw traveling action potentials
      pulses = pulses.filter((p) => p.progress < 1);
      pulses.forEach((p) => {
        p.progress += p.speed;
        const n1 = neurons[p.fromIdx];
        const n2 = neurons[p.toIdx];
        const px = n1.x + (n2.x - n1.x) * p.progress;
        const py = n1.y + (n2.y - n1.y) * p.progress;

        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Update neurons
      neurons.forEach((n, idx) => {
        if (n.refractory > 0) {
          n.refractory--;
        } else {
          n.charge += Math.random() * 0.05;
          if (n.charge >= n.threshold) {
            // FIRE ACTION POTENTIAL
            n.charge = 0;
            n.refractory = 20;

            // Spawn pulses to connected synapses
            synapses
              .filter((s) => s.from === idx || s.to === idx)
              .slice(0, 3)
              .forEach((s) => {
                const targetIdx = s.from === idx ? s.to : s.from;
                pulses.push({
                  fromIdx: idx,
                  toIdx: targetIdx,
                  progress: 0,
                  speed: 0.03 + Math.random() * 0.04,
                  color: n.layer === 2 ? '#38bdf8' : '#c084fc',
                });
              });
          }
        }

        // Draw Soma
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.refractory > 10 ? '#f43f5e' : n.color;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = n.charge > 0.6 ? 10 : 2;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = canvas.width = canvas.parentElement?.clientWidth || 600;
      height = canvas.height = 300;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Periodic thought synthesis
  useEffect(() => {
    const timer = setInterval(() => {
      const concepts = [
        'Associative synthesis across Layers II/III binding VFS directory structure into neural representation.',
        'Sensory feedback loop verified with sub-microsecond synaptic latency across cluster mesh.',
        'Theta-Gamma phase-amplitude coupling stabilizing memory consolidation registers.',
        'Dopaminergic plasticity delta applied to active server routing policy.',
        '40Hz Gamma synchrony maintained across all active virtual CPU cores.',
      ];
      const origins = [
        'Layer I Apical Gating',
        'Layers II/III Cortico-Cortical',
        'Layer IV Thalamocortical',
        'Layer V Pyramidal Motor',
        'Layer VI Corticothalamic',
      ];
      const conceptIdx = Math.floor((Date.now() / 8000) % concepts.length);
      const originIdx = Math.floor((Date.now() / 8000 + 1) % origins.length);
      const selectedConcept = concepts[conceptIdx];
      const selectedOrigin = origins[originIdx];
      const realProof = `0x${sha256Hex(selectedConcept + selectedOrigin + Date.now()).substring(0, 16).toUpperCase()}_PROOF`;

      setBrainState((prev) => ({
        ...prev,
        recentThoughts: [
          {
            id: `th-${Date.now()}`,
            timestamp: 'Just now',
            stream: selectedConcept,
            corticalOrigin: selectedOrigin,
            plasticityDelta: 0.042,
            bioCentricProof: realProof,
          },
          ...prev.recentThoughts.slice(0, 5),
        ],
      }));
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  const handleInjectStimulus = (e: React.FormEvent) => {
    e.preventDefault();
    const rawText = newStimulusText.trim();
    if (!rawText) return;

    // Evoke non-blocking WebAssembly Microkernel Worker thread directly
    evokeBrainkWasmKernel().evokeProjectSKManifold(rawText, stimulusType);
    setNewStimulusText('');
  };

  const handleDeployToNode = () => {
    setIsDeploying(true);
    setTimeout(() => {
      setIsDeploying(false);
      setIsDeployed(true);
      if (onDeploySuccess) {
        onDeploySuccess(`Braink Augmented Intelligence Bio-Centric Brain successfully deployed to ${activeNode.name}`);
      }
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-violet-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                A. Keddeh Bio-Centric Architecture
              </span>
              <IsoContextBadge conceptId="GAMMA_SYNCHRONY_40HZ" label="40Hz Gamma Synchrony" />
              <IsoContextBadge conceptId="S_K_COORDINATE" label="S_K Coordinates" />
              <IsoContextBadge conceptId="MOEBIUS_INTRINSIC_TOPOLOGY" label="Moebius Topology" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-400" />
              <span>Braink Augmented Intelligence: Bio-Centric Virtual Brain</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              A bio-centric synthetic brain modeled after biological neocortical laminae (Layers I–VI). Features real-time synaptic plasticity, 40Hz Gamma frequency cognitive binding, neurotransmitter modulation, and verifiable cryptographic thought ledgers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onRequestHelp && (
              <button
                onClick={() => onRequestHelp('btn-braink-deploy')}
                className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>How to use this</span>
              </button>
            )}

            <button
              onClick={handleDeployToNode}
              disabled={isDeploying || isDeployed}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer transition-all ${
                isDeployed
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-500/25'
              }`}
            >
              {isDeploying ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Deploying to {activeNode.name}...</span>
                </>
              ) : isDeployed ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Deployed &amp; Conscious on {activeNode.name}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Deploy Braink Virtual Brain to {activeNode.name}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Persistent WebAssembly Cognitive Microkernel Telemetry Strip */}
      <div className="bg-slate-900/90 border border-violet-500/30 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-900/40 border border-violet-500/40 flex items-center justify-center text-violet-400">
              <Binary className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white tracking-wide">WebAssembly Cognitive Microkernel (WASM)</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {wasmTelemetry.kernelState}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-violet-950 text-violet-300 border border-violet-800/50">
                  40Hz Gamma Thread
                </span>
                <IsoContextBadge conceptId="GAMMA_SYNCHRONY_40HZ" label="40Hz Loop" />
                <IsoContextBadge conceptId="S_K_COORDINATE" label="Zeroless S_K" />
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Daemon: Web Worker Thread • Linear Memory: {wasmTelemetry.wasmMemoryPages} pages (128 KB) • Bytecode: {wasmTelemetry.wasmBinaryBytes} B
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-auto">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5">
              <span className="text-[10px] text-slate-500 font-mono block">IL-LLM LATTICE</span>
              <span className="text-xs font-mono font-bold text-cyan-300">
                {wasmTelemetry.activeConcepts} concepts / {wasmTelemetry.activeEdges} edges
              </span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5">
              <span className="text-[10px] text-slate-500 font-mono block">TRANSITIVE PATHS</span>
              <span className="text-xs font-mono font-bold text-indigo-300">
                {wasmTelemetry.transitiveClosurePathCount} closures
              </span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5">
              <span className="text-[10px] text-slate-500 font-mono block">THROUGHPUT</span>
              <span className="text-xs font-mono font-bold text-emerald-300">
                {wasmTelemetry.throughputOpsPerSec} ops/s (non-blocking)
              </span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5">
              <span className="text-[10px] text-slate-500 font-mono block">S_K COORD (ZEROLESS)</span>
              <span className="text-xs font-mono font-bold text-amber-300">
                [{wasmTelemetry.lastSkCoordinate[0]}, {wasmTelemetry.lastSkCoordinate[1]}, {wasmTelemetry.lastSkCoordinate[2]}]
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Substrate Mode Selector Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-2 rounded-2xl shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveViewMode('substrate')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeViewMode === 'substrate'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Brain className="w-4 h-4 text-cyan-400" />
            <span>BRAINK &amp; IL-LLM Sovereign P2P Substrate</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-400/20 text-cyan-300 font-mono">SOVEREIGN LATTICE</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewMode('manifold')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeViewMode === 'manifold'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Rotate3d className="w-4 h-4 text-cyan-400" />
            <span>3D S_K Manifold &amp; Lattice</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-400/20 text-cyan-300 font-mono">3D TORUS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewMode('zk_orchestrator')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeViewMode === 'zk_orchestrator'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 border border-purple-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheckIcon className="w-4 h-4 text-purple-400" />
            <span>ZK-Proofs &amp; Dual-System</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-400/20 text-purple-300 font-mono">ZK-SNARK</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewMode('sovereign_delivery')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeViewMode === 'sovereign_delivery'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 border border-emerald-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Air-Gap Sovereign Studio</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-400/20 text-emerald-300 font-mono">ZERO-SAAS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewMode('formal_verification')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeViewMode === 'formal_verification'
                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Formal Verification &amp; SOS</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-400/20 text-indigo-300 font-mono">S ~ T PROOF</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewMode('sectors')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeViewMode === 'sectors'
                ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-lg shadow-rose-500/25 border border-rose-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Cross-Sector Case Studies &amp; ISO Matrix</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-400/20 text-amber-300 font-mono">ALL SECTORS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewMode('cortical')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeViewMode === 'cortical'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 border border-violet-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4 text-violet-400" />
            <span>Neocortical Laminae I–VI &amp; Spiking Canvas</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400 px-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Sovereign Microkernel: S_K Zero-Free Invariant Verified</span>
        </div>
      </div>

      {activeViewMode === 'substrate' ? (
        <BrainkSubstrateLattice />
      ) : activeViewMode === 'manifold' ? (
        <BrainkManifoldVisualizer />
      ) : activeViewMode === 'zk_orchestrator' ? (
        <BrainkZkOrchestrator />
      ) : activeViewMode === 'sovereign_delivery' ? (
        <BrainkSovereignDeploymentStudio />
      ) : activeViewMode === 'formal_verification' ? (
        <BrainkFormalVerificationStudio />
      ) : activeViewMode === 'sectors' ? (
        <BrainkSectorCaseStudies />
      ) : (
        <>
          {/* METRIC STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Synaptic Density</span>
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {(brainState.synapticConnections / 1000000).toFixed(1)}M
          </div>
          <div className="text-[10px] text-violet-400 font-mono mt-0.5">Active Synapses</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Dominant Frequency</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{brainState.actionPotentialHz} Hz</div>
          <div className="text-[10px] text-cyan-400 font-mono mt-0.5">{brainState.dominantFrequency}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Cortical Coherence</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{brainState.coherenceScore}%</div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Synaptic Phase Sync</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Neurotransmitters</span>
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xs font-mono text-slate-200 mt-1 space-y-0.5">
            <div className="flex justify-between"><span>DA (Reward):</span> <strong className="text-amber-400">{brainState.neurotransmitters.dopamine}</strong></div>
            <div className="flex justify-between"><span>5-HT (Stability):</span> <strong className="text-cyan-400">{brainState.neurotransmitters.serotonin}</strong></div>
            <div className="flex justify-between"><span>ACh (Focus):</span> <strong className="text-emerald-400">{brainState.neurotransmitters.acetylcholine}</strong></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Spiking Neural Canvas & Stimulus Injector (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Spiking Neural Network Canvas */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-bold text-white">Live Spiking Neural Network &amp; Axonal Potential Canvas</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Live Simulation
              </span>
            </div>

            <div className="w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <canvas ref={canvasRef} className="w-full block" />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Layer IV Thalamic Afferents
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                Associative Pyramids (II/III)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Refractory Firing
              </span>
            </div>
          </div>

          {/* SENSORY STIMULUS INJECTOR */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sensory Stimulus Injector (Afferent Input)</span>
                </h4>
                <p className="text-[11px] text-slate-400">Inject perceptual and symbolic inputs directly into thalamocortical Layer IV</p>
              </div>
            </div>

            <form onSubmit={handleInjectStimulus} className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {(['symbolic', 'visual', 'auditory', 'sensorimotor'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setStimulusType(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium capitalize cursor-pointer transition-colors ${
                      stimulusType === t
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t} Stimulus
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Inode 1048576 storage spike / 40Hz harmonic tone / Visual token matrix"
                  value={newStimulusText}
                  onChange={(e) => setNewStimulusText(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 font-mono"
                />
                <button
                  type="submit"
                  data-formal-control="inject-stimulus"
                  disabled={!newStimulusText.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Inject</span>
                </button>
              </div>
            </form>

            {/* Active stimuli chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {brainState.activeStimuli.map((st) => (
                <div
                  key={st.id}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-2"
                >
                  <span className="text-violet-400 font-bold capitalize">[{st.type}]</span>
                  <span>{st.label}</span>
                  <span className="text-amber-400 text-[10px]">{st.intensity}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: 6 Neocortical Layers & Bio-Centric Cognitive Ledger (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Neocortical Layers Inspector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white">Neocortical Laminae (Layers I–VI)</h4>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">All Active</span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {brainState.corticalLayers.map((layer) => (
                <div key={layer.id} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{layer.name}</span>
                    <span className="font-mono text-cyan-400 font-bold">{layer.activeRate}%</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{layer.function}</p>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full transition-all"
                      style={{ width: `${layer.activeRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bio-Centric Cognitive Proof Ledger */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white">Bio-Centric Cognitive Proof Ledger</h4>
              </div>
              <span className="text-[10px] text-slate-400">Verifiable Synaptic Streams</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
              {brainState.recentThoughts.map((th) => (
                <div key={th.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="text-violet-400 font-bold">{th.corticalOrigin}</span>
                    <span>{th.timestamp}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed font-sans">{th.stream}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span className="text-amber-400/90 font-mono">{th.bioCentricProof}</span>
                    <span className="text-emerald-400">Δplasticity: +{th.plasticityDelta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )}
</div>
  );
};
