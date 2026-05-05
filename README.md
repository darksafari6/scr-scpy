# SafariCast: High-Performance P2P Screen Broadcasting

SafariCast is a sophisticated, low-latency screen sharing and broadcasting platform built on modern WebRTC primitives. Designed for high-stakes environments like remote coding collaboration, technical presentations, and secure data sharing, it prioritizes performance, privacy, and ease of use.

## 🚀 Core Philosophy

Unlike centralized streaming services that route your data through crowded ingestion servers, SafariCast establishes **direct, encrypted tunnels** between you and your viewers. By eliminating the middleman, we achieve sub-frame latency and near-perfect visual fidelity.

## ✨ Key Features

- **Decentralized P2P Mesh**: Leverages ICE (Interactive Connectivity Establishment) to find the fastest path between peers (STUN/TURN fallbacks included).
- **Zero-Trust Security**: Every stream is wrapped in DTLS (Datagram Transport Layer Security) and SRTP (Secure Real-time Transport Protocol).
- **Fluid Dynamic Scaling**: Operators can shift between quality presets (720p 15fps to 4K 60fps) on-the-fly without dropping the connection.
- **Hardware-Accelerated Encoding**: Native browser-level GPU utilization for VP9 and H.264 ensures your CPU stays cool even during 4K broadcasts.
- **Ephemeral Infrastructure**: Session metadata and signaling channels are non-persistent. Once a session ends, the "bridge" vanishes.
- **Cross-Platform Navigation**: Tailored navigation logic for Android, iOS, and Desktop ensures a native-like experience on any device.

## 🛠 Technical Stack

- **Frontend**: React 18+ with TypeScript, styled with Tailwind CSS and Framer Motion.
- **Signaling**: Socket.io (Node.js) for initial handshake orchestration.
- **Database/Auth**: Firebase Firestore (Security Hardened) and Google Authentication.
- **Media**: Native WebRTC APIs (`getDisplayMedia`, `RTCPeerConnection`, `MediaRecorder`).

## 🔒 Security Measures

SafariCast enforces several layers of security:
1. **Firestore Rules**: Granular, attribute-based access control (ABAC) ensuring users can only manage their own rooms and profiles.
2. **Identity Verification**: Mandatory Google Auth verification for broadcasters.
3. **Encryption**: 256-bit AES encryption for all data packets in transit.
4. **No Intermediaries**: Video data never touches a server (unless a TURN relay is required by network conditions, where it remains encrypted).

## 📊 Roadmap

- [ ] **AV1 Support**: Integration of the high-efficiency AV1 codec for improved quality at lower bitrates.
- [ ] **Multi-Stream Ingress**: Allow multiple participants to share their screens simultaneously in a tiled view.
- [ ] **QUIC Signaling**: Migrating from standard WebSockets to QUIC for even faster initial handshakes.

---

*SafariCast is a standalone infrastructure project focused on advancing open-web communication standards. Built for speed, secured for privacy.*
