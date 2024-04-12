import * as THREE from "three";
import {OBJLoader} from "three/addons/loaders/OBJLoader.js";
import {PointerLockControls} from "three/addons/controls/PointerLockControls.js";

var agent = {height: 2, ammunition: 210, health: 100, kills: 0};
var playerGun;
var meshes = {};
var kb = {};
var sprites = {};
var sounds = {};
var zombies = [];
var deadZombies = [];
var drops = [];
var materials = {};
var loaded = false;
var lmb = false;
var firecooldown = false;
var paused = true;
var pauseoverlay;
var ammooverlay;
var healthoverlay;
var scoreoverlay;
// unused but maybe if i want to continue this i can add difficulty levels and such
var zombieDamage = 10;
var zombieCount = 0;
// track how many health and ammo drops there are
var healthCount = 0;
var ammoCount = 0;

const loadingManager = new THREE.LoadingManager();
const loader = new OBJLoader(loadingManager);
const spriteLoader = new THREE.TextureLoader(loadingManager);
const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();	
const camera = new THREE.PerspectiveCamera(75, (window.innerWidth) / (window.innerHeight), 0.1, 1000);
const controls = new PointerLockControls(camera,document.body);
const listener = new THREE.AudioListener();
const audioLoader = new THREE.AudioLoader(loadingManager);
const Raycaster = new THREE.Raycaster();

function init() {
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	pauseoverlay = document.querySelector("#pauseoverlay");
	ammooverlay = document.querySelector("#bulletoverlay");
	scoreoverlay = document.querySelector("#scoreoverlay");
	healthoverlay = document.querySelector("#healthoverlay");

	loadingManager.onLoad = function() {
		console.log("loaded resources!");
		loaded = true;
		pauseoverlay.innerHTML = `<h1>ZOMBIE SLAYER</h1>
			<h2>Click to Play/Unpause!</h2>
			<p>Kill the zombies!</p>
			<p>Red boxes are health, yellow boxes are ammunition</p>
			<p>Controls: WASD to move, LMB to shoot</p>`;
	};
	
	scene.fog = new THREE.FogExp2(0xcccccc, 0.08);
	scene.add(camera);
	camera.add(listener);
	scene.background = new THREE.Color(0xb6c9c9);
	camera.position.set(0, agent.height, 10);
	addGun();
	loadSprites();
	loadSounds();
	addGround();
	renderer.shadowMap.enabled =true;
	renderer.shadowMap.type = THREE.BasicShadowMap;
	var ambience = new THREE.AmbientLight(0xffffff, 0.2);
	scene.add(ambience);
	loadZombie();

	pauseoverlay.addEventListener("click", function() {
		controls.lock();
	}, false);
	controls.addEventListener("lock", function() {
		pauseoverlay.style.visibility = "hidden";
	});
	controls.addEventListener("unlock", function() {
		pauseoverlay.style.visibility = "visible";
	});
	window.addEventListener("keydown", keyDown, false);
	window.addEventListener("keyup", keyUp, true);
	window.addEventListener("resize", onWindowResize, false);
	window.addEventListener("mousedown", mouseDown, false);
	window.addEventListener("mouseup", mouseUp, false);
	animate();
}

function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene,camera);

	if (!loaded || !controls.isLocked) {
		return;
	}

	ammooverlay.innerHTML = agent.ammunition;
	scoreoverlay.innerHTML = "KILLS: " + agent.kills;
	healthoverlay.innerHTML = "Health: " + agent.health;
	
	animateDrops();

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

	if(lmb) {
		fireGun();
	}
	handleDead();
	pathZombies();
	handleDrops();
	handleAttacks();
	handleGameOver();
	spawnZombies();
	renderer.renderLists.dispose();
}

function addGround() {
	var floor = new THREE.Mesh(
		new THREE.PlaneGeometry(250, 250, 50, 50),
		new THREE.MeshPhongMaterial({color: 0x7cfc00, wireframe: false})
	);
	floor.rotation.x -= Math.PI/2;
	floor.receiveShadow = true;
	scene.add(floor);
	meshes.floor = floor;
}

function loadSprites() {
	const map = spriteLoader.load("assets/fire.png");
	const material = new THREE.SpriteMaterial({map:map});

	const sprite = new THREE.Sprite(material);
	sprite.position.set(0,0.3,2.7);
	sprite.scale.set(1.5,1.5,1.5);
	sprites.fire = sprite;
}

function loadSounds() {
	audioLoader.load("assets/gunshot.mp3", function(buffer) {
		sounds.fire = buffer;
	});
	audioLoader.load("assets/itempickup.mp3", function(buffer) {
		sounds.pickup = buffer;
	});
	audioLoader.load("assets/bite.mp3", function(buffer) {
		sounds.bite = buffer;
	});
}

