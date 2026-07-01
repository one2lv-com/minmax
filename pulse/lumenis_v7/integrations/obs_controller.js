/**
 * OBS WebSocket Controller
 * Auto-highlight and scene switching
 */

const OBSWebSocket = require('obs-websocket-js');

let obs = null;
let connected = false;
let currentScene = '';
let reconnectAttempts = 0;
const MAX_RECONNECT = 5;

const CONFIG = {
  COOLDOWN_MS: 5000,
  HIGHLIGHT_SCENE: 'Highlight',
  MAIN_SCENE: 'Main',
  lastHighlight: 0
};

const OBSController = {
  async connect(url = 'ws://localhost:4455', password = '') {
    obs = new OBSWebSocket();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);

      obs.on('Identified', () => {
        clearTimeout(timeout);
        connected = true;
        reconnectAttempts = 0;
        console.log('📺 OBS WebSocket connected');
        resolve(true);
      });

      obs.on('ConnectionClosed', () => {
        connected = false;
        console.log('📺 OBS WebSocket disconnected');
        this.attemptReconnect(url, password);
      });

      obs.on('CurrentProgramSceneChanged', (data) => {
        currentScene = data.sceneName;
        console.log(`📺 Scene changed to: ${currentScene}`);
      });

      obs.on('error', (error) => {
        console.error('OBS error:', error);
      });

      // Connect
      obs.connect(url, password).catch(reject);
    });
  },

  async attemptReconnect(url, password) {
    if (reconnectAttempts >= MAX_RECONNECT) {
      console.log('📺 Max reconnect attempts reached');
      return;
    }

    reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);

    console.log(`📺 Reconnecting in ${delay/1000}s (attempt ${reconnectAttempts})`);

    setTimeout(() => {
      this.connect(url, password).catch(() => {});
    }, delay);
  },

  isConnected() {
    return connected;
  },

  getCurrentScene() {
    return currentScene;
  },

  async setScene(sceneName) {
    if (!connected) {
      console.log('📺 OBS not connected');
      return false;
    }

    try {
      await obs.call('SetCurrentProgramScene', { sceneName });
      return true;
    } catch (error) {
      console.error('Failed to set scene:', error);
      return false;
    }
  },

  async triggerHighlight() {
    const now = Date.now();

    // Cooldown check
    if (now - CONFIG.lastHighlight < CONFIG.COOLDOWN_MS) {
      console.log('📺 Highlight on cooldown');
      return false;
    }

    CONFIG.lastHighlight = now;

    try {
      if (currentScene !== CONFIG.HIGHLIGHT_SCENE) {
        await this.setScene(CONFIG.HIGHLIGHT_SCENE);

        // Auto-return after 10 seconds
        setTimeout(async () => {
          if (currentScene === CONFIG.HIGHLIGHT_SCENE) {
            await this.setScene(CONFIG.MAIN_SCENE);
          }
        }, 10000);

        console.log('📺 Highlight triggered!');
        return true;
      }
    } catch (error) {
      console.error('Highlight trigger failed:', error);
    }

    return false;
  },

  async startStream() {
    if (!connected) return false;

    try {
      await obs.call('StartStream');
      console.log('📺 Stream started');
      return true;
    } catch (error) {
      console.error('Start stream failed:', error);
      return false;
    }
  },

  async stopStream() {
    if (!connected) return false;

    try {
      await obs.call('StopStream');
      console.log('📺 Stream stopped');
      return true;
    } catch (error) {
      console.error('Stop stream failed:', error);
      return false;
    }
  },

  async getSceneList() {
    if (!connected) return [];

    try {
      const response = await obs.call('GetSceneList');
      return response.scenes || [];
    } catch (error) {
      console.error('Get scene list failed:', error);
      return [];
    }
  },

  async getStreamStatus() {
    if (!connected) return {};

    try {
      const response = await obs.call('GetStreamStatus');
      return response;
    } catch (error) {
      return { streaming: false };
    }
  },

  disconnect() {
    if (obs) {
      obs.disconnect();
      connected = false;
    }
  }
};

module.exports = { OBSController, CONFIG };
