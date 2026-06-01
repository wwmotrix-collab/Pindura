// ══════════════════════════════════════════════════
// PENDURA v2.2.0 — PWA CLEANUP
// Desativa o service worker antigo e força recuperação de CSS/JS no mobile.
// ══════════════════════════════════════════════════

let _deferredPrompt = null;
const PINDURA_ASSET_VERSION = '220-cache-reset';

(function recoverMobileCss() {
  try {
    const css = document.querySelector('link[rel="stylesheet"][href*="css/main.css"]');
    if (css && !css.href.includes(PINDURA_ASSET_VERSION)) {
      css.href = `css/main.css?v=${PINDURA_ASSET_VERSION}`;
    }
  } catch (e) {
    console.warn('[PWA] falha ao atualizar CSS:', e);
  }
})();

// Kill switch: não registra mais Service Worker enquanto o app estiver em ajuste.
// O bug visual veio de cache antigo servindo HTML/CSS fora de sincronia.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(reg => reg.unregister()));
      console.log('[PWA] Service workers removidos:', regs.length);
    } catch (e) {
      console.warn('[PWA] erro ao remover SW:', e);
    }

    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
        console.log('[PWA] caches removidos:', keys.length);
      }
    } catch (e) {
      console.warn('[PWA] erro ao limpar caches:', e);
    }

    try {
      const alreadyReloaded = sessionStorage.getItem('pindura_css_recovered_v220');
      const hasVersion = location.search.includes('v=220-cache-reset') || location.search.includes('v=220');
      if (!alreadyReloaded && !hasVersion) {
        sessionStorage.setItem('pindura_css_recovered_v220', '1');
        const url = new URL(location.href);
        url.searchParams.set('v', PINDURA_ASSET_VERSION);
        location.replace(url.toString());
      }
    } catch (e) {}
  });
}

// Banner de instalação mantido sem registrar novo SW.
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _deferredPrompt = e;
  if (!localStorage.getItem('pwa_dismissed')) {
    setTimeout(_showInstallBanner, 4000);
  }
});

function _showInstallBanner() {
  if (document.getElementById('pwa-banner')) return;
  const b = document.createElement('div');
  b.id = 'pwa-banner';
  b.style.cssText = `
    position:fixed;bottom:1rem;left:.75rem;right:.75rem;max-width:400px;margin:0 auto;
    background:var(--surface);border:1px solid var(--glass-border);
    color:var(--text-1);padding:.85rem 1rem;border-radius:var(--r-lg);
    display:flex;align-items:center;gap:.75rem;z-index:9997;
    box-shadow:var(--shadow-lg);animation:toastIn .35s var(--easing);
    font-family:var(--font-body);
  `;
  b.innerHTML = `
    <span style="font-size:1.5rem">📒</span>
    <div style="flex:1">
      <div style="font-weight:700;font-size:.88rem;color:var(--text-1)">Instalar Pendura</div>
      <div style="font-size:.72rem;color:var(--text-2)">Acesso rápido na tela inicial</div>
    </div>
    <button onclick="_installPwa()" style="
      background:var(--green);color:white;border:none;border-radius:var(--r-sm);
      padding:.4rem .85rem;font-weight:700;font-size:.78rem;cursor:pointer;
      font-family:var(--font-body);
    ">Instalar</button>
    <button onclick="_dismissPwa()" style="
      background:none;border:none;color:var(--text-3);cursor:pointer;font-size:1.1rem;padding:.2rem
    ">✕</button>`;
  document.body.appendChild(b);
}

function _installPwa() {
  if (!_deferredPrompt) return;
  _deferredPrompt.prompt();
  _deferredPrompt.userChoice.then(r => {
    if (r.outcome === 'accepted' && typeof App !== 'undefined') App.toast('🎉 Pendura instalado!', 'success');
    _deferredPrompt = null;
    document.getElementById('pwa-banner')?.remove();
  });
}

function _dismissPwa() {
  localStorage.setItem('pwa_dismissed', '1');
  document.getElementById('pwa-banner')?.remove();
}

window.addEventListener('appinstalled', () => {
  if (typeof App !== 'undefined') App.toast('📒 App instalado!', 'success');
  _deferredPrompt = null;
});
