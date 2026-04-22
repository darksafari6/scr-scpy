# SafariCast Infrastructure

High-performance, decentralized P2P screen broadcasting infrastructure built on modern WebRTC protocols for low-latency synchronization and encrypted signal routing.

## Key Features

- **P2P Mesh Topology**: Direct IP-to-IP routing ensures maximum throughput and minimum latency by bypassing central ingestion servers and cloud bottlenecks.
- **Hardware-Level Acceleration**: Automatic GPU offloading for video encoding (VP9/AV1) reduces system-wide CPU overhead during high-resolution concurrent broadcasts.
- **Carrier-Grade Security**: Mandatory DTLS 1.2 and SRTP protocol enforcement per frame ensures complete cryptographic privacy for all data in transit.
- **Infrastructure Isolation**: signaling occurs over ephemeral Websocket handshakes, ensuring zero storage of session metadata or persistent payload logging.
- **Elastic Bitrate Control**: Real-time network telemetry allows for dynamic resolution scaling from mobile-optimized 500kbps to raw 4K 15Mbps streams.

## Technical Implementation

### Signaling Layer
SafariCast utilizes a centralized signaling engine to facilitate STUN/TURN handshakes but transitions to pure P2P immediately upon successful ICE candidate exchange. This reduces global signaling server load to O(k) where k is the number of active node handshakes.

### Encoding Pipeline
The frontend implements `MediaStreamTrack.applyConstraints()` live during broadcasts to allow operators to shift between quality presets ('low', 'medium', 'high', 'source') without interrupting the session. Encoding parameters are tuned specifically for detailed screen-capture content.

### Network Resiliency
By leveraging HTTP long-polling fallbacks for Firestore and robust error-handling for WebRTC connection state changes (`failed`/`disconnected`), SafariCast maintains high availability even in restricted corporate network environments.

---

&copy; 2026 SAFARICAST INFRASTRUCTURE. OPERATED BY DEFENSE MEDIA GROUP.
UNAUTHORIZED USE OF THIS PROTOCOL FOR DATA EXFILTRATION IS PROHIBITED.
