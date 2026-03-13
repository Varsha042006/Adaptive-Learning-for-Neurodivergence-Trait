# Adaptive Learning Platform for Neurodivergent Individuals

A comprehensive full-stack application that provides personalized learning experiences for individuals with neurodivergent traits including Dyslexia, ADHD, Autism, and Dyspraxia.

## Features

### 🔐 One-Time Login
- Simple username-based authentication
- Session management with localStorage

### 🎤 Voice Assistant & Trait Selection
- Voice recognition for automatic trait detection
- Manual trait selection option
- Supports detection of:
  - Dyslexia (Reading Difficulty)
  - ADHD (Attention Difficulty) 
  - Autism Spectrum
  - Dyspraxia (Motor Coordination Difficulty)

### 🧠 AI-Driven UI/UX Adaptation
- Dynamic interface changes based on selected traits
- Real-time CSS class application for different neurodivergent needs
- Personalized learning environment

### 📄 PDF Upload & Modification
- Upload PDF documents
- Automatic content adaptation based on user traits
- Real-time text transformation:
  - **Dyslexia**: Short sentences, bullet points, increased spacing
  - **ADHD**: Content chunking, focused presentation
  - **Autism**: Structured step-by-step format
  - **Dyspraxia**: Simplified text, larger elements

## AI Datasets

### Dyslexia Dataset
- **Key Problems**: Reading difficulty, letter confusion, slow reading
- **Features**: Reading speed, text interaction, font preferences
- **Solutions**: OpenDyslexic font, increased spacing, text-to-speech

### ADHD Dataset  
- **Key Problems**: Distraction, focus issues, task switching
- **Features**: Attention duration, tab switching, scrolling patterns
- **Solutions**: Focus mode, content chunking, Pomodoro timer

### Autism Dataset
- **Key Problems**: Unclear instructions, color sensitivity, need structure
- **Features**: Interaction consistency, animation avoidance
- **Solutions**: Structured learning flow, minimal animations, clear labels

### Dyspraxia Dataset
- **Key Problems**: Typing difficulty, navigation issues, motor challenges
- **Features**: Typing speed, click accuracy, navigation time
- **Solutions**: Large buttons, voice input, keyboard shortcuts

## Technology Stack

### Backend
- **Node.js** with Express
- **PDF processing** with pdf-parse
- **File uploads** with Multer
- **Session management** with in-memory storage

### Frontend
- **React 18** with TypeScript
- **Voice recognition** using Web Speech API
- **Axios** for API communication
- **Dynamic CSS** for trait-based adaptations

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Start the development servers:
   ```bash
   npm run dev
   ```

This will start:
- Backend server on http://localhost:5000
- Frontend on http://localhost:3000

## Usage

1. **Login**: Enter your name for one-time authentication
2. **Trait Selection**: 
   - Use voice assistant by clicking "Start Voice Assistant"
   - Or select traits manually
3. **Experience Adaptive UI**: Interface automatically adjusts based on selected traits
4. **Upload PDF**: Upload documents for automatic content adaptation

## Voice Commands

Say any of the following to select traits:
- "dyslexia" or "reading difficulty"
- "ADHD" or "attention problems" 
- "autism" or "autistic"
- "dyspraxia" or "motor coordination"

## UI Adaptations

### Dyslexia Mode
- OpenDyslexic font
- Increased letter/line spacing
- Soft background colors
- Text-to-speech support

### ADHD Focus Mode
- Clean, distraction-free interface
- Hidden sidebars and extra buttons
- Content chunking
- Progress tracking

### Autism Mode
- Minimal animations
- Soft, consistent colors
- Structured layouts
- Clear, step-by-step instructions

### Dyspraxia Mode
- Large, easy-to-click buttons
- Simplified navigation
- Voice input support
- Keyboard shortcuts

## API Endpoints

- `POST /api/login` - User authentication
- `POST /api/select-traits` - Save selected traits
- `GET /api/ai-dataset` - Get AI training data
- `POST /api/upload-pdf` - Upload and process PDF

## Project Structure

```
hackathon/
├── server/
│   └── index.js          # Backend server with AI datasets
├── client/
│   ├── public/
│   │   └── index.html    # HTML template
│   ├── src/
│   │   ├── App.tsx       # Main React component
│   │   ├── index.tsx     # React entry point
│   │   └── index.css     # Adaptive styles
│   ├── package.json      # Frontend dependencies
│   └── tsconfig.json     # TypeScript configuration
└── package.json          # Root package with scripts
```

## Contributing

This project was developed for a hackathon focused on accessibility and adaptive learning technologies.

## License

MIT License
