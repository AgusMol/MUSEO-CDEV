// Estado del hotbar
let currentSlot = 5; // Slot activo (1-9)
let hotbarSlots = [];
let audioContext = null; // AudioContext para mejor control
let audioBuffers = {}; // Buffers precargados
let currentAudio = null; // Referencia al audio que se está reproduciendo actualmente

// Contador especial para el mate (slot 6)
let mateClickCount = 0;
let mateCurrentSound = 0; // 0 = primer sonido, 1 = segundo sonido

// 🔊 AQUÍ DEFINES LOS SONIDOS DE CADA SLOT
// Puedes cambiar las rutas o dejar '' si no quieres sonido en ese slot
const itemSounds = {
  1: './assets/audio/Audios-hotbar/bandera.mp3',      // Bandera - AGREGA TU AUDIO AQUÍ
  2: './assets/audio/Audios-hotbar/bombo.mp3',        // Bombo - AGREGA TU AUDIO AQUÍ
  3: './assets/audio/Audios-hotbar/choripan.mp3',     // Choripán - AGREGA TU AUDIO AQUÍ
  4: './assets/audio/Audios-hotbar/corneta.mp3',      // Corneta ✓
  5: './assets/audio/Audios-hotbar/fernet.mp3',       // Fernet - AGREGA TU AUDIO AQUÍ
  6: [
    './assets/audio/Audios-hotbar/mate1.mp3',  // Primer sonido (3 veces)
    './assets/audio/Audios-hotbar/mate2.mp3'   // Segundo sonido (3 veces)
  ],         // Mate - ¡Con alternancia cada 3 clicks!
  7: './assets/audio/Audios-hotbar/piluso.mp3',       // Piluso - AGREGA TU AUDIO AQUÍ
  8: './assets/audio/Audios-hotbar/messi.mp3',                                              // Vacío
  9: ''                                               // Vacío
};

export function initHotbar() {
  hotbarSlots = document.querySelectorAll('.hotbar-slot');
  
  console.log(`🎒 Inicializando hotbar con ${hotbarSlots.length} slots`);
  
  // Inicializar AudioContext en el primer click
  document.addEventListener('click', initAudioContext, { once: true });
  
  // Imágenes de los ítems
  const items = {
    1: 'assets/images/hotbar/bandera.png',
    2: 'assets/images/hotbar/bombo-8bit.png', 
    3: 'assets/images/hotbar/choripan-8bit.png', 
    4: 'assets/images/hotbar/corneta-8bit.png', 
    5: 'assets/images/hotbar/fernet-8bit.png', 
    6: 'assets/images/hotbar/mate-8bit.png', 
    7: 'assets/images/hotbar/piluso-8bit.png', 
    8: 'assets/images/hotbar/messi.png', 
    9: '' 
  };

  hotbarSlots.forEach((slot, index) => {
    const slotItem = slot.querySelector('.slot-item');
    const itemImage = items[index + 1];
    if (itemImage) {
      // Crear elemento img y agregarlo
      const img = document.createElement('img');
      img.src = itemImage;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
      img.style.pointerEvents = 'none';
      slotItem.innerHTML = '';
      slotItem.appendChild(img);
    }
  });
  
  updateHotbar();
  console.log('🎒 Hotbar inicializada con ítems y sonidos');
}

// Inicializar AudioContext (se llama en el primer click)
function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    console.log('🔊 AudioContext inicializado');
  }
}

// Función para reproducir el sonido de un slot
function playSlotSound(slotNumber) {
  console.log(`🎵 [DEBUG] Intentando reproducir slot ${slotNumber}`);
  
  let soundPath = itemSounds[slotNumber];
  
  // Lógica especial para el mate (slot 6)
  if (slotNumber === 6 && Array.isArray(soundPath)) {
    mateClickCount++;
    
    // Determinar qué sonido usar basado en el contador
    // Clicks 1-3: mate1, Clicks 4-5: mate2, luego vuelve a empezar
    if (mateClickCount <= 3) {
      mateCurrentSound = 0;
      console.log(`🧉 [MATE] Click ${mateClickCount}/3 - Sonido: mate1`);
    } else {
      mateCurrentSound = 1;
      console.log(`🧉 [MATE] Click ${mateClickCount - 3}/2 - Sonido: mate2`);
    }
    
    // Usar el sonido actual basado en el estado
    soundPath = soundPath[mateCurrentSound];
    
    // Después de 5 clicks (3+2), reiniciar el contador
    if (mateClickCount >= 5) {
      mateClickCount = 0;
      console.log(`🧉 [MATE] ¡Ciclo completo! Volviendo a mate1`);
    }
  }
  
  console.log(`🎵 [DEBUG] Ruta del sonido: "${soundPath}"`);
  
  if (!soundPath || soundPath === '') {
    console.log(`⚠️ [DEBUG] No hay audio configurado para slot ${slotNumber}`);
    return;
  }

  try {
    console.log(`🎵 [DEBUG] Creando objeto Audio...`);
    
    // Si hay un audio reproduciéndose, detenerlo
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      console.log(`⏹️ Audio anterior detenido`);
    }
    
    const audio = new Audio(soundPath);
    audio.volume = 0.8;
    currentAudio = audio; // Guardar referencia al audio actual
    
    console.log(`🎵 [DEBUG] Intentando reproducir...`);
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log(`✅ [DEBUG] Audio reproducido exitosamente!`);
        })
        .catch(err => {
          console.error(`❌ [DEBUG] Error al reproducir:`, err);
          console.error(`❌ [DEBUG] Tipo de error:`, err.name);
          console.error(`❌ [DEBUG] Mensaje:`, err.message);
        });
    }
    
    // Cuando el audio termine, limpiar la referencia
    audio.addEventListener('ended', () => {
      if (currentAudio === audio) {
        currentAudio = null;
      }
    });
    
  } catch (error) {
    console.error(`❌ [DEBUG] Error en try/catch:`, error);
  }
}

// Función pública para reproducir el sonido del slot actual
export function playCurrentSlotSound() {
  console.log(`🔊 [DEBUG] playCurrentSlotSound llamada, slot actual: ${currentSlot}`);
  playSlotSound(currentSlot);
}

export function updateHotbar() {
  hotbarSlots.forEach((slot, index) => {
    slot.classList.toggle('active', index + 1 === currentSlot);
  });
}

export function setHotbarSlot(slotNumber) {
  if (slotNumber >= 1 && slotNumber <= 9) {
    currentSlot = slotNumber;
    updateHotbar();
    console.log(`🎒 Slot ${slotNumber} seleccionado`);
  }
}

export function getCurrentSlot() {
  return currentSlot;
}

export function scrollHotbar(direction) {
  let newSlot = currentSlot + direction;
  if (newSlot > 9) newSlot = 1;
  if (newSlot < 1) newSlot = 9;
  setHotbarSlot(newSlot);
}
