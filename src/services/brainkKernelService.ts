/**
 * BRAINK KERNEL-LEVEL BACKGROUND SERVICE
 * 
 * Directly evokes and orchestrates the manually configured WebAssembly microkernel
 * defined in src/services/brainkKernel.wasm.ts. Ensures high-performance, non-blocking
 * execution of S_K coordinate generation and IL-LLM matrix operations independent
 * of the main UI thread.
 */

import { BrainkKernelTelemetry, BrainkWasmEdge } from '../types';
import {
  evokeBrainkWasmKernel,
  brainkKernelWasmWorker,
  WasmSKCoordinate,
  WasmMoebiusWirePacket,
  WasmLatticeSnapshot,
  WasmThoughtFrame
} from './brainkKernel.wasm';
import { MoebiusWirePacket, SKCoordinate, hexToBytes } from './brainkCognitiveSubstrate';

export {
  evokeBrainkWasmKernel,
  brainkKernelWasmWorker
};

export type {
  WasmSKCoordinate,
  WasmMoebiusWirePacket,
  WasmLatticeSnapshot,
  WasmThoughtFrame
};

class BrainkKernelService {
  public subscribeTelemetry(fn: (t: BrainkKernelTelemetry) => void): () => void {
    return brainkKernelWasmWorker.subscribeTelemetry(fn);
  }

  public subscribePackets(fn: (p: MoebiusWirePacket) => void): () => void {
    return brainkKernelWasmWorker.subscribePackets((p) => {
      const packet: MoebiusWirePacket = {
        view: p.view,
        sequenceId: p.sequenceId,
        injectionTimestampNs: p.injectionTimestampNs,
        sk: new SKCoordinate(p.sk.x, p.sk.y, p.sk.z),
        payloadHash: p.payloadHash,
        parentProofRoot: p.parentProofRoot,
        signature: p.signature,
        rawWireBytes: p.wireHex && p.wireHex.length === 336 ? hexToBytes(p.wireHex) : new Uint8Array(168),
        wireHex: p.wireHex,
      };
      fn(packet);
    });
  }

  public subscribeThoughts(fn: (th: any) => void): () => void {
    return brainkKernelWasmWorker.subscribeThoughts(fn);
  }

  public subscribeLattice(
    fn: (snap: { edges: BrainkWasmEdge[]; concepts: string[]; centrality: Record<string, number> }) => void
  ): () => void {
    return brainkKernelWasmWorker.subscribeLattice(fn);
  }

  public requestLatticeSnapshot(): void {
    brainkKernelWasmWorker.evokeMatrixSnapshot();
  }

  /**
   * Non-blocking real-time injection of natural sensory stimulus or intent.
   * Compiles via WebAssembly S_K manifold, packs 168-byte Moebius wire packet,
   * binds IL-LLM lattice concepts, and propagates without blocking the UI thread.
   */
  public injectStimulus(text: string, stimulusType: string = 'symbolic'): void {
    brainkKernelWasmWorker.evokeProjectSKManifold(text, stimulusType);
  }

  public bindRelation(from: string, to: string, weight: number): void {
    brainkKernelWasmWorker.evokeBindRelation(from, to, weight);
  }

  public pruneDecayed(threshold: number = 0.15): void {
    brainkKernelWasmWorker.evokePruneDecayed(threshold);
  }

  public queryPath(from: string, to: string): Promise<{ exists: boolean; weight: number }> {
    return brainkKernelWasmWorker.evokeQueryAssociativePath(from, to);
  }

  public getTelemetry(): BrainkKernelTelemetry {
    return brainkKernelWasmWorker.getTelemetry();
  }
}

// Global Singleton Instance
export const GLOBAL_BRAINK_KERNEL_SERVICE = new BrainkKernelService();
