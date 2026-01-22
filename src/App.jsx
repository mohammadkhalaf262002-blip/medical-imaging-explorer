import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function App() {
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

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = 300;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 2, 6);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    const pointLight = new THREE.PointLight(0x10b981, 0.5);
    pointLight.position.set(-3, 3, 3);
    scene.add(pointLight);

    const machineGroup = new THREE.Group();
    scene.add(machineGroup);
    machineGroupRef.current = machineGroup;

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

    let rotationAngle = 0;
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      if (isAnimating && machineGroupRef.current) {
        machineGroupRef.current.rotation.y += 0.005;
        rotationAngle += 0.02;
        
        machineGroupRef.current.children.forEach(child => {
          if (child.userData.rotate) child.rotation.z += 0.03;
          if (child.userData.pulse) {
            const scale = 1 + Math.sin(rotationAngle * 2) * 0.1;
            child.scale.set(scale, scale, scale);
          }
          if (child.userData.beam) child.material.opacity = 0.3 + Math.sin(rotationAngle * 3) * 0.2;
        });
      }
      
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseleave', onMouseUp);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!machineGroupRef.current) return;

    while (machineGroupRef.current.children.length > 0) {
      machineGroupRef.current.remove(machineGroupRef.current.children[0]);
    }

    const group = machineGroupRef.current;

    if (selectedMachine === 'mri') {
      const outerGeo = new THREE.CylinderGeometry(2, 2, 3, 32, 1, true);
      const outerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, side: THREE.DoubleSide });
      const outer = new THREE.Mesh(outerGeo, outerMat);
      outer.rotation.z = Math.PI / 2;
      group.add(outer);

      const boreGeo = new THREE.CylinderGeometry(1.2, 1.2, 3.2, 32, 1, true);
      const boreMat = new THREE.MeshStandardMaterial({ color: 0x334155, side: THREE.DoubleSide });
      const bore = new THREE.Mesh(boreGeo, boreMat);
      bore.rotation.z = Math.PI / 2;
      group.add(bore);

      for (let i = -1; i <= 1; i++) {
        const ringGeo = new THREE.TorusGeometry(1.5, 0.08, 16, 100);
        const ringMat = new THREE.MeshStandardMaterial({ color: activeComponent === 1 ? 0x8b5cf6 : 0x4c1d95 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.x = i * 0.8;
        ring.rotation.y = Math.PI / 2;
        group.add(ring);
      }

      const rfGeo = new THREE.TorusGeometry(0.9, 0.05, 16, 100);
      const rfMat = new THREE.MeshStandardMaterial({ color: activeComponent === 2 ? 0xf59e0b : 0x92400e, emissive: 0xf59e0b, emissiveIntensity: 0.2 });
      const rf = new THREE.Mesh(rfGeo, rfMat);
      rf.rotation.y = Math.PI / 2;
      rf.userData.pulse = true;
      group.add(rf);

      const tableGeo = new THREE.BoxGeometry(4, 0.15, 0.8);
      const tableMat = new THREE.MeshStandardMaterial({ color: activeComponent === 3 ? 0x9ca3af : 0x4b5563 });
      const table = new THREE.Mesh(tableGeo, tableMat);
      table.position.y = -0.8;
      group.add(table);

      const capGeo = new THREE.RingGeometry(1.2, 2, 32);
      const capMat = new THREE.MeshStandardMaterial({ color: 0x10b981, side: THREE.DoubleSide });
      const cap1 = new THREE.Mesh(capGeo, capMat);
      cap1.position.x = 1.5;
      cap1.rotation.y = Math.PI / 2;
      group.add(cap1);
      const cap2 = cap1.clone();
      cap2.position.x = -1.5;
      group.add(cap2);

    } else if (selectedMachine === 'ct') {
      const gantryGeo = new THREE.TorusGeometry(2, 0.5, 16, 100);
      const gantryMat = new THREE.MeshStandardMaterial({ color: activeComponent === 2 ? 0x4b5563 : 0x1e293b });
      const gantry = new THREE.Mesh(gantryGeo, gantryMat);
      gantry.rotation.x = Math.PI / 2;
      group.add(gantry);

      const rotatingGroup = new THREE.Group();
      rotatingGroup.userData.rotate = true;

      const tubeGeo = new THREE.BoxGeometry(0.4, 0.3, 0.3);
      const tubeMat = new THREE.MeshStandardMaterial({ color: activeComponent === 0 ? 0xef4444 : 0x991b1b, emissive: 0xef4444, emissiveIntensity: 0.3 });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      tube.position.set(0, 1.8, 0);
      rotatingGroup.add(tube);

      const detGeo = new THREE.BoxGeometry(0.6, 0.2, 0.4);
      const detMat = new THREE.MeshStandardMaterial({ color: activeComponent === 1 ? 0x10b981 : 0x065f46 });
      const det = new THREE.Mesh(detGeo, detMat);
      det.position.set(0, -1.8, 0);
      rotatingGroup.add(det);

      const beamGeo = new THREE.ConeGeometry(0.8, 3.2, 32, 1, true);
      const beamMat = new THREE.MeshStandardMaterial({ color: 0xef4444, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = 0;
      beam.rotation.x = Math.PI;
      beam.userData.beam = true;
      rotatingGroup.add(beam);

      group.add(rotatingGroup);

      const tableGeo = new THREE.BoxGeometry(4, 0.12, 0.7);
      const tableMat = new THREE.MeshStandardMaterial({ color: activeComponent === 3 ? 0x9ca3af : 0x4b5563 });
      const table = new THREE.Mesh(tableGeo, tableMat);
      table.position.y = -0.7;
      group.add(table);

      const housingGeo = new THREE.TorusGeometry(2.3, 0.3, 16, 100);
      const housingMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
      const housing = new THREE.Mesh(housingGeo, housingMat);
      housing.rotation.x = Math.PI / 2;
      group.add(housing);

    } else if (selectedMachine === 'xray') {
      const tubeHouseGeo = new THREE.BoxGeometry(0.8, 0.6, 0.6);
      const tubeHouseMat = new THREE.MeshStandardMaterial({ color: activeComponent === 0 ? 0xef4444 : 0x7f1d1d });
      const tubeHouse = new THREE.Mesh(tubeHouseGeo, tubeHouseMat);
      tubeHouse.position.y = 2.5;
      group.add(tubeHouse);

      const collGeo = new THREE.CylinderGeometry(0.3, 0.15, 0.4, 32);
      const collMat = new THREE.MeshStandardMaterial({ color: activeComponent === 1 ? 0xf59e0b : 0x92400e });
      const coll = new THREE.Mesh(collGeo, collMat);
      coll.position.y = 2;
      group.add(coll);

      const beamGeo = new THREE.ConeGeometry(1.5, 3.5, 32, 1, true);
      const beamMat = new THREE.MeshStandardMaterial({ color: 0xef4444, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = 0;
      beam.rotation.x = Math.PI;
      beam.userData.beam = true;
      group.add(beam);

      const tableGeo = new THREE.BoxGeometry(2.5, 0.12, 1.2);
      const tableMat = new THREE.MeshStandardMaterial({ color: activeComponent === 3 ? 0x9ca3af : 0x4b5563 });
      const table = new THREE.Mesh(tableGeo, tableMat);
      table.position.y = -0.5;
      group.add(table);

      const detGeo = new THREE.BoxGeometry(2.2, 0.1, 1.8);
      const detMat = new THREE.MeshStandardMaterial({ color: activeComponent === 2 ? 0x10b981 : 0x065f46 });
      const det = new THREE.Mesh(detGeo, detMat);
      det.position.y = -1.8;
      group.add(det);

      const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 3, 16);
      const armMat = new THREE.MeshStandardMaterial({ color: 0x6b7280 });
      const arm = new THREE.Mesh(armGeo, armMat);
      arm.position.set(0.8, 1, 0);
      group.add(arm);

    } else if (selectedMachine === 'ultrasound') {
      const bodyGeo = new THREE.BoxGeometry(1.2, 2, 0.8);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.set(-1.5, 0, 0);
      group.add(body);

      const monGeo = new THREE.BoxGeometry(1, 0.8, 0.1);
      const monMat = new THREE.MeshStandardMaterial({ color: activeComponent === 3 ? 0x1e293b : 0x0f172a, emissive: 0x8b5cf6, emissiveIntensity: 0.1 });
      const mon = new THREE.Mesh(monGeo, monMat);
      mon.position.set(-1.5, 1.2, 0.4);
      mon.rotation.x = -0.2;
      group.add(mon);

      const transGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.8, 32);
      const transMat = new THREE.MeshStandardMaterial({ color: activeComponent === 0 ? 0x8b5cf6 : 0x5b21b6 });
      const trans = new THREE.Mesh(transGeo, transMat);
      trans.position.set(1, 0.5, 0);
      trans.rotation.x = Math.PI / 4;
      group.add(trans);

      const piezoGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.05, 32);
      const piezoMat = new THREE.MeshStandardMaterial({ color: activeComponent === 1 ? 0x06b6d4 : 0x0e7490, emissive: 0x06b6d4, emissiveIntensity: 0.3 });
      const piezo = new THREE.Mesh(piezoGeo, piezoMat);
      piezo.position.set(1.28, 0.22, 0.28);
      piezo.rotation.x = Math.PI / 4;
      piezo.userData.pulse = true;
      group.add(piezo);

      const curvePoints = [
        new THREE.Vector3(-0.9, -0.3, 0),
        new THREE.Vector3(0, 0.2, 0.3),
        new THREE.Vector3(0.85, 0.7, 0.15)
      ];
      const curve = new THREE.CatmullRomCurve3(curvePoints);
      const cableGeo = new THREE.TubeGeometry(curve, 20, 0.04, 8, false);
      const cableMat = new THREE.MeshStandardMaterial({ color: 0x4b5563 });
      const cable = new THREE.Mesh(cableGeo, cableMat);
      group.add(cable);

      const patientGeo = new THREE.SphereGeometry(0.8, 32, 16);
      const patientMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
      const patient = new THREE.Mesh(patientGeo, patientMat);
      patient.position.set(1.3, -0.5, 0);
      patient.scale.set(1, 0.5, 0.8);
      group.add(patient);

      const gelGeo = new THREE.SphereGeometry(0.25, 32, 16);
      const gelMat = new THREE.MeshStandardMaterial({ color: activeComponent === 2 ? 0x10b981 : 0x065f46, transparent: true, opacity: 0.7 });
      const gel = new THREE.Mesh(gelGeo, gelMat);
      gel.position.set(1.28, 0, 0.2);
      gel.scale.set(1, 0.3, 1);
      group.add(gel);

    } else if (selectedMachine === 'pet') {
      const ringGeo = new THREE.TorusGeometry(2, 0.4, 16, 100);
      const ringMat = new THREE.MeshStandardMaterial({ color: activeComponent === 0 ? 0xf59e0b : 0x92400e });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);

      const crystalCount = 32;
      for (let i = 0; i < crystalCount; i++) {
        const angle = (i / crystalCount) * Math.PI * 2;
        const crystalGeo = new THREE.BoxGeometry(0.15, 0.3, 0.15);
        const crystalMat = new THREE.MeshStandardMaterial({ color: activeComponent === 1 ? 0x10b981 : 0x065f46, emissive: 0x10b981, emissiveIntensity: 0.2 });
        const crystal = new THREE.Mesh(crystalGeo, crystalMat);
        crystal.position.set(Math.cos(angle) * 1.8, Math.sin(angle) * 1.8, 0);
        crystal.lookAt(0, 0, 0);
        group.add(crystal);
      }

      const boreGeo = new THREE.CylinderGeometry(1.3, 1.3, 1, 32, 1, true);
      const boreMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, side: THREE.DoubleSide });
      const bore = new THREE.Mesh(boreGeo, boreMat);
      bore.rotation.x = Math.PI / 2;
      group.add(bore);

      const tracerGeo = new THREE.SphereGeometry(0.15, 16, 16);
      const tracerMat = new THREE.MeshStandardMaterial({ color: activeComponent === 3 ? 0xef4444 : 0xf87171, emissive: 0xef4444, emissiveIntensity: 0.8 });
      const tracer = new THREE.Mesh(tracerGeo, tracerMat);
      tracer.position.set(0.2, 0.1, 0);
      tracer.userData.pulse = true;
      group.add(tracer);

      const tableGeo = new THREE.BoxGeometry(4, 0.12, 0.7);
      const tableMat = new THREE.MeshStandardMaterial({ color: 0x4b5563 });
      const table = new THREE.Mesh(tableGeo, tableMat);
      table.position.y = -0.9;
      group.add(table);

      const housingGeo = new THREE.TorusGeometry(2.3, 0.2, 16, 100);
      const housingMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
      const housing = new THREE.Mesh(housingGeo, housingMat);
      housing.rotation.x = Math.PI / 2;
      group.add(housing);
    }

  }, [selectedMachine, activeComponent]);

  const handleQuizAnswer = (index) => {
    if (quizState.answered) return;
    setQuizState(prev => ({ ...prev, answered: true, selected: index, score: index === quizQuestions[prev.current].correct ? prev.score + 1 : prev.score }));
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
          const x = 30 + Math.random() * (w - 60);
          const y = 30 + Math.random() * (h - 60);
          ctx.fillRect(x, y, 2, 2);
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
      
    }, [selectedMachine]);
    
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
        
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold mb-1">Medical Imaging Explorer</h1>
          <p className="text-slate-400 text-xs">Interactive 3D guide to diagnostic imaging • Drag to rotate</p>
        </div>

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

            <div className="space-y-3">
              {showScanOutput && <ScanOutput />}
              
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
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === i ? 'text-white' : 'bg-slate-600 text-slate-400'}`}
                          style={{ backgroundColor: currentStep === i ? machine.color : undefined }}
                        >{i + 1}</div>
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

        <div className="mt-4 text-center text-slate-500 text-xs">
          Educational Tool • Mohammad Khalaf • Biomedical Engineering
        </div>
      </div>
    </div>
  );
}
