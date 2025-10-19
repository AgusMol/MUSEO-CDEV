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
  const doorHeight = options.doorHeight ?? 2.3;

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


  // Helper de pared con color personalizado
  // Bandera argentina: celeste (arriba), blanco (centro), celeste (abajo)
  const celeste = new THREE.MeshStandardMaterial({ color: 0x6ec6f1 });
  const blanco  = new THREE.MeshStandardMaterial({ color: 0xffffff });
  // Proporciones: 1/3 celeste arriba, 1/3 blanco centro, 1/3 celeste abajo
  const stripeH = h / 3;

  // Pared frontal
  const wallFrontTop    = new THREE.Mesh(new THREE.BoxGeometry(w, stripeH, 0.3), celeste);
  wallFrontTop.position.set(0, h - stripeH/2, d/2);
  const wallFrontMiddle = new THREE.Mesh(new THREE.BoxGeometry(w, stripeH, 0.3), blanco);
  wallFrontMiddle.position.set(0, h/2, d/2);
  const wallFrontBottom = new THREE.Mesh(new THREE.BoxGeometry(w, stripeH, 0.3), celeste);
  wallFrontBottom.position.set(0, stripeH/2, d/2);

  // Pared izquierda
  const wallLeftTop    = new THREE.Mesh(new THREE.BoxGeometry(0.3, stripeH, d), celeste);
  wallLeftTop.position.set(-w/2, h - stripeH/2, 0);
  const wallLeftMiddle = new THREE.Mesh(new THREE.BoxGeometry(0.3, stripeH, d), blanco);
  wallLeftMiddle.position.set(-w/2, h/2, 0);
  const wallLeftBottom = new THREE.Mesh(new THREE.BoxGeometry(0.3, stripeH, d), celeste);
  wallLeftBottom.position.set(-w/2, stripeH/2, 0);

  // Pared derecha
  const wallRightTop    = new THREE.Mesh(new THREE.BoxGeometry(0.3, stripeH, d), celeste);
  wallRightTop.position.set(w/2, h - stripeH/2, 0);
  const wallRightMiddle = new THREE.Mesh(new THREE.BoxGeometry(0.3, stripeH, d), blanco);
  wallRightMiddle.position.set(w/2, h/2, 0);
  const wallRightBottom = new THREE.Mesh(new THREE.BoxGeometry(0.3, stripeH, d), celeste);
  wallRightBottom.position.set(w/2, stripeH/2, 0);

  group.add(
    wallFrontTop, wallFrontMiddle, wallFrontBottom,
    wallLeftTop, wallLeftMiddle, wallLeftBottom,
    wallRightTop, wallRightMiddle, wallRightBottom
  );

  // Techo: usar createCeiling alineado con la altura del hueco
  const CEIL = { w, d, h: doorHeight + 0.41 };
  createCeiling(group, CEIL);

  return { group, dims: { w, h, d } };
}
