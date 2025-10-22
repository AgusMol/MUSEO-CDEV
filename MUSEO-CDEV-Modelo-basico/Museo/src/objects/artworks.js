import * as THREE from 'three';
import { addFrame } from './frames.js';

//NO TOCAR EL ORDEN QUE SE ROMPE ABSOLUTAMENTE TODO, RESPETAR LOS NÚMEROS DE LOS COMENTARIOS AL LADO DE CADA CUADRO.

const availableImageFiles = [
  './assets/videos/1978_2.mp4', // 1
  './assets/videos/1978.mp4', // 2
  './assets/videos/cuadro8.mp4', //8
  './assets/videos/1994.mp4', //7
  './assets/videos/1990.mp4', //6
  './assets/videos/1986.mp4', //5
  './assets/videos/maradona_copa_del_mundo.mp4', //4
  './assets/videos/mano_dios.mp4', //3
  './assets/videos/1998_zanetti.mp4', //9
  './assets/images/palermo.jpg', //10
  './assets/videos/2006_maxi_rodriguez.mp4', //11
  './assets/videos/2008.mp4', //12
  './assets/videos/2009.mp4', //13
  './assets/videos/2010.mp4', //14
  './assets/videos/2014_heroe.mp4', //15
  './assets/videos/2014_final.mp4', //16
  './assets/videos/messi_llorando.mp4', //17
  './assets/videos/2021.mp4', //18
  './assets/videos/2024.mp4', //20
  './assets/videos/2022.mp4', //19
];

// Función para crear frame con video
function addVideoFrame(scene, interactables, opts) {
  const { x, y, z, face, videoSrc, title, desc } = opts;
  const frameGroup = new THREE.Group();
  frameGroup.position.set(x, y || 1.7, z);
  
  if (face === 'back') frameGroup.rotation.y = Math.PI;
  if (face === 'left') frameGroup.rotation.y = Math.PI/2;
  if (face === 'right') frameGroup.rotation.y = -Math.PI/2;
  if (face === 'front' || face === 'frontinicial' || face === 'frontfinal') frameGroup.rotation.y = 0;

  const artWidth = 1.8, artHeight = 1.2, frameThickness = 0.08;
  const barDepth = frameThickness;
  const barZ = 0.01;

  // Crear video element
  const video = document.createElement('video');
  video.src = videoSrc;
  video.loop = false; // NO SE REPITE - se detiene al finalizar
  video.muted = false; // CON AUDIO - desmuteado desde el inicio
  video.playsInline = true;
  video.crossOrigin = 'anonymous';
  video.volume = 0.5; // Volumen inicial al 50%
  video.dataset.baseVolume = '0.5'; // Volumen base (50%)
  video.dataset.hasPlayed = 'false'; // Flag para autoplay
  
  // Crear textura de video
  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.colorSpace = THREE.SRGBColorSpace;
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  
  // Voltear horizontalmente los videos de la pared del frente y del fondo
  const shouldFlip = videoSrc.includes('1978_2') || videoSrc.includes('1978.') || 
                     videoSrc.includes('2008') || videoSrc.includes('2009') ||
                     videoSrc.includes('1998_zanetti') || videoSrc.includes('palermo') || videoSrc.includes('2006_maxi_rodriguez');
  
  if (shouldFlip) {
    videoTexture.wrapS = THREE.RepeatWrapping;
    videoTexture.repeat.x = -1;
  }

  const artMat = new THREE.MeshBasicMaterial({ 
    map: videoTexture,
    side: THREE.DoubleSide 
  });
  
  const artPlane = new THREE.Mesh(new THREE.PlaneGeometry(artWidth, artHeight), artMat);
  artPlane.position.set(0, 0, -0.01);
  artPlane.userData = { title, desc, isVideo: true, video: video };
  frameGroup.add(artPlane);

  // Marco dorado
  const frameMat = new THREE.MeshStandardMaterial({ 
    color: 0xB8860B, 
    metalness: 0.7, 
    roughness: 0.25 
  });
  
  const halfW = artWidth/2, halfH = artHeight/2;
  
  const topBar = new THREE.Mesh(
    new THREE.BoxGeometry(artWidth + frameThickness*2, frameThickness, barDepth), 
    frameMat
  );
  topBar.position.set(0, halfH + frameThickness/2, barZ);
  frameGroup.add(topBar);
  
  const bottomBar = topBar.clone();
  bottomBar.position.set(0, -halfH - frameThickness/2, barZ);
  frameGroup.add(bottomBar);
  
  const leftBar = new THREE.Mesh(
    new THREE.BoxGeometry(frameThickness, artHeight, barDepth), 
    frameMat
  );
  leftBar.position.set(-halfW - frameThickness/2, 0, barZ);
  frameGroup.add(leftBar);
  
  const rightBar = leftBar.clone();
  rightBar.position.set(halfW + frameThickness/2, 0, barZ);
  frameGroup.add(rightBar);

  // Luz
  const obraLight = new THREE.PointLight(0xffffff, 1.2, 6);
  obraLight.position.set(0, 0.6, 1.5);
  frameGroup.add(obraLight);

  frameGroup.userData = { title, desc, isVideo: true, video: video };
  scene.add(frameGroup);
  interactables.push(frameGroup);
  
  return { frameGroup, video };
}

