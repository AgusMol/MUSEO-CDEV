// Museo/bgm/youtubeBgm.js
let ytApiReady;

/** Carga la IFrame API de YouTube una sola vez */
function loadYouTubeAPI() {
  if (ytApiReady) return ytApiReady;
  ytApiReady = new Promise((resolve) => {
    if (window.YT && window.YT.Player) return resolve();
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    window.onYouTubeIframeAPIReady = () => resolve();
    document.head.appendChild(s);
  });
  return ytApiReady;
}

/** Crea un reproductor de BGM (video visible 1x1 px para cumplir ToS) */
export function createYouTubeBgm({ videoId, volume = 25, size = 'micro' } = {}) {
  let player = null;
  let started = false;
  volume = Math.max(0, Math.min(100, volume|0));

  // Contenedor visible mínimo (no tapa clics)
  const box = document.createElement('div');
  box.id = 'yt-bgm';
  box.style.position = 'fixed';
  box.style.zIndex = '10';
  box.style.bottom = '10px';
  box.style.left = '10px';
  box.style.background = '#000';
  box.style.borderRadius = '8px';
  box.style.overflow = 'hidden';
  box.style.pointerEvents = 'none';
  if (size === 'micro') { box.style.width = '1px'; box.style.height = '1px'; }
  else if (size === 'tiny') { box.style.width = '120px'; box.style.height = '68px'; }
  else { box.style.width = '180px'; box.style.height = '101px'; }
  document.body.appendChild(box);

  function ensurePlayer() {
    if (player) return Promise.resolve(player);
    return loadYouTubeAPI().then(() => new Promise((resolve) => {
      /* global YT */
      player = new YT.Player(box, {
        width: '100%',
        height: '100%',
        videoId,
        playerVars: {
          enablejsapi: 1,
          origin: window.location.origin,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          loop: 1,
          playlist: videoId,   // necesario para loop
        },
        events: {
          onReady: (e) => { try { e.target.setVolume(volume); } catch {} resolve(player); },
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.ENDED) {
              try { player.seekTo(0); player.playVideo(); } catch {}
            }
          }
        }
      });
    }));
  }

  async function start() {
    if (started) return;
    started = true;
    await ensurePlayer();
    try { player.unMute(); player.setVolume(volume); player.playVideo(); }
    catch { try { player.mute(); player.playVideo(); } catch {} }
  }

  function setVolume(v) {
    volume = Math.max(0, Math.min(100, v|0));
    if (!player) return;
    try { player.setVolume(volume); if (volume > 0) player.unMute(); } catch {}
  }
  function mute()   { if (player) try { player.mute(); } catch {} }
  function unmute() { if (player) try { player.unMute(); player.setVolume(volume); } catch {} }

  function onVis() {
    if (!player) return;
    if (document.hidden) { try { player.pauseVideo(); } catch {} }
    else if (started) { try { player.playVideo(); } catch {} }
  }
  document.addEventListener('visibilitychange', onVis);

  function destroy() {
    document.removeEventListener('visibilitychange', onVis);
    if (player && player.destroy) { try { player.destroy(); } catch {} }
    box.remove();
  }

  return { start, setVolume, mute, unmute, destroy };
}
