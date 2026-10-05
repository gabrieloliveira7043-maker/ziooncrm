// Este arquivo existe só para limpar versões antigas do app guardadas em aparelhos (iPad, celular).
// O service worker antigo servia sempre a primeira cópia da página que ele guardou, e o aparelho ficava
// sem as novidades. Ao ser instalado, este apaga os arquivos guardados, se desliga e recarrega a página.
// Sem "fetch" aqui: tudo vai direto para a internet.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(c => { try { c.navigate(c.url); } catch (e) {} });
  })());
});
