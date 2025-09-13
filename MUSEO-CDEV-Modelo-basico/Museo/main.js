// ======== Config básica ========
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
console.log('🚀 Iniciando museo virtual...');
const CANVAS = document.getElementById("miCanvas");
console.log('📺 Canvas encontrado:', CANVAS);

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
const hemi = new THREE.HemisphereLight(0xffffff, 0x222233, 0.8);
scene.add(hemi);

const spot = new THREE.SpotLight(0xffffff, 2.0, 60, Math.PI/5, 0.2, 1.5);
spot.position.set(0, 7.5, 0);
spot.castShadow = true;
scene.add(spot);
scene.add(spot.target);

// Luz ambiental extra
const ambient = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambient);

// Agrupar luces principales para controlarlas
const mainLights = [hemi, spot, ambient];
let lucesPrendidas = true;

function toggleLuces() {
  lucesPrendidas = !lucesPrendidas;
  mainLights.forEach(luz => luz.visible = lucesPrendidas);
  // También apagar/prender las luces de las lámparas del techo
  lamparasSpotLights.forEach(luz => luz.visible = lucesPrendidas);
}

// Array para guardar los SpotLight de las lámparas del techo
const lamparasSpotLights = [];

// ======== Sala del museo ========
const ROOM = { w: 24, h: 6, d: 36 };
const wallMat = new THREE.MeshStandardMaterial({ color: 0x161a22, roughness: 0.9, metalness: 0.0 });
const floorMat = new THREE.MeshStandardMaterial({ color: 0x1f2836, roughness: 1.0 });


const room = new THREE.Group();

// Piso
const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.w, ROOM.d), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
room.add(floor);

// Techo

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
        const luzLampara = new THREE.SpotLight(0xffffff, 2.5, 12, Math.PI/6, 0.2, 0.8);
        luzLampara.position.set(x, offsetY - 0.2, z);
        luzLampara.target.position.set(x, .5, z);
        luzLampara.castShadow = false;
        scene.add(luzLampara);
        scene.add(luzLampara.target);
        lamparasSpotLights.push(luzLampara);
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

// ======== Obras / marcos ========
const interactables = [];
const loader = new THREE.TextureLoader();

function addFrame(opts) {
  const {
    x, z, face = "front",
    img = "./assets/textures/Pelota.jpg",
    title = "Obra sin título",
    desc = "Descripción de ejemplo"
  } = opts;

  // Cargar modelo GLTF del cuadro como marco
  const gltfLoaderFrame = new GLTFLoader();
  
  gltfLoaderFrame.load(
    './assets/models/cuadros/cuadro2/cuadro2.gltf',
    function (gltf) {
      const frame = gltf.scene;
      frame.scale.set(0.021, 0.021, 0.021);
      frame.position.set(x, 1.7, z);
      
      // Orientación según pared
      if (face === "back") frame.rotation.y = Math.PI;
      if (face === "left") frame.rotation.y = Math.PI/2;
      if (face === "right") frame.rotation.y = -Math.PI/2;
      
      // Configurar sombras
      frame.traverse(obj => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
        }
      });
      
      // Crear la imagen con el tamaño perfecto para llenar el marco
      const tex = loader.load(img);
      tex.colorSpace = THREE.SRGBColorSpace;
      const art = new THREE.Mesh(
        new THREE.PlaneGeometry(56.5, 36.5), // Tamaño ajustado para llenar perfectamente el marco
        new THREE.MeshBasicMaterial({ map: tex })
      );
      art.position.z = 1.5; // Ajustar posición Z también
      frame.add(art);

      // Luz propia para la obra
      const obraLight = new THREE.PointLight(0xffffff, 1.5, 8);
      obraLight.position.set(0, 10, 8); // Ajustar posición para la imagen más grande
      frame.add(obraLight);

      frame.userData = { title, desc };
      scene.add(frame);
      interactables.push(frame);
      
      console.log(`🖼️ Marco GLTF cargado en posición (${x}, ${z}) - ${title}`);
    },
    function (progress) {
      console.log(`📥 Cargando marco en (${x}, ${z}):`, Math.round(progress.loaded / progress.total * 100) + '%');
    },
    function (error) {
      console.error(`❌ Error cargando marco en posición (${x}, ${z}):`, error);
    }
  );
}