// ====== CATÁLOGO DE OBRAS DEL PISO INFERIOR ======
// Aquí puedes personalizar el título, autor, año y descripción de cada cuadro
function buildObrasCatalog() {
  return [
    {
      img: availableImageFiles[0], // 1978_2.jpg
      title: '¡ARGENTINA CAMPEÓN!',
      author: 'Selección Argentina',
      year: '1978',
      desc: 'El 25 de junio de 1978, Argentina se consagró campeón del mundo por primera vez en su historia. La final se disputó en el Estadio Monumental ante más de 70.000 espectadores. Con un dramático 3-1 sobre Holanda en tiempo suplementario, el seleccionado dirigido por César Luis Menotti alcanzó la gloria eterna.'
    },
    {
      img: availableImageFiles[1], // 1978.jpg
      title: 'Celebración Mundial 1978',
      author: 'Selección Argentina',
      year: '1978',
      desc: 'El pueblo argentino celebró en las calles la conquista del primer título mundial. Miles de hinchas se congregaron en el Obelisco y en todo el país para festejar el triunfo histórico. Argentina era campeón del mundo en casa, un sueño hecho realidad.'
    },
    {
      img: availableImageFiles[2], // cuadro8.mp4 (VIDEO)
      title: 'Momentos de Maradona',
      author: 'Diego Armando Maradona',
      year: '1994',
      desc: 'El tan recordado, me cortaron las piernas...'
    },
    {
      img: availableImageFiles[3], // 1994.jpg
      title: 'Mundial USA 1994',
      author: 'Selección Argentina',
      year: '1994',
      desc: 'Tras 4 años de espera y con la euforia del pueblo argentino, llega el Mundial de Estados Unidos 1994. La ilusión se transformó en uno de los episodios más oscuros del fútbol nacional cuando un simple anti-doping le cortó las piernas a nuestro capitán y número 10, Diego Armando Maradona. Con la recordada foto del "Pelusa" de la mano con la enfermera, se cerró prematuramente su participación en la Selección. Argentina cayó en octavos ante Rumania sin su líder.'
    },
    {
      img: availableImageFiles[4], // 1990.jpg
      title: 'Mundial Italia 1990',
      author: 'Selección Argentina',
      year: '1990',
      desc: 'En un ambiente hostil en Italia, con el público silbando el Himno Nacional argentino, Diego Armando Maradona levantó a su equipo y respondió de la única forma que sabía: jugando. La Selección llegó hasta la final en el estadio Olímpico de Roma, donde cayó 1-0 ante Alemania en un partido controversial. A pesar de la derrota, Argentina demostró carácter y valentía.'
    },
    {
      img: availableImageFiles[5], // mano_dios.jpg
      title: 'Mundial México 1986',
      author: 'Selección Argentina',
      year: '1986',
      desc: 'El 29 de junio de 1986 en el Estadio Azteca, Diego Armando Maradona levantó la Copa del Mundo tras vencer 3-2 a Alemania en la final. Después de 8 años de sequía y una dolorosa eliminación en España 1982, Argentina volvió a la cima del fútbol mundial con un Maradona en la cúspide de su carrera. El Diego fue la figura indiscutida del torneo.'
    },
    {
      img: availableImageFiles[6], // Maradona_copa_del_mundo.png
      title: 'Maradona Campeón',
      author: 'Diego Armando Maradona',
      year: '1986',
      desc: 'La imagen icónica de Maradona besando el trofeo más deseado. El Mundial de México 1986 marcó el renacimiento de la Selección Argentina con energías renovadas. A pesar de sufrir en fase de grupos, el equipo dirigido por Carlos Bilardo demostró carácter y garra para conquistar el segundo título mundial del país.'
    },
    {
      img: availableImageFiles[7], // 1986.jpg
      title: 'La Mano de Dios - La Revancha',
      author: 'Diego Armando Maradona',
      year: '1986',
      desc: '22 de junio de 1986, cuartos de final en el Estadio Azteca. Argentina venció 2-1 a Inglaterra en un partido histórico que significó una revancha deportiva tras la Guerra de Malvinas. El primer gol de Maradona, conocido como "La Mano de Dios", fue el más controversial de la historia. Minutos después, el Diego marcó el "Gol del Siglo" en una jugada inolvidable.'
    },
    {
      img: availableImageFiles[8], // 1998_zanetti.mp4
      title: 'Gol de Zanetti vs Inglaterra 1998',
      author: 'Javier Zanetti',
      year: '1998',
      desc: 'Mundial Francia 1998, fase de grupos. Argentina enfrentó a Inglaterra en un partido inolvidable que terminó 2-2 y se definió por penales con victoria argentina 4-3. Javier Zanetti anotó un golazo memorable: recibió la pelota desde un tiro libre, controló y la clavó en un ángulo. Un momento histórico en otro capítulo del clásico rivalidad con los ingleses.'
    },
    {
      img: availableImageFiles[9], // palermo.jpg
      title: 'Penales errados vs Colombia 1999',
      author: 'Martín Palermo',
      year: '1999',
      desc: 'Copa América Colombia 1999, uno de los episodios más dolorosos y recordados del fútbol argentino. En el partido contra Colombia en Bogotá, Martín Palermo erró tres penales en el mismo partido, un récord negativo sin precedentes. A pesar de la angustia y las críticas, el "Titán" Palermo demostró años después su verdadera grandeza al convertirse en ídolo de Boca Juniors y vengarse con goles importantes en la Selección. Una noche para olvidar que forjó el carácter de un verdadero guerrero.'
    },
    {
      img: availableImageFiles[10], // 2006_maxi_rodriguez.mp4
      title: 'Gol de Maxi Rodríguez vs México 2006',
      author: 'Maxi Rodríguez',
      year: '2006',
      desc: 'Mundial Alemania 2006, octavos de final. El 24 de junio en Leipzig, Maxi Rodríguez anotó uno de los goles más espectaculares en la historia de los mundiales. Tras un empate 1-1 en los 120 minutos, en el tiempo suplementario Maxi controló un centro de pecho y ejecutó una volea perfecta desde fuera del área que se clavó en el ángulo. Un golazo de antología que selló el 2-1 ante México y envió a Argentina a cuartos de final. Pura magia celeste y blanca.'
    },
    {
      img: availableImageFiles[11], // 2008.jpg
      title: 'Juegos Olímpicos Beijing 2008',
      author: 'Kun Agüero y Lionel Messi',
      year: '2008',
      desc: 'El 23 de agosto de 2008, Argentina conquistó la medalla de oro olímpica en Beijing tras vencer 1-0 a Nigeria en la final. El equipo dirigido por Sergio Batista, con figuras como Lionel Messi, Kun Agüero y Di María, mostró un fútbol brillante durante todo el torneo. La joven generación dorada demostró su calidad en el escenario olímpico.'
    },
    {
      img: availableImageFiles[12], // 2009.jpg
      title: 'Eliminatorias Sudamericanas Mundial 2010',
      author: 'Diego Armando Maradona',
      year: '2009',
      desc: 'Diego Armando Maradona asumió como director técnico de la Selección Argentina en noviembre de 2008. Las eliminatorias rumbo a Sudáfrica 2010 fueron un camino difícil y emocionante, donde el Diego lideró desde el banco con pasión y carácter. Argentina logró clasificar al mundial en una campaña marcada por la intensidad del legendario 10.'
    },
    {
      img: availableImageFiles[13], // 2010.jpg
      title: 'Mundial Sudáfrica 2010',
      author: 'Diego Armando Maradona y Lionel Messi',
      year: '2010',
      desc: 'El Mundial de Sudáfrica 2010 marcó el debut de Maradona como entrenador en una Copa del Mundo. Con Lionel Messi como figura principal, Argentina mostró destellos de gran fútbol en fase de grupos, goleando 4-1 a Corea del Sur. Sin embargo, el sueño terminó en cuartos de final con una dolorosa derrota 4-0 ante Alemania. Fue el último mundial del Diego como DT.'
    },
    {
      img: availableImageFiles[14], // 2014_heroe.gif
      title: 'Semifinal Mundial Brasil 2014',
      author: 'Chiquito Romero y Javier Mascherano',
      year: '2014',
      desc: 'La épica semifinal ante Holanda en el Mundial de Brasil 2014 quedó marcada en la memoria. Tras un empate 0-0 en los 120 minutos, la definición por penales fue dramática. Sergio "Chiquito" Romero se convirtió en héroe al atajar dos penales, mientras que Javier Mascherano dio todo en la cancha. Argentina avanzó a la final tras 24 años.'
    },
    {
      img: availableImageFiles[15], // 2014.jpg
      title: 'Mundial Brasil 2014',
      author: 'Selección Argentina',
      year: '2014',
      desc: 'El Mundial de Brasil 2014 fue el torneo de Lionel Messi. La Selección dirigida por Alejandro Sabella llegó hasta la final tras una campaña sólida defensiva. En el Maracaná, ante más de 74.000 espectadores, Argentina cayó 1-0 en el tiempo suplementario ante Alemania por un gol de Mario Götze. Subcampeones, pero con un Messi que fue elegido mejor jugador del mundial.'
    },
    {
      img: availableImageFiles[16], // messi_llorando.jpg
      title: 'Messi Desconsolado',
      author: 'Lionel Messi',
      year: '2016',
      desc: 'Tras la dolorosa derrota en la final de la Copa América Centenario 2016 ante Chile por penales, Lionel Messi rompió en llanto y anunció su retiro de la Selección. La imagen del 10 llorando desconsoladamente conmovió al mundo. Fue un momento de profunda frustración después de tres finales perdidas consecutivas. Afortunadamente, el retiro duró poco.'
    },
    {
      img: availableImageFiles[17], // 2021.jpg
      title: 'Copa América 2021',
      author: 'Selección Argentina',
      year: '2021',
      desc: 'El 11 de julio de 2021 en el Maracaná, Argentina se consagró campeón de la Copa América tras vencer 1-0 a Brasil con gol de Ángel Di María. Después de 28 años sin títulos con la mayor, Lionel Messi finalmente levantó su primer trofeo con la Selección. Las lágrimas de alegría del capitán y el festejo del equipo marcaron el inicio de una era dorada. Fue el renacimiento.'
    },
    {
      img: availableImageFiles[18], // Messi_copa_america_2024.png
      title: 'Copa América 2024',
      author: 'Lionel Messi',
      year: '2024',
      desc: 'Argentina se consagró bicampeón de América en Estados Unidos 2024, venciendo en la final a Colombia. Lionel Messi, a pesar de lesionarse durante el partido, vivió la gloria de conquistar su segundo título consecutivo con la Selección. El equipo dirigido por Lionel Scaloni demostró jerarquía y carácter para defender la corona continental. La dinastía continuaba.'
    },
    {
      img: availableImageFiles[19], // Messi_copa_del_mundo_2022.png
      title: 'Mundial Qatar 2022',
      author: 'Lionel Messi',
      year: '2022',
      desc: 'El 18 de diciembre de 2022 en el estadio Lusail, Lionel Messi cumplió su sueño. Argentina venció a Francia en la final más épica de la historia de los mundiales: 3-3 en 120 minutos y victoria 4-2 en penales. Después de 36 años, la Selección volvió a ser campeona del mundo. Messi levantó la Copa con la 10, cerrando el círculo perfecto. El abrazo eterno con el trofeo más deseado.'
    },
  ];
}

