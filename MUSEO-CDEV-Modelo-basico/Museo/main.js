// ======== Config básica ========
import { createYouTubeBgm } from './bgm/youtubeBgm.js'; // para música de fondo
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createVitrina1, createVitrina2, createVitrinaLibertadores, createVitrinaAmerica, createVitrinaCentralEscudo, createVitrinaWorldCup3, createVitrinaWorldCup4, createVitrinaJabulani2, createVitrinaJabulani3, createVitrinaMedallaOlimpica } from './src/objects/vitrinas.js';
// addFrame ahora es usado internamente por módulos; no se importa aquí
import { createGoldenPlaque } from './src/ui/plaques.js';
import { initControls, getMoveState, isPointerLocked } from './src/controls/input.js';
import { initHotbar, setHotbarSlot, scrollHotbar, updateHotbar, playCurrentSlotSound } from './src/ui/hotbar.js';
import { initRaycast, tryOpenInfo, updateAimLabel, getRaycaster } from './src/ui/raycastInfo.js';
import { initVideoControls, checkVideoProximity } from './src/ui/videoControls.js';
import { initLightSwitch, getLightSwitchModel, toggleLightSwitch } from './src/objects/lightSwitch.js';
import { initRopeBarriers, checkRopeBarrierCollision as checkRopeBarrierCollisionModule } from './src/objects/ropeBarriers.js';
import { ropeBarrierPositions } from './src/objects/ropeBarrierLayout.js';
import { placeArtworks, placeUpperFloorArtworks } from './src/objects/artworks.js';
import { initMovement } from './src/controls/movement.js';
import { createSecondFloor } from './src/world/secondFloor.js';
import { initCollisionSystem } from './src/physics/collisions.js';
import { initLightingSystem, createCeiling } from './src/world/lighting.js';
import { createSmallRoom } from './src/world/smallRoom.js';
import { initSmallRoomAudio, updateSmallRoomAudio } from './src/audio/smallRoomAmbient.js';
console.log('🚀 Iniciando museo virtual...');
const CANVAS = document.getElementById("miCanvas");
console.log('📺 Canvas encontrado:', CANVAS);

// Global error handlers to help diagnose runtime failures that stop the scene from loading
window.addEventListener('error', function (event) {
  console.error('Global error captured:', event.error || event.message, event);
  try {
    const existing = document.getElementById('runtime-error-overlay');
    if (!existing) {
      const ov = document.createElement('div');
      ov.id = 'runtime-error-overlay';
      ov.style.position = 'fixed';
      ov.style.left = '10px';
      ov.style.right = '10px';
      ov.style.top = '10px';
      ov.style.padding = '12px';
      ov.style.background = 'rgba(0,0,0,0.9)';
      ov.style.color = '#fff';
      ov.style.zIndex = 99999;
      ov.style.fontFamily = 'monospace';
      ov.style.whiteSpace = 'pre-wrap';
      ov.style.maxHeight = '40vh';
      ov.style.overflow = 'auto';
      ov.textContent = 'Runtime error: ' + (event.error && event.error.stack ? event.error.stack : (event.message || String(event.error)));
      document.body.appendChild(ov);
    }
  } catch (e) {
    // ignore overlay errors
  }
});

window.addEventListener('unhandledrejection', function (event) {
  console.error('Unhandled Promise Rejection:', event.reason);
  try {
    const existing = document.getElementById('runtime-error-overlay');
    if (!existing) {
      const ov = document.createElement('div');
      ov.id = 'runtime-error-overlay';
      ov.style.position = 'fixed';
      ov.style.left = '10px';
      ov.style.right = '10px';
      ov.style.top = '10px';
      ov.style.padding = '12px';
      ov.style.background = 'rgba(0,0,0,0.9)';
      ov.style.color = '#fff';
      ov.style.zIndex = 99999;
      ov.style.fontFamily = 'monospace';
      ov.style.whiteSpace = 'pre-wrap';
      ov.style.maxHeight = '40vh';
      ov.style.overflow = 'auto';
      ov.textContent = 'Unhandled Promise Rejection: ' + (event.reason && event.reason.stack ? event.reason.stack : String(event.reason));
      document.body.appendChild(ov);
    }
  } catch (e) {
    // ignore
  }
});

