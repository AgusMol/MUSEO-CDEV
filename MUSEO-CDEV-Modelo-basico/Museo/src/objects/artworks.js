import { addFrame } from './frames.js';

//NO TOCAR EL ORDEN QUE SE ROMPE ABSOLUTAMENTE TODO, RESPETAR LOS NÚMEROS DE LOS COMENTARIOS AL LADO DE CADA CUADRO.

const availableImageFiles = [
  './assets/images/1978_2.jpg', // 1
  './assets/images/1978.jpg', // 2
  './assets/images/8.jpeg', //8
  './assets/images/7.jpeg', //7
  './assets/images/6.jpeg', //6
  './assets/images/1990.jpg', //5
  './assets/images/Maradona_copa_del_mundo.png', //4
  './assets/images/1986.jpg', //3
  './assets/images/9.jpeg', //9
  './assets/images/10.jpeg', //10
  './assets/images/11.png', //11
  './assets/images/12.jpeg', //12
  './assets/images/13.jpeg', //13
  './assets/images/14.jpeg', //14
  './assets/images/2008.jpg', //15
  './assets/images/16.jpeg', //16
  './assets/images/17.jpeg', //17
  './assets/images/18.jpeg', //18
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