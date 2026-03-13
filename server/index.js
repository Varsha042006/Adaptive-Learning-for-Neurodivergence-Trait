const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// AI Dataset for neurodivergent traits
const aiDataset = {
  dyslexia: {
    keyProblems: [
      'Difficulty reading long text',
      'Confusing letters',
      'Slow reading speed',
      'Trouble understanding long instructions'
    ],
    features: [
      'Reading speed',
      'Time taken to read paragraph',
      'Text interaction',
      'Frequent re-reading',
      'Highlight usage',
      'Font readability preference',
      'User increases font size',
      'User increases spacing',
      'Audio usage',
      'Number of times user presses "listen"',
      'Scrolling behavior',
      'Slow scrolling'
    ],
    solutions: {
      textAdaptation: [
        'Convert long paragraphs → short sentences',
        'Highlight keywords',
        'Provide bullet points'
      ],
      uiChanges: [
        'Use OpenDyslexic font',
        'Increase letter spacing',
        'Increase line spacing',
        'Soft background color'
      ],
      assistiveFeatures: [
        'Text-to-speech',
        'Line-by-line highlighting',
        'Read-along mode'
      ]
    }
  },
  adhd: {
    keyProblems: [
      'Easily distracted',
      'Cannot focus on long content',
      'Frequently switches tasks',
      'Difficulty finishing lessons'
    ],
    features: [
      'Attention duration',
      'Time spent on section',
      'Tab switching',
      'Switching pages frequently',
      'Scrolling pattern',
      'Rapid scrolling',
      'Incomplete lessons',
      'Leaving mid lesson',
      'Click frequency',
      'Random clicking'
    ],
    solutions: {
      contentAdaptation: [
        'Break lessons into small chunks',
        'Each section 1–2 minutes reading time'
      ],
      uiAdaptation: [
        'Enable Focus Mode',
        'Hide sidebars',
        'Remove unnecessary buttons',
        'Show only reading area'
      ],
      productivityTools: [
        'Focus timer (Pomodoro)',
        'Progress bar',
        'Break reminders'
      ]
    }
  },
  autism: {
    keyProblems: [
      'Difficulty with unclear instructions',
      'Sensitivity to colors or animation',
      'Prefer predictable layouts',
      'Need structured learning'
    ],
    features: [
      'Interaction consistency',
      'Repeating same navigation pattern',
      'Animation avoidance',
      'Skipping interactive elements',
      'Instruction requests',
      'Frequently asking for help',
      'Color preference',
      'Switching to calm themes'
    ],
    solutions: {
      structuredLearning: [
        'Step 1: Introduction',
        'Step 2: Explanation',
        'Step 3: Example',
        'Step 4: Quiz',
        'Same structure for every lesson'
      ],
      uiAdaptation: [
        'Minimal animation',
        'Soft colors',
        'Consistent layout',
        'Clear labels'
      ],
      instructionSupport: [
        'Provide clear instructions',
        'Step-by-step guidance'
      ]
    }
  },
  dyspraxia: {
    keyProblems: [
      'Difficulty typing',
      'Difficulty navigating complex interfaces',
      'Slow motor movements',
      'Hard to click small buttons'
    ],
    features: [
      'Typing speed',
      'Frequent typing errors',
      'Click accuracy',
      'Navigation time',
      'Mouse movement irregularity'
    ],
    solutions: {
      inputAdaptation: [
        'Provide alternative input methods',
        'Voice-to-text',
        'Audio answers',
        'Drag-and-drop tasks'
      ],
      uiAdaptation: [
        'Large buttons',
        'Simple menus',
        'Fewer options'
      ],
      navigationSupport: [
        'Keyboard shortcuts',
        'Voice navigation',
        'Step-by-step interaction'
      ]
    }
  }
};

// Store user sessions
const userSessions = new Map();

// Routes
app.post('/api/login', (req, res) => {
  const { username } = req.body;
  const sessionId = Math.random().toString(36).substr(2, 9);
  userSessions.set(sessionId, {
    username,
    traits: [],
    loggedIn: true,
    loginTime: new Date()
  });
  res.json({ success: true, sessionId });
});

app.post('/api/select-traits', (req, res) => {
  const { sessionId, traits } = req.body;
  const session = userSessions.get(sessionId);
  if (session) {
    session.traits = traits;
    res.json({ success: true, traits, adaptations: getAdaptations(traits) });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

app.get('/api/ai-dataset', (req, res) => {
  res.json(aiDataset);
});

app.post('/api/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const { sessionId } = req.body;
    const session = userSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const modifiedContent = modifyPDFContent(pdfData.text, session.traits);
    
    res.json({
      success: true,
      originalText: pdfData.text,
      modifiedText: modifiedContent,
      adaptations: getAdaptations(session.traits)
    });
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ error: 'Error processing PDF' });
  }
});

function getAdaptations(traits) {
  const adaptations = {};
  traits.forEach(trait => {
    if (aiDataset[trait]) {
      adaptations[trait] = aiDataset[trait].solutions;
    }
  });
  return adaptations;
}

function modifyPDFContent(text, traits) {
  let modifiedText = text;
  
  traits.forEach(trait => {
    switch (trait) {
      case 'dyslexia':
        // Convert long paragraphs to short sentences
        modifiedText = modifiedText.replace(/([.!?])\s*([A-Z])/g, '$1\n\n$2');
        // Add bullet points for lists
        modifiedText = modifiedText.replace(/(\d+\.\s)/g, '• $1');
        break;
      case 'adhd':
        // Break content into smaller chunks
        const sentences = modifiedText.split(/[.!?]+/);
        modifiedText = sentences.filter(s => s.trim()).slice(0, 3).join('. ') + '.';
        break;
      case 'autism':
        // Add step-by-step structure
        modifiedText = 'Step 1: Read the following content\n\n' + modifiedText + '\n\nStep 2: Answer questions about the content';
        break;
      case 'dyspraxia':
        // Simplify complex sentences
        modifiedText = modifiedText.replace(/\b(\w{10,})\b/g, (match) => {
          return match.substring(0, 8) + '...';
        });
        break;
    }
  });
  
  return modifiedText;
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
