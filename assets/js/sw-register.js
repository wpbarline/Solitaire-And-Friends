/* Registers offline support from any page depth. Updates must not interrupt a
   card move or race the first installation by forcing a page reload. */
if ('serviceWorker' in navigator) {
  const swUrl = new URL('../../sw.js', import.meta.url);   // assets/js/ -> site root
  const scope = new URL('../../', import.meta.url);
  navigator.serviceWorker.register(swUrl, { scope }).then((reg) => {
    // check for a new deploy: right now, whenever focus returns, and every 30 min
    reg.update().catch(() => {});
    document.addEventListener('visibilitychange', () => { if (!document.hidden) reg.update().catch(() => {}); });
    setInterval(() => reg.update().catch(() => {}), 30 * 60 * 1000);
  }).catch(() => {});
}
