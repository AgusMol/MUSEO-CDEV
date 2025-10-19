// ======== Config básica ========
import { createYouTubeBgm } from './bgm/youtubeBgm.js'; // para música de fondo
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createVitrina1, createVitrina2, createVitrinaLibertadores, createVitrinaAmerica, createVitrinaCentralEscudo } from './src/objects/vitrinas.js';
import { addFrame } from './src/objects/frames.js';
import { createGoldenPlaque } from './src/ui/plaques.js';
import { initControls, getMoveState, isCrouching, setCrouching, isPointerLocked } from './src/controls/input.js';
import { initHotbar, setHotbarSlot, scrollHotbar, updateHotbar } from './src/ui/hotbar.js';
import { initRaycast, tryOpenInfo, updateAimLabel, getRaycaster } from './src/ui/raycastInfo.js';
import { initLightSwitch, getLightSwitchModel, toggleLightSwitch } from './src/objects/lightSwitch.js';
import { initRopeBarriers, checkRopeBarrierCollision as checkRopeBarrierCollisionModule } from './src/objects/ropeBarriers.js';
import { createSecondFloor } from './src/world/secondFloor.js';
import { initCollisionSystem } from './src/physics/collisions.js';
import { initLightingSystem, createCeilingLamps, createCeiling, createReceptionRoom } from './src/world/lighting.js';
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
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 1.6, 16);

