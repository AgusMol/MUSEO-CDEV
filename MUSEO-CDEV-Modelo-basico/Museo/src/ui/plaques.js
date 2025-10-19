import * as THREE from 'three';

export function createGoldenPlaque(title, description) {
  const plaqueGroup = new THREE.Group();
  const goldenMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFD700, metalness: 0.8, roughness: 0.2, emissive: 0x332200, emissiveIntensity: 0.15, side: THREE.DoubleSide
  });
  const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.02), goldenMaterial);
  plaque.castShadow = true; plaque.receiveShadow = true;

  const canvas = document.createElement('canvas');
  canvas.width = 800; canvas.height = 160; const context = canvas.getContext('2d');
  context.fillStyle = '#FFD700'; context.fillRect(0,0,canvas.width,canvas.height);
  context.strokeStyle = '#8B4513'; context.lineWidth = 6; context.strokeRect(3,3,canvas.width-6,canvas.height-6);
  context.strokeStyle = '#B8860B'; context.lineWidth = 2; context.strokeRect(8,8,canvas.width-16,canvas.height-16);
  context.fillStyle = '#1a1a1a'; context.font = 'bold 36px "Times New Roman"'; context.textAlign = 'center'; context.textBaseline = 'middle';
  const x = canvas.width/2, y = canvas.height/2;
  context.save(); context.shadowColor='rgba(0,0,0,0.5)'; context.shadowOffsetX=2; context.shadowOffsetY=2; context.shadowBlur=3; context.fillText(title, x, y); context.restore();
  context.strokeStyle = '#B8860B'; context.lineWidth = 2; context.strokeText(title, x, y);
  context.fillStyle = '#000000'; context.fillText(title, x, y);

  const textTexture = new THREE.CanvasTexture(canvas); textTexture.minFilter=THREE.LinearFilter; textTexture.magFilter=THREE.LinearFilter; textTexture.generateMipmaps=false; textTexture.flipY=false; textTexture.needsUpdate=true;
  const textMaterial = new THREE.MeshBasicMaterial({ map: textTexture, transparent: false, alphaTest: 0.1, side: THREE.DoubleSide, depthWrite: true, depthTest: true });
  const textPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.10), textMaterial);
  textPlane.position.z = -0.012;

  plaqueGroup.add(plaque); plaqueGroup.add(textPlane);
  plaqueGroup.userData = { title: title, desc: description };
  return plaqueGroup;
}
