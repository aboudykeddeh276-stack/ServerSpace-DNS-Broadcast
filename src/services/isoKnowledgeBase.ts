/**
 * ISO 9241-110 & ISO/IEC 25010 Semantic Human-Centric Knowledge Base
 * 
 * Provides self-descriptive progressive disclosure for all technical terms,
 * architectural concepts, mathematical formulations, and operational parameters.
 * Complies with:
 *  - ISO 9241-110: Ergonomics of human-system interaction — Dialogue principles
 *    (Clause 5.3: Self-descriptiveness, Clause 5.5: Suitability for learning, Clause 5.6: Controllability)
 *  - ISO/IEC 25010: Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE)
 */

export interface IsoConceptDefinition {
  id: string;
  term: string;
  acronym?: string;
  category: 'HARDWARE_COMPUTE' | 'COGNITIVE_SUBSTRATE' | 'NETWORKING_P2P' | 'SECURITY_CRYPTO' | 'VFS_SYSTEM' | 'ISO_REGULATORY';
  isoStandardRef: string;
  plainEnglishSummary: string;
  mathematicalDefinition: string;
  operationalImpact: string;
  operatorAction: string;
}

export const ISO_KNOWLEDGE_BASE: Record<string, IsoConceptDefinition> = {
  S_K_COORDINATE: {
    id: 'S_K_COORDINATE',
    term: 'S_K Zero-Free Coordinate Manifold',
    acronym: 'S_K',
    category: 'COGNITIVE_SUBSTRATE',
    isoStandardRef: 'ISO 9241-110 Clause 5.3 (Self-Descriptiveness)',
    plainEnglishSummary:
      'A 3-dimensional integer coordinate (X, Y, Z) that maps cognitive intent directly onto a spatial manifold. A strict invariant forbids zero (0) in any axis to prevent singularity collapse.',
    mathematicalDefinition:
      'S_K = (x, y, z) ∈ (ℤ \\ {0})³, where ∀ i ∈ {x, y, z}: i ≠ 0. The Euclidean magnitude is ||S_K|| = √(x² + y² + z²).',
    operationalImpact:
      'Guarantees every sovereign intent packet occupies a distinct non-degenerate location in cognitive space. Any packet with coordinate 0 is rejected by the microkernel as malformed.',
    operatorAction:
      'Observe the coordinates during intent compilation. Positive/negative values signify conceptual polarity in the semantic manifold.',
  },

  MOEBIUS_WIRE_PACKET: {
    id: 'MOEBIUS_WIRE_PACKET',
    term: 'Moebius 168-Byte Wire Packet',
    acronym: 'MWP',
    category: 'NETWORKING_P2P',
    isoStandardRef: 'ISO/IEC 25010 (Interoperability & Data Integrity)',
    plainEnglishSummary:
      'A binary network frame fixed at exactly 168 bytes. It contains the mesh routing opcode, S_K coordinates, payload hash, parent proof root, and cryptographic signature in big-endian alignment.',
    mathematicalDefinition:
      'MWP = [Opcode:4B | Peer:8B | TTL:8B | Checksum:4B | View:8B | Seq:8B | Time:8B | S_K:24B | Hash:32B | Root:32B | Sig:32B] = 168 Bytes.',
    operationalImpact:
      'Zero serialization overhead. Packets are parsed directly from raw memory arrays via DataView without JSON or string parsing latency.',
    operatorAction:
      'Inspect the raw byte length and hex signature when tracking gossip packet propagation across sovereign nodes.',
  },

  WEBGL2_GPGPU: {
    id: 'WEBGL2_GPGPU',
    term: 'WebGL2 General-Purpose GPU Compute Kernel',
    acronym: 'GPGPU',
    category: 'HARDWARE_COMPUTE',
    isoStandardRef: 'ISO/IEC 25010 (Resource Utilization & Performance Efficiency)',
    plainEnglishSummary:
      'Compiles raw GLSL fragment shaders directly to your physical graphics card hardware. It executes matrix operations in parallel across thousands of GPU shader cores simultaneously.',
    mathematicalDefinition:
      'C[i, j] = ∑_{k=0}^{N-1} A[i, k] · B[k, j] evaluated in parallel across GPU texture fragment invocations. Computational complexity: 2N³ FLOPs.',
    operationalImpact:
      'Bypasses single-threaded JavaScript CPU limitations. Achieves true physical hardware throughput with zero artificial browser throttles.',
    operatorAction:
      'Adjust matrix dimension (128x128 to 1024x1024) to benchmark your physical GPU silicon capacity under sustained load.',
  },

  MULTI_CORE_CPU_POOL: {
    id: 'MULTI_CORE_CPU_POOL',
    term: 'Multi-Core CPU Web Worker Thread Pool',
    acronym: 'SMP_POOL',
    category: 'HARDWARE_COMPUTE',
    isoStandardRef: 'ISO 9241-110 Clause 5.6 (Controllability)',
    plainEnglishSummary:
      'Spawns dedicated parallel worker threads matching your physical CPU cores (navigator.hardwareConcurrency), crunching intensive calculations without freezing or stuttering the UI.',
    mathematicalDefinition:
      'Workload W is partitioned into T = N_cores disjoint chunks: W_t = {rows i | t·(N/T) ≤ i < (t+1)·(N/T)}. Total time ≈ max_t(elapsed(W_t)).',
    operationalImpact:
      'Keeps the interactive UI at 60 FPS while background threads operate at 100% CPU capacity across all physical and logical cores.',
    operatorAction:
      'Select thread count from 1 up to your hardware limit to observe linear multi-threaded scaling and Amdahl’s Law in practice.',
  },

  GFLOPS_TFLOPS: {
    id: 'GFLOPS_TFLOPS',
    term: 'Billion / Trillion Floating-Point Operations Per Second',
    acronym: 'GFLOPS / TFLOPS',
    category: 'HARDWARE_COMPUTE',
    isoStandardRef: 'ISO/IEC 25010 (Time Behaviour & Execution Capacity)',
    plainEnglishSummary:
      'A universal measure of raw hardware computing speed. 1 GFLOPS = 1 billion floating-point operations per second. 1 TFLOPS = 1,000 GFLOPS.',
    mathematicalDefinition:
      'GFLOPS = (Total_FLOPs) / (Execution_Time_in_Seconds · 10⁹). For NxN GEMM: FLOPs = 2 · N³ · Iterations.',
    operationalImpact:
      'Directly indicates whether software is utilizing hardware acceleration or falling back to unoptimized interpreter loops.',
    operatorAction:
      'Compare GFLOPS between CPU Single-Thread, CPU Multi-Core, and GPU Silicon to quantify acceleration factors.',
  },

  FROBENIUS_NORM: {
    id: 'FROBENIUS_NORM',
    term: 'Frobenius Matrix Norm & Hardware Checksum',
    acronym: '||A||_F',
    category: 'HARDWARE_COMPUTE',
    isoStandardRef: 'ISO/IEC 25010 (Fault Tolerance & Correctness)',
    plainEnglishSummary:
      'A mathematical sanity check that computes the total energy/magnitude of the computed matrix. Ensures hardware did not drop bits, overflow, or compute corrupted zeros.',
    mathematicalDefinition:
      '||A||_F = √( ∑_{i=1}^m ∑_{j=1}^n |a_{ij}|² ). The checksum is derived from the deterministic hash of the norm.',
    operationalImpact:
      'Guarantees numerical integrity across different GPU drivers, WebGL backends, and physical architectures.',
    operatorAction:
      'Verify that the Frobenius Norm is non-zero and stable across multiple benchmark runs with identical inputs.',
  },

  IL_LLM_RELATION_SUBSTRATE: {
    id: 'IL_LLM_RELATION_SUBSTRATE',
    term: 'Interlingua Language Model Semantic Substrate',
    acronym: 'IL-LLM',
    category: 'COGNITIVE_SUBSTRATE',
    isoStandardRef: 'ISO 9241-110 Clause 5.4 (Conformity with User Expectations)',
    plainEnglishSummary:
      'A 32-dimensional orthonormal vector graph that evaluates associative conceptual affinity between human language tokens and microkernel operating primitives.',
    mathematicalDefinition:
      'Affinity(A, B) = cos(θ) = (v_A · v_B) / (||v_A|| · ||v_B||) ∈ [0, 1]. Adjacency matrix M maintains mutual edge weights with exponential decay M_{t+1} = M_t · (1 - λ).',
    operationalImpact:
      'Prevents hallucinated or disconnected execution by binding intent words to verifiable sovereign system nodes.',
    operatorAction:
      'Input natural language into the Cognitive Gateway to observe which semantic anchors are activated in real-time.',
  },

  CONTENT_ADDRESSED_VFS: {
    id: 'CONTENT_ADDRESSED_VFS',
    term: 'Content-Addressed Virtual File System',
    acronym: 'CA-VFS',
    category: 'VFS_SYSTEM',
    isoStandardRef: 'ISO/IEC 25010 (Functional Completeness & Integrity)',
    plainEnglishSummary:
      'A filesystem where files are identified, verified, and retrieved by cryptographic digests (SHA-256) of their content, eliminating corrupted pointers and orphan inodes.',
    mathematicalDefinition:
      'Hash = SHA-256(File_Content). Address space maps URI → Hash → Immutable Block Payload.',
    operationalImpact:
      'Enables verifiable peer replication. If two nodes have the same hash, they are cryptographically proven to possess identical code.',
    operatorAction:
      'Inspect file hashes in the VFS browser or Microkernel bootchain inspector.',
  },

  HMAC_SESSION_PROOF: {
    id: 'HMAC_SESSION_PROOF',
    term: 'HMAC-SHA256 Cryptographic Session Proof',
    acronym: 'HMAC',
    category: 'SECURITY_CRYPTO',
    isoStandardRef: 'ISO/IEC 25010 (Confidentiality & Non-Repudiation)',
    plainEnglishSummary:
      'A cryptographic signature that binds the user identity (Aboudy Keddeh) and sovereign private key to each compiled packet, preventing tampering or unauthorized injection.',
    mathematicalDefinition:
      'HMAC(K, m) = H((K\' ⊕ opad) || H((K\' ⊕ ipad) || m)), where H is SHA-256, opad=0x5c, ipad=0x36.',
    operationalImpact:
      'Guarantees sovereign authority. Any node on the mesh can verify that the command originated from the authentic operator.',
    operatorAction:
      'Check the HMAC signature field on any Moebius packet to confirm cryptographic provenance.',
  },

  ISO_13485_BIOMEDICAL: {
    id: 'ISO_13485_BIOMEDICAL',
    term: 'ISO 13485 / IEC 62304 Biomedical Determinism',
    acronym: 'ISO 13485',
    category: 'ISO_REGULATORY',
    isoStandardRef: 'ISO 13485 Clause 7.3 & IEC 62304 Class C',
    plainEnglishSummary:
      'Medical device software safety benchmark requiring deterministic diagnostic boundaries, zero uncontrolled drift, and reproducible clinical decision support.',
    mathematicalDefinition:
      'Risk P(Failure) = 0 for all invariant states. ∀ drug interactions (u, v): w(u, v) ≥ θ_threshold before presentation.',
    operationalImpact:
      'Eliminates hallucinated drug contraindications by pruning unverified cognitive paths in the Wasm microkernel before clinical display.',
    operatorAction:
      'Inspect the clinical threshold prune logs in the IL-LLM Substrate Lattice.',
  },

  DO_178C_AEROSPACE: {
    id: 'DO_178C_AEROSPACE',
    term: 'DO-178C / ED-12C Avionics Software Certification',
    acronym: 'DO-178C',
    category: 'ISO_REGULATORY',
    isoStandardRef: 'FAA/EASA DO-178C DAL-A & ISO 26262 ASIL-D',
    plainEnglishSummary:
      'Aviation and autonomous vehicle functional safety standard demanding predictable memory usage, bounded Worst-Case Execution Time (WCET), and no heap fragmentation.',
    mathematicalDefinition:
      'WCET ≤ 25.0 ms (matching the 40.0 Hz Gamma cognitive cycle). Static memory: Mem_total = 128 KB (2 Wasm pages).',
    operationalImpact:
      'Guarantees flight-critical sensor fusion executes within bounded time budgets without garbage collection pauses.',
    operatorAction:
      'Monitor the 40Hz Gamma loop frequency and Wasm memory telemetry.',
  },

  ISO_20022_FINTECH: {
    id: 'ISO_20022_FINTECH',
    term: 'ISO 20022 Financial Industry Message Scheme',
    acronym: 'ISO 20022',
    category: 'ISO_REGULATORY',
    isoStandardRef: 'ISO 20022 & SEC Rule 15c3-5',
    plainEnglishSummary:
      'Standardized financial messaging framework requiring end-to-end cryptographic audit trails and non-repudiation for automated settlement.',
    mathematicalDefinition:
      'Tx_Proof = HMAC-SHA256(Tx_ID || S_K || Parent_Proof_Root || Timestamp_ns).',
    operationalImpact:
      'Enables sovereign nodes to reconstruct financial inference sequences and counterparty exposure without centralized clearing houses.',
    operatorAction:
      'Verify transaction receipts via the Peer Ledgers audit panel.',
  },

  ISO_IEC_42001_AIMS: {
    id: 'ISO_IEC_42001_AIMS',
    term: 'ISO/IEC 42001 Artificial Intelligence Management System',
    acronym: 'ISO 42001',
    category: 'ISO_REGULATORY',
    isoStandardRef: 'ISO/IEC 42001:2023 Clause 8.4 (AI System Transparency)',
    plainEnglishSummary:
      'International standard for responsible, auditable, and transparent enterprise artificial intelligence architectures.',
    mathematicalDefinition:
      'Explainability E(d) = ∏_{i=1}^k w(e_i) > 0, where Path(d) = (e_1, e_2, ..., e_k) is an explicit chain in the relational semiring.',
    operationalImpact:
      'Transforms opaque neural predictions into verifiable, step-by-step associative graph walks that can be inspected by compliance officers.',
    operatorAction:
      'Query associative paths and examine eigenvector centrality distributions.',
  },

  BISIMULATION_PROOF: {
    id: 'BISIMULATION_PROOF',
    term: 'Formal Bisimulation Proof (S ~ T)',
    acronym: 'S ~ T',
    category: 'ISO_REGULATORY',
    isoStandardRef: 'ISO/IEC 25010 & DO-178C DAL-A (Formal Verification)',
    plainEnglishSummary:
      'A mathematical equivalence relation proving that every user interface action strictly transitions physical host state to match its formal specification without side-effects.',
    mathematicalDefinition:
      'S ~ T ⟺ (∀ s →^a s\', ∃ t →^a t\' with s\' ~ t\') ∧ (∀ t →^a t\', ∃ s →^a s\' with s\' ~ t\'). Merkle Root: H(Pre || State_post || Inv).',
    operationalImpact:
      'Prevents UI drift, phantom controls, and unverified state mutations by binding every button click to a verified state transition and cryptographic proof hash.',
    operatorAction:
      'Inspect the Bisimulation Proofs ledger in the Formal Verification tab to confirm 100% equivalence.',
  },

  STRUCTURAL_OPERATIONAL_SEMANTICS: {
    id: 'STRUCTURAL_OPERATIONAL_SEMANTICS',
    term: 'Structural Operational Semantics (SOS)',
    acronym: 'SOS',
    category: 'COGNITIVE_SUBSTRATE',
    isoStandardRef: 'ISO/IEC 42001 & Plotkin Formal Semantics',
    plainEnglishSummary:
      'A deductive inference grammar defining system execution step-by-step using formal premise-over-conclusion rules.',
    mathematicalDefinition:
      'Γ ⊢ ⟨Control, State⟩ ⇓ State\' via inference rule: Premise_1 ∧ ... ∧ Premise_n / Conclusion.',
    operationalImpact:
      'Eliminates ambiguity in microkernel behavior by mathematically proving state transitions prior to code compilation.',
    operatorAction:
      'Review inference trees in the Formal Verification & SOS tab to understand deductive execution rules.',
  },

  LTL_SAFETY_LIVENESS: {
    id: 'LTL_SAFETY_LIVENESS',
    term: 'Linear Temporal Logic (LTL) Invariant Verification',
    acronym: 'LTL',
    category: 'SECURITY_CRYPTO',
    isoStandardRef: 'DO-178C Section 6.3.3 & ISO 26262 ASIL-D',
    plainEnglishSummary:
      'Temporal logic formulations that verify two invariant classes: Safety properties ("bad things never happen", □P) and Liveness properties ("good things eventually happen", ◇Q).',
    mathematicalDefinition:
      '□(S_K ≠ (0,0,0)) ∧ □(Egress = 0) ∧ □(Memory ≤ 128KB) ∧ ◇(Proof_Root_Emitted).',
    operationalImpact:
      'Provides real-time safety envelope monitoring, instantly intercepting runtime faults before memory corruption can manifest.',
    operatorAction:
      'Check the Safety & Invariant Envelope status bar in the Formal Verification suite.',
  },
};

export function getIsoDefinition(id: string): IsoConceptDefinition | undefined {
  return ISO_KNOWLEDGE_BASE[id];
}
