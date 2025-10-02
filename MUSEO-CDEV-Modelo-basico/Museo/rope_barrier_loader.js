// Cargador simple para la rope barrier GLTF
function loadRopeBarrier(scene, GLTFLoader) {
    console.log('🚧 Cargando rope barrier desde assets/models/vip_rope_barrier/');
    
    const loader = new GLTFLoader();
    const position = { x: 0, y: 0, z: 5 };
    
    loader.load(
        './assets/models/vip_rope_barrier/scene.gltf',
        function(gltf) {
            console.log('✅ Rope barrier GLTF cargado exitosamente');
            
            const model = gltf.scene;
            
            // Configuración básica
            model.position.set(position.x, position.y, position.z);
            model.scale.set(1.5, 1.5, 1.5);
            
            // Configurar meshes
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.visible = true;
                    
                    // Asegurar opacidad completa
                    if (child.material && child.material.transparent) {
                        child.material.transparent = false;
                        child.material.opacity = 1.0;
                    }
                }
            });
            
            // Agregar a la escena
            scene.add(model);
            console.log('✅ Rope barrier agregada en posición:', position);
        },
        function(progress) {
            console.log('Cargando rope barrier:', Math.round(progress.loaded / progress.total * 100) + '%');
        },
        function(error) {
            console.error('❌ Error cargando rope barrier:', error);
            
            // Crear marcador de error
            const errorBox = new THREE.Mesh(
                new THREE.BoxGeometry(2, 1, 0.1),
                new THREE.MeshBasicMaterial({ color: 0xff0000 })
            );
            errorBox.position.set(position.x, 0.5, position.z);
            scene.add(errorBox);
            console.log('🚨 Marcador de error creado en lugar del modelo');
        }
    );
}