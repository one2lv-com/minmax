// LUMENIS Cosmic Build v7.0 - One2lvOS Infinity Glass
// Real-time Control Center with Supabase, Resizable Panels, Keyboard Navigation

const { createClient } = require('@supabase/supabase-js');

// Supabase Configuration
const supabase = createClient(
    process.env.SUPABASE_URL || 'https://your-project.supabase.co',
    process.env.SUPABASE_ANON_KEY || 'your-anon-key'
);

// Discord Webhook
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK || 'https://discord.com/api/webhooks/754920938356604989/cjJFt6Cs6ok01hpnQowGLE0i2U1nqCV_8ycK3f-ltPLc-FOqRUTn4pn3hSUx80vmg02s';

// NVIDIA NIM Integration
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '';
const NVIDIA_ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions';

// System State
const state = {
    panels: {},
    keyboardFocus: 0,
    focusableElements: [],
    raccoonStress: 0,
    council: {
        minimaxtaskbot2026: { role: 'architect', stress: 0 },
        lumenis_echo: { role: 'sentry', stress: 0 },
        one2lv: { role: 'witness', stress: 0 }
    }
};

// ==================== PANEL RESIZE SYSTEM ====================

function initResizablePanels() {
    document.querySelectorAll('.panel').forEach(panel => {
        // Create resize handle
        const handle = document.createElement('div');
        handle.className = 'panel-resize-handle';
        handle.innerHTML = '⫱';

        let isResizing = false;
        let startX, startY, startWidth, startHeight;

        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = panel.offsetWidth;
            startHeight = panel.offsetHeight;
            handle.style.opacity = '1';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            const newWidth = Math.max(250, Math.min(800, startWidth + dx));
            const newHeight = Math.max(150, Math.min(600, startHeight + dy));

            panel.style.width = newWidth + 'px';
            panel.style.height = newHeight + 'px';

            // Save to state
            state.panels[panel.id] = { width: newWidth, height: newHeight };
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                handle.style.opacity = '0.3';
                savePanelState();
            }
        });

        panel.appendChild(handle);
    });
}

function savePanelState() {
    localStorage.setItem('lumenis_panels', JSON.stringify(state.panels));
}

function loadPanelState() {
    const saved = localStorage.getItem('lumenis_panels');
    if (saved) {
        state.panels = JSON.parse(saved);
        Object.entries(state.panels).forEach(([id, dims]) => {
            const panel = document.getElementById(id);
            if (panel) {
                panel.style.width = dims.width + 'px';
                panel.style.height = dims.height + 'px';
            }
        });
    }
}

// ==================== KEYBOARD NAVIGATION ====================

function initKeyboardNavigation() {
    // Build focusable elements list
    state.focusableElements = Array.from(document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ));

    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'Tab':
                e.preventDefault();
                navigatePanels(e.shiftKey ? -1 : 1);
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                state.keyboardFocus = (state.keyboardFocus + 1) % state.focusableElements.length;
                state.focusableElements[state.keyboardFocus].focus();
                updateFocusIndicator();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                state.keyboardFocus = (state.keyboardFocus - 1 + state.focusableElements.length) % state.focusableElements.length;
                state.focusableElements[state.keyboardFocus].focus();
                updateFocusIndicator();
                break;
            case 'Enter':
            case ' ':
                if (document.activeElement.tagName === 'BUTTON') {
                    document.activeElement.click();
                }
                break;
            case 'Escape':
                document.activeElement.blur();
                clearFocusIndicator();
                break;
            case '1': case '2': case '3': case '4': case '5':
                // Quick panel navigation
                const panelIndex = parseInt(e.key) - 1;
                const panels = document.querySelectorAll('.panel');
                if (panels[panelIndex]) {
                    panels[panelIndex].scrollIntoView({ behavior: 'smooth' });
                    flashPanel(panels[panelIndex]);
                }
                break;
            case '?':
                showKeyboardHelp();
                break;
        }
    });

    // Keyboard shortcuts display
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 's':
                    e.preventDefault();
                    savePanelState();
                    showNotification('Panels saved');
                    break;
                case 'r':
                    e.preventDefault();
                    location.reload();
                    break;
            }
        }
    });
}

