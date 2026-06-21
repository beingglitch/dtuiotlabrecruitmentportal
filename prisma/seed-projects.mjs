// Seed the Project table from lib/projects.js.
// Idempotent: upserts by slug.
// Run with: node prisma/seed-projects.mjs

import { PrismaClient } from "@prisma/client";
import { PROJECTS } from "../lib/projects.js";

const prisma = new PrismaClient();

// Expanded copy keyed by current project id. Stored as the Project.overview
// so the public detail viewport has more depth than the one-line summary.
const OVERVIEWS = {
  "mil-gcs": "A modernised, hardened ground control station built from the ground up for Indian defence operations. Multi-vehicle ops, AES-256-encrypted MAVLink, mission planning with no-fly zones and offline tile maps, a 1080p video pipeline, and a rugged enclosure that survives field deployment.",
  "multi-bearer-comms": "A comms layer that fails over seamlessly between satellite (Iridium), cellular (4G/5G), point-to-point RF, and LoRa based on live link-quality measurement. Handles low-bandwidth telemetry and high-bandwidth video.",
  "manet": "A self-forming, self-healing wireless mesh across 8+ nodes. Implement BATMAN-adv or a custom OLSR variant in user space. Characterise throughput, latency, and repair time. Produce a research-grade dataset and analysis.",
  "swarm": "A coordinated drone swarm covering formation hold, leader election, and distributed task allocation. Initial development entirely in SITL (zero hardware risk). Optional Phase 2 on Crazyflie-class micro-drones. Same architecture used in production multi-agent UAV ops.",
  "web-sitl": "Browser-accessible Gazebo and Isaac Sim. Students click a button, pick a world, and start running missions in a simulated drone or rover without installing 8 GB of sim software. Becomes the lab's standard onboarding tool.",
  "anti-drone": "A complete counter-UAS detection system fusing RF spectrum analysis, microphone-array beamforming, and optical tracking. Outputs which drones are present, their type, heading, and threat score. Optional soft-kill via RF jamming, with proper legal framing.",
  "perception-vla": "An onboard perception stack for autonomous drones. YOLOv8 for speed combined with vision-language-action models for open-vocabulary understanding (\"find the red truck near the warehouse entrance\"). Targets low latency on low-cost hardware.",
  "fc-firmware": "Pick one piece of a flight controller and own it end-to-end: sensor fusion, the PID inner loop, the motor mixer, or the telemetry parser. Your module drops into PX4 or Betaflight via the standard module interface, so you're contributing to real open-source firmware.",
  "gps-driver": "A clean GNSS driver for u-blox modules. NEO-M9N for standard work, ZED-F9P for centimetre-level RTK. The driver parses the UBX binary protocol natively (not just NMEA), supports multi-constellation, and if F9P, implements RTK base/rover.",
  "esc-fw": "Build or flash an Electronic Speed Controller for a brushless motor. Path 1: flash AM32 / BLHeli_32 on an off-the-shelf ESC and tune for a specific motor. Path 2: design your own board, write FOC firmware, prove it on the bench.",
  "lora-bridge": "Two ESP32 plus RFM95 boards. Push MAVLink or sensor telemetry over LoRa. Characterise the link across DTU campus. Build a simple repeater that extends range. Output is a measurement dataset plus a small library used by the MANET and multi-bearer teams.",
  "sensor-driver": "Pick one sensor (LiDAR, thermal, ultrasound array, or stereo camera) and write a really clean ROS2 driver for it. The deliverable isn't just data coming out; it's calibration, time sync, error handling, and a visualisation that proves the driver is good.",
  "rf-analysis": "A complete software tool for analysing RF captures from an SDR. Input: IQ-sample dumps or a live SDR feed. Output: spectrograms, modulation classification, drone-RF fingerprinting. Web UI on top. Feeds the anti-drone project directly.",
  "network-analysis": "A diagnostic toolkit for the lab's comms links. Captures MAVLink / MQTT / UDP traffic, classifies packets by protocol, plots latency distributions (p50 / p99 / p99.9), detects loss patterns. Internal but essential. The multi-bearer and MANET teams depend on it.",
};

