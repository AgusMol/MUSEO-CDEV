// ======== Config básica ========
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
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
camera.position.set(0, 1.6, 10);

const renderer = new THREE.WebGLRenderer({ canvas: CANVAS, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
console.log('🎥 Renderer inicializado');

// Agregar escena al DOM si no está
scene.add(camera);
console.log('📱 Cámara agregada a la escena');


// Luces
// bandera para activar/desactivar rápidamente las luces del techo
const ENABLE_CEILING_LIGHTS = false; // cambiar a true para reactivar

const hemi = new THREE.HemisphereLight(0xffffff, 0x222233, 0.8);
scene.add(hemi);

// Spot principal del techo (se crea solo si ENABLE_CEILING_LIGHTS)
let spot = null;
if (ENABLE_CEILING_LIGHTS) {
  spot = new THREE.SpotLight(0xffffff, 2.0, 60, Math.PI/5, 0.2, 1.5);
  spot.position.set(0, 7.5, 0);
  spot.castShadow = true;
  scene.add(spot);
  scene.add(spot.target);
}

// Luz ambiental extra
const ambient = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambient);

// Agrupar luces principales para controlarlas (no incluir spot si fue desactivado)
const mainLights = [hemi, ambient];
if (spot) mainLights.push(spot);
let lucesPrendidas = true;

function toggleLuces() {
  lucesPrendidas = !lucesPrendidas;
  mainLights.forEach(luz => luz.visible = lucesPrendidas);
  // También apagar/prender las luces de las lámparas del techo
  lamparasSpotLights.forEach(luz => luz.visible = lucesPrendidas);
}

// Array para guardar los SpotLight de las lámparas del techo
const lamparasSpotLights = [];

// ====== Sala del museo ======
const ROOM = { w: 24, h: 10, d: 36 }; // Aumentada altura de 6 a 10 metros para acomodar el segundo piso
const wallMat = new THREE.MeshStandardMaterial({ color: 0x5A6B3A, roughness: 0.8, metalness: 0.0 }); // Color oliva más oscuro y elegante
const floorMat = new THREE.MeshStandardMaterial({ color: 0x1f2836, roughness: 1.0 });


const room = new THREE.Group();

// ======== Piso de Parquet Uniforme (igual al segundo piso) ========
console.log('🪵 Creando piso de parquet uniforme...');

// Cargar la misma textura que se usa en el segundo piso
const floorTextureLoader = new THREE.TextureLoader();
const floorParquetTexture = floorTextureLoader.load('./assets/textures/madera_parquet.jpg');
floorParquetTexture.wrapS = THREE.RepeatWrapping;
floorParquetTexture.wrapT = THREE.RepeatWrapping;
floorParquetTexture.repeat.set(8, 6); // Escala apropiada para el piso grande
floorParquetTexture.anisotropy = 16;

// Material del piso (idéntico al del segundo piso)
const floorMaterial = new THREE.MeshStandardMaterial({
  map: floorParquetTexture,
  roughness: 0.3,
  metalness: 0.0
});

// Piso principal del museo (parquet)
const mainFloor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.w, ROOM.d), floorMaterial);
mainFloor.rotation.x = -Math.PI/2;
mainFloor.position.set(0, 0, 0);
mainFloor.receiveShadow = true;
mainFloor.name = 'mainFloor';
room.add(mainFloor);

// (Reception room will be added after ceiling is constructed)

// ======= Techo: parámetros y paneles =======
// Asegurar que variables usadas por el techo estén definidas
// Definir primero el tamaño de panel para poder derivar cuántos paneles encajan en la sala
const panelSize = (typeof window.panelSize !== 'undefined') ? window.panelSize : 4.0;
// Derivar número de paneles usando las dimensiones de la sala para evitar huecos
const panelsX = (typeof window.panelsX !== 'undefined') ? window.panelsX : Math.ceil(ROOM.w / panelSize);
const panelsZ = (typeof window.panelsZ !== 'undefined') ? window.panelsZ : Math.ceil(ROOM.d / panelSize);
const frameThickness = (typeof window.frameThickness !== 'undefined') ? window.frameThickness : 0.12;
const wallThickness = (typeof window.wallThickness !== 'undefined') ? window.wallThickness : 0.08;
const panelDepth = (typeof window.panelDepth !== 'undefined') ? window.panelDepth : 0.12;
const ceilingHeight = (typeof window.ceilingHeight !== 'undefined') ? window.ceilingHeight : ROOM.h - 0.4;

// Materiales del techo (si no existían previamente)
const ceilingPanelMaterial = (typeof window.ceilingPanelMaterial !== 'undefined') ? window.ceilingPanelMaterial : new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.9 });
const ceilingFrameMaterial = (typeof window.ceilingFrameMaterial !== 'undefined') ? window.ceilingFrameMaterial : new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 });

// Grupo para el techo
const ceilingGroup = (typeof window.ceilingGroup !== 'undefined') ? window.ceilingGroup : new THREE.Group();

// Crear estructura de marcos (líneas que separan los paneles)
// Marcos horizontales
for (let x = 0; x <= panelsX; x++) {
  const posX = (x - panelsX/2) * panelSize;
  const frameGeometry = new THREE.BoxGeometry(
    frameThickness, 
    0.12, 
    ROOM.d
  );
  const frame = new THREE.Mesh(frameGeometry, ceilingFrameMaterial);
  frame.position.set(posX, ceilingHeight + 0.02, 0);
  frame.receiveShadow = true;
  frame.castShadow = true;
  
  ceilingGroup.add(frame);
}

// Marcos verticales
for (let z = 0; z <= panelsZ; z++) {
  const posZ = (z - panelsZ/2) * panelSize;
  const frameGeometry = new THREE.BoxGeometry(
    ROOM.w, 
    0.12, 
    frameThickness
  );
  const frame = new THREE.Mesh(frameGeometry, ceilingFrameMaterial);
  frame.position.set(0, ceilingHeight + 0.02, posZ);
  frame.receiveShadow = true;
  frame.castShadow = true;
  
  ceilingGroup.add(frame);
}

// Crear paneles entre los marcos para dar aspecto de techo completo
for (let ix = 0; ix < panelsX; ix++) {
  for (let iz = 0; iz < panelsZ; iz++) {
    const centerX = (ix - panelsX/2 + 0.5) * panelSize;
    const centerZ = (iz - panelsZ/2 + 0.5) * panelSize;
    const panelGeo = new THREE.BoxGeometry(panelSize - frameThickness*0.5, 0.08, panelSize - frameThickness*0.5);
    const panel = new THREE.Mesh(panelGeo, ceilingPanelMaterial);
    panel.position.set(centerX, ceilingHeight, centerZ);
    panel.receiveShadow = true;
    panel.castShadow = false;
    ceilingGroup.add(panel);
  }
}

// Agregar el techo completo a la sala
room.add(ceilingGroup);

// ======== Sala Recepción R (modelo nuevo, sin puerta) ========
// Añadida después de construir el techo para no romper bloques de código existentes
const receptionRoom = new THREE.Group();
const R_w = 6; // ancho de la sala R (en x)
const R_d = 8; // profundidad de la sala R (en z)
const R_h = 4; // altura de la sala R

// Piso de R (usar una variante de parquet más clara para diferenciar)
const receptionFloorTex = new THREE.TextureLoader().load('./assets/textures/madera_parquet.jpg');
receptionFloorTex.wrapS = receptionFloorTex.wrapT = THREE.RepeatWrapping;
receptionFloorTex.repeat.set(2,2);
const receptionFloorMat = new THREE.MeshStandardMaterial({ map: receptionFloorTex, roughness: 0.6 });
const receptionFloor = new THREE.Mesh(new THREE.PlaneGeometry(R_w, R_d), receptionFloorMat);
receptionFloor.rotation.x = -Math.PI/2;
receptionFloor.position.set(0, 0.01, ROOM.d/2 + R_d/2);
receptionFloor.receiveShadow = true;
receptionRoom.add(receptionFloor);

// Pared posterior de R
const receptionBack = new THREE.Mesh(new THREE.BoxGeometry(R_w, R_h, 0.3), wallMat);
receptionBack.position.set(0, R_h/2, ROOM.d/2 + R_d - 0.15);
receptionRoom.add(receptionBack);

// Pared izquierda de R
const receptionLeftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, R_h, R_d), wallMat);
receptionLeftWall.position.set(-R_w/2 + 0.15, R_h/2, ROOM.d/2 + R_d/2);
receptionRoom.add(receptionLeftWall);

// Pared derecha de R
const receptionRightWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, R_h, R_d), wallMat);
receptionRightWall.position.set(R_w/2 - 0.15, R_h/2, ROOM.d/2 + R_d/2);
receptionRoom.add(receptionRightWall);

// Mostrador central en R
const receptionDesk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 0.6), new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.2, roughness: 0.6 }));
receptionDesk.position.set(0, 0.45, ROOM.d/2 + 1.4);
receptionRoom.add(receptionDesk);

// Lámpara puntual en el centro de R
const receptionLight = new THREE.PointLight(0xfff7e0, 1.4, 10);
receptionLight.position.set(0, 2.5, ROOM.d/2 + R_d/2 - 1);
receptionRoom.add(receptionLight);

// Señal pequeña sobre el mostrador
const signCanvas = document.createElement('canvas');
signCanvas.width = 256; signCanvas.height = 128;
const sctx = signCanvas.getContext('2d');
sctx.fillStyle = '#222'; sctx.fillRect(0,0,256,128);
sctx.fillStyle = '#fff'; sctx.font = '28px Arial'; sctx.textAlign = 'center'; sctx.fillText('Recepción', 128, 70);
const signTex = new THREE.CanvasTexture(signCanvas);
const signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), signMat);
signMesh.position.set(0, 1.2, ROOM.d/2 + 0.6);
receptionRoom.add(signMesh);

// Añadir la sala R a la escena (siempre visible)
scene.add(receptionRoom);


// ======== Lámparas colgantes en el techo (solo modelo, sin focos) ========
const numRows = 3;
const numCols = 5;
const offsetY = ROOM.h - 0.4;
const lamparaGLTF = './assets/models/lampara_colgante_de_techo/scene.gltf';
const gltfLoaderLampara = new GLTFLoader();

for (let row = 0; row < numRows; row++) {
  const z = -ROOM.d/2 + (ROOM.d/(numRows+1)) * (row+1);
  for (let col = 0; col < numCols; col++) {
    const x = -ROOM.w/2 + (ROOM.w/(numCols+1)) * (col+1);
    gltfLoaderLampara.load(
      lamparaGLTF,
      function(gltf) {
        const lampara = gltf.scene.clone();
        lampara.position.set(x, offsetY - 1, z);
        lampara.scale.set(1, 1, 1);
        lampara.traverse(obj => { if (obj.isMesh) { obj.castShadow = true; obj.receiveShadow = true; }});
        scene.add(lampara);

        // Luz tipo SpotLight apuntando hacia el piso
        if (ENABLE_CEILING_LIGHTS) {
          const luzLampara = new THREE.SpotLight(0xffffff, 2.5, 12, Math.PI/6, 0.2, 0.8);
          luzLampara.position.set(x, offsetY - 0.2, z);
          luzLampara.target.position.set(x, .5, z);
          luzLampara.castShadow = false;
          scene.add(luzLampara);
          scene.add(luzLampara.target);
          lamparasSpotLights.push(luzLampara);
        }
      },
      undefined,
      function(error) {
        console.error('❌ Error cargando lámpara:', error);
      }
    );
  }
}


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


// ======== Escalera Central y Segunda Planta ========
console.log('🏗️ Creando escalera central y segunda planta...');

// Cargar textura de parquet para escalera y balcón
const stairTextureLoader = new THREE.TextureLoader();
const woodParquetTexture = stairTextureLoader.load('./assets/textures/madera_parquet.jpg');
woodParquetTexture.wrapS = THREE.RepeatWrapping;
woodParquetTexture.wrapT = THREE.RepeatWrapping;
woodParquetTexture.repeat.set(3, 3);
woodParquetTexture.anisotropy = 16;

// Crear textura rotada para escalera y balcón frontal/trasero
const woodParquetTextureRotated = woodParquetTexture.clone();
woodParquetTextureRotated.rotation = Math.PI / 2; // Rotar 90 grados
woodParquetTextureRotated.center.set(0.5, 0.5); // Centro de rotación
woodParquetTextureRotated.needsUpdate = true;

// Material para costados del balcón (orientación correcta)
const balconyMaterial = new THREE.MeshStandardMaterial({
  map: woodParquetTexture,
  roughness: 0.3,
  metalness: 0.0
});

// Material para escalera y balcón frontal/trasero (textura rotada)
const stairMaterial = new THREE.MeshStandardMaterial({
  map: woodParquetTextureRotated,
  roughness: 0.3,
  metalness: 0.0
});

// Material específico para balcones frontales y traseros
const frontBackBalconyMaterial = new THREE.MeshStandardMaterial({
  map: woodParquetTextureRotated,
  roughness: 0.3,
  metalness: 0.0
});

