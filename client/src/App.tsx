import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

interface UserSession {
  username: string;
  traits: string[];
  loggedIn: boolean;
  adaptations?: any;
}

const API_BASE = 'http://localhost:5000/api';

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [currentView, setCurrentView] = useState<'login' | 'traits' | 'main'>('login');
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [pdfContent, setPdfContent] = useState({ original: '', modified: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedSessionId = localStorage.getItem('sessionId');
    if (savedSessionId) {
      setSessionId(savedSessionId);
      setCurrentView('traits');
    }
  }, []);

  const applyAdaptations = (traits: string[]) => {
    const body = document.body;
    body.className = '';
    
    traits.forEach(trait => {
      switch (trait) {
        case 'dyslexia':
          body.classList.add('dyslexia-mode');
          break;
        case 'adhd':
          body.classList.add('adhd-focus-mode');
          break;
        case 'autism':
          body.classList.add('autism-mode');
          break;
        case 'dyspraxia':
          body.classList.add('dyspraxia-mode');
          break;
      }
    });
  };

  const handleLogin = async (username: string) => {
    try {
      const response = await axios.post(`${API_BASE}/login`, { username });
      const { sessionId: newSessionId } = response.data;
      setSessionId(newSessionId);
      localStorage.setItem('sessionId', newSessionId);
      setSession({ username, traits: [], loggedIn: true });
      setCurrentView('traits');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Text-to-speech function
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Stop speech synthesis
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      speak('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceTranscript('Listening...');
      speak('Hello welcome to the smart learning. Tell me what traits you have. You can say dyslexia, ADHD, autism, or dyspraxia.');
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      
      setVoiceTranscript(`You said: ${transcript}`);
      
      // Process the transcript for trait selection
      const traits = extractTraitsFromSpeech(transcript.toLowerCase());
      if (traits.length > 0) {
        setSelectedTraits(prev => [...new Set([...prev, ...traits])]);
        speak(`Great! I've detected ${traits.join(' and ')} for you. Your learning environment will be adapted accordingly.`);
        setVoiceTranscript(`✅ Detected: ${traits.join(', ')}`);
      } else {
        // Check if user is asking for help or clarification
        if (transcript.toLowerCase().includes('help') || transcript.toLowerCase().includes('what')) {
          speak('You can tell me about your learning traits. Say dyslexia for reading difficulties, ADHD for attention challenges, autism for structured learning needs, or dyspraxia for motor coordination difficulties.');
          setVoiceTranscript('Say: dyslexia, ADHD, autism, or dyspraxia');
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setVoiceTranscript(`Error: ${event.error}`);
      if (event.error === 'no-speech') {
        speak("I didn't hear anything. Please try again or click traits manually.");
      } else {
        speak('There was an error with voice recognition. Please try again.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if no traits were detected and user didn't stop manually
      if (selectedTraits.length === 0) {
        setTimeout(() => {
          if (!isListening) {
            speak('Would you like to try again? You can also select traits manually by clicking on them.');
          }
        }, 2000);
      }
    };

    recognition.start();
  };

  const extractTraitsFromSpeech = (transcript: string): string[] => {
    const traits: string[] = [];
    const traitKeywords = {
      'dyslexia': ['dyslexia', 'reading difficulty', 'reading problems'],
      'adhd': ['adhd', 'attention deficit', 'attention problems', 'focus issues'],
      'autism': ['autism', 'autistic', 'autism spectrum'],
      'dyspraxia': ['dyspraxia', 'motor coordination', 'movement difficulty']
    };

    Object.entries(traitKeywords).forEach(([trait, keywords]) => {
      if (keywords.some(keyword => transcript.includes(keyword))) {
        traits.push(trait);
      }
    });

    return traits;
  };

  const handleTraitSelection = async (trait: string) => {
    const newTraits = selectedTraits.includes(trait)
      ? selectedTraits.filter(t => t !== trait)
      : [...selectedTraits, trait];
    
    setSelectedTraits(newTraits);
    
    // Voice feedback for manual selection
    if (newTraits.length > selectedTraits.length) {
      speak(`${trait.charAt(0).toUpperCase() + trait.slice(1)} added to your learning traits.`);
    } else {
      speak(`${trait.charAt(0).toUpperCase() + trait.slice(1)} removed from your learning traits.`);
    }
  };

  const confirmTraits = async () => {
    if (selectedTraits.length === 0) {
      speak('Please select at least one trait using your voice or by clicking on the trait cards.');
      alert('Please select at least one trait or use voice assistant to select traits.');
      return;
    }

    speak(`Perfect! I'm now adapting your learning environment for ${selectedTraits.join(' and ')}.`);
    
    try {
      const response = await axios.post(`${API_BASE}/select-traits`, {
        sessionId,
        traits: selectedTraits
      });
      
      setSession(prev => prev ? { ...prev, traits: selectedTraits, adaptations: response.data.adaptations } : null);
      applyAdaptations(selectedTraits);
      setCurrentView('main');
      
      setTimeout(() => {
        speak('Your adaptive learning environment is ready! You can now upload PDF documents for personalized content adaptation.');
      }, 1000);
    } catch (error) {
      console.error('Trait selection error:', error);
      speak('There was an error setting up your adaptations. Please try again.');
    }
  };

  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    speak('Processing your PDF document. This may take a moment...');
    
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('sessionId', sessionId);

    try {
      const response = await axios.post(`${API_BASE}/upload-pdf`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setPdfContent({
        original: response.data.originalText,
        modified: response.data.modifiedText
      });
      
      speak('Perfect! Your PDF has been processed and adapted for your learning traits. You can see the modified content below.');
    } catch (error) {
      console.error('PDF upload error:', error);
      speak('There was an error processing your PDF. Please try again.');
      alert('Error processing PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderLogin = () => (
    <div className="container">
      <div className="card">
        <h1 className="title">Adaptive Learning Platform</h1>
        <p className="subtitle">Welcome to your personalized learning experience</p>
        <form onSubmit={(e) => {
          e.preventDefault();
          const username = (e.target as HTMLFormElement).username.value;
          if (username.trim()) {
            handleLogin(username.trim());
          }
        }}>
          <input
            type="text"
            name="username"
            placeholder="Enter your name"
            className="input"
            required
          />
          <button type="submit" className="button">Start Learning</button>
        </form>
      </div>
    </div>
  );

  const renderTraitSelection = () => (
    <div className="container">
      <div className="card">
        <h1 className="title">Select Your Learning Traits</h1>
        <p className="subtitle">Choose traits that apply to you for personalized learning</p>
        
        <div className="voice-assistant">
          <h3>Voice Assistant</h3>
          <p>"Hello welcome to the smart learning tell the traits what you have"</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              className="button" 
              onClick={startVoiceRecognition}
              disabled={isListening || isSpeaking}
            >
              {isListening ? '🎤 Listening...' : isSpeaking ? '🔊 Speaking...' : '🎤 Start Voice Assistant'}
            </button>
            {(isListening || isSpeaking) && (
              <button 
                className="button" 
                onClick={stopSpeaking}
                style={{ backgroundColor: '#e74c3c' }}
              >
                ⏹️ Stop
              </button>
            )}
          </div>
          {voiceTranscript && (
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              marginTop: '10px',
              minHeight: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <p style={{ margin: 0, textAlign: 'center' }}>{voiceTranscript}</p>
            </div>
          )}
        </div>

        <h3>Or Select Manually:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {['dyslexia', 'adhd', 'autism', 'dyspraxia'].map(trait => (
            <div
              key={trait}
              className={`trait-card ${selectedTraits.includes(trait) ? 'selected' : ''}`}
              onClick={() => handleTraitSelection(trait)}
            >
              <h3>{trait.charAt(0).toUpperCase() + trait.slice(1)}</h3>
              <p>Click to {selectedTraits.includes(trait) ? 'remove' : 'select'}</p>
            </div>
          ))}
        </div>

        {selectedTraits.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <p>Selected: {selectedTraits.join(', ')}</p>
            <button className="button" onClick={confirmTraits}>
              Confirm Selection
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderMain = () => (
    <div className="container">
      <div className="card">
        <h1 className="title">Your Adaptive Learning Environment</h1>
        <p className="subtitle">Interface adapted for: {selectedTraits.join(', ')}</p>
        
        <div className="upload-area">
          <h3>Upload PDF for Adaptation</h3>
          <p>Your PDF will be modified based on your selected traits</p>
          <input
            type="file"
            accept=".pdf"
            onChange={handlePDFUpload}
            style={{ display: 'none' }}
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload" className="button" style={{ display: 'inline-block' }}>
            📄 Choose PDF File
          </label>
        </div>

        {isLoading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Processing your PDF...</p>
          </div>
        )}

        {pdfContent.modified && (
          <div>
            <h3>Adapted Content:</h3>
            <div className="pdf-content">
              {pdfContent.modified.split('\n').map((paragraph, index) => (
                <p key={index} style={{ marginBottom: '15px' }}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        {session?.adaptations && (
          <div>
            <h3>Applied Adaptations:</h3>
            {Object.entries(session.adaptations).map(([trait, adaptations]: [string, any]) => (
              <div key={trait} style={{ marginBottom: '20px' }}>
                <h4>{trait.charAt(0).toUpperCase() + trait.slice(1)} Adaptations:</h4>
                <ul>
                  {Object.entries(adaptations).map(([category, items]: [string, any]) => (
                    <li key={category}>
                      <strong>{category}:</strong>
                      <ul>
                        {Array.isArray(items) ? items.map((item, index) => (
                          <li key={index}>{item}</li>
                        )) : <li>{items}</li>}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="App">
      {currentView === 'login' && renderLogin()}
      {currentView === 'traits' && renderTraitSelection()}
      {currentView === 'main' && renderMain()}
    </div>
  );
};

export default App;
