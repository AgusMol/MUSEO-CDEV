import * as THREE from 'three';

/**
 * Verifica colisión del jugador con las vitrinas
 * @param {Object} newPos - Nueva posición del jugador {x, y, z}
 * @param {Object} vitrinas - Objeto con referencias a todas las vitrinas
 * @param {number} finalBalconyHeight - Altura del balcón
 * @returns {boolean} true si hay colisión
 */
export function checkVitrinaCollision(newPos, vitrinas, finalBalconyHeight) {
  const playerRadius = 0.08;
  
  // Solo colisionar en planta baja
  if (newPos.y < finalBalconyHeight - 0.2) {
    // Vitrina 1 (Jabulani)
    if (vitrinas.vitrina1) {
      const vitrina1Pos = vitrinas.vitrina1.position;
      const vitrina1Size = { x: 0.7, z: 0.7 };
      const dx1 = Math.abs(newPos.x - vitrina1Pos.x);
      const dz1 = Math.abs(newPos.z - vitrina1Pos.z);
      if (dx1 < (vitrina1Size.x / 2 + playerRadius) && dz1 < (vitrina1Size.z / 2 + playerRadius)) {
        return true;
      }
    }
    
    // Vitrina 2 (Trofeo Copa del Mundo)
    if (vitrinas.vitrina2) {
      const vitrina2Pos = vitrinas.vitrina2.position;
      const vitrina2Size = { x: 0.7, z: 0.7 };
      const dx2 = Math.abs(newPos.x - vitrina2Pos.x);
      const dz2 = Math.abs(newPos.z - vitrina2Pos.z);
      if (dx2 < (vitrina2Size.x / 2 + playerRadius) && dz2 < (vitrina2Size.z / 2 + playerRadius)) {
        return true;
      }
    }
    
    // Vitrina 3 (Copa Libertadores)
    if (vitrinas.vitrina3) {
      const vitrina3Pos = vitrinas.vitrina3.position;
      const vitrina3Size = { x: 0.7, z: 0.7 };
      const dx3 = Math.abs(newPos.x - vitrina3Pos.x);
      const dz3 = Math.abs(newPos.z - vitrina3Pos.z);
      if (dx3 < (vitrina3Size.x / 2 + playerRadius) && dz3 < (vitrina3Size.z / 2 + playerRadius)) {
        return true;
      }
    }
    
    // Vitrina 4 (Copa América)
    if (vitrinas.vitrina4) {
      const vitrina4Pos = vitrinas.vitrina4.position;
      const vitrina4Size = { x: 0.7, z: 0.7 };
      const dx4 = Math.abs(newPos.x - vitrina4Pos.x);
      const dz4 = Math.abs(newPos.z - vitrina4Pos.z);
      if (dx4 < (vitrina4Size.x / 2 + playerRadius) && dz4 < (vitrina4Size.z / 2 + playerRadius)) {
        return true;
      }
    }
    
    // Vitrina 5 (Copa del Mundo - Duplicado 1)
    if (vitrinas.vitrina5) {
      const vitrina5Pos = vitrinas.vitrina5.position;
      const vitrina5Size = { x: 0.7, z: 0.7 };
      const dx5 = Math.abs(newPos.x - vitrina5Pos.x);
      const dz5 = Math.abs(newPos.z - vitrina5Pos.z);
      if (dx5 < (vitrina5Size.x / 2 + playerRadius) && dz5 < (vitrina5Size.z / 2 + playerRadius)) {
        return true;
      }
    }
    
    // Vitrina 6 (Copa del Mundo - Duplicado 2)
    if (vitrinas.vitrina6) {
      const vitrina6Pos = vitrinas.vitrina6.position;
      const vitrina6Size = { x: 0.7, z: 0.7 };
      const dx6 = Math.abs(newPos.x - vitrina6Pos.x);
      const dz6 = Math.abs(newPos.z - vitrina6Pos.z);
      if (dx6 < (vitrina6Size.x / 2 + playerRadius) && dz6 < (vitrina6Size.z / 2 + playerRadius)) {
        return true;
      }
    }
  }

  // Vitrina central cilíndrica (suelo-techo)
  try {
    if (vitrinas.vitrinaTall && vitrinas.tallRadius) {
      const tallCenter = vitrinas.vitrinaTall.position;
      const dxTall = newPos.x - tallCenter.x;
      const dzTall = newPos.z - tallCenter.z;
      const distXZ = Math.sqrt(dxTall * dxTall + dzTall * dzTall);
      const padding = 0.25;
      if (distXZ < (vitrinas.tallRadius + playerRadius + padding)) {
        return true;
      }
    }
  } catch(e) {
    console.warn('checkVitrinaCollision: error comprobando vitrina central', e);
  }

  return false;
}