// Material para barandillas (metal dorado)
const railingMaterial = new THREE.MeshStandardMaterial({
  color: 0xB8860B,
  roughness: 0.3,
  metalness: 0.8
});

// Grupo para toda la estructura de segundo piso
const secondFloorGroup = new THREE.Group();

// ======== Escalera Central ========
const stairGroup = new THREE.Group();

// Dimensiones de la escalera (extendida para conectar con el balcón)
const stairWidth = 3;
const stepHeight = 0.2;
const stepDepth = 0.3;
const totalSteps = 23; // Aumentado de 15 a 23 para llegar a la altura del balcón (4.6m)
const stairLength = totalSteps * stepDepth;

// Crear escalones principales (centrales) - Conecta directamente al borde interior (barandilla marrón)
const stairOffset = -ROOM.d/2 + (5.0 - 0.025) + stairLength/2; // Posicionar para que termine en el borde interior del balcón trasero
for (let i = 0; i < totalSteps; i++) {
  const stepGeometry = new THREE.BoxGeometry(stairWidth, stepHeight, stepDepth);
  const step = new THREE.Mesh(stepGeometry, stairMaterial);
  
  step.position.set(
    0,
    i * stepHeight + stepHeight/2,
    stairOffset + stairLength/2 - i * stepDepth - stepDepth/2
  );
  
  step.castShadow = true;
  step.receiveShadow = true;
  stairGroup.add(step);
}

// Altura final de la escalera
const secondFloorHeight = totalSteps * stepHeight;

// Variables globales para escaleras laterales y plataforma
const sideStairSteps = 0; 
const sideStairWidth = 2;
const platformSize = 4;
const platformThickness = 0.15;
const balconyWidth = 5.0; // Ancho del balcón perimetral
const balconyThickness = 0.1;
const finalBalconyHeight = secondFloorHeight; // Ahora el balcón está a la misma altura que la escalera principal

// La escalera ahora conecta directamente con el balcón trasero
const leftStairGroup = new THREE.Group(); 
const rightStairGroup = new THREE.Group();

// ====== Balcón Perimetral Rediseñado ======
const balconyGroup = new THREE.Group();

// Balcón frontal completo (de pared a pared) - Con textura rotada
const frontBalconyGeometry = new THREE.BoxGeometry(ROOM.w, balconyThickness, balconyWidth);
const frontBalcony = new THREE.Mesh(frontBalconyGeometry, frontBackBalconyMaterial);
frontBalcony.position.set(0, finalBalconyHeight, ROOM.d/2 - balconyWidth/2);
frontBalcony.castShadow = true;
frontBalcony.receiveShadow = true;
balconyGroup.add(frontBalcony);

// Balcón trasero completo (de pared a pared) - Con textura rotada
const backBalcony = new THREE.Mesh(frontBalconyGeometry, frontBackBalconyMaterial);
backBalcony.position.set(0, finalBalconyHeight, -ROOM.d/2 + balconyWidth/2);
backBalcony.castShadow = true;
backBalcony.receiveShadow = true;
balconyGroup.add(backBalcony);

// Balcón izquierdo (conecta con frontales, sin superposición)
const leftBalconyGeometry = new THREE.BoxGeometry(balconyWidth, balconyThickness, ROOM.d - balconyWidth*2);
const leftBalcony = new THREE.Mesh(leftBalconyGeometry, balconyMaterial);
leftBalcony.position.set(-ROOM.w/2 + balconyWidth/2, finalBalconyHeight, 0);
leftBalcony.castShadow = true;
leftBalcony.receiveShadow = true;
balconyGroup.add(leftBalcony);

// Balcón derecho (conecta con frontales, sin superposición)
const rightBalcony = new THREE.Mesh(leftBalconyGeometry, balconyMaterial);
rightBalcony.position.set(ROOM.w/2 - balconyWidth/2, finalBalconyHeight, 0);
rightBalcony.castShadow = true;
rightBalcony.receiveShadow = true;
balconyGroup.add(rightBalcony);

// ======== Barandillas del Balcón ========
const railingHeight = 1.2;
const railingThickness = 0.05;

// Función para crear barandilla
function createRailing(width, depth, x, y, z) {
  const railingGroup = new THREE.Group();
  
  // Barandilla superior
  const topRailGeometry = new THREE.BoxGeometry(width, railingThickness, depth);
  const topRail = new THREE.Mesh(topRailGeometry, railingMaterial);
  topRail.position.set(0, railingHeight - railingThickness/2, 0);
  railingGroup.add(topRail);
  
  // Barandilla inferior
  const bottomRail = new THREE.Mesh(topRailGeometry, railingMaterial);
  bottomRail.position.set(0, railingThickness/2, 0);
  railingGroup.add(bottomRail);
  
  // Postes verticales
  const numPosts = Math.floor(Math.max(width, depth) / 1.5) + 1;
  for (let i = 0; i < numPosts; i++) {
    const postGeometry = new THREE.BoxGeometry(railingThickness, railingHeight, railingThickness);
    const post = new THREE.Mesh(postGeometry, railingMaterial);
    
    if (width > depth) {
      post.position.set(-width/2 + (width/(numPosts-1)) * i, railingHeight/2, 0);
    } else {
      post.position.set(0, railingHeight/2, -depth/2 + (depth/(numPosts-1)) * i);
    }
    
    railingGroup.add(post);
  }
  
  railingGroup.position.set(x, y, z);
  return railingGroup;
}

// Función para crear barandilla con hueco en el centro (para conexión de escalera)
function createRailingWithGap(width, depth, gapWidth, x, y, z) {
  const railingGroup = new THREE.Group();
  
  // Calcular dimensiones de las secciones laterales
  const sideWidth = (width - gapWidth) / 2;
  
  if (sideWidth > 0) {
    // Sección izquierda
    const leftRailing = createRailing(sideWidth, depth, -gapWidth/2 - sideWidth/2, 0, 0);
    railingGroup.add(leftRailing);
    
    // Sección derecha
    const rightRailing = createRailing(sideWidth, depth, gapWidth/2 + sideWidth/2, 0, 0);
    railingGroup.add(rightRailing);
  }
  
  railingGroup.position.set(x, y, z);
  return railingGroup;
}

// ======== Barandillas Mejoradas (Perímetro Exterior) ========
// Barandilla frontal exterior (borde del museo)
balconyGroup.add(createRailing(ROOM.w, railingThickness, 0, finalBalconyHeight + balconyThickness, ROOM.d/2 - railingThickness/2));

// Barandilla trasera exterior (borde del museo) 
balconyGroup.add(createRailing(ROOM.w, railingThickness, 0, finalBalconyHeight + balconyThickness, -ROOM.d/2 + railingThickness/2));

// Barandilla izquierda exterior (borde del museo)
balconyGroup.add(createRailing(railingThickness, ROOM.d - railingThickness*2, -ROOM.w/2 + railingThickness/2, finalBalconyHeight + balconyThickness, 0));

// Barandilla derecha exterior (borde del museo)
balconyGroup.add(createRailing(railingThickness, ROOM.d - railingThickness*2, ROOM.w/2 - railingThickness/2, finalBalconyHeight + balconyThickness, 0));

// ======== Barandillas Interiores (Vista al centro del museo) ========
// Ajustamos la posición interior para que estén en el borde interno del balcón
const innerRailingOffset = balconyWidth - railingThickness/2;

// Barandilla frontal interior
balconyGroup.add(createRailing(ROOM.w - balconyWidth*2, railingThickness, 0, finalBalconyHeight + balconyThickness, ROOM.d/2 - innerRailingOffset));

// Barandilla trasera interior (con hueco para la escalera)
const stairGapWidth = 3; // Ancho del hueco para la escalera
balconyGroup.add(createRailingWithGap(ROOM.w - balconyWidth*2, railingThickness, stairGapWidth, 0, finalBalconyHeight + balconyThickness, -ROOM.d/2 + innerRailingOffset));

// Barandilla izquierda interior
balconyGroup.add(createRailing(railingThickness, ROOM.d - balconyWidth*2, -ROOM.w/2 + innerRailingOffset, finalBalconyHeight + balconyThickness, 0));

// Barandilla derecha interior
balconyGroup.add(createRailing(railingThickness, ROOM.d - balconyWidth*2, ROOM.w/2 - innerRailingOffset, finalBalconyHeight + balconyThickness, 0));

// ======== Conexión Directa Escalera-Balcón ========
// La escalera ahora conecta directamente con el borde exterior del balcón trasero
// (plataforma de conexión eliminada para mejor fluidez arquitectónica)

// Agregar todo al grupo principal
secondFloorGroup.add(stairGroup);
secondFloorGroup.add(leftStairGroup);
secondFloorGroup.add(rightStairGroup);
secondFloorGroup.add(balconyGroup);

// Agregar a la escena
scene.add(secondFloorGroup);

// ======== Iluminación Segunda Planta ========
// Luz principal para la segunda planta
const secondFloorMainLight = new THREE.SpotLight(0xffffff, 1.8, 50, Math.PI/4, 0.3, 1.2);
secondFloorMainLight.position.set(0, finalBalconyHeight + 4, 0);
secondFloorMainLight.target.position.set(0, finalBalconyHeight, 0);
secondFloorMainLight.castShadow = true;
scene.add(secondFloorMainLight);
scene.add(secondFloorMainLight.target);

// Luces ambientales para cada lado del balcón
const balconyLights = [];

// Luces para las escaleras laterales (giradas 180°)
const leftStairZPos = -stairLength/2 - platformSize/2 + stepDepth;
const rightStairZPos = -stairLength/2 - platformSize/2 + stepDepth;

const leftStairLight = new THREE.SpotLight(0xffffff, 1.5, 15, Math.PI/6, 0.2, 0.8);
leftStairLight.position.set(-platformSize/2 - sideStairSteps * stepDepth/2, finalBalconyHeight + 2.5, leftStairZPos);
leftStairLight.target.position.set(-platformSize/2 - sideStairSteps * stepDepth/2, finalBalconyHeight, leftStairZPos);
leftStairLight.castShadow = true;
balconyLights.push(leftStairLight);

const rightStairLight = new THREE.SpotLight(0xffffff, 1.5, 15, Math.PI/6, 0.2, 0.8);
rightStairLight.position.set(platformSize/2 + sideStairSteps * stepDepth/2, finalBalconyHeight + 2.5, rightStairZPos);
rightStairLight.target.position.set(platformSize/2 + sideStairSteps * stepDepth/2, finalBalconyHeight, rightStairZPos);
rightStairLight.castShadow = true;
balconyLights.push(rightStairLight);

// Luz para el final de la escalera (conexión directa con balcón)
const stairEndLight = new THREE.SpotLight(0xffffff, 2.0, 12, Math.PI/6, 0.2, 0.8);
stairEndLight.position.set(0, secondFloorHeight + 3, stairOffset + stairLength/2 - stepDepth);
stairEndLight.target.position.set(0, secondFloorHeight, stairOffset + stairLength/2 - stepDepth);
stairEndLight.castShadow = true;
balconyLights.push(stairEndLight);

// ======== Luces Adicionales para el Segundo Piso (aprovechando la nueva altura) ========
// Luces desde el techo que iluminan las plataformas de esquina
const cornerPlatformLights = [];

// Luz para plataforma esquina frontal-izquierda
const frontLeftCornerLight = new THREE.SpotLight(0xffffff, 1.2, 12, Math.PI/4, 0.3, 0.5);
frontLeftCornerLight.position.set(-ROOM.w/2 + balconyWidth/2, ROOM.h - 1, ROOM.d/2 - balconyWidth/2);
frontLeftCornerLight.target.position.set(-ROOM.w/2 + balconyWidth/2, finalBalconyHeight, ROOM.d/2 - balconyWidth/2);
frontLeftCornerLight.castShadow = true;
cornerPlatformLights.push(frontLeftCornerLight);

// Luz para plataforma esquina frontal-derecha
const frontRightCornerLight = new THREE.SpotLight(0xffffff, 1.2, 12, Math.PI/4, 0.3, 0.5);
frontRightCornerLight.position.set(ROOM.w/2 - balconyWidth/2, ROOM.h - 1, ROOM.d/2 - balconyWidth/2);
frontRightCornerLight.target.position.set(ROOM.w/2 - balconyWidth/2, finalBalconyHeight, ROOM.d/2 - balconyWidth/2);
frontRightCornerLight.castShadow = true;
cornerPlatformLights.push(frontRightCornerLight);

// Luz para plataforma esquina trasera-izquierda
const backLeftCornerLight = new THREE.SpotLight(0xffffff, 1.2, 12, Math.PI/4, 0.3, 0.5);
backLeftCornerLight.position.set(-ROOM.w/2 + balconyWidth/2, ROOM.h - 1, -ROOM.d/2 + balconyWidth/2);
backLeftCornerLight.target.position.set(-ROOM.w/2 + balconyWidth/2, finalBalconyHeight, -ROOM.d/2 + balconyWidth/2);
backLeftCornerLight.castShadow = true;
cornerPlatformLights.push(backLeftCornerLight);

