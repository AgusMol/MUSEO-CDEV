import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Array global de rope barriers
const ropeBarriers = [];
let baseModel = null;

/**
 * Inicializa las rope barriers en las posiciones especificadas
 * @param {THREE.Scene} scene - Escena de Three.js
 * @param {Array} positions - Array de posiciones {x, y, z, rotX?, rotY?, rotZ?}
 * @returns {Promise} Promesa que resuelve cuando todas las barreras están cargadas
 */
export function initRopeBarriers(scene, positions) {
  return new Promise((resolve, reject) => {
    const gltfLoader = new GLTFLoader();
    
    gltfLoader.load(
      './assets/models/vip_rope_barrier/scene.gltf',
      function(gltf) {
        console.log('✅ Rope barrier GLTF base cargado exitosamente');
        baseModel = gltf.scene;
        
        // Crear las instancias de rope barriers
        positions.forEach((position, index) => {
          const barrier = createRopeBarrier(scene, gltf.scene, position, index);
          ropeBarriers.push(barrier);
        });
        
        console.log(`✅ Todas las ${positions.length} rope barriers han sido creadas exitosamente`);
        resolve(ropeBarriers);
      },
      function(progress) {
        const percent = (progress.loaded / progress.total * 100).toFixed(1);
        console.log(`📦 Cargando rope barrier: ${percent}%`);
      },
      function(error) {
        console.error('❌ Error cargando rope barriers:', error);
        
        // Crear barreras simples de emergencia
        positions.forEach((position, index) => {
          const emergencyBarrier = createEmergencyBarrier(scene, position, index);
          ropeBarriers.push(emergencyBarrier);
        });
        
        reject(error);
      }
    );
  });
}

/**
 * Crea una instancia de rope barrier
 * @private
 */
function createRopeBarrier(scene, baseModel, position, index) {
  console.log(`✅ Creando rope barrier ${index + 1} en posición:`, position);
  
  // Clonar el modelo base
  const ropeBarrier = baseModel.clone();
  
  // Debug: Imprimir información del modelo
  console.log(`🔍 Rope barrier ${index + 1} cargada - Info del modelo:`, ropeBarrier);
  console.log(`🔍 Children count:`, ropeBarrier.children.length);
  
  // Posicionar con escala pequeña
  ropeBarrier.position.set(position.x, position.y, position.z);
  ropeBarrier.scale.set(0.01, 0.01, 0.01);
  
  // Aplicar rotación si está especificada
  if (position.rotX !== undefined) ropeBarrier.rotation.x = position.rotX;
  if (position.rotY !== undefined) ropeBarrier.rotation.y = position.rotY;
  if (position.rotZ !== undefined) ropeBarrier.rotation.z = position.rotZ;
  
  // Calcular bounding box después de escalar
  ropeBarrier.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(ropeBarrier);
  console.log(`📏 Bounding box del modelo ${index + 1}:`, box);
  console.log(`📏 Tamaño del modelo ${index + 1} escalado:`, {
    width: box.max.x - box.min.x,
    height: box.max.y - box.min.y,
    depth: box.max.z - box.min.z
  });
  
  // Aplicar materiales visibles a todos los meshes
  let meshCount = 0;
  ropeBarrier.traverse((child) => {
    console.log(`🔍 Procesando child en barrier ${index + 1}:`, child.type, child.name || 'Sin nombre');
    
    if (child.isMesh) {
      meshCount++;
      child.castShadow = true;
      child.receiveShadow = true;
      child.visible = true;
      child.frustumCulled = false;
      
      if (child.material) {
        // Clonar el material para evitar referencias compartidas
        child.material = child.material.clone();
        child.material.transparent = false;
        child.material.opacity = 1.0;
        child.material.visible = true;
        child.material.needsUpdate = true;
        
        // Simplificar materiales problemáticos que causan errores de shader
        if (child.material.name && (child.material.name.includes('Material__2') || child.material.name.includes('Material__3') || child.material.name.includes('Material__4'))) {
          if (child.material.name.includes('Material__2')) {
            console.log(`🔧 Simplificando material Material__2 para barrier ${index + 1}`);
            child.material = new THREE.MeshStandardMaterial({
              color: 0x8B0000,
              roughness: 0.7,
              metalness: 0.0,
              emissive: 0x220000
            });
          } else if (child.material.name.includes('Material__3')) {
            console.log(`🔧 Simplificando material Material__3 para barrier ${index + 1}`);
            child.material = new THREE.MeshStandardMaterial({
              color: 0x2C2C2C,
              roughness: 0.2,
              metalness: 0.9,
              emissive: 0x111111
            });
          } else if (child.material.name.includes('Material__4')) {
            console.log(`🔧 Simplificando material Material__4 para barrier ${index + 1}`);
            child.material = new THREE.MeshStandardMaterial({
              color: 0xFFD700,
              roughness: 0.1,
              metalness: 0.95,
              emissive: 0x332200
            });
          }
        }
        
        if (child.geometry) {
          child.geometry.computeBoundingBox();
          child.geometry.computeBoundingSphere();
        }
      }
    }
  });
  
  console.log(`📊 Total de meshes procesados: ${meshCount}`);
  
  // Forzar visibilidad del objeto raíz
  ropeBarrier.visible = true;
  ropeBarrier.frustumCulled = false;
  ropeBarrier.matrixAutoUpdate = true;
  ropeBarrier.updateMatrix();
  ropeBarrier.updateMatrixWorld(true);
  
  // Agregar a la escena
  scene.add(ropeBarrier);
  
  console.log(`✅ VIP rope barrier ${index + 1} agregada al museo en posición (${position.x}, ${position.y}, ${position.z}) con rotación (${position.rotX || 0}, ${position.rotY || 0}, ${position.rotZ || 0})`);
  
  return ropeBarrier;
}

