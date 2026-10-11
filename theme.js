/* v3.2 — inject CSS langsung, tidak bergantung file style.css */
(function() {
  const theme = localStorage.dq_theme || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
  
  const darkCSS = `
    html[data-theme="dark"], html[data-theme="dark"] body {
      background: #0e1a30 !important;
      color: #e6edf8 !important;
      color-scheme: dark !important;
    }
    html[data-theme="dark"] nav { background: #050d1a !important; color: #e6edf8 !important; }
    html[data-theme="dark"] .hero { background: #06213f !important; color: #e6edf8 !important; }
    html[data-theme="dark"] .card, html[data-theme="dark"] form,
    html[data-theme="dark"] input, html[data-theme="dark"] select {
      background: #15264a !important;
      color: #e6edf8 !important;
      border-color: #4a6fa5 !important;
    }
    html[data-theme="dark"] .btn { background: #34d058 !important; color: #0e1a30 !important; border-color: #4a6fa5 !important; }
    html[data-theme="dark"] .btn.alt { background: #15264a !important; color: #e6edf8 !important; }
    html[data-theme="dark"] .opt { background: #0e1a30 !important; color: #e6edf8 !important; border-color: #4a6fa5 !important; }
    html[data-theme="dark"] .opt:hover { background: #1d3560 !important; }
    html[data-theme="dark"] .fact { background: #12372a !important; color: #e6edf8 !important; }
    html[data-theme="dark"] .on { background: #12372a !important; }
    html[data-theme="dark"] .track, html[data-theme="dark"] .bar {
      background: #223357 !important;
      border-color: #4a6fa5 !important;
    }
    html[data-theme="dark"] td, html[data-theme="dark"] th {
      border-bottom-color: #2a3d63 !important;
      color: #e6edf8 !important;
    }
    html[data-theme="dark"] .pill { background: #12372a !important; color: #e6edf8 !important; }
    html[data-theme="dark"] .pill.m { background: #4a3a14 !important; }
    html[data-theme="dark"] .cv { background: #0e1a30 !important; }
    html[data-theme="dark"] .code { background: #0e1a30 !important; color: #2fd0c4 !important; }
    html[data-theme="dark"] button:not(.btn):not(.opt) { color: #e6edf8 !important; }
    html[data-theme="dark"] small { color: #2fd0c4 !important; }
  `;
  
  const style = document.createElement('style');
  style.id = 'dark-mode-inject';
  style.textContent = darkCSS;
  document.head.appendChild(style);
})();

function toggleTheme() {
  const cur = document.documentElement.dataset.theme;
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.dq_theme = next;
  const b = document.querySelector('#th');
  if (b) b.textContent = next === 'dark' ? '☀️' : '🌙';
  console.log('[THEME] Switched to', next, '| bg:', getComputedStyle(document.body).backgroundColor);
}

addEventListener('DOMContentLoaded', () => {
  const b = document.querySelector('#th');
  if (b) b.textContent = document.documentElement.dataset.theme === 'dark' ? '☀️' : '🌙';
});