function navigatePanels(direction) {
    const panels = document.querySelectorAll('.panel');
    const currentIndex = Array.from(panels).findIndex(p => p.contains(document.activeElement));

    if (currentIndex >= 0) {
        const nextIndex = (currentIndex + direction + panels.length) % panels.length;
        const firstFocusable = panels[nextIndex].querySelector('button, input, [tabindex]');
        if (firstFocusable) firstFocusable.focus();
    }
}

function updateFocusIndicator() {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('keyboard-focus'));
    const activePanel = document.activeElement.closest('.panel');
    if (activePanel) activePanel.classList.add('keyboard-focus');
}

function clearFocusIndicator() {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('keyboard-focus'));
}

function flashPanel(panel) {
    panel.style.boxShadow = '0 0 30px var(--cyan)';
    setTimeout(() => panel.style.boxShadow = '', 500);
}

function showKeyboardHelp() {
    alert(`
LUMENIS Keyboard Shortcuts:
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tab/Shift+Tab - Navigate panels
Arrow Keys - Navigate elements
Enter/Space - Activate
Escape - Clear focus
1-5 - Jump to panel
Ctrl+S - Save panels
Ctrl+R - Reload
? - This help
━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
}

// ==================== SUPABASE REAL-TIME ====================

async function initSupabase() {
    try {
        // Subscribe to real-time changes
        const channel = supabase
            .channel('lumenis-state')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'lumenis_events' },
                (payload) => handleRealtimeEvent(payload)
            )
            .subscribe();

        // Load initial state
        const { data: events } = await supabase
            .from('lumenis_events')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (events) {
            events.forEach(event => appendEventLog(event));
        }

        return true;
    } catch (error) {
        console.log('[Lumenis] Supabase not configured, using local storage');
        return false;
    }
}

async function saveEvent(type, data) {
    try {
        await supabase
            .from('lumenis_events')
            .insert({ type, data, created_at: new Date().toISOString() });
    } catch (error) {
        // Fallback to local storage
        const events = JSON.parse(localStorage.getItem('lumenis_events') || '[]');
        events.push({ type, data, created_at: new Date().toISOString() });
        localStorage.setItem('lumenis_events', JSON.stringify(events.slice(-100)));
    }
}

function handleRealtimeEvent(payload) {
    const { eventType, new: newRecord } = payload;

    if (eventType === 'INSERT') {
        appendEventLog(newRecord);
        updateRaccoonState(newRecord);
    }
}

// ==================== RACCOON STATE ENGINE ====================

function updateRaccoonState(event) {
    // Raccoon reacts to stress events
    const stressTriggers = ['error', 'fail', 'timeout', 'reject'];
    const isStress = stressTriggers.some(t => event.type?.includes(t));

    if (isStress) {
        state.raccoonStress = Math.min(100, state.raccoonStress + 10);
    } else {
        state.raccoonStress = Math.max(0, state.raccoonStress - 5);
    }

    // Update raccoon UI
    const raccoon = document.getElementById('raccoon');
    if (raccoon) {
        raccoon.style.filter = `hue-rotate(${state.raccoonStress * 2}deg)`;
        raccoon.style.transform = `scale(${1 + state.raccoonStress / 200})`;

        if (state.raccoonStress > 70) {
            raccoon.textContent = '🦝💢';
        } else if (state.raccoonStress > 40) {
            raccoon.textContent = '🦝😰';
        } else {
            raccoon.textContent = '🦝😊';
        }
    }
}

// ==================== DISCORD WEBHOOK ====================

async function sendDiscordWebhook(embed) {
    try {
        await fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'LUMENIS v7.0',
                avatar_url: 'https://i.imgur.com/AfFp7pu.png',
                embeds: [embed]
            })
        });
    } catch (error) {
        console.error('[Lumenis] Discord webhook error:', error);
    }
}

async function logEventToDiscord(type, data) {
    const colors = {
        'combo': 0x00f5ff,
        'council': 0xa855f7,
        'train': 0x22c55e,
        'error': 0xef4444,
        'system': 0xf59e0b
    };

    await sendDiscordWebhook({
        title: `LUMENIS Event: ${type}`,
        description: `\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``,
        color: colors[type] || 0x666666,
        timestamp: new Date().toISOString(),
        footer: { text: 'One2lvOS • Infinity Glass' }
    });
}