/**
 * Crea una barrera de emergencia (fallback si falla la carga del GLTF)
 * @private
 */
function createEmergencyBarrier(scene, position, index) {
  const emergencyBarrier = new THREE.Mesh(
    new THREE.BoxGeometry(2, 1, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x8B4513 })
  );
  
  emergencyBarrier.position.set(position.x, position.y + 0.5, position.z);
  emergencyBarrier.rotation.set(position.rotX || 0, position.rotY || 0, position.rotZ || 0);
  
  scene.add(emergencyBarrier);
  
  console.log(`🚨 Barrera de emergencia ${index + 1} creada en posición (${position.x}, ${position.y}, ${position.z}) con rotación (${position.rotX || 0}, ${position.rotY || 0}, ${position.rotZ || 0})`);
  
  return emergencyBarrier;
}

/**
 * Verifica colisión del jugador con las rope barriers
 * @param {Object} newPos - Posición nueva del jugador {x, y, z}
 * @param {number} balconyHeight - Altura del balcón (solo colisionar en planta baja)
 * @returns {boolean} true si hay colisión, false si no
 */
export function checkRopeBarrierCollision(newPos, balconyHeight = 4.6) {
  const playerRadius = 0.08;
  
  // Verificar que hay rope barriers cargadas
  if (!ropeBarriers || ropeBarriers.length === 0) {
    return false;
  }
  
  // Solo colisionar en la planta baja
  if (newPos.y < balconyHeight - 0.2) {
    
    // Verificar colisión con cada rope barrier
    for (let i = 0; i < ropeBarriers.length; i++) {
      const currentBarrier = ropeBarriers[i];
      
      if (!currentBarrier) continue;
      
      // Obtener la posición real de esta rope barrier después de todas las transformaciones
      currentBarrier.updateMatrixWorld(true);
      
      // Calcular el bounding box en el espacio mundial
      const boundingBox = new THREE.Box3().setFromObject(currentBarrier);
      const center = boundingBox.getCenter(new THREE.Vector3());
      const size = boundingBox.getSize(new THREE.Vector3());
      
      // Usar el centro del bounding box como posición real
      const ropePos = {
        x: center.x,
        y: center.y, 
        z: center.z
      };
      
      // Usar las dimensiones reales del bounding box (escaladas)
      const ropeSize = { 
        x: Math.max(size.x, 0.5), // Al menos 50cm de ancho
        z: Math.max(size.z, 0.3)  // Al menos 30cm de profundidad
      };
      
      const dx = Math.abs(newPos.x - ropePos.x);
      const dz = Math.abs(newPos.z - ropePos.z);
      
      // Debug console.log para ver qué está pasando (solo para la primera barrera)
      if (i === 0) {
        console.log('=== ROPE BARRIERS COLLISION DEBUG ===');
        console.log(`Checking ${ropeBarriers.length} rope barriers`);
        console.log('Player Y:', newPos.y, 'Balcony height:', balconyHeight);
        console.log('Player pos:', newPos.x.toFixed(2), newPos.z.toFixed(2));
        console.log(`Barrier ${i + 1} center pos:`, ropePos.x.toFixed(2), ropePos.z.toFixed(2));
        console.log(`Barrier ${i + 1} bounding box size:`, size.x.toFixed(4), 'x', size.z.toFixed(4));
        console.log(`Barrier ${i + 1} used collision size:`, ropeSize.x.toFixed(2), 'x', ropeSize.z.toFixed(2));
        console.log(`Barrier ${i + 1} Delta X:`, dx.toFixed(2), 'Delta Z:', dz.toFixed(2));
        console.log(`Barrier ${i + 1} X threshold:`, (ropeSize.x / 2 + playerRadius).toFixed(2));
        console.log(`Barrier ${i + 1} Z threshold:`, (ropeSize.z / 2 + playerRadius).toFixed(2));
      }
      
      if (dx < (ropeSize.x / 2 + playerRadius) && dz < (ropeSize.z / 2 + playerRadius)) {
        console.log(`>>> COLLISION DETECTED WITH BARRIER ${i + 1}! <<<`);
        return true;
      }
    }
    
    // Si llegamos aquí, no hubo colisión con ninguna barrera
    console.log('No collision with any barrier');
    console.log('=====================================');
  }
  
  return false;
}

/**
 * Obtiene el array de rope barriers cargadas
 * @returns {Array} Array de objetos THREE.Object3D
 */
export function getRopeBarriers() {
  return ropeBarriers;
}

/**
 * Obtiene la cantidad de rope barriers cargadas
 * @returns {number} Cantidad de barreras
 */
export function getRopeBarrierCount() {
  return ropeBarriers.length;
}