if (!CANVAS) {
  console.error('❌ Canvas no encontrado! Verificar HTML');
  throw new Error('Canvas no encontrado');
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e1116);
console.log('🎬 Escena creada');

// Cámara y renderer
const ROOM = { w: 24, h: 10, d: 36 };
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
// Posición inicial: fondo de la sala pequeña
camera.position.set(0, 1.6, ROOM.d/2 + 8 - 1.5); // centrado, altura normal, fondo de la sala pequeña

const renderer = new THREE.WebGLRenderer({ canvas: CANVAS, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = false;
console.log('🎥 Renderer inicializado');

// Agregar escena al DOM si no está
scene.add(camera);
console.log('📱 Cámara agregada a la escena');

// ====== Sala del museo ======
const wallMat = new THREE.MeshStandardMaterial({ color: 0x5A6B3A, roughness: 0.8, metalness: 0.0 });
const floorMat = new THREE.MeshStandardMaterial({ color: 0x1f2836, roughness: 1.0 });

// ======== Sistema de Iluminación (modularizado) ========
const ENABLE_CEILING_LIGHTS = false;
const lightingSystem = initLightingSystem(scene, ROOM, ENABLE_CEILING_LIGHTS);
const { mainLights, lamparasSpotLights, toggleLuces } = lightingSystem;
const lucesPrendidas = () => lightingSystem.lucesPrendidas;


const room = new THREE.Group();

// ======== Piso de Parquet Uniforme ========
console.log('🪵 Creando piso de parquet uniforme...');
const floorTextureLoader = new THREE.TextureLoader();
const floorParquetTexture = floorTextureLoader.load('./assets/textures/madera_parquet.jpg');
floorParquetTexture.wrapS = THREE.RepeatWrapping;
floorParquetTexture.wrapT = THREE.RepeatWrapping;
floorParquetTexture.repeat.set(8, 6);
floorParquetTexture.anisotropy = 16;

const floorMaterial = new THREE.MeshStandardMaterial({
  map: floorParquetTexture,
  roughness: 0.3,
  metalness: 0.0
});

const mainFloor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.w, ROOM.d), floorMaterial);
mainFloor.rotation.x = -Math.PI/2;
mainFloor.position.set(0, 0, 0);
mainFloor.name = 'mainFloor';
room.add(mainFloor);

// ======== Techo (modularizado) ========
createCeiling(room, ROOM);

// (Recepción removida a pedido: se elimina mostrador y cartel)

// (Lámparas colgantes eliminadas por rendimiento a pedido del usuario)


// Paredes
function wall(w, h, d) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
}
const wallBack  = wall(ROOM.w, ROOM.h, 0.3); wallBack.position.set(0, ROOM.h/2, -ROOM.d/2);
const wallLeft  = wall(0.3, ROOM.h, ROOM.d); wallLeft.position.set(-ROOM.w/2, ROOM.h/2, 0);
const wallRight = wall(0.3, ROOM.h, ROOM.d); wallRight.position.set( ROOM.w/2, ROOM.h/2, 0);
room.add(wallBack, wallLeft, wallRight);

scene.add(room);

// ======== Escalera Central y Segunda Planta (modularizado) ========
const { 
  secondFloorGroup, 
  finalBalconyHeight, 
  balconyWidth, 
  stairOffset, 
  stairLength, 
  stepDepth, 
  stairWidth, 
  stepHeight, 
  totalSteps 
} = createSecondFloor(scene, ROOM, lamparasSpotLights);

// Abrimos un hueco de puerta en la pared frontal DESPUÉS de conocer finalBalconyHeight
// La puerta va desde el suelo hasta el piso del balcón, arriba sigue siendo pared
const DOOR = { width: 2.2, height: finalBalconyHeight, thickness: 0.3, centerX: 0 };
const halfRoomW = ROOM.w / 2;
const frontPanelW = halfRoomW - DOOR.width / 2;

