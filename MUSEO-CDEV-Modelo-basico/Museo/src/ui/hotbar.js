// Estado del hotbar
let currentSlot = 5; // Slot activo (1-9)
let hotbarSlots = [];

export function initHotbar() {
  hotbarSlots = document.querySelectorAll('.hotbar-slot');
  
  // Íconos de los ítems (pueden ser emojis o caracteres especiales)
  const items = {
    1: '',
    2: '', 
    3: '', 
    4: '', 
    5: '', 
    6: '', 
    7: '', 
    8: '', 
    9: '' 
  };

  hotbarSlots.forEach((slot, index) => {
    const slotItem = slot.querySelector('.slot-item');
    const itemIcon = items[index + 1];
    if (itemIcon) {
      slotItem.innerHTML = itemIcon;
      slotItem.style.fontSize = '16px';
    }
  });
  
  updateHotbar();
  console.log('🎒 Hotbar inicializada con ítems');
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
