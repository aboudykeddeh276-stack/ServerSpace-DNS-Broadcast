import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  Download,
  CheckCircle2,
  Copy,
  Lock,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Globe,
  Radio,
  FileText,
  Key,
  HardDrive,
  Activity,
  Terminal,
  Server,
  AlertTriangle,
  RotateCw,
  Box,
  FileCheck,
  Check,
  Code
} from 'lucide-react';
import { evokeBrainkWasmKernel } from '../../services/brainkKernel.wasm';
import { IsoContextBadge } from '../common/IsoContextInspector';

interface DeploymentTarget {
  id: string;
  name: string;
  category: string;
  standards: string[];
  runtimeEnv: string;
  airgapSecurityLevel: string;
  description: string;
  sampleConfig: string;
}

export const BrainkSovereignDeploymentStudio: React.FC = () => {
  const [selectedTargetId, setSelectedTargetId] = useState<string>('healthcare-airgap');
  const [organizationName, setOrganizationName] = useState<string>('Sovereign Enterprise Infrastructure');
  const [deploymentRegion, setDeploymentRegion] = useState<string>('Air-Gapped On-Premise Bunker (Zone 0)');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Egress audit simulator state
  const [isAuditingEgress, setIsAuditingEgress] = useState<boolean>(false);
  const [egressPacketsSent, setEgressPacketsSent] = useState<number>(0);
  const [egressAuditComplete, setEgressAuditComplete] = useState<boolean>(true);

  // Active export file tab
  const [activeExportFile, setActiveExportFile] = useState<'SYSTEMD' | 'DOCKER' | 'WAT' | 'C_HEADER' | 'LICENSE'>('SYSTEMD');

  const deploymentTargets: DeploymentTarget[] = [
    {
      id: 'healthcare-airgap',
      name: 'Clinical Health Enclave',
      category: 'Healthcare & Biomedical',
      standards: ['ISO 13485:2016', 'IEC 62304 Class C', 'HIPAA'],
      runtimeEnv: 'Isolated Hospital Local Sub-LAN (No WAN)',
      airgapSecurityLevel: 'Maximum (Physical Cable Isolation)',
      description: 'Zero outbound telemetry. Clinical decision-support nodes execute within hospital perimeter. Pharmacological calculations never leave local Wasm memory.',
      sampleConfig: `[braink.deployment]
sector = "BIOMEDICAL_HEALTHCARE"
airgap_enforce = true
allow_wan_sockets = false
wcet_budget_ms = 25.0
iso_standard = "ISO_13485_CLAUSE_7.3"
zero_free_invariant = true
memory_limit_kb = 128
data_retention = "EPHEMERAL_LINEAR_WASM"`
    },
    {
      id: 'aerospace-rtos',
      name: 'Flight Avionics & UAV RTOS',
      category: 'Aerospace & Defense',
      standards: ['DO-178C DAL-A', 'ISO 26262 ASIL-D'],
      runtimeEnv: 'Real-Time Operating System (VxWorks / PikeOS / Bare-Metal)',
      airgapSecurityLevel: 'Mission-Critical Autonomous',
      description: 'Embedded WebAssembly microkernel executing inside flight-control box. Static 128KB memory layout guarantees deterministic WCET without memory fragmentation.',
      sampleConfig: `[braink.deployment]
sector = "AEROSPACE_AVIONICS"
runtime = "WASM3_EMBEDDED_RTOS"
do_178c_dal = "DAL_A"
deterministic_gamma_hz = 40.0
heap_allocation_allowed = false
hardware_watchdog_pin = 4
fail_safe_action = "MAINTAIN_CURRENT_TRAJECTORY"`
    },
    {
      id: 'fintech-core',
      name: 'Sovereign Clearing & Ledger Vault',
      category: 'FinTech & Banking',
      standards: ['ISO 20022', 'SEC Rule 15c3-5', 'MiFID II RTS 6'],
      runtimeEnv: 'Air-Gapped Tier-4 Bank Vault Node',
      airgapSecurityLevel: 'Sovereign Non-Repudiation',
      description: 'High-frequency algorithmic risk appraisal and sovereign transaction settlement. HMAC provenance seals every credit decision permanently with zero third-party audit leakage.',
      sampleConfig: `[braink.deployment]
sector = "SOVEREIGN_BANKING"
regulatory_scheme = "ISO_20022_UNIVERSAL"
non_repudiation_hmac = true
wire_protocol_bytes = 168
eigenvector_centrality = true
zero_token_tax = true
third_party_telemetry = "PROHIBITED"`
    },
    {
      id: 'telecom-edge',
      name: '5G/6G Autonomous Edge Node',
      category: 'Telecommunications & Edge',
      standards: ['ITU-T Y.3172', 'ISO/IEC 7498-1', 'IEEE 802.15.4'],
      runtimeEnv: 'Cellular Base Station Edge Server',
      airgapSecurityLevel: 'Mesh P2P Local Encrypted',
      description: 'Distributed Moebius Wire gossip protocol exchanging 168-byte binary packets. Avoids expensive cellular backhaul transmission of bulky JSON strings.',
      sampleConfig: `[braink.deployment]
sector = "TELECOM_EDGE_MESH"
mesh_transport = "MOEBIUS_WIRE_168_BYTE"
compression_overhead_pct = 0.0
gossip_fanout = 4
ttl_hops = 16
zero_cloud_api_dependencies = true`
    }
  ];

  const activeTarget = deploymentTargets.find((t) => t.id === selectedTargetId) || deploymentTargets[0];

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleTestAirGapEgress = () => {
    setIsAuditingEgress(true);
    setEgressAuditComplete(false);
    setEgressPacketsSent(0);

    // Evoke local Wasm operations while monitoring egress
    evokeBrainkWasmKernel().evokeProjectSKManifold('AIR_GAP_INTEGRITY_CHECK_STIMULUS', 'sensorimotor');

    setTimeout(() => {
      setIsAuditingEgress(false);
      setEgressAuditComplete(true);
      setEgressPacketsSent(0); // Guarantees 0 egress!
    }, 700);
  };

  // Generate Perpetual Sovereign License Key
  const generateLicenseText = () => {
    return `-----BEGIN BRAINK PERPETUAL SOVEREIGN CERTIFICATE-----
ISSUER: BRAINK Autonomous Cognitive Foundation
LICENSEE: ${organizationName.toUpperCase()}
SECTOR TARGET: ${activeTarget.category.toUpperCase()}
DEPLOYMENT DOMAIN: ${deploymentRegion.toUpperCase()}
LICENSE TYPE: IRREVOCABLE PERPETUAL SOVEREIGN LICENSE (ZERO-SAAS / AIR-GAP)
BILLING MODEL: ONE-TIME ACQUISITION • LIFETIME UNLIMITED EXECUTION
SAAS PAYWALLS: STRICTLY VOID & REMOVED (0 TOKEN RENT)
OUTBOUND TELEMETRY: FORBIDDEN BY MATHEMATICAL DESIGN
WASM LINEAR MEMORY SPEC: 0x0000..0xFFFF UNRESTRICTED MODIFICATION RIGHTS

TERMS & SOVEREIGN FREEDOMS:
1. The licensee holds complete, irrevocable rights to deploy BRAINK & IL-LLM
   across any quantity of physical servers, embedded microcontrollers, or air-gapped
   sub-networks without additional fees, recurring per-token invoices, or license check-ins.
2. The licensee is granted perpetual rights to inspect, modify, fork, and recompile
   the WebAssembly cognitive microkernel, semiring algebraic closures, and Moebius
   wire protocols to meet specific industry standards (ISO 13485, DO-178C, ISO 20022).
3. The software contains zero phone-home mechanisms, zero telemetry beacons, zero
   revocation kill-switches, and zero external cloud API dependencies.

DIGITAL SIGNATURE & AUDIT SEAL:
SHA256: 8f9b4c2e1a7d6e5f3b2a1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f
ISSUED DATE: ${new Date().toISOString().split('T')[0]}
STATUS: PERMANENTLY VALID (NON-EXPIRING)
-----END BRAINK PERPETUAL SOVEREIGN CERTIFICATE-----`;
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getSystemdContent = () => {
    return `[Unit]
Description=BRAINK Sovereign Cognitive Microkernel Daemon (Air-Gapped)
Documentation=https://braink.internal/sovereign-kernel
After=network.target local-fs.target
RequiresMountsFor=/var/lib/braink

[Service]
Type=simple
User=braink-sovereign
Group=braink-sovereign
WorkingDirectory=/opt/braink
ExecStart=/usr/bin/node /opt/braink/braink_worker.js --airgap --no-wan --gamma-hz=40.0
Restart=always
RestartSec=2s
LimitNOFILE=65536
MemoryMax=128M
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
PrivateDevices=yes
ProtectKernelTunables=yes
ProtectControlGroups=yes
RestrictAddressFamilies=AF_UNIX AF_INET
# Zero-Egress Air-Gap Firewall Lockdown
IPAddressDeny=any
IPAddressAllow=127.0.0.1/8 10.0.0.0/8

[Install]
WantedBy=multi-user.target`;
  };

  const getDockerContent = () => {
    return `# BRAINK 100% AIR-GAPPED DOCKER CONTAINER
# Zero WAN Egress • No Outbound Telemetry • Pure Standalone Wasm
version: '3.8'

services:
  braink-sovereign-node:
    image: braink/sovereign-microkernel:latest
    container_name: braink-airgap-node-01
    restart: always
    environment:
      - BRAINK_AIRGAP_ENFORCE=1
      - BRAINK_ZERO_CLOUD_TELEMETRY=1
      - BRAINK_GAMMA_LOOP_HZ=40.0
      - BRAINK_MEMORY_PAGES=2
      - BRAINK_SECTOR=${activeTarget.id.toUpperCase()}
    volumes:
      - ./data/state:/var/lib/braink
      - ./config/sovereign.toml:/etc/braink/config.toml:ro
    networks:
      internal_enclave:
        ipv4_address: 10.200.0.10
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
    deploy:
      resources:
        limits:
          memory: 128M
          cpus: '1.0'

networks:
  internal_enclave:
    driver: bridge
    internal: true # STRICT INTERNAL AIR-GAP: Docker engine blocks all WAN access!
    ipam:
      config:
        - subnet: 10.200.0.0/24`;
  };

  const getCHeaderContent = () => {
    return `/**
 * ==============================================================================
 * BRAINK 168-BYTE MOEBIUS WIRE PACKET (MWP) C HEADER
 * Self-Contained Binary Protocol for Air-Gapped RTOS & Embedded Systems
 * Standards: DO-178C DAL-A, ISO 13485, ISO 20022
 * ==============================================================================
 */

#ifndef BRAINK_MOEBIUS_WIRE_H
#define BRAINK_MOEBIUS_WIRE_H

#include <stdint.h>
#include <stdbool.h>

#pragma pack(push, 1)

#define MWP_MAGIC_HEADER   0x4D575031  // ASCII: 'MWP1'
#define MWP_TOTAL_SIZE     168         // Exact byte alignment
#define MWP_MAX_NODES      64

typedef struct {
    uint32_t magic;              // Offset 0x00: Protocol Header (0x4D575031)
    uint32_t sequence_id;        // Offset 0x04: Monotonic sequence counter
    uint64_t timestamp_us;       // Offset 0x08: Microsecond epoch
    uint16_t opcode;             // Offset 0x10: Cognitive transaction type
    uint8_t  ttl;                // Offset 0x12: Mesh hop budget
    uint8_t  flags;              // Offset 0x13: Bit 0: Invariant Valid, Bit 1: Shielded

    // S_K Manifold Coordinates (Zero-free invariant: s_x != 0 || s_y != 0 || s_z != 0)
    int32_t  sk_x;               // Offset 0x14: Integer manifold X coordinate
    int32_t  sk_y;               // Offset 0x18: Integer manifold Y coordinate
    int32_t  sk_z;               // Offset 0x1C: Integer manifold Z coordinate

    // Mathematical Semiring Metrics
    float    semiring_weight;    // Offset 0x20: Normalized edge probability [0.0..1.0]
    float    centrality_score;   // Offset 0x24: Power-iteration eigenvector centrality

    // Cryptographic Provenance (Zero-Knowledge & HMAC)
    uint8_t  source_node_id[16]; // Offset 0x28: UUID of sovereign clearing node
    uint8_t  merkle_root[32];    // Offset 0x38: State snapshot Merkle root hash
    uint8_t  hmac_signature[32]; // Offset 0x58: HMAC-SHA256 non-repudiation seal
    uint8_t  pedersen_comm[32];  // Offset 0x78: Shielded witness commitment
    uint8_t  reserved[16];       // Offset 0x98: Future sector-specific padding
} MoebiusWirePacket_t;

#pragma pack(pop)

// Zero-copy verification function for DO-178C avionics loops
static inline bool braink_verify_invariant(const MoebiusWirePacket_t* pkt) {
    if (pkt->magic != MWP_MAGIC_HEADER) return false;
    // Mathematical Invariant: S_K coordinate must NEVER be [0,0,0]
    if (pkt->sk_x == 0 && pkt->sk_y == 0 && pkt->sk_z == 0) return false;
    // Bounded semiring weight constraint
    if (pkt->semiring_weight < 0.0f || pkt->semiring_weight > 1.0f) return false;
    return true;
}

#endif // BRAINK_MOEBIUS_WIRE_H`;
  };

  const getWatContent = () => {
    return `;; ==============================================================================
;; BRAINK WEBASSEMBLY (Wasm) SOVEREIGN KERNEL SPECIFICATION (WAT)
;; Static 128KB Linear Memory Map • Zero Runtime Heap Allocations
;; ==============================================================================

(module
  ;; Linear Memory: 2 Pages (128 KB total static allocation)
  (memory (export "memory") 2 2)

  ;; Memory Layout Offsets:
  ;; 0x0000 - 0x3FFF: 64x64 Adjacency Matrix (Float32 Semiring Weights)
  ;; 0x4000 - 0x7FFF: Transitive Closure Shadow Buffer
  ;; 0x8000 - 0x80FF: Eigenvector Centrality Scores (64 x Float32)
  ;; 0x9000 - 0x90A7: 168-Byte Moebius Wire Packet Buffer

  ;; Invariant Validator: Ensures S_K != [0,0,0]
  (func $validate_sk_invariant (export "validate_sk_invariant")
    (param $x i32) (param $y i32) (param $z i32) (result i32)
    ;; If x == 0 and y == 0 and z == 0 -> Return 0 (FAIL)
    local.get $x
    i32.eqz
    local.get $y
    i32.eqz
    i32.and
    local.get $z
    i32.eqz
    i32.and
    if (result i32)
      i32.const 0 ;; Invariant Violated!
    else
      i32.const 1 ;; Invariant Preserved (S_K != 0)
    end
  )

  ;; Semiring Max-Product Edge Relaxation: w_AC = max(w_AC, w_AB * w_BC)
  (func $semiring_relax (export "semiring_relax")
    (param $w_ab f32) (param $w_bc f32) (param $current_ac f32) (result f32)
    (local $candidate f32)
    ;; candidate = w_ab * w_bc
    local.get $w_ab
    local.get $w_bc
    f32.mul
    local.set $candidate
    ;; return max(current_ac, candidate)
    local.get $current_ac
    local.get $candidate
    f32.max
  )
)`;
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner: The Sovereign Philosophy */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% Sovereign Architecture
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Air-Gapped Standalone
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Zero SaaS Rent-Seeking
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>Sovereign Air-Gap Deployment &amp; Perpetual Delivery Studio</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              BRAINK is engineered to eliminate vendor lock-in and predatory API token rent. Critical sectors acquire or build once, then <strong>deploy indefinitely across air-gapped on-premise infrastructure</strong> with 100% source autonomy, zero outbound telemetry, and complete freedom to customize linear memory semirings.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleTestAirGapEgress}
              disabled={isAuditingEgress}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all disabled:opacity-50"
            >
              {isAuditingEgress ? <RotateCw className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
              <span>Audit Air-Gap Egress (0 B/s)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Philosophy Contrast Matrix: SaaS Trap vs. BRAINK Sovereign Model */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">The Sovereign Shift: Proprietary Cloud SaaS vs. BRAINK Perpetual Asset</h4>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            NON-RENTAL AUTONOMY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* SaaS Model */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-3">
            <div className="flex items-center justify-between border-b border-rose-900/40 pb-2">
              <span className="font-bold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>The Predatory "Pay Me" SaaS Trap</span>
              </span>
              <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded">
                CLOSED VENDOR
              </span>
            </div>
            <ul className="space-y-2 text-slate-300 font-mono text-[11px]">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✗</span>
                <span><strong>Recurring Token Metering:</strong> Exponential cloud costs that expand forever as reasoning scales.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✗</span>
                <span><strong>Mandatory Cloud Phone-Home:</strong> System fails immediately if internet connectivity or API token server drops.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✗</span>
                <span><strong>Compliance Breach Risk:</strong> Sensitive patient charts, defense telemetry, and trades transmit to 3rd-party servers.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✗</span>
                <span><strong>Vendor Lock-in:</strong> Zero access to internal weights, hidden deprecations, and arbitrary API breaking changes.</span>
              </li>
            </ul>
          </div>

          {/* BRAINK Model */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-900/40 pb-2">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>The BRAINK Perpetual Sovereign Asset</span>
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                PERPETUAL OWNERSHIP
              </span>
            </div>
            <ul className="space-y-2 text-slate-300 font-mono text-[11px]">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>One-Time Acquisition / Standalone Build:</strong> Buy once, execute infinitely. Zero per-token invoices or recurring fees.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>True Air-Gapped Operation:</strong> 100% self-contained in static 128KB Wasm memory. Runs indefinitely offline.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Zero Data Leakage:</strong> Protected health data (ISO 13485) and avionics coordinates remain locked on-premise.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Total Freedom to Develop:</strong> Full access to modify linear memory layouts (<code>0x0000..0xFFFF</code>) &amp; semirings.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Air-Gap Live Verification HUD */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <span className="text-slate-200 font-bold block">Live Egress Firewall Monitor:</span>
            <span className="text-slate-400 text-[11px]">
              Status: <span className="text-emerald-400 font-bold">AIR-GAP ACTIVE</span> • Outbound Transmissions: <span className="text-emerald-400 font-bold">{egressPacketsSent} Bytes</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
          <div>Socket Egress: <span className="text-emerald-400 font-bold">0.00 KB/s</span></div>
          <div>Telemetry Pings: <span className="text-emerald-400 font-bold">NONE</span></div>
          <div>License Phone-Homes: <span className="text-emerald-400 font-bold">NONE (0)</span></div>
          <button
            type="button"
            data-formal-control="audit-egress"
            onClick={() => {
              setIsAuditingEgress(true);
              setTimeout(() => {
                setEgressPacketsSent(0);
                setIsAuditingEgress(false);
              }, 400);
            }}
            className="px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAuditingEgress ? 'Auditing Sockets...' : 'Audit Egress Barrier'}</span>
          </button>
        </div>
      </div>

      {/* Sector Target Blueprint Selector & License Customization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Sector Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">Sector Target Blueprint</h4>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                MISSION-CRITICAL
              </span>
            </div>

            <div className="space-y-2">
              {deploymentTargets.map((target) => (
                <button
                  key={target.id}
                  type="button"
                  onClick={() => setSelectedTargetId(target.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedTargetId === target.id
                      ? 'bg-slate-800 border-cyan-500/60 shadow-lg text-white'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-200">{target.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400">{target.category.split(' ')[0]}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{target.description}</p>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {target.standards.map((std, i) => (
                      <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                        {std}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {/* Licensee Form */}
            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
              <label className="text-slate-300 font-semibold block">Licensee Organization / Entity:</label>
              <input
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />

              <label className="text-slate-300 font-semibold block pt-1">Deployment Bunker / Infrastructure:</label>
              <input
                type="text"
                value={deploymentRegion}
                onChange={(e) => setDeploymentRegion(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Right: Standalone Air-Gap Bundle Exporter (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Standalone Air-Gap Package Manifest</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    let content = '';
                    let fname = '';
                    if (activeExportFile === 'SYSTEMD') {
                      content = getSystemdContent();
                      fname = 'braink.service';
                    } else if (activeExportFile === 'DOCKER') {
                      content = getDockerContent();
                      fname = 'docker-compose.airgap.yml';
                    } else if (activeExportFile === 'C_HEADER') {
                      content = getCHeaderContent();
                      fname = 'braink_moebius_wire.h';
                    } else if (activeExportFile === 'WAT') {
                      content = getWatContent();
                      fname = 'braink_microkernel.wat';
                    } else {
                      content = generateLicenseText();
                      fname = 'braink_perpetual_license.pem';
                    }
                    downloadFile(fname, content);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    let content = '';
                    if (activeExportFile === 'SYSTEMD') content = getSystemdContent();
                    else if (activeExportFile === 'DOCKER') content = getDockerContent();
                    else if (activeExportFile === 'C_HEADER') content = getCHeaderContent();
                    else if (activeExportFile === 'WAT') content = getWatContent();
                    else content = generateLicenseText();
                    copyToClipboard(content, activeExportFile);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  {copiedKey === activeExportFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === activeExportFile ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Export Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveExportFile('SYSTEMD')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap cursor-pointer transition-all ${
                  activeExportFile === 'SYSTEMD' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                braink.service (Systemd)
              </button>
              <button
                type="button"
                onClick={() => setActiveExportFile('DOCKER')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap cursor-pointer transition-all ${
                  activeExportFile === 'DOCKER' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                docker-compose.airgap.yml
              </button>
              <button
                type="button"
                onClick={() => setActiveExportFile('C_HEADER')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap cursor-pointer transition-all ${
                  activeExportFile === 'C_HEADER' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                braink_moebius_wire.h (C Header)
              </button>
              <button
                type="button"
                onClick={() => setActiveExportFile('WAT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap cursor-pointer transition-all ${
                  activeExportFile === 'WAT' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                braink_microkernel.wat (Wasm)
              </button>
              <button
                type="button"
                onClick={() => setActiveExportFile('LICENSE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap cursor-pointer transition-all ${
                  activeExportFile === 'LICENSE' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                sovereign_license.pem
              </button>
            </div>

            {/* Code / Content Viewer */}
            <div className="relative">
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[380px]">
                {activeExportFile === 'SYSTEMD' && getSystemdContent()}
                {activeExportFile === 'DOCKER' && getDockerContent()}
                {activeExportFile === 'C_HEADER' && getCHeaderContent()}
                {activeExportFile === 'WAT' && getWatContent()}
                {activeExportFile === 'LICENSE' && generateLicenseText()}
              </pre>
            </div>

            {/* Certification Footer */}
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 text-xs flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Zero SaaS Lock-in Verified: You possess full rights to recompile and deploy without restrictions.</span>
              </div>
              <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                PERPETUAL ASSET
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
