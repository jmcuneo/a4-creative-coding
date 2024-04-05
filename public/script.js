import * as THREE from 'three';
import { Pane } from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.3/dist/tweakpane.min.js';

class AudioVisualizer {

    // Sets up the Three.js scene, camera, and renderer
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 50;
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.analyser = null;
        this.frequencyData = null;

        window.addEventListener('resize', () => this.onResize());
        this.createVisualElements();
        this.createParticles();
        this.update();
    }


    // Creates visual elements like the TorusKnot and particles
    createVisualElements() {
        const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });
        this.torusKnot = new THREE.Mesh(geometry, material);
        this.scene.add(this.torusKnot);
    }


    // Creates particles dynamically and adds them to the scene
    createParticles() {
        const particleCount = 5000;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() * 2 - 1) * 500;
            positions[i * 3 + 1] = (Math.random() * 2 - 1) * 500;
            positions[i * 3 + 2] = (Math.random() * 2 - 1) * 500;
        }
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMaterial = new THREE.PointsMaterial({ size: 1.5, color: 0x888888, transparent: true });
        this.particles = new THREE.Points(particles, particleMaterial);
        this.scene.add(this.particles);
    }


    // The animation loop that updates visual effects based on audio
    update() {
        requestAnimationFrame(() => this.update());

        if (this.analyser) {
            this.analyser.getByteFrequencyData(this.frequencyData);

            const time = Date.now() * 0.0005;
            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                const ix = i / 3;
                const freqValue = this.frequencyData[ix % this.frequencyData.length] / 128.0;
                positions[i] += Math.sin(time + ix * 0.1) * 10 * freqValue;
                positions[i + 1] += Math.cos(time + ix * 0.1) * 10 * freqValue;
            }
            this.particles.geometry.attributes.position.needsUpdate = true;

            // Scale and rotate the TorusKnot
            const scale = (this.frequencyData[0] / 128.0) + 0.5;
            this.torusKnot.scale.set(scale, scale, scale);
            this.torusKnot.rotation.x += 0.01;
            this.torusKnot.rotation.y += 0.01;
        }

        this.renderer.render(this.scene, this.camera);
    }


    // Adjusts the scene aspect ratio on window resize
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }


    // Configures audio processing using Web Audio API
    setupAudioProcessing(audioElement) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

        const sourceNode = audioContext.createMediaElementSource(audioElement);
        sourceNode.connect(this.analyser);
        this.analyser.connect(audioContext.destination);
    }


    // Loads an audio file for visualization
    loadAudio(file) {
        const audioElement = document.createElement('audio');
        audioElement.src = URL.createObjectURL(file);
        audioElement.controls = true;
        audioElement.autoplay = true;
        audioElement.style.display = 'none';
        document.body.appendChild(audioElement);

        this.setupAudioProcessing(audioElement);
    }

}

const visualizer = new AudioVisualizer();

document.getElementById('audioFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        visualizer.loadAudio(file);
    }
});