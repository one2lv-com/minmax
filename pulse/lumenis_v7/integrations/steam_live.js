/**
 * Steam Integration with Live Community Link
 * Fetches real-time Steam data and community info
 */

const axios = require('axios');

let steamApiKey = '';
let steamId = '';
let cachedData = {};
let cacheExpiry = {};

const CONFIG = {
  API_BASE: 'https://steamcommunity.com',
  STORE_API: 'https://store.steampowered.com/api',
  CACHE_TIME: 60000, // 1 minute cache
  NEWS_COUNT: 5
};

const SteamIntegration = {
  init(apiKey, steamid) {
    steamApiKey = apiKey;
    steamId = steamid;
    console.log('🎮 Steam integration initialized');
  },

  isLinked() {
    return !!(steamApiKey && steamId);
  },

  getStatus() {
    return {
      linked: this.isLinked(),
      steamId: steamId ? steamId.substring(0, 8) + '...' : null,
      apiKeySet: !!steamApiKey
    };
  },

  async getPlayerSummaries() {
    if (!steamApiKey) return [];

    try {
      const response = await axios.get(
        `${CONFIG.API_BASE}/ISteamUser/GetPlayerSummaries/v0002/`,
        {
          params: {
            key: steamApiKey,
            steamids: steamId
          },
          timeout: 5000
        }
      );

      return response.data.response.players || [];
    } catch (error) {
      console.error('Steam API error:', error.message);
      return [];
    }
  },

  async getOwnedGames() {
    if (!steamApiKey || !steamId) return { games: [] };

    try {
      const response = await axios.get(
        `${CONFIG.API_BASE}/IPlayerService/GetOwnedGames/v0001/`,
        {
          params: {
            key: steamApiKey,
            steamid: steamId,
            include_appinfo: 1,
            include_played_free_games: 1
          },
          timeout: 5000
        }
      );

      return response.data.response || { games: [] };
    } catch (error) {
      console.error('Steam games error:', error.message);
      return { games: [] };
    }
  },

  async getRecentlyPlayed() {
    if (!steamApiKey || !steamId) return { games: [] };

    try {
      const response = await axios.get(
        `${CONFIG.API_BASE}/IPlayerService/GetRecentlyPlayedGames/v0001/`,
        {
          params: {
            key: steamApiKey,
            steamid: steamId,
            count: 10
          },
          timeout: 5000
        }
      );

      return response.data.response || { games: [] };
    } catch (error) {
      console.error('Steam recent games error:', error.message);
      return { games: [] };
    }
  },

  async getSteamNews(appid, count = 5) {
    try {
      const response = await axios.get(
        `${CONFIG.STORE_API}/appnews?appid=${appid}&count=${count}&maxlength=300`,
        { timeout: 5000 }
      );

      return response.data.appnews || { newsitems: [] };
    } catch (error) {
      console.error('Steam news error:', error.message);
      return { newsitems: [] };
    }
  },

  async getCommunityData(steamid) {
    // Check cache first
    const cacheKey = `community_${steamid}`;
    if (cachedData[cacheKey] && Date.now() < cacheExpiry[cacheKey]) {
      return cachedData[cacheKey];
    }

    try {
      const response = await axios.get(
        `${CONFIG.API_BASE}/${steamid}/`,
        {
          timeout: 10000,
          headers: {
            'User-Agent': 'Lumenis-v7/1.0'
          }
        }
      );

      // Simple parsing - in production use cheerio
      const data = {
        steamid,
        online: response.data.includes('online'),
        status: this.parseStatus(response.data)
      };

      cachedData[cacheKey] = data;
      cacheExpiry[cacheKey] = Date.now() + CONFIG.CACHE_TIME;

      return data;
    } catch (error) {
      console.error('Community data error:', error.message);
      return { steamid, error: error.message };
    }
  },

  parseStatus(html) {
    if (html.includes('Online')) return 'Online';
    if (html.includes('In-Game')) return 'In-Game';
    if (html.includes('Offline')) return 'Offline';
    return 'Unknown';
  },

  async getFriendsList() {
    if (!steamApiKey || !steamId) return { friends: [] };

    try {
      const response = await axios.get(
        `${CONFIG.API_BASE}/ISteamUser/GetFriendList/v0001/`,
        {
          params: {
            key: steamApiKey,
            steamid: steamId,
            relationship: 'friend'
          },
          timeout: 5000
        }
      );

      const friends = response.data.friendslist?.friends || [];

      // Get summaries for all friends
      if (friends.length > 0) {
        const steamids = friends.map(f => f.steamid).join(',');
        const summaries = await axios.get(
          `${CONFIG.API_BASE}/ISteamUser/GetPlayerSummaries/v0002/`,
          {
            params: { key: steamApiKey, steamids },
            timeout: 5000
          }
        );

        return {
          friends: summaries.data.response?.players || [],
          count: friends.length
        };
      }

      return { friends: [], count: 0 };
    } catch (error) {
      console.error('Friends list error:', error.message);
      return { friends: [], count: 0 };
    }
  },

  async getPlayerBans(steamid) {
    if (!steamApiKey) return { bans: [] };

    try {
      const response = await axios.get(
        `${CONFIG.API_BASE}/ISteamUser/GetPlayerBans/v0001/`,
        {
          params: {
            key: steamApiKey,
            steamids: steamid
          },
          timeout: 5000
        }
      );

      return response.data.players?.[0] || { SteamId: steamid };
    } catch (error) {
      console.error('Ban check error:', error.message);
      return { SteamId: steamid, error: error.message };
    }
  },

  clearCache() {
    cachedData = {};
    cacheExpiry = {};
  }
};

module.exports = { SteamIntegration, CONFIG };
