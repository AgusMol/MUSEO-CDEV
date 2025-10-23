import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createGoldenPlaque } from '../ui/plaques.js';

const vidriaMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.1, metalness: 0.0, roughness: 0.0 });
const marcoMaterial  = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.2 });

// Textura compartida para todas las vitrinas Jabulani
let jabulaniSharedTexture = null;
let jabulaniTextureLoading = false;
const jabulaniTextureCallbacks = [];

function loadJabulaniTexture(callback) {
  if (jabulaniSharedTexture) {
    callback(jabulaniSharedTexture);
    return;
  }
  
  jabulaniTextureCallbacks.push(callback);
  
  if (jabulaniTextureLoading) return;
  
  jabulaniTextureLoading = true;
  const tl = new THREE.TextureLoader();
  tl.load(
    '/assets/models/jabulani/textures/JABULANI_baseColor.png',
    (tex) => {
      tex.flipY = false;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      jabulaniSharedTexture = tex;
      jabulaniTextureCallbacks.forEach(cb => cb(tex));
      jabulaniTextureCallbacks.length = 0;
    },
    undefined,
    () => {
      jabulaniTextureCallbacks.forEach(cb => cb(null));
      jabulaniTextureCallbacks.length = 0;
    }
  );
}

export function createVitrina1(scene, interactables, x = -7.5, z = 6, rotationY = Math.PI){
  const group = new THREE.Group();
  const w=0.7,d=0.7,h=1.0; const base = new THREE.Mesh(new THREE.BoxGeometry(w+0.1,0.15,d+0.1), new THREE.MeshStandardMaterial({ color:0x1a1a1a, metalness:0.3, roughness:0.7 })); base.position.y=0.075; base.receiveShadow=base.castShadow=true; group.add(base);
  const col = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshStandardMaterial({ color:0x2a2a2a, metalness:0.4, roughness:0.6 })); col.position.y=h/2+0.15; col.receiveShadow=col.castShadow=true; group.add(col);
  const top = new THREE.Mesh(new THREE.BoxGeometry(w+0.05,0.08,d+0.05), new THREE.MeshStandardMaterial({ color:0x404040, metalness:0.5, roughness:0.4 })); top.position.y=h+0.15+0.04; top.receiveShadow=true; group.add(top);
  const vitH=0.65, vitW=0.65, vitD=0.65, thick=0.02, baseY = h+0.15+0.08; 
  const front = new THREE.Mesh(new THREE.BoxGeometry(vitW, vitH, thick), vidriaMaterial); front.position.set(0, baseY + vitH/2, vitD/2); group.add(front);
  const back  = new THREE.Mesh(new THREE.BoxGeometry(vitW, vitH, thick), vidriaMaterial); back.position.set(0, baseY + vitH/2, -vitD/2); group.add(back);
  const left  = new THREE.Mesh(new THREE.BoxGeometry(thick, vitH, vitD), vidriaMaterial); left.position.set(-vitW/2, baseY + vitH/2, 0); group.add(left);
  const right = new THREE.Mesh(new THREE.BoxGeometry(thick, vitH, vitD), vidriaMaterial); right.position.set( vitW/2, baseY + vitH/2, 0); group.add(right);
  const frameTop = new THREE.Mesh(new THREE.BoxGeometry(vitW + 0.06, 0.03, vitD + 0.06), marcoMaterial); frameTop.position.set(0, baseY + vitH + 0.015, 0); group.add(frameTop);

  const objetoGroup = new THREE.Group(); const pedestalInterno = new THREE.Mesh(new THREE.CylinderGeometry(0.20,0.20,0.15,32), new THREE.MeshStandardMaterial({ color:0x1a1a1a, metalness:0.4, roughness:0.6 })); pedestalInterno.position.y=0.075; pedestalInterno.castShadow=pedestalInterno.receiveShadow=true; objetoGroup.add(pedestalInterno);
  const modelRef = { current: null };
  function spawnJabulani(tex){ const geo = new THREE.SphereGeometry(0.15,64,32); const mat = new THREE.MeshStandardMaterial(tex?{ map:tex, color:0xffffff, metalness:0.1, roughness:0.7 }:{ color:0xffffff, metalness:0.1, roughness:0.7 }); const m = new THREE.Mesh(geo, mat); m.position.y=0.3; m.rotation.set(0,0,-Math.PI/2); m.castShadow=m.receiveShadow=true; objetoGroup.add(m); modelRef.current=m; }
  loadJabulaniTexture(spawnJabulani);
  objetoGroup.position.set(0, baseY, 0); group.add(objetoGroup);
  const luzObjeto = new THREE.SpotLight(0xffffff, 2.5, 6, Math.PI/8, 0.3, 1); luzObjeto.position.set(0, baseY + vitH + 1, 0); luzObjeto.target.position.set(0, baseY + 0.2, 0); luzObjeto.castShadow=false; group.add(luzObjeto); group.add(luzObjeto.target);

  const placa = createGoldenPlaque("JABULANI 2010", "Balón oficial utilizado en la Copa Mundial de la FIFA Sudáfrica 2010. El Jabulani, diseñado por Adidas, fue el primer balón esférico completamente redondo gracias a su innovadora tecnología de 8 paneles termoformados. Su nombre significa 'celebrar' en idioma zulú, representando el espíritu festivo del continente africano. Este ejemplar forma parte de la colección de objetos históricos del fútbol mundial.");
  placa.position.set(0.37, 0.9, 0); placa.rotation.set(0, -Math.PI/2, Math.PI); group.add(placa); interactables.push(placa);

  group.position.set(x, 0, z); group.rotation.y = rotationY; group.castShadow=group.receiveShadow=true; scene.add(group);
  return { group, baseY, vitH, jabulaniModelRef: modelRef, luzObjeto };
}

