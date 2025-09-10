// GLTFLoader simplificado para cargar modelos GLTF
THREE.GLTFLoader = function ( manager ) {
	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
};

THREE.GLTFLoader.prototype = {
	constructor: THREE.GLTFLoader,
	
	load: function ( url, onLoad, onProgress, onError ) {
		var scope = this;
		var loader = new THREE.FileLoader( scope.manager );
		loader.setResponseType( 'json' );
		loader.load( url, function ( json ) {
			try {
				scope.parse( json, onLoad, onError );
			} catch ( e ) {
				if ( onError ) {
					onError( e );
				} else {
					console.error( e );
				}
			}
		}, onProgress, onError );
	},
	
	parse: function ( json, onLoad, onError ) {
		// Parser muy básico para GLTF
		var scene = new THREE.Group();
		
		if ( json.scenes && json.scenes[0] && json.nodes ) {
			var sceneData = json.scenes[0];
			this.parseNodes( json, sceneData.nodes, scene );
		}
		
		if ( onLoad ) {
			onLoad( { scene: scene, scenes: [scene] } );
		}
	},
	
	parseNodes: function ( json, nodeIndices, parent ) {
		if ( !nodeIndices ) return;
		
		for ( var i = 0; i < nodeIndices.length; i++ ) {
			var nodeIndex = nodeIndices[i];
			var nodeData = json.nodes[nodeIndex];
			
			var node = new THREE.Group();
			
			if ( nodeData.name ) {
				node.name = nodeData.name;
			}
			
			// Transformaciones
			if ( nodeData.translation ) {
				node.position.fromArray( nodeData.translation );
			}
			if ( nodeData.rotation ) {
				node.quaternion.fromArray( nodeData.rotation );
			}
			if ( nodeData.scale ) {
				node.scale.fromArray( nodeData.scale );
			}
			
			// Mesh
			if ( nodeData.mesh !== undefined && json.meshes ) {
				var meshData = json.meshes[nodeData.mesh];
				var mesh = this.parseMesh( json, meshData );
				if ( mesh ) {
					node.add( mesh );
				}
			}
			
			// Hijos
			if ( nodeData.children ) {
				this.parseNodes( json, nodeData.children, node );
			}
			
			parent.add( node );
		}
	},
	
	parseMesh: function ( json, meshData ) {
		if ( !meshData.primitives || meshData.primitives.length === 0 ) {
			return null;
		}
		
		var group = new THREE.Group();
		
		for ( var i = 0; i < meshData.primitives.length; i++ ) {
			var primitive = meshData.primitives[i];
			var geometry = this.parseGeometry( json, primitive );
			var material = this.parseMaterial( json, primitive.material );
			
			if ( geometry && material ) {
				var mesh = new THREE.Mesh( geometry, material );
				group.add( mesh );
			}
		}
		
		return group.children.length === 1 ? group.children[0] : group;
	},
	
	parseGeometry: function ( json, primitive ) {
		// Parser básico de geometría
		var geometry = new THREE.BufferGeometry();
		
		if ( !json.accessors || !json.bufferViews || !json.buffers ) {
			return new THREE.SphereGeometry( 0.1, 16, 12 ); // Fallback
		}
		
		// Por simplicidad, devolvemos una esfera como fallback
		return new THREE.SphereGeometry( 0.1, 32, 16 );
	},
	
	parseMaterial: function ( json, materialIndex ) {
		if ( materialIndex === undefined || !json.materials ) {
			return new THREE.MeshStandardMaterial( { color: 0xffffff } );
		}
		
		var materialData = json.materials[materialIndex];
		var material = new THREE.MeshStandardMaterial();
		
		if ( materialData.pbrMetallicRoughness ) {
			var pbr = materialData.pbrMetallicRoughness;
			if ( pbr.baseColorFactor ) {
				material.color.fromArray( pbr.baseColorFactor );
			}
			if ( pbr.metallicFactor !== undefined ) {
				material.metalness = pbr.metallicFactor;
			}
			if ( pbr.roughnessFactor !== undefined ) {
				material.roughness = pbr.roughnessFactor;
			}
			
			// Cargar textura base si existe
			if ( pbr.baseColorTexture && json.textures && json.images ) {
				var textureIndex = pbr.baseColorTexture.index;
				if ( json.textures[textureIndex] && json.textures[textureIndex].source !== undefined ) {
					var imageIndex = json.textures[textureIndex].source;
					if ( json.images[imageIndex] && json.images[imageIndex].uri ) {
						var textureLoader = new THREE.TextureLoader();
						var texturePath = './assets/models/jabulani/textures/' + json.images[imageIndex].uri;
						textureLoader.load( texturePath, function( texture ) {
							texture.flipY = false;
							texture.colorSpace = THREE.SRGBColorSpace;
							material.map = texture;
							material.needsUpdate = true;
						});
					}
				}
			}
		}
		
		return material;
	}
};
