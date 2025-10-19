import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function buildRoom(scene, lamparasSpotLights, ENABLE_CEILING_LIGHTS){
  const ROOM = { w: 24, h: 10, d: 36 };
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x5A6B3A, roughness: 0.8, metalness: 0.0 });
  const room = new THREE.Group();

  const floorTextureLoader = new THREE.TextureLoader();
  const floorParquetTexture = floorTextureLoader.load('./assets/textures/madera_parquet.jpg');
  floorParquetTexture.wrapS = THREE.RepeatWrapping;
  floorParquetTexture.wrapT = THREE.RepeatWrapping;
  floorParquetTexture.repeat.set(8, 6);
  floorParquetTexture.anisotropy = 16;
  const floorMaterial = new THREE.MeshStandardMaterial({ map: floorParquetTexture, roughness: 0.3, metalness: 0.0 });
  const mainFloor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.w, ROOM.d), floorMaterial);
  mainFloor.rotation.x = -Math.PI/2; mainFloor.position.set(0,0,0); mainFloor.receiveShadow = true; mainFloor.name='mainFloor';
  room.add(mainFloor);

  const panelSize = 4.0; const panelsX = Math.ceil(ROOM.w / panelSize); const panelsZ = Math.ceil(ROOM.d / panelSize);
  const ceilingHeight = ROOM.h - 0.4; const frameThickness=0.12;
  const ceilingPanelMaterial = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.9 });
  const ceilingFrameMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 });
  const ceilingGroup = new THREE.Group();
  for (let x=0; x<=panelsX; x++){
    const posX = (x - panelsX/2) * panelSize;
    const frame = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, 0.12, ROOM.d), ceilingFrameMaterial);
    frame.position.set(posX, ceilingHeight + 0.02, 0); frame.receiveShadow = true; frame.castShadow = true; ceilingGroup.add(frame);
  }
  for (let z=0; z<=panelsZ; z++){
    const posZ = (z - panelsZ/2) * panelSize;
    const frame = new THREE.Mesh(new THREE.BoxGeometry(ROOM.w, 0.12, frameThickness), ceilingFrameMaterial);
    frame.position.set(0, ceilingHeight + 0.02, posZ); frame.receiveShadow = true; frame.castShadow = true; ceilingGroup.add(frame);
  }
  for (let ix=0; ix<panelsX; ix++) for (let iz=0; iz<panelsZ; iz++){
    const cx=(ix - panelsX/2 + 0.5) * panelSize; const cz=(iz - panelsZ/2 + 0.5) * panelSize;
    const panel = new THREE.Mesh(new THREE.BoxGeometry(panelSize - frameThickness*0.5, 0.08, panelSize - frameThickness*0.5), ceilingPanelMaterial);
    panel.position.set(cx, ceilingHeight, cz); panel.receiveShadow = true; ceilingGroup.add(panel);
  }
  room.add(ceilingGroup);

  const receptionRoom = new THREE.Group();
  const R_w=6, R_d=8, R_h=4; const receptionFloorTex = new THREE.TextureLoader().load('./assets/textures/madera_parquet.jpg');
  receptionFloorTex.wrapS = receptionFloorTex.wrapT = THREE.RepeatWrapping; receptionFloorTex.repeat.set(2,2);
  const receptionFloorMat = new THREE.MeshStandardMaterial({ map: receptionFloorTex, roughness: 0.6 });
  const receptionFloor = new THREE.Mesh(new THREE.PlaneGeometry(R_w, R_d), receptionFloorMat); receptionFloor.rotation.x = -Math.PI/2; receptionFloor.position.set(0, 0.01, ROOM.d/2 + R_d/2); receptionFloor.receiveShadow=true; receptionRoom.add(receptionFloor);
  const receptionBack = new THREE.Mesh(new THREE.BoxGeometry(R_w, R_h, 0.3), wallMat); receptionBack.position.set(0, R_h/2, ROOM.d/2 + R_d - 0.15); receptionRoom.add(receptionBack);
  const receptionLeftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, R_h, R_d), wallMat); receptionLeftWall.position.set(-R_w/2 + 0.15, R_h/2, ROOM.d/2 + R_d/2); receptionRoom.add(receptionLeftWall);
  const receptionRightWall= new THREE.Mesh(new THREE.BoxGeometry(0.3, R_h, R_d), wallMat); receptionRightWall.position.set(R_w/2 - 0.15, R_h/2, ROOM.d/2 + R_d/2); receptionRoom.add(receptionRightWall);
  const receptionDesk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 0.6), new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.2, roughness: 0.6 }));
  receptionDesk.position.set(0, 0.45, ROOM.d/2 + 1.4); receptionRoom.add(receptionDesk);
  const receptionLight = new THREE.PointLight(0xfff7e0, 1.4, 10); receptionLight.position.set(0, 2.5, ROOM.d/2 + R_d/2 - 1); receptionRoom.add(receptionLight);
  const signCanvas = document.createElement('canvas'); signCanvas.width=256; signCanvas.height=128; const sctx=signCanvas.getContext('2d');
  sctx.fillStyle = '#222'; sctx.fillRect(0,0,256,128); sctx.fillStyle='#fff'; sctx.font='28px Arial'; sctx.textAlign='center'; sctx.fillText('Recepción',128,70);
  const signTex = new THREE.CanvasTexture(signCanvas); const signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
  const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), signMat); signMesh.position.set(0,1.2, ROOM.d/2 + 0.6); receptionRoom.add(signMesh);
  scene.add(receptionRoom);

  const gltfLoaderLampara = new GLTFLoader();
  const numRows=3, numCols=5, offsetY = ROOM.h - 0.4; const lamparaGLTF='./assets/models/lampara_colgante_de_techo/scene.gltf';
  for (let row=0; row<numRows; row++){
    const z = -ROOM.d/2 + (ROOM.d/(numRows+1)) * (row+1);
    for (let col=0; col<numCols; col++){
      const x = -ROOM.w/2 + (ROOM.w/(numCols+1)) * (col+1);
      gltfLoaderLampara.load(lamparaGLTF, (gltf)=>{
        const lampara = gltf.scene.clone(); lampara.position.set(x, offsetY - 1, z); lampara.traverse(o=>{ if(o.isMesh){ o.castShadow=o.receiveShadow=true; }}); scene.add(lampara);
        if (ENABLE_CEILING_LIGHTS){ const luzLampara = new THREE.SpotLight(0xffffff, 2.5, 12, Math.PI/6, 0.2, 0.8); luzLampara.position.set(x, offsetY - 0.2, z); luzLampara.target.position.set(x, .5, z); luzLampara.castShadow=false; scene.add(luzLampara); scene.add(luzLampara.target); lamparasSpotLights.push(luzLampara);} 
      }, undefined, (e)=>console.error('Error lámpara', e));
    }
  }

  function wall(w,h,d){ return new THREE.Mesh(new THREE.BoxGeometry(w,h,d), wallMat); }
  const wallBack = wall(ROOM.w, ROOM.h, 0.3); wallBack.position.set(0, ROOM.h/2, -ROOM.d/2);
  const wallFront= wall(ROOM.w, ROOM.h, 0.3); wallFront.position.set(0, ROOM.h/2,  ROOM.d/2);
  const wallLeft = wall(0.3, ROOM.h, ROOM.d); wallLeft.position.set(-ROOM.w/2, ROOM.h/2, 0);
  const wallRight= wall(0.3, ROOM.h, ROOM.d); wallRight.position.set( ROOM.w/2, ROOM.h/2, 0);
  room.add(wallBack, wallFront, wallLeft, wallRight);
  scene.add(room);

  return { ROOM, wallMat, ceilingHeight, balconyWidth: 5.0, lamparaOffsetY: offsetY };
}
