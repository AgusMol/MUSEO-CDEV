import * as THREE from 'three';

export function initThree(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0e1116);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 1.6, 16);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene.add(camera);

  const ENABLE_CEILING_LIGHTS = false;

  const hemi = new THREE.HemisphereLight(0xffffff, 0x222233, 0.8);
  scene.add(hemi);

  let spot = null;
  if (ENABLE_CEILING_LIGHTS) {
    spot = new THREE.SpotLight(0xffffff, 2.0, 60, Math.PI / 5, 0.2, 1.5);
    spot.position.set(0, 7.5, 0);
    spot.castShadow = true;
    scene.add(spot);
    scene.add(spot.target);
  }

  const ambient = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambient);

  const mainLights = [hemi, ambient];
  if (spot) mainLights.push(spot);
  let lucesPrendidas = true;
  const lamparasSpotLights = [];

  function toggleLuces() {
    lucesPrendidas = !lucesPrendidas;
    mainLights.forEach(l => l.visible = lucesPrendidas);
    lamparasSpotLights.forEach(l => l.visible = lucesPrendidas);
  }

  return { THREE, scene, camera, renderer, ENABLE_CEILING_LIGHTS, lamparasSpotLights, toggleLuces };
}
