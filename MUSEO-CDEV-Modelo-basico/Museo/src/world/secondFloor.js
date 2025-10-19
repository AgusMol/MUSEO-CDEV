import * as THREE from 'three';

/**
 * Crea la estructura completa de escalera central y segundo piso con balcón perimetral
 * @param {THREE.Scene} scene - Escena de Three.js
 * @param {Object} ROOM - Dimensiones de la sala {w, h, d}
 * @param {Array} lamparasSpotLights - Array para agregar las luces del segundo piso
 * @returns {Object} Información del segundo piso {secondFloorGroup, finalBalconyHeight, balconyWidth}
 */
export function createSecondFloor(scene, ROOM, lamparasSpotLights) {
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
  woodParquetTextureRotated.rotation = Math.PI / 2;
  woodParquetTextureRotated.center.set(0.5, 0.5);
  woodParquetTextureRotated.needsUpdate = true;

  // Materiales
  const balconyMaterial = new THREE.MeshStandardMaterial({
    map: woodParquetTexture,
    roughness: 0.3,
    metalness: 0.0
  });

  const stairMaterial = new THREE.MeshStandardMaterial({
    map: woodParquetTextureRotated,
    roughness: 0.3,
    metalness: 0.0
  });

  const frontBackBalconyMaterial = new THREE.MeshStandardMaterial({
    map: woodParquetTextureRotated,
    roughness: 0.3,
    metalness: 0.0
  });

  const railingMaterial = new THREE.MeshStandardMaterial({
    color: 0xB8860B,
    roughness: 0.3,
    metalness: 0.8
  });

  // Grupo para toda la estructura
  const secondFloorGroup = new THREE.Group();
  const stairGroup = new THREE.Group();

  // Dimensiones de la escalera
  const stairWidth = 3;
  const stepHeight = 0.2;
  const stepDepth = 0.3;
  const totalSteps = 23;
  const stairLength = totalSteps * stepDepth;

  // Crear escalones principales
  const stairOffset = -ROOM.d/2 + (5.0 - 0.025) + stairLength/2;
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

  // Altura final del segundo piso
  const secondFloorHeight = totalSteps * stepHeight;
  const finalBalconyHeight = secondFloorHeight;

  // Variables para balcón
  const balconyWidth = 5.0;
  const balconyThickness = 0.1;
  const leftStairGroup = new THREE.Group(); 
  const rightStairGroup = new THREE.Group();

  // ====== Balcón Perimetral ======
  const balconyGroup = new THREE.Group();

  // Balcón frontal completo
  const frontBalconyGeometry = new THREE.BoxGeometry(ROOM.w, balconyThickness, balconyWidth);
  const frontBalcony = new THREE.Mesh(frontBalconyGeometry, frontBackBalconyMaterial);
  frontBalcony.position.set(0, finalBalconyHeight, ROOM.d/2 - balconyWidth/2);
  frontBalcony.castShadow = true;
  frontBalcony.receiveShadow = true;
  balconyGroup.add(frontBalcony);

  // Balcón trasero completo
  const backBalcony = new THREE.Mesh(frontBalconyGeometry, frontBackBalconyMaterial);
  backBalcony.position.set(0, finalBalconyHeight, -ROOM.d/2 + balconyWidth/2);
  backBalcony.castShadow = true;
  backBalcony.receiveShadow = true;
  balconyGroup.add(backBalcony);

  // Balcón izquierdo
  const leftBalconyGeometry = new THREE.BoxGeometry(balconyWidth, balconyThickness, ROOM.d - balconyWidth*2);
  const leftBalcony = new THREE.Mesh(leftBalconyGeometry, balconyMaterial);
  leftBalcony.position.set(-ROOM.w/2 + balconyWidth/2, finalBalconyHeight, 0);
  leftBalcony.castShadow = true;
  leftBalcony.receiveShadow = true;
  balconyGroup.add(leftBalcony);

  // Balcón derecho
  const rightBalcony = new THREE.Mesh(leftBalconyGeometry, balconyMaterial);
  rightBalcony.position.set(ROOM.w/2 - balconyWidth/2, finalBalconyHeight, 0);
  rightBalcony.castShadow = true;
  rightBalcony.receiveShadow = true;
  balconyGroup.add(rightBalcony);

  // ======== Barandillas ========
  const railingHeight = 1.2;
  const railingThickness = 0.05;

  // Barandillas exteriores
  balconyGroup.add(createRailing(ROOM.w, railingThickness, 0, finalBalconyHeight + balconyThickness, ROOM.d/2 - railingThickness/2, railingMaterial, railingHeight));
  balconyGroup.add(createRailing(ROOM.w, railingThickness, 0, finalBalconyHeight + balconyThickness, -ROOM.d/2 + railingThickness/2, railingMaterial, railingHeight));
  balconyGroup.add(createRailing(railingThickness, ROOM.d - railingThickness*2, -ROOM.w/2 + railingThickness/2, finalBalconyHeight + balconyThickness, 0, railingMaterial, railingHeight));
  balconyGroup.add(createRailing(railingThickness, ROOM.d - railingThickness*2, ROOM.w/2 - railingThickness/2, finalBalconyHeight + balconyThickness, 0, railingMaterial, railingHeight));

  // Barandillas interiores
  const innerRailingOffset = balconyWidth - railingThickness/2;
  balconyGroup.add(createRailing(ROOM.w - balconyWidth*2, railingThickness, 0, finalBalconyHeight + balconyThickness, ROOM.d/2 - innerRailingOffset, railingMaterial, railingHeight));
  
  const stairGapWidth = 3;
  balconyGroup.add(createRailingWithGap(ROOM.w - balconyWidth*2, railingThickness, stairGapWidth, 0, finalBalconyHeight + balconyThickness, -ROOM.d/2 + innerRailingOffset, railingMaterial, railingHeight));
  
  balconyGroup.add(createRailing(railingThickness, ROOM.d - balconyWidth*2, -ROOM.w/2 + innerRailingOffset, finalBalconyHeight + balconyThickness, 0, railingMaterial, railingHeight));
  balconyGroup.add(createRailing(railingThickness, ROOM.d - balconyWidth*2, ROOM.w/2 - innerRailingOffset, finalBalconyHeight + balconyThickness, 0, railingMaterial, railingHeight));

  // Agregar todo al grupo principal
  secondFloorGroup.add(stairGroup);
  secondFloorGroup.add(leftStairGroup);
  secondFloorGroup.add(rightStairGroup);
  secondFloorGroup.add(balconyGroup);

  // Agregar a la escena
  scene.add(secondFloorGroup);

  // ======== Iluminación Segunda Planta ========
  const secondFloorMainLight = new THREE.SpotLight(0xffffff, 1.8, 50, Math.PI/4, 0.3, 1.2);
  secondFloorMainLight.position.set(0, finalBalconyHeight + 4, 0);
  secondFloorMainLight.target.position.set(0, finalBalconyHeight, 0);
  secondFloorMainLight.castShadow = true;
  scene.add(secondFloorMainLight);
  scene.add(secondFloorMainLight.target);

  // Luces para escaleras
  const balconyLights = [];
  const platformSize = 4;
  const sideStairSteps = 0;
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

  const stairEndLight = new THREE.SpotLight(0xffffff, 2.0, 12, Math.PI/6, 0.2, 0.8);
  stairEndLight.position.set(0, secondFloorHeight + 3, stairOffset + stairLength/2 - stepDepth);
  stairEndLight.target.position.set(0, secondFloorHeight, stairOffset + stairLength/2 - stepDepth);
  stairEndLight.castShadow = true;
  balconyLights.push(stairEndLight);

  // Luces de esquinas
  const cornerPlatformLights = [];

  const frontLeftCornerLight = new THREE.SpotLight(0xffffff, 1.2, 12, Math.PI/4, 0.3, 0.5);
  frontLeftCornerLight.position.set(-ROOM.w/2 + balconyWidth/2, ROOM.h - 1, ROOM.d/2 - balconyWidth/2);
  frontLeftCornerLight.target.position.set(-ROOM.w/2 + balconyWidth/2, finalBalconyHeight, ROOM.d/2 - balconyWidth/2);
  frontLeftCornerLight.castShadow = true;
  cornerPlatformLights.push(frontLeftCornerLight);

  const frontRightCornerLight = new THREE.SpotLight(0xffffff, 1.2, 12, Math.PI/4, 0.3, 0.5);
  frontRightCornerLight.position.set(ROOM.w/2 - balconyWidth/2, ROOM.h - 1, ROOM.d/2 - balconyWidth/2);
  frontRightCornerLight.target.position.set(ROOM.w/2 - balconyWidth/2, finalBalconyHeight, ROOM.d/2 - balconyWidth/2);
  frontRightCornerLight.castShadow = true;
  cornerPlatformLights.push(frontRightCornerLight);

  const backLeftCornerLight = new THREE.SpotLight(0xffffff, 1.2, 12, Math.PI/4, 0.3, 0.5);
  backLeftCornerLight.position.set(-ROOM.w/2 + balconyWidth/2, ROOM.h - 1, -ROOM.d/2 + balconyWidth/2);
  backLeftCornerLight.target.position.set(-ROOM.w/2 + balconyWidth/2, finalBalconyHeight, -ROOM.d/2 + balconyWidth/2);
  backLeftCornerLight.castShadow = true;
  cornerPlatformLights.push(backLeftCornerLight);

  const backRightCornerLight = new THREE.SpotLight(0xffffff, 1.2, 12, Math.PI/4, 0.3, 0.5);
  backRightCornerLight.position.set(ROOM.w/2 - balconyWidth/2, ROOM.h - 1, -ROOM.d/2 + balconyWidth/2);
  backRightCornerLight.target.position.set(ROOM.w/2 - balconyWidth/2, finalBalconyHeight, -ROOM.d/2 + balconyWidth/2);
  backRightCornerLight.castShadow = true;
  cornerPlatformLights.push(backRightCornerLight);

  // Agregar luces a la escena
  balconyLights.forEach(light => {
    scene.add(light);
    scene.add(light.target);
    lamparasSpotLights.push(light);
  });

  cornerPlatformLights.forEach(light => {
    scene.add(light);
    scene.add(light.target);
    lamparasSpotLights.push(light);
  });

  lamparasSpotLights.push(secondFloorMainLight);

  console.log('✅ Escalera central y balcón perimetral creados');

  return {
    secondFloorGroup,
    finalBalconyHeight,
    balconyWidth,
    stairOffset,
    stairLength,
    stepDepth,
    stairWidth,
    stepHeight,
    totalSteps
  };
}

