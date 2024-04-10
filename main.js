import * as THREE from "three";
import {OBJLoader} from "three/addons/loaders/OBJLoader.js";
import {PointerLockControls} from "three/addons/controls/PointerLockControls.js";

var agent = {height: 2, ammunition: 30};
var playerGun;
var meshes = [];
var kb = {};

const loader = new OBJLoader();
const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();	
const camera = new THREE.PerspectiveCamera(75, (window.innerWidth-10) / (window.innerHeight-20), 0.1, 1000);
const controls = new PointerLockControls(camera,document.body);

function init() {
	renderer.setSize(window.innerWidth-10, window.innerHeight-20);
	document.body.appendChild(renderer.domElement);

	const geometry = new THREE.BoxGeometry(1,1,1);
	const material = new THREE.MeshBasicMaterial({color: 0xffffff});
	const cube = new THREE.Mesh(geometry, material);
	//scene.add(cube)
	scene.background = new THREE.Color(0xb6c9c9);
	camera.position.set(0, agent.height, 10);
	addGun();
	addGround();
	renderer.domElement.addEventListener("click", function() {
		controls.lock();
	}, false);

	window.addEventListener("keydown", keyDown, false);
	window.addEventListener("keyup", keyUp, true);
	animate();
}

function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene,camera);
	
	playerGun.rotation.y+=0.01;
	
	//W
	if(kb[87]) {
		controls.moveForward(0.1);
	}
	//S
	if(kb[83]) {
		controls.moveForward(-0.1);
	}
	//A
	if(kb[65]) {
		controls.moveRight(-0.1);
	}
	if(kb[68]) {
		controls.moveRight(0.1);
	}
						
}

function addGround() {
	var floor = new THREE.Mesh(
		new THREE.PlaneGeometry(25, 25, 10, 10),
		new THREE.MeshBasicMaterial({color: 0x7cfc00, wireframe: false})
	);
	floor.rotation.x -= Math.PI/2;
	scene.add(floor);
	meshes.push(floor);
}

function addGun() {
loader.load(
	// resource URL
	'assets/coolgun.obj',
	// called when resource is loaded
	function ( object ) {
		object.traverse(function(child) {
			if (child instanceof THREE.Mesh) {
				child.material = new THREE.MeshBasicMaterial({color:0x222222});
			}
		});
		object.scale.x = object.scale.y = object.scale.z = 0.25;
		object.position.y = 1.2;
		scene.add( object );
		playerGun = object;
	},
	// called when loading is in progresses
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened' );

	}
);

}

function keyDown(event) {
	kb[event.keyCode] = true;
}

function keyUp(event) {
	kb[event.keyCode] = false;
}


window.onload = init;
