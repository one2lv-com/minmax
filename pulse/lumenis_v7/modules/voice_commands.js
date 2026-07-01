/**
 * Voice Command Processor with WebSocket support
 * Supports wake word "Hey Lumen" and custom commands
 */

const CONFIG = {
  WAKE_WORD: ['hey lumen', 'hey lumenis', 'lumen', 'lumenis'],
  COMMANDS: {
    // Game commands
    'combo check': { action: 'combo_check', response: 'Combo system online' },
    'stats': { action: 'stats', response: 'Fetching player stats' },
    'reset combo': { action: 'reset_combo', response: 'Combo tracker reset' },

    // OBS commands
    'highlight': { action: 'obs_highlight', response: 'Triggering highlight scene' },
    'switch scene': { action: 'obs_switch', response: 'Switching scene' },
    'start stream': { action: 'obs_stream_start', response: 'Starting stream' },
    'stop stream': { action: 'obs_stream_stop', response: 'Stopping stream' },

    // Steam commands
    'steam status': { action: 'steam_status', response: 'Checking Steam connection' },
    'who is playing': { action: 'steam_players', response: 'Checking online friends' },
    'steam news': { action: 'steam_news', response: 'Fetching Steam news' },

    // Council commands
    'council vote': { action: 'council_vote', response: 'Opening council vote' },
    'strategy': { action: 'council_strategy', response: 'Checking current strategy' },

    // System
    'system status': { action: 'system_status', response: 'All systems online' },
    'help': { action: 'help', response: 'Voice commands available' },
    'performance': { action: 'performance', response: 'Checking performance metrics' }
  }
};

let ws = null;
let recognition = null;
let isListening = false;

const VoiceCommandProcessor = {
  init() {
    console.log('🎤 Voice Command Processor initializing...');

    // Try to use Web Speech API if available
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      this.initBrowserSpeech();
    }

    // Check for node-speech recognition
    try {
      const speech = require('@google-cloud/speech');
      console.log('✅ Node.js speech recognition available');
    } catch (e) {
      console.log('ℹ️ Using HTTP API for voice commands');
    }

    console.log('🎤 Voice ready - Say "Hey Lumen" to activate');
  },

  initBrowserSpeech() {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript.toLowerCase().trim();
      const confidence = result[0].confidence;

      console.log(`🎤 Heard: "${transcript}" (${(confidence * 100).toFixed(0)}%)`);

      this.process(transcript, confidence);
    };

    recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
    };
  },

  startListening(websocket) {
    ws = websocket;
    isListening = true;

    if (recognition) {
      recognition.start();
    }
  },

  stopListening() {
    isListening = false;
    if (recognition) {
      recognition.stop();
    }
  },

  async process(text, confidence = 1.0) {
    text = text.toLowerCase().trim();

    // Check for wake word
    const hasWakeWord = CONFIG.WAKE_WORD.some(word => text.includes(word));

    // Remove wake word for command parsing
    let command = text;
    if (hasWakeWord) {
      CONFIG.WAKE_WORD.forEach(word => {
        command = command.replace(word, '').trim();
      });
    }

    // Find matching command
    const matchedCommand = CONFIG.COMMANDS[command];

    if (matchedCommand) {
      console.log(`✅ Voice command matched: ${matchedCommand.action}`);

      // Send response
      const response = {
        type: 'voice_command',
        data: {
          command: text,
          action: matchedCommand.action,
          response: matchedCommand.response,
          confidence,
          timestamp: Date.now()
        }
      };

      if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify(response));
      }

      return matchedCommand;
    }

    // No match but was wake word
    if (hasWakeWord) {
      const response = {
        type: 'voice_command',
        data: {
          command: text,
          action: 'unknown',
          response: 'Command not recognized. Say "help" for available commands.',
          confidence,
          timestamp: Date.now()
        }
      };

      if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify(response));
      }
    }

    return null;
  },

  getCommands() {
    return Object.keys(CONFIG.COMMANDS);
  }
};

module.exports = { VoiceCommandProcessor, CONFIG };
