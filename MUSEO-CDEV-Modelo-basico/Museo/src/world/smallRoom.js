import * as THREE from 'three';
import { createCeiling } from './lighting.js';

/**
 * Crea una sala pequeña detrás de la pared frontal de la sala principal,
 * con el mismo piso y paredes, y techo tipo principal (paneles y marcos).
 *
 * @param {THREE.Scene} scene
 * @param {{w:number,h:number,d:number}} ROOM - Dimensiones de la sala principal
 * @param {THREE.Material} wallMat - material de paredes (coherencia estética)
 * @param {THREE.Material} floorMaterial - material del piso parquet
 * @param {{w?:number,d?:number,h?:number,doorHeight?:number}} options
 * @returns {{ group: THREE.Group, dims: {w:number,h:number,d:number} }}
 */
export function createSmallRoom(scene, ROOM, wallMat, floorMaterial, options = {}) {
  const w = options.w ?? 8;
  const d = options.d ?? 8;
  const h = options.h ?? 3.0;
  const doorHeight = options.doorHeight ?? 2.0;

  const group = new THREE.Group();
  // Centrar la sala pequeña justo detrás de la pared frontal
  group.position.set(0, 0, ROOM.d/2 + d/2);
  scene.add(group);

  // Piso
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floorMaterial);
  floor.rotation.x = -Math.PI/2;
  floor.position.set(0, 0, 0);
  floor.receiveShadow = true;
  group.add(floor);


  // Materiales de la bandera
  const celeste = new THREE.MeshStandardMaterial({ 
    color: 0x6ec6f1, 
    side: THREE.DoubleSide
  });
  const blanco  = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    side: THREE.DoubleSide
  });
  const stripeH = h / 3;

  // === PARED FRONTAL (con bandera interior) ===
  // Verde hacia afuera (más lejos)
  const wallFrontGreen = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat);
  wallFrontGreen.position.set(0, h/2, d/2 + 0.05);
  
  // Bandera hacia adentro (más cerca)
  const wallFrontTopFlag = new THREE.Mesh(new THREE.PlaneGeometry(w, stripeH), celeste);
  wallFrontTopFlag.position.set(0, h - stripeH/2, d/2 - 0.05);
  
  const wallFrontMiddleFlag = new THREE.Mesh(new THREE.PlaneGeometry(w, stripeH), blanco);
  wallFrontMiddleFlag.position.set(0, h/2, d/2 - 0.05);
  
  const wallFrontBottomFlag = new THREE.Mesh(new THREE.PlaneGeometry(w, stripeH), celeste);
  wallFrontBottomFlag.position.set(0, stripeH/2, d/2 - 0.05);

  // === PARED IZQUIERDA (con bandera interior) ===
  // Verde hacia afuera (más lejos)
  const wallLeftGreen = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wallMat);
  wallLeftGreen.position.set(-w/2 - 0.05, h/2, 0);
  wallLeftGreen.rotation.y = Math.PI/2;
  
  // Bandera hacia adentro (más cerca)
  const wallLeftTopFlag = new THREE.Mesh(new THREE.PlaneGeometry(d, stripeH), celeste);
  wallLeftTopFlag.position.set(-w/2 + 0.05, h - stripeH/2, 0);
  wallLeftTopFlag.rotation.y = Math.PI/2;
  
  const wallLeftMiddleFlag = new THREE.Mesh(new THREE.PlaneGeometry(d, stripeH), blanco);
  wallLeftMiddleFlag.position.set(-w/2 + 0.05, h/2, 0);
  wallLeftMiddleFlag.rotation.y = Math.PI/2;
  
  const wallLeftBottomFlag = new THREE.Mesh(new THREE.PlaneGeometry(d, stripeH), celeste);
  wallLeftBottomFlag.position.set(-w/2 + 0.05, stripeH/2, 0);
  wallLeftBottomFlag.rotation.y = Math.PI/2;

  // === PARED DERECHA (con bandera interior) ===
  // Verde hacia afuera (más lejos)
  const wallRightGreen = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wallMat);
  wallRightGreen.position.set(w/2 + 0.05, h/2, 0);
  wallRightGreen.rotation.y = -Math.PI/2;
  
  // Bandera hacia adentro (más cerca)
  const wallRightTopFlag = new THREE.Mesh(new THREE.PlaneGeometry(d, stripeH), celeste);
  wallRightTopFlag.position.set(w/2 - 0.05, h - stripeH/2, 0);
  wallRightTopFlag.rotation.y = -Math.PI/2;
  
  const wallRightMiddleFlag = new THREE.Mesh(new THREE.PlaneGeometry(d, stripeH), blanco);
  wallRightMiddleFlag.position.set(w/2 - 0.05, h/2, 0);
  wallRightMiddleFlag.rotation.y = -Math.PI/2;
  
  const wallRightBottomFlag = new THREE.Mesh(new THREE.PlaneGeometry(d, stripeH), celeste);
  wallRightBottomFlag.position.set(w/2 - 0.05, stripeH/2, 0);
  wallRightBottomFlag.rotation.y = -Math.PI/2;

  // === PARED TRASERA CON PUERTA Y BANDERA ===
  const doorW = 2.2;
  const doorH = doorHeight;
  const sideWallWidth = (w - doorW) / 2;
  
  // Paredes laterales de la puerta (verde hacia salón principal)
  const wallBackLeftGreen = new THREE.Mesh(new THREE.PlaneGeometry(sideWallWidth, h), wallMat);
  wallBackLeftGreen.position.set(-w/2 + sideWallWidth/2, h/2, -d/2);
  wallBackLeftGreen.rotation.y = Math.PI;
  
  const wallBackRightGreen = new THREE.Mesh(new THREE.PlaneGeometry(sideWallWidth, h), wallMat);
  wallBackRightGreen.position.set(w/2 - sideWallWidth/2, h/2, -d/2);
  wallBackRightGreen.rotation.y = Math.PI;
  
  // Parte superior sobre la puerta (verde hacia salón)
  const upperWallHeight = h - doorH;
  const wallBackUpperGreen = new THREE.Mesh(new THREE.PlaneGeometry(doorW, upperWallHeight), wallMat);
  wallBackUpperGreen.position.set(0, doorH + upperWallHeight/2, -d/2);
  wallBackUpperGreen.rotation.y = Math.PI;
  
  // Bandera hacia adentro de la sala pequeña - lado izquierdo
  const wallBackLeftTopFlag = new THREE.Mesh(new THREE.PlaneGeometry(sideWallWidth, stripeH), celeste);
  wallBackLeftTopFlag.position.set(-w/2 + sideWallWidth/2, h - stripeH/2, -d/2 + 0.01);
  
  const wallBackLeftMiddleFlag = new THREE.Mesh(new THREE.PlaneGeometry(sideWallWidth, stripeH), blanco);
  wallBackLeftMiddleFlag.position.set(-w/2 + sideWallWidth/2, h/2, -d/2 + 0.01);
  
  const wallBackLeftBottomFlag = new THREE.Mesh(new THREE.PlaneGeometry(sideWallWidth, stripeH), celeste);
  wallBackLeftBottomFlag.position.set(-w/2 + sideWallWidth/2, stripeH/2, -d/2 + 0.01);
  
  // Bandera hacia adentro - lado derecho
  const wallBackRightTopFlag = new THREE.Mesh(new THREE.PlaneGeometry(sideWallWidth, stripeH), celeste);
  wallBackRightTopFlag.position.set(w/2 - sideWallWidth/2, h - stripeH/2, -d/2 + 0.01);
  
  const wallBackRightMiddleFlag = new THREE.Mesh(new THREE.PlaneGeometry(sideWallWidth, stripeH), blanco);
  wallBackRightMiddleFlag.position.set(w/2 - sideWallWidth/2, h/2, -d/2 + 0.01);
  
  const wallBackRightBottomFlag = new THREE.Mesh(new THREE.PlaneGeometry(sideWallWidth, stripeH), celeste);
  wallBackRightBottomFlag.position.set(w/2 - sideWallWidth/2, stripeH/2, -d/2 + 0.01);
  
  // Bandera hacia adentro - parte superior
  const wallBackUpperFlag = new THREE.Mesh(new THREE.PlaneGeometry(doorW, upperWallHeight), celeste);
  wallBackUpperFlag.position.set(0, doorH + upperWallHeight/2, -d/2 + 0.01);

  // === PUERTA SIMPLE ===
  const doorGroup = new THREE.Group();
  
  // Marco de la puerta (madera oscura)
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.8 });
  const frameThickness = 0.15;
  const frameDepth = 0.3;
  
  // Jambas (laterales) - empiezan desde el suelo (y=0)
  const leftJamb = new THREE.Mesh(
    new THREE.BoxGeometry(frameThickness, doorH, frameDepth),
    frameMat
  );
  leftJamb.position.set(-doorW/2, doorH/2, -d/2); // y = doorH/2 para que toque el suelo
  
  const rightJamb = new THREE.Mesh(
    new THREE.BoxGeometry(frameThickness, doorH, frameDepth),
    frameMat
  );
  rightJamb.position.set(doorW/2, doorH/2, -d/2);
  
  // Dintel (superior)
  const lintel = new THREE.Mesh(
    new THREE.BoxGeometry(doorW + frameThickness*2, frameThickness, frameDepth),
    frameMat
  );
  lintel.position.set(0, doorH, -d/2); // Justo arriba del marco
  
  // Puerta de madera clara (abierta hacia un lado, pegada a la pared)
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x8B6F47, roughness: 0.6 });
  const doorThickness = 0.05;
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(doorThickness, doorH - frameThickness, doorW - frameThickness*2),
    doorMat
  );
  // Puerta abierta 90 grados pegada a la pared izquierda, desde el suelo
  door.position.set(-doorW/2 - doorThickness/2, (doorH - frameThickness)/2, -d/2 + (doorW - frameThickness*2)/2);
  
  // Manija de la puerta
  const handleMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.8, roughness: 0.2 });
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.15, 8),
    handleMat
  );
  handle.rotation.x = Math.PI/2;
  handle.position.set(-doorW/2 - doorThickness - 0.08, 1.0, -d/2 + 0.5);
  
  doorGroup.add(leftJamb, rightJamb, lintel, door, handle);
  group.add(doorGroup);

  // Sol de Mayo en todas las paredes internas (centrado en franja blanca)
  const sunRadius = 0.4;
  const sunGeometry = new THREE.CircleGeometry(sunRadius, 32);
  const sunMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffd700,
    emissive: 0xffaa00,
    emissiveIntensity: 0.8,
    side: THREE.DoubleSide
  });

  // Sol en pared frontal (centrado en franja blanca)
  const sunFront = new THREE.Mesh(sunGeometry.clone(), sunMaterial);
  sunFront.position.set(0, h/2, d/2 - 0.06);
  sunFront.rotation.y = Math.PI;

  // Sol en pared izquierda
  const sunLeftWall = new THREE.Mesh(sunGeometry.clone(), sunMaterial);
  sunLeftWall.position.set(-w/2 + 0.06, h/2, 0);
  sunLeftWall.rotation.y = -Math.PI/2;

  // Sol en pared derecha
  const sunRightWall = new THREE.Mesh(sunGeometry.clone(), sunMaterial);
  sunRightWall.position.set(w/2 - 0.06, h/2, 0);
  sunRightWall.rotation.y = Math.PI/2;

  // Sol en el lado izquierdo de la puerta (pared trasera)
  const sunLeft = new THREE.Mesh(sunGeometry.clone(), sunMaterial);
  sunLeft.position.set(-w/2 + sideWallWidth/2, h/2, -d/2 + 0.06);

  // Sol en el lado derecho de la puerta (pared trasera)
  const sunRight = new THREE.Mesh(sunGeometry.clone(), sunMaterial);
  sunRight.position.set(w/2 - sideWallWidth/2, h/2, -d/2 + 0.06);

  // Rayos del sol (más prominentes)
  function createRays(x, y, z, rotY) {
    const rayGroup = new THREE.Group();
    const numRays = 32;
    for (let i = 0; i < numRays; i++) {
      const rayLength = i % 2 === 0 ? sunRadius * 1.8 : sunRadius * 1.4;
      const rayGeometry = new THREE.PlaneGeometry(0.08, rayLength);
      const ray = new THREE.Mesh(rayGeometry, sunMaterial);
      const angle = (i / numRays) * Math.PI * 2;
      ray.rotation.z = angle;
      rayGroup.add(ray);
    }
    rayGroup.position.set(x, y, z);
    rayGroup.rotation.y = rotY;
    return rayGroup;
  }

  const raysLeft = createRays(-w/2 + sideWallWidth/2, h/2, -d/2 + 0.07, 0);
  const raysRight = createRays(w/2 - sideWallWidth/2, h/2, -d/2 + 0.07, 0);
  const raysFront = createRays(0, h/2, d/2 - 0.07, Math.PI);
  const raysLeftWall = createRays(-w/2 + 0.07, h/2, 0, -Math.PI/2);
  const raysRightWall = createRays(w/2 - 0.07, h/2, 0, Math.PI/2);

  group.add(
    // Paredes verdes (exteriores)
    wallFrontGreen, wallLeftGreen, wallRightGreen,
    // Paredes con bandera (interiores)
    wallFrontTopFlag, wallFrontMiddleFlag, wallFrontBottomFlag,
    wallLeftTopFlag, wallLeftMiddleFlag, wallLeftBottomFlag,
    wallRightTopFlag, wallRightMiddleFlag, wallRightBottomFlag,
    // Pared trasera con puerta - lado verde (hacia salón)
    wallBackLeftGreen, wallBackRightGreen, wallBackUpperGreen,
    // Pared trasera con puerta - lado bandera (hacia sala pequeña)
    wallBackLeftTopFlag, wallBackLeftMiddleFlag, wallBackLeftBottomFlag,
    wallBackRightTopFlag, wallBackRightMiddleFlag, wallBackRightBottomFlag,
    wallBackUpperFlag,
    // Soles y rayos en todas las paredes
    sunFront, sunLeftWall, sunRightWall, sunLeft, sunRight,
    raysFront, raysLeftWall, raysRightWall, raysLeft, raysRight
  );

  // Techo: usar createCeiling alineado con la altura del hueco
  const CEIL = { w, d, h: doorHeight + 0.41 };
  createCeiling(group, CEIL);

  return { group, dims: { w, h, d } };
}