// Segmentos izquierdo y derecho de la pared frontal COMPLETOS (desde piso hasta techo)
const wallFrontLeft  = wall(frontPanelW, ROOM.h, DOOR.thickness);
wallFrontLeft.position.set(-halfRoomW + frontPanelW / 2, ROOM.h / 2, ROOM.d / 2);
const wallFrontRight = wall(frontPanelW, ROOM.h, DOOR.thickness);
wallFrontRight.position.set( halfRoomW - frontPanelW / 2, ROOM.h / 2, ROOM.d / 2);

// Parte superior central: pared desde el piso del balcón hasta el techo
const upperWallHeight = ROOM.h - finalBalconyHeight;
const wallFrontUpper = wall(DOOR.width, upperWallHeight, DOOR.thickness);
wallFrontUpper.position.set(DOOR.centerX, finalBalconyHeight + upperWallHeight/2, ROOM.d/2);

// Marco de puerta: jambas que van desde el suelo hasta el piso del balcón
const jambW = 0.15, lintelH = 0.30, lintelDepth = 0.4;
const jambaIzq = wall(jambW, DOOR.height, DOOR.thickness);
jambaIzq.position.set(DOOR.centerX - DOOR.width/2 + jambW/2, DOOR.height/2, ROOM.d/2);
const jambaDer = wall(jambW, DOOR.height, DOOR.thickness);
jambaDer.position.set(DOOR.centerX + DOOR.width/2 - jambW/2, DOOR.height/2, ROOM.d/2);

// Dintel prominente a la altura del piso del balcón (mismo color que las paredes)
const dintel = new THREE.Mesh(
  new THREE.BoxGeometry(DOOR.width + jambW*2, lintelH, lintelDepth),
  wallMat
);
dintel.position.set(DOOR.centerX, finalBalconyHeight - lintelH/2, ROOM.d/2);

room.add(wallFrontLeft, wallFrontRight, wallFrontUpper, jambaIzq, jambaDer, dintel);

// ======== Sala pequeña (modular) ========
const SMALL = { w: 8, h: finalBalconyHeight, d: 8 };
const { group: smallRoom } = createSmallRoom(scene, ROOM, wallMat, floorMaterial, { ...SMALL, doorHeight: 3.75 });

// ======== Audio ambiental de la sala pequeña ========
// Configuración de la sala pequeña para detección de audio espacial
const smallRoomConfig = {
  centerX: 0,
  centerZ: ROOM.d/2 + SMALL.d/2,
  width: SMALL.w,
  depth: SMALL.d
};

// Audio espacial 3D - alcance muy reducido, solo cerca de la sala
// El tercer parámetro es la distancia máxima de audición (8 unidades)
const smallRoomAudio = initSmallRoomAudio('./assets/audio/audio.mp3', 0.4, 8);

// (Removed legacy interactive door and its hidden reception)

// ======== Rope Barriers (layout modular) ========
console.log('🚧 Cargando rope barriers...');
initRopeBarriers(scene, ropeBarrierPositions);

// ======== Obras / marcos (modular) ========
const interactables = [];
// Si durante la ejecución temprana añadimos objetos antes de que 'interactables' existiera,
// los guardamos en window.__pendingInteractables. Ahora los vaciamos.
if (window.__pendingInteractables && Array.isArray(window.__pendingInteractables)) {
  window.__pendingInteractables.forEach(obj => { try { interactables.push(obj); } catch(e){} });
  window.__pendingInteractables = [];
}
// Colocar obras de forma modular
placeArtworks(scene, interactables, ROOM);

// Colocar cuadros en el piso superior
placeUpperFloorArtworks(scene, interactables, finalBalconyHeight);


// ======== Vitrina de Vidrio 1 (modular: Jabulani) ========
// Parámetros: (scene, interactables, x, z, rotationY)
const { group: vitrinaGroup, baseY: vitrina1BaseY, vitH: vitrinaHeight, jabulaniModelRef, luzObjeto } = createVitrina1(scene, interactables, 6.5, -8, Math.PI/4);

// ====== Vitrina de Vidrio 2 (modular: Copa del Mundo Original) ======
// Parámetros: (scene, interactables, x, z, rotationY)
const { group: vitrina2Group, baseY: vitrina2BaseY, trofeoModelRef, luces: { luzTrofeo, luzLateral, luzLateral2 } } = createVitrina2(scene, interactables, -7.5, 6, Math.PI/4 + Math.PI);

