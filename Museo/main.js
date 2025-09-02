// ======== Config básica ========
const CANVAS = document.getElementById("miCanvas");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e1116);

// Cámara y renderer
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 1.6, 10);

const renderer = new THREE.WebGLRenderer({ canvas: CANVAS, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

// Luces
const hemi = new THREE.HemisphereLight(0xffffff, 0x222233, 0.8); // más intensidad
scene.add(hemi);

const spot = new THREE.SpotLight(0xffffff, 2.0, 60, Math.PI/5, 0.2, 1.5); // más intensidad y ángulo
spot.position.set(0, 7.5, 0);
spot.castShadow = true;
scene.add(spot);
scene.add(spot.target);

// Luz ambiental extra
const ambient = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambient);

// ======== Sala del museo (una “habitación” grande) ========
const ROOM = { w: 24, h: 6, d: 36 };
const wallMat = new THREE.MeshStandardMaterial({ color: 0x161a22, roughness: 0.9, metalness: 0.0 });
const floorMat = new THREE.MeshStandardMaterial({ color: 0x1f2836, roughness: 1.0 });

const room = new THREE.Group();

// Piso
const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.w, ROOM.d), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
room.add(floor);

// Techo
const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.w, ROOM.d), wallMat);
ceiling.rotation.x =  Math.PI / 2;
ceiling.position.y = ROOM.h;
room.add(ceiling);

// Paredes (cajas delgadas)
function wall(w, h, d) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
}
const wallBack  = wall(ROOM.w, ROOM.h, 0.3); wallBack.position.set(0, ROOM.h/2, -ROOM.d/2);
const wallFront = wall(ROOM.w, ROOM.h, 0.3); wallFront.position.set(0, ROOM.h/2,  ROOM.d/2);
const wallLeft  = wall(0.3, ROOM.h, ROOM.d); wallLeft.position.set(-ROOM.w/2, ROOM.h/2, 0);
const wallRight = wall(0.3, ROOM.h, ROOM.d); wallRight.position.set( ROOM.w/2, ROOM.h/2, 0);
room.add(wallBack, wallFront, wallLeft, wallRight);

scene.add(room);

// ======== Obras / marcos ========
const interactables = [];
const loader = new THREE.TextureLoader();

function addFrame(opts) {
  const {
    x, z, face = "front",
    img = "./assets/textures/Pelota.jpg",
    title = "Obra sin título",
    desc = "Descripción de ejemplo"
  } = opts;

  // Marco
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 1.0, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x2a3344, metalness: .2, roughness: .7 })
  );
  frame.castShadow = true;
  frame.position.set(x, 1.7, z);

  // Orientación según pared
  if (face === "back") frame.rotation.y = Math.PI;
  if (face === "left") frame.rotation.y =  Math.PI/2;
  if (face === "right") frame.rotation.y = -Math.PI/2;

  // Lienzo (imagen)
  const tex = loader.load(img);
  tex.colorSpace = THREE.SRGBColorSpace;
  const art = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 0.8),
    new THREE.MeshBasicMaterial({ map: tex })
  );
  art.position.z = 0.028; // ligeramente por delante del marco
  frame.add(art);

  // Luz propia para la obra
  const obraLight = new THREE.PointLight(0xffffff, 1.2, 3);
  obraLight.position.set(0, 0.5, 0.3); // arriba y delante del marco
  frame.add(obraLight);

  frame.userData = { title, desc };
  scene.add(frame);
  interactables.push(frame);
}

// Carga algunas “salas” de cada lado (reemplazá las rutas por tus imágenes)
const imgs = [
  "./assets/images/EL DIIIIIEGO.jpg",
  "./assets/images/cafeteras.jpg",
  "./assets/images/obra3.jpg",
  "./assets/images/obra4.jpg",
  "./assets/textures/Pelota.jpg" // placeholder
];

