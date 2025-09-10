// ======== Config básica ========
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
const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.w, ROOM.d), wallMat);
ceiling.rotation.x =  Math.PI / 2;
ceiling.position.y = ROOM.h;
room.add(ceiling);

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

  // Marco
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 1.0, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x2a3344, metalness: .2, roughness: .7 })
  );
  frame.castShadow = true;
  frame.position.set(x, 1.7, z);

  // Orientación según pared
  if (face === "back") frame.rotation.y = Math.PI;
  if (face === "left") frame.rotation.y =  Math.PI/2;
  if (face === "right") frame.rotation.y = -Math.PI/2;

  // Lienzo (imagen)
  const tex = loader.load(img);
  tex.colorSpace = THREE.SRGBColorSpace;
  const art = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 0.8),
    new THREE.MeshBasicMaterial({ map: tex })
  );
  art.position.z = 0.028;
  frame.add(art);

  // Luz propia para la obra
  const obraLight = new THREE.PointLight(0xffffff, 1.2, 3);
  obraLight.position.set(0, 0.5, 0.3);
  frame.add(obraLight);

  frame.userData = { title, desc };
  scene.add(frame);
  interactables.push(frame);
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
  new THREE.CylinderGeometry(0.2, 0.2, 0.15, 32),
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
const gltfLoader2 = new THREE.GLTFLoader();
let trofeoModel = null;

console.log('🏆 Iniciando carga del trofeo GLTF...');
gltfLoader2.load(
  './assets/models/world_cup_trophy/scene.gltf',
  function (gltf) {
    console.log('✅ GLTF del trofeo cargado exitosamente:', gltf);
    trofeoModel = gltf.scene;
    
    // Configurar el modelo y aplicar texturas desde la carpeta de texturas
    trofeoModel.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Configurar materiales para el trofeo dorado
        if (child.material) {
          // Clonar material para evitar conflictos
          child.material = child.material.clone();
          
          // Configurar como material PBR dorado brillante
          child.material.metalness = 0.95;
          child.material.roughness = 0.05;
          child.material.color.setHex(0xffd700); // Dorado base
          
          // Crear loader de texturas
          const textureLoader = new THREE.TextureLoader();
          
          // Determinar qué conjunto de texturas usar basado en el nombre del material o mesh
          const meshName = child.name ? child.name.toLowerCase() : '';
          const materialName = child.material.name ? child.material.name.toLowerCase() : '';
          
          let texturePrefix = 'body'; // Por defecto usar texturas del cuerpo
          if (meshName.includes('globe') || materialName.includes('globe') || 
              meshName.includes('earth') || materialName.includes('earth')) {
            texturePrefix = 'globe';
          }
          
          // Cargar textura base (color)
          textureLoader.load(
            `./assets/models/world_cup_trophy/textures/${texturePrefix}_baseColor.png`,
            function(texture) {
              texture.flipY = false;
              texture.colorSpace = THREE.SRGBColorSpace;
              texture.wrapS = THREE.RepeatWrapping;
              texture.wrapT = THREE.RepeatWrapping;
              child.material.map = texture;
              child.material.needsUpdate = true;
              console.log(`✅ Textura base ${texturePrefix} aplicada`);
            },
            undefined,
            function(error) {
              console.log(`⚠️ No se pudo cargar textura base ${texturePrefix}`);
            }
          );
          
          // Cargar textura metallic/roughness
          textureLoader.load(
            `./assets/models/world_cup_trophy/textures/${texturePrefix}_metallicRoughness.png`,
            function(texture) {
              texture.flipY = false;
              texture.wrapS = THREE.RepeatWrapping;
              texture.wrapT = THREE.RepeatWrapping;
              child.material.metalnessMap = texture;
              child.material.roughnessMap = texture;
              child.material.needsUpdate = true;
              console.log(`✅ Textura metallic/roughness ${texturePrefix} aplicada`);
            },
            undefined,
            function(error) {
              console.log(`⚠️ No se pudo cargar textura metallic/roughness ${texturePrefix}`);
            }
          );
          
          // Cargar normal map
          textureLoader.load(
            `./assets/models/world_cup_trophy/textures/${texturePrefix}_normal.png`,
            function(texture) {
              texture.flipY = false;
              texture.wrapS = THREE.RepeatWrapping;
              texture.wrapT = THREE.RepeatWrapping;
              child.material.normalMap = texture;
              child.material.normalScale = new THREE.Vector2(1, 1);
              child.material.needsUpdate = true;
              console.log(`✅ Normal map ${texturePrefix} aplicado`);
            },
            undefined,
            function(error) {
              console.log(`⚠️ No se pudo cargar normal map ${texturePrefix}`);
            }
          );
          
          // Asegurar que se actualice
          child.material.needsUpdate = true;
        }
      }
    });
    
    // Escalar y posicionar el trofeo dentro de la vitrina
    const box = new THREE.Box3().setFromObject(trofeoModel);
    const size = box.getSize(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z);
    const scale = 0.3 / maxDimension; // Escala más grande para que se vea mejor
    
    trofeoModel.scale.setScalar(scale);
    trofeoModel.position.set(0, 0.35, 0); // Elevado más para que se vea mejor
    
    trofeo2Group.add(trofeoModel);
    console.log('✅ Trofeo de la Copa del Mundo cargado con texturas');
  },
  function (progress) {
    console.log('📥 Cargando trofeo:', Math.round(progress.loaded / progress.total * 100) + '%');
  },
  function (error) {
    console.error('❌ ERROR CRÍTICO cargando trofeo GLTF:', error);
    console.error('❌ Ruta del archivo:', './assets/models/world_cup_trophy/scene.gltf');
    console.error('❌ Usando fallback en su lugar');
    
    // Fallback: crear un trofeo dorado realista con forma de Copa del Mundo
    const trofeoFallback = new THREE.Group();
    
    // Cargar texturas para el fallback
    const textureLoader = new THREE.TextureLoader();
    let bodyTexture = null;
    let globeTexture = null;
    
    // Cargar textura del cuerpo
    textureLoader.load('./assets/models/world_cup_trophy/textures/body_baseColor.png', function(texture) {
      texture.flipY = false;
      texture.colorSpace = THREE.SRGBColorSpace;
      bodyTexture = texture;
      updateTrophyMaterials();
    });
    
    // Cargar textura del globo
    textureLoader.load('./assets/models/world_cup_trophy/textures/globe_baseColor.png', function(texture) {
      texture.flipY = false;
      texture.colorSpace = THREE.SRGBColorSpace;
      globeTexture = texture;
      updateTrophyMaterials();
    });
    
    // Base verde del trofeo (como la real)
    const baseVerde = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.03, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0x2d5016, // Verde FIFA
        metalness: 0.3, 
        roughness: 0.7 
      })
    );
    baseVerde.position.y = 0.165;
    trofeoFallback.add(baseVerde);
    
    // Base dorada del trofeo
    const baseDorada = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.04, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0xffd700, 
        metalness: 0.95, 
        roughness: 0.05 
      })
    );
    baseDorada.position.y = 0.19;
    trofeoFallback.add(baseDorada);
    
    // Parte inferior del cuerpo (más ancha)
    const cuerpoInferior = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.075, 0.08, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0xffd700, 
        metalness: 0.95, 
        roughness: 0.05 
      })
    );
    cuerpoInferior.position.y = 0.25;
    trofeoFallback.add(cuerpoInferior);
    
    // Parte media del cuerpo (con curvas características)
    const cuerpoMedio = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.065, 0.12, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0xffd700, 
        metalness: 0.95, 
        roughness: 0.05 
      })
    );
    cuerpoMedio.position.y = 0.35;
    trofeoFallback.add(cuerpoMedio);
    
    // Parte superior del cuerpo (más estrecha)
    const cuerpoSuperior = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.05, 0.08, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0xffd700, 
        metalness: 0.95, 
        roughness: 0.05 
      })
    );
    cuerpoSuperior.position.y = 0.43;
    trofeoFallback.add(cuerpoSuperior);
    
    // Transición al globo
    const transicion = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.045, 0.03, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0xffd700, 
        metalness: 0.95, 
        roughness: 0.05 
      })
    );
    transicion.position.y = 0.485;
    trofeoFallback.add(transicion);
    
    // Globo terrestre superior
    const globo = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 32, 24),
      new THREE.MeshStandardMaterial({ 
        color: 0xffd700, 
        metalness: 0.95, 
        roughness: 0.05 
      })
    );
    globo.position.y = 0.56;
    trofeoFallback.add(globo);
    
    // Función para actualizar materiales cuando las texturas se cargan
    function updateTrophyMaterials() {
      if (bodyTexture) {
        // Aplicar textura del cuerpo a todas las partes doradas excepto el globo
        [baseDorada, cuerpoInferior, cuerpoMedio, cuerpoSuperior, transicion].forEach(part => {
          part.material.map = bodyTexture;
          part.material.needsUpdate = true;
        });
      }
      
      if (globeTexture) {
        // Aplicar textura del globo a la esfera superior
        globo.material.map = globeTexture;
        globo.material.needsUpdate = true;
      }
    }
    
    trofeoFallback.position.y = 0.25; // Elevado más para que se vea mejor
    trofeoFallback.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    trofeo2Group.add(trofeoFallback);
    trofeoModel = trofeoFallback;
    console.log('⚠️ Usando trofeo fallback dorado');
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