// Luz para plataforma esquina trasera-derecha
const backRightCornerLight = new THREE.SpotLight(0xffffff, 1.2, 12, Math.PI/4, 0.3, 0.5);
backRightCornerLight.position.set(ROOM.w/2 - balconyWidth/2, ROOM.h - 1, -ROOM.d/2 + balconyWidth/2);
backRightCornerLight.target.position.set(ROOM.w/2 - balconyWidth/2, finalBalconyHeight, -ROOM.d/2 + balconyWidth/2);
backRightCornerLight.castShadow = true;
cornerPlatformLights.push(backRightCornerLight);

// Agregar las luces del balcón a la escena y al sistema de control
balconyLights.forEach(light => {
  scene.add(light);
  scene.add(light.target);
  lamparasSpotLights.push(light);
});

// Agregar las luces de las plataformas de esquina
cornerPlatformLights.forEach(light => {
  scene.add(light);
  scene.add(light.target);
  lamparasSpotLights.push(light);
});

// Agregar luz principal al sistema de control
lamparasSpotLights.push(secondFloorMainLight);

console.log('✅ Escalera central y balcón perimetral creados');

// ======== Obras / marcos ========
const interactables = [];
// Si durante la ejecución temprana añadimos objetos antes de que 'interactables' existiera,
// los guardamos en window.__pendingInteractables. Ahora los vaciamos.
if (window.__pendingInteractables && Array.isArray(window.__pendingInteractables)) {
  window.__pendingInteractables.forEach(obj => { try { interactables.push(obj); } catch(e){} });
  window.__pendingInteractables = [];
}
const loader = new THREE.TextureLoader();

function addFrame(opts) {
  const {
    x, z, face = "front",
    img = "./assets/textures/colonCampeon.jpg",
    title = "Obra sin título",
    desc = "Descripción de ejemplo"
  } = opts;
  console.log('addFrame called', { x, z, face, img, title });
  try {
  // Creamos un marco 2D (sin modelos GLTF) compuesto por:
  // - un plano para la obra (imagen)
  // - cuatro barras (boxes) que forman el contorno del marco
  // Intentamos usar una textura de 'frame' si existe en './assets/images/frame.png'

  const frameGroup = new THREE.Group();
  frameGroup.position.set(x, 1.7, z);

  // Orientación según pared
  if (face === "back") frameGroup.rotation.y = Math.PI;
  if (face === "left") frameGroup.rotation.y = Math.PI / 2;
  if (face === "right") frameGroup.rotation.y = -Math.PI / 2;

  // Dimensiones del cuadro (más pequeñas según petición)
  const artWidth = 1.8; // ancho del cuadro (reducido)
  const artHeight = 1.2; // alto del cuadro (aprox 3:2)
  const artDepth = 0.02;
  const frameThickness = 0.08; // grosor del marco alrededor (reducido)

  // Cargar textura de la obra
  const artMat = new THREE.MeshBasicMaterial({ color: 0xdddddd, side: THREE.DoubleSide });
  const artPlane = new THREE.Mesh(new THREE.PlaneGeometry(artWidth, artHeight), artMat);
  // Colocar la obra ligeramente detrás del plano del marco para que parezca 'dentro' del marco
  artPlane.position.set(0, 0, -0.01);
  artPlane.userData = { title, desc };
  artPlane.receiveShadow = true;
  frameGroup.add(artPlane);
  
        // Cargar textura de la obra y aplicarla al material del artPlane cuando esté lista
        loader.load(
          img,
          function (texture) {
            try {
              if (texture && texture.isTexture) {
                texture.colorSpace = THREE.SRGBColorSpace;
                artPlane.material.map = texture;
                artPlane.material.color.setHex(0xffffff);
                artPlane.material.needsUpdate = true;
              }
            } catch (e) {
              console.warn('Error aplicando textura a artPlane:', img, e);
            }
          },
          undefined,
          function(err){
            console.warn('❗ No se pudo cargar la imagen de obra:', img, err, 'intentando fallback colonCampeon.jpg');
            // Intentar fallback a textura conocida en assets/textures
            loader.load('./assets/textures/colonCampeon.jpg', function(fallbackTex){
              try{
                if (fallbackTex && fallbackTex.isTexture) {
                  fallbackTex.colorSpace = THREE.SRGBColorSpace;
                  artPlane.material.map = fallbackTex;
                  artPlane.material.color.setHex(0xffffff);
                  artPlane.material.needsUpdate = true;
                }
              } catch(e2){
                console.warn('Error aplicando fallback:', e2);
                artPlane.material.color.setHex(0x888888);
                artPlane.material.needsUpdate = true;
              }
            }, undefined, function(finalErr){
              console.warn('Fallback texture failed:', finalErr);
              artPlane.material.color.setHex(0x888888);
              artPlane.material.needsUpdate = true;
            });
          }
        );
  // artPlane ya fue creado y agregado más arriba (evitamos duplicarlo)

  // Intentar cargar textura del contorno (archivo opcional que el usuario puede añadir)
  // Probamos frame textures si es necesario
  // Crear marco en código (4 barras) - sin dependencias externas
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xB8860B, metalness: 0.7, roughness: 0.25 });

  const halfW = artWidth / 2;
  const halfH = artHeight / 2;
  const barDepth = frameThickness; // profundidad de las barras del marco

  // Colocar las barras ligeramente delante del plano de la obra (z positivo) para que la obra quede 'dentro'
  const barZ = 0.01;

  // Top bar
  const topBarGeo = new THREE.BoxGeometry(artWidth + frameThickness * 2, frameThickness, barDepth);
  const topBar = new THREE.Mesh(topBarGeo, frameMat);
  topBar.position.set(0, halfH + frameThickness / 2, barZ);
  topBar.castShadow = true;
  topBar.receiveShadow = true;
  frameGroup.add(topBar);

  // Bottom bar
  const bottomBar = new THREE.Mesh(topBarGeo.clone(), frameMat);
  bottomBar.position.set(0, -halfH - frameThickness / 2, barZ);
  bottomBar.castShadow = true;
  bottomBar.receiveShadow = true;
  frameGroup.add(bottomBar);

  // Left bar
  const sideBarGeo = new THREE.BoxGeometry(frameThickness, artHeight, barDepth);
  const leftBar = new THREE.Mesh(sideBarGeo, frameMat);
  leftBar.position.set(-halfW - frameThickness / 2, 0, barZ);
  leftBar.castShadow = true;
  leftBar.receiveShadow = true;
  frameGroup.add(leftBar);

  // Right bar
  const rightBar = new THREE.Mesh(sideBarGeo.clone(), frameMat);
  rightBar.position.set(halfW + frameThickness / 2, 0, barZ);
  rightBar.castShadow = true;
  rightBar.receiveShadow = true;
  frameGroup.add(rightBar);

  // overlay frontal eliminado por petición del usuario (ya no se añade)

  // Pequeña luz puntual para destacar la obra (opcional)
  const obraLight = new THREE.PointLight(0xffffff, 1.2, 6);
  obraLight.position.set(0, 0.6, 1.5);
  frameGroup.add(obraLight);

  // Añadir metadata para interacción
  frameGroup.userData = { title, desc };
  scene.add(frameGroup);
  interactables.push(frameGroup);

  console.log(`🖼️ Marco 2D creado en posición (${x}, ${z}) - ${title}`);
  } catch (err) {
    console.error('addFrame error for', { x, z, img, title }, err);
  }
}

// ======== Función para crear placas doradas informativas ========
function createGoldenPlaque(title, description) {
  const plaqueGroup = new THREE.Group();
  
  // Material dorado para la placa
  const goldenMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFD700, // Oro brillante
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x332200, // Ligero brillo dorado
    emissiveIntensity: 0.15,
    side: THREE.DoubleSide // Visible desde ambos lados
  });
  
  // Base de la placa (más grande y visible)
  const plaqueGeometry = new THREE.BoxGeometry(0.5, 0.12, 0.02);
  const plaque = new THREE.Mesh(plaqueGeometry, goldenMaterial);
  plaque.castShadow = true;
  plaque.receiveShadow = true;
  
  // Crear texto en canvas para la placa
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 800;
  canvas.height = 160;
  
  // Fondo dorado brillante
  context.fillStyle = '#FFD700';
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Borde oscuro elegante
  context.strokeStyle = '#8B4513';
  context.lineWidth = 6;
  context.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);
  
  // Segundo borde interior
  context.strokeStyle = '#B8860B';
  context.lineWidth = 2;
  context.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
  
  // Texto negro elegante y muy visible
  context.fillStyle = '#1a1a1a'; // Negro oscuro para máximo contraste
  context.font = 'bold 36px "Times New Roman"'; // Fuente serif elegante y grande
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  
  const x = canvas.width / 2;
  const y = canvas.height / 2;
  
  // Sombra para profundidad
  context.save();
  context.shadowColor = 'rgba(0,0,0,0.5)';
  context.shadowOffsetX = 2;
  context.shadowOffsetY = 2;
  context.shadowBlur = 3;
  context.fillText(title, x, y);
  context.restore();
  
  // Borde dorado del texto para elegancia
  context.strokeStyle = '#B8860B';
  context.lineWidth = 2;
  context.strokeText(title, x, y);
  
  // Texto principal por encima
  context.fillStyle = '#000000';
  context.fillText(title, x, y);
  
  console.log(`✨ Texto generado en canvas: "${title}" (${canvas.width}x${canvas.height})`);
  
  // Crear textura del canvas con configuración optimizada
  const textTexture = new THREE.CanvasTexture(canvas);
  textTexture.minFilter = THREE.LinearFilter;
  textTexture.magFilter = THREE.LinearFilter;
  textTexture.generateMipmaps = false;
  textTexture.flipY = false;
  textTexture.needsUpdate = true;
  
  // Material para el texto con máxima visibilidad
  const textMaterial = new THREE.MeshBasicMaterial({
    map: textTexture,
    transparent: false,
    alphaTest: 0.1,
    side: THREE.DoubleSide,
    depthWrite: true,
    depthTest: true
  });
  
  // Plano para el texto (ajustado a la placa más grande)
  const textGeometry = new THREE.PlaneGeometry(0.48, 0.10);
  const textPlane = new THREE.Mesh(textGeometry, textMaterial);
  textPlane.position.z = -0.012; // Un poco más separado de la placa
  textPlane.castShadow = false;
  textPlane.receiveShadow = false;
  
  // Agregar todo al grupo
  plaqueGroup.add(plaque);
  plaqueGroup.add(textPlane);
  
  // Agregar userData para la interacción
  plaqueGroup.userData = { title: title, desc: description };
  
  console.log(`🏷️ Placa dorada creada: "${title}"`);
  return plaqueGroup;
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
  addFrame({ 
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
  addFrame({ 
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
  addFrame({ 
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
  addFrame({ 
    x: ROOM.w/2 - 0.18, 
    z: z, 
    face: "right", 
    img: obra.img, 
    title: obra.title, 
    desc: `${obra.author} · ${obra.year}\n\n${obra.desc}` 
  });
});

// ======== Vitrina de Vidrio 1========
const vitrinaGroup = new THREE.Group();

// Base elegante del pedestal (igual que vitrina 2)
const vitrina1Width = 0.7;
const vitrina1Depth = 0.7;
const vitrina1Height = 1.0;

// Base del pedestal
const vitrina1Base = new THREE.Mesh(
  new THREE.BoxGeometry(vitrina1Width + 0.1, 0.15, vitrina1Depth + 0.1),
  new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.3, roughness: 0.7 })
);
vitrina1Base.position.y = 0.075;
vitrina1Base.receiveShadow = true;
vitrina1Base.castShadow = true;
vitrinaGroup.add(vitrina1Base);

// Columna principal del pedestal
const vitrina1Column = new THREE.Mesh(
  new THREE.BoxGeometry(vitrina1Width, vitrina1Height, vitrina1Depth),
  new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.4, roughness: 0.6 })
);
vitrina1Column.position.y = vitrina1Height / 2 + 0.15;
vitrina1Column.receiveShadow = true;
vitrina1Column.castShadow = true;
vitrinaGroup.add(vitrina1Column);

// Superficie superior del pedestal
const vitrina1Top = new THREE.Mesh(
  new THREE.BoxGeometry(vitrina1Width + 0.05, 0.08, vitrina1Depth + 0.05),
  new THREE.MeshStandardMaterial({ color: 0x404040, metalness: 0.5, roughness: 0.4 })
);
vitrina1Top.position.y = vitrina1Height + 0.15 + 0.04;
vitrina1Top.receiveShadow = true;
vitrinaGroup.add(vitrina1Top);

