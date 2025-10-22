/**
 * Sistema de controles de video para el museo
 */

let activeVideo = null;
let isControlsVisible = false;
let keyboardControlsActive = false;

export function initVideoControls() {
  const controls = document.getElementById('video-controls');
  const playBtn = document.getElementById('video-play');
  const pauseBtn = document.getElementById('video-pause');
  const muteBtn = document.getElementById('video-mute');
  const progressSlider = document.getElementById('video-progress');
  const volumeSlider = document.getElementById('video-volume');
  const currentTime = document.getElementById('video-current');
  const durationTime = document.getElementById('video-duration');
  const volumeLabel = document.getElementById('video-volume-label');

  if (!controls) return;

  // Función para formatear tiempo
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Play
  playBtn.addEventListener('click', () => {
    if (activeVideo) {
      activeVideo.play();
      playBtn.classList.add('active');
      pauseBtn.classList.remove('active');
    }
  });

  // Pause
  pauseBtn.addEventListener('click', () => {
    if (activeVideo) {
      activeVideo.pause();
      pauseBtn.classList.add('active');
      playBtn.classList.remove('active');
    }
  });

  // Mute/Unmute
  let isMuted = false;
  muteBtn.addEventListener('click', () => {
    if (activeVideo) {
      isMuted = !isMuted;
      activeVideo.muted = isMuted;
      muteBtn.textContent = isMuted ? '🔊 Unmute' : '🔇 Mute';
      muteBtn.classList.toggle('active', isMuted);
    }
  });

  // Progress bar (mantener funcionalidad de mouse para casos excepcionales)
  progressSlider.addEventListener('input', (e) => {
    if (activeVideo && activeVideo.duration) {
      const time = (e.target.value / 100) * activeVideo.duration;
      activeVideo.currentTime = time;
    }
  });

  // Volume slider (mantener funcionalidad de mouse para casos excepcionales)
  volumeSlider.addEventListener('input', (e) => {
    if (activeVideo) {
      activeVideo.dataset.baseVolume = e.target.value / 100;
      volumeLabel.textContent = `${e.target.value}%`;
    }
  });

  // ========== CONTROLES DE TECLADO ==========
  document.addEventListener('keydown', (e) => {
    // Solo activar si los controles están visibles y hay un video activo
    if (!keyboardControlsActive || !activeVideo) return;
    
    switch(e.code) {
      case 'KeyP': // Play/Pause
        if (activeVideo.paused) {
          activeVideo.play();
          playBtn.classList.add('active');
          pauseBtn.classList.remove('active');
        } else {
          activeVideo.pause();
          pauseBtn.classList.add('active');
          playBtn.classList.remove('active');
        }
        e.preventDefault();
        break;
        
      case 'KeyM': // Mute/Unmute
        isMuted = !isMuted;
        activeVideo.muted = isMuted;
        muteBtn.textContent = isMuted ? '🔊 Unmute' : '🔇 Mute';
        muteBtn.classList.toggle('active', isMuted);
        e.preventDefault();
        break;
        
      case 'ArrowLeft': // Retroceder 5 segundos
        if (activeVideo.currentTime > 5) {
          activeVideo.currentTime -= 5;
        } else {
          activeVideo.currentTime = 0;
        }
        e.preventDefault();
        break;
        
      case 'ArrowRight': // Avanzar 5 segundos
        if (activeVideo.duration && activeVideo.currentTime < activeVideo.duration - 5) {
          activeVideo.currentTime += 5;
        } else if (activeVideo.duration) {
          activeVideo.currentTime = activeVideo.duration;
        }
        e.preventDefault();
        break;
        
      case 'ArrowUp': // Subir volumen
        const currentVol = parseFloat(activeVideo.dataset.baseVolume) || 0.5;
        const newVolUp = Math.min(1.0, currentVol + 0.1);
        activeVideo.dataset.baseVolume = newVolUp.toString();
        volumeSlider.value = Math.round(newVolUp * 100);
        volumeLabel.textContent = `${Math.round(newVolUp * 100)}%`;
        e.preventDefault();
        break;
        
      case 'ArrowDown': // Bajar volumen
        const currentVolDown = parseFloat(activeVideo.dataset.baseVolume) || 0.5;
        const newVolDown = Math.max(0.0, currentVolDown - 0.1);
        activeVideo.dataset.baseVolume = newVolDown.toString();
        volumeSlider.value = Math.round(newVolDown * 100);
        volumeLabel.textContent = `${Math.round(newVolDown * 100)}%`;
        e.preventDefault();
        break;
        
      case 'Digit0': // Ir al inicio
        activeVideo.currentTime = 0;
        e.preventDefault();
        break;
        
      case 'Home': // Ir al inicio
        activeVideo.currentTime = 0;
        e.preventDefault();
        break;
        
      case 'End': // Ir al final
        if (activeVideo.duration) {
          activeVideo.currentTime = activeVideo.duration - 0.1;
        }
        e.preventDefault();
        break;
    }
  });

  // Actualizar progreso
  function updateProgress() {
    if (activeVideo && isControlsVisible) {
      if (activeVideo.duration) {
        const progress = (activeVideo.currentTime / activeVideo.duration) * 100;
        progressSlider.value = progress;
        currentTime.textContent = formatTime(activeVideo.currentTime);
        durationTime.textContent = formatTime(activeVideo.duration);
      }
      requestAnimationFrame(updateProgress);
    }
  }

  // Función para mostrar/ocultar controles
  window.showVideoControls = function(video) {
    activeVideo = video;
    controls.classList.add('show');
    isControlsVisible = true;
    keyboardControlsActive = true;

    // Inicializar valores
    const baseVolume = parseFloat(video.dataset.baseVolume) || 0.5;
    volumeSlider.value = Math.round(baseVolume * 100);
    volumeLabel.textContent = `${Math.round(baseVolume * 100)}%`;
    
    // Actualizar estado de botones
    if (video.paused) {
      playBtn.classList.remove('active');
      pauseBtn.classList.add('active');
    } else {
      playBtn.classList.add('active');
      pauseBtn.classList.remove('active');
    }
    
    isMuted = video.muted;
    muteBtn.classList.toggle('active', video.muted);
    muteBtn.textContent = video.muted ? '🔊 Unmute' : '🔇 Mute';

    updateProgress();
  };

  window.hideVideoControls = function() {
    controls.classList.remove('show');
    isControlsVisible = false;
    keyboardControlsActive = false;
    activeVideo = null;
  };

  console.log('🎬 Controles de video inicializados (teclado activado)');
}