// Concrete deliverables keyed by project id.
const DELIVERABLES = {
  "mil-gcs": [
    "Qt/QML GCS desktop application supporting 5+ simultaneous vehicles",
    "Encrypted MAVLink transport (AES-256 + PGP key exchange)",
    "Mission planner with no-fly zones, geofences, offline tile cache",
    "Live video pipeline (GStreamer) with HUD overlay",
    "Rugged enclosure housing SBC, display, RF interface, battery",
    "Field test report: 5+ vehicles, 30+ km link distance",
  ],
  "multi-bearer-comms": [
    "Bearer-manager daemon routing IP over the best available link",
    "QoS classifier: video on high-BW only; telemetry on any link",
    "Live link metrics covering RSSI, latency, jitter, and packet-loss",
    "Hot failover demo: 4G drop to LoRa with no app-level reconnect",
    "Field test report: bearer transitions across a 10+ km flight",
    "Conference-grade paper on the failover algorithm",
  ],
  "manet": [
    "8-node mesh deployment (ESP32 or Pi-based)",
    "Routing protocol: BATMAN-adv tuned, or custom OLSR-derived",
    "Self-test harness: simulate node failures, measure repair time",
    "Throughput benchmarks at 1, 3, 5 hops under varying load",
    "Loss-rate dataset under mobility",
    "Research-grade analysis report",
  ],
  "swarm": [
    "5+ instance ArduPilot SITL orchestration (Docker Compose)",
    "Formation-hold algorithm: line, triangle, leader-follower",
    "Distributed leader election under leader failure",
    "Real-time swarm visualiser (React + WebSockets)",
    "Metrics dashboard: position drift, formation error",
    "Optional Phase 2: hardware migration to 5 Crazyflies",
  ],
  "web-sitl": [
    "Containerised Gazebo + Isaac Sim that boots on demand",
    "Worlds library: urban, rural, indoor warehouse, GPS-denied",
    "WebRTC pipeline: server-rendered viewport at 30 fps",
    "Telemetry stream over WebSocket to browser; REST for replays",
    "Session management with scenario picker",
    "Next.js frontend with live viewer",
  ],
  "anti-drone": [
    "SDR-based RF detection of drone control links",
    "Mic-array beamforming for directional acoustic localisation",
    "Camera + gimbal tracking once a target is acquired",
    "Sensor fusion: Kalman filter combining all three modalities",
    "Threat-scoring algorithm (proximity, type, behaviour)",
    "Optional: RF-jammer prototype in an RF-shielded room",
  ],
  "perception-vla": [
    "Detection pipeline at 20+ FPS on Jetson Orin Nano",
    "VLM integration: prompt-based open-vocabulary detection",
    "Action policy: orbit target, follow, return-to-base",
    "Latency-budget analysis with each stage measured",
    "Live demo: drone executes a natural-language instruction",
    "Optional research paper on latency-vs-accuracy",
  ],
  "fc-firmware": [
    "One firmware module: sensor fusion, PID, mixer, OR telemetry",
    "Unit tests + hardware-in-the-loop bench validation",
    "Documentation: math derivation + module API",
    "Bench-test video showing stable hover with your module live",
    "Bonus: pull request against upstream PX4 / Betaflight",
  ],
  "gps-driver": [
    "UBX protocol parser with full navigation message coverage",
    "Multi-constellation configuration and selection",
    "Optional RTK base/rover pair (F9P only)",
    "Driver library packaged for Linux (Pi) and ESP32",
    "Documentation and usage examples",
    "Open-source release on GitHub",
  ],
  "esc-fw": [
    "Off-the-shelf ESC flashed and characterised (Path 1), OR",
    "Custom ESC board in KiCad with FOC firmware (Path 2)",
    "Bench-test report: motor + propeller load characterisation",
    "Power-efficiency comparison vs stock firmware",
    "Schematics and firmware on GitHub",
  ],
  "lora-bridge": [
    "Bidirectional LoRa link with two ESP32 + RFM95 nodes",
    "Range dataset: RSSI/SNR at 100 m, 500 m, 1 km, 3 km, 5 km",
    "Repeater node with collision avoidance",
    "Python plotting and analysis",
    "Library packaging for team-project consumption",
  ],
  "sensor-driver": [
    "ROS2 driver node for chosen sensor",
    "Calibration routine specific to the sensor",
    "Time synchronisation with system clock",
    "Live RViz visualisation",
    "README with mounting instructions and limitations",
    "Integration test with a second sensor",
  ],
  "rf-analysis": [
    "IQ-sample reader (RTL-SDR / HackRF / USRP formats)",
    "Spectrogram + waterfall plot generator",
    "Modulation classifier (FM, GFSK, FHSS)",
    "Drone-RF fingerprint library",
    "Next.js web UI with file upload + live results",
  ],
  "network-analysis": [
    "Packet capture + protocol classification (MAVLink/MQTT/UDP)",
    "Latency-per-packet measurement with timestamp matching",
    "Loss-pattern detector (Gilbert-Elliott model fitting)",
    "Statistical reports: CDFs and percentiles",
    "Web dashboard for interactive exploration",
    "Export to PDF for inclusion in research papers",
  ],
};