// Material de vidrio
const vidriaMaterial = new THREE.MeshPhysicalMaterial({ 
  color: 0xffffff,
  transparent: true, 
  opacity: 0.1, 
  metalness: 0.0, 
  roughness: 0.0,
  transmission: 0.9,
  thickness: 0.1
});

// Marco de metal
const marcoMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x333333, 
  metalness: 0.8, 
  roughness: 0.2 
});

// Estructura de vidrio
const vitrinaHeight = 0.65;
const vitrinaWidth = 0.65;
const vitrinaDepth = 0.65;
const glassThickness = 0.02;
const vitrina1BaseY = vitrina1Height + 0.15 + 0.08; // Nueva altura base

// Vidrio frontal
const vitrinaFrontal = new THREE.Mesh(
  new THREE.BoxGeometry(vitrinaWidth, vitrinaHeight, glassThickness),
  vidriaMaterial
);
vitrinaFrontal.position.set(0, vitrina1BaseY + vitrinaHeight/2, vitrinaDepth/2);
vitrinaGroup.add(vitrinaFrontal);

// Vidrio trasero
const vitrinaTrasera = new THREE.Mesh(
  new THREE.BoxGeometry(vitrinaWidth, vitrinaHeight, glassThickness),
  vidriaMaterial
);
vitrinaTrasera.position.set(0, vitrina1BaseY + vitrinaHeight/2, -vitrinaDepth/2);
vitrinaGroup.add(vitrinaTrasera);

// Vidrios laterales
const vitrinaIzquierda = new THREE.Mesh(
  new THREE.BoxGeometry(glassThickness, vitrinaHeight, vitrinaDepth),
  vidriaMaterial
);
vitrinaIzquierda.position.set(-vitrinaWidth/2, vitrina1BaseY + vitrinaHeight/2, 0);
vitrinaGroup.add(vitrinaIzquierda);

const vitrinaDerecha = new THREE.Mesh(
  new THREE.BoxGeometry(glassThickness, vitrinaHeight, vitrinaDepth),
  vidriaMaterial
);
vitrinaDerecha.position.set(vitrinaWidth/2, vitrina1BaseY + vitrinaHeight/2, 0);
vitrinaGroup.add(vitrinaDerecha);


// Marcos de metal
const frameSize = 0.03;

// Marco superior
const marcoSuperior = new THREE.Mesh(
  new THREE.BoxGeometry(vitrinaWidth + frameSize*2, frameSize, vitrinaDepth + frameSize*2),
  marcoMaterial
);
marcoSuperior.position.set(0, vitrina1BaseY + vitrinaHeight + frameSize/2, 0);
vitrinaGroup.add(marcoSuperior);



// ======== Modelo 3D Jabulani Real con Textura ========
const objetoGroup = new THREE.Group();

// Pedestal interno
const pedestalInterno = new THREE.Mesh(
  new THREE.CylinderGeometry(0.20, 0.20, 0.15, 32),
  new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.4, roughness: 0.6 })
);
pedestalInterno.position.y = 0.075;
pedestalInterno.castShadow = true;
pedestalInterno.receiveShadow = true;
objetoGroup.add(pedestalInterno);

// Cargar la textura del Jabulani primero
const textureLoader = new THREE.TextureLoader();
let jabulaniTexture = null;

// Cargar textura
console.log('Intentando cargar textura desde: ./assets/models/jabulani/textures/JABULANI_baseColor.png');
textureLoader.load(
  './assets/models/jabulani/textures/JABULANI_baseColor.png',
  function(texture) {
    jabulaniTexture = texture;
    texture.flipY = false; // Importante para GLTF
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    console.log('✅ Textura Jabulani cargada exitosamente', texture);
    
    // Intentar cargar el modelo GLTF después de tener la textura
    cargarModeloJabulani();
  },
  function(progress) {
    console.log('📥 Cargando textura Jabulani:', Math.round(progress.loaded / progress.total * 100) + '%');
  },
  function(error) {
    console.error('❌ Error cargando textura Jabulani:', error);
    // Continuar sin textura
    cargarModeloJabulani();
  }
);

let jabulaniModel = null;

function cargarModeloJabulani() {
  // Usar directamente el fallback que funciona mejor
  console.log('🏈 Creando Jabulani con textura...');
  const jabulaniGeometry = new THREE.SphereGeometry(0.15, 64, 32);
  
  let jabulaniMaterial;
  if (jabulaniTexture) {
    console.log('🎨 Aplicando textura del Jabulani');
    jabulaniMaterial = new THREE.MeshStandardMaterial({ 
      map: jabulaniTexture,
      color: 0xffffff,
      metalness: 0.1, 
      roughness: 0.7,
      transparent: false
    });
  } else {
    console.log('⚪ Jabulani sin textura (blanco)');
    jabulaniMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      metalness: 0.1, 
      roughness: 0.7
    });
  }
  
  const modeloJabulani = new THREE.Mesh(jabulaniGeometry, jabulaniMaterial);
  modeloJabulani.position.y = 0.3;
  // Ajustar la rotación para que el texto quede derecho
  modeloJabulani.rotation.y = 0; // Sin rotación Y
  modeloJabulani.rotation.z = -Math.PI / 2; // Rotar 90° en Z
  modeloJabulani.castShadow = true;
  modeloJabulani.receiveShadow = true;
  objetoGroup.add(modeloJabulani);
  jabulaniModel = modeloJabulani;
  console.log('✅ Jabulani creado exitosamente');
}

// Posicionar el objeto dentro de la vitrina
objetoGroup.position.set(0, vitrina1BaseY, 0);
vitrinaGroup.add(objetoGroup);

// Luz desde arriba para el objeto
const luzObjeto = new THREE.SpotLight(0xffffff, 2.5, 6, Math.PI / 8, 0.3, 1);
luzObjeto.position.set(0, vitrina1BaseY + vitrinaHeight + 1, 0);
luzObjeto.target.position.set(0, vitrina1BaseY + 0.2, 0);
luzObjeto.castShadow = true;
vitrinaGroup.add(luzObjeto);
vitrinaGroup.add(luzObjeto.target);

// ======== Placa informativa de la Vitrina 1 ========
const placa1 = createGoldenPlaque(
  "JABULANI 2010",
  "Balón oficial utilizado en la Copa Mundial de la FIFA Sudáfrica 2010. El Jabulani, diseñado por Adidas, fue el primer balón esférico completamente redondo gracias a su innovadora tecnología de 8 paneles termoformados. Su nombre significa 'celebrar' en idioma zulú, representando el espíritu festivo del continente africano. Este ejemplar forma parte de la colección de objetos históricos del fútbol mundial."
);
placa1.position.set(0.37, 0.9, 0); // Pegada al lado del pedestal
placa1.rotation.x = 0; // Plana contra la pared
placa1.rotation.y = -Math.PI / 2; // Girada 90° a la derecha
placa1.rotation.z = Math.PI; // Girada 180° sobre su propio eje
vitrinaGroup.add(placa1);

// Agregar placa a interactables
interactables.push(placa1);

// Posicionar la vitrina en el museo
vitrinaGroup.position.set(-7.5, 0, 6);
vitrinaGroup.rotation.y = Math.PI;
vitrinaGroup.castShadow = true;
vitrinaGroup.receiveShadow = true;
scene.add(vitrinaGroup);
console.log('✅ Primera vitrina agregada a la escena');


// ====== Vitrina de Vidrio 2 (Vitrina Copa del Mundo) ======
const vitrina2Group = new THREE.Group();

// mismas dimensiones que vitrina 1
const vitrina2Width = vitrina1Width;
const vitrina2Depth = vitrina1Depth;
const vitrina2Height = vitrina1Height;

// Base del pedestal
const vitrina2Base = new THREE.Mesh(
  new THREE.BoxGeometry(vitrina2Width + 0.1, 0.15, vitrina2Depth + 0.1),
  new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.3, roughness: 0.7 })
);
vitrina2Base.position.y = 0.075;
vitrina2Base.receiveShadow = true;
vitrina2Base.castShadow = true;
vitrina2Group.add(vitrina2Base);

// Columna principal del pedestal
const vitrina2Column = new THREE.Mesh(
  new THREE.BoxGeometry(vitrina2Width, vitrina2Height, vitrina2Depth),
  new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.4, roughness: 0.6 })
);
vitrina2Column.position.y = vitrina2Height / 2 + 0.15;
vitrina2Column.receiveShadow = true;
vitrina2Column.castShadow = true;
vitrina2Group.add(vitrina2Column);

// Superficie superior del pedestal
const vitrina2Top = new THREE.Mesh(
  new THREE.BoxGeometry(vitrina2Width + 0.05, 0.08, vitrina2Depth + 0.05),
  new THREE.MeshStandardMaterial({ color: 0x404040, metalness: 0.5, roughness: 0.4 })
);
vitrina2Top.position.y = vitrina2Height + 0.15 + 0.04;
vitrina2Top.receiveShadow = true;
vitrina2Group.add(vitrina2Top);

// Caja de vidrio superior
const vitrina2BaseY = vitrina2Height + 0.15 + 0.08;

// Vidrios de la caja superior (usando dimensiones propias)
const vitrina2Frontal = new THREE.Mesh(
  new THREE.BoxGeometry(0.65, 0.65, 0.02),
  vidriaMaterial
);
vitrina2Frontal.position.set(0, vitrina2BaseY + 0.65/2, 0.65/2);
vitrina2Group.add(vitrina2Frontal);

const vitrina2Trasera = new THREE.Mesh(
  new THREE.BoxGeometry(0.65, 0.65, 0.02),
  vidriaMaterial
);
vitrina2Trasera.position.set(0, vitrina2BaseY + 0.65/2, -0.65/2);
vitrina2Group.add(vitrina2Trasera);

const vitrina2Izquierda = new THREE.Mesh(
  new THREE.BoxGeometry(0.02, 0.65, 0.65),
  vidriaMaterial
);
vitrina2Izquierda.position.set(-0.65/2, vitrina2BaseY + 0.65/2, 0);
vitrina2Group.add(vitrina2Izquierda);

const vitrina2Derecha = new THREE.Mesh(
  new THREE.BoxGeometry(0.02, 0.65, 0.65),
  vidriaMaterial
);
vitrina2Derecha.position.set(0.65/2, vitrina2BaseY + 0.65/2, 0);
vitrina2Group.add(vitrina2Derecha);

// Techo de vidrio
const vitrina2Techo = new THREE.Mesh(
  new THREE.BoxGeometry(0.65, 0.02, 0.65),
  vidriaMaterial
);
vitrina2Techo.position.set(0, vitrina2BaseY + 0.65, 0);
vitrina2Group.add(vitrina2Techo);

// Marco superior
const marcoSuperior2 = new THREE.Mesh(
  new THREE.BoxGeometry(0.65 + 0.03*2, 0.03, 0.65 + 0.03*2),
  marcoMaterial
);
marcoSuperior2.position.set(0, vitrina2BaseY + 0.65 + 0.03/2, 0);
vitrina2Group.add(marcoSuperior2);

// ======== Placa informativa de la Vitrina 2 ========
const placa2 = createGoldenPlaque(
  "COPA MUNDIAL FIFA",
  "Réplica oficial del trofeo más codiciado del fútbol mundial. La Copa del Mundo FIFA, también conocida como el Trofeo Jules Rimet hasta 1970, representa la máxima distinción en el fútbol internacional. Diseñado por el artista italiano Silvio Gazzaniga en 1974, está hecho de oro macizo de 18 quilates y pesa 6.142 kg. En su base circular se graban los nombres de los países campeones, siendo Brasil el único pentacampeón mundial."
);
placa2.position.set(0.37, 0.9, 0); // Pegada al lado del pedestal
placa2.rotation.x = 0; // Plana contra la pared
placa2.rotation.y = -Math.PI / 2; // Girada 90° a la derecha
placa2.rotation.z = Math.PI; // Girada 180° sobre su propio eje
vitrina2Group.add(placa2);

// Agregar placa a interactables
interactables.push(placa2);

// Posicionar la segunda vitrina en el museo
vitrina2Group.position.set(-7.5, 0, 3);
// Rotar la vitrina 180° en Y para que mire hacia el centro
vitrina2Group.rotation.y = Math.PI;
vitrina2Group.castShadow = true;
vitrina2Group.receiveShadow = true;
scene.add(vitrina2Group);
console.log('✅ Segunda vitrina agregada a la escena');

// ======== Trofeo de la Copa del Mundo (GLTF) ========
const trofeo2Group = new THREE.Group();

// Pedestal interno para el trofeo (igual que el Jabulani)
const pedestalTrofeo = new THREE.Mesh(
  new THREE.CylinderGeometry(0.2, 0.2, 0.15, 32),
  new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.4, roughness: 0.6 })
);
pedestalTrofeo.position.y = 0.075;
pedestalTrofeo.castShadow = true;
pedestalTrofeo.receiveShadow = true;
trofeo2Group.add(pedestalTrofeo);

// Cargar el modelo GLTF del trofeo
const gltfLoader2 = new GLTFLoader();
let trofeoModel = null;