export function createVitrinaJabulani2(scene, interactables, x = -7.5, z = 6, rotationY = Math.PI){
  const group = new THREE.Group();
  const w=0.7,d=0.7,h=1.0; const base = new THREE.Mesh(new THREE.BoxGeometry(w+0.1,0.15,d+0.1), new THREE.MeshStandardMaterial({ color:0x1a1a1a, metalness:0.3, roughness:0.7 })); base.position.y=0.075; base.receiveShadow=base.castShadow=true; group.add(base);
  const col = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshStandardMaterial({ color:0x2a2a2a, metalness:0.4, roughness:0.6 })); col.position.y=h/2+0.15; col.receiveShadow=col.castShadow=true; group.add(col);
  const top = new THREE.Mesh(new THREE.BoxGeometry(w+0.05,0.08,d+0.05), new THREE.MeshStandardMaterial({ color:0x404040, metalness:0.5, roughness:0.4 })); top.position.y=h+0.15+0.04; top.receiveShadow=true; group.add(top);
  const vitH=0.65, vitW=0.65, vitD=0.65, thick=0.02, baseY = h+0.15+0.08; 
  const front = new THREE.Mesh(new THREE.BoxGeometry(vitW, vitH, thick), vidriaMaterial); front.position.set(0, baseY + vitH/2, vitD/2); group.add(front);
  const back  = new THREE.Mesh(new THREE.BoxGeometry(vitW, vitH, thick), vidriaMaterial); back.position.set(0, baseY + vitH/2, -vitD/2); group.add(back);
  const left  = new THREE.Mesh(new THREE.BoxGeometry(thick, vitH, vitD), vidriaMaterial); left.position.set(-vitW/2, baseY + vitH/2, 0); group.add(left);
  const right = new THREE.Mesh(new THREE.BoxGeometry(thick, vitH, vitD), vidriaMaterial); right.position.set( vitW/2, baseY + vitH/2, 0); group.add(right);
  const frameTop = new THREE.Mesh(new THREE.BoxGeometry(vitW + 0.06, 0.03, vitD + 0.06), marcoMaterial); frameTop.position.set(0, baseY + vitH + 0.015, 0); group.add(frameTop);

  const objetoGroup = new THREE.Group(); const pedestalInterno = new THREE.Mesh(new THREE.CylinderGeometry(0.20,0.20,0.15,32), new THREE.MeshStandardMaterial({ color:0x1a1a1a, metalness:0.4, roughness:0.6 })); pedestalInterno.position.y=0.075; pedestalInterno.castShadow=pedestalInterno.receiveShadow=true; objetoGroup.add(pedestalInterno);
  const modelRef = { current: null };
  
  // Cargar modelo GLTF de pelota_2022
  const gltfLoader = new GLTFLoader();
  gltfLoader.load('/assets/models/pelota_2022/scene.gltf', (gltf) => {
    const pelotaModel = gltf.scene;
    
    // Calcular tamaño y escalar
    const box = new THREE.Box3().setFromObject(pelotaModel);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 0.35; // Diámetro deseado (aumentado de 0.3 a 0.35)
    const scale = targetSize / maxDim;
    
    pelotaModel.scale.setScalar(scale);
    pelotaModel.position.set(0, 0.28, 0); // Subido a 0.28 para que quede mejor posicionado
    pelotaModel.rotation.set(0, 0, -Math.PI/2);
    
    // Configurar materiales y sombras
    pelotaModel.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        if (node.material) {
          if (node.material.map) {
            try { node.material.map.colorSpace = THREE.SRGBColorSpace; } catch(e) {}
          }
        }
      }
    });
    
    objetoGroup.add(pelotaModel);
    modelRef.current = pelotaModel;
    console.log('✅ Pelota 2022 cargada en vitrina Jabulani2');
  }, undefined, (error) => {
    console.error('❌ Error cargando pelota_2022 GLTF:', error);
  });
  
  objetoGroup.position.set(0, baseY, 0); group.add(objetoGroup);
  const luzObjeto = new THREE.SpotLight(0xffffff, 2.5, 6, Math.PI/8, 0.3, 1); luzObjeto.position.set(0, baseY + vitH + 1, 0); luzObjeto.target.position.set(0, baseY + 0.2, 0); luzObjeto.castShadow=false; group.add(luzObjeto); group.add(luzObjeto.target);

  const placa = createGoldenPlaque("AL RIHLA 2022", "Balón oficial utilizado en la Copa Mundial de la FIFA Qatar 2022. Al Rihla y cuyo nombre significa 'El Viaje' en árabe. Este balón fue testigo del histórico triunfo de Argentina en Qatar.");
  placa.position.set(0.37, 0.9, 0); placa.rotation.set(0, -Math.PI/2, Math.PI); group.add(placa); interactables.push(placa);

  group.position.set(x, 0, z); group.rotation.y = rotationY; group.castShadow=group.receiveShadow=true; scene.add(group);
  return { group, baseY, vitH, jabulaniModelRef: modelRef, luzObjeto };
}

export function createVitrinaJabulani3(scene, interactables, x = -7.5, z = 6, rotationY = Math.PI){
  const group = new THREE.Group();
  const w=0.7,d=0.7,h=1.0; const base = new THREE.Mesh(new THREE.BoxGeometry(w+0.1,0.15,d+0.1), new THREE.MeshStandardMaterial({ color:0x1a1a1a, metalness:0.3, roughness:0.7 })); base.position.y=0.075; base.receiveShadow=base.castShadow=true; group.add(base);
  const col = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshStandardMaterial({ color:0x2a2a2a, metalness:0.4, roughness:0.6 })); col.position.y=h/2+0.15; col.receiveShadow=col.castShadow=true; group.add(col);
  const top = new THREE.Mesh(new THREE.BoxGeometry(w+0.05,0.08,d+0.05), new THREE.MeshStandardMaterial({ color:0x404040, metalness:0.5, roughness:0.4 })); top.position.y=h+0.15+0.04; top.receiveShadow=true; group.add(top);
  const vitH=0.65, vitW=0.65, vitD=0.65, thick=0.02, baseY = h+0.15+0.08; 
  const front = new THREE.Mesh(new THREE.BoxGeometry(vitW, vitH, thick), vidriaMaterial); front.position.set(0, baseY + vitH/2, vitD/2); group.add(front);
  const back  = new THREE.Mesh(new THREE.BoxGeometry(vitW, vitH, thick), vidriaMaterial); back.position.set(0, baseY + vitH/2, -vitD/2); group.add(back);
  const left  = new THREE.Mesh(new THREE.BoxGeometry(thick, vitH, vitD), vidriaMaterial); left.position.set(-vitW/2, baseY + vitH/2, 0); group.add(left);
  const right = new THREE.Mesh(new THREE.BoxGeometry(thick, vitH, vitD), vidriaMaterial); right.position.set( vitW/2, baseY + vitH/2, 0); group.add(right);
  const frameTop = new THREE.Mesh(new THREE.BoxGeometry(vitW + 0.06, 0.03, vitD + 0.06), marcoMaterial); frameTop.position.set(0, baseY + vitH + 0.015, 0); group.add(frameTop);

  const objetoGroup = new THREE.Group(); const pedestalInterno = new THREE.Mesh(new THREE.CylinderGeometry(0.20,0.20,0.15,32), new THREE.MeshStandardMaterial({ color:0x1a1a1a, metalness:0.4, roughness:0.6 })); pedestalInterno.position.y=0.075; pedestalInterno.castShadow=pedestalInterno.receiveShadow=true; objetoGroup.add(pedestalInterno);
  const modelRef = { current: null };
  
  // Cargar modelo GLTF de Tango 78
  const gltfLoader = new GLTFLoader();
  gltfLoader.load('/assets/models/1978_world_cup_argentina_-_tango_78/scene.gltf', (gltf) => {
    const tangoModel = gltf.scene;
    
    // El modelo tiene 2 pelotas, vamos a mostrar solo una
    let pelotaCount = 0;
    tangoModel.traverse((node) => {
      if (node.isMesh) {
        pelotaCount++;
        // Ocultar la segunda pelota (mantener solo la primera)
        if (pelotaCount > 1) {
          node.visible = false;
        } else {
          node.castShadow = true;
          node.receiveShadow = true;
          if (node.material) {
            if (node.material.map) {
              try { node.material.map.colorSpace = THREE.SRGBColorSpace; } catch(e) {}
            }
          }
        }
      }
    });
    
    // Calcular bounding box de lo que queda visible
    const box = new THREE.Box3().setFromObject(tangoModel);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 0.75; // Mismo tamaño que Jabulani y Pelota 2022
    const scale = targetSize / maxDim;
    
    // Aplicar escala al modelo
    tangoModel.scale.setScalar(scale);
    
    // Posicionar
    tangoModel.position.set(-0.36, 0.31, 0);
    tangoModel.rotation.set(0, 1.5, 0);
    
    objetoGroup.add(tangoModel);
    modelRef.current = tangoModel;
    console.log('✅ Tango 78 cargado en vitrina Jabulani3 (mostrando 1 de 2 pelotas)');
  }, undefined, (error) => {
    console.error('❌ Error cargando Tango 78 GLTF:', error);
  });
  
  objetoGroup.position.set(0, baseY, 0); group.add(objetoGroup);
  const luzObjeto = new THREE.SpotLight(0xffffff, 2.5, 6, Math.PI/8, 0.3, 1); luzObjeto.position.set(0, baseY + vitH + 1, 0); luzObjeto.target.position.set(0, baseY + 0.2, 0); luzObjeto.castShadow=false; group.add(luzObjeto); group.add(luzObjeto.target);

  const placa = createGoldenPlaque("TANGO 1978", "Balón oficial utilizado en la Copa Mundial de la FIFA Argentina 1978. El Adidas Tango revolucionó el diseño de balones de fútbol con sus icónicos triángulos negros que creaban una ilusión de círculos perfectos. Este modelo introdujo un diseño que se convertiría en el estándar por más de dos décadas. Con este balón, Argentina conquistó su primer título mundial, venciendo 3-1 a Holanda en la final disputada en el Estadio Monumental de Buenos Aires.");
  placa.position.set(0.37, 0.9, 0); placa.rotation.set(0, -Math.PI/2, Math.PI); group.add(placa); interactables.push(placa);

  group.position.set(x, 0, z); group.rotation.y = rotationY; group.castShadow=group.receiveShadow=true; scene.add(group);
  return { group, baseY, vitH, jabulaniModelRef: modelRef, luzObjeto };
}