// Carga algunas obras
const imgs = [
  "./assets/images/EL DIIIIIEGO.jpg",
  "./assets/images/cafeteras.jpg",
  "./assets/images/obra3.jpg",
  "./assets/images/obra4.jpg",
  "./assets/textures/Pelota.jpg"
];

for (let i = -8; i <= 8; i += 4) {
  addFrame({ x: i, z: -ROOM.d/2 + 0.18, face: "back",  img: imgs[(i+8)/4 % imgs.length], title: `Obra pared fondo ${i}`,  desc: "Autor A · 2024" });
  addFrame({ x: i, z:  ROOM.d/2 - 0.18, face: "front", img: imgs[(i+10)/4 % imgs.length], title: `Obra pared frente ${i}`, desc: "Autor B · 2023" });
}
for (let i = -8; i <= 8; i += 4) {
  addFrame({ x: -ROOM.w/2 + 0.18, z: i, face: "left",  img: imgs[(i+12)/4 % imgs.length], title: `Obra pared izq ${i}`,  desc: "Autor C · 2022" });
  addFrame({ x:  ROOM.w/2 - 0.18, z: i, face: "right", img: imgs[(i+14)/4 % imgs.length], title: `Obra pared der ${i}`, desc: "Autor D · 2021" });
}

// Pedestal central con "escultura"
const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.6, 32), wallMat);
pedestal.position.set(0, 0.3, 0);
pedestal.receiveShadow = true;
scene.add(pedestal);

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

// Posicionar la vitrina en el museo
vitrinaGroup.position.set(-6, 0, 6);
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

// Posicionar la segunda vitrina en el museo
vitrina2Group.position.set(-6, 0, 3);
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
  trofeoModel.scale.set(0.0009, 0.0009, 0.0009); // Ajuste de escala para que la copa entre en la vitrina
  trofeoModel.position.set(0, 0.1605, 0); // Subir la copa para que quede sobre el pedestal
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

// ======== Vitrina Central - Copa Libertadores 2021 ========
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

// Vidrio frontal
const vitrina3Frontal = new THREE.Mesh(
  new THREE.BoxGeometry(0.65, 0.65, 0.02),
  vidriaMaterial
);
vitrina3Frontal.position.set(0, vitrina3BaseY + 0.65/2, 0.65/2);
vitrina3Group.add(vitrina3Frontal);

// Vidrio trasero
const vitrina3Trasera = new THREE.Mesh(
  new THREE.BoxGeometry(0.65, 0.65, 0.02),
  vidriaMaterial
);
vitrina3Trasera.position.set(0, vitrina3BaseY + 0.65/2, -0.65/2);
vitrina3Group.add(vitrina3Trasera);

// Vidrios laterales
const vitrina3Izquierda = new THREE.Mesh(
  new THREE.BoxGeometry(0.02, 0.65, 0.65),
  vidriaMaterial
);
vitrina3Izquierda.position.set(-0.65/2, vitrina3BaseY + 0.65/2, 0);
vitrina3Group.add(vitrina3Izquierda);

const vitrina3Derecha = new THREE.Mesh(
  new THREE.BoxGeometry(0.02, 0.65, 0.65),
  vidriaMaterial
);
vitrina3Derecha.position.set(0.65/2, vitrina3BaseY + 0.65/2, 0);
vitrina3Group.add(vitrina3Derecha);

// Techo de vidrio
const vitrina3Techo = new THREE.Mesh(
  new THREE.BoxGeometry(0.65, 0.02, 0.65),
  vidriaMaterial
);
vitrina3Techo.position.set(0, vitrina3BaseY + 0.65, 0);
vitrina3Group.add(vitrina3Techo);

// Marco superior
const marcoSuperior3 = new THREE.Mesh(
  new THREE.BoxGeometry(0.65 + 0.03*2, 0.03, 0.65 + 0.03*2),
  marcoMaterial
);
marcoSuperior3.position.set(0, vitrina3BaseY + 0.65 + 0.03/2, 0);
vitrina3Group.add(marcoSuperior3);