console.log('🏆 Iniciando carga del trofeo GLTF...');
gltfLoader2.load(
  './assets/models/world_cup_trophy/scene.gltf',
  function (gltf) {
  trofeoModel = gltf.scene;
  // Pre-cargar los mapas base que usamos para materiales simplificados
  const globeBaseTexture = new THREE.TextureLoader().load(
    './assets/models/world_cup_trophy/textures/globe_baseColor.png',
    function(tex){ try { tex.colorSpace = THREE.SRGBColorSpace; } catch(e){} },
    undefined,
    function(err){ console.warn('No se pudo precargar globe_baseColor.png:', err); }
  );
  const globeNormalTexture = new THREE.TextureLoader().load(
    './assets/models/world_cup_trophy/textures/globe_normal.png',
    function(tex){ try { tex.colorSpace = THREE.LinearSRGBColorSpace; } catch(e){} },
    undefined,
    function(err){ /* no normal available, that's ok */ }
  );
  const bodyBaseTexture = new THREE.TextureLoader().load(
    './assets/models/world_cup_trophy/textures/body_baseColor.png',
    function(tex){ try { tex.colorSpace = THREE.SRGBColorSpace; } catch(e){} },
    undefined,
    function(err){ console.warn('No se pudo precargar body_baseColor.png:', err); }
  );
  const bodyNormalTexture = new THREE.TextureLoader().load(
    './assets/models/world_cup_trophy/textures/body_normal.png',
    function(tex){ try { tex.colorSpace = THREE.LinearSRGBColorSpace; } catch(e){} },
    undefined,
    function(err){ /* no normal available, that's ok */ }
  );
  // Aumentamos la escala para asegurar visibilidad (ajustable)
  // La escala previa era demasiado pequeña (0.0009) y podía hacer que el modelo no se vea.
  trofeoModel.scale.set(0.0009, 0.0009, 0.0009);
  // Ajuste de posición para que quede bien sobre el pedestal (elevado)
  trofeoModel.position.set(0, 0.150, 0);
  // Mantener los materiales originales para conservar los mapas PBR (base, normal, metallicRoughness).
  // Solo activamos sombras y ajustamos el colorSpace de los mapas apropiadamente.
  trofeoModel.traverse(function (node) {
    if (!node.isMesh) return;
    node.castShadow = true;
    node.receiveShadow = true;
    node.visible = true;

    // Helper: set colorSpace only if texture image is loaded
    function safeSetColorSpace(tex, space){
      if (!tex) return;
      if (tex.image) {
        try { tex.colorSpace = space; } catch(e){}
      } else {
        console.warn('Texture presente sin image todavía:', tex, 'material:', (node.material && node.material.name) || '(unnamed)');
      }
    }

    try {
      const nodeName = (node.name || '').toLowerCase();
      const mat = node.material;

      // Quick heuristic: count how many texture slots are present. If more than 2,
      // we'll replace the material with a single-map material to avoid exceeding
      // MAX_TEXTURE_IMAGE_UNITS in the fragment shader.
      function countTextureSlots(m) {
        if (!m) return 0;
        let c = 0;
        ['map','aoMap','emissiveMap','metalnessMap','roughnessMap','metalnessRoughnessMap','normalMap','displacementMap','envMap'].forEach(k => {
          if (m[k]) c++;
        });
        return c;
      }

      // If material is an array, sum counts
      let totalMaps = 0;
      if (Array.isArray(mat)) {
        mat.forEach(m => totalMaps += countTextureSlots(m));
      } else {
        totalMaps = countTextureSlots(mat);
      }

      // If material is clearly heavy or has >2 maps, replace it.
      const matName = (mat && mat.name) ? mat.name.toLowerCase() : '';
      if (totalMaps > 2 || nodeName.includes('globe') || matName.includes('globe') || nodeName.includes('body') || matName.includes('body')) {
        // Choose best available base map
        let baseTex = null;
        // Prefer the material's own map if it already has one loaded
        if (mat && mat.map && mat.map.image) baseTex = mat.map;
        // Check common alternate keys that some exporters use
        if (!baseTex && mat) {
          const candidates = ['baseMap','baseColorMap','albedoMap','diffuseMap','baseColorTexture'];
          for (let k of candidates) {
            if (mat[k] && mat[k].image) { baseTex = mat[k]; break; }
          }
        }
        // Inspect texture names if still missing
        if (!baseTex && mat) {
          const inspect = (t) => (t && t.image && t.image.src) ? t.image.src.toLowerCase() : '';
          const tryExtract = (m) => {
            for (let k in m) {
              if (!m[k] || !m[k].image) continue;
              const src = inspect(m[k]);
              if (src.includes('base') || src.includes('albedo') || src.includes('diffuse')) return m[k];
              if (src.includes('body') || src.includes('globe')) return m[k];
            }
            return null;
          };
          baseTex = tryExtract(mat) || null;
        }
        // Fallback to preloaded textures
        if (!baseTex) baseTex = bodyBaseTexture || globeBaseTexture || null;

        // pick a normal map if available and matching the base texture choice
        let normalForReplacement = null;
        if (baseTex === bodyBaseTexture) normalForReplacement = bodyNormalTexture;
        else if (baseTex === globeBaseTexture) normalForReplacement = globeNormalTexture;
        // if material had its own normalMap, prefer that
        if (mat && mat.normalMap && mat.normalMap.image) normalForReplacement = mat.normalMap;

        const replacement = new THREE.MeshStandardMaterial({ map: baseTex || null, normalMap: normalForReplacement || null, metalness: 0.9, roughness: 0.25 });
        // ensure encodings are correct when the images are ready
        if (replacement.map && replacement.map.image) try { replacement.map.colorSpace = THREE.SRGBColorSpace; } catch(e){}
        if (replacement.normalMap && replacement.normalMap.image) try { replacement.normalMap.colorSpace = THREE.LinearSRGBColorSpace; } catch(e){}
        node.material = replacement;
        node.material.needsUpdate = true;
        return;
      }

      // Otherwise be defensive and set colorSpace only where safe.
      if (Array.isArray(mat)) {
        mat.forEach(m => {
          if (!m) return;
          safeSetColorSpace(m.map, THREE.SRGBColorSpace);
          safeSetColorSpace(m.normalMap, THREE.LinearSRGBColorSpace);
          safeSetColorSpace(m.metalnessMap, THREE.LinearSRGBColorSpace);
          safeSetColorSpace(m.roughnessMap, THREE.LinearSRGBColorSpace);
          safeSetColorSpace(m.metalnessRoughnessMap, THREE.LinearSRGBColorSpace);
        });
      } else if (mat) {
        safeSetColorSpace(mat.map, THREE.SRGBColorSpace);
        safeSetColorSpace(mat.normalMap, THREE.LinearSRGBColorSpace);
        safeSetColorSpace(mat.metalnessMap, THREE.LinearSRGBColorSpace);
        safeSetColorSpace(mat.roughnessMap, THREE.LinearSRGBColorSpace);
        safeSetColorSpace(mat.metalnessRoughnessMap, THREE.LinearSRGBColorSpace);
      }
    } catch(e) {
      console.warn('Error procesando malla del trofeo:', e);
    }
  });
  trofeo2Group.add(trofeoModel);
  console.log('🏆 Trofeo cargado y posicionado');
  },
  undefined,
  function (error) {
    console.error('❌ Error cargando el trofeo:', error);
  }
);



// Posicionar el grupo del trofeo dentro de la vitrina
trofeo2Group.position.set(0, vitrina2BaseY, 0);
vitrina2Group.add(trofeo2Group);

// Luz desde arriba para el trofeo (más intensa y dorada)
const luzTrofeo = new THREE.SpotLight(0xffffff, 6.0, 8, Math.PI / 3, 0.1, 1);
luzTrofeo.position.set(0, vitrina2BaseY + 0.65 + 1.5, 0);
// Aumentar intensidad/alcance para asegurar iluminación sobre el trofeo
luzTrofeo.intensity = 8.0;
luzTrofeo.distance = 10;
luzTrofeo.position.set(0, vitrina2BaseY + 0.65 + 1.5, 0);
luzTrofeo.target.position.set(0, vitrina2BaseY + 0.2, 0);
luzTrofeo.castShadow = true;
vitrina2Group.add(luzTrofeo);
vitrina2Group.add(luzTrofeo.target);

// Luz adicional lateral para resaltar el brillo del oro
let luzLateral = new THREE.PointLight(0xffffff, 2.5, 3);
luzLateral.position.set(0.3, vitrina2BaseY + 0.4, 0.3);
vitrina2Group.add(luzLateral);

// Segunda luz lateral desde el otro lado
let luzLateral2 = new THREE.PointLight(0xffffff, 2.0, 3);
luzLateral2.position.set(-0.3, vitrina2BaseY + 0.4, -0.3);
vitrina2Group.add(luzLateral2);

// Luz ambiental adicional solo para la vitrina del trofeo
const luzAmbientalTrofeo = new THREE.AmbientLight(0xffffff, 0.4);
vitrina2Group.add(luzAmbientalTrofeo);

// ====== Copa Libertadores ======
const vitrina3Group = new THREE.Group();

// Base elegante del pedestal (mismo estilo que las otras vitrinas)
const vitrina3Width = 0.7;
const vitrina3Depth = 0.7;
const vitrina3Height = 1.0;

// Base del pedestal
const vitrina3Base = new THREE.Mesh(
  new THREE.BoxGeometry(vitrina3Width + 0.1, 0.15, vitrina3Depth + 0.1),
  new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.3, roughness: 0.7 })
);
vitrina3Base.position.y = 0.075;
vitrina3Base.receiveShadow = true;
vitrina3Base.castShadow = true;
vitrina3Group.add(vitrina3Base);

// Columna principal del pedestal
const vitrina3Column = new THREE.Mesh(
  new THREE.BoxGeometry(vitrina3Width, vitrina3Height, vitrina3Depth),
  new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.4, roughness: 0.6 })
);
vitrina3Column.position.y = vitrina3Height / 2 + 0.15;
vitrina3Column.receiveShadow = true;
vitrina3Column.castShadow = true;
vitrina3Group.add(vitrina3Column);

// Superficie superior del pedestal
const vitrina3Top = new THREE.Mesh(
  new THREE.BoxGeometry(vitrina3Width + 0.05, 0.08, vitrina3Depth + 0.05),
  new THREE.MeshStandardMaterial({ color: 0x404040, metalness: 0.5, roughness: 0.4 })
);
vitrina3Top.position.y = vitrina3Height + 0.15 + 0.04;
vitrina3Top.receiveShadow = true;
vitrina3Group.add(vitrina3Top);

// Estructura de vidrio para la tercera vitrina
const vitrina3BaseY = vitrina3Height + 0.15 + 0.08;
const vitrina3GlassHeight = 0.95; // Altura aumentada para mejor visualización de la Copa Libertadores

// Vidrio frontal
const vitrina3Frontal = new THREE.Mesh(
  new THREE.BoxGeometry(0.65, vitrina3GlassHeight, 0.02),
  vidriaMaterial
);
vitrina3Frontal.position.set(0, vitrina3BaseY + vitrina3GlassHeight/2, 0.65/2);
vitrina3Group.add(vitrina3Frontal);

// Vidrio trasero
const vitrina3Trasera = new THREE.Mesh(
  new THREE.BoxGeometry(0.65, vitrina3GlassHeight, 0.02),
  vidriaMaterial
);
vitrina3Trasera.position.set(0, vitrina3BaseY + vitrina3GlassHeight/2, -0.65/2);
vitrina3Group.add(vitrina3Trasera);

// Vidrios laterales
const vitrina3Izquierda = new THREE.Mesh(
  new THREE.BoxGeometry(0.02, vitrina3GlassHeight, 0.65),
  vidriaMaterial
);
vitrina3Izquierda.position.set(-0.65/2, vitrina3BaseY + vitrina3GlassHeight/2, 0);
vitrina3Group.add(vitrina3Izquierda);

const vitrina3Derecha = new THREE.Mesh(
  new THREE.BoxGeometry(0.02, vitrina3GlassHeight, 0.65),
  vidriaMaterial
);
vitrina3Derecha.position.set(0.65/2, vitrina3BaseY + vitrina3GlassHeight/2, 0);
vitrina3Group.add(vitrina3Derecha);

// Techo de vidrio
const vitrina3Techo = new THREE.Mesh(
  new THREE.BoxGeometry(0.65, 0.02, 0.65),
  vidriaMaterial
);
vitrina3Techo.position.set(0, vitrina3BaseY + vitrina3GlassHeight, 0);
vitrina3Group.add(vitrina3Techo);

// Marco superior
const marcoSuperior3 = new THREE.Mesh(
  new THREE.BoxGeometry(0.65 + 0.03*2, 0.03, 0.65 + 0.03*2),
  marcoMaterial
);
marcoSuperior3.position.set(0, vitrina3BaseY + vitrina3GlassHeight + 0.03/2, 0);
vitrina3Group.add(marcoSuperior3);