export function createVitrina2(scene, interactables, x = -7.5, z = 3, rotationY = Math.PI){
  const group = new THREE.Group(); const w=0.7,d=0.7,h=1.0; const base = new THREE.Mesh(new THREE.BoxGeometry(w+0.1,0.15,d+0.1), new THREE.MeshStandardMaterial({ color:0x1a1a1a, metalness:0.3, roughness:0.7 })); base.position.y=0.075; base.receiveShadow=base.castShadow=true; group.add(base);
  const col = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshStandardMaterial({ color:0x2a2a2a, metalness:0.4, roughness:0.6 })); col.position.y=h/2+0.15; col.receiveShadow=col.castShadow=true; group.add(col);
  const top = new THREE.Mesh(new THREE.BoxGeometry(w+0.05,0.08,d+0.05), new THREE.MeshStandardMaterial({ color:0x404040, metalness:0.5, roughness:0.4 })); top.position.y=h+0.15+0.04; top.receiveShadow=true; group.add(top);
  const baseY = h+0.15+0.08; const front=new THREE.Mesh(new THREE.BoxGeometry(0.65,0.65,0.02),vidriaMaterial); front.position.set(0, baseY+0.325, 0.325); group.add(front);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.65,0.65,0.02),vidriaMaterial); back.position.set(0, baseY+0.325, -0.325); group.add(back);
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.02,0.65,0.65),vidriaMaterial); left.position.set(-0.325, baseY+0.325, 0); group.add(left);
  const right= new THREE.Mesh(new THREE.BoxGeometry(0.02,0.65,0.65),vidriaMaterial); right.position.set( 0.325, baseY+0.325, 0); group.add(right);
  const techo = new THREE.Mesh(new THREE.BoxGeometry(0.65,0.02,0.65), vidriaMaterial); techo.position.set(0, baseY+0.65, 0); group.add(techo);
  const marcoSup = new THREE.Mesh(new THREE.BoxGeometry(0.65+0.06,0.03,0.65+0.06), marcoMaterial); marcoSup.position.set(0, baseY+0.65+0.015, 0); group.add(marcoSup);

  const trofeoGroup = new THREE.Group(); const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,0.15,32), new THREE.MeshStandardMaterial({ color:0x1a1a1a, metalness:0.4, roughness:0.6 })); pedestal.position.y=0.075; pedestal.castShadow=pedestal.receiveShadow=true; trofeoGroup.add(pedestal);
  
  // Crear fallback visible mientras carga
  const fallback=new THREE.Group(); 
  const baseVerde=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,0.03,32), new THREE.MeshStandardMaterial({ color:0x2d5016, metalness:0.3, roughness:0.7 })); baseVerde.position.y=0.165; fallback.add(baseVerde);
  const baseDorada=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.04,32), new THREE.MeshStandardMaterial({ color:0xffd700, metalness:0.95, roughness:0.05 })); baseDorada.position.y=0.19; fallback.add(baseDorada);
  const cuerpoInf=new THREE.Mesh(new THREE.CylinderGeometry(0.065,0.075,0.08,32), new THREE.MeshStandardMaterial({ color:0xffd700, metalness:0.95, roughness:0.05 })); cuerpoInf.position.y=0.25; fallback.add(cuerpoInf);
  const cuerpoMed=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.065,0.12,32), new THREE.MeshStandardMaterial({ color:0xffd700, metalness:0.95, roughness:0.05 })); cuerpoMed.position.y=0.35; fallback.add(cuerpoMed);
  const cuerpoSup=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.05,0.08,32), new THREE.MeshStandardMaterial({ color:0xffd700, metalness:0.95, roughness:0.05 })); cuerpoSup.position.y=0.43; fallback.add(cuerpoSup);
  const trans=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.045,0.03,32), new THREE.MeshStandardMaterial({ color:0xffd700, metalness:0.95, roughness:0.05 })); trans.position.y=0.485; fallback.add(trans);
  const globo=new THREE.Mesh(new THREE.SphereGeometry(0.075,32,24), new THREE.MeshStandardMaterial({ color:0xffd700, metalness:0.95, roughness:0.05 })); globo.position.y=0.56; fallback.add(globo);
  fallback.position.y=0.25; fallback.traverse(c=>{ if(c.isMesh){ c.castShadow=c.receiveShadow=true; } }); 
  trofeoGroup.add(fallback);
  
  const gltf = new GLTFLoader(); const modelRef = { current: fallback };
  gltf.load('/assets/models/world_cup_trophy/scene.gltf', (gltf)=>{
    console.log('✅ Copa del Mundo GLTF cargado exitosamente', gltf.scene);
    const trofeoModel = gltf.scene; 
    const box=new THREE.Box3().setFromObject(trofeoModel); 
    const size=box.getSize(new THREE.Vector3()); 
    console.log('📏 Tamaño original del modelo:', size);
    const maxDim=Math.max(size.x,size.y,size.z); 
    const scale=0.5/maxDim; 
    console.log('🔍 Escala calculada:', scale, 'maxDim:', maxDim);
    trofeoModel.scale.setScalar(scale); 
    trofeoModel.position.set(0,0.15,0);
    console.log('📍 Posición final del trofeo:', trofeoModel.position);
    trofeoModel.traverse(c=>{ if(c.isMesh){ c.castShadow=c.receiveShadow=true; if(c.material){ c.material=c.material.clone(); c.material.metalness=0.95; c.material.roughness=0.05; c.material.color.setHex(0xffd700);} } });
    // Remover el fallback y agregar el modelo real
    trofeoGroup.remove(fallback);
    trofeoGroup.add(trofeoModel);
    modelRef.current = trofeoModel;
    console.log('✅ Copa del Mundo agregada al grupo. Children:', trofeoGroup.children.length);
  }, undefined, (error)=>{
    console.error('❌ Error cargando Copa del Mundo GLTF:', error);
    // El fallback ya está visible, no hacer nada
  });
  trofeoGroup.position.set(0, baseY, 0); group.add(trofeoGroup);
  const luzTrofeo=new THREE.SpotLight(0xffffff, 8.0, 10, Math.PI/3, 0.1, 1); luzTrofeo.position.set(0, baseY+0.65+1.5, 0); luzTrofeo.target.position.set(0, baseY+0.2, 0); luzTrofeo.castShadow=true; group.add(luzTrofeo); group.add(luzTrofeo.target);
  const luzLateral=new THREE.PointLight(0xffffff, 2.5, 3); luzLateral.position.set(0.3, baseY+0.4, 0.3); group.add(luzLateral);
  const luzLateral2=new THREE.PointLight(0xffffff, 2.0, 3); luzLateral2.position.set(-0.3, baseY+0.4, -0.3); group.add(luzLateral2);
  const luzAmbientalTrofeo=new THREE.AmbientLight(0xffffff, 0.4); group.add(luzAmbientalTrofeo);

  const placa = createGoldenPlaque("COPA MUNDIAL FIFA 1986", "Réplica oficial del trofeo más codiciado del fútbol mundial. La Copa del Mundo FIFA, representa la máxima distinción en el fútbol internacional. Diseñado por el artista italiano Silvio Gazzaniga en 1974, está hecho de oro macizo de 18 quilates y pesa 6.142 kg. En su base circular se graban los nombres de los países campeones.");
  placa.position.set(0.37, 0.9, 0); placa.rotation.set(0, -Math.PI/2, Math.PI); group.add(placa); interactables.push(placa);

  group.position.set(x, 0, z); group.rotation.y = rotationY; group.castShadow=group.receiveShadow=true; scene.add(group);
  return { group, baseY, trofeoModelRef: modelRef, luces: { luzTrofeo, luzLateral, luzLateral2 } };
}