for (let i = -8; i <= 8; i += 4) {
  addFrame({ x: i, z: -ROOM.d/2 + 0.18, face: "back",  img: imgs[(i+8)/4 % imgs.length], title: `Obra pared fondo ${i}`,  desc: "Autor A · 2024" });
  addFrame({ x: i, z:  ROOM.d/2 - 0.18, face: "front", img: imgs[(i+10)/4 % imgs.length], title: `Obra pared frente ${i}`, desc: "Autor B · 2023" });
}
for (let i = -8; i <= 8; i += 4) {
  addFrame({ x: -ROOM.w/2 + 0.18, z: i, face: "left",  img: imgs[(i+12)/4 % imgs.length], title: `Obra pared izq ${i}`,  desc: "Autor C · 2022" });
  addFrame({ x:  ROOM.w/2 - 0.18, z: i, face: "right", img: imgs[(i+14)/4 % imgs.length], title: `Obra pared der ${i}`, desc: "Autor D · 2021" });
}

// Pedestal central con “escultura”
const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.6, 32), wallMat);
pedestal.position.set(0, 0.3, 0);
pedestal.receiveShadow = true;
scene.add(pedestal);

const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 16),
  new THREE.MeshStandardMaterial({ color: 0x8aa4ff, metalness:.6, roughness:.25 })
);
sphere.position.set(0, 1.4, 0);
sphere.castShadow = true;
scene.add(sphere);

// ======== Copa del Mundo exhibida en el museo ========

// Grupo para la copa
const copaGroup = new THREE.Group();

// Base de la copa (cilindro dorado)
const baseCopa = new THREE.Mesh(
  new THREE.CylinderGeometry(0.22, 0.22, 0.18, 32),
  new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.3 })
);
baseCopa.position.y = 0.09;
copaGroup.add(baseCopa);

// Cuerpo de la copa (cilindro más estrecho)
const cuerpoCopa = new THREE.Mesh(
  new THREE.CylinderGeometry(0.13, 0.16, 0.38, 32),
  new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.25 })
);
cuerpoCopa.position.y = 0.38;
copaGroup.add(cuerpoCopa);

// Globo superior (esfera dorada)
const globoCopa = new THREE.Mesh(
  new THREE.SphereGeometry(0.18, 32, 16),
  new THREE.MeshStandardMaterial({ color: 0xf7e07a, metalness: 1.0, roughness: 0.18 })
);
globoCopa.position.y = 0.67;
copaGroup.add(globoCopa);

// Detalles: dos "brazos" levantando el globo
for (let i = -1; i <= 1; i += 2) {
  const brazo = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.04, 0.32, 16),
    new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.22 })
  );
  brazo.position.set(i * 0.09, 0.55, 0.08);
  brazo.rotation.z = Math.PI / 6 * i;
  copaGroup.add(brazo);
}

// Ubicación de la copa en el museo (sobre un pedestal, cerca del centro)
copaGroup.position.set(3, 0.6, 0); // Puedes ajustar la posición según prefieras
scene.add(copaGroup);

// Luz puntual para destacar la copa
const copaLight = new THREE.PointLight(0xfff8c0, 1.5, 4);
copaLight.position.set(3, 2.2, 0);
scene.add(copaLight);

// Variable para seguir la cámara
let copaFollow = true;

// ======== Controles tipo “first person” (sin librerías) ========
const help = document.getElementById('help');
const label = document.getElementById('label');
let pointerLocked = false;

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const move = { f:false,b:false,l:false,r:false, up:false, run:false };
let yaw = 0, pitch = 0;

function lockPointer(){
  CANVAS.requestPointerLock();
}
document.addEventListener('pointerlockchange', () => {
  pointerLocked = (document.pointerLockElement === CANVAS);
  help.style.display = pointerLocked ? 'none' : 'block';
});
CANVAS.addEventListener('click', lockPointer);

document.addEventListener('mousemove', (e) => {
  if (!pointerLocked) return;
  const sensitivity = 0.0025;
  yaw   -= e.movementX * sensitivity;
  pitch -= e.movementY * sensitivity;
  const limit = Math.PI/2 - 0.05;
  pitch = Math.max(-limit, Math.min(limit, pitch));
  camera.rotation.set(pitch, yaw, 0, "YXZ");
});

