import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function App() {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const machineGroupRef = useRef(null);
  const animationRef = useRef(null);
  const rotationAngleRef = useRef(0);
  
  const [selectedMachine, setSelectedMachine] = useState('mri');
  const [activeComponent, setActiveComponent] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [activeTab, setActiveTab] = useState('learn');
  const [quizState, setQuizState] = useState({ current: 0, score: 0, answered: false, selected: null, finished: false });
  const [showScanOutput, setShowScanOutput] = useState(false);

  const machines = {
    mri: {
      name: "MRI Scanner",
      fullName: "Magnetic Resonance Imaging",
      icon: "🧲",
      color: "#10b981",
      description: "Uses powerful magnets and radio waves to create detailed images of organs and tissues without radiation.",
      components: [
        { name: "Main Magnet", desc: "Creates a strong magnetic field (1.5T - 3T) that aligns hydrogen atoms in your body", color: "#3b82f6" },
        { name: "Gradient Coils", desc: "Vary the magnetic field to pinpoint exact locations for imaging", color: "#8b5cf6" },
        { name: "RF Coil", desc: "Sends radio frequency pulses and receives signals from the body", color: "#f59e0b" },
        { name: "Patient Table", desc: "Moves the patient into the scanner bore", color: "#6b7280" }
      ],
      steps: [
        { title: "Alignment", desc: "Hydrogen atoms align with the magnetic field" },
        { title: "RF Pulse", desc: "Radio waves knock atoms out of alignment" },
        { title: "Relaxation", desc: "Atoms return to alignment, releasing energy" },
        { title: "Signal Detection", desc: "RF coil detects the released energy" },
        { title: "Image Formation", desc: "Computer processes signals into images" }
      ],
      scanInfo: { title: "MRI Brain Scan", desc: "Excellent soft tissue contrast. Shows brain structures, tumors, and white/gray matter differentiation.", bestFor: "Brain, spine, joints, soft tissues" }
    },
    ct: {
      name: "CT Scanner",
      fullName: "Computed Tomography",
      icon: "📡",
      color: "#3b82f6",
      description: "Uses rotating X-ray beams to create cross-sectional images of the body.",
      components: [
        { name: "X-Ray Tube", desc: "Rotates around the patient, emitting X-ray beams", color: "#ef4444" },
        { name: "Detector Array", desc: "Captures X-rays that pass through the body", color: "#10b981" },
        { name: "Gantry", desc: "The rotating ring housing the tube and detectors", color: "#6b7280" },
        { name: "Patient Table", desc: "Moves patient through the gantry", color: "#78716c" }
      ],
      steps: [
        { title: "Positioning", desc: "Patient moves into the gantry" },
        { title: "Rotation", desc: "X-ray tube rotates 360° around patient" },
        { title: "Attenuation", desc: "Different tissues absorb X-rays differently" },
        { title: "Detection", desc: "Detectors measure transmitted X-rays" },
        { title: "Reconstruction", desc: "Computer builds cross-sectional slices" }
      ],
      scanInfo: { title: "CT Chest Scan", desc: "Shows detailed cross-sections. Excellent for bones, lungs, and detecting tumors or bleeding.", bestFor: "Chest, abdomen, trauma, bones" }
    },
    xray: {
      name: "X-Ray",
      fullName: "Radiography",
      icon: "☢️",
      color: "#ef4444",
      description: "Projects X-ray beams through the body onto a detector to visualize bones and dense structures.",
      components: [
        { name: "X-Ray Tube", desc: "Generates X-ray photons via electron acceleration", color: "#ef4444" },
        { name: "Collimator", desc: "Shapes and focuses the X-ray beam", color: "#f59e0b" },
        { name: "Detector/Film", desc: "Captures the X-ray image", color: "#10b981" },
        { name: "Patient Table", desc: "Positions patient between tube and detector", color: "#6b7280" }
      ],
      steps: [
        { title: "Generation", desc: "Electrons hit tungsten target, producing X-rays" },
        { title: "Filtration", desc: "Low-energy rays filtered out for safety" },
        { title: "Exposure", desc: "X-rays pass through the body" },
        { title: "Absorption", desc: "Dense tissues (bone) block more X-rays" },
        { title: "Image Capture", desc: "Detector records the shadow image" }
      ],
      scanInfo: { title: "Chest X-Ray", desc: "2D projection image. Bones appear white, air appears black. Quick and low radiation dose.", bestFor: "Fractures, pneumonia, heart size" }
    },
    ultrasound: {
      name: "Ultrasound",
      fullName: "Sonography",
      icon: "🔊",
      color: "#8b5cf6",
      description: "Uses high-frequency sound waves to create real-time images of soft tissues and blood flow.",
      components: [
        { name: "Transducer", desc: "Emits and receives sound waves (2-18 MHz)", color: "#8b5cf6" },
        { name: "Piezoelectric Crystals", desc: "Convert electrical signals to sound and vice versa", color: "#06b6d4" },
        { name: "Acoustic Gel", desc: "Eliminates air gap for better sound transmission", color: "#10b981" },
        { name: "Display Monitor", desc: "Shows real-time ultrasound images", color: "#6b7280" }
      ],
      steps: [
        { title: "Pulse Emission", desc: "Transducer sends sound wave pulses" },
        { title: "Propagation", desc: "Waves travel through tissues" },
        { title: "Reflection", desc: "Waves bounce back at tissue boundaries" },
        { title: "Echo Detection", desc: "Transducer receives returning echoes" },
        { title: "Image Display", desc: "Echoes converted to real-time image" }
      ],
      scanInfo: { title: "Fetal Ultrasound", desc: "Real-time imaging with no radiation. Shows movement and blood flow. Safe for pregnancy.", bestFor: "Pregnancy, heart, abdomen, vessels" }
    },
    pet: {
      name: "PET Scanner",
      fullName: "Positron Emission Tomography",
      icon: "⚛️",
      color: "#f59e0b",
      description: "Detects gamma rays from radioactive tracers to show metabolic activity in tissues.",
      components: [
        { name: "Detector Ring", desc: "Surrounds patient to capture gamma rays from all angles", color: "#f59e0b" },
        { name: "Scintillator Crystals", desc: "Convert gamma rays to visible light", color: "#10b981" },
        { name: "Photomultipliers", desc: "Amplify light signals for processing", color: "#3b82f6" },
        { name: "Radiotracer", desc: "Injected substance (e.g., FDG) that emits positrons", color: "#ef4444" }
      ],
      steps: [
        { title: "Tracer Injection", desc: "Radioactive glucose injected into patient" },
        { title: "Uptake", desc: "Active cells absorb more tracer" },
        { title: "Decay", desc: "Tracer emits positrons that annihilate with electrons" },
        { title: "Gamma Detection", desc: "Two gamma rays detected simultaneously" },
        { title: "Metabolic Map", desc: "Computer creates activity map" }
      ],
      scanInfo: { title: "PET-CT Fusion", desc: "Shows metabolic activity. Hot spots indicate high glucose uptake (cancer, infection, inflammation).", bestFor: "Cancer staging, neurology, cardiology" }
    }
  };

  const quizQuestions = [
    { q: "Which imaging modality uses NO ionizing radiation?", options: ["CT Scan", "X-Ray", "MRI", "PET Scan"], correct: 2, explanation: "MRI uses magnetic fields and radio waves, making it radiation-free." },
    { q: "What does the 'T' in 1.5T or 3T MRI refer to?", options: ["Time", "Tesla", "Tomography", "Transmission"], correct: 1, explanation: "Tesla measures magnetic field strength. Higher T = stronger magnet = better detail." },
    { q: "In CT scanning, what rotates around the patient?", options: ["Patient table", "Detector only", "X-ray tube and detectors", "Magnetic coils"], correct: 2, explanation: "The X-ray tube and detector array rotate together in the gantry." },
    { q: "What substance is used as a radiotracer in PET scans?", options: ["Iodine contrast", "Gadolinium", "FDG (fluorodeoxyglucose)", "Barium sulfate"], correct: 2, explanation: "FDG is radioactive glucose that accumulates in metabolically active cells." },
    { q: "Ultrasound cannot image through which material?", options: ["Water", "Soft tissue", "Air/bone", "Blood"], correct: 2, explanation: "Sound waves reflect strongly at air and bone interfaces, blocking transmission." },
    { q: "Which modality is best for detecting bone fractures?", options: ["MRI", "Ultrasound", "X-Ray", "PET"], correct: 2, explanation: "X-rays are absorbed by dense bone, making fractures clearly visible." },
    { q: "What produces the signal in MRI imaging?", options: ["X-ray absorption", "Sound wave echoes", "Hydrogen atom relaxation", "Gamma ray detection"], correct: 2, explanation: "Hydrogen atoms release RF energy when returning to alignment after an RF pulse." },
    { q: "Which imaging is safest during pregnancy?", options: ["CT Scan", "X-Ray", "Ultrasound", "PET Scan"], correct: 2, explanation: "Ultrasound uses sound waves with no radiation, making it safe for fetal imaging." },
    { q: "What does CT stand for?", options: ["Central Tomography", "Computed Tomography", "Cardiac Testing", "Contrast Technology"], correct: 1, explanation: "Computed Tomography uses computer processing to create cross-sectional images." },
    { q: "In PET imaging, what indicates cancer or high metabolic activity?", options: ["Dark areas", "Hot spots (bright areas)", "No signal", "Blue coloring"], correct: 1, explanation: "Cancer cells consume more glucose, causing radiotracer accumulation shown as hot spots." }
  ];

  const machine = machines[selectedMachine];

  // Three.js initialization
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = 300;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 2, 6);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    const pointLight = new THREE.PointLight(0x10b981, 0.5);
    pointLight.position.set(-3, 3, 3);
    scene.add(pointLight);

    // Machine group
    const machineGroup = new THREE.Group();
    scene.add(machineGroup);
    machineGroupRef.current = machineGroup;

    // Mouse drag controls
    let isDragging = false;
    let prevX = 0;

    const onMouseDown = (e) => { isDragging = true; prevX = e.clientX; };
    const onMouseUp = () => { isDragging = false; };
    const onMouseMove = (e) => {
      if (isDragging && machineGroupRef.current) {
        const delta = e.clientX - prevX;
        machineGroupRef.current.rotation.y += delta * 0.01;
        prevX = e.clientX;
      }
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseleave', onMouseUp);

    // Touch controls for mobile
    const onTouchStart = (e) => { isDragging = true; prevX = e.touches[0].clientX; };
    const onTouchEnd = () => { isDragging = false; };
    const onTouchMove = (e) => {
      if (isDragging && machineGroupRef.current) {
        const delta = e.touches[0].clientX - prevX;
        machineGroupRef.current.rotation.y += delta * 0.01;
        prevX = e.touches[0].clientX;
      }
    };

    renderer.domElement.addEventListener('touchstart', onTouchStart);
    renderer.domElement.addEventListener('touchend', onTouchEnd);
    renderer.domElement.addEventListener('touchmove', onTouchMove);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      rotationAngleRef.current += 0.02;
      
      if (machineGroupRef.current) {
        // Auto-rotate when animating
        if (isAnimating) {
          machineGroupRef.current.rotation.y += 0.003;
        }
        
        // Animate child objects
        machineGroupRef.current.children.forEach(child => {
          if (child.userData.rotate) {
            child.rotation.z += 0.02;
          }
          if (child.userData.pulse) {
            const scale = 1 + Math.sin(rotationAngleRef.current * 2) * 0.15;
            child.scale.set(scale, scale, scale);
          }
          if (child.userData.beam) {
            child.material.opacity = 0.2 + Math.sin(rotationAngleRef.current * 3) * 0.15;
          }
        });
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseleave', onMouseUp);
      renderer.domElement.removeEventListener('touchstart', onTouchStart);
      renderer.domElement.removeEventListener('touchend', onTouchEnd);
      renderer.domElement.removeEventListener('touchmove', onTouchMove);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isAnimating]);

  // Build machine models
  useEffect(() => {
    if (!machineGroupRef.current) return;

    // Clear previous model
    while (machineGroupRef.current.children.length > 0) {
      const child = machineGroupRef.current.children[0];
      machineGroupRef.current.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }

    const group = machineGroupRef.current;

    // ============== MRI SCANNER ==============
    if (selectedMachine === 'mri') {
      // Main Magnet - hollow cylinder (tube shape so we can see inside)
      const magnetGeo = new THREE.TorusGeometry(1.8, 0.5, 16, 100);
      const magnetMat = new THREE.MeshStandardMaterial({ 
        color: activeComponent === 0 ? 0x60a5fa : 0x2563eb,
        emissive: activeComponent === 0 ? 0x3b82f6 : 0x1e40af,
        emissiveIntensity: activeComponent === 0 ? 0.4 : 0.15
      });
      const magnet = new THREE.Mesh(magnetGeo, magnetMat);
      magnet.rotation.x = Math.PI / 2;
      group.add(magnet);

      // Second magnet ring for depth
      const magnet2Geo = new THREE.TorusGeometry(1.8, 0.5, 16, 100);
      const magnet2 = new THREE.Mesh(magnet2Geo, magnetMat);
      magnet2.rotation.x = Math.PI / 2;
      magnet2.position.z = 0.8;
      group.add(magnet2);

      const magnet3 = new THREE.Mesh(magnet2Geo, magnetMat);
      magnet3.rotation.x = Math.PI / 2;
      magnet3.position.z = -0.8;
      group.add(magnet3);

      // Gradient Coils - purple rings INSIDE the bore (clearly visible)
      for (let i = -2; i <= 2; i++) {
        const gradGeo = new THREE.TorusGeometry(1.1, 0.1, 16, 100);
        const gradMat = new THREE.MeshStandardMaterial({ 
          color: activeComponent === 1 ? 0xc084fc : 0x8b5cf6,
          emissive: activeComponent === 1 ? 0xa855f7 : 0x7c3aed,
          emissiveIntensity: activeComponent === 1 ? 0.6 : 0.3
        });
        const gradCoil = new THREE.Mesh(gradGeo, gradMat);
        gradCoil.rotation.x = Math.PI / 2;
        gradCoil.position.z = i * 0.35;
        group.add(gradCoil);
      }

      // RF Coil - bright orange ring (innermost, closest to patient)
      const rfGeo = new THREE.TorusGeometry(0.8, 0.08, 16, 100);
      const rfMat = new THREE.MeshStandardMaterial({ 
        color: activeComponent === 2 ? 0xfcd34d : 0xf59e0b,
        emissive: 0xf59e0b,
        emissiveIntensity: activeComponent === 2 ? 0.8 : 0.5
      });
      const rfCoil = new THREE.Mesh(rfGeo, rfMat);
      rfCoil.rotation.x = Math.PI / 2;
      rfCoil.userData.pulse = true;
      group.add(rfCoil);

      // Patient Table
      const tableGeo = new THREE.BoxGeometry(4, 0.12, 0.6);
      const tableMat = new THREE.MeshStandardMaterial({ 
        color: activeComponent === 3 ? 0x9ca3af : 0x4b5563,
        emissive: activeComponent === 3 ? 0x6b7280 : 0x000000,
        emissiveIntensity: activeComponent === 3 ? 0.3 : 0
      });
      const table = new THREE.Mesh(tableGeo, tableMat);
      table.position.y = -0.55;
      group.add(table);

      // Patient
      const patientGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.6, 16);
      const patientMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
      const patient = new THREE.Mesh(patientGeo, patientMat);
      patient.rotation.z = Math.PI / 2;
      patient.position.y = -0.35;
      group.add(patient);

      // Magnetic Field Lines (blue horizontal lines through bore)
      for (let i = -3; i <= 3; i++) {
        const points = [new THREE.Vector3(-2.5, i * 0.12, 0), new THREE.Vector3(2.5, i * 0.12, 0)];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.5 });
        const fieldLine = new THREE.Line(lineGeo, lineMat);
        group.add(fieldLine);
      }

      // RF Pulse waves (orange expanding rings)
      if (isAnimating) {
        for (let i = 1; i <= 3; i++) {
          const pulseGeo = new THREE.TorusGeometry(0.25 * i, 0.02, 8, 32);
          const pulseMat = new THREE.MeshBasicMaterial({ 
            color: 0xfbbf24, 
            transparent: true, 
            opacity: 0.6 - i * 0.15 
          });
          const pulse = new THREE.Mesh(pulseGeo, pulseMat);
          pulse.rotation.x = Math.PI / 2;
          pulse.userData.pulse = true;
          group.add(pulse);
        }
      }
    }

    // ============== CT SCANNER ==============
    else if (selectedMachine === 'ct') {
      // Gantry outer ring
      const gantryGeo = new THREE.TorusGeometry(2, 0.4, 16, 100);
      const gantryMat = new THREE.MeshStandardMaterial({ 
        color: activeComponent === 2 ? 0x6b7280 : 0x374151,
        emissive: activeComponent === 2 ? 0x4b5563 : 0x1f2937,
        emissiveIntensity: activeComponent === 2 ? 0.3 : 0.1
      });
      const gantry = new THREE.Mesh(gantryGeo, gantryMat);
      gantry.rotation.x = Math.PI / 2;
      group.add(gantry);

      // Housing ring (decorative blue)
      const housingGeo = new THREE.TorusGeometry(2.3, 0.15, 16, 100);
      const housingMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x1d4ed8, emissiveIntensity: 0.3 });
      const housing = new THREE.Mesh(housingGeo, housingMat);
      housing.rotation.x = Math.PI / 2;
      group.add(housing);

      // Rotating assembly (X-ray tube + detector + beam)
      const rotatingGroup = new THREE.Group();
      rotatingGroup.userData.rotate = true;

      // X-Ray Tube (red box at top)
      const tubeGeo = new THREE.BoxGeometry(0.5, 0.35, 0.35);
      const tubeMat = new THREE.MeshStandardMaterial({ 
        color: activeComponent === 0 ? 0xf87171 : 0xdc2626,
        emissive: 0xef4444,
        emissiveIntensity: activeComponent === 0 ? 0.6 : 0.4
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      tube.position.y = 1.75;
      rotatingGroup.add(tube);

      // Detector Array (green panel at bottom)
      const detectorGeo = new THREE.BoxGeometry(0.7, 0.15, 0.4);
      const detectorMat = new THREE.MeshStandardMaterial({ 
        color: activeComponent === 1 ? 0x4ade80 : 0x22c55e,
        emissive: activeComponent === 1 ? 0x22c55e : 0x16a34a,
        emissiveIntensity: activeComponent === 1 ? 0.5 : 0.3
      });
      const detector = new THREE.Mesh(detectorGeo, detectorMat);
      detector.position.y = -1.75;
      rotatingGroup.add(detector);

      // X-Ray Beam (red cone)
      const beamGeo = new THREE.ConeGeometry(0.7, 3.2, 32, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({ 
        color: 0xef4444, 
        transparent: true, 
        opacity: 0.25, 
        side: THREE.DoubleSide 
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.rotation.x = Math.PI;
      beam.userData.beam = true;
      rotatingGroup.add(beam);

      // X-Ray lines
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * 0.6 - 0.3;
        const rayPoints = [
          new THREE.Vector3(0, 1.6, 0),
          new THREE.Vector3(Math.sin(angle) * 0.6, -1.6, 0)
        ];
        const rayGeo = new THREE.BufferGeometry().setFromPoints(rayPoints);
        const rayMat = new THREE.LineBasicMaterial({ color: 0xfca5a5, transparent: true, opacity: 0.7 });
        const ray = new THREE.Line(rayGeo, rayMat);
        rotatingGroup.add(ray);
      }

      group.add(rotatingGroup);

      // Patient Table
      const ctTableGeo = new THREE.BoxGeometry(4, 0.1, 0.6);
      const ctTableMat = new THREE.MeshStandardMaterial({ 
        color: activeComponent === 3 ? 0x9ca3af : 0x4b5563 
      });
      const ctTable = new THREE.Mesh(ctTableGeo, ctTableMat);
      ctTable.position.y = -0.65;
      group.add(ctTable);

      // Patient
      const ctPatientGeo = new THREE.CylinderGeometry(0.22, 0.22, 1.4, 16);
      const ctPatientMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
      const ctPatient = new THREE.Mesh(ctPatientGeo, ctPatientMat);
      ctPatient.rotation.z = Math.PI / 2;
      ctPatient.position.y = -0.45;
      group.add(ctPatient);
    }

    // ============== X-RAY ==============
    else if (selectedMachine === 'xray') {
      // X-Ray Tube Housing
      const xrayTubeGeo = new THREE.BoxGeometry(0.9, 0.65, 0.65);
      const xrayTubeMat = new THREE.MeshStandardMaterial({ 
        color: activeComponent === 0 ? 0xf87171 : 0xb91c1c,
        emissive: activeComponent === 0 ? 0xef4444 : 0x991b1b,
        emissiveIntensity: activeComponent === 0 ? 0.5 : 0.2
      });
      const xrayTube = new THREE.Mesh(xrayTubeGeo, xrayTubeMat);
      xrayTube.position.y = 2.5;
      group.add(xrayTube);

      // Collimator (orange cone)
      const collimatorGeo = new THREE.CylinderGeometry(0.35, 0.15, 0.5, 32);
      const collimatorMat = new THREE.MeshStandardMaterial({ 
        color: activeComponent === 1 ? 0xfbbf24 : 0xd97706,
        emissive: activeComponent === 1 ? 0xf59e0b : 0xb45309,
        emissiveIntensity: activeComponent === 1 ? 0.5 : 0.25
      });
      const collimator = new THREE.Mesh(collimatorGeo, collimatorMat);
      collimator.position.y = 1.95;
      group.add(collimator);

      // X-Ray Beam cone
      const xrayBeamGeo = new THREE.ConeGeometry(1.4, 3.5, 32, 1, true);
      const xrayBeamMat = new THREE.MeshBasicMaterial({ 
        color: 0xef4444, 
        transparent: true, 
        opacity: 0.2, 
        side: THREE.DoubleSide 
      });
      const xrayBeam = new THREE.Mesh(xrayBeamGeo, xrayBeamMat);
      xrayBeam.position.y = 0;
      xrayBeam.rotation.x = Math.PI;
      xrayBeam.userData.beam = true;
      group.add(xrayBeam);

      // X-Ray beam lines
      for (let i = 0; i < 12; i++) {
        const offsetX = (i - 5.5) * 0.2;
        const rayPoints = [
          new THREE.Vector3(0, 1.7, 0),
          new THREE.Vector3(offsetX, -1.85, (Math.random() - 0.5) * 0.5)
        ];
        const rayGeo = new THREE.BufferGeometry().setFromPoints(rayPoints);
        const rayMat = new THREE.LineBasicMaterial({ color: 0xfca5a5, transparent: true, opacity: 0.5 });
        const ray = new THREE.Line(rayGeo, rayMat);
        group.add(ray);
      }

      // Patient Table
      const xrayTableGeo = new THREE.BoxGeometry(2.6, 0.1, 1.2);
      const xrayTableMat = new THREE.MeshStandardMaterial({ 
        color: activeComponent === 3 ? 0x9ca3af : 0x4b5563 
      });
      const xrayTable = new THREE.Mesh(xrayTableGeo, xrayTableMat);
      xrayTable.position.y = -0.5;
      group.add(xrayTable);

      // Patient
      const xrayPatientGeo = new THREE.BoxGeometry(1.4, 0.25, 0.7);
      const xrayPatientMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
      const xrayPatient = new THREE.Mesh(xrayPatientGeo, xrayPatientMat);
      xrayPatient.position.y = -0.3;
      group.add(xrayPatient);

      // Detector Panel (green)
      const xrayDetGeo = new THREE.BoxGeometry(2.2, 0.1, 1.8);
      const xrayDetMat = new THREE.MeshStandardMaterial({ 
        color: activeComponent === 2 ? 0x4ade80 : 0x22c55e,
        emissive: activeComponent === 2 ? 0x22c55e : 0x16a34a,
        emissiveIntensity: activeComponent === 2 ? 0.4 : 0.2
      });
      const xrayDetector = new THREE.Mesh(xrayDetGeo, xrayDetMat);
      xrayDetector.position.y = -1.9;
      group.add(xrayDetector);

      // Support Arm
      const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.2, 16);
      const armMat = new THREE.MeshStandardMaterial({ color: 0x6b7280 });
      const arm = new THREE.Mesh(armGeo, armMat);
      arm.position.set(0.9, 0.9, 0);
      group.add(arm);
    }

    // ============== ULTRASOUND ==============
    else if (selectedMachine === 'ultrasound') {
      // Machine Cart Body
      const cartGeo = new THREE.BoxGeometry(1.3, 2, 0.8);
      const cartMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
      const cart = new THREE.Mesh(cartGeo, cartMat);
      cart.position.set(-1.7, -0.2, 0);
      group.add(cart);

      // Display Monitor
      const monitorGeo = new THREE.BoxGeometry(1.1, 0.85, 0.1);
      const monitorMat = new THREE.MeshStandardMaterial({ 
        color: activeComponent === 3 ? 0x475569 : 0x1e293b,
        emissive: 0x8b5cf6,
        emissiveIntensity: activeComponent === 3 ? 0.3 : 0.15
      });
      const monitor = new THREE.Mesh(monitorGeo, monitorMat);
      monitor.position.set(-1.7, 1.05, 0.4);
      monitor.rotation.x = -0.2;
      group.add(monitor);

      // Screen
      const screenGeo = new THREE.BoxGeometry(0.95, 0.65, 0.02);
      const screenMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.set(-1.7, 1.07, 0.47);
      screen.rotation.x = -0.2;
      group.add(screen);

      // Transducer Handle (purple)
      const transducerGeo = new THREE.CylinderGeometry(0.16, 0.2, 0.9, 32);
      const transducerMat = new THREE.MeshStandardMaterial({ 
        color: activeComponent === 0 ? 0xa78bfa : 0x7c3aed,
        emissive: activeComponent === 0 ? 0x8b5cf6 : 0x6d28d9,
        emissiveIntensity: activeComponent === 0 ? 0.5 : 0.25
      });
      const transducer = new THREE.Mesh(transducerGeo, transducerMat);
      transducer.position.set(1.1, 0.3, 0);
      transducer.rotation.x = Math.PI / 5;
      group.add(transducer);

      // Piezoelectric Crystals (cyan array)
      const piezoGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.12, 32);
      const piezoMat = new THREE.MeshStandardMaterial({ 
        color: activeComponent === 1 ? 0x22d3ee : 0x06b6d4,
        emissive: 0x06b6d4,
        emissiveIntensity: activeComponent === 1 ? 0.7 : 0.4
      });
      const piezo = new THREE.Mesh(piezoGeo, piezoMat);
      piezo.position.set(1.28, -0.12, 0.16);
      piezo.rotation.x = Math.PI / 5;
      piezo.userData.pulse = true;
      group.add(piezo);

      // Crystal Elements
      for (let i = -2; i <= 2; i++) {
        const elemGeo = new THREE.BoxGeometry(0.02, 0.13, 0.3);
        const elemMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
        const elem = new THREE.Mesh(elemGeo, elemMat);
        elem.position.set(1.28 + i * 0.055, -0.12, 0.16);
        elem.rotation.x = Math.PI / 5;
        group.add(elem);
      }

      // Cable
      const cablePoints = [
        new THREE.Vector3(-1.05, -0.4, 0),
        new THREE.Vector3(0, 0.1, 0.25),
        new THREE.Vector3(0.95, 0.55, 0.08)
      ];
      const cableCurve = new THREE.CatmullRomCurve3(cablePoints);
      const cableGeo = new THREE.TubeGeometry(cableCurve, 20, 0.04, 8, false);
      const cableMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
      const cable = new THREE.Mesh(cableGeo, cableMat);
      group.add(cable);

      // Acoustic Gel (green blob)
      const gelGeo = new THREE.SphereGeometry(0.25, 32, 16);
      const gelMat = new THREE.MeshStandardMaterial({ 
        color: activeComponent === 2 ? 0x4ade80 : 0x22c55e,
        transparent: true,
        opacity: 0.7,
        emissive: activeComponent === 2 ? 0x22c55e : 0x16a34a,
        emissiveIntensity: activeComponent === 2 ? 0.3 : 0.1
      });
      const gel = new THREE.Mesh(gelGeo, gelMat);
      gel.position.set(1.3, -0.45, 0.12);
      gel.scale.set(1, 0.35, 1);
      group.add(gel);

      // Patient Body Area
      const usPatientGeo = new THREE.SphereGeometry(0.85, 32, 16);
      const usPatientMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
      const usPatient = new THREE.Mesh(usPatientGeo, usPatientMat);
      usPatient.position.set(1.35, -0.95, 0);
      usPatient.scale.set(1, 0.45, 0.75);
      group.add(usPatient);

      // Sound Waves (purple rings going down)
      if (isAnimating) {
        for (let i = 1; i <= 4; i++) {
          const waveGeo = new THREE.TorusGeometry(0.15 * i, 0.02, 8, 32);
          const waveMat = new THREE.MeshBasicMaterial({ 
            color: 0xa78bfa, 
            transparent: true, 
            opacity: 0.65 - i * 0.12 
          });
          const wave = new THREE.Mesh(waveGeo, waveMat);
          wave.position.set(1.35, -0.55 - i * 0.15, 0.12);
          wave.rotation.x = Math.PI / 2.2;
          group.add(wave);
        }

        // Echo waves returning (cyan)
        for (let i = 1; i <= 2; i++) {
          const echoGeo = new THREE.TorusGeometry(0.1 * i, 0.015, 8, 32);
          const echoMat = new THREE.MeshBasicMaterial({ 
            color: 0x22d3ee, 
            transparent: true, 
            opacity: 0.5 - i * 0.15 
          });
          const echo = new THREE.Mesh(echoGeo, echoMat);
          echo.position.set(1.35, -0.85 + i * 0.12, 0.12);
          echo.rotation.x = Math.PI / 2.2;
          group.add(echo);
        }
      }
    }

    // ============== PET SCANNER ==============
    else if (selectedMachine === 'pet') {
      // Outer Housing Ring (amber/orange)
      const petHousingGeo = new THREE.TorusGeometry(2.35, 0.2, 16, 100);
      const petHousingMat = new THREE.MeshStandardMaterial({ 
        color: 0xf59e0b, 
        emissive: 0xd97706, 
        emissiveIntensity: 0.25 
      });
      const petHousing = new THREE.Mesh(petHousingGeo, petHousingMat);
      petHousing.rotation.x = Math.PI / 2;
      group.add(petHousing);

      // Detector Ring (main amber ring)
      const detRingGeo = new THREE.TorusGeometry(2, 0.35, 16, 100);
      const detRingMat = new THREE.MeshStandardMaterial({ 
        color: activeComponent === 0 ? 0xfbbf24 : 0xd97706,
        emissive: activeComponent === 0 ? 0xf59e0b : 0xb45309,
        emissiveIntensity: activeComponent === 0 ? 0.4 : 0.2
      });
      const detRing = new THREE.Mesh(detRingGeo, detRingMat);
      detRing.rotation.x = Math.PI / 2;
      group.add(detRing);

      // Scintillator Crystals (green boxes around ring)
      const crystalCount = 24;
      for (let i = 0; i < crystalCount; i++) {
        const angle = (i / crystalCount) * Math.PI * 2;
        const crystalGeo = new THREE.BoxGeometry(0.18, 0.35, 0.18);
        const crystalMat = new THREE.MeshStandardMaterial({ 
          color: activeComponent === 1 ? 0x4ade80 : 0x22c55e,
          emissive: activeComponent === 1 ? 0x22c55e : 0x16a34a,
          emissiveIntensity: activeComponent === 1 ? 0.5 : 0.25
        });
        const crystal = new THREE.Mesh(crystalGeo, crystalMat);
        crystal.position.set(Math.cos(angle) * 1.8, Math.sin(angle) * 1.8, 0);
        crystal.lookAt(0, 0, 0);
        group.add(crystal);
      }

      // Photomultipliers (blue cylinders behind crystals)
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const pmGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.25, 16);
        const pmMat = new THREE.MeshStandardMaterial({ 
          color: activeComponent === 2 ? 0x60a5fa : 0x3b82f6,
          emissive: activeComponent === 2 ? 0x3b82f6 : 0x2563eb,
          emissiveIntensity: activeComponent === 2 ? 0.5 : 0.25
        });
        const pm = new THREE.Mesh(pmGeo, pmMat);
        pm.position.set(Math.cos(angle) * 2.2, Math.sin(angle) * 2.2, 0);
        pm.rotation.x = Math.PI / 2;
        group.add(pm);
      }

      // Inner Bore
      const petBoreGeo = new THREE.CylinderGeometry(1.3, 1.3, 1, 32, 1, true);
      const petBoreMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, side: THREE.DoubleSide });
      const petBore = new THREE.Mesh(petBoreGeo, petBoreMat);
      petBore.rotation.x = Math.PI / 2;
      group.add(petBore);

      // Patient
      const petPatientGeo = new THREE.CylinderGeometry(0.28, 0.28, 1.8, 16);
      const petPatientMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
      const petPatient = new THREE.Mesh(petPatientGeo, petPatientMat);
      petPatient.rotation.z = Math.PI / 2;
      petPatient.position.y = -0.25;
      group.add(petPatient);

      // Radiotracer Hotspots (glowing red spheres)
      const tracer1Geo = new THREE.SphereGeometry(0.12, 16, 16);
      const tracer1Mat = new THREE.MeshStandardMaterial({ 
        color: activeComponent === 3 ? 0xfca5a5 : 0xf87171,
        emissive: 0xef4444,
        emissiveIntensity: activeComponent === 3 ? 1 : 0.7
      });
      const tracer1 = new THREE.Mesh(tracer1Geo, tracer1Mat);
      tracer1.position.set(0.15, 0, 0);
      tracer1.userData.pulse = true;
      group.add(tracer1);

      const tracer2 = new THREE.Mesh(tracer1Geo, tracer1Mat.clone());
      tracer2.scale.set(0.7, 0.7, 0.7);
      tracer2.position.set(-0.25, -0.1, 0.08);
      tracer2.userData.pulse = true;
      group.add(tracer2);

      // Gamma Ray Lines (yellow/orange - always visible)
      const gammaOpacity = isAnimating ? 0.85 : 0.5;
      
      // Gamma pair 1 (horizontal)
      const gamma1Mat = new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: gammaOpacity });
      const gamma1aPoints = [new THREE.Vector3(0.15, 0, 0), new THREE.Vector3(1.85, 0, 0)];
      const gamma1aGeo = new THREE.BufferGeometry().setFromPoints(gamma1aPoints);
      const gamma1a = new THREE.Line(gamma1aGeo, gamma1Mat);
      group.add(gamma1a);

      const gamma1bPoints = [new THREE.Vector3(0.15, 0, 0), new THREE.Vector3(-1.85, 0, 0)];
      const gamma1bGeo = new THREE.BufferGeometry().setFromPoints(gamma1bPoints);
      const gamma1b = new THREE.Line(gamma1bGeo, gamma1Mat);
      group.add(gamma1b);

      // Gamma pair 2 (vertical from second tracer)
      const gamma2Mat = new THREE.LineBasicMaterial({ color: 0xf97316, transparent: true, opacity: gammaOpacity * 0.75 });
      const gamma2aPoints = [new THREE.Vector3(-0.25, -0.1, 0.08), new THREE.Vector3(-0.25, 1.85, 0.08)];
      const gamma2aGeo = new THREE.BufferGeometry().setFromPoints(gamma2aPoints);
      const gamma2a = new THREE.Line(gamma2aGeo, gamma2Mat);
      group.add(gamma2a);

      const gamma2bPoints = [new THREE.Vector3(-0.25, -0.1, 0.08), new THREE.Vector3(-0.25, -1.85, 0.08)];
      const gamma2bGeo = new THREE.BufferGeometry().setFromPoints(gamma2bPoints);
      const gamma2b = new THREE.Line(gamma2bGeo, gamma2Mat);
      group.add(gamma2b);

      // Hit indicators on detector ring
      if (isAnimating) {
        const hitGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const hitMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

        const hit1 = new THREE.Mesh(hitGeo, hitMat);
        hit1.position.set(1.8, 0, 0);
        hit1.userData.pulse = true;
        group.add(hit1);

        const hit2 = new THREE.Mesh(hitGeo, hitMat);
        hit2.position.set(-1.8, 0, 0);
        hit2.userData.pulse = true;
        group.add(hit2);

        const hit3 = new THREE.Mesh(hitGeo, hitMat);
        hit3.position.set(-0.25, 1.8, 0.08);
        hit3.userData.pulse = true;
        group.add(hit3);

        const hit4 = new THREE.Mesh(hitGeo, hitMat);
        hit4.position.set(-0.25, -1.8, 0.08);
        hit4.userData.pulse = true;
        group.add(hit4);
      }

      // Patient Table
      const petTableGeo = new THREE.BoxGeometry(4, 0.1, 0.6);
      const petTableMat = new THREE.MeshStandardMaterial({ color: 0x4b5563 });
      const petTable = new THREE.Mesh(petTableGeo, petTableMat);
      petTable.position.y = -0.85;
      group.add(petTable);
    }

  }, [selectedMachine, activeComponent, isAnimating]);

  // Quiz handlers
  const handleQuizAnswer = (index) => {
    if (quizState.answered) return;
    setQuizState(prev => ({
      ...prev,
      answered: true,
      selected: index,
      score: index === quizQuestions[prev.current].correct ? prev.score + 1 : prev.score
    }));
  };

  const nextQuestion = () => {
    if (quizState.current >= quizQuestions.length - 1) {
      setQuizState(prev => ({ ...prev, finished: true }));
    } else {
      setQuizState(prev => ({ ...prev, current: prev.current + 1, answered: false, selected: null }));
    }
  };

  const resetQuiz = () => {
    setQuizState({ current: 0, score: 0, answered: false, selected: null, finished: false });
  };

  // Scan Output Component
  const ScanOutput = () => {
    const canvasRef = useRef(null);
    
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
      
      if (selectedMachine === 'mri') {
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.ellipse(w/2, h/2, 80, 95, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.ellipse(w/2, h/2, 70, 85, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#999';
        ctx.beginPath();
        ctx.ellipse(w/2, h/2 - 10, 40, 50, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.ellipse(w/2 - 15, h/2 - 5, 8, 20, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(w/2 + 15, h/2 - 5, 8, 20, 0.3, 0, Math.PI * 2);
        ctx.fill();
      } else if (selectedMachine === 'ct') {
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.ellipse(w/2, h/2, 90, 70, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#eee';
        ctx.fillRect(w/2 - 8, h/2 + 30, 16, 35);
        for (let i = -3; i <= 3; i++) {
          ctx.beginPath();
          ctx.ellipse(w/2 + i * 22, h/2 - 10, 5, 15, i * 0.15, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#050505';
        ctx.beginPath();
        ctx.ellipse(w/2 - 35, h/2 - 5, 30, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(w/2 + 35, h/2 - 5, 30, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#555';
        ctx.beginPath();
        ctx.ellipse(w/2 - 5, h/2 + 5, 25, 30, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (selectedMachine === 'xray') {
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.moveTo(w/2 - 70, h - 30);
        ctx.quadraticCurveTo(w/2 - 80, h/2, w/2 - 40, 30);
        ctx.lineTo(w/2 - 10, 30);
        ctx.quadraticCurveTo(w/2 - 15, h/2, w/2 - 20, h - 30);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(w/2 + 70, h - 30);
        ctx.quadraticCurveTo(w/2 + 80, h/2, w/2 + 40, 30);
        ctx.lineTo(w/2 + 10, 30);
        ctx.quadraticCurveTo(w/2 + 15, h/2, w/2 + 20, h - 30);
        ctx.fill();
        ctx.strokeStyle = '#bbb';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.moveTo(w/2 - 10, 50 + i * 25);
          ctx.quadraticCurveTo(w/2 - 50, 55 + i * 25, w/2 - 75, 70 + i * 25);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(w/2 + 10, 50 + i * 25);
          ctx.quadraticCurveTo(w/2 + 50, 55 + i * 25, w/2 + 75, 70 + i * 25);
          ctx.stroke();
        }
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.ellipse(w/2 - 10, h/2 + 20, 40, 50, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ccc';
        ctx.fillRect(w/2 - 8, 20, 16, h - 40);
      } else if (selectedMachine === 'ultrasound') {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.moveTo(w/2, 10);
        ctx.lineTo(20, h - 20);
        ctx.lineTo(w - 20, h - 20);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.ellipse(w/2 - 20, h/2 + 20, 35, 45, 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.arc(w/2 + 25, h/2 - 20, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#444';
        for (let i = 0; i < 200; i++) {
          ctx.fillRect(30 + Math.random() * (w - 60), 30 + Math.random() * (h - 60), 2, 2);
        }
      } else if (selectedMachine === 'pet') {
        ctx.fillStyle = '#001';
        ctx.beginPath();
        ctx.ellipse(w/2, h/2, 85, 95, 0, 0, Math.PI * 2);
        ctx.fill();
        const grd = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, 90);
        grd.addColorStop(0, '#114');
        grd.addColorStop(1, '#003');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.ellipse(w/2, h/2, 80, 90, 0, 0, Math.PI * 2);
        ctx.fill();
        const hotspot = (x, y, r, intensity) => {
          const g = ctx.createRadialGradient(x, y, 0, x, y, r);
          if (intensity > 0.7) {
            g.addColorStop(0, '#fff');
            g.addColorStop(0.3, '#ff0');
            g.addColorStop(0.6, '#f80');
            g.addColorStop(1, '#800');
          } else {
            g.addColorStop(0, '#ff0');
            g.addColorStop(0.5, '#f80');
            g.addColorStop(1, '#400');
          }
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        };
        hotspot(w/2, h/2 - 50, 30, 0.8);
        hotspot(w/2 - 15, h/2 + 20, 20, 0.6);
        hotspot(w/2 + 35, h/2 + 10, 15, 0.9);
      }
    }, []);
    
    return (
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">{machine.scanInfo.title}</h3>
          <button onClick={() => setShowScanOutput(false)} className="text-slate-400 hover:text-white text-xs">✕ Close</button>
        </div>
        <canvas ref={canvasRef} width={200} height={200} className="w-full rounded-lg border border-slate-600 mb-3" />
        <p className="text-slate-300 text-xs mb-2">{machine.scanInfo.desc}</p>
        <div className="bg-slate-700/50 rounded-lg p-2">
          <span className="text-slate-400 text-xs">Best for: </span>
          <span className="text-emerald-400 text-xs">{machine.scanInfo.bestFor}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-3">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold mb-1">Medical Imaging Explorer</h1>
          <p className="text-slate-400 text-xs">Interactive 3D guide to diagnostic imaging • Drag to rotate</p>
        </div>

        {/* Machine Selector */}
        <div className="flex justify-center gap-1.5 mb-4 flex-wrap">
          {Object.entries(machines).map(([key, m]) => (
            <button
              key={key}
              onClick={() => { setSelectedMachine(key); setActiveComponent(null); setCurrentStep(0); setShowScanOutput(false); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedMachine === key 
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {m.icon} {m.name}
            </button>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-2 mb-4">
          {['learn', 'quiz'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {tab === 'learn' ? '📚 Learn' : '❓ Quiz'}
            </button>
          ))}
        </div>

        {activeTab === 'learn' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* 3D Viewer */}
            <div className="bg-slate-800 rounded-xl p-3 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="font-bold text-base" style={{color: machine.color}}>{machine.icon} {machine.name}</h2>
                  <p className="text-slate-400 text-xs">{machine.fullName}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowScanOutput(!showScanOutput)}
                    className="px-2 py-1 rounded-lg text-xs font-medium bg-slate-700 text-slate-300 hover:bg-slate-600"
                  >
                    🖼 Output
                  </button>
                  <button
                    onClick={() => setIsAnimating(!isAnimating)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                      isAnimating ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {isAnimating ? '⏸' : '▶'}
                  </button>
                </div>
              </div>
              
              <div ref={mountRef} className="w-full rounded-lg overflow-hidden border border-slate-700" style={{height: '300px'}} />
              
              <p className="text-slate-400 text-xs mt-2">{machine.description}</p>
            </div>

            {/* Info Panel */}
            <div className="space-y-3">
              {showScanOutput && <ScanOutput />}
              
              {/* Components */}
              <div className="bg-slate-800 rounded-xl p-3 border border-slate-700">
                <h3 className="font-semibold mb-2 text-sm">Key Components</h3>
                <div className="space-y-1.5">
                  {machine.components.map((comp, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveComponent(activeComponent === i ? null : i)}
                      className={`w-full text-left p-2 rounded-lg transition-all text-xs ${
                        activeComponent === i ? 'bg-slate-700 border-l-4' : 'bg-slate-800/50 hover:bg-slate-700/50 border-l-4 border-transparent'
                      }`}
                      style={{ borderLeftColor: activeComponent === i ? comp.color : 'transparent' }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: comp.color}}></div>
                        <span className="font-medium">{comp.name}</span>
                      </div>
                      {activeComponent === i && <p className="text-slate-400 text-xs mt-1 ml-4">{comp.desc}</p>}
                    </button>
                  ))}
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-slate-800 rounded-xl p-3 border border-slate-700">
                <h3 className="font-semibold mb-2 text-sm">How It Works</h3>
                <div className="space-y-1">
                  {machine.steps.map((step, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentStep(i)}
                      className={`w-full text-left p-1.5 rounded-lg transition-all ${currentStep === i ? 'bg-slate-700' : 'hover:bg-slate-700/50'}`}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === i ? 'text-white' : 'bg-slate-600 text-slate-400'}`}
                          style={{ backgroundColor: currentStep === i ? machine.color : undefined }}
                        >
                          {i + 1}
                        </div>
                        <div>
                          <div className="font-medium text-xs">{step.title}</div>
                          {currentStep === i && <p className="text-slate-400 text-xs">{step.desc}</p>}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Quiz Mode */
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              {quizState.finished ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">{quizState.score >= 8 ? '🏆' : quizState.score >= 5 ? '👍' : '📚'}</div>
                  <h2 className="text-xl font-bold mb-2">Quiz Complete!</h2>
                  <p className="text-3xl font-bold text-emerald-400 mb-2">{quizState.score} / {quizQuestions.length}</p>
                  <p className="text-slate-400 mb-4">
                    {quizState.score >= 8 ? 'Excellent! You really know your imaging!' : quizState.score >= 5 ? 'Good job! Keep learning!' : 'Keep studying, you\'ll get there!'}
                  </p>
                  <button onClick={resetQuiz} className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-medium transition-all">
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-slate-400">Question {quizState.current + 1} of {quizQuestions.length}</span>
                    <span className="text-xs text-emerald-400">Score: {quizState.score}</span>
                  </div>
                  
                  <div className="w-full bg-slate-700 rounded-full h-1.5 mb-5">
                    <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{width: `${((quizState.current + 1) / quizQuestions.length) * 100}%`}}></div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-4">{quizQuestions[quizState.current].q}</h3>
                  
                  <div className="space-y-2 mb-4">
                    {quizQuestions[quizState.current].options.map((opt, i) => {
                      const isCorrect = i === quizQuestions[quizState.current].correct;
                      const isSelected = quizState.selected === i;
                      let btnClass = 'bg-slate-700 hover:bg-slate-600 border-slate-600';
                      if (quizState.answered) {
                        if (isCorrect) btnClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-400';
                        else if (isSelected) btnClass = 'bg-red-500/20 border-red-500 text-red-400';
                      }
                      return (
                        <button
                          key={i}
                          onClick={() => handleQuizAnswer(i)}
                          disabled={quizState.answered}
                          className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${btnClass}`}
                        >
                          <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
                        </button>
                      );
                    })}
                  </div>
                  
                  {quizState.answered && (
                    <div className={`p-3 rounded-lg mb-4 text-sm ${quizState.selected === quizQuestions[quizState.current].correct ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-700'}`}>
                      <p className="text-slate-300">{quizQuestions[quizState.current].explanation}</p>
                    </div>
                  )}
                  
                  {quizState.answered && (
                    <button onClick={nextQuestion} className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-medium transition-all text-sm">
                      {quizState.current >= quizQuestions.length - 1 ? 'See Results' : 'Next Question →'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 text-center text-slate-500 text-xs">
          Educational Tool • Mohammad Khalaf • Biomedical Engineering
        </div>
      </div>
    </div>
  );
}