export function createVitrinaLibertadores(scene, interactables, x = -7.5, z = 0, rotationY = Math.PI){
  const group = new THREE.Group(); const w=0.7,d=0.7,h=1.0; const base = new THREE.Mesh(new THREE.BoxGeometry(w+0.1,0.15,d+0.1), new THREE.MeshStandardMaterial({ color:0x1a1a1a, metalness:0.3, roughness:0.7 })); base.position.y=0.075; base.receiveShadow=base.castShadow=true; group.add(base);
  const col = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshStandardMaterial({ color:0x2a2a2a, metalness:0.4, roughness:0.6 })); col.position.y=h/2+0.15; col.receiveShadow=col.castShadow=true; group.add(col);
  const top = new THREE.Mesh(new THREE.BoxGeometry(w+0.05,0.08,d+0.05), new THREE.MeshStandardMaterial({ color:0x404040, metalness:0.5, roughness:0.4 })); top.position.y=h+0.15+0.04; top.receiveShadow=true; group.add(top);
  const baseY = h+0.15+0.08; const glassH=0.95; const front=new THREE.Mesh(new THREE.BoxGeometry(0.65,glassH,0.02),vidriaMaterial); front.position.set(0, baseY+glassH/2, 0.65/2); group.add(front);
  const back=new THREE.Mesh(new THREE.BoxGeometry(0.65,glassH,0.02),vidriaMaterial); back.position.set(0, baseY+glassH/2, -0.65/2); group.add(back);
  const left=new THREE.Mesh(new THREE.BoxGeometry(0.02,glassH,0.65),vidriaMaterial); left.position.set(-0.65/2, baseY+glassH/2, 0); group.add(left);
  const right=new THREE.Mesh(new THREE.BoxGeometry(0.02,glassH,0.65),vidriaMaterial); right.position.set(0.65/2, baseY+glassH/2, 0); group.add(right);
  const techo=new THREE.Mesh(new THREE.BoxGeometry(0.65,0.02,0.65), vidriaMaterial); techo.position.set(0, baseY+glassH, 0); group.add(techo);
  const marcoSup=new THREE.Mesh(new THREE.BoxGeometry(0.65+0.06,0.03,0.65+0.06), marcoMaterial); marcoSup.position.set(0, baseY+glassH+0.015, 0); group.add(marcoSup);
  const innerGroup=new THREE.Group(); const pedestal=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,0.15,32), new THREE.MeshStandardMaterial({ color:0x1a1a1a, metalness:0.4, roughness:0.6 })); pedestal.position.y=0.075; pedestal.castShadow=pedestal.receiveShadow=true; innerGroup.add(pedestal);
  const gltf=new GLTFLoader(); const modelRef = { current: null }; gltf.load('/assets/models/copa_america_trophy/scene.gltf', (gltf)=>{ const copaModel=gltf.scene; copaModel.scale.set(0.25,0.25,0.25); copaModel.position.set(0,0.1605,0); copaModel.traverse(n=>{ if(n.isMesh){ n.castShadow=n.receiveShadow=true; const m=n.material; if(m){ if(Array.isArray(m)){ m.forEach(mm=>{ if(mm && mm.map) try{ mm.map.colorSpace=THREE.SRGBColorSpace; }catch(e){} }); } else { if(m.map) try{ m.map.colorSpace=THREE.SRGBColorSpace; }catch(e){} if(m.normalMap) try{ m.normalMap.colorSpace=THREE.LinearSRGBColorSpace; }catch(e){} } } } }); innerGroup.add(copaModel); modelRef.current = copaModel; }, undefined, (e)=>console.error('Copa América 2021 GLTF error', e));
  innerGroup.position.set(0, baseY, 0); group.add(innerGroup);
  const spot=new THREE.SpotLight(0xffffff, 6.0, 10, Math.PI/3, 0.1, 1); spot.position.set(0, baseY + glassH + 1.5, 0); spot.target.position.set(0, baseY + 0.2, 0); spot.castShadow=true; group.add(spot); group.add(spot.target);
  const l1=new THREE.PointLight(0xffffff, 2.5, 4); l1.position.set(0.3, baseY + glassH * 0.6, 0.3); group.add(l1);
  const l2=new THREE.PointLight(0xffffff, 2.0, 4); l2.position.set(-0.3, baseY + glassH * 0.6, -0.3); group.add(l2);
  const amb=new THREE.AmbientLight(0xffffff, 0.4); group.add(amb);
  const placa = createGoldenPlaque("COPA AMÉRICA 2021", "Trofeo de la Copa AMÉRICA 2021."); placa.position.set(0.37, 0.9, 0); placa.rotation.set(0, -Math.PI/2, Math.PI); group.add(placa); interactables.push(placa);
  group.position.set(x, 0, z); group.rotation.y = rotationY; group.castShadow=group.receiveShadow=true; scene.add(group);
  return { group, baseY, glassH, copaModelRef: modelRef, luces: { spot, l1, l2 } };
}