function loadZombie() {
	const geometry = new THREE.CapsuleGeometry(0.8, 1.2, 4, 8);
	const material = new THREE.MeshPhongMaterial({color:0x7b9969});
	const materialDead = new THREE.MeshPhongMaterial({color:0xff0000});
	const zombie = new THREE.Mesh(geometry, material);
	
	meshes.zombie = zombie;
	materials.deadzombie = materialDead;
}

function addZombie() {
	const zombie = meshes["zombie"].clone();

	let x = randomInt(-125,125);
	let z = randomInt(-125, -50);

	zombie.position.set(x,1.2,z);
	zombie.userData.health = 5;
	let randomDrop;
	let rng = Math.random();
	if (rng > 0.9) {
		zombie.userData.drop = "health";
	}
	else if (rng > 0.5) {
		zombie.userData.drop = "ammo";
	}
	else {
		zombie.userData.drop = "nothing";
	}
	zombie.userData.cooldown = false;
	zombie.castShadow = true;
	scene.add(zombie);
	zombies.push(zombie);
	zombieCount++;
}

function spawnZombies() {
	let rng = Math.random();
	// this makes the spawn rate FPS dependent, which is a little awkward
	// but whatever. people on 60 fps monitors will be chilling while
	// 144 fps will suffer. also i think movement is FPS based? not sure how
	// the PointerLockControls work
	if (rng < 0.013 && zombieCount < 75) {
		addZombie();
	}
}

function fireGun() {
	if (!firecooldown && agent.ammunition > 0) {
		firecooldown = true;
		playerGun.add(sprites["fire"]);
		let light = new THREE.PointLight(0xffff00, 1, 0, 2);
		light.position.set(0,0.3,2.7);
		light.castShadow = true;
		playerGun.add(light);
		let sound = new THREE.Audio(listener);
		let buffer = sounds["fire"];
		sound.setBuffer(buffer);
		sound.setLoop(false);
		sound.setVolume(0.5);
		sound.play();
		agent.ammunition--;
		
		let gunPos = new THREE.Vector3();
		playerGun.getWorldPosition(gunPos);
		let gunDirection = new THREE.Vector3();
		playerGun.getWorldDirection(gunDirection);
		Raycaster.set(gunPos, gunDirection);
		let intersections = Raycaster.intersectObjects(zombies);

		//we only want the first two intersection (double kill allowed)
		//some ugly code repretion but whatever
		if (intersections.length>0) {
			if (intersections.length>1) {
				for (let i = 0; i<2; i++) {
					let zombie = intersections[i].object;
					zombie.userData.health--;

					if (zombie.userData.health <= 0) {
						zombie.material.dispose();
						zombie.material = materials["deadzombie"];
						killZombie(zombie);
					}
				}
			}
			else {
				let zombie = intersections[0].object
				zombie.userData.health--;
				if (zombie.userData.health <= 0) {
					zombie.material.dispose();
					zombie.material = materials["deadzombie"];
					killZombie(zombie);
				}
			}
		}

		setTimeout(function() {
			firecooldown = false;
		}, 63);
		setTimeout(function() {
			playerGun.remove(sprites["fire"]);
			playerGun.remove(light);
			light.dispose();
		}, 30);
	}
}

function killZombie(zombie) {
	agent.kills++;
	let killed = [];
	for (let i = 0; i<zombies.length; i++) {
		if (zombie === zombies[i]) {
			killed.push(i);
			deadZombies.push(zombie);
		}
	}
	// sort greatest to least to prevent order of elements from changing 
	killed.sort(function(a,b) {
		return b-a;
	});
	for (let i =0; i<killed.length; i++) {
		zombies.splice(killed[i], 1);
	}
	zombieCount--;
	console.log("dzl: " + deadZombies.length);
	console.log("zl: " + zombies.length);
	console.log(zombieCount);
}

function handleDead() {
	let handled = [];
	for (let i=0; i<deadZombies.length; i++) {
		let deadZombie = deadZombies[i];
		deadZombie.position.y -= 0.075;
		if (deadZombie.position.y <= -1) {
			scene.remove(deadZombie);
			deadZombie.material.dispose();
			deadZombie.geometry.dispose();
			deadZombie.remove.apply(deadZombie, deadZombie.children);
			dropGoodies(deadZombie);
			//prevent issues from occuring with two in same frame. will do for other handling events.
			handled.push(i);
		}
	}
	// sort greatest to least to prevent order of elements from changing 
	handled.sort(function(a,b) {
		return b-a;
	});
	for (let i =0; i<handled.length; i++) {
		deadZombies.splice(handled[i], 1);
	}
}

function pathZombies() {
	let cameraPos = new THREE.Vector3();
	camera.getWorldPosition(cameraPos);
	for (let i=0; i<zombies.length; i++) {
		zombies[i].lookAt(cameraPos);
		if (!isAgentProximity(zombies[i], 1.1)) {
			zombies[i].translateZ(0.075);
		}
	}

}

