'use strict';
(() => {
  const status = document.getElementById('pwa-status');
  const button = document.getElementById('install-app');
  let installPrompt = null;
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    button.hidden = standalone();
  });
  button.addEventListener('click', async () => {
    if (!installPrompt) return;
    const prompt = installPrompt;
    installPrompt = null;
    button.hidden = true;
    try {
      await prompt.prompt();
      await prompt.userChoice;
    } catch (error) {
      console.warn('GOLD CALC: install prompt unavailable', error);
    }
  });
  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    button.hidden = true;
  });
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    status.textContent = '計算できます。オフライン利用・インストールにはHTTPSで開いてください。';
    return;
  }
  const ready = () => {
    status.textContent = navigator.onLine
      ? 'オフラインでも計算できます。'
      : 'オフラインです。このまま計算できます。';
  };
  navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' })
    .then(() => new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('offline preparation timed out')), 20000);
      navigator.serviceWorker.ready.then(registration => {
        clearTimeout(timeout);
        resolve(registration);
      }, error => { clearTimeout(timeout); reject(error); });
    }))
    .then(() => {
      ready();
      window.addEventListener('online', ready);
      window.addEventListener('offline', ready);
    })
    .catch(error => {
      status.textContent = '計算できます。オフライン準備に失敗しました。通信を確認して再読み込みしてください。';
      console.warn('GOLD CALC: service worker registration failed', error);
    });
})();