export function createVitrinaAmerica(scene, interactables, x = -7.5, z = -3, rotationY = Math.PI){
  const group = new THREE.Group(); const w=0.7,d=0.7,h=1.0; const base = new THREE.Mesh(new THREE.BoxGeometry(w+0.1,0.15,d+0.1), new THREE.MeshStandardMaterial({ color:0x1a1a1a, metalness:0.3, roughness:0.7 })); base.position.y=0.075; base.receiveShadow=base.castShadow=true; group.add(base);
  const col = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshStandardMaterial({ color:0x2a2a2a, metalness:0.4, roughness:0.6 })); col.position.y=h/2+0.15; col.receiveShadow=col.castShadow=true; group.add(col);
  const top = new THREE.Mesh(new THREE.BoxGeometry(w+0.05,0.08,d+0.05), new THREE.MeshStandardMaterial({ color:0x404040, metalness:0.5, roughness:0.4 })); top.position.y=h+0.15+0.04; top.receiveShadow=true; group.add(top);
  const baseY = h+0.15+0.08; const glassH=0.95; const front=new THREE.Mesh(new THREE.BoxGeometry(0.65,glassH,0.02),vidriaMaterial); front.position.set(0, baseY+glassH/2, 0.65/2); group.add(front);
  const back=new THREE.Mesh(new THREE.BoxGeometry(0.65,glassH,0.02),vidriaMaterial); back.position.set(0, baseY+glassH/2, -0.65/2); group.add(back);
  const left=new THREE.Mesh(new THREE.BoxGeometry(0.02,glassH,0.65),vidriaMaterial); left.position.set(-0.65/2, baseY+glassH/2, 0); group.add(left);
  const right=new THREE.Mesh(new THREE.BoxGeometry(0.02,glassH,0.65),vidriaMaterial); right.position.set(0.65/2, baseY+glassH/2, 0); group.add(right);
  const techo=new THREE.Mesh(new THREE.BoxGeometry(0.65,0.02,0.65), vidriaMaterial); techo.position.set(0, baseY+glassH, 0); group.add(techo);
  const marcoSup=new THREE.Mesh(new THREE.BoxGeometry(0.65+0.06,0.03,0.65+0.06), marcoMaterial); marcoSup.position.set(0, baseY+glassH+0.015, 0); group.add(marcoSup);
  const innerGroup=new THREE.Group(); const pedestal=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,0.15,32), new THREE.MeshStandardMaterial({ color:0x1a1a1a, metalness:0.4, roughness:0.6 })); pedestal.position.y=0.075; pedestal.castShadow=pedestal.receiveShadow=true; innerGroup.add(pedestal);
  const gltf=new GLTFLoader(); const modelRef = { current: null }; gltf.load('/assets/models/copa_america_trophy/scene.gltf', (gltf)=>{ const copaModel=gltf.scene; copaModel.scale.set(0.25,0.25,0.25); copaModel.position.set(0,0.1605,0); copaModel.traverse(n=>{ if(n.isMesh){ n.castShadow=n.receiveShadow=true; const m=n.material; if(m){ if(Array.isArray(m)){ m.forEach(mm=>{ if(mm && mm.map) try{ mm.map.colorSpace=THREE.SRGBColorSpace; }catch(e){} }); } else { if(m.map) try{ m.map.colorSpace=THREE.SRGBColorSpace; }catch(e){} if(m.normalMap) try{ m.normalMap.colorSpace=THREE.LinearSRGBColorSpace; }catch(e){} } } } }); innerGroup.add(copaModel); modelRef.current = copaModel; }, undefined, (e)=>console.error('Copa América GLTF error', e));
  innerGroup.position.set(0, baseY, 0); group.add(innerGroup);
  const spot=new THREE.SpotLight(0xffffff, 6.0, 10, Math.PI/3, 0.1, 1); spot.position.set(0, baseY + glassH + 1.5, 0); spot.target.position.set(0, baseY + 0.2, 0); spot.castShadow=true; group.add(spot); group.add(spot.target);
  const l1=new THREE.PointLight(0xffffff, 2.5, 4); l1.position.set(0.3, baseY + glassH * 0.6, 0.3); group.add(l1);
  const l2=new THREE.PointLight(0xffffff, 2.0, 4); l2.position.set(-0.3, baseY + glassH * 0.6, -0.3); group.add(l2);
  const amb=new THREE.AmbientLight(0xffffff, 0.4); group.add(amb);
  const placa = createGoldenPlaque("COPA AMÉRICA 2024", "Trofeo de la Copa AMÉRICA 2024."); placa.position.set(0.37, 0.9, 0); placa.rotation.set(0, -Math.PI/2, Math.PI); group.add(placa); interactables.push(placa);
  group.position.set(x, 0, z); group.rotation.y = rotationY; group.castShadow=group.receiveShadow=true; scene.add(group);
  return { group, baseY, glassH, copaModelRef: modelRef, luces: { spot, l1, l2 } };
}

export function createVitrinaCentralEscudo(scene, interactables, ROOM, x = 0, z = 0, rotationY = 0){
  const group = new THREE.Group();
  const tallRadius = 2.5; const tallGlassHeight = ROOM.h - 0.02;
  const tallBase = new THREE.Mesh(new THREE.CylinderGeometry(tallRadius+0.05, tallRadius+0.05, 0.18, 64), new THREE.MeshStandardMaterial({ color:0x141414, metalness:0.4, roughness:0.6 })); tallBase.position.y=0.09; tallBase.castShadow=false; tallBase.receiveShadow=true; group.add(tallBase);
  const glassMat = new THREE.MeshStandardMaterial({ color:0xffffff, transparent:true, opacity:0.18, metalness:0, roughness:0 });
  const tallGlass = new THREE.Mesh(new THREE.CylinderGeometry(tallRadius, tallRadius, tallGlassHeight, 64, 1, true), glassMat); tallGlass.position.y=tallGlassHeight/2; tallGlass.castShadow=false; tallGlass.receiveShadow=true; group.add(tallGlass);
  const topRing = new THREE.Mesh(new THREE.TorusGeometry(tallRadius+0.02, 0.04, 16, 100), marcoMaterial); topRing.rotation.x = Math.PI/2; topRing.position.y = tallGlassHeight; group.add(topRing);
  const ceilingLight = new THREE.SpotLight(0xffffff, 3.5, ROOM.h, Math.PI/6, 0.08, 1); ceilingLight.position.set(0, tallGlassHeight + 0.3, 0); ceilingLight.target.position.set(0, 0.6, 0); ceilingLight.castShadow=false; group.add(ceilingLight); group.add(ceilingLight.target);

  // Escudo flotante SIN pedestales
  const escudoGroup = new THREE.Group();
  const gltf = new GLTFLoader(); const escudoModelRef = { current: null }; const escudoPlaceholderRef = { current: null };
  const escudoTextureLoader = new THREE.TextureLoader(); escudoTextureLoader.load('/assets/models/escudo_afa_-_argentina__afa_shield_-_argentina/textures/escudo-afa_baseColor.png', (tex)=>{ try{ tex.flipY=false; tex.colorSpace=THREE.SRGBColorSpace; }catch(e){} const mat=new THREE.MeshStandardMaterial({ map:tex, side:THREE.DoubleSide }); const escudoPlaceholder = new THREE.Mesh(new THREE.PlaneGeometry(0.9,1.1), mat); escudoPlaceholder.position.set(0, 2.5, 0); escudoPlaceholder.rotation.y = Math.PI; escudoPlaceholder.castShadow=escudoPlaceholder.receiveShadow=true; escudoGroup.add(escudoPlaceholder); escudoPlaceholderRef.current = escudoPlaceholder; });
  // ⚠️ ALTURA DEL MODELO: Y=4.5 sube el escudo para ocultar la base oscura del modelo
  gltf.load('/assets/models/escudo_afa_-_argentina__afa_shield_-_argentina/scene.gltf', (gltf)=>{ const escudoModel=gltf.scene; escudoModel.scale.set(3,3,3); escudoModel.position.set(0, 2, 0); escudoModel.rotation.set(0, Math.PI, 0); escudoModel.traverse(n=>{ if(n.isMesh){ n.castShadow=n.receiveShadow=true; const old=n.material; let map=null; if(old){ if(Array.isArray(old)){ const f=old.find(m=>m&&m.map); map=f?f.map:(old[0]&&old[0].map?old[0].map:null);} else { map=old.map||null; } } if(map) try{ map.colorSpace=THREE.SRGBColorSpace; }catch(e){} n.material = new THREE.MeshStandardMaterial({ map: map||null, metalness:0.2, roughness:0.8 }); n.material.needsUpdate=true; } }); escudoGroup.add(escudoModel); if(escudoPlaceholderRef.current) escudoPlaceholderRef.current.visible=false; escudoModelRef.current = escudoModel; });
  const luzEscudo = new THREE.SpotLight(0xffffff, 3.0, 10, Math.PI/6, 0.12, 1); luzEscudo.position.set(0, tallGlassHeight - 0.5, 0); luzEscudo.target.position.set(0, 0.2, 0); luzEscudo.castShadow=true; group.add(luzEscudo); group.add(luzEscudo.target);
  // ⚠️ POSICIÓN DEL GRUPO: Línea siguiente controla la altura del grupo completo (actualmente Y=0)
  escudoGroup.position.set(0, 0, 0); group.add(escudoGroup); interactables.push(escudoGroup);
  group.position.set(x, 0, z); group.rotation.y = rotationY; group.castShadow=group.receiveShadow=true; scene.add(group);
  return { group, tallRadius, escudoModelRef, escudoPlaceholderRef };
}

