# Adaptive Learning for Neurodivergence Traits

Version 1.0 - AI-powered learning platform designed specifically for neurodivergent users, leveraging Ollama for advanced natural language processing.

## Features

### 🧠 Text Simplification
- Transform complex text into simpler, more accessible language
- Multiple complexity levels (Very Simple, Simple, Moderate)
- AI-powered simplification using Ollama models

### 🔑 Keyword Extraction
- Extract key concepts and important terms from text
- Customizable number of keywords
- Helps with comprehension and study planning

### 🎯 Learning Adaptation
- Adapt content based on specific learning preferences
- Support for visual, auditory, and kinesthetic learners
- Accessibility options for ADHD, autism, and dyslexia
- Personalized content modification

## Architecture

```
User → Web App → Backend API → Ollama AI Model → Processed Result → UI
```

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Ollama** installed and running on your system
   - Download from [https://ollama.ai/](https://ollama.ai/)
   - Start Ollama service: `ollama serve`
   - Pull a model: `ollama pull llama2` (or your preferred model)

## Quick Start

1. Start the server:
```bash
node server.js
```

2. Open your browser and navigate to:
```
http://localhost:3001
```

3. Make sure Ollama is running:
```bash
ollama serve
ollama pull llama2
```

## API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Ollama Status
- `GET /api/ollama-status` - Check Ollama connection and available models

### Text Simplification
- `POST /api/simplify-text`
  ```json
  {
    "text": "Your complex text here",
    "complexity": "simple"
  }
  ```

### Keyword Extraction
- `POST /api/extract-keywords`
  ```json
  {
    "text": "Your text here",
    "maxKeywords": 10
  }
  ```

### Learning Adaptation
- `POST /api/adapt-content`
  ```json
  {
    "text": "Your content here",
    "learningStyle": "visual",
    "preferences": {
      "visualLearner": true,
      "adhdFriendly": true,
      "autismFriendly": false,
      "dyslexiaFriendly": false
    }
  }
  ```

## Supported Ollama Models

- `llama2` - Good balance of performance and capability
- `mistral` - Excellent for text processing
- `neural-chat` - Specialized for conversational AI

## Accessibility Features

- **Reduced motion support**: Respects user's motion preferences
- **Keyboard navigation**: Full keyboard accessibility
- **Clear focus indicators**: Visible focus states for all interactive elements
- **High contrast**: Good color contrast ratios
- **Screen reader friendly**: Semantic HTML and ARIA labels

## Neurodivergent-Friendly Design

- **Clean, uncluttered interface**: Reduces cognitive load
- **Consistent layout**: Predictable navigation patterns
- **Clear typography**: Easy-to-read fonts and sizing
- **Flexible interaction**: Multiple ways to accomplish tasks
- **Error prevention**: Clear validation and guidance

## Version 1.0

This initial release includes:
- Complete backend API with Ollama integration
- Responsive web interface
- All three core features (Text Simplification, Keyword Extraction, Learning Adaptation)
- No external dependencies required (uses only Node.js built-in modules)
- Simple HTML/CSS/JavaScript frontend

## License

MIT License

---

Built with ❤️ for the neurodivergent community