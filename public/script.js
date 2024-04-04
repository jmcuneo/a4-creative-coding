import * as THREE from 'three';
import { Pane } from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.3/dist/tweakpane.min.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('visualization').appendChild(renderer.domElement);


// Camera position
camera.position.z = 5;


// Web Audio API setup
const audioListener = new THREE.AudioListener();
camera.add(audioListener);

const audio = new THREE.Audio(audioListener);
const audioLoader = new THREE.AudioLoader();
let analyser;

const playButton = document.getElementById('playButton');
playButton.addEventListener('click', function() {
    // Ensures the audio context is resumed
    if (audioListener.context.state === 'suspended') {
        audioListener.context.resume();
    }

    // Now start the audio loading and playback
    audioLoader.load('boomwhacker.wav', function(buffer) {
        audio.setBuffer(buffer);
        audio.setLoop(true);
        audio.setVolume(0.5);
        audio.play();

        analyser = new THREE.AudioAnalyser(audio, 32);
        animate();
    });

    // hide the play button after clicked
    this.style.display = 'none';
});


// Particle Visualizer
const particleCount = 5000;
const particles = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i++) {
    particlePositions[i] = Math.random() * 2 - 1;
}

particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particleMaterial = new THREE.PointsMaterial({ color: 0x888888, size: 0.1 });
const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);


// Animation loop, update particles based on audio
function animate() {
    requestAnimationFrame(animate);

    if (analyser) {
        const data = analyser.getFrequencyData();
        const positions = particleSystem.geometry.attributes.position.array;

        let scale = 1; // will be controlled by user input
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += data[i % data.length] * 0.0001 * scale;
            positions[i + 1] += data[(i + 1) % data.length] * 0.0001 * scale;
            positions[i + 2] += data[(i + 2) % data.length] * 0.0001 * scale;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
    }
    renderer.render(scene, camera);
}


// User controls with Tweakpane
const pane = new Pane();
const params = {
    volume: 0.5,
};
pane.addInput(params, 'volume', {min: 0, max: 1}).on('change', value => {
    audio.setVolume(value);
});