function getObra(obrasCatalogo, index) {
  return obrasCatalogo[index % obrasCatalogo.length];
}

// Función helper para agregar frame (imagen o video automáticamente)
function addArtwork(scene, interactables, opts) {
  const { img, title, desc, x, z, face } = opts;
  
  // Detectar si es video
  if (img && img.includes('.mp4')) {
    const { video } = addVideoFrame(scene, interactables, {
      x: x,
      z: z,
      face: face,
      videoSrc: img,
      title: title,
      desc: desc
    });
    
    // Guardar referencia al video para controles
    if (!window.museumVideos) window.museumVideos = [];
    window.museumVideos.push(video);
  } else {
    // Es imagen normal
    addFrame(scene, interactables, {
      x: x,
      z: z,
      face: face,
      img: img,
      title: title,
      desc: desc
    });
  }
}

export function placeArtworks(scene, interactables, ROOM) {
  const obrasCatalogo = buildObrasCatalog();

  // Pared del frente: primera sección (-4, -8) empezando en 1978
  const posicionesFrente = [-4, -8];
  posicionesFrente.forEach((x, index) => {
    const obra = getObra(obrasCatalogo, index);
    addArtwork(scene, interactables, {
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
    addArtwork(scene, interactables, {
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
    addArtwork(scene, interactables, {
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
    addArtwork(scene, interactables, {
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
    addArtwork(scene, interactables, {
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

    // Pared del fondo (4 cuadros) - VOLTEADAS HORIZONTALMENTE
    './assets/images/11.png',
    './assets/images/12.jpeg',
    './assets/images/13.jpeg',
    './assets/images/14.jpeg',
    
    // Pared del frente - primera sección (2 cuadros) - VOLTEADAS HORIZONTALMENTE
    './assets/images/15.png',
    './assets/images/16.jpeg',
    
    // Pared del frente - segunda sección (3 cuadros) - VOLTEADAS HORIZONTALMENTE
    './assets/images/17.jpeg',
    './assets/images/18.jpeg',
    './assets/images/19.jpeg',
  ];

  // ====== CATÁLOGO DE OBRAS DEL PISO SUPERIOR ======
  // Aquí puedes personalizar el título, autor, año y descripción de cada cuadro del piso superior
  const upperCatalog = [
    // Pared izquierda (5 cuadros)
    { img: upperFloorImages[0], title: 'Obra Superior 1', author: 'Autor 1', year: '2020', desc: 'Descripción de la obra superior 1.' },
    { img: upperFloorImages[1], title: 'Obra Superior 2', author: 'Autor 2', year: '2020', desc: 'Descripción de la obra superior 2.' },
    { img: upperFloorImages[2], title: 'Obra Superior 3', author: 'Autor 3', year: '2020', desc: 'Descripción de la obra superior 3.' },
    { img: upperFloorImages[3], title: 'Obra Superior 4', author: 'Autor 4', year: '2020', desc: 'Descripción de la obra superior 4.' },
    { img: upperFloorImages[4], title: 'Obra Superior 5', author: 'Autor 5', year: '2020', desc: 'Descripción de la obra superior 5.' },
    
    // Pared derecha (5 cuadros)
    { img: upperFloorImages[5], title: 'Obra Superior 6', author: 'Autor 6', year: '2020', desc: 'Descripción de la obra superior 6.' },
    { img: upperFloorImages[6], title: 'Obra Superior 7', author: 'Autor 7', year: '2020', desc: 'Descripción de la obra superior 7.' },
    { img: upperFloorImages[7], title: 'Obra Superior 8', author: 'Autor 8', year: '2020', desc: 'Descripción de la obra superior 8.' },
    { img: upperFloorImages[8], title: 'Obra Superior 9', author: 'Autor 9', year: '2020', desc: 'Descripción de la obra superior 9.' },
    { img: upperFloorImages[9], title: 'Obra Superior 10', author: 'Autor 10', year: '2020', desc: 'Descripción de la obra superior 10.' },
    
    // Pared del fondo (4 cuadros)
    { img: upperFloorImages[10], title: 'Obra Superior 11', author: 'Autor 11', year: '2020', desc: 'Descripción de la obra superior 11.' },
    { img: upperFloorImages[11], title: 'Obra Superior 12', author: 'Autor 12', year: '2020', desc: 'Descripción de la obra superior 12.' },
    { img: upperFloorImages[12], title: 'Obra Superior 13', author: 'Autor 13', year: '2020', desc: 'Descripción de la obra superior 13.' },
    { img: upperFloorImages[13], title: 'Obra Superior 14', author: 'Autor 14', year: '2020', desc: 'Descripción de la obra superior 14.' },
    
    // Pared del frente - primera sección (2 cuadros)
    { img: upperFloorImages[14], title: 'Obra Superior 15', author: 'Autor 15', year: '2020', desc: 'Descripción de la obra superior 15.' },
    { img: upperFloorImages[15], title: 'Obra Superior 16', author: 'Autor 16', year: '2020', desc: 'Descripción de la obra superior 16.' },
    
    // Pared del frente - segunda sección (3 cuadros)
    { img: upperFloorImages[16], title: 'Obra Superior 17', author: 'Autor 17', year: '2020', desc: 'Descripción de la obra superior 17.' },
    { img: upperFloorImages[17], title: 'Obra Superior 18', author: 'Autor 18', year: '2020', desc: 'Descripción de la obra superior 18.' },
    { img: upperFloorImages[18], title: 'Obra Superior 19', author: 'Autor 19', year: '2020', desc: 'Descripción de la obra superior 19.' },
  ];

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
    
    // Voltear horizontalmente las imágenes de la pared del frente y del fondo del piso superior
    const shouldFlip = img.includes('11.png') || img.includes('12.jpeg') || img.includes('13.jpeg') || img.includes('14.jpeg') ||
                       img.includes('15.png') || img.includes('16.jpeg') || img.includes('17.jpeg') || img.includes('18.jpeg') || img.includes('19.jpeg');
    
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