// ======== Placa informativa de la Vitrina 3 ========
const placa3 = createGoldenPlaque(
  "COPA CONMEBOL LIBERTADORES",
  "Trofeo de la Copa CONMEBOL Libertadores, el torneo de clubes más prestigioso de Sudamérica. Esta competencia, que comenzó en 1960 como Copa de Campeones de América, reúne a los mejores equipos del continente. El trofeo actual, diseñado por la casa de orfebrería argentina Casa Escasany, está hecho de plata con baños de oro y pesa aproximadamente 9 kg. La Copa Libertadores representa la gloria máxima del fútbol de clubes sudamericano y clasifica al campeón para la Copa Mundial de Clubes FIFA."
);
placa3.position.set(0.37, 0.9, 0); // Pegada al lado del pedestal
placa3.rotation.x = 0; // Plana contra la pared
placa3.rotation.y = -Math.PI / 2; // Girada 90° a la derecha
placa3.rotation.z = Math.PI; // Girada 180° sobre su propio eje
vitrina3Group.add(placa3);

// Agregar placa a interactables
interactables.push(placa3);
vitrina3Group.position.set(-7.5, 0, 0);
vitrina3Group.rotation.y = Math.PI;
vitrina3Group.castShadow = true;
vitrina3Group.receiveShadow = true;
scene.add(vitrina3Group);

// ======== Copa Libertadores 2021 (GLTF) ========
const copaLibertadores3Group = new THREE.Group();

// Pedestal interno para la copa libertadores (igual que el trofeo mundial)
const pedestalCopaLibertadores = new THREE.Mesh(
  new THREE.CylinderGeometry(0.2, 0.2, 0.15, 32),
  new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.4, roughness: 0.6 })
);
pedestalCopaLibertadores.position.y = 0.075;
pedestalCopaLibertadores.castShadow = true;
pedestalCopaLibertadores.receiveShadow = true;
copaLibertadores3Group.add(pedestalCopaLibertadores);

// Cargar el modelo GLTF de la Copa Libertadores 2021
const gltfLoader3 = new GLTFLoader();
let copaLibertadoresModel = null;

console.log('🏆 Iniciando carga de la Copa Libertadores 2021 GLTF...');
gltfLoader3.load(
  './assets/models/copa_libertadores_2021/scene.gltf',
  function (gltf) {
  copaLibertadoresModel = gltf.scene;
  copaLibertadoresModel.scale.set(0.09, 0.09, 0.09); // Similar escala que el trofeo mundial
  copaLibertadoresModel.position.set(0, 0.1605, 0); // Subir la copa para que quede sobre el pedestal
  // Simplificar materiales
  copaLibertadoresModel.traverse(function(node){
    if (node.isMesh) {
      node.castShadow = true; node.receiveShadow = true;
      try {
        const oldMat = node.material;
        let baseMap = null;
        let normalMap = null;
        let metalness = 0.9;
        let roughness = 0.2;
        if (oldMat) {
          if (Array.isArray(oldMat)) {
            const found = oldMat.find(m => m && (m.map || m.normalMap));
            baseMap = found ? (found.map || null) : (oldMat[0] && oldMat[0].map ? oldMat[0].map : null);
            normalMap = found ? (found.normalMap || null) : (oldMat[0] && oldMat[0].normalMap ? oldMat[0].normalMap : null);
          } else {
            baseMap = oldMat.map || null;
            normalMap = oldMat.normalMap || null;
            if (oldMat.metalness !== undefined) metalness = oldMat.metalness;
            if (oldMat.roughness !== undefined) roughness = oldMat.roughness;
          }
        }
        if (baseMap || normalMap) {
          try { if (baseMap) baseMap.colorSpace = THREE.SRGBColorSpace; } catch(e){}
          node.material = new THREE.MeshStandardMaterial({ map: baseMap || null, normalMap: normalMap || null, metalness: metalness, roughness: roughness });
        } else {
          node.material = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, metalness: metalness, roughness: roughness });
        }
        node.material.needsUpdate = true;
      } catch(e) { console.warn('Error simplificando material copaLibertadores:', e); }
    }
  });
  copaLibertadores3Group.add(copaLibertadoresModel);
  console.log('🏆 Copa Libertadores 2021 cargada y posicionada');
  },
  undefined,
  function (error) {
    console.error('❌ Error cargando la Copa Libertadores 2021:', error);
  }
);

// Posicionar el grupo de la copa libertadores dentro de la vitrina
copaLibertadores3Group.position.set(0, vitrina3BaseY, 0);
vitrina3Group.add(copaLibertadores3Group);

// Luz desde arriba para la Copa Libertadores (intensa y dorada) - Ajustada para vitrina más alta
const luzCopaLibertadores = new THREE.SpotLight(0xffffff, 6.0, 10, Math.PI / 3, 0.1, 1);
luzCopaLibertadores.position.set(0, vitrina3BaseY + vitrina3GlassHeight + 1.5, 0);
luzCopaLibertadores.target.position.set(0, vitrina3BaseY + 0.2, 0);
luzCopaLibertadores.castShadow = true;
vitrina3Group.add(luzCopaLibertadores);
vitrina3Group.add(luzCopaLibertadores.target);

// Luz adicional lateral para resaltar el brillo de la Copa Libertadores - Ajustada para vitrina más alta
let luzLateralCopa = new THREE.PointLight(0xffffff, 2.5, 4);
luzLateralCopa.position.set(0.3, vitrina3BaseY + vitrina3GlassHeight * 0.6, 0.3);
vitrina3Group.add(luzLateralCopa);

// Segunda luz lateral desde el otro lado - Ajustada para vitrina más alta
let luzLateralCopa2 = new THREE.PointLight(0xffffff, 2.0, 4);
luzLateralCopa2.position.set(-0.3, vitrina3BaseY + vitrina3GlassHeight * 0.6, -0.3);
vitrina3Group.add(luzLateralCopa2);

// Luz ambiental adicional solo para la vitrina de la Copa Libertadores
const luzAmbientalCopaLibertadores = new THREE.AmbientLight(0xffffff, 0.4);
vitrina3Group.add(luzAmbientalCopaLibertadores);

// ======== Vitrina cilíndrica alta (suelo a techo) en el centro del salón ========
const vitrinaTallGroup = new THREE.Group();

// Calculamos la altura total desde el suelo hasta el techo
const tallGlassHeight = ROOM.h - 0.02; // dejar un pequeño margen
// Incrementar el radio exterior del cilindro para hacer la vitrina más ancha
const tallRadius = 2.5; // radio exterior del cilindro (diámetro ~3.0)

// Base sólida (pequeño pedestal ancho)
const tallBase = new THREE.Mesh(
  new THREE.CylinderGeometry(tallRadius + 0.05, tallRadius + 0.05, 0.18, 64),
  new THREE.MeshStandardMaterial({ color: 0x141414, metalness: 0.4, roughness: 0.6 })
);
tallBase.position.y = 0.09;
tallBase.castShadow = false; // evitar sombra dura en el piso
tallBase.receiveShadow = true;
vitrinaTallGroup.add(tallBase);

// Vidrio cilíndrico que llega hasta el techo
const tallGlassMat = vidriaMaterial.clone();
tallGlassMat.opacity = 0.18;
tallGlassMat.transparent = true;

const tallGlass = new THREE.Mesh(
  new THREE.CylinderGeometry(tallRadius, tallRadius, tallGlassHeight, 64, 1, true),
  tallGlassMat
);
// Centrar el vidrio en el eje Y (la mitad del tallGlassHeight sobre el suelo)
tallGlass.position.y = tallGlassHeight / 2;
tallGlass.castShadow = false;
tallGlass.receiveShadow = true;
vitrinaTallGroup.add(tallGlass);

// Anillo superior para rematar en el techo
const tallTopRing = new THREE.Mesh(
  new THREE.TorusGeometry(tallRadius + 0.02, 0.04, 16, 100),
  marcoMaterial
);
tallTopRing.rotation.x = Math.PI / 2;
tallTopRing.position.y = tallGlassHeight;
tallTopRing.castShadow = false; // no proyectar sombra dura desde el marco superior
vitrinaTallGroup.add(tallTopRing);

const tallCeilingLight = new THREE.SpotLight(0xffffff, 3.5, ROOM.h, Math.PI / 6, 0.08, 1);
tallCeilingLight.position.set(0, tallGlassHeight + 0.3, 0);
tallCeilingLight.target.position.set(0, 0.6, 0);
// Desactivar sombras para evitar una proyección oscura muy marcada en el suelo
tallCeilingLight.castShadow = false;
vitrinaTallGroup.add(tallCeilingLight);
vitrinaTallGroup.add(tallCeilingLight.target);

// Pequeña plataforma interior para exponer un objeto (vacía por ahora)
const innerPlatform = new THREE.Mesh(
  new THREE.CylinderGeometry(tallRadius * 0.4, tallRadius * 0.4, 0.12, 32),
  new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.4, roughness: 0.5 })
);
innerPlatform.position.y = 0.12;
innerPlatform.castShadow = true;
innerPlatform.receiveShadow = true;
vitrinaTallGroup.add(innerPlatform);

// ======== Escudo AFA en la vitrina central (replicando comportamiento de Jabulani/trofeos)
// Nota: Este bloque carga el GLTF del escudo AFA y lo posiciona sobre
// la plataforma interior de la vitrina cilíndrica central. Si el modelo
// se ve desalineado o con escala incorrecta, ajustar `scale` y `rotation`
// dentro del callback del loader. Para probar localmente, abre `index.html`
// o `test.html` en un servidor local (no file://) y verifica la vitrina
// central; el escudo debería estar rotando si se desea (rotación añadida
// abajo en el bucle animate si se requiere).
const escudoGroup = new THREE.Group();
const escudoPedestal = new THREE.Mesh(
  new THREE.CylinderGeometry(0.45, 0.45, 0.12, 32),
  new THREE.MeshStandardMaterial({ color: 0x141414, metalness: 0.4, roughness: 0.6 })
);
escudoPedestal.position.y = 0.06;
escudoPedestal.castShadow = true;
escudoPedestal.receiveShadow = true;
escudoGroup.add(escudoPedestal);

// GLTF loader para el escudo AFA
const gltfLoaderEscudo = new GLTFLoader();
let escudoModel = null;
console.log('🛡️ Iniciando carga del escudo AFA en la vitrina central...');
// Placeholder: si el GLTF no se ve por unidades/escala, mostrar una placa con la textura del escudo
const escudoTextureLoader = new THREE.TextureLoader();
let escudoPlaceholder = null;
escudoTextureLoader.load(
  './assets/models/escudo_afa_-_argentina__afa_shield_-_argentina/textures/escudo-afa_baseColor.png',
  function(tex){
    try{
      tex.flipY = false;
      tex.colorSpace = THREE.SRGBColorSpace;
    }catch(e){}
    const mat = new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide });
    // Un plano vertical como fallback (ancho x alto aproximado)
    escudoPlaceholder = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.1), mat);
    // Posicionar el placeholder sobre el pedestal, centrado
    escudoPlaceholder.position.set(0, 0.18, 0);
    escudoPlaceholder.rotation.y = Math.PI; // hacer frente hacia el visitante
    escudoPlaceholder.castShadow = true;
    escudoPlaceholder.receiveShadow = true;
    escudoGroup.add(escudoPlaceholder);
  }, undefined, function(err){
    console.warn('No se pudo cargar la textura del placeholder del escudo:', err);
  }
);
gltfLoaderEscudo.load(
  './assets/models/escudo_afa_-_argentina__afa_shield_-_argentina/scene.gltf',
  function(gltf) {
    escudoModel = gltf.scene;
    // Ajustes iniciales: el modelo del escudo suele ser grande; escalar y posicionar sobre el pedestal
    // Probar una escala más conservadora y orientación erguida
    escudoModel.scale.set(3, 3, 3);
    // Poner el escudo un poco elevado para que se apoye sobre el pedestal
    escudoModel.position.set(0, 2, 0);
    // Orientación erguida por defecto (si el modelo viene tumbado, ajustar manualmente)
    escudoModel.rotation.set(0, Math.PI, 0);
    // Activar sombras y simplificar materiales en las mallas para evitar exceso de texturas
    escudoModel.traverse(function(node){
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        try {
          const oldMat = node.material;
          let baseMap = null;
          if (oldMat) {
            if (Array.isArray(oldMat)) {
              const found = oldMat.find(m => m && m.map);
              baseMap = found ? found.map : (oldMat[0] && oldMat[0].map ? oldMat[0].map : null);
            } else {
              baseMap = oldMat.map || null;
            }
          }
          if (baseMap) {
            try { baseMap.colorSpace = THREE.SRGBColorSpace; } catch(e){}
            node.material = new THREE.MeshStandardMaterial({ map: baseMap, metalness: 0.2, roughness: 0.8 });
          } else {
            node.material = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, metalness: 0.2, roughness: 0.8 });
          }
          node.material.needsUpdate = true;
        } catch(e) {
          console.warn('Error simplificando material del escudo:', e);
        }
      }
    });
    escudoGroup.add(escudoModel);
    // Si el placeholder existe, ocultarlo porque ahora tenemos el modelo real
    try{ if (escudoPlaceholder) escudoPlaceholder.visible = false; } catch(e){}
    console.log('✅ Escudo AFA cargado y posicionado en vitrina central');
  },
  undefined,
  function(err){
    console.error('❌ Error cargando escudo AFA:', err);
  }
);

