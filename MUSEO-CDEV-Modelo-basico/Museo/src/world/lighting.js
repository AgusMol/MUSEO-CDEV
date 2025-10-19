import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Configura el sistema de iluminación principal del museo
 * @param {THREE.Scene} scene - Escena de Three.js
 * @param {Object} ROOM - Dimensiones de la sala
 * @param {boolean} enableCeilingLights - Si se deben activar las luces del techo
 * @returns {Object} Sistema de luces {mainLights, lamparasSpotLights, toggleLuces, lucesPrendidas}
 */
export function initLightingSystem(scene, ROOM, enableCeilingLights = false) {
  console.log('💡 Inicializando sistema de iluminación...');

  // Luz hemisférica
  const hemi = new THREE.HemisphereLight(0xffffff, 0x222233, 0.8);
  scene.add(hemi);

  // Spot principal del techo
  let spot = null;
  if (enableCeilingLights) {
    spot = new THREE.SpotLight(0xffffff, 2.0, 60, Math.PI/5, 0.2, 1.5);
    spot.position.set(0, 7.5, 0);
    spot.castShadow = true;
    scene.add(spot);
    scene.add(spot.target);
  }

  // Luz ambiental
  const ambient = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambient);

  // Agrupar luces principales
  const mainLights = [hemi, ambient];
  if (spot) mainLights.push(spot);

  // Array para lámparas del techo
  const lamparasSpotLights = [];

  let lucesPrendidas = true;

  function toggleLuces() {
    lucesPrendidas = !lucesPrendidas;
    mainLights.forEach(luz => luz.visible = lucesPrendidas);
    lamparasSpotLights.forEach(luz => luz.visible = lucesPrendidas);
  }

  console.log('✅ Sistema de iluminación inicializado');

  return {
    mainLights,
    lamparasSpotLights,
    toggleLuces,
    get lucesPrendidas() { return lucesPrendidas; }
  };
}

/**
 * Crea las lámparas colgantes del techo
 * @param {THREE.Scene} scene - Escena de Three.js
 * @param {Object} ROOM - Dimensiones de la sala
 * @param {Array} lamparasSpotLights - Array para agregar las luces
 * @param {boolean} enableLights - Si se deben agregar luces a las lámparas
 */
