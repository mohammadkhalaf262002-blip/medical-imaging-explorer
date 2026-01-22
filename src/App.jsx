import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function MedicalImagingExplorer() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const machineGroupRef = useRef(null);
  const animationRef = useRef(null);
  const [selectedMachine, setSelectedMachine] = useState('mri');
  const [activeComponent, setActiveComponent] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [activeTab, setActiveTab] = useState('learn');
  const [quizState, setQuizState] = useState({ current: 0, score: 0, answered: false, selected: null, finished: false });
  const [showScanOutput, setShowScanOutput] = useState(false);

  const machines = {
    mri: { name: "MRI", fullName: "Magnetic Resonance Imaging", icon: "🧲", color: "#10b981",
      description: "Uses powerful magnets and radio waves to create detailed images without radiation.",
      components: [
        { name: "Superconducting Magnet", desc: "Creates powerful 1.5-3T magnetic field" },
        { name: "Gradient Coils", desc: "Spatially encode the MR signal" },
        { name: "RF Coil", desc: "Transmits and receives radio frequency signals" },
        { name: "Patient Table", desc: "Moves patient into the bore" }
      ],
      steps: [
        { title: "Alignment", desc: "Hydrogen atoms align with magnetic field" },
        { title: "Excitation", desc: "RF pulse tips atoms out of alignment" },
        { title: "Relaxation", desc: "Atoms return to equilibrium, emitting signals" },
        { title: "Detection", desc: "RF coil detects the emitted signals" },
        { title: "Reconstruction", desc: "Computer creates detailed images" }
      ],
      scanInfo: { title: "Brain MRI", desc: "Shows gray/white matter differentiation, ventricles, and soft tissue detail.", bestFor: "Brain, spine, joints, soft tissues" }
    },
    ct: { name: "CT", fullName: "Computed Tomography", icon: "🔄", color: "#3b82f6",
      description: "Rotating X-ray beam creates cross-sectional images of the body.",
      components: [
        { name: "X-Ray Tube", desc: "Generates rotating X-ray beam" },
        { name: "Detector Array", desc: "Captures X-rays after passing through body" },
        { name: "Gantry", desc: "Houses rotating components" },
        { name: "Patient Table", desc: "Moves through the gantry" }
      ],
      steps: [
        { title: "Positioning", desc: "Patient lies on motorized table" },
        { title: "Rotation", desc: "X-ray tube rotates around patient" },
        { title: "Acquisition", desc: "Detectors capture attenuation data" },
        { title: "Reconstruction", desc: "Computer builds cross-sectional images" }
      ],
      scanInfo: { title: "Chest CT", desc: "Shows lungs, heart, vessels, and bones in cross-section.", bestFor: "Chest, abdomen, trauma, cancer staging" }
    },
    xray: { name: "X-Ray", fullName: "Radiography", icon: "📷", color: "#ef4444",
      description: "Projects X-rays through the body onto a detector to create 2D images.",
      components: [
        { name: "X-Ray Tube", desc: "Generates X-ray photons" },
        { name: "Collimator", desc: "Shapes and focuses the X-ray beam" },
        { name: "Detector Panel", desc: "Digital detector captures the image" },
        { name: "Patient Table", desc: "Positions patient for imaging" }
      ],
      steps: [
        { title: "Positioning", desc: "Patient positioned between tube and detector" },
        { title: "Exposure", desc: "X-ray beam passes through body" },
        { title: "Attenuation", desc: "Dense tissues absorb more X-rays" },
        { title: "Detection", desc: "Remaining X-rays hit the detector" },
        { title: "Image", desc: "Differential absorption creates image" }
      ],
      scanInfo: { title: "Chest X-Ray", desc: "Shows heart silhouette, lung fields, ribs, and diaphragm.", bestFor: "Fractures, pneumonia, heart size" }
    },
    ultrasound: { name: "Ultrasound", fullName: "Sonography", icon: "🔊", color: "#8b5cf6",
      description: "Uses high-frequency sound waves to create real-time images.",
      components: [
        { name: "Transducer", desc: "Emits and receives sound waves" },
        { name: "Display Monitor", desc: "Shows real-time images" },
        { name: "Control Panel", desc: "Adjusts imaging parameters" },
        { name: "Gel", desc: "Eliminates air gap for better transmission" }
      ],
      steps: [
        { title: "Contact", desc: "Gel applied, transducer placed on skin" },
        { title: "Transmission", desc: "Sound waves sent into body" },
        { title: "Reflection", desc: "Waves bounce off tissue boundaries" },
        { title: "Reception", desc: "Transducer detects returning echoes" },
        { title: "Display", desc: "Real-time image shown on monitor" }
      ],
      scanInfo: { title: "Fetal Ultrasound", desc: "Shows fetal development, movement, and heartbeat in real-time.", bestFor: "Pregnancy, heart, abdomen, vessels" }
    },
    pet: { name: "PET", fullName: "Positron Emission Tomography", icon: "⚛️", color: "#f59e0b",
      description: "Detects gamma rays from radioactive tracers to show metabolic activity.",
      components: [
        { name: "Detector Ring", desc: "Scintillation crystals detect gamma ray pairs" },
        { name: "Photomultipliers", desc: "Convert light signals to electrical signals" },
        { name: "Coincidence Circuit", desc: "Identifies simultaneous gamma ray detection" },
        { name: "Radiotracer", desc: "FDG injected to show metabolic activity" }
      ],
      steps: [
        { title: "Injection", desc: "Radiotracer (FDG) injected into patient" },
        { title: "Uptake", desc: "Tracer accumulates in metabolically active tissue" },
        { title: "Decay", desc: "Positrons emitted, annihilate with electrons" },
        { title: "Detection", desc: "Two gamma rays detected at 180° apart" },
        { title: "Mapping", desc: "Computer creates metabolic activity map" }
      ],
      scanInfo: { title: "PET-CT Fusion", desc: "Hot spots show high glucose uptake in tumors.", bestFor: "Cancer staging, neurology, cardiology" }
    }
  };

  const quizQuestions = [
    { q: "Which imaging modality uses NO ionizing radiation?", options: ["CT Scan", "X-Ray", "MRI", "PET Scan"], correct: 2, explanation: "MRI uses magnetic fields and radio waves, making it radiation-free." },
    { q: "What does the 'T' in 1.5T or 3T MRI refer to?", options: ["Time", "Tesla", "Tomography", "Transmission"], correct: 1, explanation: "Tesla measures magnetic field strength. Higher T = stronger magnet = better detail." },
    { q: "In CT scanning, what rotates around the patient?", options: ["Patient table", "Detector only", "X-ray tube and detectors", "Magnetic coils"], correct: 2, explanation: "The X-ray tube and detector array rotate together in the gantry." },
    { q: "What substance is commonly used as a radiotracer in PET?", options: ["Iodine contrast", "Gadolinium", "FDG (fluorodeoxyglucose)", "Barium sulfate"], correct: 2, explanation: "FDG is radioactive glucose that accumulates in metabolically active cells." },
    { q: "Ultrasound cannot image through which material?", options: ["Water", "Soft tissue", "Air/bone", "Blood"], correct: 2, explanation: "Sound waves reflect strongly at air and bone interfaces, blocking transmission." },
    { q: "Which modality is best for detecting bone fractures?", options: ["MRI", "Ultrasound", "X-Ray", "PET"], correct: 2, explanation: "X-rays are absorbed by dense bone, making fractures clearly visible." },
    { q: "What produces the signal in MRI imaging?", options: ["X-rays", "Sound waves", "Hydrogen atoms", "Gamma rays"], correct: 2, explanation: "Hydrogen atoms in water/fat emit RF signals when returning to equilibrium." },
    { q: "PET scans detect pairs of gamma rays traveling in what direction?", options: ["Same direction", "90° apart", "180° apart", "Random directions"], correct: 2, explanation: "Positron annihilation produces two 511keV gamma rays traveling in opposite directions." },
    { q: "Which modality provides real-time moving images?", options: ["CT", "MRI", "X-Ray", "Ultrasound"], correct: 3, explanation: "Ultrasound captures images continuously, showing real-time movement." },
    { q: "CT images are measured in what units?", options: ["Tesla", "Hounsfield Units", "Decibels", "Becquerels"], correct: 1, explanation: "Hounsfield Units (HU) measure tissue density relative to water (0 HU)." }
  ];

  useEffect(() => {
    if (!mountRef.current) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e293b);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(5, 3, 6);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.5;
    floor.receiveShadow = true;
    scene.add(floor);

    const machineGroup = new THREE.Group();
    scene.add(machineGroup);
    machineGroupRef.current = machineGroup;

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      if (isAnimating && machineGroup) machineGroup.rotation.y += 0.003;
      machineGroup.traverse((child) => {
        if (child.userData.pulse) child.material.emissiveIntensity = 0.3 + Math.sin(Date.now() * 0.003) * 0.2;
        if (child.userData.rotate) child.rotation.x += 0.05;
        if (child.userData.tableMove) child.position.x = Math.sin(Date.now() * 0.001) * 0.3;
      });
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
      if (mountRef.current && renderer.domElement) mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!machineGroupRef.current) return;
    const group = machineGroupRef.current;
    while (group.children.length > 0) group.remove(group.children[0]);

    if (selectedMachine === 'mri') buildMRI(group);
    else if (selectedMachine === 'ct') buildCT(group);
    else if (selectedMachine === 'xray') buildXRay(group);
    else if (selectedMachine === 'ultrasound') buildUltrasound(group);
    else if (selectedMachine === 'pet') buildPET(group);
  }, [selectedMachine, activeComponent]);

  const buildMRI = (group) => {
    const bodyLength = 2.8, outerRadius = 1.8, innerRadius = 0.9;
    
    const shellGeo = new THREE.CylinderGeometry(outerRadius, outerRadius, bodyLength, 64, 1, true);
    const shellMat = new THREE.MeshStandardMaterial({ color: activeComponent === 0 ? 0xd1fae5 : 0xf5f5f5, roughness: 0.3, side: THREE.DoubleSide });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.rotation.z = Math.PI / 2;
    shell.castShadow = true;
    group.add(shell);

    const ringGeo = new THREE.RingGeometry(innerRadius, outerRadius, 64);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, side: THREE.DoubleSide });
    const frontRing = new THREE.Mesh(ringGeo, ringMat);
    frontRing.position.x = bodyLength / 2;
    frontRing.rotation.y = Math.PI / 2;
    group.add(frontRing);
    const backRing = frontRing.clone();
    backRing.position.x = -bodyLength / 2;
    group.add(backRing);

    const boreGeo = new THREE.CylinderGeometry(innerRadius, innerRadius, bodyLength, 64, 1, true);
    const boreMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, side: THREE.DoubleSide });
    const bore = new THREE.Mesh(boreGeo, boreMat);
    bore.rotation.z = Math.PI / 2;
    group.add(bore);

    const accentGeo = new THREE.TorusGeometry(innerRadius + 0.02, 0.04, 16, 64);
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x1d4ed8, emissiveIntensity: 0.3 });
    const accent = new THREE.Mesh(accentGeo, accentMat);
    accent.position.x = bodyLength / 2 + 0.02;
    accent.rotation.y = Math.PI / 2;
    accent.userData.pulse = true;
    group.add(accent);

    for (let i = 0; i < 5; i++) {
      const coilGeo = new THREE.TorusGeometry(innerRadius - 0.1 - i * 0.08, 0.02, 8, 32);
      const coilMat = new THREE.MeshStandardMaterial({ color: activeComponent === 1 ? 0xa78bfa : 0x6366f1, emissive: 0x4f46e5, emissiveIntensity: 0.3, transparent: true, opacity: 0.5 });
      const coil = new THREE.Mesh(coilGeo, coilMat);
      coil.position.x = -0.8 + i * 0.4;
      coil.rotation.y = Math.PI / 2;
      coil.userData.pulse = true;
      group.add(coil);
    }

    const rfGeo = new THREE.TorusGeometry(0.35, 0.03, 8, 32);
    const rfMat = new THREE.MeshStandardMaterial({ color: activeComponent === 2 ? 0xfbbf24 : 0xf97316, emissive: 0xea580c, emissiveIntensity: 0.4 });
    const rf = new THREE.Mesh(rfGeo, rfMat);
    rf.rotation.y = Math.PI / 2;
    rf.userData.pulse = true;
    group.add(rf);

    const pedestalGeo = new THREE.BoxGeometry(0.6, 0.8, 0.6);
    const pedestalMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0 });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.set(2.5, -1.1, 0);
    group.add(pedestal);

    const tableGeo = new THREE.BoxGeometry(3.5, 0.12, 0.7);
    const tableMat = new THREE.MeshStandardMaterial({ color: activeComponent === 3 ? 0x60a5fa : 0x3b82f6 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(1, -0.65, 0);
    table.userData.tableMove = true;
    group.add(table);

    const handleShape = new THREE.Shape();
    handleShape.moveTo(0, 0);
    handleShape.quadraticCurveTo(0.4, 0.3, 0.8, 0);
    const handleGeo = new THREE.ExtrudeGeometry(handleShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 });
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x2563eb });
    const leftHandle = new THREE.Mesh(handleGeo, handleMat);
    leftHandle.position.set(2.2, -0.55, -0.35);
    leftHandle.rotation.x = Math.PI / 2;
    leftHandle.userData.tableMove = true;
    group.add(leftHandle);
    const rightHandle = leftHandle.clone();
    rightHandle.position.z = 0.27;
    rightHandle.userData.tableMove = true;
    group.add(rightHandle);

    const paddingGeo = new THREE.BoxGeometry(3.2, 0.05, 0.5);
    const paddingMat = new THREE.MeshStandardMaterial({ color: 0x60a5fa });
    const padding = new THREE.Mesh(paddingGeo, paddingMat);
    padding.position.set(1, -0.56, 0);
    padding.userData.tableMove = true;
    group.add(padding);
  };

  const buildCT = (group) => {
    const gantryOuterRadius = 1.9, gantryInnerRadius = 0.9, gantryDepth = 0.8;

    const frontPanelGeo = new THREE.RingGeometry(gantryInnerRadius, gantryOuterRadius, 64);
    const frontPanelMat = new THREE.MeshStandardMaterial({ color: activeComponent === 2 ? 0xdbeafe : 0xf5f5f5, side: THREE.DoubleSide });
    const frontPanel = new THREE.Mesh(frontPanelGeo, frontPanelMat);
    frontPanel.position.x = gantryDepth / 2;
    frontPanel.rotation.y = Math.PI / 2;
    group.add(frontPanel);
    const backPanel = frontPanel.clone();
    backPanel.position.x = -gantryDepth / 2;
    group.add(backPanel);

    const shellGeo = new THREE.CylinderGeometry(gantryOuterRadius, gantryOuterRadius, gantryDepth, 64, 1, true);
    const shellMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, side: THREE.DoubleSide });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.rotation.z = Math.PI / 2;
    group.add(shell);

    const boreGeo = new THREE.CylinderGeometry(gantryInnerRadius, gantryInnerRadius, gantryDepth + 0.1, 64, 1, true);
    const boreMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, side: THREE.DoubleSide });
    const bore = new THREE.Mesh(boreGeo, boreMat);
    bore.rotation.z = Math.PI / 2;
    group.add(bore);

    const accentGeo = new THREE.TorusGeometry(gantryInnerRadius + 0.05, 0.05, 16, 64);
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x1d4ed8, emissiveIntensity: 0.4 });
    const accent = new THREE.Mesh(accentGeo, accentMat);
    accent.position.x = gantryDepth / 2 + 0.02;
    accent.rotation.y = Math.PI / 2;
    accent.userData.pulse = true;
    group.add(accent);

    const rotatingGroup = new THREE.Group();
    rotatingGroup.userData.rotate = true;

    const tubeGeo = new THREE.BoxGeometry(0.25, 0.15, 0.2);
    const tubeMat = new THREE.MeshStandardMaterial({ color: activeComponent === 0 ? 0xfca5a5 : 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.4 });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    tube.position.set(0, gantryInnerRadius + 0.15, 0);
    rotatingGroup.add(tube);

    const detectorGeo = new THREE.BoxGeometry(0.4, 0.08, 0.3);
    const detectorMat = new THREE.MeshStandardMaterial({ color: activeComponent === 1 ? 0x86efac : 0x22c55e, emissive: 0x16a34a, emissiveIntensity: 0.3 });
    const detector = new THREE.Mesh(detectorGeo, detectorMat);
    detector.position.set(0, -gantryInnerRadius - 0.1, 0);
    rotatingGroup.add(detector);

    const beamGeo = new THREE.ConeGeometry(0.3, gantryInnerRadius * 2, 32, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.15 });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.rotation.x = Math.PI;
    rotatingGroup.add(beam);

    group.add(rotatingGroup);

    const tableGeo = new THREE.BoxGeometry(4, 0.1, 0.6);
    const tableMat = new THREE.MeshStandardMaterial({ color: activeComponent === 3 ? 0x60a5fa : 0x3b82f6 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(1, -0.75, 0);
    table.userData.tableMove = true;
    group.add(table);

    const pedestalGeo = new THREE.BoxGeometry(0.5, 0.7, 0.5);
    const pedestal = new THREE.Mesh(pedestalGeo, new THREE.MeshStandardMaterial({ color: 0xf0f0f0 }));
    pedestal.position.set(2.5, -1.1, 0);
    group.add(pedestal);
  };

  const buildXRay = (group) => {
    const columnGeo = new THREE.BoxGeometry(0.4, 2.2, 0.4);
    const columnMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });
    const column = new THREE.Mesh(columnGeo, columnMat);
    column.position.set(-1.2, 0, 0);
    group.add(column);

    const baseGeo = new THREE.BoxGeometry(0.7, 0.3, 0.7);
    const base = new THREE.Mesh(baseGeo, columnMat);
    base.position.set(-1.2, -1.25, 0);
    group.add(base);

    const panelGeo = new THREE.BoxGeometry(0.15, 0.4, 0.3);
    const panelMat = new THREE.MeshStandardMaterial({ color: activeComponent === 2 ? 0x86efac : 0x1f2937 });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(-0.95, 0, 0);
    group.add(panel);

    const armGeo = new THREE.BoxGeometry(2.2, 0.15, 0.15);
    const armMat = new THREE.MeshStandardMaterial({ color: 0xe5e7eb });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.set(0, 1.0, 0);
    group.add(arm);

    const tubeGeo = new THREE.BoxGeometry(0.4, 0.25, 0.35);
    const tubeMat = new THREE.MeshStandardMaterial({ color: activeComponent === 0 ? 0xfca5a5 : 0xd1d5db });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    tube.position.set(1, 0.85, 0);
    group.add(tube);

    const collGeo = new THREE.CylinderGeometry(0.08, 0.15, 0.2, 16);
    const collMat = new THREE.MeshStandardMaterial({ color: activeComponent === 1 ? 0x6b7280 : 0x374151 });
    const coll = new THREE.Mesh(collGeo, collMat);
    coll.position.set(1, 0.62, 0);
    group.add(coll);

    const beamGeo = new THREE.ConeGeometry(0.6, 1.5, 32, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(1, -0.25, 0);
    beam.rotation.x = Math.PI;
    group.add(beam);

    const tableGeo = new THREE.BoxGeometry(2.8, 0.12, 0.9);
    const tableMat = new THREE.MeshStandardMaterial({ color: activeComponent === 3 ? 0x64748b : 0x475569 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(0.8, -1, 0);
    group.add(table);

    const tablePedestalGeo = new THREE.BoxGeometry(0.8, 0.4, 0.6);
    const tablePedestal = new THREE.Mesh(tablePedestalGeo, new THREE.MeshStandardMaterial({ color: 0xd1d5db }));
    tablePedestal.position.set(1.8, -1.3, 0);
    group.add(tablePedestal);

    const patientGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.4, 16);
    const patientMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const patient = new THREE.Mesh(patientGeo, patientMat);
    patient.rotation.z = Math.PI / 2;
    patient.position.set(1, -0.8, 0);
    group.add(patient);

    const detectorGeo = new THREE.BoxGeometry(0.5, 0.06, 0.4);
    const detectorMat = new THREE.MeshStandardMaterial({ color: activeComponent === 2 ? 0x86efac : 0x22c55e, emissive: 0x16a34a, emissiveIntensity: 0.2 });
    const detector = new THREE.Mesh(detectorGeo, detectorMat);
    detector.position.set(1, -1.1, 0);
    group.add(detector);
  };

  const buildUltrasound = (group) => {
    const cartGeo = new THREE.BoxGeometry(0.6, 1.0, 0.5);
    const cartMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });
    const cart = new THREE.Mesh(cartGeo, cartMat);
    cart.position.set(-1.3, -1, 0);
    group.add(cart);

    const standGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 16);
    const standMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af });
    const stand = new THREE.Mesh(standGeo, standMat);
    stand.position.set(-1.3, -0.2, 0);
    group.add(stand);

    const monitorGeo = new THREE.BoxGeometry(0.5, 0.4, 0.08);
    const monitorMat = new THREE.MeshStandardMaterial({ color: activeComponent === 1 ? 0x6366f1 : 0x1f2937 });
    const monitor = new THREE.Mesh(monitorGeo, monitorMat);
    monitor.position.set(-1.3, 0.2, 0.1);
    monitor.rotation.x = -0.15;
    group.add(monitor);

    const screenGeo = new THREE.PlaneGeometry(0.42, 0.32);
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, emissive: 0x312e81, emissiveIntensity: 0.3 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(-1.3, 0.2, 0.15);
    screen.rotation.x = -0.15;
    group.add(screen);

    const bedGeo = new THREE.BoxGeometry(2.8, 0.15, 0.9);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.set(0.8, -1.0, 0);
    group.add(bed);

    const bedBaseGeo = new THREE.BoxGeometry(0.6, 0.4, 0.5);
    const bedBase = new THREE.Mesh(bedBaseGeo, new THREE.MeshStandardMaterial({ color: 0xd1d5db }));
    bedBase.position.set(1.5, -1.3, 0);
    group.add(bedBase);

    const patientGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.6, 16);
    const patientMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });
    const patient = new THREE.Mesh(patientGeo, patientMat);
    patient.rotation.z = Math.PI / 2;
    patient.position.set(0.8, -0.75, 0);
    group.add(patient);

    const probeHandleGeo = new THREE.BoxGeometry(0.06, 0.2, 0.04);
    const probeMat = new THREE.MeshStandardMaterial({ color: activeComponent === 0 ? 0xa78bfa : 0x6b7280 });
    const probeHandle = new THREE.Mesh(probeHandleGeo, probeMat);
    probeHandle.position.set(0.3, -0.5, 0.3);
    probeHandle.rotation.z = 0.4;
    group.add(probeHandle);

    const probeHeadGeo = new THREE.SphereGeometry(0.05, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const probeHead = new THREE.Mesh(probeHeadGeo, probeMat);
    probeHead.position.set(0.35, -0.62, 0.3);
    probeHead.rotation.x = Math.PI;
    group.add(probeHead);

    const cablePoints = [
      new THREE.Vector3(0.28, -0.42, 0.3),
      new THREE.Vector3(-0.2, -0.3, 0.25),
      new THREE.Vector3(-0.8, -0.4, 0.2),
      new THREE.Vector3(-1.1, -0.6, 0.15)
    ];
    const cableCurve = new THREE.CatmullRomCurve3(cablePoints);
    const cableGeo = new THREE.TubeGeometry(cableCurve, 20, 0.015, 8, false);
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x374151 });
    const cable = new THREE.Mesh(cableGeo, cableMat);
    group.add(cable);

    for (let i = 0; i < 3; i++) {
      const waveGeo = new THREE.TorusGeometry(0.08 + i * 0.06, 0.008, 8, 16, Math.PI);
      const waveMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.5 - i * 0.12 });
      const wave = new THREE.Mesh(waveGeo, waveMat);
      wave.position.set(0.38 + i * 0.03, -0.68 - i * 0.04, 0.3);
      wave.rotation.x = Math.PI / 2;
      wave.rotation.z = -0.4;
      wave.userData.pulse = true;
      group.add(wave);
    }
  };

  const buildPET = (group) => {
    const gantryOuterRadius = 1.9, gantryInnerRadius = 0.9, gantryDepth = 1.2;

    const frontPanelGeo = new THREE.RingGeometry(gantryInnerRadius, gantryOuterRadius, 64);
    const frontPanelMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, side: THREE.DoubleSide });
    const frontPanel = new THREE.Mesh(frontPanelGeo, frontPanelMat);
    frontPanel.position.x = gantryDepth / 2;
    frontPanel.rotation.y = Math.PI / 2;
    group.add(frontPanel);
    const backPanel = frontPanel.clone();
    backPanel.position.x = -gantryDepth / 2;
    group.add(backPanel);

    const shellGeo = new THREE.CylinderGeometry(gantryOuterRadius, gantryOuterRadius, gantryDepth, 64, 1, true);
    const shellMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, side: THREE.DoubleSide });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.rotation.z = Math.PI / 2;
    group.add(shell);

    const boreGeo = new THREE.CylinderGeometry(gantryInnerRadius, gantryInnerRadius, gantryDepth + 0.1, 64, 1, true);
    const boreMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, side: THREE.DoubleSide });
    const bore = new THREE.Mesh(boreGeo, boreMat);
    bore.rotation.z = Math.PI / 2;
    group.add(bore);

    const accentGeo = new THREE.TorusGeometry(gantryInnerRadius + 0.05, 0.05, 16, 64);
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x1d4ed8, emissiveIntensity: 0.4 });
    const accent = new THREE.Mesh(accentGeo, accentMat);
    accent.position.x = gantryDepth / 2 + 0.02;
    accent.rotation.y = Math.PI / 2;
    accent.userData.pulse = true;
    group.add(accent);

    const detectorGeo = new THREE.TorusGeometry(gantryInnerRadius + 0.15, 0.1, 8, 64);
    const detectorMat = new THREE.MeshStandardMaterial({ color: activeComponent === 0 ? 0xbef264 : 0x84cc16, emissive: 0x65a30d, emissiveIntensity: 0.3 });
    const detector = new THREE.Mesh(detectorGeo, detectorMat);
    detector.rotation.y = Math.PI / 2;
    detector.userData.pulse = true;
    group.add(detector);

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rayGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.7, 8);
      const rayMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.6 });
      const ray = new THREE.Mesh(rayGeo, rayMat);
      ray.position.set(0, Math.sin(angle) * 0.4, Math.cos(angle) * 0.4);
      ray.rotation.x = angle + Math.PI / 2;
      ray.userData.pulse = true;
      group.add(ray);
    }

    const tableGeo = new THREE.BoxGeometry(3.2, 0.1, 0.6);
    const tableMat = new THREE.MeshStandardMaterial({ color: activeComponent === 3 ? 0x60a5fa : 0x3b82f6 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(0.8, -0.75, 0);
    table.userData.tableMove = true;
    group.add(table);

    const pedestalGeo = new THREE.BoxGeometry(0.5, 0.7, 0.5);
    const pedestal = new THREE.Mesh(pedestalGeo, new THREE.MeshStandardMaterial({ color: 0xf0f0f0 }));
    pedestal.position.set(2.2, -1.15, 0);
    group.add(pedestal);
  };

  const handleAnswer = (i) => {
    if (quizState.answered) return;
    setQuizState(s => ({ ...s, answered: true, selected: i, score: i === quizQuestions[quizState.current].correct ? s.score + 1 : s.score }));
  };
  const nextQuestion = () => {
    if (quizState.current >= quizQuestions.length - 1) setQuizState(s => ({ ...s, finished: true }));
    else setQuizState(s => ({ ...s, current: s.current + 1, answered: false, selected: null }));
  };
  const resetQuiz = () => setQuizState({ current: 0, score: 0, answered: false, selected: null, finished: false });

  const ScanOutput = ({ type }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = 180, h = 180;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);

      if (type === 'mri') {
        ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.ellipse(90, 90, 70, 80, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ddd'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#555'; ctx.beginPath(); ctx.ellipse(90, 90, 60, 70, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#888'; ctx.beginPath(); ctx.ellipse(90, 85, 40, 50, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#222'; ctx.beginPath(); ctx.ellipse(75, 80, 8, 18, -0.3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(105, 80, 8, 18, 0.3, 0, Math.PI * 2); ctx.fill();
      } else if (type === 'ct') {
        ctx.fillStyle = '#111'; ctx.beginPath(); ctx.ellipse(90, 90, 80, 65, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#eee'; ctx.fillRect(82, 130, 16, 30);
        for (let i = 0; i < 8; i++) { ctx.fillStyle = '#ddd'; ctx.fillRect(25 + i * 18, 50, 4, 25); ctx.fillRect(25 + i * 18, 100, 4, 25); }
        ctx.fillStyle = '#333'; ctx.beginPath(); ctx.ellipse(55, 85, 25, 30, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(125, 85, 25, 30, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#666'; ctx.beginPath(); ctx.ellipse(90, 100, 20, 15, 0, 0, Math.PI * 2); ctx.fill();
      } else if (type === 'xray') {
        ctx.fillStyle = '#222'; ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#ddd'; ctx.lineWidth = 2;
        for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.moveTo(20, 30 + i * 12); ctx.quadraticCurveTo(90, 25 + i * 12, 160, 30 + i * 12); ctx.stroke(); }
        ctx.fillStyle = '#555'; ctx.beginPath(); ctx.ellipse(90, 100, 35, 45, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#333'; ctx.beginPath(); ctx.moveTo(70, 145); ctx.lineTo(90, 170); ctx.lineTo(110, 145); ctx.closePath(); ctx.fill();
      } else if (type === 'ultrasound') {
        ctx.fillStyle = '#111'; ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 1000; i++) { ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.3})`; ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
        ctx.fillStyle = '#333'; ctx.beginPath(); ctx.ellipse(90, 90, 50, 60, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#444'; ctx.beginPath(); ctx.ellipse(90, 85, 25, 35, 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#666'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(85, 80, 8, 10, 0, 0, Math.PI * 2); ctx.stroke();
      } else if (type === 'pet') {
        ctx.fillStyle = '#0a0a15'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#1a1a2e'; ctx.beginPath(); ctx.ellipse(90, 90, 70, 80, 0, 0, Math.PI * 2); ctx.fill();
        const gradient = ctx.createRadialGradient(60, 70, 5, 60, 70, 25);
        gradient.addColorStop(0, '#ff0'); gradient.addColorStop(0.5, '#f80'); gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient; ctx.beginPath(); ctx.ellipse(60, 70, 20, 25, 0, 0, Math.PI * 2); ctx.fill();
        const gradient2 = ctx.createRadialGradient(120, 100, 3, 120, 100, 15);
        gradient2.addColorStop(0, '#ff0'); gradient2.addColorStop(0.5, '#f80'); gradient2.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient2; ctx.beginPath(); ctx.ellipse(120, 100, 12, 15, 0, 0, Math.PI * 2); ctx.fill();
      }
    }, [type]);
    return <canvas ref={canvasRef} width={180} height={180} className="rounded-lg border border-slate-600" />;
  };

  const machine = machines[selectedMachine];

  return (
    <div className="w-full min-h-screen bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">🏥 Medical Imaging Explorer</h1>
        
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {Object.entries(machines).map(([key, m]) => (
            <button key={key} onClick={() => { setSelectedMachine(key); setActiveComponent(null); setCurrentStep(0); }}
              className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${selectedMachine === key ? 'text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              style={selectedMachine === key ? { backgroundColor: m.color } : {}}>
              {m.icon} {m.name}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-slate-800 rounded-xl overflow-hidden">
            <div ref={mountRef} className="w-full h-80" />
            <div className="p-3 flex justify-between items-center border-t border-slate-700">
              <span className="text-sm text-slate-400">{machine.fullName}</span>
              <button onClick={() => setIsAnimating(!isAnimating)}
                className={`px-3 py-1 rounded text-sm ${isAnimating ? 'bg-blue-600' : 'bg-slate-600'}`}>
                {isAnimating ? '⏸ Pause' : '▶ Rotate'}
              </button>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-4">
            <div className="flex gap-2 mb-4">
              <button onClick={() => setActiveTab('learn')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'learn' ? 'bg-blue-600' : 'bg-slate-700'}`}>📚 Learn</button>
              <button onClick={() => setActiveTab('quiz')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'quiz' ? 'bg-green-600' : 'bg-slate-700'}`}>❓ Quiz</button>
            </div>

            {activeTab === 'learn' ? (
              <div className="space-y-4">
                <p className="text-slate-300 text-sm">{machine.description}</p>
                
                <div>
                  <h3 className="font-semibold mb-2 text-sm">Components</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {machine.components.map((c, i) => (
                      <button key={i} onClick={() => setActiveComponent(activeComponent === i ? null : i)}
                        className={`p-2 rounded text-left text-xs transition-all ${activeComponent === i ? 'bg-blue-600/30 border border-blue-500' : 'bg-slate-700 hover:bg-slate-600'}`}>
                        <div className="font-medium">{c.name}</div>
                        {activeComponent === i && <div className="text-slate-300 mt-1">{c.desc}</div>}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-sm">How It Works</h3>
                  <div className="flex gap-1 mb-2">
                    {machine.steps.map((_, i) => (
                      <button key={i} onClick={() => setCurrentStep(i)}
                        className={`flex-1 h-1.5 rounded ${i <= currentStep ? 'bg-blue-500' : 'bg-slate-600'}`} />
                    ))}
                  </div>
                  <div className="bg-slate-700 p-3 rounded">
                    <div className="font-medium text-sm">{currentStep + 1}. {machine.steps[currentStep].title}</div>
                    <div className="text-slate-300 text-xs mt-1">{machine.steps[currentStep].desc}</div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}
                      className="px-3 py-1 bg-slate-700 rounded text-sm disabled:opacity-50">← Back</button>
                    <button onClick={() => setCurrentStep(Math.min(machine.steps.length - 1, currentStep + 1))} disabled={currentStep === machine.steps.length - 1}
                      className="px-3 py-1 bg-slate-700 rounded text-sm disabled:opacity-50">Next →</button>
                  </div>
                </div>

                <div>
                  <button onClick={() => setShowScanOutput(!showScanOutput)} className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium">
                    {showScanOutput ? '🖼 Hide Output' : '🖼 Show Scan Output'}
                  </button>
                  {showScanOutput && (
                    <div className="mt-3 p-3 bg-slate-700 rounded-lg">
                      <div className="flex gap-4">
                        <ScanOutput type={selectedMachine} />
                        <div>
                          <h4 className="font-semibold text-sm">{machine.scanInfo.title}</h4>
                          <p className="text-slate-300 text-xs mt-1">{machine.scanInfo.desc}</p>
                          <p className="text-blue-400 text-xs mt-2">Best for: {machine.scanInfo.bestFor}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {quizState.finished ? (
                  <div className="text-center py-6">
                    <div className="text-4xl mb-3">{quizState.score >= 8 ? '🏆' : quizState.score >= 5 ? '👍' : '📚'}</div>
                    <div className="text-xl font-bold">{quizState.score} / {quizQuestions.length}</div>
                    <div className="text-slate-400 mt-1 text-sm">{quizState.score >= 8 ? 'Excellent!' : quizState.score >= 5 ? 'Good job!' : 'Keep studying!'}</div>
                    <button onClick={resetQuiz} className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">Try Again</button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-slate-400">Question {quizState.current + 1}/{quizQuestions.length}</span>
                      <span className="text-sm">Score: {quizState.score}</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded mb-4">
                      <div className="h-full bg-green-500 rounded transition-all" style={{ width: `${((quizState.current + 1) / quizQuestions.length) * 100}%` }} />
                    </div>
                    <p className="font-medium mb-4 text-sm">{quizQuestions[quizState.current].q}</p>
                    <div className="space-y-2 mb-4">
                      {quizQuestions[quizState.current].options.map((opt, i) => (
                        <button key={i} onClick={() => handleAnswer(i)}
                          className={`w-full p-3 rounded-lg text-left text-sm transition-all ${
                            quizState.answered
                              ? i === quizQuestions[quizState.current].correct ? 'bg-green-600/30 border border-green-500'
                                : i === quizState.selected ? 'bg-red-600/30 border border-red-500' : 'bg-slate-700/50'
                              : 'bg-slate-700 hover:bg-slate-600'
                          }`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                    {quizState.answered && (
                      <>
                        <div className={`p-3 rounded-lg mb-3 text-xs ${quizState.selected === quizQuestions[quizState.current].correct ? 'bg-green-500/10 border border-green-500/30' : 'bg-slate-700'}`}>
                          {quizQuestions[quizState.current].explanation}
                        </div>
                        <button onClick={nextQuestion} className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium">
                          {quizState.current >= quizQuestions.length - 1 ? 'See Results' : 'Next Question →'}
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 text-center text-slate-500 text-xs">Created by Mohammad Khalaf • Biomedical Engineering</div>
      </div>
    </div>
  );
}