// ====== Copa América 2021 (modular) ======
// Parámetros: (scene, interactables, x, z, rotationY)
const { group: vitrina3Group, baseY: vitrina3BaseY, glassH: vitrina3GlassHeight, copaModelRef: copaLibertadoresModelRef, luces: { spot: luzCopaLibertadores, l1: luzLateralCopa, l2: luzLateralCopa2 } } = createVitrinaLibertadores(scene, interactables, 6.5, 8, Math.PI/4);

// ======== Vitrina cilíndrica alta (modular: Escudo AFA) ========
// Parámetros: (scene, interactables, ROOM, x, z, rotationY)
const { group: vitrinaTallGroup, tallRadius, escudoModelRef, escudoPlaceholderRef } = createVitrinaCentralEscudo(scene, interactables, ROOM, 0, 0, 0);

// ====== Vitrina 4: Copa América 2024 (modular) ======
// Parámetros: (scene, interactables, x, z, rotationY)
const { group: vitrina4Group, baseY: vitrina4BaseY, glassH: vitrina4GlassHeight, copaModelRef: copaAmericaModelRef, luces: { spot: luzCopaAmerica, l1: luzLateralCopa4, l2: luzLateralCopa42 } } = createVitrinaAmerica(scene, interactables, 5.5, 17.2, Math.PI/2);

// ====== Vitrinas Copa del Mundo - Duplicados ======
// Parámetros: (scene, interactables, x, z, rotationY)
const { group: vitrina5Group, baseY: vitrina5BaseY, trofeoModelRef: trofeoModelRef5, luces: { luzTrofeo: luzTrofeo5, luzLateral: luzLateral5, luzLateral2: luzLateral25 } } = createVitrinaWorldCup3(scene, interactables, -6, 17.2, Math.PI/2);

const { group: vitrina6Group, baseY: vitrina6BaseY, trofeoModelRef: trofeoModelRef6, luces: { luzTrofeo: luzTrofeo6, luzLateral: luzLateral6, luzLateral2: luzLateral26 } } = createVitrinaWorldCup4(scene, interactables, 9.5, 17.2, Math.PI/2);

// ====== Vitrinas Jabulani - Duplicados ======
// Parámetros: (scene, interactables, x, z, rotationY)
const { group: vitrinaJabulani2Group, baseY: vitrinaJabulani2BaseY, vitH: vitrinaJabulani2Height, jabulaniModelRef: jabulaniModelRef2, luzObjeto: luzJabulani2 } = createVitrinaJabulani2(scene, interactables, 6.5, 12.5, Math.PI/4);

const { group: vitrinaJabulani3Group, baseY: vitrinaJabulani3BaseY, vitH: vitrinaJabulani3Height, jabulaniModelRef: jabulaniModelRef3, luzObjeto: luzJabulani3 } = createVitrinaJabulani3(scene, interactables, -7.5, 1, Math.PI/4 + Math.PI);

// Medalla Olímpica - posicionada cerca de las otras vitrinas
const { group: vitrinaMedallaGroup, baseY: vitrinaMedallaBaseY, vitH: vitrinaMedallaHeight, medallaModelRef, luzObjeto: luzMedalla } = createVitrinaMedallaOlimpica(scene, interactables, 3, -12.5, -Math.PI/4 + Math.PI);


// ======== Sistema de colisiones (modularizado) ========
const collisionSystem = initCollisionSystem(
  {
    vitrina1: vitrinaGroup,
    vitrina2: vitrina2Group,
    vitrina3: vitrina3Group,
    vitrina4: vitrina4Group,
    vitrina5: vitrina5Group,
    vitrina6: vitrina6Group,
    vitrinaJabulani2: vitrinaJabulani2Group,
    vitrinaJabulani3: vitrinaJabulani3Group,
    vitrinaMedalla: vitrinaMedallaGroup,
    vitrinaTall: vitrinaTallGroup,
    tallRadius: tallRadius
  },
  finalBalconyHeight,
  ROOM,
  balconyWidth
);