/**
 * Verifica colisión con las barandillas del segundo piso
 * @param {Object} newPos - Nueva posición del jugador {x, y, z}
 * @param {number} finalBalconyHeight - Altura del balcón
 * @param {Object} ROOM - Dimensiones de la sala
 * @param {number} balconyWidth - Ancho del balcón
 * @returns {boolean} true si hay colisión
 */
export function checkRailingCollision(newPos, finalBalconyHeight, ROOM, balconyWidth) {
  // Solo verificar si el jugador está en el segundo piso
  if (newPos.y < finalBalconyHeight - 1) {
    return false;
  }
  
  const playerRadius = 0.15;
  const railingThickness = 0.05;
  const innerRailingOffset = balconyWidth - railingThickness/2;
  
  // Posiciones de las barandas interiores
  const frontInnerRailingZ = ROOM.d/2 - innerRailingOffset;
  const backInnerRailingZ = -ROOM.d/2 + innerRailingOffset;
  const leftInnerRailingX = -ROOM.w/2 + innerRailingOffset;
  const rightInnerRailingX = ROOM.w/2 - innerRailingOffset;
  
  // Dimensiones de las barandas interiores
  const innerRailingWidth = ROOM.w - balconyWidth*2;
  const innerRailingDepth = ROOM.d - balconyWidth*2;
  const stairGapWidth = 3;
  
  // Barandilla frontal interior
  if (Math.abs(newPos.x) <= innerRailingWidth/2) {
    if (Math.abs(newPos.z - frontInnerRailingZ) < playerRadius) {
      return true;
    }
  }
  
  // Barandilla trasera interior (con hueco para escalera)
  if (Math.abs(newPos.x) > stairGapWidth/2 && Math.abs(newPos.x) <= innerRailingWidth/2) {
    if (Math.abs(newPos.z - backInnerRailingZ) < playerRadius) {
      return true;
    }
  }
  
  // Barandilla izquierda interior
  if (Math.abs(newPos.z) <= innerRailingDepth/2) {
    if (Math.abs(newPos.x - leftInnerRailingX) < playerRadius) {
      return true;
    }
  }
  
  // Barandilla derecha interior
  if (Math.abs(newPos.z) <= innerRailingDepth/2) {
    if (Math.abs(newPos.x - rightInnerRailingX) < playerRadius) {
      return true;
    }
  }
  
  return false;
}

/**
 * Inicializa el sistema de colisiones con todas las referencias necesarias
 * @param {Object} vitrinas - Referencias a todas las vitrinas
 * @param {number} finalBalconyHeight - Altura del balcón
 * @param {Object} ROOM - Dimensiones de la sala
 * @param {number} balconyWidth - Ancho del balcón
 * @returns {Object} Funciones de colisión configuradas
 */
export function initCollisionSystem(vitrinas, finalBalconyHeight, ROOM, balconyWidth) {
  return {
    checkVitrinas: (newPos) => checkVitrinaCollision(newPos, vitrinas, finalBalconyHeight),
    checkRailings: (newPos) => checkRailingCollision(newPos, finalBalconyHeight, ROOM, balconyWidth)
  };
}
