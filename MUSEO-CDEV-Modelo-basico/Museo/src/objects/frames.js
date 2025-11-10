import * as THREE from 'three';

const loader = new THREE.TextureLoader();

export function addFrame(scene, interactables, opts){
  const { x, z, face = 'front', img, title, desc } = opts;
  const frameGroup = new THREE.Group();
  frameGroup.position.set(x, 1.7, z);
  if (face === 'back') frameGroup.rotation.y = Math.PI;
  if (face === 'left') frameGroup.rotation.y = Math.PI/2;
  if (face === 'right') frameGroup.rotation.y = -Math.PI/2;

  const artWidth=1.8, artHeight=1.2, frameThickness=0.08; const barDepth=frameThickness; const barZ=0.01;
  const artMat = new THREE.MeshBasicMaterial({ color: 0xdddddd, side: THREE.DoubleSide });
  const artPlane = new THREE.Mesh(new THREE.PlaneGeometry(artWidth, artHeight), artMat);
  artPlane.position.set(0,0,-0.01); artPlane.userData = { title, desc }; artPlane.receiveShadow = true; frameGroup.add(artPlane);
  
  // Voltear horizontalmente las imágenes de la pared del frente y del fondo
  const shouldFlip = img.includes('1978_2') || img.includes('1978.') || 
                     img.includes('9.jpeg') || img.includes('10.jpeg') || img.includes('11.png') ||
                     img.includes('2008') || img.includes('2009') ||
                     img.includes('1998_zanetti') || img.includes('palermo') || img.includes('2006_maxi_rodriguez');
  
  loader.load(img, (texture)=>{ 
    try{ 
      texture.colorSpace=THREE.SRGBColorSpace; 
      if (shouldFlip) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.x = -1;
      }
      artPlane.material.map=texture; 
      artPlane.material.color.setHex(0xffffff); 
      artPlane.material.needsUpdate=true; 
    }catch(e){} 
  }, undefined, ()=>{
    loader.load('./assets/textures/colonCampeon.jpg', (fallback)=>{ try{ fallback.colorSpace=THREE.SRGBColorSpace; artPlane.material.map=fallback; artPlane.material.color.setHex(0xffffff); artPlane.material.needsUpdate=true; }catch(e){} }, undefined, ()=>{ artPlane.material.color.setHex(0x888888); artPlane.material.needsUpdate=true; });
  });

  const frameMat = new THREE.MeshStandardMaterial({ color: 0xB8860B, metalness: 0.7, roughness: 0.25 });
  const halfW = artWidth/2, halfH = artHeight/2;
  const topBar = new THREE.Mesh(new THREE.BoxGeometry(artWidth + frameThickness*2, frameThickness, barDepth), frameMat); topBar.position.set(0, halfH + frameThickness/2, barZ); topBar.castShadow = topBar.receiveShadow = true; frameGroup.add(topBar);
  const bottomBar = topBar.clone(); bottomBar.position.set(0, -halfH - frameThickness/2, barZ); frameGroup.add(bottomBar);
  const leftBar = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, artHeight, barDepth), frameMat); leftBar.position.set(-halfW - frameThickness/2, 0, barZ); leftBar.castShadow = leftBar.receiveShadow = true; frameGroup.add(leftBar);
  const rightBar = leftBar.clone(); rightBar.position.set(halfW + frameThickness/2, 0, barZ); frameGroup.add(rightBar);

  const obraLight = new THREE.PointLight(0xffffff, 1.2, 6); obraLight.position.set(0, 0.6, 1.5); frameGroup.add(obraLight);

  frameGroup.userData = { title, desc, isVideo: false };
  scene.add(frameGroup); interactables.push(frameGroup);
}