document.addEventListener('keydown', (e)=>{
  if (e.code==='KeyW') move.f = true;
  if (e.code==='KeyS') move.b = true;
  if (e.code==='KeyA') move.l = true;
  if (e.code==='KeyD') move.r = true;
  if (e.code==='Space') move.up = true;
  if (e.code==='ShiftLeft') move.run = true;
  if (e.code==='KeyE') tryOpenInfo(); // ver ficha de obra enfocada
});
document.addEventListener('keyup', (e)=>{
  if (e.code==='KeyW') move.f = false;
  if (e.code==='KeyS') move.b = false;
  if (e.code==='KeyA') move.l = false;
  if (e.code==='KeyD') move.r = false;
  if (e.code==='Space') move.up = false;
  if (e.code==='ShiftLeft') move.run = false;
});

// Movimiento
const GRAVITY = 18, JUMP = 5;
let onFloor = true;
let vy = 0;

function movePlayer(dt){
  direction.set(0,0,0);
  const speed = (move.run ? 6 : 3.2);

  // Cambia el sentido de las teclas W y S
  if (move.f) direction.z += 1;   // W ahora avanza
  if (move.b) direction.z -= 1;   // S ahora retrocede
  if (move.l) direction.x -= 1;
  if (move.r) direction.x += 1;
  direction.normalize();

  const forward = new THREE.Vector3(0,0,-1).applyEuler(camera.rotation);
  const right   = new THREE.Vector3(1,0,0).applyEuler(camera.rotation);

  camera.position.addScaledVector(forward, direction.z * speed * dt);
  camera.position.addScaledVector(right,   direction.x * speed * dt);

  // “Salto” simple
  if (move.up && onFloor){ vy = JUMP; onFloor=false; }
  vy -= GRAVITY * dt;
  camera.position.y += vy * dt;
  if (camera.position.y <= 1.6){ camera.position.y = 1.6; vy = 0; onFloor = true; }

  // Colisiones simples con paredes (limitar dentro de la sala)
  const margin = 0.6;
  camera.position.x = Math.max(-ROOM.w/2 + margin, Math.min(ROOM.w/2 - margin, camera.position.x));
  camera.position.z = Math.max(-ROOM.d/2 + margin, Math.min(ROOM.d/2 - margin, camera.position.z));
}

// ======== Raycaster para “mirar” obras y ver info ========
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(); // no usamos mouse pos; ray desde la mira (centro)
function getFocusedArt() {
  raycaster.setFromCamera({x:0, y:0}, camera);
  const hits = raycaster.intersectObjects(interactables, false);
  return hits.length ? hits[0].object : null;
}

function tryOpenInfo(){
  const obj = getFocusedArt();
  if (!obj) return;
  showInfo(obj.userData.title, obj.userData.desc);
}

function updateAimLabel(){
  const obj = getFocusedArt();
  if (obj){
    label.textContent = `E: Ver “${obj.userData.title}”`;
    label.classList.add('show');
  }else{
    label.classList.remove('show');
  }
}

// Panel info
const panel = document.getElementById('art-info');
const closeBtn = document.getElementById('close-info');
const artTitle = document.getElementById('art-title');
const artDesc  = document.getElementById('art-desc');
closeBtn.onclick = ()=> panel.classList.add('hidden');
function showInfo(title, desc){
  artTitle.textContent = title;
  artDesc.textContent  = desc;
  panel.classList.remove('hidden');
}

// ======== Loop ========
let last = performance.now();
function animate(now){
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (pointerLocked){
    movePlayer(dt);
    updateAimLabel();
  }

  // Haz que la copa siga la posición de la cámara (pero a la altura del pedestal)
  if (copaFollow) {
    copaGroup.position.x = camera.position.x;
    copaGroup.position.z = camera.position.z + 2; // delante de la cámara
    copaGroup.position.y = 0.6; // altura del pedestal
    copaLight.position.set(copaGroup.position.x, 2.2, copaGroup.position.z);
  }

  renderer.render(scene, camera);
}
animate(performance.now());

// Resize
window.addEventListener('resize', ()=>{
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
