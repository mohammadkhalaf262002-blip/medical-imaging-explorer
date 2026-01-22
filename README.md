# 🏥 Medical Imaging Explorer

An interactive 3D educational tool for learning how medical imaging machines work. Built with React and Three.js.

![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)
![Three.js](https://img.shields.io/badge/Three.js-r128-black?logo=three.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌐 Live Demo

**[View Live Demo →](https://medical-imaging-explorer.vercel.app)**

## ✨ Features

### 🎮 Interactive 3D Models
- **5 Imaging Modalities**: MRI, CT Scan, X-Ray, Ultrasound, PET Scanner
- Realistic 3D representations with accurate components
- Auto-rotation with pause/play controls
- Click components to highlight and learn about them

### 📚 Learn Mode
- Detailed component breakdowns for each machine
- Step-by-step imaging process explanations
- Best clinical uses for each modality

### 🖼️ Scan Output Viewer
- Simulated scan images showing what each modality produces
- Brain MRI, Chest CT, Chest X-Ray, Fetal Ultrasound, PET Scan
- Educational descriptions of image characteristics

### ❓ Quiz Mode
- 10 questions covering all imaging modalities
- Immediate feedback with detailed explanations
- Progress tracking and score display
- Performance-based results screen

## 🖼️ Screenshots

| MRI Scanner | CT Scanner | X-Ray |
|-------------|------------|-------|
| Hollow bore with gradient coils | Rotating gantry with X-ray tube | Ceiling-mounted tube with table |

| Ultrasound | PET Scanner |
|------------|-------------|
| Cart with probe and sound waves | Ring detector with gamma rays |

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **Three.js** | 3D Rendering |
| **Tailwind CSS** | Styling |
| **Vite** | Build Tool |
| **Vercel** | Deployment |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/medical-imaging-explorer.git

# Navigate to project directory
cd medical-imaging-explorer

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
medical-imaging-explorer/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎓 Educational Content

### Imaging Modalities Covered

| Modality | Physics Principle | Best Clinical Uses |
|----------|-------------------|-------------------|
| **MRI** | Magnetic fields + RF waves | Brain, spine, joints, soft tissues |
| **CT** | Rotating X-ray beams | Chest, abdomen, trauma, cancer staging |
| **X-Ray** | X-ray projection | Fractures, pneumonia, heart size |
| **Ultrasound** | Sound wave echoes | Pregnancy, heart, abdomen, vessels |
| **PET** | Radiotracer gamma rays | Cancer staging, neurology, cardiology |

### Quiz Topics
- Radiation vs non-radiation modalities
- Magnetic field strength (Tesla)
- CT gantry components
- PET radiotracers (FDG)
- Ultrasound limitations
- Image measurement units (Hounsfield Units)

## 🔮 Future Enhancements

- [ ] Add more imaging modalities (Mammography, Fluoroscopy, SPECT)
- [ ] Include real DICOM image examples
- [ ] Add VR/AR support for immersive learning
- [ ] Multi-language support
- [ ] Downloadable certificate after quiz completion
- [ ] Comparison mode (side-by-side modalities)

## 👨‍💻 Author

**Mohammad Khalaf**  
Biomedical Engineering Graduate | Işık University, Istanbul

- 📧 Email: [mohammadkhalaf.bme@gmail.com](mailto:mohammadkhalaf.bme@gmail.com)
- 💼 LinkedIn: https://www.linkedin.com/in/mohammad-khalaf-b80273261/


## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Three.js community for excellent 3D documentation
- Medical imaging resources from RadiologyInfo.org
- Tailwind CSS for rapid UI development

---

⭐ **If you found this project helpful, please give it a star!** ⭐
