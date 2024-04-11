import * as THREE from 'https://cdn.skypack.dev/three@0.132.2/build/three.module.js';
import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.3/dist/tweakpane.min.js';
let scene = new THREE.Scene();

let overlayClosed = false;

//SCREEN
let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;

//CAMERA
let camera = new THREE.PerspectiveCamera(60, screenWidth/screenHeight, 0.1, 100)
camera.position.z = 20
scene.add(camera)

//RENDERER
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({canvas})

renderer.render(scene, camera)

let frustumHeight 
let frustumWidth

let halfFrustumHeight 
let halfFrustumWidth
let boundingBoxMin 
let boundingBoxMax

let boundaryLeft
let boundaryRight 
let boundaryTop
let boundaryBottom

const flock = []
setupScene()

class Boid{
  constructor(){
    this.position = new THREE.Vector3(Math.random() * 16-8, Math.random() * 12-6, 0); 
    this.velocity = new THREE.Vector3(0.1, 0.1, 0);
    this.acceleration = new THREE.Vector3(); 
    this.maxSpeed = 0.1; 
    this.viewRadius = 1.5; 
    this.sizeMultiplier = Math.random() * 0.1

    const geometry = new THREE.SphereGeometry(0.2 + this.sizeMultiplier, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: genColorFromPalette() });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position); 
    scene.add(this.mesh); 
  }
  update(){
    const separationForce = this.calculateSeparationForce()
    const alignmentForce = this.calculateAlignmentForce()
    const randomForce = this.calculateRandomAcceleration()
    const mouseForce = this.calculateMouseAttractionForce()
    this.acceleration.add(separationForce)
    this.acceleration.add(alignmentForce)
    this.acceleration.add(randomForce)
    this.acceleration.add(mouseForce)
    this.velocity.add(this.acceleration).clampLength(0, this.maxSpeed); 
    this.position.add(this.velocity);
    this.position.z = 0;
    this.mesh.position.copy(this.position); 
    this.acceleration.set(0, 0, 0);
    //PULL TOWARDS CENTER IF OUT OF BOUNDS
    if (this.position.x < boundaryLeft || this.position.x > boundaryRight ||
        this.position.y < boundaryBottom || this.position.y > boundaryTop) {
        const centerDirection = new THREE.Vector3(0, 0, 0).sub(this.position).normalize();
        const distanceToCenter = this.position.distanceTo(new THREE.Vector3(0, 0, 0));
        const pullMagnitude = (distanceToCenter - boundaryRight) * 0.0008; 
        const pullForce = centerDirection.multiplyScalar(pullMagnitude);
        this.velocity.add(pullForce);
    }
  }
  
  //CLASS FUNCTIONS
  
  getBoidsInViewRadius(){
  const boidsInView = []
  for(const otherBoid of flock){
    if(otherBoid !== this){
      const distance = this.position.distanceTo(otherBoid.position);

      if(distance <= this.viewRadius)
        boidsInView.push(otherBoid)
      }
    }
  return boidsInView
  }

  calculateMouseAttractionForce(){
    const distance = this.position.distanceTo(mousePosition)
    if(distance < 3) 
      {        
        const mousePositionCopy = mousePosition.clone();
        const attractionForce = mousePositionCopy.sub(this.position)
        return attractionForce.multiplyScalar(mouseAttractionScalar)
      }
    return new THREE.Vector3()
  }
  
  calculateRandomAcceleration(){
    const randomAcceleration = new THREE.Vector3(
      Math.random() * 2 - 1, 
      Math.random() * 2 - 1, 
      0 )
    return randomAcceleration.multiplyScalar(ranForceScalar)
    }

  calculateSeparationForce(){
    let totalForce = new THREE.Vector3(); 
    const boidsInView = this.getBoidsInViewRadius();

    for (const otherBoid of boidsInView) {
      const direction = new THREE.Vector3().subVectors(this.position, otherBoid.position); 
      const distance = this.position.distanceTo(otherBoid.position);

      if(distance !== 0)
        direction.divideScalar(distance); 
      totalForce.add(direction); 
    }
    return totalForce.multiplyScalar(separationScalar)
  }
  
  calculateAlignmentForce(){
    let totalForce = this.velocity;
    const boidsInView = this.getBoidsInViewRadius();
    
    for (const otherBoid of boidsInView) {
      totalForce = totalForce.add(otherBoid.velocity); 
    }
    if(boidsInView.length !== 0)
      totalForce.divideScalar(boidsInView.length)
    return totalForce.multiplyScalar(alignmentScalar)
  }
}//END OF BOID CLASS

function updateBoids(){
  for(const boid of flock){
    boid.update();
  }
}