// Copa del Mundo - Duplicado 1
export function createVitrinaWorldCup3(scene, interactables, x = 5, z = 5, rotationY = Math.PI){
  const group = new THREE.Group(); const w=0.7,d=0.7,h=1.0; const base = new THREE.Mesh(new THREE.BoxGeometry(w+0.1,0.15,d+0.1), new THREE.MeshStandardMaterial({ color:0x1a1a1a, metalness:0.3, roughness:0.7 })); base.position.y=0.075; base.receiveShadow=base.castShadow=true; group.add(base);
  const col = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshStandardMaterial({ color:0x2a2a2a, metalness:0.4, roughness:0.6 })); col.position.y=h/2+0.15; col.receiveShadow=col.castShadow=true; group.add(col);
  const top = new THREE.Mesh(new THREE.BoxGeometry(w+0.05,0.08,d+0.05), new THREE.MeshStandardMaterial({ color:0x404040, metalness:0.5, roughness:0.4 })); top.position.y=h+0.15+0.04; top.receiveShadow=true; group.add(top);
  const baseY = h+0.15+0.08; const front=new THREE.Mesh(new THREE.BoxGeometry(0.65,0.65,0.02),vidriaMaterial); front.position.set(0, baseY+0.325, 0.325); group.add(front);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.65,0.65,0.02),vidriaMaterial); back.position.set(0, baseY+0.325, -0.325); group.add(back);
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.02,0.65,0.65),vidriaMaterial); left.position.set(-0.325, baseY+0.325, 0); group.add(left);
  const right= new THREE.Mesh(new THREE.BoxGeometry(0.02,0.65,0.65),vidriaMaterial); right.position.set( 0.325, baseY+0.325, 0); group.add(right);
  const techo = new THREE.Mesh(new THREE.BoxGeometry(0.65,0.02,0.65), vidriaMaterial); techo.position.set(0, baseY+0.65, 0); group.add(techo);
  const marcoSup = new THREE.Mesh(new THREE.BoxGeometry(0.65+0.06,0.03,0.65+0.06), marcoMaterial); marcoSup.position.set(0, baseY+0.65+0.015, 0); group.add(marcoSup);

  const trofeoGroup = new THREE.Group(); const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,0.15,32), new THREE.MeshStandardMaterial({ color:0x1a1a1a, metalness:0.4, roughness:0.6 })); pedestal.position.y=0.075; pedestal.castShadow=pedestal.receiveShadow=true; trofeoGroup.add(pedestal);
  
  // Crear fallback visible mientras carga
  const fallback=new THREE.Group(); 
  const baseVerde=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,0.03,32), new THREE.MeshStandardMaterial({ color:0x2d5016, metalness:0.3, roughness:0.7 })); baseVerde.position.y=0.165; fallback.add(baseVerde);
  const baseDorada=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.04,32), new THREE.MeshStandardMaterial({ color:0xffd700, metalness:0.95, roughness:0.05 })); baseDorada.position.y=0.19; fallback.add(baseDorada);
  const cuerpoInf=new THREE.Mesh(new THREE.CylinderGeometry(0.065,0.075,0.08,32), new THREE.MeshStandardMaterial({ color:0xffd700, metalness:0.95, roughness:0.05 })); cuerpoInf.position.y=0.25; fallback.add(cuerpoInf);
  const cuerpoMed=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.065,0.12,32), new THREE.MeshStandardMaterial({ color:0xffd700, metalness:0.95, roughness:0.05 })); cuerpoMed.position.y=0.35; fallback.add(cuerpoMed);
  const cuerpoSup=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.05,0.08,32), new THREE.MeshStandardMaterial({ color:0xffd700, metalness:0.95, roughness:0.05 })); cuerpoSup.position.y=0.43; fallback.add(cuerpoSup);
  const trans=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.045,0.03,32), new THREE.MeshStandardMaterial({ color:0xffd700, metalness:0.95, roughness:0.05 })); trans.position.y=0.485; fallback.add(trans);
  const globo=new THREE.Mesh(new THREE.SphereGeometry(0.075,32,24), new THREE.MeshStandardMaterial({ color:0xffd700, metalness:0.95, roughness:0.05 })); globo.position.y=0.56; fallback.add(globo);
  fallback.position.y=0.25; fallback.traverse(c=>{ if(c.isMesh){ c.castShadow=c.receiveShadow=true; } }); 
  trofeoGroup.add(fallback);
  
  const gltf = new GLTFLoader(); const modelRef = { current: fallback };
  gltf.load('/assets/models/world_cup_trophy/scene.gltf', (gltf)=>{
    console.log('✅ Copa del Mundo 3 GLTF cargado exitosamente', gltf.scene);
    const trofeoModel = gltf.scene; 
    const box=new THREE.Box3().setFromObject(trofeoModel); 
    const size=box.getSize(new THREE.Vector3()); 
    const maxDim=Math.max(size.x,size.y,size.z); 
    const scale=0.5/maxDim; 
    trofeoModel.scale.setScalar(scale); 
    trofeoModel.position.set(0,0.15,0);
    trofeoModel.traverse(c=>{ if(c.isMesh){ c.castShadow=c.receiveShadow=true; if(c.material){ c.material=c.material.clone(); c.material.metalness=0.95; c.material.roughness=0.05; c.material.color.setHex(0xffd700);} } });
    trofeoGroup.remove(fallback);
    trofeoGroup.add(trofeoModel);
    modelRef.current = trofeoModel;
    console.log('✅ Copa del Mundo 3 agregada al grupo');
  }, undefined, (error)=>{
    console.error('❌ Error cargando Copa del Mundo 3 GLTF:', error);
  });
  trofeoGroup.position.set(0, baseY, 0); group.add(trofeoGroup);
  const luzTrofeo=new THREE.SpotLight(0xffffff, 8.0, 10, Math.PI/3, 0.1, 1); luzTrofeo.position.set(0, baseY+0.65+1.5, 0); luzTrofeo.target.position.set(0, baseY+0.2, 0); luzTrofeo.castShadow=true; group.add(luzTrofeo); group.add(luzTrofeo.target);
  const luzLateral=new THREE.PointLight(0xffffff, 2.5, 3); luzLateral.position.set(0.3, baseY+0.4, 0.3); group.add(luzLateral);
  const luzLateral2=new THREE.PointLight(0xffffff, 2.0, 3); luzLateral2.position.set(-0.3, baseY+0.4, -0.3); group.add(luzLateral2);
  const luzAmbientalTrofeo=new THREE.AmbientLight(0xffffff, 0.4); group.add(luzAmbientalTrofeo);

  const placa = createGoldenPlaque("COPA MUNDIAL FIFA 1978", "Réplica oficial del trofeo de la FIFA 1978. La Copa del Mundo FIFA, también conocida como el Trofeo Jules Rimet hasta 1970, representa la máxima distinción en el fútbol internacional. Diseñado por el artista italiano Silvio Gazzaniga en 1974, está hecho de oro macizo de 18 quilates y pesa 6.142 kg. En su base circular se graban los nombres de los países campeones.");
  placa.position.set(0.37, 0.9, 0); placa.rotation.set(0, -Math.PI/2, Math.PI); group.add(placa); interactables.push(placa);

  group.position.set(x, 0, z); group.rotation.y = rotationY; group.castShadow=group.receiveShadow=true; scene.add(group);
  return { group, baseY, trofeoModelRef: modelRef, luces: { luzTrofeo, luzLateral, luzLateral2 } };
}

