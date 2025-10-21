import * as THREE from 'three';
import { addFrame } from './frames.js';

//NO TOCAR EL ORDEN QUE SE ROMPE ABSOLUTAMENTE TODO, RESPETAR LOS NÚMEROS DE LOS COMENTARIOS AL LADO DE CADA CUADRO.

const availableImageFiles = [
  './assets/images/1978_2.jpg', // 1
  './assets/images/1978.jpg', // 2
  './assets/images/8.jpeg', //8
  './assets/images/1994.jpg', //7
  './assets/images/1990.jpg', //6
  './assets/images/mano_dios.jpg', //5
  './assets/images/Maradona_copa_del_mundo.png', //4
  './assets/images/1986.jpg', //3
  './assets/images/9.jpeg', //9
  './assets/images/10.jpeg', //10
  './assets/images/11.png', //11
  './assets/images/2008.jpg', //12
  './assets/images/2009.jpg', //13
  './assets/images/2010.jpg', //14
  './assets/images/2014_heroe.gif', //15
  './assets/images/2014.jpg', //16
  './assets/images/messi_llorando.jpg', //17
  './assets/images/2021.jpg', //18
  './assets/images/Messi_copa_america_2024.png', //20
  './assets/images/Messi_copa_del_mundo_2022.png', //19
];

function buildObrasCatalog(count) {
  const catalog = [];
  for (let i = 0; i < count; i++) {
    const src = availableImageFiles[i % availableImageFiles.length];
    catalog.push({
      img: src,
      title: `Obra ${i + 1}`,
      author: '',
      year: '',
      desc: ''
    });
  }
  return catalog;
}

function getObra(obrasCatalogo, index) {
  return obrasCatalogo[index % obrasCatalogo.length];
}

export function placeArtworks(scene, interactables, ROOM) {
  const obrasCatalogo = buildObrasCatalog(20);

  // Pared del frente: primera sección (-4, -8) empezando en 1978
  const posicionesFrente = [-4, -8];
  posicionesFrente.forEach((x, index) => {
    const obra = getObra(obrasCatalogo, index);
    addFrame(scene, interactables, {
      x: x,
      z: ROOM.d/2 - 0.18,
      face: 'frontinicial',
      img: obra.img,
      title: obra.title,
      desc: `${obra.author} · ${obra.year}\n\n${obra.desc}`
    });
  });

 
  // Pared izquierda
  const posicionesIzquierda = [-12, -8, -4, 0, 4, 8];
  posicionesIzquierda.forEach((z, index) => {
    const obra = getObra(obrasCatalogo, index + 2);
    addFrame(scene, interactables, {
      x: -ROOM.w/2 + 0.18,
      z: z,
      face: 'left',
      img: obra.img,
      title: obra.title,
      desc: `${obra.author} · ${obra.year}\n\n${obra.desc}`
    });
  });

  // Pared del fondo
  const posicionesFondo = [-8, -4, 0, 4, 8];
  posicionesFondo.forEach((x, index) => {
    const obra = getObra(obrasCatalogo, index + 8);
    addFrame(scene, interactables, {
      x: x,
      z: -ROOM.d/2 + 0.18,
      face: 'back',
      img: obra.img,
      title: obra.title,
      desc: `${obra.author} · ${obra.year}\n\n${obra.desc}`
    });
  });

  // Pared derecha
  const posicionesDerecha = [-8, -4, 0, 4, 8];
  posicionesDerecha.forEach((z, index) => {
    const obra = getObra(obrasCatalogo, index + 13);
    addFrame(scene, interactables, {
      x: ROOM.w/2 - 0.18,
      z: z,
      face: 'right',
      img: obra.img,
      title: obra.title,
      desc: `${obra.author} · ${obra.year}\n\n${obra.desc}`
    });
  });

  // Pared del frente: segunda sección (4, 8)
  const posicionesFrente1 = [4, 8];
  posicionesFrente1.forEach((x, index) => {
    const obra = getObra(obrasCatalogo, index + 18);
    addFrame(scene, interactables, {
      x: x,
      z: ROOM.d/2 - 0.18,
      face: 'frontfinal',
      img: obra.img,
      title: obra.title,
      desc: `${obra.author} · ${obra.year}\n\n${obra.desc}`
    });
  });
}

