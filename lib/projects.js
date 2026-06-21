// Project catalog for the IoT Lab — defence-tech focus.
// Single source of truth used by the public form and the admin dashboard.
//
// Two groups:
//   A — Multi-disciplinary, multi-person projects (3+ people, longer horizon).
//   B — Solo modules (1 person, smaller scope, clear deliverable).

export const GROUPS = {
  A: {
    id: "A",
    label: "Group A · Multi-disciplinary",
    short: "Group A",
    blurb: "Big projects. 3+ people. Cross-team work across firmware, RF, software, and mechanical.",
    pillClass: "tier-research",
  },
  B: {
    id: "B",
    label: "Group B · Solo modules",
    short: "Group B",
    blurb: "Single-person scope. One clear deliverable. Faster turnaround.",
    pillClass: "tier-foundation",
  },
};

export const PROJECTS = [
  // ───────────── Group A — Multi-disciplinary ─────────────
  {
    id: "mil-gcs",
    group: "A",
    title: "Military-Grade Ground Control Station",
    domain: "GCS · UAV · defence software",
    summary:
      "End-to-end hardened GCS: encrypted comms, multi-vehicle support, mission planning, mesh-aware. Software stack plus a rugged hardware enclosure.",
    equipment: "Rugged SBC, SDR (HackRF/USRP), display, enclosure",
    manpower: "4–6 (firmware · RF · UI · security · mech)",
    timePerWeek: "8–10 hrs",
    duration: "12+ months",
    prerequisites: "Distributed across team",
    outcomes: ["Working prototype", "Defence-grade product", "iDEX-ready"],
    commercial: "High. Direct defence / iDEX procurement target.",
    stack: "C++/Qt · pymavlink · GStreamer · AES/PGP",
  },
  {
    id: "multi-bearer-comms",
    group: "A",
    title: "Multi-Bearer Communications (Sat + 5G + RF + LoRa)",
    domain: "Hybrid resilient comms · low/high bandwidth",
    summary:
      "Comms layer that fails over between satellite, cellular (4G/5G), RF and LoRa based on live link quality. Handles low-bandwidth telemetry and high-bandwidth video.",
    equipment: "Iridium modem, 4G/5G dongles, SDR, LoRa module, Pi/Jetson",
    manpower: "3–5 (networking · embedded · RF)",
    timePerWeek: "8 hrs",
    duration: "12+ months",
    prerequisites: "Linux networking, RF basics, embedded C",
    outcomes: ["Research paper", "ANRF/MAHA-aligned", "Defence-grade module"],
    commercial: "Very high. Defence plus remote and disaster operations.",
    stack: "Linux · ModemManager · custom routing daemon · GNU Radio",
  },
  {
    id: "manet",
    group: "A",
    title: "MANET (Mobile Ad-hoc Network) for Drone Swarms",
    domain: "Mesh networking · routing protocols",
    summary:
      "Self-forming, self-healing wireless mesh across 8+ nodes. Implement BATMAN-adv / custom OLSR variant. Characterize throughput, latency, repair time.",
    equipment: "8× ESP32 (Wi-Fi mesh) OR 8× Pi + 802.11s radios",
    manpower: "3–4 (protocol · embedded · measurement)",
    timePerWeek: "6 hrs",
    duration: "6–9 months",
    prerequisites: "Linux networking, packet protocols",
    outcomes: ["Research paper", "Reusable mesh stack"],
    commercial: "Medium-high. Defence, agritech, mesh IoT.",
    stack: "Linux netfilter · BATMAN-adv · Python · Wireshark",
  },
  {
    id: "swarm",
    group: "A",
    title: "Drone Swarm / Multi-Agent System",
    domain: "Multi-agent control · formation flight",
    summary:
      "Coordinated swarm covering formation hold, leader election, and distributed task allocation. Run entirely in SITL, or scale up to a fleet of micro-drones.",
    equipment: "5+ ArduPilot SITL instances OR 5× Crazyflie-class drones",
    manpower: "3–5 (control · simulation · viz)",
    timePerWeek: "7 hrs",
    duration: "9+ months",
    prerequisites: "ROS2, Python, basic control theory",
    outcomes: ["Research paper", "Industry-mentored", "Internship-ready"],
    commercial: "High. Logistics, ISR, agritech.",
    stack: "ROS2 · Python · ArduPilot SITL · MAVROS",
  },
  {
    id: "web-sitl",
    group: "A",
    title: "Web-based SITL World Model (Gazebo / Isaac Sim)",
    domain: "Simulation infrastructure · sim-as-a-service",
    summary:
      "Browser-accessible Gazebo and Isaac Sim. Launch a world, run a mission, stream the viewport, collect telemetry. Lets students prototype with zero local install.",
    equipment: "GPU server (on-prem or cloud)",
    manpower: "3–4 (sim · backend · frontend)",
    timePerWeek: "7 hrs",
    duration: "9+ months",
    prerequisites: "Python, web stack, Linux",
    outcomes: ["Internal platform", "Open-source release", "Skill development"],
    commercial: "Medium. Sim-as-a-service for defence and agri startups.",
    stack: "Gazebo Garden · Isaac Sim · WebRTC · Next.js",
  },
  {
    id: "anti-drone",
    group: "A",
    title: "Anti-Drone Detection System",
    domain: "Counter-UAS · RF + acoustic + optical fusion",
    summary:
      "Detect rogue drones using RF spectrum analysis + microphone array + optical tracking. Outputs bearing, type classification, threat score. Soft-kill (RF jammer prototype) optional.",
    equipment: "HackRF/USRP, mic array, gimbal camera, optional X-band radar dev kit",
    manpower: "4–6 (RF · ML · embedded · mech)",
    timePerWeek: "8 hrs",
    duration: "12+ months",
    prerequisites: "Distributed across team",
    outcomes: ["Defence-grade product", "Research paper", "iDEX-ready"],
    commercial: "Very high. Airports, defence, critical infrastructure.",
    stack: "GNU Radio · PyTorch · OpenCV · Kalman filters",
  },
  {
    id: "perception-vla",
    group: "A",
    title: "Perception Stack with VLA World Model",
    domain: "Edge AI · vision-language-action models",
    summary:
      "Drone-onboard perception combining detection + open-vocabulary VLM understanding for autonomous decisions. Targets low latency on low-cost hardware.",
    equipment: "Jetson Orin Nano OR Pi 5 + Hailo accelerator, USB camera",
    manpower: "3–4 (ML · CV · embedded)",
    timePerWeek: "7 hrs",
    duration: "9+ months",
    prerequisites: "PyTorch, CV fundamentals",
    outcomes: ["Research paper", "Working prototype", "Internship-ready"],
    commercial: "Very high. Autonomous drones, robotics.",
    stack: "PyTorch · YOLOv8 · GroundingDINO · RT-2 / Octo",
  },

  // ───────────── Group B — Solo modules ─────────────
  {
    id: "fc-firmware",
    group: "B",
    title: "Drone FC Firmware Module",
    domain: "Embedded firmware · attitude control",
    summary:
      "Write one piece of a flight controller: sensor fusion, PID loop, motor mixer, or telemetry parser. Drops into PX4 or Betaflight.",
    equipment: "Pixhawk Mini / Matek FC board, bench",
    manpower: "1",
    timePerWeek: "5 hrs",
    duration: "3–6 months",
    prerequisites: "Embedded C, basic control",
    outcomes: ["Working module", "Skill development"],
    commercial: "Medium. Highly valued embedded skill.",
    stack: "C · NuttX / Betaflight · MAVLink",
  },
  {
    id: "gps-driver",
    group: "B",
    title: "GPS / GNSS Driver Module",
    domain: "GNSS · embedded driver",
    summary:
      "Clean driver for a GNSS module (NEO-M9N or ZED-F9P) with UBX parsing, multi-constellation support, and RTK if F9P. Open-source it.",
    equipment: "u-blox NEO-M9N (~₹2.5k) or ZED-F9P (~₹25k for RTK)",
    manpower: "1",
    timePerWeek: "4 hrs",
    duration: "2–4 months",
    prerequisites: "C/C++, serial protocols",
    outcomes: ["Open-source library", "Skill development"],
    commercial: "Low alone; medium if RTK-capable.",
    stack: "C/C++ · Embedded Rust (optional)",
  },
  {
    id: "esc-fw",
    group: "B",
    title: "ESC Hardware / Firmware",
    domain: "Power electronics · BLDC motor control",
    summary:
      "Build or flash an ESC for a brushless motor. Either flash AM32 / BLHeli_32 on off-the-shelf hardware, or design your own board.",
    equipment: "ESC dev board (~₹800), BLDC motor (~₹400), bench PSU",
    manpower: "1",
    timePerWeek: "4 hrs",
    duration: "2–4 months",
    prerequisites: "Embedded C, basic power electronics",
    outcomes: ["Working ESC", "Skill development"],
    commercial: "Low individually, but a valuable specialist skill.",
    stack: "C · AM32 · FOC",
  },
  {
    id: "lora-bridge",
    group: "B",
    title: "LoRa Telemetry Bridge",
    domain: "Long-range sub-GHz comms",
    summary:
      "ESP32 plus RFM95 to push MAVLink or sensor telemetry over LoRa. Characterise range across DTU campus. Build a simple repeater node.",
    equipment: "2× ESP32 + 2× RFM95 modules",
    manpower: "1",
    timePerWeek: "3–4 hrs",
    duration: "2–3 months",
    prerequisites: "Basic C/C++, breadboarding",
    outcomes: ["Working prototype", "Feeds into MANET / comms projects"],
    commercial: "Low alone; reusable building block.",
    stack: "ESP32 · RadioLib · MAVLink",
  },
  {
    id: "sensor-driver",
    group: "B",
    title: "Single-Sensor Driver Module",
    domain: "Sensor integration · ROS2 driver",
    summary:
      "Pick one sensor (LiDAR, IR, ultrasound, or stereo camera) and write a clean ROS2/Python driver with calibration and visualization.",
    equipment: "Chosen sensor + Raspberry Pi 4",
    manpower: "1",
    timePerWeek: "4 hrs",
    duration: "2–3 months",
    prerequisites: "Python or C++, basic Linux",
    outcomes: ["Reusable driver", "Open-source release"],
    commercial: "Low alone; reusable across team projects.",
    stack: "ROS2 · Python / C++",
  },
  {
    id: "rf-analysis",
    group: "B",
    title: "RF Spectrum Analysis Tool",
    domain: "Signal analysis · software",
    summary:
      "Take SDR captures (IQ samples) and output spectrogram, modulation classifier, drone-RF fingerprint. Web UI on top. Feeds the anti-drone project.",
    equipment: "RTL-SDR (~₹2k) or HackRF (~₹25k)",
    manpower: "1",
    timePerWeek: "5 hrs",
    duration: "3–5 months",
    prerequisites: "Python, basic DSP",
    outcomes: ["Working tool", "Research paper potential"],
    commercial: "Medium. Anti-drone analytics.",
    stack: "Python · GNU Radio · NumPy/SciPy · Next.js",
  },
  {
    id: "network-analysis",
    group: "B",
    title: "Network Analysis Toolkit",
    domain: "Comms diagnostics · packet analysis",
    summary:
      "Capture comms links (MAVLink / MQTT / UDP), classify packets, plot latency CDFs, detect loss patterns. Useful internal tool for the multi-bearer and MANET teams.",
    equipment: "Laptop",
    manpower: "1",
    timePerWeek: "4 hrs",
    duration: "2–3 months",
    prerequisites: "Python, basic networking",
    outcomes: ["Internal tool", "Skill development"],
    commercial: "Low alone; reusable across team projects.",
    stack: "Python · Scapy · Wireshark · React",
  },
];

