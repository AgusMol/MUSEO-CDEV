import * as THREE from 'three';

// Raycaster y estado
const raycaster = new THREE.Raycaster();
let camera = null;
let interactables = [];
let labelElement = null;
let panelElement = null;
let checkInterruptor = null;

// Panel elements
let artTitle = null;
let artAuthor = null;
let artDesc = null;
let closeBtn = null;

export function initRaycast(cam, interactableObjects, options = {}) {
  camera = cam;
  interactables = interactableObjects;
  checkInterruptor = options.checkInterruptor || (() => false);
  
  labelElement = document.getElementById('label');
  panelElement = document.getElementById('art-info');
  artTitle = document.getElementById('art-title');
  artAuthor = document.getElementById('art-author');
  artDesc = document.getElementById('art-desc');
  closeBtn = document.getElementById('close-info');
  
  if (closeBtn) {
    closeBtn.onclick = () => panelElement.classList.add('hidden');
  }
  
  console.log('🎯 Raycast inicializado');
}

// Función para verificar proximidad a un objeto
function isNearObject(object, maxDistance = 2.5) {
  if (!object || !camera) return false;
  
  // Obtener posición mundial del objeto
  const objectWorldPos = new THREE.Vector3();
  object.getWorldPosition(objectWorldPos);
  
  // Calcular distancia a la cámara
  const distance = camera.position.distanceTo(objectWorldPos);
  return distance <= maxDistance;
}

export function getFocusedArt() {
  if (!camera || !raycaster) return null;
  
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

export function tryOpenInfo(){
  const obj = getFocusedArt();
  if (!obj || !obj.userData || !obj.userData.title) return;
  showInfo(obj.userData.title, obj.userData.desc);
}

export function updateAimLabel(getLightSwitchState){
  if (!labelElement) return;
  
  // Verificar si está mirando al interruptor primero
  if (checkInterruptor && checkInterruptor()) {
    const estado = getLightSwitchState ? (getLightSwitchState() ? "apagar" : "prender") : "interactuar con";
    labelElement.textContent = `E: ${estado.charAt(0).toUpperCase() + estado.slice(1)} luces del museo`;
    labelElement.classList.add('show');
    return;
  }
  
  // Si no está mirando al interruptor, verificar obras
  const obj = getFocusedArt();
  if (obj && obj.userData && obj.userData.title){
    labelElement.textContent = `E: Ver "${obj.userData.title}"`;
    labelElement.classList.add('show');
  } else {
    labelElement.classList.remove('show');
  }
}

export function showInfo(title, desc){
  if (!panelElement || !artTitle || !artAuthor || !artDesc) return;
  
  // Separar autor/año de la descripción
  const parts = desc.split('\n\n');
  
  // Verificar si hay información de autor (formato "Autor · Año")
  const hasAuthor = parts.length > 1 && parts[0].includes('·');
  
  if (hasAuthor) {
    // Es un cuadro - mostrar autor y descripción por separado
    const authorInfo = parts[0]; // "Autor · Año"
    const description = parts[1]; // Descripción completa
    
    artTitle.textContent = title;
    artAuthor.textContent = authorInfo;
    artAuthor.style.display = 'block';
    artDesc.textContent = description;
  } else {
    // Es una vitrina - solo mostrar descripción (sin autor)
    artTitle.textContent = title;
    artAuthor.style.display = 'none';
    artDesc.textContent = desc;
  }
  
  panelElement.classList.remove('hidden');
}

export function getRaycaster() {
  return raycaster;
}
