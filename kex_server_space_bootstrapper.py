#!/usr/bin/env python3
"""
Sovereign Node Bootstrapper: SERVER_SPACE_SUBSTRATE
IL-LLM Governance: Process Lifecycle & Multi-Tier Cascade Launcher
==================================================================
Orchestrates Layer 1 Substrate -> Layer 2 Socket -> Layer 3 Workstation
in accordance with Law D (Substrate-First Process Lifecycle).
"""

import sys
import subprocess
from pathlib import Path

def bootstrap_node():
    print("==================================================================")
    print(f" BOOTSTRAPPING SOVEREIGN NODE: SERVER_SPACE_SUBSTRATE")
    print(f" ASSIGNED PORT: 19100 | IL-LLM GOVERNED RUNTIME")
    print("==================================================================")
    
    # 1. Run bootloader verification
    bootloader_path = Path(__file__).parent / "kex_server_space_bootloader.py"
    res = subprocess.run([sys.executable, str(bootloader_path)], capture_output=True, text=True)
    if res.returncode != 0:
        print(f"[ERROR] Bootloader failed:\n{res.stderr}")
        sys.exit(1)
    print(res.stdout.strip())
    
    print(f"[OK] SERVER_SPACE_SUBSTRATE Bootstrapped successfully on port 19100.")

if __name__ == "__main__":
    bootstrap_node()
