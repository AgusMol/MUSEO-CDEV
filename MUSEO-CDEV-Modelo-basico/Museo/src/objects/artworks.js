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
  const { x, y, z, face, videoSrc, title, desc, flip } = opts;
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
  
  // Crear textura de video
  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.colorSpace = THREE.SRGBColorSpace;
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  
  // Decide whether to flip horizontally. If caller provided `flip` it's used
  // as an explicit override. Otherwise fall back to the previous heuristic.
  let shouldFlip;
  if (typeof flip === 'boolean') {
    shouldFlip = !!flip;
  } else {
    // Default: flip videos that are placed on the 'back' face because the
    // frame group is rotated 180deg and that would otherwise mirror the image.
    // For other faces we don't flip by default.
    shouldFlip = (face === 'back');
  }

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

export function placeUpperFloorArtworks(scene, interactables, finalBalconyHeight, ROOM, DOOR) {
  // Altura para los cuadros del piso superior
  const upperY = finalBalconyHeight + 1.7;
  // Si no nos pasan ROOM/DOOR intentamos usar los valores por defecto conservadores
  ROOM = ROOM || { w: 24, d: 36 };
  DOOR = DOOR || { width: 2.2 };
  
  // ====== ARRAY DE IMÁGENES PARA EL PISO SUPERIOR ======
  // Puedes cambiar estas rutas por las imágenes que desees
  const upperFloorImages = [
    // Pared izquierda (5 cuadros)
    './assets/images/planta_alta/barovero penal sudamericana 2014.jpg',
    './assets/images/planta_alta/Chango Cardenas gol Racing campeon del mundo.webp',
    './assets/images/planta_alta/Copa Presidente de la Nacion 1920.jpg',
    './assets/images/planta_alta/debut kun aguero.jpg',
    './assets/images/planta_alta/estudiantes campeon en old trafford.jpg',
    
    // Pared derecha (5 cuadros)
    './assets/images/planta_alta/gol palermo al real madrid.webp',
    './assets/images/planta_alta/gol quintero.jpg',
    './assets/images/planta_alta/Independiente gana la septima 1984.jpg',
    './assets/images/planta_alta/james-rodriguez-banfield.jpg',
    './assets/images/planta_alta/keylor navas newels.jpg',

    // Pared del fondo (4 cuadros) - VOLTEADAS HORIZONTALMENTE
    './assets/images/planta_alta/maradona vuelve a boca 1995.avif',
    './assets/images/planta_alta/matelme.jpg',
    './assets/videos/recibimiento.mp4',
    './assets/videos/unicocampeon.mp4',
    './assets/images/planta_alta/Mostaza Merlo alzado por hinchas.webp',
    
    // Pared del frente - primera sección (2 cuadros) - VOLTEADAS HORIZONTALMENTE
    './assets/images/planta_alta/Newells campeon 1988.jpg',
    './assets/images/planta_alta/Premio campeonato 2 division 1932. Huracan.jpg',
    
    // Pared del frente - segunda sección (3 cuadros) - VOLTEADAS HORIZONTALMENTE
    './assets/images/planta_alta/Rosario Central 1987.webp',
    './assets/images/planta_alta/trono maradona gimnasia.webp',
    './assets/images/planta_alta/Zanetti debutando.jpg',
  ];

  // ====== CATÁLOGO DE OBRAS DEL PISO SUPERIOR ======
  // Aquí puedes personalizar el título, autor, año y descripción de cada cuadro del piso superior
  const upperCatalog = [
    // Pared izquierda (5 cuadros)
    { img: upperFloorImages[0], title: 'El inicio de una era', author: 'Marcelo Barovero', year: '2014', desc: 'Marcelo Barovero, arquero de River Plate, le ataja un penal decisivo a Emmanuel Gigliotti (Boca) en el primer minuto de la semifinal de la Copa Sudamericana 2014. Esta atajada fue el pilar anímico para la victoria de River y el comienzo del exitoso ciclo de Marcelo Gallardo.' },
    { img: upperFloorImages[1], title: 'El primer grito mundial', author: 'Juan Carlos "Chango" Cárdenas', year: '1967', desc: 'Juan Carlos "Chango" Cárdenas remata desde 30 metros para marcar el gol histórico contra el Celtic de Escocia en 1967. Disputado en Montevideo, este tanto consagró a Racing Club de Avellaneda como el primer equipo argentino en ganar la Copa Intercontinental.' },
    { img: upperFloorImages[2], title: 'Los albores del fútbol argentino', author: 'Copa Presidente de la Nación', year: '1920', desc: 'Imagen de la "Copa Presidente de la Nación" de 1920, un trofeo de la era amateur. Esta foto representa los primeros años de la competición organizada en el país, mucho antes del profesionalismo que comenzaría en 1931.' },
    { img: upperFloorImages[3], title: 'Nace una estrella', author: 'Sergio "Kun" Agüero', year: '2003', desc: 'Un joven Sergio "Kun" Agüero hace su debut en Independiente en 2003. Con solo 15 años y 35 días, y de la mano de Oscar Ruggeri como DT, rompió el récord de Diego Maradona como el jugador más joven en debutar en la Primera División argentina.' },
    { img: upperFloorImages[4], title: 'La hazaña de Old Trafford', author: 'Estudiantes de La Plata', year: '1968', desc: 'El plantel de Estudiantes de La Plata celebra tras empatar 1-1 contra el Manchester United en Inglaterra, en la final de la Copa Intercontinental 1968. Liderados por Osvaldo Zubeldía, se consagraron campeones del mundo en "El Teatro de los Sueños".' },
    
    // Pared derecha (5 cuadros)
    { img: upperFloorImages[5], title: 'El Titán de Tokio', author: 'Martín Palermo', year: '2000', desc: 'Martín Palermo define de zurda ante Iker Casillas para marcar el segundo de sus dos goles al Real Madrid en la final de la Copa Intercontinental 2000. En una actuación memorable, Boca venció 2-1 al equipo "Galáctico" y conquistó el mundo.' },
    { img: upperFloorImages[6], title: 'El gol de Madrid', author: 'Juan Fernando Quintero', year: '2018', desc: 'El colombiano Juan Fernando Quintero remata de zurda para marcar el 2-1 parcial contra Boca Juniors en el tiempo suplementario. Fue el gol que rompió el empate en la histórica final de la Copa Libertadores 2018 disputada en el Estadio Santiago Bernabéu.' },
    { img: upperFloorImages[7], title: 'El Rey de Copas', author: 'Independiente', year: '1984', desc: 'El plantel de Independiente, liderado por Ricardo Bochini y Jorge Burruchaga, celebra la obtención de su séptima Copa Libertadores en 1984. Este título consolidó al club de Avellaneda como el máximo ganador histórico del certamen, un récord que aún ostenta.' },
    { img: upperFloorImages[8], title: 'Estrella mundial en Banfield', author: 'James Rodríguez', year: '2008', desc: 'Imagen del joven James Rodríguez celebrando un golazo, y mostrando sus primeros dotes de calidad en su paso por Banfield antes de convertirse en estrella mundial.' },
    { img: upperFloorImages[9], title: 'El "humo" de clase mundial', author: 'Keylor Navas', year: '2024', desc: 'Un popular fotomontaje que postula al arquero estrella costarricense Keylor Navas como refuerzo de Newell\'s Old Boys. Esta imagen representa el folklore de los hinchas y los "sueños de mercado de pases" que se viralizan en las redes.' },

    // Pared del fondo (4 cuadros)
    { img: upperFloorImages[10], title: 'El regreso del D10S', author: 'Diego Armando Maradona', year: '1995', desc: 'Diego Armando Maradona vuelve a Boca Juniors en 1995, luciendo un icónico mechón de pelo teñido de amarillo. Su regreso, tras años de ausencia, revolucionó el fútbol argentino y marcó la última etapa de su carrera profesional.' },
    { img: upperFloorImages[11], title: 'El ritual del 10', author: 'Juan Román Riquelme', year: '2010', desc: 'Una imagen icónica de Juan Román Riquelme tomando mate. Apodada "Matelme", esta foto trasciende el fútbol y captura la esencia de Riquelme como símbolo de las costumbres argentinas, una figura que mantiene su mística ahora en su rol de dirigente.' },
    { img: upperFloorImages[12], title: 'La alegría de un pueblo', author: 'Fanatiz', year: '2022', desc: 'Argentina campeón. El resto es historia.' },
    { img: upperFloorImages[13], title: 'Grande por su hisToria, GiganTe por su genTe', author: 'El más grande del inTerior', year: '2025', desc: 'Como siempre, la hisToria de Córdoba la escribe Talleres. Único campeón nacional e internacional de Córdoba.' },
    
    // Pared del frente - primera sección (2 cuadros)
    { img: upperFloorImages[14], title: 'Un título de la cantera', author: 'Newell\'s Old Boys', year: '1988', desc: 'El plantel de Newell\'s Old Boys campeón de la temporada 1987/88. Liderado por el DT José Yudica, este equipo logró un hito único en el fútbol argentino moderno: se consagró campeón utilizando exclusivamente jugadores formados en sus propias divisiones inferiores.' },
    { img: upperFloorImages[15], title: 'Reliquia del ascenso', author: 'Club Atlético Huracán', year: '1932', desc: 'Un trofeo del club Huracán correspondiente a un campeonato de segunda división en 1932. Esta pieza es un testimonio de los primeros años del fútbol organizado y las distintas ligas que coexistían en la compleja transición entre el amateurismo y el profesionalismo.' },
    
    // Pared del frente - segunda sección (3 cuadros)
    { img: upperFloorImages[16], title: 'La hazaña del "Canalla"', author: 'Rosario Central', year: '1987', desc: 'El equipo de Rosario Central campeón de la temporada 1986/87. Liderado por Ángel Tulio Zof y con figuras como Omar Palma y Edgardo Bauza, logró un récord único: se consagró campeón de Primera División en la temporada inmediatamente posterior a su ascenso.' },
    { img: upperFloorImages[17], title: 'Maradona en su trono como DT', author: 'Diego Armando Maradona', year: '2019', desc: '2019, Diego Maradona es el DT de Gimnasia y Esgrima La Plata. Para agasajarlo y por sus problemas de rodilla, el club le preparaba un "trono" (un sillón de lujo, tipo capitán) personalizado para que dirigiera desde el banco de suplentes.' },
    { img: upperFloorImages[18], title: 'Los inicios del "Pupi"', author: 'Javier Zanetti', year: '1993', desc: 'Un joven Javier Zanetti durante su etapa en Talleres de Remedios de Escalada. Fue en el "Taladro" donde el legendario lateral se dio a conocer, mostrando la calidad y resistencia que lo llevarían a una carrera histórica de dos décadas en el Inter de Milán y la Selección Argentina.' },
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
    const shouldFlip = img && (img.includes('planta_alta/maradona vuelve a boca 1995') || 
                       img.includes('planta_alta/matelme') || 
                       img.includes('planta_alta/mbappe_sarmiento') || 
                       img.includes('planta_alta/Mostaza Merlo') ||
                       img.includes('planta_alta/Newells campeon 1988') || 
                       img.includes('planta_alta/Premio campeonato') || 
                       img.includes('planta_alta/Rosario Central') || 
                       img.includes('planta_alta/trono maradona') || 
                       img.includes('planta_alta/Zanetti'));
    
    // If the provided path is a video (.mp4) delegate to addVideoFrame so
    // the video element, VideoTexture and window.museumVideos handling are used.
    if (img && img.includes('.mp4')) {
      // Use the existing addVideoFrame helper to create a video frame at upperY.
      // Provide the same face/x/z/title/desc so it replaces this image slot.
      // Don't pass 'flip' explicitly - let addVideoFrame decide based on face.
      addVideoFrame(scene, interactables, {
        x: x,
        y: upperY,
        z: z,
        face: face,
        videoSrc: img,
        title: title,
        desc: desc
      });
      return; // already added as a video frame
    }

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

  frameGroup.userData = { title, desc, isVideo: false };
    scene.add(frameGroup);
    interactables.push(frameGroup);
  }

  let imageIndex = 0;

  // Calcular regiones usando ROOM y DOOR para distribuir cuadros centrados
  const halfW = ROOM.w / 2;
  const halfD = ROOM.d / 2;

  // Pared izquierda (5 cuadros) -> distribuir en profundidad (z) a lo largo del pasillo
  (function(){
    const count = 5;
    const zMin = -halfD + 6; // mantener cierta separación de esquinas
    const zMax = halfD - 6;
    const panelX = -halfW + 0.18; // muro izquierdo
    for(let i=1;i<=count;i++){
      const t = i / (count+1);
      const z = zMin + (zMax - zMin) * t;
      const obra = upperCatalog[imageIndex % upperCatalog.length];
      addUpperFloorFrame({ x: panelX, z: Math.round(z*100)/100, face: 'left', img: upperFloorImages[imageIndex] || obra.img, title: obra.title, desc: `${obra.author} · ${obra.year}\n\n${obra.desc}` });
      imageIndex++;
    }
  })();

  // Pared derecha (5 cuadros)
  (function(){
    const count = 5;
    const zMin = -halfD + 6;
    const zMax = halfD - 6;
    const panelX = halfW - 0.18; // muro derecho
    for(let i=1;i<=count;i++){
      const t = i / (count+1);
      const z = zMin + (zMax - zMin) * t;
      const obra = upperCatalog[imageIndex % upperCatalog.length];
      addUpperFloorFrame({ x: panelX, z: Math.round(z*100)/100, face: 'right', img: upperFloorImages[imageIndex] || obra.img, title: obra.title, desc: `${obra.author} · ${obra.year}\n\n${obra.desc}` });
      imageIndex++;
    }
  })();

  // Pared del fondo (4 cuadros) -> distribuir centrados a lo ancho completo
  (function(){
    const count = 4;
    const xMin = -halfW + 2;
    const xMax = halfW - 2;
    const z = -halfD + 0.18;
    for(let i=1;i<=count;i++){
      const t = i / (count+1);
      const x = xMin + (xMax - xMin) * t;
      const obra = upperCatalog[imageIndex % upperCatalog.length];
      addUpperFloorFrame({ x: Math.round(x*100)/100, z: z, face: 'back', img: upperFloorImages[imageIndex] || obra.img, title: obra.title, desc: `${obra.author} · ${obra.year}\n\n${obra.desc}` });
      imageIndex++;
    }
  })();

  // Pared del frente -> distribuir todos los cuadros frontales como un bloque centrado
  (function(){
    const leftCount = 2;
    const rightCount = 3;
    const totalCount = leftCount + rightCount;
    const z = halfD - 0.18;

    // disponible a lo ancho (respetando un pequeño margen lateral)
    const xMin = -halfW + 2;
    const xMax = halfW - 2;

    // spacing que centra el bloque en x=0
    const spacing = totalCount > 1 ? (xMax - xMin) / (totalCount - 1) : 0;
    // start para que la media del bloque quede en 0
    const start = -((totalCount - 1) * spacing) / 2;

    for (let i = 0; i < totalCount; i++) {
      const x = Math.round((start + i * spacing) * 100) / 100;
      const obra = upperCatalog[imageIndex % upperCatalog.length];
      const face = x < 0 ? 'frontinicial' : 'frontfinal';
      addUpperFloorFrame({ x: x, z: z, face: face, img: upperFloorImages[imageIndex] || obra.img, title: obra.title, desc: `${obra.author} · ${obra.year}\n\n${obra.desc}` });
      imageIndex++;
    }
  })();
}