// Luz focal para el escudo dentro de la vitrina alta
const luzEscudo = new THREE.SpotLight(0xffffff, 3.0, 10, Math.PI/6, 0.12, 1);
luzEscudo.position.set(0, tallGlassHeight - 0.5, 0);
luzEscudo.target.position.set(0, 0.2, 0);
luzEscudo.castShadow = true;
vitrinaTallGroup.add(luzEscudo);
vitrinaTallGroup.add(luzEscudo.target);

// Añadir el grupo del escudo a la plataforma interior
escudoGroup.position.set(0, innerPlatform.position.y, 0);
vitrinaTallGroup.add(escudoGroup);
// Hacer interactuable la placa del escudo (si se desea más adelante)
interactables.push(escudoGroup);


// Posicionar en el centro del salón
vitrinaTallGroup.position.set(0, 0, 0);
vitrinaTallGroup.castShadow = true;
vitrinaTallGroup.receiveShadow = true;
scene.add(vitrinaTallGroup);
console.log('✅ Vitrina cilíndrica alta agregada al centro del salón');


// Sistema de colisiones para todas las vitrinas
function checkVitrinaCollision(newPos) {
  const playerRadius = 0.15; // antes 0.5
  
  // Vitrina 1 (Jabulani)
  const vitrina1Pos = vitrinaGroup.position;
  const vitrina1Size = { x: 0.7, z: 0.7 }; // colisión vitrina 1
  
  const dx1 = Math.abs(newPos.x - vitrina1Pos.x);
  const dz1 = Math.abs(newPos.z - vitrina1Pos.z);
  
  if (dx1 < (vitrina1Size.x / 2 + playerRadius) && dz1 < (vitrina1Size.z / 2 + playerRadius)) {
    return true;
  }
  // Vitrina 2 (Trofeo Copa del Mundo) - ahora igual que vitrina 1
  const vitrina2Pos = vitrina2Group.position;
  const vitrina2Size = { x: 0.7, z: 0.7 }; // colisión vitrina 2

  const dx2 = Math.abs(newPos.x - vitrina2Pos.x);
  const dz2 = Math.abs(newPos.z - vitrina2Pos.z);

  if (dx2 < (vitrina2Size.x / 2 + playerRadius) && dz2 < (vitrina2Size.z / 2 + playerRadius)) {
    return true;
  }

  // Vitrina 3 (Copa Libertadores 2021) - Centro del museo
  const vitrina3Pos = vitrina3Group.position;
  const vitrina3Size = { x: 0.7, z: 0.7 }; // colisión vitrina 3

  const dx3 = Math.abs(newPos.x - vitrina3Pos.x);
  const dz3 = Math.abs(newPos.z - vitrina3Pos.z);

  if (dx3 < (vitrina3Size.x / 2 + playerRadius) && dz3 < (vitrina3Size.z / 2 + playerRadius)) {
    return true;
  }

  // Vitrina central cilíndrica (suelo-techo)
  // Usamos tallGlass (grupo vitrinaTallGroup) y tallRadius definido más arriba para evitar entrar dentro
  try {
    if (typeof vitrinaTallGroup !== 'undefined' && vitrinaTallGroup) {
      // center XZ de la vitrina
      const tallCenter = vitrinaTallGroup.position;
      const dxTall = newPos.x - tallCenter.x;
      const dzTall = newPos.z - tallCenter.z;
      const distXZ = Math.sqrt(dxTall * dxTall + dzTall * dzTall);
      // padding pequeño para que el jugador no roce el vidrio
      const padding = 0.25;
      if (distXZ < (tallRadius + playerRadius + padding)) {
        return true;
      }
    }
  } catch(e) {
    // en caso de error no bloquear otras comprobaciones
    console.warn('checkVitrinaCollision: error comprobando vitrina central', e);
  }

  // Vitrina 4 (Copa América) - colocada junto a la vitrina 3
  if (typeof vitrina4Group !== 'undefined') {
    const vitrina4Pos = vitrina4Group.position;
    const vitrina4Size = { x: 0.7, z: 0.7 };

    const dx4 = Math.abs(newPos.x - vitrina4Pos.x);
    const dz4 = Math.abs(newPos.z - vitrina4Pos.z);

    if (dx4 < (vitrina4Size.x / 2 + playerRadius) && dz4 < (vitrina4Size.z / 2 + playerRadius)) {
      return true;
    }
  }

  return false;
}

// Sistema de colisiones para barandillas del segundo piso
function checkRailingCollision(newPos) {
  // Solo verificar colisiones si el jugador está en el segundo piso
  if (newPos.y < finalBalconyHeight - 1) {
    return false;
  }
  
  const playerRadius = 0.15;
  const innerRailingOffset = balconyWidth - railingThickness/2; // 5.0 - 0.05 = 4.95
  
  // Posiciones exactas de las barandas interiores según el código de creación
  const frontInnerRailingZ = ROOM.d/2 - innerRailingOffset;    // 18 - 4.95 = 13.05
  const backInnerRailingZ = -ROOM.d/2 + innerRailingOffset;    // -18 + 4.95 = -13.05
  const leftInnerRailingX = -ROOM.w/2 + innerRailingOffset;    // -12 + 4.95 = -7.05
  const rightInnerRailingX = ROOM.w/2 - innerRailingOffset;    // 12 - 4.95 = 7.05
  
  // Dimensiones de las barandas interiores según el código de creación
  const innerRailingWidth = ROOM.w - balconyWidth*2;  // 24 - 10 = 14
  const innerRailingDepth = ROOM.d - balconyWidth*2;  // 36 - 10 = 26
  const stairGapWidth = 3;
  
  // Barandilla frontal interior: ancho 14, posición Z=13.05
  if (Math.abs(newPos.x) <= innerRailingWidth/2) {
    if (Math.abs(newPos.z - frontInnerRailingZ) < playerRadius) {
      return true;
    }
  }
  
  // Barandilla trasera interior: ancho 14 con hueco de 3 para escalera, posición Z=-13.05
  if (Math.abs(newPos.x) > stairGapWidth/2 && Math.abs(newPos.x) <= innerRailingWidth/2) {
    if (Math.abs(newPos.z - backInnerRailingZ) < playerRadius) {
      return true;
    }
  }
  
  // Barandilla izquierda interior: profundidad 26, posición X=-7.05
  if (Math.abs(newPos.z) <= innerRailingDepth/2) {
    if (Math.abs(newPos.x - leftInnerRailingX) < playerRadius) {
      return true;
    }
  }
  
  // Barandilla derecha interior: profundidad 26, posición X=7.05
  if (Math.abs(newPos.z) <= innerRailingDepth/2) {
    if (Math.abs(newPos.x - rightInnerRailingX) < playerRadius) {
      return true;
    }
  }
  
  return false;
}

// ======== Controles ========
const help = document.getElementById('help');
const label = document.getElementById('label');
const crosshair = document.getElementById('crosshair');
const hotbar = document.getElementById('hotbar');
let pointerLocked = false;

// ======== Sistema de Hotbar ========
let currentSlot = 5; // Slot activo (1-9)
const hotbarSlots = document.querySelectorAll('.hotbar-slot');

function updateHotbar() {
  hotbarSlots.forEach((slot, index) => {
    slot.classList.toggle('active', index + 1 === currentSlot);
  });
}

function setHotbarSlot(slotNumber) {
  if (slotNumber >= 1 && slotNumber <= 9) {
    currentSlot = slotNumber;
    updateHotbar();
    console.log(`🎒 Slot ${slotNumber} seleccionado`);
  }
}
function initializeHotbar() {
  // Íconos de los ítems (pueden ser emojis o caracteres especiales)
  const items = {
    1: '',
    2: '', 
    3: '', 
    4: '', 
    5: '', 
    6: '', 
    7: '', 
    8: '', 
    9: '' 
  };

  hotbarSlots.forEach((slot, index) => {
    const slotItem = slot.querySelector('.slot-item');
    const itemIcon = items[index + 1];
    if (itemIcon) {
      slotItem.innerHTML = itemIcon;
      slotItem.style.fontSize = '16px';
    }
  });
  
  updateHotbar();
  console.log('🎒 Hotbar inicializada con ítems');
}

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const move = { f:false,b:false,l:false,r:false, up:false, run:false };
let yaw = 0, pitch = 0;

function lockPointer(){
  CANVAS.requestPointerLock();
}
document.addEventListener('pointerlockchange', () => {
  pointerLocked = (document.pointerLockElement === CANVAS);
  help.style.display = pointerLocked ? 'none' : 'block';
  crosshair.style.display = pointerLocked ? 'block' : 'none';
  hotbar.style.display = pointerLocked ? 'block' : 'none';
  
  // Ocultar label cuando no estés en modo juego
  if (!pointerLocked) {
    label.classList.remove('show');
  }
  
  if (pointerLocked) {
    updateHotbar();
  }
});
CANVAS.addEventListener('click', lockPointer);

document.addEventListener('mousemove', (e) => {
  if (!pointerLocked) return;
  const sensitivity = 0.0025;
  yaw   -= e.movementX * sensitivity;
  pitch -= e.movementY * sensitivity;
  const limit = Math.PI/2 - 0.05;
  pitch = Math.max(-limit, Math.min(limit, pitch));
  camera.rotation.set(pitch, yaw, 0, "YXZ");
});

document.addEventListener('keydown', (e)=>{
  if (e.code==='KeyW') move.f = true;
  if (e.code==='KeyS') move.b = true;
  if (e.code==='KeyA') move.l = true;
  if (e.code==='KeyD') move.r = true;
  if (e.code==='Space') move.up = true;
  if (e.code==='ShiftLeft') move.run = true;
  if (e.code==='KeyE') {
    // Primero verificar si está mirando al interruptor
    if (isInterruptorFocused()) {
      toggleLuces();
      animarInterruptor();
    } else {
      // Intentar abrir info de obra
      tryOpenInfo();
    }
  }
  if (e.code === 'KeyQ') crouching = true;
  
  // Hotbar: teclas numéricas 1-9
  if (e.code >= 'Digit1' && e.code <= 'Digit9') {
    const slotNumber = parseInt(e.code.replace('Digit', ''));
    setHotbarSlot(slotNumber);
  }
});
document.addEventListener('keyup', (e)=>{
  if (e.code==='KeyW') move.f = false;
  if (e.code==='KeyS') move.b = false;
  if (e.code==='KeyA') move.l = false;
  if (e.code==='KeyD') move.r = false;
  if (e.code==='Space') move.up = false;
  if (e.code==='ShiftLeft') move.run = false;
  if (e.code === 'KeyQ') crouching = false;
});