// Copa del Mundo - Duplicado 2
export function createVitrinaWorldCup4(scene, interactables, x = 7, z = 7, rotationY = Math.PI){
  const group = new THREE.Group(); const w=0.7,d=0.7,h=1.0; const base = new THREE.Mesh(new THREE.BoxGeometry(w+0.1,0.15,d+0.1), new THREE.MeshStandardMaterial({ color:0x1a1a1a, metalness:0.3, roughness:0.7 })); base.position.y=0.075; base.receiveShadow=base.castShadow=true; group.add(base);
  const col = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshStandardMaterial({ color:0x2a2a2a, metalness:0.4, roughness:0.6 })); col.position.y=h/2+0.15; col.receiveShadow=col.castShadow=true; group.add(col);
  const top = new THREE.Mesh(new THREE.BoxGeometry(w+0.05,0.08,d+0.05), new THREE.MeshStandardMaterial({ color:0x404040, metalness:0.5, roughness:0.4 })); top.position.y=h+0.15+0.04; top.receiveShadow=true; group.add(top);
  const baseY = h+0.15+0.08; const front=new THREE.Mesh(new THREE.BoxGeometry(0.65,0.65,0.02),vidriaMaterial); front.position.set(0, baseY+0.325, 0.325); group.add(front);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.65,0.65,0.02),vidriaMaterial); back.position.set(0, baseY+0.325, -0.325); group.add(back);
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.02,0.65,0.65),vidriaMaterial); left.position.set(-0.325, baseY+0.325, 0); group.add(left);
  const right= new THREE.Mesh(new THREE.BoxGeometry(0.02,0.65,0.65),vidriaMaterial); right.position.set( 0.325, baseY+0.325, 0); group.add(right);
  const techo = new THREE.Mesh(new THREE.BoxGeometry(0.65,0.02,0.65), vidriaMaterial); techo.position.set(0, baseY+0.65, 0); group.add(techo);
  const marcoSup = new THREE.Mesh(new THREE.BoxGeometry(0.65+0.06,0.03,0.65+0.06), marcoMaterial); marcoSup.position.set(0, baseY+0.65+0.015, 0); group.add(marcoSup);

  const trofeoGroup = new THREE.Group(); const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,0.15,32), new THREE.MeshStandardMaterial({ color:0x1a1a1a, metalness:0.4, roughness:0.6 })); pedestal.position.y=0.075; pedestal.castShadow=pedestal.receiveShadow=true; trofeoGroup.add(pedestal);
  
  // Crear fallback visible mientras carga
  const fallback=new THREE.Group(); 
  const baseVerde=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,0.03,32), new THREE.MeshStandardMaterial({ color:0x2d5016, metalness:0.3, roughness:0.7 })); baseVerde.position.y=0.165; fallback.add(baseVerde);
  const baseDorada=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.04,32), new THREE.MeshStandardMaterial({ color:0xffd700, metalness:0.95, roughness:0.05 })); baseDorada.position.y=0.19; fallback.add(baseDorada);
  const cuerpoInf=new THREE.Mesh(new THREE.CylinderGeometry(0.065,0.075,0.08,32), new THREE.MeshStandardMaterial({ color:0xffd700, metalness:0.95, roughness:0.05 })); cuerpoInf.position.y=0.25; fallback.add(cuerpoInf);
  const cuerpoMed=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.065,0.12,32), new THREE.MeshStandardMaterial({ color:0xffd700, metalness:0.95, roughness:0.05 })); cuerpoMed.position.y=0.35; fallback.add(cuerpoMed);
  const cuerpoSup=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.05,0.08,32), new THREE.MeshStandardMaterial({ color:0xffd700, metalness:0.95, roughness:0.05 })); cuerpoSup.position.y=0.43; fallback.add(cuerpoSup);
  const trans=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.045,0.03,32), new THREE.MeshStandardMaterial({ color:0xffd700, metalness:0.95, roughness:0.05 })); trans.position.y=0.485; fallback.add(trans);
  const globo=new THREE.Mesh(new THREE.SphereGeometry(0.075,32,24), new THREE.MeshStandardMaterial({ color:0xffd700, metalness:0.95, roughness:0.05 })); globo.position.y=0.56; fallback.add(globo);
  fallback.position.y=0.25; fallback.traverse(c=>{ if(c.isMesh){ c.castShadow=c.receiveShadow=true; } }); 
  trofeoGroup.add(fallback);
  
  const gltf = new GLTFLoader(); const modelRef = { current: fallback };
  gltf.load('/assets/models/world_cup_trophy/scene.gltf', (gltf)=>{
    console.log('✅ Copa del Mundo 4 GLTF cargado exitosamente', gltf.scene);
    const trofeoModel = gltf.scene; 
    const box=new THREE.Box3().setFromObject(trofeoModel); 
    const size=box.getSize(new THREE.Vector3()); 
    const maxDim=Math.max(size.x,size.y,size.z); 
    const scale=0.5/maxDim; 
    trofeoModel.scale.setScalar(scale); 
    trofeoModel.position.set(0,0.15,0);
    trofeoModel.traverse(c=>{ if(c.isMesh){ c.castShadow=c.receiveShadow=true; if(c.material){ c.material=c.material.clone(); c.material.metalness=0.95; c.material.roughness=0.05; c.material.color.setHex(0xffd700);} } });
    trofeoGroup.remove(fallback);
    trofeoGroup.add(trofeoModel);
    modelRef.current = trofeoModel;
    console.log('✅ Copa del Mundo 4 agregada al grupo');
  }, undefined, (error)=>{
    console.error('❌ Error cargando Copa del Mundo 4 GLTF:', error);
  });
  trofeoGroup.position.set(0, baseY, 0); group.add(trofeoGroup);
  const luzTrofeo=new THREE.SpotLight(0xffffff, 8.0, 10, Math.PI/3, 0.1, 1); luzTrofeo.position.set(0, baseY+0.65+1.5, 0); luzTrofeo.target.position.set(0, baseY+0.2, 0); luzTrofeo.castShadow=true; group.add(luzTrofeo); group.add(luzTrofeo.target);
  const luzLateral=new THREE.PointLight(0xffffff, 2.5, 3); luzLateral.position.set(0.3, baseY+0.4, 0.3); group.add(luzLateral);
  const luzLateral2=new THREE.PointLight(0xffffff, 2.0, 3); luzLateral2.position.set(-0.3, baseY+0.4, -0.3); group.add(luzLateral2);
  const luzAmbientalTrofeo=new THREE.AmbientLight(0xffffff, 0.4); group.add(luzAmbientalTrofeo);

  const placa = createGoldenPlaque("COPA MUNDIAL FIFA 2022", "Réplica oficial del trofeo más codiciado del fútbol mundial.");
  placa.position.set(0.37, 0.9, 0); placa.rotation.set(0, -Math.PI/2, Math.PI); group.add(placa); interactables.push(placa);

  group.position.set(x, 0, z); group.rotation.y = rotationY; group.castShadow=group.receiveShadow=true; scene.add(group);
  return { group, baseY, trofeoModelRef: modelRef, luces: { luzTrofeo, luzLateral, luzLateral2 } };
}