const SKILLS = {
  "mil-gcs": ["Qt/QML application architecture", "MAVLink protocol design", "Practical cryptography (AES, key management)", "GStreamer pipelines", "Rugged hardware integration"],
  "multi-bearer-comms": ["Linux networking internals (netfilter, namespaces)", "Modem management", "Radio propagation and link-budget analysis", "Userspace routing", "Research-paper writing"],
  "manet": ["Mesh routing protocols (OLSR, BATMAN, AODV)", "802.11s and ad-hoc mode", "Network measurement methodology", "Embedded Linux at scale"],
  "swarm": ["Multi-agent systems theory", "ROS2 architecture and DDS", "asyncio Python", "ArduPilot SITL internals", "React + WebSockets for live viz"],
  "web-sitl": ["Linux orchestration (Docker, GPU passthrough)", "Gazebo / Isaac Sim authoring", "WebRTC server design", "Next.js full-stack", "GPU resource scheduling"],
  "anti-drone": ["SDR signal processing (GNU Radio)", "DSP fundamentals (beamforming, FFTs)", "Sensor fusion (Kalman, particle filters)", "Computer vision with gimbal control"],
  "perception-vla": ["PyTorch / ONNX edge deployment", "Quantisation and pruning", "VLM prompting and grounding", "Latency profiling", "ROS2 / message-bus design"],
  "fc-firmware": ["Embedded C in real-time", "RTOS basics (NuttX)", "IMU and sensor-fusion math", "PID tuning", "Hardware-in-the-loop testing"],
  "gps-driver": ["Binary protocol parsing", "GNSS fundamentals", "RTK theory and RTCM corrections", "Library packaging", "Open-source workflow"],
  "esc-fw": ["BLDC and PMSM motor theory", "Field-oriented control (FOC) math", "Power-electronics basics", "KiCad (Path 2)", "Hard real-time embedded C"],
  "lora-bridge": ["LoRa fundamentals", "ESP32 with Arduino / ESP-IDF", "Antenna basics", "Measurement methodology", "Library API design"],
  "sensor-driver": ["ROS2 node architecture", "Sensor calibration techniques", "Time synchronisation (PTP basics)", "RViz visualisation", "Robotics error handling"],
  "rf-analysis": ["DSP fundamentals (FFTs, filtering, demodulation)", "GNU Radio companion-app development", "Signal classification", "Full-stack web", "RF capture file formats"],
  "network-analysis": ["Scapy / libpcap analysis", "Wireshark display-filter logic", "Statistical analysis (CDFs, percentiles)", "Frontend data viz (React + d3)", "Research-grade tool design"],
};

async function main() {
  let i = 0;
  for (const p of PROJECTS) {
    await prisma.project.upsert({
      where: { slug: p.id },
      update: {
        group: p.group,
        title: p.title,
        domain: p.domain,
        summary: p.summary,
        overview: OVERVIEWS[p.id] || p.summary,
        deliverables: JSON.stringify(DELIVERABLES[p.id] || []),
        skills: JSON.stringify(SKILLS[p.id] || []),
        equipment: p.equipment,
        manpower: p.manpower,
        timePerWeek: p.timePerWeek,
        duration: p.duration,
        prerequisites: p.prerequisites,
        outcomes: JSON.stringify(p.outcomes || []),
        commercial: p.commercial,
        stack: p.stack,
      },
      create: {
        slug: p.id,
        group: p.group,
        title: p.title,
        domain: p.domain,
        summary: p.summary,
        overview: OVERVIEWS[p.id] || p.summary,
        deliverables: JSON.stringify(DELIVERABLES[p.id] || []),
        skills: JSON.stringify(SKILLS[p.id] || []),
        equipment: p.equipment,
        manpower: p.manpower,
        timePerWeek: p.timePerWeek,
        duration: p.duration,
        prerequisites: p.prerequisites,
        outcomes: JSON.stringify(p.outcomes || []),
        commercial: p.commercial,
        stack: p.stack,
        orderIndex: i,
        visible: true,
      },
    });
    i += 1;
  }
  const count = await prisma.project.count();
  console.log(`Seeded ${PROJECTS.length} projects (table now has ${count}).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
