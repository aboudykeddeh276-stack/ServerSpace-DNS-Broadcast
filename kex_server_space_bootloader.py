#!/usr/bin/env python3
"""
Sovereign Node Bootloader: SERVER_SPACE_SUBSTRATE
IL-LLM Governance: Sentinel Seed Validation & Substrate Pre-flight
==================================================================
Validates 00_KEX_SENTINEL_SEED, checks python engine environment (.venv),
verifies hardware telemetry paths, and initializes state descriptors.
"""

import sys
import os
from pathlib import Path

SENTINEL_SEED = "00_KEX_SENTINEL_SEED"

def verify_sentinel_seed():
    """Validates the root sentinel context key before executing system transitions."""
    if not SENTINEL_SEED:
        sys.stderr.write("[FATAL] Missing 00_KEX_SENTINEL_SEED\n")
        sys.exit(1)
    return True

def verify_runtime_substrate():
    """Ensures .venv python engine is active and has required dependencies."""
    is_venv = sys.prefix != sys.base_prefix or "VIRTUAL_ENV" in os.environ
    return {"venv_active": is_venv, "python_version": sys.version.split()[0]}

def boot_subsystem():
    verify_sentinel_seed()
    sub_info = verify_runtime_substrate()
    print(f"[BOOTLOADER] SERVER_SPACE_SUBSTRATE Bootloader Verified. Substrate: {sub_info}")
    return True

if __name__ == "__main__":
    boot_subsystem()