export function placeUpperFloorArtworks(scene, interactables, finalBalconyHeight) {
  // Altura para los cuadros del piso superior
  const upperY = finalBalconyHeight + 1.7;
  
  // ====== ARRAY DE IMÁGENES PARA EL PISO SUPERIOR ======
  // Puedes cambiar estas rutas por las imágenes que desees
  const upperFloorImages = [
    // Pared izquierda (5 cuadros)
    './assets/images/1.jpeg',
    './assets/images/2.jpeg',
    './assets/images/3.png',
    './assets/images/4.jpeg',
    './assets/images/5.jpeg',
    
    // Pared derecha (5 cuadros)
    './assets/images/6.jpeg',
    './assets/images/7.jpeg',
    './assets/images/8.jpeg',
    './assets/images/9.jpeg',
    './assets/images/10.jpeg',

    // Pared del fondo (4 cuadros)
    './assets/images/11.png',
    './assets/images/12.jpeg',
    './assets/images/13.jpeg',
    './assets/images/14.jpeg',
    
    // Pared del frente - primera sección (2 cuadros)
    './assets/images/15.png',
    './assets/images/16.jpeg',
    
    // Pared del frente - segunda sección (3 cuadros)
    './assets/images/17.jpeg',
    './assets/images/18.jpeg',
    './assets/images/19.jpeg',
  ];

  // Catálogo de obras para el piso superior
  const upperCatalog = buildObrasCatalog(upperFloorImages.length);

  // Función auxiliar que usa addFrame pero con altura personalizada
  function addUpperFloorFrame(opts) {
    const { x, z, face, img, title, desc } = opts;
    const frameGroup = new THREE.Group();
    frameGroup.position.set(x, upperY, z);
    if (face === 'back') frameGroup.rotation.y = Math.PI;
    if (face === 'left') frameGroup.rotation.y = Math.PI/2;
    if (face === 'right') frameGroup.rotation.y = -Math.PI/2;
    if (face === 'front' || face === 'frontinicial' || face === 'frontfinal') frameGroup.rotation.y = 0;

    const artWidth=1.8, artHeight=1.2, frameThickness=0.08;
    const barDepth=frameThickness;
    const barZ=0.01;
    const artMat = new THREE.MeshBasicMaterial({ color: 0xdddddd, side: THREE.DoubleSide });
    const artPlane = new THREE.Mesh(new THREE.PlaneGeometry(artWidth, artHeight), artMat);
    artPlane.position.set(0,0,-0.01);
    artPlane.userData = { title, desc };
    artPlane.receiveShadow = true;
    frameGroup.add(artPlane);
    
    const loader = new THREE.TextureLoader();
    loader.load(img, (texture)=>{ 
      try{ 
        texture.colorSpace=THREE.SRGBColorSpace; 
        artPlane.material.map=texture; 
        artPlane.material.color.setHex(0xffffff); 
        artPlane.material.needsUpdate=true; 
      }catch(e){} 
    }, undefined, ()=>{
      loader.load('./assets/textures/colonCampeon.jpg', (fallback)=>{ 
        try{ 
          fallback.colorSpace=THREE.SRGBColorSpace; 
          artPlane.material.map=fallback; 
          artPlane.material.color.setHex(0xffffff); 
          artPlane.material.needsUpdate=true; 
        }catch(e){} 
      }, undefined, ()=>{ 
        artPlane.material.color.setHex(0x888888); 
        artPlane.material.needsUpdate=true; 
      });
    });

    const frameMat = new THREE.MeshStandardMaterial({ color: 0xB8860B, metalness: 0.7, roughness: 0.25 });
    const halfW = artWidth/2, halfH = artHeight/2;
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(artWidth + frameThickness*2, frameThickness, barDepth), frameMat);
    topBar.position.set(0, halfH + frameThickness/2, barZ);
    topBar.castShadow = topBar.receiveShadow = true;
    frameGroup.add(topBar);
    
    const bottomBar = topBar.clone();
    bottomBar.position.set(0, -halfH - frameThickness/2, barZ);
    frameGroup.add(bottomBar);
    
    const leftBar = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, artHeight, barDepth), frameMat);
    leftBar.position.set(-halfW - frameThickness/2, 0, barZ);
    leftBar.castShadow = leftBar.receiveShadow = true;
    frameGroup.add(leftBar);
    
    const rightBar = leftBar.clone();
    rightBar.position.set(halfW + frameThickness/2, 0, barZ);
    frameGroup.add(rightBar);

    const obraLight = new THREE.PointLight(0xffffff, 1.2, 6);
    obraLight.position.set(0, 0.6, 1.5);
    frameGroup.add(obraLight);

    frameGroup.userData = { title, desc };
    scene.add(frameGroup);
    interactables.push(frameGroup);
  }

  let imageIndex = 0;

  // Pared izquierda (5 cuadros)
  const posicionesIzquierda = [-8, -4, 0, 4, 8];
  posicionesIzquierda.forEach((z, index) => {
    const obra = upperCatalog[imageIndex % upperCatalog.length];
    addUpperFloorFrame({
      x: -12 + 0.18,
      z: z,
      face: 'left',
      img: upperFloorImages[imageIndex] || obra.img,
      title: obra.title,
      desc: `${obra.author} · ${obra.year}\n\n${obra.desc}`
    });
    imageIndex++;
  });

  // Pared derecha (5 cuadros)
  const posicionesDerecha = [-8, -4, 0, 4, 8];
  posicionesDerecha.forEach((z, index) => {
    const obra = upperCatalog[imageIndex % upperCatalog.length];
    addUpperFloorFrame({
      x: 12 - 0.18,
      z: z,
      face: 'right',
      img: upperFloorImages[imageIndex] || obra.img,
      title: obra.title,
      desc: `${obra.author} · ${obra.year}\n\n${obra.desc}`
    });
    imageIndex++;
  });

  // Pared del fondo (4 cuadros)
  const posicionesFondo = [-6, -2, 2, 6];
  posicionesFondo.forEach((x, index) => {
    const obra = upperCatalog[imageIndex % upperCatalog.length];
    addUpperFloorFrame({
      x: x,
      z: -18 + 0.18,
      face: 'back',
      img: upperFloorImages[imageIndex] || obra.img,
      title: obra.title,
      desc: `${obra.author} · ${obra.year}\n\n${obra.desc}`
    });
    imageIndex++;
  });

  // Pared del frente - primera sección (2 cuadros, izquierda de la puerta)
  const posicionesFrenteInicial = [-8, -4];
  posicionesFrenteInicial.forEach((x, index) => {
    const obra = upperCatalog[imageIndex % upperCatalog.length];
    addUpperFloorFrame({
      x: x,
      z: 18 - 0.18,
      face: 'frontinicial',
      img: upperFloorImages[imageIndex] || obra.img,
      title: obra.title,
      desc: `${obra.author} · ${obra.year}\n\n${obra.desc}`
    });
    imageIndex++;
  });

  // Pared del frente - segunda sección (3 cuadros, derecha de la puerta)
  const posicionesFrente2 = [2, 6, 10];
  posicionesFrente2.forEach((x, index) => {
    const obra = upperCatalog[imageIndex % upperCatalog.length];
    addUpperFloorFrame({
      x: x,
      z: 18 - 0.18,
      face: 'frontfinal',
      img: upperFloorImages[imageIndex] || obra.img,
      title: obra.title,
      desc: `${obra.author} · ${obra.year}\n\n${obra.desc}`
    });
    imageIndex++;
  });
}