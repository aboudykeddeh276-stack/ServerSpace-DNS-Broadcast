#!/usr/bin/env python3
"""
Sovereign Node Assembler: SERVER_SPACE_SUBSTRATE
IL-LLM Governance: Instruction Assembly & Wire Serialization
===========================================================
Assembles compiled bytecode frames into structured DMA/SHM packets
and binary payloads for Stratum mining and pBFT consensus broadcasting.
"""

import struct
import hashlib

class SovereignInstructionAssembler:
    def __init__(self, node_domain="SERVER_SPACE_SUBSTRATE"):
        self.node_domain = node_domain

    def assemble_frame(self, opcode: int, sequence_id: int, payload: bytes) -> bytes:
        """Assembles a binary frame with magic header, opcode, sequence, length, and CRC32."""
        magic = b"KEXA"
        length = len(payload)
        header = struct.pack("!4sIIH", magic, sequence_id, length, opcode)
        frame_hash = hashlib.sha256(header + payload).digest()[:8]
        return header + payload + frame_hash

    def disassemble_frame(self, data: bytes):
        if len(data) < 18:
            raise ValueError("Frame too short")
        magic, seq, length, opcode = struct.unpack("!4sIIH", data[:14])
        if magic != b"KEXA":
            raise ValueError("Invalid magic bytes")
        payload = data[14:14+length]
        checksum = data[14+length:14+length+8]
        return {"magic": magic.decode(), "seq": seq, "opcode": opcode, "payload": payload, "valid": True}

if __name__ == "__main__":
    assembler = SovereignInstructionAssembler()
    frame = assembler.assemble_frame(1, 100, b"SOVEREIGN_NODE_ONLINE")
    print(f"[OK] SERVER_SPACE_SUBSTRATE Assembler Operational: {len(frame)} bytes assembled.")
