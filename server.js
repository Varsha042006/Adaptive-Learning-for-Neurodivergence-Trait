const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3001;

// Simple HTTP server without external dependencies
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // API routes
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'OK', message: 'Neurodivergence Learning Platform API is running' }));
    return;
  }

  if (pathname === '/api/ollama-status') {
    // Check if Ollama is available
    exec('curl -s http://localhost:11434/api/tags', (error, stdout, stderr) => {
      if (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'disconnected',
          error: 'Cannot connect to Ollama',
          baseUrl: 'http://localhost:11434'
        }));
        return;
      }
      
      try {
        const data = JSON.parse(stdout);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'connected',
          models: data.models || [],
          baseUrl: 'http://localhost:11434'
        }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'disconnected',
          error: 'Cannot parse Ollama response',
          baseUrl: 'http://localhost:11434'
        }));
      }
    });
    return;
  }

  if (pathname === '/api/simplify-text' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { text, complexity = 'simple' } = JSON.parse(body);
        
        if (!text) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Text is required' }));
          return;
        }

        const prompt = `Please simplify the following text to make it more accessible for neurodivergent learners. Use clear, straightforward language and break down complex concepts. Target complexity level: ${complexity}.

Original text: "${text}"

Simplified text:`;

        // Call Ollama using curl
        const ollamaCommand = `curl -s -X POST http://localhost:11434/api/generate -H "Content-Type: application/json" -d '{"model": "llama2", "prompt": "${prompt.replace(/"/g, '\\"')}", "stream": false}'`;
        
        exec(ollamaCommand, (error, stdout, stderr) => {
          if (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to communicate with Ollama API' }));
            return;
          }
          
          try {
            const ollamaResponse = JSON.parse(stdout);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              original: text,
              simplified: ollamaResponse.response || 'Simplification failed',
              complexity: complexity
            }));
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to parse Ollama response' }));
          }
        });
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  if (pathname === '/api/extract-keywords' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { text, maxKeywords = 10 } = JSON.parse(body);
        
        if (!text) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Text is required' }));
          return;
        }

        const prompt = `Extract the most important keywords and key concepts from the following text. Focus on terms that would be essential for understanding the main ideas. Return exactly ${maxKeywords} keywords as a JSON array of strings.

Text: "${text}"

Keywords (JSON array format):`;

        const ollamaCommand = `curl -s -X POST http://localhost:11434/api/generate -H "Content-Type: application/json" -d '{"model": "llama2", "prompt": "${prompt.replace(/"/g, '\\"')}", "stream": false}'`;
        
        exec(ollamaCommand, (error, stdout, stderr) => {
          if (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to communicate with Ollama API' }));
            return;
          }
          
          try {
            const ollamaResponse = JSON.parse(stdout);
            const keywordsText = ollamaResponse.response || '[]';
            
            // Try to parse as JSON, fallback to text processing
            let keywords = [];
            try {
              keywords = JSON.parse(keywordsText);
            } catch (e) {
              // Fallback: extract comma-separated values
              keywords = keywordsText.split(',').map(k => k.trim().replace(/["\[\]]/g, '')).filter(k => k.length > 0);
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              original: text,
              keywords: keywords.slice(0, maxKeywords)
            }));
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to parse Ollama response' }));
          }
        });
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  if (pathname === '/api/adapt-content' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { text, learningStyle, preferences = {} } = JSON.parse(body);
        
        if (!text) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Text is required' }));
          return;
        }

        const { visualLearner = false, auditoryLearner = false, kinestheticLearner = false, 
                adhdFriendly = false, autismFriendly = false, dyslexiaFriendly = false } = preferences;

        let adaptationPrompt = `Adapt the following content for neurodivergent learners with the following preferences: `;

        if (visualLearner) adaptationPrompt += 'visual learners (include visual descriptions), ';
        if (auditoryLearner) adaptationPrompt += 'auditory learners (include rhythmic elements), ';
        if (kinestheticLearner) adaptationPrompt += 'kinesthetic learners (include action-oriented language), ';
        if (adhdFriendly) adaptationPrompt += 'ADHD-friendly (shorter sentences, clear structure), ';
        if (autismFriendly) adaptationPrompt += 'autism-friendly (literal language, clear transitions), ';
        if (dyslexiaFriendly) adaptationPrompt += 'dyslexia-friendly (simple vocabulary, clear formatting), ';

        adaptationPrompt += `Learning style: ${learningStyle || 'general'}.

Original content: "${text}"

Adapted content:`;

        const ollamaCommand = `curl -s -X POST http://localhost:11434/api/generate -H "Content-Type: application/json" -d '{"model": "llama2", "prompt": "${adaptationPrompt.replace(/"/g, '\\"')}", "stream": false}'`;
        
        exec(ollamaCommand, (error, stdout, stderr) => {
          if (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to communicate with Ollama API' }));
            return;
          }
          
          try {
            const ollamaResponse = JSON.parse(stdout);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              original: text,
              adapted: ollamaResponse.response || 'Adaptation failed',
              learningStyle: learningStyle,
              preferences: preferences
            }));
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to parse Ollama response' }));
          }
        });
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // Serve static files (simple HTML client)
  if (pathname === '/' || pathname === '/index.html') {
    const htmlPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(htmlPath)) {
      fs.readFile(htmlPath, (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading page');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
    } else {
      // Create a simple HTML page
      const simpleHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Neurodivergence Learning Platform</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
        }
        .container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            margin: 20px 0;
            color: #333;
        }
        .button {
            background: #7c3aed;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
        }
        .button:hover {
            background: #6d28d9;
        }
        .textarea {
            width: 100%;
            height: 100px;
            margin: 10px 0;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
        }
        .result {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .status {
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
        }
        .connected { background: #10b981; color: white; }
        .disconnected { background: #ef4444; color: white; }
    </style>
</head>
<body>
    <h1>🧠 Neurodivergence Learning Platform</h1>
    <p>AI-powered learning tools adapted for neurodivergent users</p>
    
    <div id="status" class="status disconnected">Checking Ollama...</div>
    
    <div class="container">
        <h2>Text Simplification</h2>
        <textarea id="simplifyText" class="textarea" placeholder="Enter complex text to simplify..."></textarea>
        <select id="complexity">
            <option value="very-simple">Very Simple</option>
            <option value="simple">Simple</option>
            <option value="moderate">Moderate</option>
        </select>
        <button class="button" onclick="simplifyText()">Simplify Text</button>
        <div id="simplifyResult" class="result" style="display:none;"></div>
    </div>
    
    <div class="container">
        <h2>Keyword Extraction</h2>
        <textarea id="keywordsText" class="textarea" placeholder="Enter text to extract keywords from..."></textarea>
        <input type="number" id="maxKeywords" value="10" min="1" max="20" style="margin: 10px 0; padding: 5px;">
        <button class="button" onclick="extractKeywords()">Extract Keywords</button>
        <div id="keywordsResult" class="result" style="display:none;"></div>
    </div>
    
    <div class="container">
        <h2>Learning Adaptation</h2>
        <textarea id="adaptText" class="textarea" placeholder="Enter content to adapt..."></textarea>
        <select id="learningStyle" style="margin: 10px 0; padding: 5px;">
            <option value="visual">Visual</option>
            <option value="auditory">Auditory</option>
            <option value="kinesthetic">Kinesthetic</option>
            <option value="reading">Reading/Writing</option>
            <option value="multimodal">Multimodal</option>
        </select>
        <div style="margin: 10px 0;">
            <label><input type="checkbox" id="visualLearner"> Visual Learner</label><br>
            <label><input type="checkbox" id="adhdFriendly"> ADHD-Friendly</label><br>
            <label><input type="checkbox" id="autismFriendly"> Autism-Friendly</label><br>
            <label><input type="checkbox" id="dyslexiaFriendly"> Dyslexia-Friendly</label>
        </div>
        <button class="button" onclick="adaptContent()">Adapt Content</button>
        <div id="adaptResult" class="result" style="display:none;"></div>
    </div>

    <script>
        // Check Ollama status
        fetch('/api/ollama-status')
            .then(response => response.json())
            .then(data => {
                const statusEl = document.getElementById('status');
                if (data.status === 'connected') {
                    statusEl.className = 'status connected';
                    statusEl.textContent = 'Ollama: Connected';
                } else {
                    statusEl.className = 'status disconnected';
                    statusEl.textContent = 'Ollama: Disconnected';
                }
            })
            .catch(error => {
                document.getElementById('status').className = 'status disconnected';
                document.getElementById('status').textContent = 'Ollama: Error';
            });

        function simplifyText() {
            const text = document.getElementById('simplifyText').value;
            const complexity = document.getElementById('complexity').value;
            
            fetch('/api/simplify-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, complexity })
            })
            .then(response => response.json())
            .then(data => {
                const resultEl = document.getElementById('simplifyResult');
                resultEl.innerHTML = '<strong>Simplified:</strong><br>' + data.simplified;
                resultEl.style.display = 'block';
            })
            .catch(error => {
                document.getElementById('simplifyResult').innerHTML = 'Error: ' + error.message;
                document.getElementById('simplifyResult').style.display = 'block';
            });
        }

        function extractKeywords() {
            const text = document.getElementById('keywordsText').value;
            const maxKeywords = parseInt(document.getElementById('maxKeywords').value);
            
            fetch('/api/extract-keywords', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, maxKeywords })
            })
            .then(response => response.json())
            .then(data => {
                const resultEl = document.getElementById('keywordsResult');
                resultEl.innerHTML = '<strong>Keywords:</strong><br>' + 
                    data.keywords.map(k => '<span style="background: #7c3aed; color: white; padding: 2px 8px; margin: 2px; border-radius: 10px; display: inline-block;">' + k + '</span>').join('');
                resultEl.style.display = 'block';
            })
            .catch(error => {
                document.getElementById('keywordsResult').innerHTML = 'Error: ' + error.message;
                document.getElementById('keywordsResult').style.display = 'block';
            });
        }

        function adaptContent() {
            const text = document.getElementById('adaptText').value;
            const learningStyle = document.getElementById('learningStyle').value;
            const preferences = {
                visualLearner: document.getElementById('visualLearner').checked,
                adhdFriendly: document.getElementById('adhdFriendly').checked,
                autismFriendly: document.getElementById('autismFriendly').checked,
                dyslexiaFriendly: document.getElementById('dyslexiaFriendly').checked
            };
            
            fetch('/api/adapt-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, learningStyle, preferences })
            })
            .then(response => response.json())
            .then(data => {
                const resultEl = document.getElementById('adaptResult');
                resultEl.innerHTML = '<strong>Adapted Content:</strong><br>' + data.adapted;
                resultEl.style.display = 'block';
            })
            .catch(error => {
                document.getElementById('adaptResult').innerHTML = 'Error: ' + error.message;
                document.getElementById('adaptResult').style.display = 'block';
            });
        }
    </script>
</body>
</html>`;
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(simpleHTML);
    }
    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`🚀 Neurodivergence Learning Platform running on http://localhost:${PORT}`);
  console.log(`📱 Open your browser and navigate to http://localhost:${PORT}`);
  console.log(`🤖 Make sure Ollama is running: ollama serve`);
  console.log(`📦 Pull a model: ollama pull llama2`);
});