export function createCeilingLamps(scene, ROOM, lamparasSpotLights, enableLights = false) {
  console.log('🏮 Creando lámparas colgantes...');

  const numRows = 3;
  const numCols = 5;
  const offsetY = ROOM.h - 0.4;
  const lamparaGLTF = './assets/models/lampara_colgante_de_techo/scene.gltf';
  const gltfLoader = new GLTFLoader();

  for (let row = 0; row < numRows; row++) {
    const z = -ROOM.d/2 + (ROOM.d/(numRows+1)) * (row+1);
    for (let col = 0; col < numCols; col++) {
      const x = -ROOM.w/2 + (ROOM.w/(numCols+1)) * (col+1);
      
      gltfLoader.load(
        lamparaGLTF,
        function(gltf) {
          const lampara = gltf.scene.clone();
          lampara.position.set(x, offsetY - 1, z);
          lampara.scale.set(1, 1, 1);
          lampara.traverse(obj => { 
            if (obj.isMesh) { 
              obj.castShadow = true; 
              obj.receiveShadow = true; 
            }
          });
          scene.add(lampara);

          // Luz tipo SpotLight
          if (enableLights) {
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

  console.log('✅ Lámparas colgantes creadas');
}

/**
 * Crea el techo con paneles y marcos
 * @param {THREE.Group} room - Grupo de la sala
 * @param {Object} ROOM - Dimensiones de la sala
 * @returns {THREE.Group} Grupo del techo
 */
export function createCeiling(room, ROOM) {
  console.log('🏛️ Creando techo con paneles...');

  const panelSize = 4.0;
  const panelsX = Math.ceil(ROOM.w / panelSize);
  const panelsZ = Math.ceil(ROOM.d / panelSize);
  const frameThickness = 0.12;
  const ceilingHeight = ROOM.h - 0.4;

  const ceilingPanelMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xf2f2f2, 
    roughness: 0.9 
  });
  
  const ceilingFrameMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xcccccc, 
    roughness: 0.8 
  });

  const ceilingGroup = new THREE.Group();

  // Marcos horizontales
  for (let x = 0; x <= panelsX; x++) {
    const posX = (x - panelsX/2) * panelSize;
    const frameGeometry = new THREE.BoxGeometry(frameThickness, 0.12, ROOM.d);
    const frame = new THREE.Mesh(frameGeometry, ceilingFrameMaterial);
    frame.position.set(posX, ceilingHeight + 0.02, 0);
    frame.receiveShadow = true;
    frame.castShadow = true;
    ceilingGroup.add(frame);
  }

  // Marcos verticales
  for (let z = 0; z <= panelsZ; z++) {
    const posZ = (z - panelsZ/2) * panelSize;
    const frameGeometry = new THREE.BoxGeometry(ROOM.w, 0.12, frameThickness);
    const frame = new THREE.Mesh(frameGeometry, ceilingFrameMaterial);
    frame.position.set(0, ceilingHeight + 0.02, posZ);
    frame.receiveShadow = true;
    frame.castShadow = true;
    ceilingGroup.add(frame);
  }

  // Paneles
  for (let ix = 0; ix < panelsX; ix++) {
    for (let iz = 0; iz < panelsZ; iz++) {
      const centerX = (ix - panelsX/2 + 0.5) * panelSize;
      const centerZ = (iz - panelsZ/2 + 0.5) * panelSize;
      const panelGeo = new THREE.BoxGeometry(
        panelSize - frameThickness*0.5, 
        0.08, 
        panelSize - frameThickness*0.5
      );
      const panel = new THREE.Mesh(panelGeo, ceilingPanelMaterial);
      panel.position.set(centerX, ceilingHeight, centerZ);
      panel.receiveShadow = true;
      panel.castShadow = false;
      ceilingGroup.add(panel);
    }
  }

  room.add(ceilingGroup);
  console.log('✅ Techo creado');

  return ceilingGroup;
}

/**
 * Crea la sala de recepción
 * @param {THREE.Scene} scene - Escena de Three.js
 * @param {Object} ROOM - Dimensiones de la sala principal
 * @param {THREE.Material} wallMat - Material de las paredes
 * @returns {THREE.Group} Grupo de la recepción
 */
export function createReceptionRoom(scene, ROOM, wallMat) {
  console.log('🏢 Creando sala de recepción...');

  const receptionRoom = new THREE.Group();
  const R_w = 6;
  const R_d = 8;
  const R_h = 4;

  // Piso de recepción
  const receptionFloorTex = new THREE.TextureLoader().load('./assets/textures/madera_parquet.jpg');
  receptionFloorTex.wrapS = receptionFloorTex.wrapT = THREE.RepeatWrapping;
  receptionFloorTex.repeat.set(2, 2);
  const receptionFloorMat = new THREE.MeshStandardMaterial({ 
    map: receptionFloorTex, 
    roughness: 0.6 
  });
  const receptionFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(R_w, R_d), 
    receptionFloorMat
  );
  receptionFloor.rotation.x = -Math.PI/2;
  receptionFloor.position.set(0, 0.01, ROOM.d/2 + R_d/2);
  receptionFloor.receiveShadow = true;
  receptionRoom.add(receptionFloor);

  // Paredes de recepción
  const receptionBack = new THREE.Mesh(
    new THREE.BoxGeometry(R_w, R_h, 0.3), 
    wallMat
  );
  receptionBack.position.set(0, R_h/2, ROOM.d/2 + R_d - 0.15);
  receptionRoom.add(receptionBack);

  const receptionLeftWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, R_h, R_d), 
    wallMat
  );
  receptionLeftWall.position.set(-R_w/2 + 0.15, R_h/2, ROOM.d/2 + R_d/2);
  receptionRoom.add(receptionLeftWall);

  const receptionRightWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, R_h, R_d), 
    wallMat
  );
  receptionRightWall.position.set(R_w/2 - 0.15, R_h/2, ROOM.d/2 + R_d/2);
  receptionRoom.add(receptionRightWall);

  // Mostrador
  const receptionDesk = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.9, 0.6), 
    new THREE.MeshStandardMaterial({ 
      color: 0x333333, 
      metalness: 0.2, 
      roughness: 0.6 
    })
  );
  receptionDesk.position.set(0, 0.45, ROOM.d/2 + 1.4);
  receptionRoom.add(receptionDesk);

  // Luz de recepción
  const receptionLight = new THREE.PointLight(0xfff7e0, 1.4, 10);
  receptionLight.position.set(0, 2.5, ROOM.d/2 + R_d/2 - 1);
  receptionRoom.add(receptionLight);

  // Señal de recepción
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 256; 
  signCanvas.height = 128;
  const sctx = signCanvas.getContext('2d');
  sctx.fillStyle = '#222'; 
  sctx.fillRect(0, 0, 256, 128);
  sctx.fillStyle = '#fff'; 
  sctx.font = '28px Arial'; 
  sctx.textAlign = 'center'; 
  sctx.fillText('Recepción', 128, 70);
  
  const signTex = new THREE.CanvasTexture(signCanvas);
  const signMat = new THREE.MeshBasicMaterial({ 
    map: signTex, 
    side: THREE.DoubleSide 
  });
  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 0.6), 
    signMat
  );
  signMesh.position.set(0, 1.2, ROOM.d/2 + 0.6);
  receptionRoom.add(signMesh);

  scene.add(receptionRoom);
  console.log('✅ Sala de recepción creada');

  return receptionRoom;
}