export const PROJECT_IDS = PROJECTS.map((p) => p.id);

export const PRIORITY_OPTIONS = [
  { value: "",             label: "Select" },
  { value: "not",          label: "Not interested" },
  { value: "low",          label: "Low" },
  { value: "medium",       label: "Medium" },
  { value: "high",         label: "High" },
  { value: "first-choice", label: "First choice" },
];

export const HOURS_PER_WEEK = ["< 5 hrs", "5–10 hrs", "10–15 hrs", "15+ hrs"];
export const DURATION_MONTHS = ["1–3 months", "3–6 months", "6–12 months", "12+ months"];
export const WORK_MODES = ["In-lab", "Remote", "Hybrid"];

export const OUTCOME_GOALS = [
  "Working prototype",
  "Skill development",
  "Research paper",
  "Internship / placement",
  "Startup / product idea",
  "Defence / iDEX submission",
  "Grant or consortium work",
];

export const HARDWARE_LEVELS = [
  "None. Pure software so far",
  "Basic. Arduino blink and simple sensors",
  "Intermediate. Multi-sensor projects, PCB familiarity",
  "Advanced. Embedded firmware, custom hardware",
];

export const PROGRAMMING_LANGS = [
  "C", "C++", "Python", "JavaScript / TypeScript",
  "Go", "Rust", "Java", "MATLAB",
];

export const TOOLS_KNOWN = [
  "Arduino IDE", "ESP-IDF", "Raspberry Pi", "Linux CLI",
  "Git / GitHub", "Docker", "PyTorch / TensorFlow", "OpenCV",
  "ROS / ROS2", "MQTT", "LoRa", "MAVLink / ArduPilot",
  "SDR / GNU Radio", "Gazebo / Isaac Sim",
  "Next.js / React", "Node.js", "FastAPI / Flask",
];

export function projectById(id) {
  return PROJECTS.find((p) => p.id === id);
}
