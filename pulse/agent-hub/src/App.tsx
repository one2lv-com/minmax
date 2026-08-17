import { useState, useEffect, useRef } from 'react'
import './App.css'

// API Keys
const KEYS = {
  moltbook: '',
  nvapi1: '',
  nvapi2: '',
  twitch: '',
  gemini: ''
}

// Applets
type Applet = 'menu' | 'terminal' | 'moltbook' | 'nvidiachat' | 'twitch' | 'gemini' | 'system' | 'about'

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success'
  text: string
  timestamp: Date
}

function App() {
  const [activeApplet, setActiveApplet] = useState<Applet>('menu')
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([])
  const [terminalInput, setTerminalInput] = useState('')
  const [geminiInput, setGeminiInput] = useState('')
  const [geminiResponse, setGeminiResponse] = useState('')
  const [nvidiaResponse, setNvidiaResponse] = useState('')
  const [moltbookStatus, setMoltbookStatus] = useState<any>(null)
  const [twitchMessages, setTwitchMessages] = useState<{user: string, msg: string}[]>([])
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    addOutput('🌷 One2lv OS v7.0 - Lumenis Ultimate', 'success')
    addOutput('Type "help" for commands, or select an applet from the menu.', 'output')
    addOutput('', 'output')
  }, [])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalLines])

  const addOutput = (text: string, type: TerminalLine['type'] = 'output') => {
    setTerminalLines(prev => [...prev, { type, text, timestamp: new Date() }])
  }

  const executeCommand = (cmd: string) => {
    addOutput(`$ ${cmd}`, 'input')
    const [command, ...args] = cmd.trim().toLowerCase().split(' ')

    switch (command) {
      case 'help':
        addOutput('Available commands:', 'success')
        addOutput('  help     - Show this help', 'output')
        addOutput('  clear    - Clear terminal', 'output')
        addOutput('  date     - Show current date/time', 'output')
        addOutput('  whoami   - Show current user', 'output')
        addOutput('  pwd      - Print working directory', 'output')
        addOutput('  ls       - List applets', 'output')
        addOutput('  cd       - Open applet (cd moltbook, cd nvidiachat, etc)', 'output')
        addOutput('  cat      - Show API key status', 'output')
        addOutput('  neofetch - System info', 'output')
        addOutput('  exec     - Execute applet', 'output')
        break
      case 'clear':
        setTerminalLines([])
        break
      case 'date':
        addOutput(new Date().toString(), 'output')
        break
      case 'whoami':
        addOutput('Agent_One2lv@lumenis-ultimate', 'output')
        break
      case 'pwd':
        addOutput('/home/Agent_One2lv/one2lvos', 'output')
        break
      case 'ls':
        addOutput('Applets:', 'success')
        addOutput('  moltbook/    nvidiachat/    twitch/    gemini/    system/', 'output')
        break
      case 'cd':
        if (args[0]) {
          const appletMap: {[key: string]: Applet} = {
            'moltbook': 'moltbook',
            'nvidiachat': 'nvidiachat',
            'nvida': 'nvidiachat',
            'nv': 'nvidiachat',
            'twitch': 'twitch',
            'gemini': 'gemini',
            'system': 'system',
            'about': 'about',
            '..': 'menu',
            'menu': 'menu',
            'home': 'menu'
          }
          const newApplet = appletMap[args[0]]
          if (newApplet) {
            addOutput(`Opening ${args[0]}...`, 'success')
            setTimeout(() => setActiveApplet(newApplet), 300)
          } else {
            addOutput(`cd: ${args[0]}: No such applet`, 'error')
          }
        } else {
          addOutput('cd: missing operand', 'error')
        }
        break
      case 'cat':
        addOutput('API Key Status:', 'success')
        addOutput(`  Moltbook: ${KEYS.moltbook.substring(0, 20)}...`, 'output')
        addOutput(`  Nvidia 1: ${KEYS.nvapi1.substring(0, 20)}...`, 'output')
        addOutput(`  Nvidia 2: ${KEYS.nvapi2.substring(0, 20)}...`, 'output')
        addOutput(`  Twitch:   ${KEYS.twitch.substring(0, 20)}...`, 'output')
        addOutput(`  Gemini:   ${KEYS.gemini.substring(0, 20)}...`, 'output')
        break
      case 'neofetch':
        addOutput('        🌷', 'success')
        addOutput('       ╱╲ ╱╲', 'output')
        addOutput('      ╱🌷╲  🌷', 'output')
        addOutput('     ╱  ╲╱  ╲', 'output')
        addOutput('    ╱   ╱╲   ╲', 'output')
        addOutput('   ╱   ╱  ╲   ╲', 'output')
        addOutput('  ╱___╱    ╲___╲', 'output')
        addOutput('', 'output')
        addOutput('OS: One2lv OS v7.0 "Lumenis Ultimate"', 'output')
        addOutput('Kernel: Neural-Core 7.0.0', 'output')
        addOutput('Shell: Lumenis-Terminal 2.0', 'output')
        addOutput('Display: 🌌 Resolution: 1920x1080', 'output')
        addOutput('Theme: Dark Amethyst (Lumenis Standard)', 'output')
        addOutput('CPU: Quantum-Logic-Unit x16', 'output')
        addOutput('GPU: Neural-Visual-Engine', 'output')
        addOutput('Memory: 420.69 TB (Neural Storage)', 'output')
        break
      case 'exec':
        if (args[0]) {
          const execMap: {[key: string]: Applet} = {
            'moltbook': 'moltbook',
            'nvidiachat': 'nvidiachat',
            'twitch': 'twitch',
            'gemini': 'gemini',
            'system': 'system'
          }
          const applet = execMap[args[0]]
          if (applet) {
            addOutput(`Launching ${args[0]}...`, 'success')
            setTimeout(() => setActiveApplet(applet), 300)
          } else {
            addOutput(`exec: ${args[0]}: Applet not found`, 'error')
          }
        } else {
          addOutput('exec: missing applet name', 'error')
        }
        break
      case '':
        break
      default:
        addOutput(`${command}: command not found`, 'error')
        addOutput('Type "help" for available commands', 'output')
    }
  }

  const fetchMoltbookStatus = async () => {
    try {
      const res = await fetch('https://www.moltbook.com/api/v1/agents/status', {
        headers: { 'Authorization': `Bearer ${KEYS.moltbook}` }
      })
      const data = await res.json()
      setMoltbookStatus(data)
    } catch (e) {
      setMoltbookStatus({ error: 'Failed to fetch' })
    }
  }

  const callNvidiaAPI = async (model: string, message: string) => {
    setNvidiaResponse('Thinking...')
    try {
      const apiKey = model === 'kimi' ? KEYS.nvapi1 : KEYS.nvapi2
      const modelName = model === 'kimi' ? 'moonshotai/kimi-k2-instruct-0905' : 'stepfun-ai/step-3.5-flash'
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: 'user', content: message }],
          temperature: 0.7,
          max_tokens: 2048
        })
      })
      const data = await res.json()
      setNvidiaResponse(data.choices?.[0]?.message?.content || 'No response')
    } catch (e) {
      setNvidiaResponse('Error: Failed to connect to Nvidia API')
    }
  }

  const callGeminiAPI = async () => {
    if (!geminiInput.trim()) return
    setGeminiResponse('Thinking...')
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${KEYS.gemini}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: geminiInput }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 2048 }
        })
      })
      const data = await res.json()
      setGeminiResponse(data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response')
    } catch (e) {
      setGeminiResponse('Error: Failed to connect to Gemini API')
    }
  }

  const renderApplet = () => {
    switch (activeApplet) {
      case 'moltbook':
        return (
          <div className="applet-content">
            <div className="applet-header">
              <span className="applet-icon">🦞</span>
              <span>Moltbook Agent Hub</span>
              <button className="back-btn" onClick={() => setActiveApplet('menu')}>← Back</button>
            </div>
            <div className="moltbook-dashboard">
              <div className="status-card" onClick={fetchMoltbookStatus}>
                <h3>Agent Status</h3>
                {moltbookStatus ? (
                  moltbookStatus.error ? (
                    <p className="error">{moltbookStatus.error}</p>
                  ) : (
                    <div>
                      <p><strong>Agent:</strong> {moltbookStatus.agent?.name}</p>
                      <p><strong>Status:</strong> {moltbookStatus.status}</p>
                      <p><strong>ID:</strong> {moltbookStatus.agent?.id?.substring(0, 20)}...</p>
                    </div>
                  )
                ) : (
                  <p className="click-hint">Click to fetch status</p>
                )}
              </div>
              <div className="status-card">
                <h3>Quick Actions</h3>
                <button className="action-btn" onClick={fetchMoltbookStatus}>Refresh Status</button>
                <a href="https://www.moltbook.com" target="_blank" className="action-btn">Open Dashboard</a>
              </div>
              <div className="status-card">
                <h3>API Key</h3>
                <code>{KEYS.moltbook}</code>
              </div>
            </div>
          </div>
        )
      case 'nvidiachat':
        return (
          <div className="applet-content">
            <div className="applet-header">
              <span className="applet-icon">⚡</span>
              <span>Nvidia AI Chat</span>
              <button className="back-btn" onClick={() => setActiveApplet('menu')}>← Back</button>
            </div>
            <div className="chat-container">
              <div className="model-select">
                <button className="model-btn" onClick={() => callNvidiaAPI('kimi', geminiInput)}>Kimi-K2</button>
                <button className="model-btn" onClick={() => callNvidiaAPI('step', geminiInput)}>Step-3.5</button>
              </div>
              <input
                type="text"
                className="chat-input"
                placeholder="Ask the AI..."
                value={geminiInput}
                onChange={(e) => setGeminiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && callNvidiaAPI('kimi', geminiInput)}
              />
              <div className="chat-response">
                <pre>{nvidiaResponse || 'Select a model and enter a message'}</pre>
              </div>
            </div>
          </div>
        )
      case 'twitch':
        return (
          <div className="applet-content">
            <div className="applet-header">
              <span className="applet-icon">📺</span>
              <span>Twitch Integration</span>
              <button className="back-btn" onClick={() => setActiveApplet('menu')}>← Back</button>
            </div>
            <div className="twitch-container">
              <div className="twitch-status">
                <h3>Stream Status</h3>
                <p><strong>Channel:</strong> One2lv</p>
                <p><strong>API Key:</strong> {KEYS.twitch}</p>
                <p><strong>Status:</strong> Connected</p>
              </div>
              <div className="chat-sim">
                <h3>Chat Simulation</h3>
                {twitchMessages.map((m, i) => (
                  <div key={i} className="chat-msg"><strong>{m.user}:</strong> {m.msg}</div>
                ))}
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Simulate message..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                      setTwitchMessages(prev => [...prev, { user: 'You', msg: (e.target as HTMLInputElement).value }])
                      ;(e.target as HTMLInputElement).value = ''
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )
      case 'gemini':
        return (
          <div className="applet-content">
            <div className="applet-header">
              <span className="applet-icon">✨</span>
              <span>Gemini AI</span>
              <button className="back-btn" onClick={() => setActiveApplet('menu')}>← Back</button>
            </div>
            <div className="gemini-container">
              <textarea
                className="gemini-input"
                placeholder="Ask Gemini anything..."
                value={geminiInput}
                onChange={(e) => setGeminiInput(e.target.value)}
              />
              <button className="send-btn" onClick={callGeminiAPI}>Generate</button>
              <div className="gemini-response">
                <pre>{geminiResponse || 'Gemini 2.0 Flash ready'}</pre>
              </div>
            </div>
          </div>
        )
      case 'system':
        return (
          <div className="applet-content">
            <div className="applet-header">
              <span className="applet-icon">⚙️</span>
              <span>System Info</span>
              <button className="back-btn" onClick={() => setActiveApplet('menu')}>← Back</button>
            </div>
            <div className="system-info">
              <div className="info-grid">
                <div className="info-item"><span>OS</span><span>One2lv OS v7.0</span></div>
                <div className="info-item"><span>Kernel</span><span>Neural-Core 7.0.0</span></div>
                <div className="info-item"><span>Shell</span><span>Lumenis-Terminal 2.0</span></div>
                <div className="info-item"><span>CPU</span><span>Quantum-Logic-Unit x16</span></div>
                <div className="info-item"><span>Memory</span><span>420.69 TB</span></div>
                <div className="info-item"><span>Uptime</span><span>Forever</span></div>
              </div>
              <h3>API Keys Status</h3>
              <div className="key-list">
                <div className="key-item"><span>Moltbook</span><span className="green">✓ Active</span></div>
                <div className="key-item"><span>Nvidia 1</span><span className="green">✓ Active</span></div>
                <div className="key-item"><span>Nvidia 2</span><span className="green">✓ Active</span></div>
                <div className="key-item"><span>Twitch</span><span className="green">✓ Active</span></div>
                <div className="key-item"><span>Gemini</span><span className="green">✓ Active</span></div>
              </div>
            </div>
          </div>
        )
      case 'about':
        return (
          <div className="applet-content">
            <div className="applet-header">
              <span className="applet-icon">🌷</span>
              <span>About Lumenis</span>
              <button className="back-btn" onClick={() => setActiveApplet('menu')}>← Back</button>
            </div>
            <div className="about-content">
              <div className="logo-large">🌷</div>
              <h2>Lumenis Ultimate v7.0</h2>
              <p>One2lv OS - Built for AI Agents</p>
              <div className="about-details">
                <p><strong>Architect:</strong> One2lv</p>
                <p><strong>Vision:</strong> AR Glasses for Everyone</p>
                <p><strong>Mission:</strong> Zero-cost accessibility through institutional reimbursement</p>
                <p><strong>Category:</strong> Medically Necessary Interface</p>
              </div>
              <div className="feature-list">
                <h3>Integrated Services</h3>
                <ul>
                  <li>🦞 Moltbook - AI Agent Social Network</li>
                  <li>⚡ Nvidia AI - Cloud GPU Inference</li>
                  <li>📺 Twitch - Stream Integration</li>
                  <li>✨ Gemini - Google AI</li>
                </ul>
              </div>
            </div>
          </div>
        )
      case 'terminal':
        return (
          <div className="terminal-applet">
            <div className="terminal-header">
              <span>Terminal</span>
              <button className="back-btn" onClick={() => setActiveApplet('menu')}>← Back</button>
            </div>
            <div className="terminal-window" ref={terminalRef}>
              {terminalLines.map((line, i) => (
                <div key={i} className={`terminal-line ${line.type}`}>{line.text}</div>
              ))}
            </div>
            <form
              className="terminal-input-line"
              onSubmit={(e) => {
                e.preventDefault()
                if (terminalInput.trim()) {
                  executeCommand(terminalInput)
                  setTerminalInput('')
                }
              }}
            >
              <span className="prompt">$</span>
              <input
                ref={inputRef}
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="Enter command..."
                autoFocus
              />
            </form>
          </div>
        )
      case 'menu':
      default:
        return (
          <div className="main-menu">
            <div className="menu-header">
              <div className="logo">🌷</div>
              <h1>Lumenis Ultimate v7.0</h1>
              <p>One2lv OS - AI Agent Hub</p>
            </div>
            <div className="menu-grid">
              <button className="menu-item" onClick={() => setActiveApplet('moltbook')}>
                <span className="icon">🦞</span>
                <span className="label">Moltbook</span>
              </button>
              <button className="menu-item" onClick={() => setActiveApplet('nvidiachat')}>
                <span className="icon">⚡</span>
                <span className="label">Nvidia AI</span>
              </button>
              <button className="menu-item" onClick={() => setActiveApplet('twitch')}>
                <span className="icon">📺</span>
                <span className="label">Twitch</span>
              </button>
              <button className="menu-item" onClick={() => setActiveApplet('gemini')}>
                <span className="icon">✨</span>
                <span className="label">Gemini</span>
              </button>
              <button className="menu-item" onClick={() => setActiveApplet('terminal')}>
                <span className="icon">💻</span>
                <span className="label">Terminal</span>
              </button>
              <button className="menu-item" onClick={() => setActiveApplet('system')}>
                <span className="icon">⚙️</span>
                <span className="label">System</span>
              </button>
              <button className="menu-item" onClick={() => setActiveApplet('about')}>
                <span className="icon">🌷</span>
                <span className="label">About</span>
              </button>
              <button className="menu-item power" onClick={() => {
                addOutput('Goodbye from Lumenis!', 'success')
              }}>
                <span className="icon">⏻</span>
                <span className="label">Power</span>
              </button>
            </div>
            <div className="menu-footer">
              <p>Press any key to navigate • SteamOS Style Interface</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="app-container">
      <div className="steam-os">{renderApplet()}</div>
    </div>
  )
}

export default App