// Wrappers para mantener compatibilidad con código existente
function checkVitrinaCollision(newPos) {
  return collisionSystem.checkVitrinas(newPos);
}

function checkRailingCollision(newPos) {
  return collisionSystem.checkRailings(newPos);
}

// Sistema de colisión para todos los rope barriers
// Wrapper para usar el módulo de rope barriers con la misma firma
function checkRopeBarrierCollision(newPos) {
  return checkRopeBarrierCollisionModule(newPos, finalBalconyHeight);
}
// ======== Controles (modular) ========
const help = document.getElementById('help');
const label = document.getElementById('label');
const crosshair = document.getElementById('crosshair');
const hotbar = document.getElementById('hotbar');

// Inicializar controles modularizados
initControls(CANVAS, camera, {
  onInteractCallback: () => {
    // Verificar si está mirando al interruptor
    if (isInterruptorFocused()) {
      toggleLuces();
      toggleLightSwitch();
    } else {
      // Intentar abrir info de obra
      tryOpenInfo();
    }
  },
  onClickCallback: () => {
    // Reproducir el sonido del slot activo solo al hacer click
    playCurrentSlotSound();
  },
  onHotbarChangeCallback: (action, value) => {
    if (action === 'slot') {
      setHotbarSlot(value);
    } else if (action === 'scroll') {
      scrollHotbar(value);
    } else if (action === 'update') {
      updateHotbar();
    }
  },
  helpElement: help,
  crosshairElement: crosshair,
  hotbarElement: hotbar
});

// Movimiento (modular)
let movePlayer; // se inicializa más abajo con initMovement

// El scroll del mouse para la hotbar ya lo maneja el módulo de controles (callback 'scroll').

// Inicializar movimiento modular con la lógica actual
{
  const stairGeom = { stairOffset, stairLength, stepDepth, stairWidth, stepHeight, totalSteps };
  const checkers = { checkVitrinaCollision, checkRailingCollision, checkRopeBarrierCollision };
  ({ movePlayer } = initMovement({
    camera,
    ROOM,
    SMALL,
    DOOR,
    finalBalconyHeight,
    balconyWidth,
    stairGeom,
    checkers
  }));
}

// ======== Inicializar sistema de raycast ========
// Detectar si la cámara está mirando al interruptor (raycast al modelo)
function isInterruptorFocused() {
  const interruptor = getLightSwitchModel();
  if (!interruptor) return false;
  
  // Verificar proximidad primero
  if (!isNearObject(interruptor, 3.0)) return false;
  
  const raycaster = getRaycaster();
  raycaster.setFromCamera({x:0, y:0}, camera);
  const hits = raycaster.intersectObject(interruptor, true);
  return hits.length > 0;
}

// Función auxiliar para verificar proximidad
function isNearObject(obj, distance) {
  if (!obj) return false;
  const dx = camera.position.x - obj.position.x;
  const dz = camera.position.z - obj.position.z;
  return Math.sqrt(dx*dx + dz*dz) < distance;
}

// Inicializar el sistema de raycast después de que todos los interactables estén listos
initRaycast(camera, interactables, {
  checkInterruptor: isInterruptorFocused
});

// ======== Controles de video ========
initVideoControls();

// ======== Interruptor de luz ========
// Cargar el modelo y ubicarlo en la pared del frente cerca de la entrada
initLightSwitch(scene, {
  x: ROOM.w/2 - 0.25,
  y: 1.5,
  z: ROOM.d/2 - 2
}, {
  scale: 3,
  rotation: { x: 0, y: Math.PI, z: 0 }
});