export function createVitrinaMedallaOlimpica(scene, interactables, x = -7.5, z = 6, rotationY = Math.PI){
  const group = new THREE.Group();
  const w=0.7,d=0.7,h=0.7; const base = new THREE.Mesh(new THREE.BoxGeometry(w+0.1,0.15,d+0.1), new THREE.MeshStandardMaterial({ color:0x1a1a1a, metalness:0.3, roughness:0.7 })); base.position.y=0.075; base.receiveShadow=base.castShadow=true; group.add(base);
  const col = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshStandardMaterial({ color:0x2a2a2a, metalness:0.4, roughness:0.6 })); col.position.y=h/2+0.15; col.receiveShadow=col.castShadow=true; group.add(col);
  const top = new THREE.Mesh(new THREE.BoxGeometry(w+0.05,0.08,d+0.05), new THREE.MeshStandardMaterial({ color:0x404040, metalness:0.5, roughness:0.4 })); top.position.y=h+0.15+0.04; top.receiveShadow=true; group.add(top);
  const vitH=0.55, vitW=0.65, vitD=0.65, thick=0.02, baseY = h+0.15+0.08; 
  const front = new THREE.Mesh(new THREE.BoxGeometry(vitW, vitH, thick), vidriaMaterial); front.position.set(0, baseY + vitH/2, vitD/2); group.add(front);
  const back  = new THREE.Mesh(new THREE.BoxGeometry(vitW, vitH, thick), vidriaMaterial); back.position.set(0, baseY + vitH/2, -vitD/2); group.add(back);
  const left  = new THREE.Mesh(new THREE.BoxGeometry(thick, vitH, vitD), vidriaMaterial); left.position.set(-vitW/2, baseY + vitH/2, 0); group.add(left);
  const right = new THREE.Mesh(new THREE.BoxGeometry(thick, vitH, vitD), vidriaMaterial); right.position.set( vitW/2, baseY + vitH/2, 0); group.add(right);
  const frameTop = new THREE.Mesh(new THREE.BoxGeometry(vitW + 0.06, 0.03, vitD + 0.06), marcoMaterial); frameTop.position.set(0, baseY + vitH + 0.015, 0); group.add(frameTop);

  const objetoGroup = new THREE.Group(); const pedestalInterno = new THREE.Mesh(new THREE.CylinderGeometry(0.20,0.20,0.15,32), new THREE.MeshStandardMaterial({ color:0x1a1a1a, metalness:0.4, roughness:0.6 })); pedestalInterno.position.y=0.075; pedestalInterno.castShadow=pedestalInterno.receiveShadow=true; objetoGroup.add(pedestalInterno);
  const modelRef = { current: null };
  
  // Cargar modelo GLTF de medalla olímpica
  const gltfLoader = new GLTFLoader();
  gltfLoader.load('/assets/models/medalla_olímpica/scene.gltf', (gltf) => {
    const medallaModel = gltf.scene;
    
    // Calcular tamaño y escalar
    const box = new THREE.Box3().setFromObject(medallaModel);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 0.35; // Tamaño similar a las pelotas
    const scale = targetSize / maxDim;
    
    medallaModel.scale.setScalar(scale);
    medallaModel.position.set(0, 0.16, 0);
    medallaModel.rotation.set(0, 0, 0); // Sin rotación inicial
    
    // Configurar materiales y sombras
    medallaModel.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        if (node.material) {
          if (node.material.map) {
            try { node.material.map.colorSpace = THREE.SRGBColorSpace; } catch(e) {}
          }
          if (node.material.normalMap) {
            try { node.material.normalMap.colorSpace = THREE.LinearSRGBColorSpace; } catch(e) {}
          }
        }
      }
    });
    
    objetoGroup.add(medallaModel);
    modelRef.current = medallaModel;
    console.log('✅ Medalla Olímpica cargada en vitrina');
  }, undefined, (error) => {
    console.error('❌ Error cargando Medalla Olímpica GLTF:', error);
  });
  
  objetoGroup.position.set(0, baseY, 0); group.add(objetoGroup);
  const luzObjeto = new THREE.SpotLight(0xffffff, 2.5, 6, Math.PI/8, 0.3, 1); luzObjeto.position.set(0, baseY + vitH + 1, 0); luzObjeto.target.position.set(0, baseY + 0.2, 0); luzObjeto.castShadow=false; group.add(luzObjeto); group.add(luzObjeto.target);

  const placa = createGoldenPlaque("MEDALLA OLÍMPICA BEIJING 2008", "Medalla de oro olímpica de los Juegos de Beijing 2008. El fútbol masculino fue ganado por Argentina, que derrotó a Nigeria 1-0 en la final con un gol de Ángel Di María. Esta victoria representó el segundo oro olímpico consecutivo para Argentina, consolidando su dominio en el fútbol olímpico con figuras como Lionel Messi, Juan Román Riquelme y Sergio Agüero.");
  placa.position.set(0.37, 0.9, 0); placa.rotation.set(0, -Math.PI/2, Math.PI); group.add(placa); interactables.push(placa);

  group.position.set(x, 0, z); group.rotation.y = rotationY; group.castShadow=group.receiveShadow=true; scene.add(group);
  return { group, baseY, vitH, medallaModelRef: modelRef, luzObjeto };
}