function createFlock(numBoids){
  const currentNumBoids = flock.length
  if(numBoids > currentNumBoids){
    const numToAdd = numBoids - currentNumBoids
    for(let i = 0; i < numToAdd; i++){
      const boid = new Boid();
      flock.push(boid);
      scene.add(boid.mesh)
    }
  } else if (numBoids < currentNumBoids) {
    const numToRemove = currentNumBoids - numBoids;
    const boidsToRemove = flock.splice(-numToRemove, numToRemove);
    for(const boid of boidsToRemove) {
      scene.remove(boid.mesh)
    }
  }
}//CreateFlock

//RENDER LOOP
function animate() {
    requestAnimationFrame(animate);
    updateBoids();
    renderer.render(scene, camera);
}
animate();

//LIGHT
const light = new THREE.PointLight(0xFFFFFFF, 1, 100)
light.position.z = 20
scene.add(light)

let ranForceScalar = 0.02
let mouseAttractionScalar = 0.015
let alignmentScalar = 1.0
let separationScalar = 0.008

//TWEAKPANE
const params = {
  boids: 50,
  random_force: ranForceScalar,
  mouse_attraction: mouseAttractionScalar,
  alignment_force: alignmentScalar,
  separation_force: separationScalar
}

const pane = new Pane({ container: document.getElementById('tweakpane-container') });
const b1 = pane.addBinding(params, 'boids', { min: 50, max: 500, step: 1 });
const b2 = pane.addBinding(params, 'random_force', { min: 0, max: 0.2, step: 0.01 });
const b3 = pane.addBinding(params, 'mouse_attraction', { min: 0, max: 0.5, step: 0.001 });
const b4 = pane.addBinding(params, 'alignment_force', { min: 0, max: 10, step: 0.1 });
const b5 = pane.addBinding(params, 'separation_force', { min: 0, max: 1, step: 0.001 });

b1.on('change', (boids) =>{ createFlock(boids.value) })
b2.on('change', (random_force)=>{ ranForceScalar = random_force.value })
b3.on('change', (mouse_force)=>{ mouseAttractionScalar = mouse_force.value })
b4.on('change', (alignment_force)=>{ alignmentScalar = alignment_force.value })
b5.on('change', (separation_force)=>{ separationScalar = separation_force.value })

//EVENTS
let mousePosition = new THREE.Vector3();

window.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / canvas.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / canvas.height) * 2 + 1;
  const mouseFrustumX = x * halfFrustumWidth;
  const mouseFrustumY = y * halfFrustumHeight;
  const worldX = THREE.MathUtils.lerp(boundingBoxMin.x, boundingBoxMax.x, (mouseFrustumX + halfFrustumWidth) / frustumWidth);
  const worldY = THREE.MathUtils.lerp(boundingBoxMin.y, boundingBoxMax.y, (mouseFrustumY + halfFrustumHeight) / frustumHeight);
  mousePosition.set(worldX, worldY, 0);
})

window.addEventListener('resize', setupScene)

document.addEventListener("DOMContentLoaded", function() {
  const overlay = document.getElementById("overlay")
})

//OTHER FUNCTIONS
function setupScene(){
  //SCREEN
  screenWidth = window.innerWidth;
  screenHeight = window.innerHeight;

  //CAMERA
  camera.aspect = screenWidth / screenHeight;
  camera.updateProjectionMatrix();
  
  //RENDERER
  renderer.setSize(screenWidth, screenHeight)

  frustumHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.position.z * 2;
  frustumWidth = frustumHeight * camera.aspect;

  halfFrustumHeight = frustumHeight / 2;
  halfFrustumWidth = frustumWidth / 2;
  boundingBoxMin = new THREE.Vector3(-halfFrustumWidth, -halfFrustumHeight, 0);
  boundingBoxMax = new THREE.Vector3(halfFrustumWidth, halfFrustumHeight, 0);

  boundaryLeft = boundingBoxMin.x;
  boundaryRight = boundingBoxMax.x;
  boundaryTop = boundingBoxMax.y;
  boundaryBottom = boundingBoxMin.y;
  if (!overlayClosed){
    const overlay = document.createElement('div');
    overlay.id = 'overlay';
    overlay.innerText = 'Move your mouse around to attract boids';
    overlay.addEventListener('mousemove', () => {
      setTimeout(() => {
        overlay.innerText = 'Change the boid behavior by altering parameters in the bottom-right '
        setTimeout(() => {
          overlay.style.display = 'none'; 
        }, 4000)
        overlayClosed = true;
      }, 3000)
    });
    document.body.appendChild(overlay);
  }
}

//COLORS
function genColorFromPalette(){
  const n = Math.floor(Math.random() * 5)
  let result = ""
  switch(n){
      case 0:
        result+="41D3BD"
        break;
      case 1:
        result+="FFFFF2"
        break;
      case 2:
        result+="791E94"
        break;
      case 3:
        result+="DE6449"
        break;
      case 4:
        result+="407899"
        break;
  }
  return parseInt("0x" + result, 16);
}

createFlock(50)