const renderer = new THREE.WebGLRenderer({ canvas: CANVAS, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
console.log('🎥 Renderer inicializado');

// Agregar escena al DOM si no está
scene.add(camera);
console.log('📱 Cámara agregada a la escena');

// ====== Sala del museo ======
const ROOM = { w: 24, h: 10, d: 36 };
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
mainFloor.receiveShadow = true;
mainFloor.name = 'mainFloor';
room.add(mainFloor);

// ======== Techo (modularizado) ========
createCeiling(room, ROOM);

// ======== Sala de Recepción (modularizada) ========
createReceptionRoom(scene, ROOM, wallMat);

// ======== Lámparas colgantes (modularizadas) ========
createCeilingLamps(scene, ROOM, lamparasSpotLights, ENABLE_CEILING_LIGHTS);


// Paredes
function wall(w, h, d) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
}
const wallBack  = wall(ROOM.w, ROOM.h, 0.3); wallBack.position.set(0, ROOM.h/2, -ROOM.d/2);
const wallFront = wall(ROOM.w, ROOM.h, 0.3); wallFront.position.set(0, ROOM.h/2,  ROOM.d/2);
const wallLeft  = wall(0.3, ROOM.h, ROOM.d); wallLeft.position.set(-ROOM.w/2, ROOM.h/2, 0);
const wallRight = wall(0.3, ROOM.h, ROOM.d); wallRight.position.set( ROOM.w/2, ROOM.h/2, 0);
room.add(wallBack, wallFront, wallLeft, wallRight);

scene.add(room);

// (Removed legacy interactive door and its hidden reception)

// ======== Rope Barriers (10 instancias modularizadas) ========
console.log('🚧 Cargando rope barriers...');

// Posiciones y rotaciones de las rope barriers
const ropeBarrierPositions = [
  { x: 0.3, y: 0, z: 16.1, rotX: 0, rotY: Math.PI/2, rotZ: 0 }, // Primera barrera cerca de recepción
  { x: 0.97, y: 0, z: 12.5, rotX: 0, rotY: 0, rotZ: 0 }, // Segunda barrera cerca de recepción
  { x: -1.9, y: 0, z: 12.5, rotX: 0, rotY: 0, rotZ: 0 }, // Tercera barrera cerca de recepción
  { x: -4.8, y: 0, z: 12.5, rotX: 0, rotY: 0, rotZ: 0 }, //Cuarta barrera cerca de recepción
  { x: -7.76, y: 0, z: 12.6, rotX: 0, rotY: Math.PI/2, rotZ: 0 }, //Quinta barrera sigue orden de izquierda a derecha desde donde arrancas
  { x: -7.76, y: 0, z: 9.8, rotX: 0, rotY: Math.PI/2, rotZ: 0 }, //Sexta barrera atrás de las vitrinas
  { x: -7.76, y: 0, z: 7, rotX: 0, rotY: Math.PI/2, rotZ: 0 }, //Septima barrera atrás de las vitrinas
  { x: -7.76, y: 0, z: 4.2, rotX: 0, rotY: Math.PI/2, rotZ: 0 },  //Octava barrera atrás de las vitrinas
  { x: -7.76, y: 0, z: 1.4, rotX: 0, rotY: Math.PI/2, rotZ: 0 },  //Novena barrera (continuación hacia el fondo)
  { x: -7.76, y: 0, z: -1.4, rotX: 0, rotY: Math.PI/2, rotZ: 0 }, //Décima barrera
  { x: -7.76, y: 0, z: -4.2, rotX: 0, rotY: Math.PI/2, rotZ: 0 }, //Undécima barrera
  { x: -7.76, y: 0, z: -7.0, rotX: 0, rotY: Math.PI/2, rotZ: 0 }, //Duodécima barrera
  { x: -7.76, y: 0, z: -9.8, rotX: 0, rotY: Math.PI/2, rotZ: 0 }, //Décimo tercera barrera
  { x: -4.85, y: 0, z: -13.3, rotX: 0, rotY: 0, rotZ: 0 },//Décimo cuarta barrera (antes de la escalera)
  { x: -2, y: 0, z: -13.3, rotX: 0, rotY: 0, rotZ: 0 },//Décimo quinta barrera (antes de la escalera)
  { x: 0.8, y: 0, z: -13.3, rotX: 0, rotY: 0, rotZ: 0 }, //Barrera abajo de la escalera
  { x: 3.7, y: 0, z: -13.3, rotX: 0, rotY: 0, rotZ: 0 }, //Primera barrera pasando escalera
  { x: 3.6, y: 0, z: -10.37, rotX: 0, rotY: Math.PI/2, rotZ: 0 }, //Segunda barrera pasando escalera
  { x: 3.6, y: 0, z: -7.57, rotX: 0, rotY: Math.PI/2, rotZ: 0 }, //Continuación hacia el frente
  { x: 3.6, y: 0, z: -4.77, rotX: 0, rotY: Math.PI/2, rotZ: 0 },
  { x: 3.6, y: 0, z: -1.97, rotX: 0, rotY: Math.PI/2, rotZ: 0 },
  { x: 3.6, y: 0, z: 0.83, rotX: 0, rotY: Math.PI/2, rotZ: 0 },
  { x: 3.6, y: 0, z: 3.63, rotX: 0, rotY: Math.PI/2, rotZ: 0 },
  { x: 3.6, y: 0, z: 6.43, rotX: 0, rotY: Math.PI/2, rotZ: 0 },
  { x: 3.6, y: 0, z: 9.23, rotX: 0, rotY: Math.PI/2, rotZ: 0 },
  { x: 3.6, y: 0, z: 12.03, rotX: 0, rotY: Math.PI/2, rotZ: 0 },
];

// Inicializar rope barriers con el módulo
initRopeBarriers(scene, ropeBarrierPositions);


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

// ======== Obras / marcos ========
const interactables = [];
// Si durante la ejecución temprana añadimos objetos antes de que 'interactables' existiera,
// los guardamos en window.__pendingInteractables. Ahora los vaciamos.
if (window.__pendingInteractables && Array.isArray(window.__pendingInteractables)) {
  window.__pendingInteractables.forEach(obj => { try { interactables.push(obj); } catch(e){} });
  window.__pendingInteractables = [];
}
// ======== Catálogo de Obras (generado dinámicamente a partir de assets/images) ========
// Si hay pocas imágenes, se repiten para completar la distribución de la sala.
const availableImageFiles = [
  './assets/images/cafeteras.jpg',
  './assets/images/colonCampeon.jpg',
  './assets/images/Maradona_copa_del_mundo.png'
];

function buildObrasCatalog(count) {
  const catalog = [];
  for (let i = 0; i < count; i++) {
    const src = availableImageFiles[i % availableImageFiles.length];
    catalog.push({
      img: src,
      title: `Obra ${i + 1}`,
      author: '',
      year: '',
      desc: ''
    });
  }
  return catalog;
}

// Queremos cubrir 20 posiciones (4 paredes x 5 obras)
const obrasCatalogo = buildObrasCatalog(20);

// Función auxiliar para obtener obra por índice
function getObra(index) {
  return obrasCatalogo[index % obrasCatalogo.length];
}

// ======== Distribución de Obras por Paredes ========

// Pared del fondo (back) - 5 obras
const posicionesFondo = [-8, -4, 0, 4, 8];
posicionesFondo.forEach((x, index) => {
  const obra = getObra(index);
  addFrame(scene, interactables, { 
    x: x, 
    z: -ROOM.d/2 + 0.18, 
    face: "back",  
    img: obra.img, 
    title: obra.title,  
    desc: `${obra.author} · ${obra.year}\n\n${obra.desc}` 
  });
});

// Pared del frente (front) - 5 obras
const posicionesFrente = [-8, -4, 0, 4, 8];
posicionesFrente.forEach((x, index) => {
  const obra = getObra(index + 5); // Siguiente grupo de obras
  addFrame(scene, interactables, { 
    x: x, 
    z: ROOM.d/2 - 0.18, 
    face: "front", 
    img: obra.img, 
    title: obra.title, 
    desc: `${obra.author} · ${obra.year}\n\n${obra.desc}` 
  });
});

// Pared izquierda (left) - 5 obras
const posicionesIzquierda = [-8, -4, 0, 4, 8];
posicionesIzquierda.forEach((z, index) => {
  const obra = getObra(index + 10); // Siguiente grupo de obras
  addFrame(scene, interactables, { 
    x: -ROOM.w/2 + 0.18, 
    z: z, 
    face: "left",  
    img: obra.img, 
    title: obra.title,  
    desc: `${obra.author} · ${obra.year}\n\n${obra.desc}` 
  });
});

// Pared derecha (right) - 5 obras
const posicionesDerecha = [-8, -4, 0, 4, 8];
posicionesDerecha.forEach((z, index) => {
  const obra = getObra(index + 15); // Siguiente grupo de obras
  addFrame(scene, interactables, { 
    x: ROOM.w/2 - 0.18, 
    z: z, 
    face: "right", 
    img: obra.img, 
    title: obra.title, 
    desc: `${obra.author} · ${obra.year}\n\n${obra.desc}` 
  });
});

// ======== Vitrina de Vidrio 1 (modular) ========
const { group: vitrinaGroup, baseY: vitrina1BaseY, vitH: vitrinaHeight, jabulaniModelRef, luzObjeto } = createVitrina1(scene, interactables);

// ====== Vitrina de Vidrio 2 (modular: Copa del Mundo) ======
const { group: vitrina2Group, baseY: vitrina2BaseY, trofeoModelRef, luces: { luzTrofeo, luzLateral, luzLateral2 } } = createVitrina2(scene, interactables);

// ====== Copa Libertadores (modular) ======
const { group: vitrina3Group, baseY: vitrina3BaseY, glassH: vitrina3GlassHeight, copaModelRef: copaLibertadoresModelRef, luces: { spot: luzCopaLibertadores, l1: luzLateralCopa, l2: luzLateralCopa2 } } = createVitrinaLibertadores(scene, interactables);

// ======== Vitrina cilíndrica alta (modular) ========
const { group: vitrinaTallGroup, tallRadius, escudoModelRef, escudoPlaceholderRef } = createVitrinaCentralEscudo(scene, interactables, ROOM);

// ====== Vitrina 4: Copa América (modular) - Declaración anticipada ======
const { group: vitrina4Group, baseY: vitrina4BaseY, glassH: vitrina4GlassHeight, copaModelRef: copaAmericaModelRef, luces: { spot: luzCopaAmerica, l1: luzLateralCopa4, l2: luzLateralCopa42 } } = createVitrinaAmerica(scene, interactables);


// ======== Sistema de colisiones (modularizado) ========
const collisionSystem = initCollisionSystem(
  {
    vitrina1: vitrinaGroup,
    vitrina2: vitrina2Group,
    vitrina3: vitrina3Group,
    vitrina4: vitrina4Group,
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
    // Primero verificar si está mirando al interruptor
    if (isInterruptorFocused()) {
      toggleLuces();
      toggleLightSwitch();
    } else {
      // Intentar abrir info de obra
      tryOpenInfo();
    }
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

// Variables locales para lógica de movimiento
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

// Scroll del mouse para cambiar slots de hotbar (ya manejado por el módulo)
document.addEventListener('wheel', (e) => {
  if (!isPointerLocked()) return;
  
  e.preventDefault();
  const direction = e.deltaY > 0 ? 1 : -1;
  let newSlot = currentSlot + direction;
  
  // Wrap around: del 9 al 1 y del 1 al 9
  if (newSlot > 9) newSlot = 1;
  if (newSlot < 1) newSlot = 9;
  
  setHotbarSlot(newSlot);
}, { passive: false });

// Movimiento
const GRAVITY = 18, JUMP = 5;
let onFloor = true;
let vy = 0;

const STAND_HEIGHT = 1.6;
const CROUCH_HEIGHT = 1.0;

// Modificar la altura de la cámara en movePlayer
function movePlayer(dt){
  const move = getMoveState(); // Obtener estado del módulo de controles
  const crouching = isCrouching();
  
  direction.set(0,0,0);
  const speed = (move.run ? 6 : 3.2);

  if (move.f) direction.z += 1;
  if (move.b) direction.z -= 1;
  if (move.l) direction.x -= 1;
  if (move.r) direction.x += 1;
  direction.normalize();

  const forward = new THREE.Vector3(0,0,-1).applyEuler(camera.rotation);
  const right   = new THREE.Vector3(1,0,0).applyEuler(camera.rotation);

  // Calcular nueva posición
  const newPosition = camera.position.clone();
  newPosition.addScaledVector(forward, direction.z * speed * dt);
  newPosition.addScaledVector(right,   direction.x * speed * dt);

  // Verificar colisión con la vitrina, las barandas y el rope barrier
  if (!checkVitrinaCollision(newPosition) && !checkRailingCollision(newPosition) && !checkRopeBarrierCollision(newPosition)) {
    camera.position.copy(newPosition);
  }

  // ======== Sistema de Escaleras ========
  // Función para calcular la altura del suelo en la posición actual
  function getFloorHeight(x, z) {
    // Altura base del suelo
    let floorHeight = 0;
    const playerCurrentY = camera.position.y;
    const basePlayerHeight = crouching ? CROUCH_HEIGHT : STAND_HEIGHT;
    
    // Verificar si está en la escalera central (reposicionada más atrás)
    const stairCenterX = 0;
    const stairStartZ = stairOffset + stairLength/2;   // Ajustado con el offset
    const stairEndZ = stairOffset - stairLength/2;     // Ajustado con el offset
    
    if (Math.abs(x - stairCenterX) <= stairWidth/2 + 0.5 && z <= stairStartZ && z >= stairEndZ) {
      // Calcular en qué escalón está (invertido)
      const stepIndex = Math.floor((stairStartZ - z) / stepDepth);
      if (stepIndex >= 0 && stepIndex < totalSteps) {
        const stepHeight_calculated = stepIndex * stepHeight;
        // Solo aplicar si el jugador está POR ENCIMA de una altura mínima (no caminando por debajo)
        const minHeightToApply = stepHeight_calculated - 0.5; // 0.5m por debajo del escalón
        if (playerCurrentY - basePlayerHeight >= minHeightToApply) {
          floorHeight = stepHeight_calculated;
        }
      }
    }
    
    // Plataforma superior eliminada - la escalera ahora conecta directamente con el balcón
    
    // Las escaleras laterales ahora son plataformas horizontales (detectadas en la sección de plataformas laterales más abajo)
    
    // Verificar si está en el balcón perimetral rediseñado (sin huecos)
    const balconyHeight = finalBalconyHeight;
    const minHeightToApply = balconyHeight - 0.5; // 0.5m por debajo del balcón
    
    // Balcón frontal completo (de pared a pared)
    if (Math.abs(x) <= ROOM.w/2 && 
        z >= ROOM.d/2 - balconyWidth && z <= ROOM.d/2) {
      if (playerCurrentY - basePlayerHeight >= minHeightToApply) {
        floorHeight = balconyHeight;
      }
    }
    
    // Balcón trasero completo (de pared a pared)
    if (Math.abs(x) <= ROOM.w/2 && 
        z >= -ROOM.d/2 && z <= -ROOM.d/2 + balconyWidth) {
      if (playerCurrentY - basePlayerHeight >= minHeightToApply) {
        floorHeight = balconyHeight;
      }
    }
    
    // Balcón izquierdo (conecta sin superposición)
    if (x >= -ROOM.w/2 && x <= -ROOM.w/2 + balconyWidth && 
        Math.abs(z) <= (ROOM.d - balconyWidth*2)/2) {
      if (playerCurrentY - basePlayerHeight >= minHeightToApply) {
        floorHeight = balconyHeight;
      }
    }
    
    // Balcón derecho (conecta sin superposición)
    if (x >= ROOM.w/2 - balconyWidth && x <= ROOM.w/2 && 
        Math.abs(z) <= (ROOM.d - balconyWidth*2)/2) {
      if (playerCurrentY - basePlayerHeight >= minHeightToApply) {
        floorHeight = balconyHeight;
      }
    }
    
    // Conector eliminado - la escalera ahora conecta directamente con el balcón exterior
    
    // Las plataformas de esquina ya no son necesarias con el nuevo diseño continuo
    
    return floorHeight;
  }
  
  // Calcular altura del suelo en la posición actual del jugador
  const currentFloorHeight = getFloorHeight(camera.position.x, camera.position.z);
  const basePlayerHeight = crouching ? CROUCH_HEIGHT : STAND_HEIGHT;
  const targetHeight = currentFloorHeight + basePlayerHeight;
  
  // Salto
  if (move.up && onFloor){ vy = JUMP; onFloor=false; }
  vy -= GRAVITY * dt;
  camera.position.y += vy * dt;
  
  if (camera.position.y <= targetHeight){
    camera.position.y = targetHeight;
    vy = 0;
    onFloor = true;
  }

  // Verificación robusta: si está en el área del balcón y agachado, nunca dejar caer por debajo del piso del balcón
  const balconyHeight = finalBalconyHeight;
  // Definir si el jugador está sobre el balcón (frontal, trasero, izquierdo o derecho)
  const onBalcony = (
    // Balcón frontal
    Math.abs(camera.position.x) <= ROOM.w/2 && 
    camera.position.z >= ROOM.d/2 - balconyWidth && camera.position.z <= ROOM.d/2
  ) || (
    // Balcón trasero
    Math.abs(camera.position.x) <= ROOM.w/2 && 
    camera.position.z >= -ROOM.d/2 && camera.position.z <= -ROOM.d/2 + balconyWidth
  ) || (
    // Balcón izquierdo
    camera.position.x >= -ROOM.w/2 && camera.position.x <= -ROOM.w/2 + balconyWidth && 
    Math.abs(camera.position.z) <= (ROOM.d - balconyWidth*2)/2
  ) || (
    // Balcón derecho
    camera.position.x >= ROOM.w/2 - balconyWidth && camera.position.x <= ROOM.w/2 && 
    Math.abs(camera.position.z) <= (ROOM.d - balconyWidth*2)/2
  );
  if (crouching && onBalcony) {
    const minBalconyY = balconyHeight + CROUCH_HEIGHT;
    if (camera.position.y < minBalconyY) {
      camera.position.y = minBalconyY;
      vy = 0;
      onFloor = true;
    }
  }



  // Colisiones con paredes
  const margin = 0.6;
  camera.position.x = Math.max(-ROOM.w/2 + margin, Math.min(ROOM.w/2 - margin, camera.position.x));
  camera.position.z = Math.max(-ROOM.d/2 + margin, Math.min(ROOM.d/2 - margin, camera.position.z));
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
  }
  // (removed legacy door animation)

  // Rotar el modelo Jabulani si está cargado
  if (jabulaniModelRef.current) {
    jabulaniModelRef.current.rotation.y += dt * 0.5;
  }
  
  // Rotar el trofeo de la Copa del Mundo si está cargado
  if (trofeoModelRef.current) {
    trofeoModelRef.current.rotation.y += dt * 0.3; // Rotación más lenta para el trofeo
  }
  
  // Rotar la Copa Libertadores si está cargada
  if (copaLibertadoresModelRef.current) {
    copaLibertadoresModelRef.current.rotation.y += dt * 0.25; // Rotación elegante y lenta para la Copa Libertadores
  }

  // Rotar la Copa América si está cargada (mismo comportamiento que la Copa Libertadores)
  if (copaAmericaModelRef.current) {
    copaAmericaModelRef.current.rotation.y += dt * 0.25; // Igual velocidad que la Copa Libertadores
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

// Crear el controlador (tu video de 1 hora)
const bgm = createYouTubeBgm({
  videoId: '8Gk-lP0JtjQ',  // <-- este es el link que pasaste
  volume: 25,              // 0..100
  size: 'micro',           // 1x1 px visible
});

const canvas = document.getElementById('miCanvas');
canvas.addEventListener('click', () => {
  // acá ya hacés pointer-lock si corresponde
  bgm.start();             // inicia la música
}, { once: true });

// Atajos opcionales
document.addEventListener('keydown', (e) => {
  if (e.code === 'KeyM') bgm.mute();
  if (e.code === 'Equal' || e.code === 'ArrowUp') bgm.setVolume( Math.min(100, 35) );
  if (e.code === 'Minus' || e.code === 'ArrowDown') bgm.setVolume( Math.max(0, 15) );
});