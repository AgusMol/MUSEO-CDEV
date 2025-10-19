import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Estado del interruptor
let interruptorModel = null;
let interruptorOn = true;

/**
 * Inicializa el interruptor de luz en la escena
 * @param {THREE.Scene} scene - Escena de Three.js
 * @param {Object} position - Posición del interruptor {x, y, z}
 * @param {Object} options - Opciones adicionales {scale, rotation}
 * @returns {Promise} Promesa que resuelve cuando el modelo está cargado
 */
export function initLightSwitch(scene, position = {x: 0, y: 1.5, z: 0}, options = {}) {
  const {
    scale = 3,
    rotation = { x: 0, y: Math.PI, z: 0 }
  } = options;

  return new Promise((resolve, reject) => {
    const gltfLoader = new GLTFLoader();
    
    gltfLoader.load(
      './assets/models/light_switch/scene.gltf',
      function(gltf) {
        interruptorModel = gltf.scene;
        
        // Posicionar el interruptor
        interruptorModel.position.set(position.x, position.y, position.z);
        interruptorModel.scale.set(scale, scale, scale);
        
        // Aplicar rotación
        interruptorModel.rotation.x = rotation.x;
        interruptorModel.rotation.y = rotation.y;
        interruptorModel.rotation.z = rotation.z;
        
        // Simplificar materiales para evitar errores de shader
        interruptorModel.traverse(function(child) {
          if (child.isMesh) {
            const simpleMaterial = new THREE.MeshStandardMaterial({
              color: 0xf0f0f0,
              metalness: 0.1,
              roughness: 0.7
            });
            child.material = simpleMaterial;
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        scene.add(interruptorModel);
        console.log('✅ Interruptor GLTF cargado con materiales simplificados');
        
        resolve(interruptorModel);
      },
      undefined,
      function(error) {
        console.error('❌ Error cargando el interruptor:', error);
        reject(error);
      }
    );
  });
}

/**
 * Anima el estado del interruptor (cambio visual si es necesario)
 */
export function animateSwitch() {
  if (!interruptorModel) return;
  interruptorOn = !interruptorOn;
  // Ya no se rota el modelo ni la palanca
}

/**
 * Obtiene el modelo del interruptor
 * @returns {THREE.Object3D|null}
 */
export function getLightSwitchModel() {
  return interruptorModel;
}

/**
 * Obtiene el estado actual del interruptor
 * @returns {boolean} true si está encendido, false si está apagado
 */
export function getLightSwitchState() {
  return interruptorOn;
}

/**
 * Cambia el estado del interruptor
 * @param {boolean} state - Nuevo estado del interruptor
 */
export function setLightSwitchState(state) {
  interruptorOn = state;
  animateSwitch();
}

/**
 * Alterna el estado del interruptor
 * @returns {boolean} Nuevo estado después de alternar
 */
export function toggleLightSwitch() {
  interruptorOn = !interruptorOn;
  animateSwitch();
  return interruptorOn;
}