// Sistema de colisiones para ambas vitrinas
function checkVitrinaCollision(newPos) {
  const playerRadius = 0.5;
  
  // Vitrina 1 (Jabulani)
  const vitrina1Pos = vitrinaGroup.position;
  const vitrina1Size = { x: 1.8, z: 1.8 };
  
  const dx1 = Math.abs(newPos.x - vitrina1Pos.x);
  const dz1 = Math.abs(newPos.z - vitrina1Pos.z);
  
  if (dx1 < (vitrina1Size.x / 2 + playerRadius) && dz1 < (vitrina1Size.z / 2 + playerRadius)) {
    return true;
  }
  // Vitrina 2 (Trofeo Copa del Mundo) - ahora igual que vitrina 1
  const vitrina2Pos = vitrina2Group.position;
  const vitrina2Size = { x: 1.8, z: 1.8 }; // Mismo tamaño que vitrina 1

  const dx2 = Math.abs(newPos.x - vitrina2Pos.x);
  const dz2 = Math.abs(newPos.z - vitrina2Pos.z);

  if (dx2 < (vitrina2Size.x / 2 + playerRadius) && dz2 < (vitrina2Size.z / 2 + playerRadius)) {
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
  if (e.code==='KeyC') animarCortinas();
});
document.addEventListener('keyup', (e)=>{
  if (e.code==='KeyW') move.f = false;
  if (e.code==='KeyS') move.b = false;
  if (e.code==='KeyA') move.l = false;
  if (e.code==='KeyD') move.r = false;
  if (e.code==='Space') move.up = false;
  if (e.code==='ShiftLeft') move.run = false;
});

// Movimiento
const GRAVITY = 18, JUMP = 5;
let onFloor = true;
let vy = 0;

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
  if (camera.position.y <= 1.6){ camera.position.y = 1.6; vy = 0; onFloor = true; }

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