//Dependencies Webpack  and threeJS, npm install webpack webpack-cli, npm install threeJS
// npm run-script build to compile, work on this file.
// dont change package.json


//Llamada de la librerias
const THREE = require('three');
// CommonJS:
const dat = require('dat.gui');
const Stats = require('stats.js');

//controles orbitales
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
//Model loaders
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
//Basis Texture loader
import { BasisTextureLoader } from 'three/examples/jsm/loaders/BasisTextureLoader.js';



// CameraControls.install( { THREE: THREE } );
const canvas = document.getElementById('canvas');
const clock = new THREE.Clock();
 // Optional: Pre-fetch Draco WASM/JS module.
// dracoLoader.preload();
//Scene and render
var renderer, scene, bgScene, camera, cameraControls;

//
var MovingCube, textureCamera, screenCamera, screenScene, firstRenderTarget, finalRenderTarget ;

var controls;
var mixer, mixer2,mixerCap;

const fov = 35;
const aspect =  window.innerWidth/ window.innerHeight;  // the canvas default
const near = 0.1;
const far = 500;

//Lights
var spotLight, light, hemisLight;
var spotLightHelper;

//Interface
var gui;
var obj;
var stats;

function init() 
{
	
	//DAT GUI
	gui = new dat.gui.GUI();
	obj = {
		explode: function () {
		alert('Bang!');
		},
	
		//spotlight
		posX: -25, 
		posY: 8, 
		posZ: 7,
		colorL: "#ffffff", // RGB array
		penunmbra: 0.2,
		helpSpot:true,
		intSpot:1,
		
		intAmbien:1,
		color0: "#443333", 
		intHemis:1,
		colorg: "#111122", 
	};
	
	renderer = new THREE.WebGLRenderer({ canvas });
	scene = new THREE.Scene();
    // scene.fog = new THREE.Fog( 0x443333, 1, 4 );

	
	camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	
	//Lights
	// spotLight = new THREE.SpotLight( 0xffff00 );
	light = new THREE.AmbientLight( obj.color0 ); // soft white light
	hemisLight = new THREE.HemisphereLight( obj.color0, obj.colorg, 1 );
	

	stats = new Stats();
}

function addLights() 
{
	
	//Hemisphere light
	scene.add( hemisLight );
	spotLight = new THREE.SpotLight();
    spotLight.angle = Math.PI / 16;
    spotLight.penumbra = 0.5;
    spotLight.castShadow = true;
    spotLight.position.set( obj.posX, obj.posY, obj.posZ );
	scene.add( spotLight );
	spotLightHelper = new THREE.SpotLightHelper( spotLight );
	scene.add( spotLightHelper );
	
}

function addGUI() 
{
	stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
	document.body.appendChild( stats.dom );

	var guiSL = gui.addFolder('SpotLight');
	guiSL.add(obj, 'helpSpot').onChange(function (val) {
		spotLightHelper.visible = val;
	});
	guiSL.add(obj, 'posX').onChange(function (val) {
		spotLight.position.x = val;
		spotLightHelper.update();
	});
	guiSL.add(obj, 'posY').onChange(function (val) {
		spotLight.position.y = val;
		spotLightHelper.update();

	});
	guiSL.add(obj, 'posZ').onChange(function (val) {
		spotLight.position.z = val;
		spotLightHelper.update();

	});
	//Ambient Light
	var guiAL = gui.addFolder('AmbientLight');
	guiAL.addColor(obj, 'color0').onChange(function (val) {
		light.color.set(val);
		hemisLight.color.set(val);
	});
	guiAL.add(obj, 'intAmbien').min(0).max(1).step(0.1).onChange(function (val) {
		light.intensity = val;
	}).name('Intensity');

	//Hemisphere Light
	var guiHL = gui.addFolder('HemisphereLight');
	guiHL.addColor(obj, 'colorg').onChange(function (val) {
		hemisLight.groundColor.set(val);
	});
	guiHL.add(obj, 'intHemis').min(0).max(1).step(0.1).onChange(function (val) {
		hemisLight.intensity = val;
	}).name('Intensity');
	
}