// Función para calcular volumen basado en distancia
function calculateVolumeByDistance(distance) {
  const maxDistance = 6; // Distancia máxima donde se escucha (reducida)
  const minDistance = 1.5;  // Distancia mínima (volumen máximo)
  
  if (distance <= minDistance) {
    return 1.0; // Volumen máximo
  } else if (distance >= maxDistance) {
    return 0.0; // Sin sonido
  } else {
    // Interpolación suave (curva exponencial inversa)
    const normalized = (distance - minDistance) / (maxDistance - minDistance);
    return Math.pow(1 - normalized, 2); // Curva cuadrática para fade más natural
  }
}

// Función para detectar si el jugador está cerca de un video y ajustar volumen
export function checkVideoProximity(camera, interactables) {
  const threshold = 1.5; // Distancia para mostrar controles (PEGADO AL CUADRO)
  let foundVideo = false;
  
  for (const obj of interactables) {
    if (obj.userData && obj.userData.isVideo && obj.userData.video) {
      const dx = camera.position.x - obj.position.x;
      const dz = camera.position.z - obj.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      const video = obj.userData.video;
      
      // Obtener volumen base del dataset o usar 0.5 por defecto
      const baseVolume = parseFloat(video.dataset.baseVolume) || 0.5;
      
      // Calcular volumen espacial
      const spatialVolume = calculateVolumeByDistance(distance);
      
      // Aplicar volumen final (base * espacial)
      video.volume = baseVolume * spatialVolume;
      
      // Mostrar controles solo si está PEGADO
      if (distance < threshold) {
        window.showVideoControls(video);
        foundVideo = true;
      }
      
      // Auto-play cuando el jugador está cerca por primera vez
      if (distance < 3.5 && video.paused && !video.dataset.hasPlayed) {
        video.play().then(() => {
          video.dataset.hasPlayed = 'true';
        }).catch(err => {
          console.log('Video autoplay bloqueado:', err);
        });
      }
    }
  }
  
  if (!foundVideo) {
    window.hideVideoControls();
  }
  
  return foundVideo;
}
