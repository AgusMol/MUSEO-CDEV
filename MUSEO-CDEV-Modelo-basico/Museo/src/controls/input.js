import * as THREE from 'three';

// Estado de los controles
const state = {
  pointerLocked: false,
  move: { f: false, b: false, l: false, r: false, up: false, run: false },
  yaw: 0,
  pitch: 0
};

// Callbacks externos
let onInteract = null;
let onClick = null;
let onToggleLight = null;
let onHotbarChange = null;

export function initControls(canvas, camera, options = {}) {
  const {
    onInteractCallback,
    onClickCallback,
    onToggleLightCallback,
    onHotbarChangeCallback,
    helpElement,
    crosshairElement,
    hotbarElement
  } = options;

  onInteract = onInteractCallback;
  onClick = onClickCallback;
  onToggleLight = onToggleLightCallback;
  onHotbarChange = onHotbarChangeCallback;

  // Pointer lock con manejo de errores
  function lockPointer() {
    // Verificar que el canvas esté en el documento antes de solicitar pointer lock
    if (!document.body.contains(canvas)) {
      console.warn('Canvas no está en el documento, no se puede bloquear el puntero');
      return;
    }
    
    try {
      const promise = canvas.requestPointerLock();
      // requestPointerLock puede retornar una Promise en navegadores modernos
      if (promise && promise.catch) {
        promise.catch((err) => {
          // Silenciar el error WrongDocumentError y otros errores de pointer lock
          console.debug('No se pudo bloquear el puntero:', err.name);
        });
      }
    } catch (err) {
      // Manejar errores síncronos
      console.debug('Error al solicitar pointer lock:', err.name);
    }
  }

  document.addEventListener('pointerlockchange', () => {
    state.pointerLocked = (document.pointerLockElement === canvas);
    if (helpElement) helpElement.style.display = state.pointerLocked ? 'none' : 'block';
    if (crosshairElement) crosshairElement.style.display = state.pointerLocked ? 'block' : 'none';
    if (hotbarElement) hotbarElement.style.display = state.pointerLocked ? 'block' : 'none';

    // Ocultar label cuando no estés en modo juego
    const label = document.getElementById('label');
    if (!state.pointerLocked && label) {
      label.classList.remove('show');
    }

    // Actualizar hotbar si está bloqueado
    if (state.pointerLocked && onHotbarChange) {
      onHotbarChange('update');
    }
  });

  canvas.addEventListener('click', lockPointer);

  // Mouse click mientras está bloqueado el cursor (para interactuar/disparar)
  document.addEventListener('click', (e) => {
    if (!state.pointerLocked) return;
    
    // Primero ejecutar el callback de click (sonidos)
    if (onClick) {
      onClick();
    }
    
    // Luego ejecutar la interacción (abrir info, etc.)
    if (onInteract) {
      onInteract();
    }
  });

  // Mouse movement
  document.addEventListener('mousemove', (e) => {
    if (!state.pointerLocked) return;
    const sensitivity = 0.0025;
    state.yaw -= e.movementX * sensitivity;
    state.pitch -= e.movementY * sensitivity;
    const limit = Math.PI / 2 - 0.05;
    state.pitch = Math.max(-limit, Math.min(limit, state.pitch));
    camera.rotation.set(state.pitch, state.yaw, 0, "YXZ");
  });

  // Keyboard events
  document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyW') state.move.f = true;
    if (e.code === 'KeyS') state.move.b = true;
    if (e.code === 'KeyA') state.move.l = true;
    if (e.code === 'KeyD') state.move.r = true;
    if (e.code === 'Space') state.move.up = true;
    if (e.code === 'ShiftLeft') state.move.run = true;

    // Interacción
    if (e.code === 'KeyE' && onInteract) {
      onInteract();
    }

    // Hotbar: teclas numéricas 1-9 (números de arriba) o teclado numérico (derecha)
    let slotNumber = null;
    
    // Números de arriba (Digit1-9)
    if (e.code >= 'Digit1' && e.code <= 'Digit9') {
      slotNumber = parseInt(e.code.replace('Digit', ''));
    }
    // Teclado numérico derecho (Numpad1-9)
    else if (e.code >= 'Numpad1' && e.code <= 'Numpad9') {
      slotNumber = parseInt(e.code.replace('Numpad', ''));
    }
    
    if (slotNumber && onHotbarChange) {
      onHotbarChange('slot', slotNumber);
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW') state.move.f = false;
    if (e.code === 'KeyS') state.move.b = false;
    if (e.code === 'KeyA') state.move.l = false;
    if (e.code === 'KeyD') state.move.r = false;
    if (e.code === 'Space') state.move.up = false;
    if (e.code === 'ShiftLeft') state.move.run = false;
  });

  // Mouse wheel para hotbar
  document.addEventListener('wheel', (e) => {
    if (!state.pointerLocked) return;
    const direction = e.deltaY > 0 ? 1 : -1;
    if (onHotbarChange) {
      onHotbarChange('scroll', direction);
    }
  });

  console.log('🎮 Controles inicializados');
}

// Getters para acceder al estado
export function getControlState() {
  return state;
}

export function isPointerLocked() {
  return state.pointerLocked;
}

export function getMoveState() {
  return state.move;
}

export function getYaw() {
  return state.yaw;
}

export function getPitch() {
  return state.pitch;
}