// Posicionar la tercera vitrina en el centro del museo
vitrina3Group.position.set(0, 0, 0);
vitrina3Group.castShadow = true;
vitrina3Group.receiveShadow = true;
scene.add(vitrina3Group);
console.log('✅ Tercera vitrina (central) agregada a la escena');

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

// Luz desde arriba para la Copa Libertadores (intensa y dorada)
const luzCopaLibertadores = new THREE.SpotLight(0xffffff, 6.0, 8, Math.PI / 3, 0.1, 1);
luzCopaLibertadores.position.set(0, vitrina3BaseY + 0.65 + 1.5, 0);
luzCopaLibertadores.target.position.set(0, vitrina3BaseY + 0.2, 0);
luzCopaLibertadores.castShadow = true;
vitrina3Group.add(luzCopaLibertadores);
vitrina3Group.add(luzCopaLibertadores.target);

// Luz adicional lateral para resaltar el brillo de la Copa Libertadores
let luzLateralCopa = new THREE.PointLight(0xffffff, 2.5, 3);
luzLateralCopa.position.set(0.3, vitrina3BaseY + 0.4, 0.3);
vitrina3Group.add(luzLateralCopa);

// Segunda luz lateral desde el otro lado
let luzLateralCopa2 = new THREE.PointLight(0xffffff, 2.0, 3);
luzLateralCopa2.position.set(-0.3, vitrina3BaseY + 0.4, -0.3);
vitrina3Group.add(luzLateralCopa2);

// Luz ambiental adicional solo para la vitrina de la Copa Libertadores
const luzAmbientalCopaLibertadores = new THREE.AmbientLight(0xffffff, 0.4);
vitrina3Group.add(luzAmbientalCopaLibertadores);


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

  return false;
}

// ======== Controles ========
const help = document.getElementById('help');
const label = document.getElementById('label');
let pointerLocked = false;

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
  if (e.code==='KeyE') tryOpenInfo();
  if (e.code==='KeyC') {
    // Solo permitir si la cámara mira al interruptor
    if (isInterruptorFocused()) {
      toggleLuces();
      animarInterruptor();
    }
  }
  if (e.code === 'KeyQ') crouching = true;
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

  // Verificar colisión con la vitrina
  if (!checkVitrinaCollision(newPosition)) {
    camera.position.copy(newPosition);
  }

  // Salto
  if (move.up && onFloor){ vy = JUMP; onFloor=false; }
  vy -= GRAVITY * dt;
  camera.position.y += vy * dt;
  let targetHeight = crouching ? CROUCH_HEIGHT : STAND_HEIGHT;
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
function getFocusedArt() {
  raycaster.setFromCamera({x:0, y:0}, camera);
  const hits = raycaster.intersectObjects(interactables, false);
  return hits.length ? hits[0].object : null;
}

function tryOpenInfo(){
  const obj = getFocusedArt();
  if (!obj) return;
  showInfo(obj.userData.title, obj.userData.desc);
}

function updateAimLabel(){
  const obj = getFocusedArt();
  if (obj){
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
const artDesc  = document.getElementById('art-desc');
closeBtn.onclick = ()=> panel.classList.add('hidden');
function showInfo(title, desc){
  artTitle.textContent = title;
  artDesc.textContent  = desc;
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
  interruptor.position.set(ROOM.w/2 - 0.15, 1.5, ROOM.d/2 - 2);
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
let last = performance.now();
function animate(now){
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (pointerLocked){
    movePlayer(dt);
    updateAimLabel();
  }

  // Rotar el modelo Jabulani si está cargado
  if (jabulaniModel) {
    jabulaniModel.rotation.y += dt * 0.5;
  }
  
  // Rotar el trofeo de la Copa del Mundo si está cargado
  if (trofeoModel) {
    trofeoModel.rotation.y += dt * 0.3; // Rotación más lenta para el trofeo
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
  raycaster.setFromCamera({x:0, y:0}, camera);
  const hits = raycaster.intersectObject(interruptor, true);
  return hits.length > 0;
}