function main() {

	
	//Renderer
	renderer.setClearColor(0x222222);
	renderer.autoClearColor = false;
    renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.outputEncoding = THREE.sRGBEncoding;
	//renderer.gammaOutput = true;
    //renderer.gammaFactor = 2.2;
    renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
	
	//Camera 1
	camera.position.x = 14;
	camera.position.y = 2;
	camera.position.z = 6;
	camera.lookAt( 0, 0.1, 0 );
	controls = new OrbitControls( camera, renderer.domElement );
	
	//Camera 2
	textureCamera = new THREE.PerspectiveCamera( fov, aspect, near, far);
	scene.add(textureCamera);

	
	// create an array with six textures for a cool cube
	var materialArray = [];
	materialArray.push(new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load( 'images/xpos.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load( 'images/xneg.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load( 'images/ypos.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load( 'images/yneg.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load( 'images/zpos.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load( 'images/zneg.png' ) }));
	
	
	var MovingCubeMat = materialArray;

	//var MovingCubeMat  = new THREE.MeshBasicMaterial( { color: 0x00FF00 } );
	var MovingCubeGeom = new THREE.BoxGeometry();

	MovingCube = new THREE.Mesh( MovingCubeGeom, MovingCubeMat );
	MovingCube.position.set(2, 0.5, 2);
	scene.add( MovingCube );




	//
	addLights();

	//Models
	// loadDraco('model/draco/alocasia_s.drc');
	// loadGLTF('model/glb/Flamingo.glb', [-2, 2, 1], [0.01, 0.01, 0.01]);
	loadGLTF('model/gltf/capoeira/Capoeira.gltf', [1, 0, 0], [0.01, 0.01, 0.01]).then(function(gltf){
		console.log('termine gltf!');
		mixerCap = new THREE.AnimationMixer( gltf.scene );
		var action = mixerCap.clipAction( gltf.animations[ 0 ] );
		action.play();
		
	}).catch(function (err) {
		console.log(err);
		
	});
	/*loadFBX('model/fbx/avatar1.fbx', [2, 0, -1], [0.01, 0.01, 0.01]).then(function(obj1){
		// console.log('termine!');
		mixer = new THREE.AnimationMixer( obj1 );
		var action = mixer.clipAction( obj1.animations[ 0 ] );
		action.play();
		
	})*/
	
    var plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry( 80, 80 ),
		new THREE.MeshPhongMaterial( { color: 0x999999, specular: 0x101010 } )
		);
    plane.rotation.x = - Math.PI / 2;
    plane.receiveShadow = true;
	scene.add( plane );





	// intermediate scene.
	//   this solves the problem of the mirrored texture by mirroring it again.
	//   consists of a camera looking at a plane with the mirrored texture on it. 
	screenScene = new THREE.Scene();
	
	screenCamera = new THREE.OrthographicCamera( 
		window.innerWidth  / -2, window.innerWidth  /  2, 
		window.innerHeight /  2, window.innerHeight / -2, 
		-10000, 10000 );
	screenCamera.position.z = 1;
	screenScene.add( screenCamera );
				
	var screenGeometry = new THREE.PlaneGeometry( window.innerWidth, window.innerHeight );
	
	firstRenderTarget = new THREE.WebGLRenderTarget( 512, 512, { format: THREE.RGBFormat } );	
	var screenMaterial = new THREE.MeshStandardMaterial( { map: firstRenderTarget } );
	
	var quad = new THREE.Mesh( screenGeometry, screenMaterial );
	// quad.rotation.x = Math.PI / 2;
	screenScene.add( quad );


    				
	// final version of camera texture, used in scene. 
	var planeGeometry = new THREE.BoxGeometry( 10, 5, 0.01);

	finalRenderTarget = new THREE.WebGLRenderTarget( 512, 512, { format: THREE.RGBFormat } );
	//var planeMaterial = new THREE.MeshStandardMaterial( { map: finalRenderTarget } );
	var planeMaterial = new THREE.MeshBasicMaterial( { color: 0x000000 } );

	var plane = new THREE.Mesh( planeGeometry, planeMaterial );
	plane.position.set(0,2.5,-4);
	scene.add(plane);
	// pseudo-border for plane, to make it easier to see
	var planeGeometry = new THREE.BoxGeometry( 11, 6, 0.01);
	var planeMaterial = new THREE.MeshBasicMaterial( { color: 0x000000 } );
	var plane = new THREE.Mesh( planeGeometry, planeMaterial );
	plane.position.set(0,2.5,-4.1);
	scene.add(plane);
		



	//
	addGUI();
}

function loadFBX(path,pos,scale) {
	const promise = new Promise(function (resolve, reject) {
		var loader = new FBXLoader();
		loader.load( path, function ( object ) {
	
			//console.log(object);
			object.scale.set(scale[0], scale[1], scale[2]);
			object.position.set(pos[0], pos[1], pos[2]);
				
			object.traverse( function ( child ) {
				if ( child.isMesh ) {
					child.castShadow = true;
					child.receiveShadow = true;
				}
			} );
			scene.add( object );
			//console.log(object);
			if (object == null) {
				reject();
			}else{
				resolve(object);
			}
	
		} );
		
	})
	return promise;
}

function loadGLTF(path, pos,scale) {
	return new Promise((resolve, reject)=>{

		// Instantiate a loader
		var loader = new GLTFLoader();
	
		// Optional: Provide a DRACOLoader instance to decode compressed mesh data
		var dracoLoader = new DRACOLoader();
		// dracoLoader.setDecoderPath( '/examples/js/libs/draco/' );
		dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
		loader.setDRACOLoader( dracoLoader );
	
		// Load a glTF resource
		loader.load(
			// resource URL
			path,
			// called when the resource is loaded
			function ( gltf ) {
				//Transformations
				gltf.scene.scale.set(scale[0], scale[1], scale[2]);
				gltf.scene.position.set(pos[0], pos[1], pos[2]);
				gltf.scene.castShadow = true;
				gltf.scene.receiveShadow = true;
				gltf.scene.traverse( function ( child ) {
					if ( child.isMesh ) {
						child.castShadow = true;
						child.receiveShadow = true;
					}
				} );
				scene.add( gltf.scene );
				//console.log(gltf);
				
				gltf.animations; // Array<THREE.AnimationClip>
				gltf.scene; // THREE.Group
				gltf.scenes; // Array<THREE.Group>
				gltf.cameras; // Array<THREE.Camera>
				gltf.asset; // Object
				resolve(gltf)
	
			},
			// called while loading is progressing
			function ( xhr ) {
	
				console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
	
			},
			// called when loading has errors
			function ( error ) {
	
				console.log( 'An error happened' );
				reject(error);
			});	
	});
}

function loadDraco(path) {
	var dracoLoader = new DRACOLoader();
	// It is recommended to always pull your Draco JavaScript and WASM decoders
	// from this URL. Users will benefit from having the Draco decoder in cache
	// as more sites start using the static URL.
	dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
	
	dracoLoader.setDecoderConfig( { type: 'js' } );

	dracoLoader.load( path, function ( geometry ) {

		geometry.computeVertexNormals();

		var material = new THREE.MeshStandardMaterial( { color: 0x606060 } );
		var mesh = new THREE.Mesh( geometry, material );
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		// mesh.position.y = 0.3;
		scene.add( mesh );

		// Release decoder resources.
		dracoLoader.dispose();

	} );
}

function loadBasisTexture(path){
	return new Promise((resolve, reject)=>{
		var material = new THREE.MeshStandardMaterial();
		var loader = new BasisTextureLoader();
		loader.setTranscoderPath( 'js/libs/basis/' );
		loader.detectSupport( renderer );
		loader.load( path, function ( texture ) {
	
			texture.encoding = THREE.sRGBEncoding;
			material.map = texture;
			material.needsUpdate = true;
			resolve (material);
	
		}, undefined, function ( error ) {
			console.error( error );
			reject (error);
		} );
		
	})

}

function displayWindowSize(){
	// Get width and height of the window excluding scrollbars
	var w = document.documentElement.clientWidth;
	var h = document.documentElement.clientHeight;
	
	// Display result inside a div element
	// console.log("Width: " + w + ", " + "Height: " + h);
	renderer.setSize(w, h);
	// camera.fov = Math.atan(window.innerHeight / 2 / camera.position.z) * 2 * THREE.Math.RAD2DEG;
	camera.aspect = w / h;
	camera.updateProjectionMatrix();
}

// Attaching the event listener function to window's resize event
window.addEventListener("resize", displayWindowSize);
// document.addEventListener( 'keydown', onKeyDown, false );
// document.addEventListener( 'keyup', onKeyUp, false );

function animate() 
{
	// const hasControlsUpdated = cameraControls.update( delta );
	requestAnimationFrame(animate);
	render();
	// controls.update();
	stats.update();	
	controls.update();
	renderer.render(scene, camera);
}


function render() 
{
	const delta = clock.getDelta();
	//Para la animacion
	if ( mixer ) mixer.update( delta );
	if ( mixer2 ) mixer2.update( delta );
	if ( mixerCap ) mixerCap.update( delta );

	
	// textureCamera is located at the position of MovingCube
	//   (and therefore is contained within it)
	// Thus, we temporarily hide MovingCube 
	//    so that it does not obscure the view from the camera.
	MovingCube.visible = false;	
	// put the result of textureCamera into the first texture.
	//renderer.render( scene, textureCamera);
	//renderer.setRenderTarget(firstRenderTarget);

	MovingCube.visible = true;

	// slight problem: texture is mirrored.
	//    solve problem by rendering (and hence mirroring) the texture again
	
	// render another scene containing just a quad with the texture
	//    and put the result into the final texture
	//renderer.render( screenScene, screenCamera);
	//renderer.setRenderTarget(finalRenderTarget);



	
	
}

init();
main();
animate();
