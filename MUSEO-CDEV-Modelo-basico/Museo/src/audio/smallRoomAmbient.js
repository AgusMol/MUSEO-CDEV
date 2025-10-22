import * as THREE from 'three';

/**
 * Sistema de audio ambiental espacial para la sala pequeña
 * El audio se desvanece con la distancia (audio 3D envolvente)
 */

let audioElement = null;
let isPlaying = false;
let baseVolume = 0.5;
let maxDistance = 20; // Distancia máxima donde el audio se escucha
let minDistance = 3;  // Distancia mínima (volumen máximo)

/**
 * Inicializa el sistema de audio ambiental espacial
 * @param {string} audioPath - Ruta al archivo de audio (mp3, wav, etc.)
 * @param {number} initialVolume - Volumen base (0-1)
 * @param {number} maxDist - Distancia máxima de audición
 */
export function initSmallRoomAudio(audioPath, initialVolume = 0.5, maxDist = 20) {
  baseVolume = Math.max(0, Math.min(1, initialVolume));
  maxDistance = maxDist;
  
  // Crear elemento de audio
  audioElement = document.createElement('audio');
  audioElement.src = audioPath;
  audioElement.loop = true;
  audioElement.volume = 0; // Empezamos en 0, se ajusta por distancia
  audioElement.preload = 'auto';
  
  // Ocultar el elemento (no es visible en el DOM)
  audioElement.style.display = 'none';
  document.body.appendChild(audioElement);
  
  console.log('🎵 Sistema de audio ambiental espacial inicializado');
  
  return {
    startAudio,
    stopAudio,
    setVolume: setAudioVolume,
    setMaxDistance
  };
}

/**
 * Inicia la reproducción del audio
 */
export function startAudio() {
  if (!audioElement || isPlaying) return;
  
  audioElement.play()
    .then(() => {
      isPlaying = true;
      console.log('🔊 Audio ambiental espacial iniciado');
    })
    .catch(err => {
      console.warn('No se pudo iniciar el audio ambiental:', err);
    });
}

/**
 * Detiene la reproducción del audio
 */
export function stopAudio() {
  if (!audioElement || !isPlaying) return;
  
  audioElement.pause();
  audioElement.currentTime = 0;
  isPlaying = false;
  console.log('🔇 Audio ambiental detenido');
}

/**
 * Cambia el volumen base del audio
 * @param {number} newVolume - Nuevo volumen base (0-1)
 */
export function setAudioVolume(newVolume) {
  baseVolume = Math.max(0, Math.min(1, newVolume));
}

/**
 * Cambia la distancia máxima de audición
 * @param {number} dist - Nueva distancia máxima
 */
export function setMaxDistance(dist) {
  maxDistance = Math.max(1, dist);
}

/**
 * Calcula el volumen espacial basado en la distancia
 * @param {number} distance - Distancia del jugador al origen del sonido
 * @returns {number} - Volumen calculado (0-1)
 */
function calculateSpatialVolume(distance) {
  if (distance <= minDistance) {
    return 1.0; // Volumen máximo cuando está muy cerca
  }
  
  if (distance >= maxDistance) {
    return 0.0; // Sin volumen cuando está muy lejos
  }
  
  // Interpolación lineal inversa para crear efecto de desvanecimiento
  const normalizedDistance = (distance - minDistance) / (maxDistance - minDistance);
  
  // Curva exponencial para un desvanecimiento más natural
  return Math.pow(1 - normalizedDistance, 2);
}

/**
 * Calcula la distancia del jugador al centro de la sala pequeña
 * @param {THREE.Vector3} playerPos - Posición del jugador
 * @param {Object} roomConfig - Configuración de la sala pequeña
 * @returns {number} - Distancia
 */
function getDistanceToRoom(playerPos, roomConfig) {
  const { centerX, centerZ } = roomConfig;
  const dx = playerPos.x - centerX;
  const dz = playerPos.z - centerZ;
  return Math.sqrt(dx * dx + dz * dz);
}

/**
 * Sistema de actualización para el audio ambiental espacial
 * Debe llamarse en cada frame del loop de animación
 * @param {THREE.Camera} camera - Cámara del jugador
 * @param {Object} roomConfig - Configuración de la sala pequeña
 */
export function updateSmallRoomAudio(camera, roomConfig) {
  if (!audioElement) return;
  
  // Calcular distancia al centro de la sala
  const distance = getDistanceToRoom(camera.position, roomConfig);
  
  // Calcular volumen espacial
  const spatialVolume = calculateSpatialVolume(distance);
  
  // Aplicar volumen base * volumen espacial
  const finalVolume = baseVolume * spatialVolume;
  audioElement.volume = finalVolume;
  
  // Auto-iniciar el audio cuando el jugador se acerca (primera vez)
  if (!isPlaying && distance < maxDistance) {
    startAudio();
  }
  
  // Opcional: pausar cuando está completamente fuera de rango para ahorrar recursos
  // (comentado por defecto para mantener la continuidad del loop)
  /*
  if (isPlaying && distance > maxDistance + 5) {
    stopAudio();
  }
  */
}