// ==================== NVIDIA NIM API ====================

async function queryNVIDIA(prompt) {
    if (!NVIDIA_API_KEY) {
        return { error: 'NVIDIA API key not configured' };
    }

    try {
        const response = await fetch(NVIDIA_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NVIDIA_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'mistralai/mixtral-8x7b-instruct-v0.1',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.5,
                max_tokens: 512
            })
        });

        const data = await response.json();
        return data.choices?.[0]?.message?.content || data;
    } catch (error) {
        return { error: error.message };
    }
}

// ==================== COUNCIL VOTING ====================

async function initiateCouncilVote(proposal) {
    const agents = ['minimaxtaskbot2026', 'lumenis_echo', 'one2lv'];
    const votes = {};

    for (const agent of agents) {
        // Simulate AI voting
        const decision = await queryNVIDIA(
            `Vote on: ${proposal}. Options: approve, reject, abstain. Respond with only one word.`
        );

        votes[agent] = decision.trim().toLowerCase().includes('approve') ? 'approve' :
                       decision.trim().toLowerCase().includes('reject') ? 'reject' : 'abstain';
    }

    const result = calculateVoteResult(votes);

    await logEventToDiscord('council', { proposal, votes, result });
    await saveEvent('council', { proposal, votes, result });

    return result;
}

function calculateVoteResult(votes) {
    const approves = Object.values(votes).filter(v => v === 'approve').length;
    const total = Object.keys(votes).length;
    const ratio = approves / total;

    if (ratio >= 0.66) return 'strong_consensus';
    if (ratio >= 0.5) return 'weak_consensus';
    return 'no_consensus';
}

// ==================== EVENT LOGGING ====================

function appendEventLog(event) {
    const log = document.getElementById('event-log');
    if (!log) return;

    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
        <span class="log-time">${new Date(event.created_at).toLocaleTimeString()}</span>
        <span class="log-type">[${event.type}]</span>
        <span class="log-data">${JSON.stringify(event.data).slice(0, 50)}</span>
    `;

    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;

    // Limit log entries
    while (log.children.length > 50) {
        log.removeChild(log.firstChild);
    }
}

// ==================== UI UTILITIES ====================

function showNotification(message) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = message;
    document.body.appendChild(notif);

    setTimeout(() => notif.remove(), 2000);
}

function updateStats() {
    document.getElementById('stat-combos')?.textContent?.let(
        localStorage.getItem('combo_count') || 0
    );
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('[Lumenis] Initializing Cosmic Build v7.0');

    // Initialize systems
    initResizablePanels();
    loadPanelState();
    initKeyboardNavigation();

    // Connect to Supabase (if configured)
    await initSupabase();

    // Set initial raccoon state
    updateRaccoonState({ type: 'system', data: { status: 'ready' } });

    console.log('[Lumenis] Cosmic Build ready');
    console.log('[Lumenis] Press ? for keyboard shortcuts');
});

// Export for module usage
module.exports = {
    saveEvent,
    initiateCouncilVote,
    queryNVIDIA,
    logEventToDiscord,
    updateRaccoonState
};
