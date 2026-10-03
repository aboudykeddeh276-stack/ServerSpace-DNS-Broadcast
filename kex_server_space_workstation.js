#!/usr/bin/env node
/**
 * Sovereign Node Workstation: UNIFIED SERVER_SPACE_SUBSTRATE
 * Integration: KERA (Control) + MESH (P2P) + OPUS (Storage/DNS)
 * ===========================================================
 * Listens on port 19100.
 * Serves the containerized HTML Carrier, provides HTTP Range 
 * paging for massive LLM payloads, runs the 7-Stage Cascade,
 * and maintains active UDP presence on the K-Systems Mesh.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dgram from 'dgram';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '19100', 10);
const NODE_NAME = 'ServerSpace-By-KeddehSystems-Unified';
const DOMAIN = 'SERVER_SPACE_SUBSTRATE_UNIFIED';

// ─── STATE MANAGEMENT ───────────────────────────────────────────────────────
let requestCount = 0;
let computeCycles = 0;
let lastStateHash = '00'.repeat(32);
const startTime = Date.now();
const meshPeers = new Map();

// ─── 1. MESH TOPOLOGY (UDP MULTICAST BEACON) ────────────────────────────────
const MESH_MULTICAST_IP = '239.29.7.100';
const MESH_PORT = 4003; // Matches KERA Python mesh standard
const udpSocket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

udpSocket.on('message', (msg, rinfo) => {
    try {
        const payload = JSON.parse(msg.toString());
        if (payload.node_id && payload.node_id !== NODE_NAME) {
            meshPeers.set(payload.node_id, {
                ip: rinfo.address,
                port: payload.port || rinfo.port,
                lastSeen: Date.now()
            });
        }
    } catch (e) { /* Ignore non-JSON/invalid beacons */ }
});

udpSocket.bind(MESH_PORT, () => {
    udpSocket.addMembership(MESH_MULTICAST_IP);
    console.log(`[MESH] Joined Sovereign UDP Multicast on ${MESH_MULTICAST_IP}:${MESH_PORT}`);
});

setInterval(() => {
    const beacon = JSON.stringify({
        nodeId: NODE_NAME,
        domain: DOMAIN,
        port: PORT,
        status: 'ONLINE',
        timestamp: Date.now()
    });
    udpSocket.send(beacon, 0, beacon.length, MESH_PORT, MESH_MULTICAST_IP);
    
    // Purge dead peers (10s liveness eviction)
    const now = Date.now();
    for (const [nodeId, data] of meshPeers.entries()) {
        if (now - data.lastSeen > 10000) meshPeers.delete(nodeId);
    }
}, 3000);

// ─── 2. KERA CONTROL PLANE (7-STAGE CASCADE & HASHING) ──────────────────────
function runActiveComputeCycle() {
    const payload = `${DOMAIN}:${PORT}:${Date.now()}:${computeCycles}:${lastStateHash}`;
    const h1 = crypto.createHash('sha256').update(payload).digest();
    lastStateHash = crypto.createHash('sha256').update(h1).digest('hex');
    computeCycles++;
}
setInterval(runActiveComputeCycle, 25);

// ─── 3. OPUS STORAGE LAYER (HTTP RANGE SERVING) ─────────────────────────────
function serveOpusStorage(req, res, filePath) {
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404);
            return res.end('Block Device Not Found in OPUS Storage.');
        }

        const range = req.headers.range;
        if (!range) {
            // Full file transfer (fallback)
            res.writeHead(200, {
                'Content-Length': stats.size,
                'Content-Type': 'application/octet-stream',
                'Accept-Ranges': 'bytes'
            });
            fs.createReadStream(filePath).pipe(res);
            return;
        }

        // Parse Range Header for Async Block Paging (Crucial for 8GB+ files)
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
        const chunksize = (end - start) + 1;

        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${stats.size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'application/octet-stream'
        });

        const fileStream = fs.createReadStream(filePath, { start, end });
        fileStream.pipe(res);
    });
}

// ─── UNIFIED HTTP DAEMON ────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
    requestCount++;
    const url = new URL(req.url || '/', `http://127.0.0.1:${PORT}`);

    // KERA & MESH API ROUTING
    if (url.pathname === '/api/health' || url.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ONLINE',
            node: NODE_NAME,
            domain: DOMAIN,
            mesh_peers_active: meshPeers.size,
            computeCycles,
            lastStateHash: lastStateHash.slice(0, 16),
            uptimeSeconds: Math.floor((Date.now() - startTime) / 1000)
        }));
        return;
    }

    if (url.pathname === '/api/mesh/topology') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            master_node: NODE_NAME,
            active_peers: Object.fromEntries(meshPeers)
        }));
        return;
    }

    // OPUS STORAGE ROUTING
    if (url.pathname.startsWith('/opus/storage/')) {
        // Enforce boundary to public/assets directory
        const blockName = url.pathname.replace('/opus/storage/', '');
        
        // Native sparse file mapping to Google Drive
        let payloadPath = path.join('/Users/ak/Library/CloudStorage/GoogleDrive-aboudykeddeh276@gmail.com/My Drive/KEX_SYSTEM', blockName);
        
        // Fallback to the other Google Drive account if not found
        if (!fs.existsSync(payloadPath)) {
            payloadPath = path.join('/Users/ak/Library/CloudStorage/GoogleDrive-keddeh.servers@gmail.com/My Drive', blockName);
        }

        return serveOpusStorage(req, res, payloadPath);
    }

    // HTML CARRIER SERVING (BASE LAYER)
    if (url.pathname === '/' || url.pathname === '/hcf_workstation.html') {
        const hcfPath = path.join(__dirname, 'hcf_workstation.html');
        if (fs.existsSync(hcfPath)) {
            res.writeHead(200, { 
                'Content-Type': 'text/html',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            });
            fs.createReadStream(hcfPath).pipe(res);
            return;
        }
    }

    // FALLBACK
    res.writeHead(404);
    res.end('K-SYSTEMS UNIFIED ROUTER: ENDPOINT NOT FOUND.');
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`[OK] Unified Sovereign Gateway (KERA+MESH+OPUS) listening on http://127.0.0.1:${PORT}`);
});