// ======== Loop ========
// Declaración anticipada para evitar errores de temporal-dead-zone cuando animate
// intenta acceder a la variable antes de que el loader la inicialice.
let last = performance.now();
function animate(now){
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (isPointerLocked()){
    movePlayer(dt);
    updateAimLabel(() => lucesPrendidas);
    checkVideoProximity(camera, interactables);
    
    // Actualizar audio ambiental de la sala pequeña
    updateSmallRoomAudio(camera, smallRoomConfig);
  }
  // (removed legacy door animation)

  // Rotar el modelo Jabulani si está cargado
  if (jabulaniModelRef.current) {
    jabulaniModelRef.current.rotation.y += dt * 0.5;
  }
  
  // Rotar los modelos Jabulani duplicados si están cargados
  if (jabulaniModelRef2.current) {
    jabulaniModelRef2.current.rotation.y += dt * 0.5;
  }
  
  //Tango 1986 - sin rotación, se mantiene fija
  //if (jabulaniModelRef3.current) {
  //jabulaniModelRef3.current.rotation.y += dt * 0.5;
  //}
  
  // Rotar la medalla olímpica si está cargada
  if (medallaModelRef.current) {
    medallaModelRef.current.rotation.y += dt * 0.4;
  }
  
  // Rotar el trofeo de la Copa del Mundo si está cargado
  if (trofeoModelRef.current) {
    trofeoModelRef.current.rotation.y += dt * 0.3; // Rotación más lenta para el trofeo
  }
  
  // Rotar las copas duplicadas de la Copa del Mundo si están cargadas
  if (trofeoModelRef5.current) {
    trofeoModelRef5.current.rotation.y += dt * 0.3; // Misma velocidad que la original
  }
  
  if (trofeoModelRef6.current) {
    trofeoModelRef6.current.rotation.y += dt * 0.3; // Misma velocidad que la original
  }
  
  // Rotar la Copa América si está cargada
  if (copaLibertadoresModelRef.current) {
    copaLibertadoresModelRef.current.rotation.y += dt * 0.25; // Rotación elegante y lenta para la Copa América
  }

  // Rotar la Copa América si está cargada
  if (copaAmericaModelRef.current) {
    copaAmericaModelRef.current.rotation.y += dt * 0.25; // Igual velocidad que la Copa América
  }

  // Rotación del escudo central (GLTF si está, si no rotar placeholder)
  if (escudoModelRef.current) {
    escudoModelRef.current.rotation.y += dt * 0.25;
  } else if (escudoPlaceholderRef.current) {
    // rotar suavemente el placeholder para dar vida mientras carga/si falla el GLTF
    escudoPlaceholderRef.current.rotation.y += dt * 0.15;
  }
  
  // Efecto de luz en el objeto (siempre brillante)
  if (luzObjeto) {
    luzObjeto.intensity = 2.5 + Math.sin(now * 0.003) * 0.3;
  }

  // Efecto de luz en el trofeo (más brillante y dramático)
  if (luzTrofeo) {
    luzTrofeo.intensity = 6.0 + Math.sin(now * 0.002) * 1.5;
  }
  
  // Efecto adicional en las luces laterales
  if (luzLateral) {
    luzLateral.intensity = 2.5 + Math.sin(now * 0.003) * 0.8;
  }
  
  if (luzLateral2) {
    luzLateral2.intensity = 2.0 + Math.sin(now * 0.004) * 0.6;
  }

  renderer.render(scene, camera);
}

console.log('🎮 Iniciando loop de animación...');
console.log('🎒 Inicializando hotbar...');
initHotbar();
animate(performance.now());

// Resize
window.addEventListener('resize', ()=>{
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ===== MÚSICA DE FONDO DE YOUTUBE DESACTIVADA =====
// Crear el controlador (tu video de 1 hora)
const bgm = createYouTubeBgm({
  videoId: '8Gk-lP0JtjQ',  // <-- este es el link que pasaste
  volume: 25,              // 0..100
  size: 'micro',           // 1x1 px visible
});

// Iniciar música después de un delay para evitar conflictos con pointer lock
let musicStarted = false;
document.addEventListener('click', () => {
  if (!musicStarted) {
    musicStarted = true;
    setTimeout(() => {
      bgm.start().catch(err => {
        console.log('No se pudo iniciar música automáticamente:', err);
      });
    }, 100);
  }
}, { once: true });

// Atajos opcionales
document.addEventListener('keydown', (e) => {
  if (e.code === 'KeyM') bgm.mute();
  if (e.code === 'Equal' || e.code === 'ArrowUp') bgm.setVolume( Math.min(100, 35) );
  if (e.code === 'Minus' || e.code === 'ArrowDown') bgm.setVolume( Math.max(0, 15) );
});
========== FIN MÚSICA DE FONDO DESACTIVADA ========== */