// Scroll del mouse para cambiar slots de hotbar
document.addEventListener('wheel', (e) => {
  if (!pointerLocked) return;
  
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

let crouching = false;
const STAND_HEIGHT = 1.6;
const CROUCH_HEIGHT = 1.0;

// Modificar la altura de la cámara en movePlayer
function movePlayer(dt){
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

  // Verificar colisión con la vitrina y las barandas
  if (!checkVitrinaCollision(newPosition) && !checkRailingCollision(newPosition)) {
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



  // Colisiones con paredes
  const margin = 0.6;
  camera.position.x = Math.max(-ROOM.w/2 + margin, Math.min(ROOM.w/2 - margin, camera.position.x));
  camera.position.z = Math.max(-ROOM.d/2 + margin, Math.min(ROOM.d/2 - margin, camera.position.z));
}

// ======== Raycaster ========
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
// Función para verificar proximidad a un objeto
function isNearObject(object, maxDistance = 2.5) {
  if (!object) return false;
  
  // Obtener posición mundial del objeto
  const objectWorldPos = new THREE.Vector3();
  object.getWorldPosition(objectWorldPos);
  
  // Calcular distancia a la cámara
  const distance = camera.position.distanceTo(objectWorldPos);
  return distance <= maxDistance;
}

function getFocusedArt() {
  raycaster.setFromCamera({x:0, y:0}, camera);
  const hits = raycaster.intersectObjects(interactables, true); // true para intersectar recursivamente
  if (hits.length) {
    // Encontrar el frame padre que contiene el userData
    let obj = hits[0].object;
    while (obj && !obj.userData.title) {
      obj = obj.parent;
    }
    
    // Verificar proximidad - solo retornar si está cerca
    if (isNearObject(obj)) {
      return obj;
    }
  }
  return null;
}

function tryOpenInfo(){
  const obj = getFocusedArt();
  if (!obj || !obj.userData || !obj.userData.title) return;
  showInfo(obj.userData.title, obj.userData.desc);
}

function updateAimLabel(){
  // Verificar si está mirando al interruptor primero
  if (isInterruptorFocused()) {
    const estado = lucesPrendidas ? "apagar" : "prender";
    label.textContent = `E: ${estado.charAt(0).toUpperCase() + estado.slice(1)} luces del museo`;
    label.classList.add('show');
    return;
  }
  
  // Si no está mirando al interruptor, verificar obras

  const obj = getFocusedArt();
  if (obj && obj.userData && obj.userData.title){
    label.textContent = `E: Ver "${obj.userData.title}"`;
    label.classList.add('show');
  }else{
    label.classList.remove('show');
  }
}

// Panel info
const panel = document.getElementById('art-info');
const closeBtn = document.getElementById('close-info');
const artTitle = document.getElementById('art-title');
const artAuthor = document.getElementById('art-author');
const artDesc  = document.getElementById('art-desc');
closeBtn.onclick = ()=> panel.classList.add('hidden');

function showInfo(title, desc){
  // Separar autor/año de la descripción
  const parts = desc.split('\n\n');
  const authorInfo = parts[0]; // "Autor · Año"
  const description = parts[1] || parts[0]; // Descripción completa o texto original si no hay separación
  
  artTitle.textContent = title;
  artAuthor.textContent = authorInfo;
  artDesc.textContent = description;
  panel.classList.remove('hidden');
}

// ======== Loop ========
// ======== Interruptor de luz (modelo y animación) ========
const gltfLoaderSwitch = new GLTFLoader();
let interruptor = null;
let interruptorOn = true;

// Cargar el modelo y ubicarlo en la pared derecha cerca de la entrada
gltfLoaderSwitch.load(
  './assets/models/light_switch/scene.gltf',
  function(gltf) {
  interruptor = gltf.scene;
  // En la pared del frente, centrado y a una altura cómoda
  interruptor.position.set(ROOM.w/2 - 0.25, 1.5, ROOM.d/2 - 2);
  interruptor.scale.set(3, 3, 3);
  // Rotar para que quede plano contra la pared del frente
  interruptor.rotation.y = Math.PI;
  interruptor.rotation.z = 0;
  scene.add(interruptor);
  },
  undefined,
  function(error) {
    console.error('❌ Error cargando el interruptor:', error);
  }
);


// Animación simple: mover el interruptor levemente
function animarInterruptor() {
  if (!interruptor) return;
  interruptorOn = !interruptorOn;
  // Ya no se rota el modelo ni la palanca
}
// Declaración anticipada para evitar errores de temporal-dead-zone cuando animate
// intenta acceder a la variable antes de que el loader la inicialice.
let copaAmericaModel = null;
let last = performance.now();
function animate(now){
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (pointerLocked){
    movePlayer(dt);
    updateAimLabel();
  }
  // (removed legacy door animation)

  // Rotar el modelo Jabulani si está cargado
  if (jabulaniModel) {
    jabulaniModel.rotation.y += dt * 0.5;
  }
  
  // Rotar el trofeo de la Copa del Mundo si está cargado
  if (trofeoModel) {
    trofeoModel.rotation.y += dt * 0.3; // Rotación más lenta para el trofeo
  }
  
  // Rotar la Copa Libertadores si está cargada
  if (copaLibertadoresModel) {
    copaLibertadoresModel.rotation.y += dt * 0.25; // Rotación elegante y lenta para la Copa Libertadores
  }

  // Rotar la Copa América si está cargada (mismo comportamiento que la Copa Libertadores)
  if (copaAmericaModel) {
    copaAmericaModel.rotation.y += dt * 0.25; // Igual velocidad que la Copa Libertadores
  }

  // Rotación del escudo central (GLTF si está, si no rotar placeholder)
  if (escudoModel) {
    escudoModel.rotation.y += dt * 0.25;
  } else if (escudoPlaceholder) {
    // rotar suavemente el placeholder para dar vida mientras carga/si falla el GLTF
    escudoPlaceholder.rotation.y += dt * 0.15;
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
initializeHotbar();
animate(performance.now());

// Resize
window.addEventListener('resize', ()=>{
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Detectar si la cámara está mirando al interruptor (raycast al modelo)
function isInterruptorFocused() {
  if (!interruptor) return false;
  
  // Verificar proximidad primero
  if (!isNearObject(interruptor, 3.0)) return false;
  
  raycaster.setFromCamera({x:0, y:0}, camera);
  const hits = raycaster.intersectObject(interruptor, true);
  return hits.length > 0;
}

// ====== Vitrina 4: Copa América (similar a la Copa Libertadores) ======
const vitrina4Group = new THREE.Group();

// Reusar dimensiones de vitrina3 para consistencia
const vitrina4Width = vitrina3Width;
const vitrina4Depth = vitrina3Depth;
const vitrina4Height = vitrina3Height;

// Base del pedestal
const vitrina4Base = new THREE.Mesh(
  new THREE.BoxGeometry(vitrina4Width + 0.1, 0.15, vitrina4Depth + 0.1),
  new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.3, roughness: 0.7 })
);
vitrina4Base.position.y = 0.075;
vitrina4Base.receiveShadow = true;
vitrina4Base.castShadow = true;
vitrina4Group.add(vitrina4Base);

// Columna principal del pedestal
const vitrina4Column = new THREE.Mesh(
  new THREE.BoxGeometry(vitrina4Width, vitrina4Height, vitrina4Depth),
  new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.4, roughness: 0.6 })
);
vitrina4Column.position.y = vitrina4Height / 2 + 0.15;
vitrina4Column.receiveShadow = true;
vitrina4Column.castShadow = true;
vitrina4Group.add(vitrina4Column);

// Superficie superior del pedestal
const vitrina4Top = new THREE.Mesh(
  new THREE.BoxGeometry(vitrina4Width + 0.05, 0.08, vitrina4Depth + 0.05),
  new THREE.MeshStandardMaterial({ color: 0x404040, metalness: 0.5, roughness: 0.4 })
);
vitrina4Top.position.y = vitrina4Height + 0.15 + 0.04;
vitrina4Top.receiveShadow = true;
vitrina4Group.add(vitrina4Top);

// Estructura de vidrio (misma que vitrina3)
const vitrina4BaseY = vitrina4Height + 0.15 + 0.08;
const vitrina4GlassHeight = vitrina3GlassHeight;

const vitrina4Frontal = new THREE.Mesh(new THREE.BoxGeometry(0.65, vitrina4GlassHeight, 0.02), vidriaMaterial);
vitrina4Frontal.position.set(0, vitrina4BaseY + vitrina4GlassHeight/2, 0.65/2);
vitrina4Group.add(vitrina4Frontal);

const vitrina4Trasera = new THREE.Mesh(new THREE.BoxGeometry(0.65, vitrina4GlassHeight, 0.02), vidriaMaterial);
vitrina4Trasera.position.set(0, vitrina4BaseY + vitrina4GlassHeight/2, -0.65/2);
vitrina4Group.add(vitrina4Trasera);

const vitrina4Izquierda = new THREE.Mesh(new THREE.BoxGeometry(0.02, vitrina4GlassHeight, 0.65), vidriaMaterial);
vitrina4Izquierda.position.set(-0.65/2, vitrina4BaseY + vitrina4GlassHeight/2, 0);
vitrina4Group.add(vitrina4Izquierda);

const vitrina4Derecha = new THREE.Mesh(new THREE.BoxGeometry(0.02, vitrina4GlassHeight, 0.65), vidriaMaterial);
vitrina4Derecha.position.set(0.65/2, vitrina4BaseY + vitrina4GlassHeight/2, 0);
vitrina4Group.add(vitrina4Derecha);

const vitrina4Techo = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.02, 0.65), vidriaMaterial);
vitrina4Techo.position.set(0, vitrina4BaseY + vitrina4GlassHeight, 0);
vitrina4Group.add(vitrina4Techo);

const marcoSuperior4 = new THREE.Mesh(new THREE.BoxGeometry(0.65 + 0.03*2, 0.03, 0.65 + 0.03*2), marcoMaterial);
marcoSuperior4.position.set(0, vitrina4BaseY + vitrina4GlassHeight + 0.03/2, 0);
vitrina4Group.add(marcoSuperior4);

// Placa informativa
const placa4 = createGoldenPlaque("COPA AMÉRICA", "Trofeo de la Copa América. Información editable por el usuario.");
placa4.position.set(0.37, 0.9, 0);
placa4.rotation.x = 0;
placa4.rotation.y = -Math.PI / 2;
placa4.rotation.z = Math.PI;
vitrina4Group.add(placa4);
interactables.push(placa4);

// Replica exacta del pedestal interno y grupo de la vitrina 3 para la Copa América
const copaAmerica4Group = new THREE.Group();
const pedestalCopaAmerica = new THREE.Mesh(
  new THREE.CylinderGeometry(0.2, 0.2, 0.15, 32),
  new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.4, roughness: 0.6 })
);
pedestalCopaAmerica.position.y = 0.075;
pedestalCopaAmerica.castShadow = true;
pedestalCopaAmerica.receiveShadow = true;
copaAmerica4Group.add(pedestalCopaAmerica);

// Cargar el modelo GLTF de la Copa América y añadirlo al grupo (misma escala/posición que la Libertadores)
const gltfLoaderCopaAmerica = new GLTFLoader();
console.log('🏆 Iniciando carga de la Copa América GLTF...');
gltfLoaderCopaAmerica.load(
  './assets/models/copa_america_trophy/scene.gltf',
  function (gltf) {
    copaAmericaModel = gltf.scene;
    // Igual que copaLibertadores: escala pequeña y se eleva sobre el pedestal
    copaAmericaModel.scale.set(0.25, 0.25, 0.25);
    copaAmericaModel.position.set(0, 0.1605, 0);
    // Mantener los materiales originales para preservar texturas de la Copa América.
    // Solo activamos sombras y corregimos el colorSpace de los mapas si existen.
    copaAmericaModel.traverse(function(node){
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        try {
          const mat = node.material;
          if (mat) {
            if (Array.isArray(mat)) {
              mat.forEach(m => { if (m && m.map) try { m.map.colorSpace = THREE.SRGBColorSpace; } catch(e){} });
            } else {
              if (mat.map) try { mat.map.colorSpace = THREE.SRGBColorSpace; } catch(e){}
              if (mat.normalMap) try { mat.normalMap.colorSpace = THREE.LinearSRGBColorSpace; } catch(e){}
            }
          }
        } catch(e) { console.warn('Error ajustando materiales copaAmerica:', e); }
      }
    });
    copaAmerica4Group.add(copaAmericaModel);
    console.log('🏆 Copa América cargada y posicionada (comportamiento replicado)');
  },
  undefined,
  function (err) {
    console.error('❌ Error cargando Copa América:', err);
  }
);

// Posicionar el grupo de la Copa América dentro de la vitrina (igual que vitrina3)
copaAmerica4Group.position.set(0, vitrina4BaseY, 0);
vitrina4Group.add(copaAmerica4Group);

// Luces para la vitrina (mismas configuraciones que vitrina3)
const luzCopaAmerica = new THREE.SpotLight(0xffffff, 6.0, 10, Math.PI / 3, 0.1, 1);
luzCopaAmerica.position.set(0, vitrina4BaseY + vitrina4GlassHeight + 1.5, 0);
luzCopaAmerica.target.position.set(0, vitrina4BaseY + 0.2, 0);
luzCopaAmerica.castShadow = true;
vitrina4Group.add(luzCopaAmerica);
vitrina4Group.add(luzCopaAmerica.target);

let luzLateralCopa4 = new THREE.PointLight(0xffffff, 2.5, 4);
luzLateralCopa4.position.set(0.3, vitrina4BaseY + vitrina4GlassHeight * 0.6, 0.3);
vitrina4Group.add(luzLateralCopa4);

let luzLateralCopa42 = new THREE.PointLight(0xffffff, 2.0, 4);
luzLateralCopa42.position.set(-0.3, vitrina4BaseY + vitrina4GlassHeight * 0.6, -0.3);
vitrina4Group.add(luzLateralCopa42);

const luzAmbientalCopaAmerica = new THREE.AmbientLight(0xffffff, 0.4);
vitrina4Group.add(luzAmbientalCopaAmerica);

// Posicionar la nueva vitrina en el museo y agregar a la escena
// Posicionar la nueva vitrina inmediatamente a la derecha de la vitrina 3 (Copa Libertadores)
// Usamos el ancho de la vitrina + un pequeño padding para colocarlas juntas sin solaparse
const vitrinaPadding = 0.15;
vitrina4Group.position.set(-7.5, 0, -3);
vitrina4Group.rotation.y = Math.PI;
vitrina4Group.castShadow = true;
vitrina4Group.receiveShadow = true;
scene.add(vitrina4Group);