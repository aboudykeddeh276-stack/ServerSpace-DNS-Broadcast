# K-SYSTEMS: ServerSpace Edge Carrier (DNS Broadcast)

## Architectural Overview
This repository contains the mathematically lightweight, infinitely scalable HTML Operating System carrier. It is structurally decoupled from the backend runtime and designed specifically for zero-cost, limitless deployment via edge CDNs (GitHub Pages).

## The Implied Capability
This stage converts a standard web browser into a physical computer. By leveraging WebAssembly (`v86`), the `hcf_workstation.html` file boots a native Linux operating system directly in the browser's memory sandbox. It is the "Hardware" of the architecture.

## Core Processes & Technologies
### 1. The HTML Container (`hcf_workstation.html`)
*   **Function:** The physical substrate that houses the virtual hardware limits and WebAssembly bootstrap.
*   **Mechanism:** Escapes standard DOM behavior by injecting `v86` CPU virtualization. Replaces fake HTML mockups with a literal, functioning Linux kernel environment.

### 2. Cross-Origin Virtual Paging
*   **Function:** Attaches massive persistent memory (up to 100TB) to the lightweight edge deployment.
*   **Mechanism:** At boot, the virtual Linux OS dials out to the PM2 Runtime (`https://backend-tunnel...` or `localhost:19100`) to request its `hda` block device. It relies entirely on the backend to supply the Google Drive sparse memory.

### 3. GitHub Pages DNS Routing
*   **Function:** Global CDN propagation.
*   **Mechanism:** Managed entirely by the `CNAME` file (e.g., `runtime.keddeh.com`). Allows instant mapping of the OS payload to the operator's custom domains without spinning up servers.
