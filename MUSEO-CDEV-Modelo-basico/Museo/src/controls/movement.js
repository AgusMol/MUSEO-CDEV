import * as THREE from 'three';
import { getMoveState } from '../controls/input.js';

export function initMovement({ camera, ROOM, SMALL, DOOR, finalBalconyHeight, balconyWidth, stairGeom, checkers }) {
  const GRAVITY = 18, JUMP = 5;
  const STAND_HEIGHT = 1.6;

  const direction = new THREE.Vector3();

  const { stairOffset, stairLength, stepDepth, stairWidth, stepHeight, totalSteps } = stairGeom;
  const { checkVitrinaCollision, checkRailingCollision, checkRopeBarrierCollision } = checkers;

  let onFloor = true;
  let vy = 0;

  function movePlayer(dt) {
    const move = getMoveState();

    direction.set(0,0,0);
    const speed = (move.run ? 6 : 3.2);

    if (move.f) direction.z += 1;
    if (move.b) direction.z -= 1;
    if (move.l) direction.x -= 1;
    if (move.r) direction.x += 1;
    direction.normalize();

    const forward = new THREE.Vector3(0,0,-1).applyEuler(camera.rotation);
    const right   = new THREE.Vector3(1,0,0).applyEuler(camera.rotation);

    const newPosition = camera.position.clone();
    newPosition.addScaledVector(forward, direction.z * speed * dt);
    newPosition.addScaledVector(right,   direction.x * speed * dt);

    // Colisiones de paredes y puerta (usa la lógica actual del main.js)
  let wallCollision = false;
  const playerRadius = 0.30; // un poco más de separación para eliminar por completo el "negro"

    if (newPosition.z < -ROOM.d/2 + playerRadius) wallCollision = true;
    if (newPosition.x < -ROOM.w/2 + playerRadius) wallCollision = true;
    if (newPosition.x >  ROOM.w/2 - playerRadius) wallCollision = true;

    const wallZ = ROOM.d/2;
    const doorMinX = DOOR.centerX - DOOR.width/2;
    const doorMaxX = DOOR.centerX + DOOR.width/2;
    const doorXTolerance = 0.15;
    const doorMinY = 0;
    const doorMaxY = DOOR.height;
    const wasInsideSmall = camera.position.z > wallZ + playerRadius;
    const wasInMain = !wasInsideSmall;
    const withinDoorXNewPos = (newPosition.x > doorMinX - doorXTolerance && newPosition.x < doorMaxX + doorXTolerance);
    const withinDoorYCurrent = (camera.position.y >= doorMinY && camera.position.y <= doorMaxY);

    if (wasInMain && newPosition.z >= wallZ - playerRadius) {
      if (!(withinDoorXNewPos && withinDoorYCurrent)) wallCollision = true;
    }
    if (wasInsideSmall && newPosition.z <= wallZ + playerRadius) {
      if (!(withinDoorXNewPos && withinDoorYCurrent)) wallCollision = true;
    }

    if (!wallCollision) {
      const pr = playerRadius;
      const insideSmall = newPosition.z > wallZ + pr;
      if (insideSmall) {
        // Colisiones de la sala pequeña
        const smallRoomHalfW = SMALL.w / 2;
        const smallRoomBackZ = wallZ + SMALL.d;
        
        // Pared trasera de la sala pequeña
        if (newPosition.z >= smallRoomBackZ - pr) {
          newPosition.z = smallRoomBackZ - pr;
        }
        
        // Pared izquierda de la sala pequeña
        if (newPosition.x <= -smallRoomHalfW + pr) {
          newPosition.x = -smallRoomHalfW + pr;
        }
        
        // Pared derecha de la sala pequeña
        if (newPosition.x >= smallRoomHalfW - pr) {
          newPosition.x = smallRoomHalfW - pr;
        }
      }
    }

    if (!wallCollision && !checkVitrinaCollision(newPosition) && !checkRailingCollision(newPosition) && !checkRopeBarrierCollision(newPosition)) {
      camera.position.copy(newPosition);
    }

    // Suelo / escaleras / balcón
    function getFloorHeight(x, z) {
      let floorHeight = 0;
      const playerCurrentY = camera.position.y;
      const basePlayerHeight = STAND_HEIGHT;

      const stairCenterX = 0;
      const stairStartZ = stairOffset + stairLength/2;
      const stairEndZ = stairOffset - stairLength/2;

      if (Math.abs(x - stairCenterX) <= stairWidth/2 + 0.5 && z <= stairStartZ && z >= stairEndZ) {
        const stepIndex = Math.floor((stairStartZ - z) / stepDepth);
        if (stepIndex >= 0 && stepIndex < totalSteps) {
          const stepHeight_calculated = stepIndex * stepHeight;
          const minHeightToApply = stepHeight_calculated - 0.5;
          if (playerCurrentY - basePlayerHeight >= minHeightToApply) floorHeight = stepHeight_calculated;
        }
      }

      const balconyHeight = finalBalconyHeight;
      const minHeightToApply = balconyHeight - 0.5;

      if (Math.abs(x) <= ROOM.w/2 && z >= ROOM.d/2 - balconyWidth && z <= ROOM.d/2) {
        if (playerCurrentY - basePlayerHeight >= minHeightToApply) floorHeight = balconyHeight;
      }
      if (Math.abs(x) <= ROOM.w/2 && z >= -ROOM.d/2 && z <= -ROOM.d/2 + balconyWidth) {
        if (playerCurrentY - basePlayerHeight >= minHeightToApply) floorHeight = balconyHeight;
      }
      if (x >= -ROOM.w/2 && x <= -ROOM.w/2 + balconyWidth && Math.abs(z) <= (ROOM.d - balconyWidth*2)/2) {
        if (playerCurrentY - basePlayerHeight >= minHeightToApply) floorHeight = balconyHeight;
      }
      if (x >= ROOM.w/2 - balconyWidth && x <= ROOM.w/2 && Math.abs(z) <= (ROOM.d - balconyWidth*2)/2) {
        if (playerCurrentY - basePlayerHeight >= minHeightToApply) floorHeight = balconyHeight;
      }
      return floorHeight;
    }

    const currentFloorHeight = getFloorHeight(camera.position.x, camera.position.z);
    const basePlayerHeight = STAND_HEIGHT;
    const targetHeight = currentFloorHeight + basePlayerHeight;

    if (move.up && onFloor){ vy = JUMP; onFloor=false; }
    vy -= GRAVITY * dt;
    camera.position.y += vy * dt;

    if (camera.position.y <= targetHeight){
      camera.position.y = targetHeight;
      vy = 0;
      onFloor = true;
    }
  }

  return { movePlayer };
}
