// ============================================================
//  MLBB PRODIGY – Shared Data & Utility Module
// ============================================================

// Global data store
window.MLBB = {
  heroes: [],
  counters: {},
  loaded: false,
  listeners: []
};

// ── Store F and TIER_ORDER on window.MLBB ONLY ─────────────
// This prevents "already declared" errors in HTML pages
window.MLBB.F = {
  ID:      0,
  NAME:    1,
  WIN:     2,
  BAN:     3,
  PICK:    4,
  IMG:     5,
  TIER:    6,
  SCORE:   7,
  ROLES:   8,
  LANES:   9,
  HISTORY: 10
};

window.MLBB.TIER_ORDER = { S: 0, A: 1, B: 2, C: 3, D: 4 };

// Local shortcut for use inside app.js only
const _F = window.MLBB.F;

// ── Icons (update paths to match your actual files) ─────────
const ROLE_ICONS = {
  'Tank':      '<img src="icons/tank_icon.png"      class="filter-icon" alt="Tank"> Tank',
  'Fighter':   '<img src="icons/fighter_icon.png"   class="filter-icon" alt="Fighter"> Fighter',
  'Mage':      '<img src="icons/mage_icon.png"      class="filter-icon" alt="Mage"> Mage',
  'Assassin':  '<img src="icons/assassin_icon.png"  class="filter-icon" alt="Assassin"> Assassin',
  'Marksman':  '<img src="icons/marksman_icon.png"  class="filter-icon" alt="Marksman"> Marksman',
  'Support':   '<img src="icons/support_icon.png"   class="filter-icon" alt="Support"> Support'
};

const LANE_ICONS = {
  'Gold Lane': '<img src="icons/gold_lane_icon.png" class="filter-icon" alt="Gold Lane"> Gold Lane',
  'Mid Lane':  '<img src="icons/mid_lane_icon.png"  class="filter-icon" alt="Mid Lane"> Mid Lane',
  'Exp Lane':  '<img src="icons/exp_lane_icon.png"  class="filter-icon" alt="Exp Lane"> Exp Lane',
  'Jungle':    '<img src="icons/jungle_icon.png"    class="filter-icon" alt="Jungle"> Jungle',
  'Roam':      '<img src="icons/roam_icon.png"      class="filter-icon" alt="Roam"> Roam'
};

// ── Load both JSON files ─────────────────────────────────
async function loadData() {
  try {
    const [heroRes, counterRes] = await Promise.all([
      fetch('heroes.json'),
      fetch('counters.json')
    ]);
    const heroData    = await heroRes.json();
    const counterData = await counterRes.json();

    window.MLBB.heroes    = heroData.heroes;
    window.MLBB.counters  = counterData.counters;
    window.MLBB.updatedAt = heroData.updated_at || '';
    window.MLBB.loaded    = true;

    window.MLBB.listeners.forEach(fn => fn());
    window.MLBB.listeners = [];

  } catch (err) {
    console.error('Failed to load data:', err);
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:16px;font-family:sans-serif;color:#aaa;">
        <p style="font-size:18px;">⚠️ Failed to load hero data.</p>
        <p style="font-size:13px;">Make sure heroes.json and counters.json are in the same folder.</p>
      </div>`;
  }
}

window.MLBB.onReady = function(fn) {
  if (window.MLBB.loaded) fn();
  else window.MLBB.listeners.push(fn);
};

window.MLBB.getHeroById = function(id) {
  id = parseInt(id);
  return window.MLBB.heroes.find(h => h[_F.ID] === id) || null;
};

window.MLBB.pct = function(val) {
  return (val * 100).toFixed(2) + '%';
};

window.MLBB.buildNavbar = function(activePage) {
  return `
    <nav class="navbar">
      <a href="index.html" class="logo-icon" title="MLBB Prodigy Home">
        <img src="mlbb_prodigy_simple_icon.png" alt="MLBB Prodigy Home Logo" style="filter:invert(1);mix-blend-mode:screen;">
      </a>
      <span class="tagline">Draft Smarter. Play Stronger.</span>
      <div class="nav-links">
        <a href="tierlist.html"    data-page="tierlist"    class="${activePage==='tierlist'?'active':''}">Tier List</a>
        <a href="statistics.html"  data-page="statistics"  class="${activePage==='statistics'?'active':''}">Statistics</a>
        <a href="counterpick.html" data-page="counterpick" class="${activePage==='counterpick'?'active':''}">Counter Pick</a>
      </div>
    </nav>`;
};

window.MLBB.buildFooter = function() {
  return `
    <footer class="footer">
      <p>© 2026 MLBB Prodigy. Hero data sourced from the <a href="https://www.mobilelegends.com/" target="_blank"><strong>official Mobile Legends Bang Bang website</strong></a>. Mobile Legends Bang Bang is a trademark of Moonton. This site is not affiliated with or endorsed by Moonton.</p>
    </footer>`;
};

window.MLBB.buildFilterBar = function(showSearch = false) {
  const roles = ['Tank', 'Fighter', 'Mage', 'Assassin', 'Marksman', 'Support'];
  const lanes = ['Gold Lane', 'Mid Lane', 'Exp Lane', 'Jungle', 'Roam'];

  const roleButtons = roles.map(r =>
    `<button class="filter-btn" data-filter="role" data-value="${r}">
       ${ROLE_ICONS[r] || r}
     </button>`
  ).join('');

  const laneButtons = lanes.map(l =>
    `<button class="filter-btn" data-filter="lane" data-value="${l}">
       ${LANE_ICONS[l] || l}
     </button>`
  ).join('');

  const searchHTML = showSearch ? `
    <div class="search-bar-wrap">
      <label for="heroSearch">Search Hero:</label>
      <input type="text" id="heroSearch" placeholder="e.g. Freya, Gloo..." autocomplete="off">
    </div>` : '';

  return `
    ${searchHTML}
    <div class="filter-bar">
      <div class="filter-group">
        <label>Roles</label>
        <div class="filter-buttons">${roleButtons}</div>
      </div>
      <div class="filter-group">
        <label>Lanes</label>
        <div class="filter-buttons">${laneButtons}</div>
      </div>
    </div>`;
};

window.MLBB.initFilters = function(onChange) {
  const state = { roles: new Set(), lanes: new Set() };
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type  = btn.dataset.filter;
      const value = btn.dataset.value;
      const set   = type === 'role' ? state.roles : state.lanes;
      if (set.has(value)) {
        set.delete(value);
        btn.classList.remove('active');
      } else {
        set.add(value);
        btn.classList.add('active');
      }
      onChange(state);
    });
  });
  return state;
};

window.MLBB.filterHeroes = function(heroes, state, query = '') {
  return heroes.filter(h => {
    const nameMatch = !query || h[_F.NAME].toLowerCase().includes(query.toLowerCase());
    const roleMatch = state.roles.size === 0 || h[_F.ROLES].some(r => state.roles.has(r));
    const laneMatch = state.lanes.size === 0 || h[_F.LANES].some(l => state.lanes.has(l));
    return nameMatch && roleMatch && laneMatch;
  });
};

window.MLBB.heroImg = function(hero, size = 52) {
  return `<div class="hero-icon" style="width:${size}px;height:${size}px;">
    <img src="${hero[_F.IMG]}" alt="${hero[_F.NAME]}" loading="lazy"
         onerror="this.style.display='none'">
  </div>`;
};

// ── Kick off data loading ─────────────────────────────────
loadData();