/**
 * Crea una barandilla con postes y rieles
 * @private
 */
function createRailing(width, depth, x, y, z, material, height) {
  const railingGroup = new THREE.Group();
  const railingThickness = 0.05;
  
  // Barandilla superior
  const topRailGeometry = new THREE.BoxGeometry(width, railingThickness, depth);
  const topRail = new THREE.Mesh(topRailGeometry, material);
  topRail.position.set(0, height - railingThickness/2, 0);
  railingGroup.add(topRail);
  
  // Barandilla inferior
  const bottomRail = new THREE.Mesh(topRailGeometry, material);
  bottomRail.position.set(0, railingThickness/2, 0);
  railingGroup.add(bottomRail);
  
  // Postes verticales
  const numPosts = Math.floor(Math.max(width, depth) / 1.5) + 1;
  for (let i = 0; i < numPosts; i++) {
    const postGeometry = new THREE.BoxGeometry(railingThickness, height, railingThickness);
    const post = new THREE.Mesh(postGeometry, material);
    
    if (width > depth) {
      post.position.set(-width/2 + (width/(numPosts-1)) * i, height/2, 0);
    } else {
      post.position.set(0, height/2, -depth/2 + (depth/(numPosts-1)) * i);
    }
    
    railingGroup.add(post);
  }
  
  railingGroup.position.set(x, y, z);
  return railingGroup;
}

/**
 * Crea una barandilla con hueco central para la escalera
 * @private
 */
function createRailingWithGap(width, depth, gapWidth, x, y, z, material, height) {
  const railingGroup = new THREE.Group();
  
  const sideWidth = (width - gapWidth) / 2;
  
  if (sideWidth > 0) {
    const leftRailing = createRailing(sideWidth, depth, -gapWidth/2 - sideWidth/2, 0, 0, material, height);
    railingGroup.add(leftRailing);
    
    const rightRailing = createRailing(sideWidth, depth, gapWidth/2 + sideWidth/2, 0, 0, material, height);
    railingGroup.add(rightRailing);
  }
  
  railingGroup.position.set(x, y, z);
  return railingGroup;
}