function dropGoodies(zombie) {
	if (zombie.userData.drop == "nothing") {
		return;
	}
	let color;
	if (zombie.userData.drop === "health") {
		color = 0xff0000;
		if (healthCount>20) return;
		healthCount++;
	}
	else if (zombie.userData.drop === "ammo") {
		color = 0xffff00;
		if (ammoCount >20) return;
		ammoCount++;
	}
	else {
		console.log("should never happen!");
		return;
	}
	let mesh = new THREE.Mesh(
		new THREE.BoxGeometry(1,1,1),
		new THREE.MeshPhongMaterial({color: color})
	);
	mesh.position.set(zombie.position.x, 1, zombie.position.z);
	mesh.userData.drop = zombie.userData.drop;
	scene.add(mesh);

	let light = new THREE.PointLight(color, 5, 0, 2);
	light.castShadow = true;
	light.position.set(0,-0.9,0);
	light.name = "dropLight";
	mesh.add(light);
	
	drops.push(mesh);
}

function handleDrops() {
	let handled = [];
	for (let i = 0; i<drops.length; i++) {
		if(isAgentProximity(drops[i], 1.2)) {
			console.log(i);
			let drop = drops[i];
			console.log(drop);
			let dropType = drop.userData.drop;
			if (dropType === "health") {
				if (agent.health >= 150) continue;
				healthCount--;
				if (agent.health <= 30) {
					healthoverlay.classList.remove("healthCritical");
				}
				agent.health+=50;
				if (agent.health > 150) {
					agent.health = 150;
				}
			}
			if (dropType === "ammo") {
				ammoCount--;
				agent.ammunition += 30;
			}

			let sound = new THREE.Audio(listener);
			let buffer = sounds["pickup"];
			sound.setBuffer(buffer);
			sound.setLoop(false);
			sound.setVolume(1);
			sound.play();
			scene.remove(drop);
			drop.geometry.dispose();
			drop.material.dispose();
			drop.getObjectByName("dropLight").dispose();
			drop.remove.apply(drop, drop.children);
			handled.push(i);
		}
	}
	// sort greatest to least to prevent order of elements from changing 
	handled.sort(function(a,b) {
		return b-a;
	});
	for (let i = 0; i<handled.length; i++) {
		drops.splice(handled[i], 1);
	}
}

function handleAttacks() {
	for (let i = 0; i<zombies.length; i++) {
		let zombie = zombies[i];
		if (!zombie.userData.cooldown && isAgentProximity(zombie, 2)) {
			zombie.userData.cooldown = true;
			agent.health -= zombieDamage;
			
			if (agent.health <= 30) {
				healthoverlay.classList.add("healthCritical");
			}
			else { 
				healthoverlay.classList.add("healthAlert");
				setTimeout( function() {
					healthoverlay.classList.remove("healthAlert");
				}, 2000);
			}

			setTimeout( function() {
				zombie.userData.cooldown = false;
			}, 600);

			let sound = new THREE.Audio(listener);
			let buffer = sounds["bite"];
			sound.setBuffer(buffer);
			sound.setLoop(false);
			sound.setVolume(1);
			sound.play();
		}
	}
}

function handleGameOver() {
	if(agent.health <= 0) {
		document.querySelector("#gameover").style.visibility = "visible";
		document.querySelector("#killsgameover").innerHTML = "KILLS: " + agent.kills;
		setTimeout(function() {
			window.addEventListener("keydown", function() {
				location.reload();	
			}, false);
		}, 1000);
		controls.unlock();
	}
}

// very basic collision detection for pick up drop or get bitten
function isAgentProximity(object, distance) {
	let cameraPos = new THREE.Vector3();
	let objectPos = new THREE.Vector3();
	
	camera.getWorldPosition(cameraPos);
	object.getWorldPosition(objectPos);
	
	cameraPos.y = objectPos.y = 0;

	if (cameraPos.distanceTo(objectPos) < distance) {
		return true;
	}
	return false;
}

function animateDrops() {
	for (let i = 0; i < drops.length; i++) {
		drops[i].rotation.x+=0.01;
		drops[i].rotation.y+=0.01;
	}
}

function addGun() {
	loader.load(
		// resource URL
		'assets/coolgun.obj',
		// called when resource is loaded
		function ( object ) {
			object.traverse(function(child) {
				if (child instanceof THREE.Mesh) {
					child.material = new THREE.MeshPhongMaterial({color:0x222222});
				}
			});
			object.position.set(0.4,-0.2,-0.4);
			object.scale.x = object.scale.y = object.scale.z = 0.1;
			object.rotation.y = Math.PI;
			camera.add( object );
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

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function randomInt(min, max) {
	return Math.floor(Math.random()*(max-min)+min);
}

function mouseDown() {
	lmb = true;
}

function mouseUp() {
	lmb = false;
}

window.onload = init;
