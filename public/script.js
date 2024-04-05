import * as THREE from 'three';
import { Pane } from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.3/dist/tweakpane.min.js';

class AudioVisualizer {

    // Set up the Three.js scene, camera, and renderer
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 50;
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.analyser = null;
        this.frequencyData = null;

        this.params = {
            particleSize: 1.5,
            torusKnotScale: 1,
            rotationSpeed: 0.01,
            color: { r: 255, g: 255, b: 0 }, // Initial color of the torus knot
        };
        window.addEventListener('resize', () => this.onResize());

        this.createVisualElements();
        this.createParticles();
        this.update();
        this.setupControls();
    }


    // Create visual elements like the TorusKnot and particles
    createVisualElements() {
        const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });
        this.torusKnot = new THREE.Mesh(geometry, material);
        this.scene.add(this.torusKnot);
    }


    // Create particles dynamically and adds them to the scene
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
            const dynamicScale = this.frequencyData[0] / 128.0 * this.params.torusKnotScale;
            this.torusKnot.scale.set(dynamicScale, dynamicScale, dynamicScale);

            this.torusKnot.rotation.x += this.params.rotationSpeed;
            this.torusKnot.rotation.y += this.params.rotationSpeed;
        }

        this.renderer.render(this.scene, this.camera);
    }


    // Adjust the scene aspect ratio on window resize
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }


    // Configure audio processing using Web Audio API
    setupAudioProcessing(audioElement) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

        const sourceNode = audioContext.createMediaElementSource(audioElement);
        sourceNode.connect(this.analyser);
        this.analyser.connect(audioContext.destination);
    }


    // Load an audio file for visualization
    loadAudio(file) {
        // if an existing audio element is present, pause it before removing
        const existingAudioElement = document.querySelector('audio');
        if (existingAudioElement) {
            existingAudioElement.pause();
            existingAudioElement.parentNode.removeChild(existingAudioElement);
        }

        // create a new audio element for the new file
        const audioElement = document.createElement('audio');
        audioElement.src = URL.createObjectURL(file);
        audioElement.controls = true;
        audioElement.autoplay = true;
        audioElement.style.display = 'none';
        document.body.appendChild(audioElement);

        // setup for the new audio element
        this.setupAudioProcessing(audioElement);
    }

    // Using tweakpane for users to control particle size, torus knot scale and its rotation speed
    setupControls() {
        const pane = new Pane();

        // Control for particle size
        pane.addBlade({
            view: 'slider',
            label: 'particleSize',
            min: 0.1,
            max: 5,
            value: this.params.particleSize,
            step: 0.1,
        }).on('change', (ev) => {
            this.particles.material.size = ev.value;
        });

        // Control for torus knot scale
        pane.addBlade({
            view: 'slider',
            label: 'Torus Knot Scale',
            min: 0.5,
            max: 2,
            value: this.params.torusKnotScale,
        }).on('change', (ev) => {
            this.params.torusKnotScale = ev.value;
        });

        // Control for rotation speed
        pane.addBlade({
            view: 'slider',
            label: 'Rotation Speed',
            min: 0.001,
            max: 0.05,
            value: this.params.rotationSpeed,
        }).on('change', (ev) => {
            this.params.rotationSpeed = ev.value;
        });
    }
}

const visualizer = new AudioVisualizer();

// Load the audio file
document.getElementById('audioFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        visualizer.loadAudio(file);
    }
});

// Another button for users to control the color of torus knot
document.getElementById('colorPicker').addEventListener('change', function(event) {
    const colorValue = event.target.value;
    visualizer.torusKnot.material.color.set(colorValue);
});

// Display basic documentation for the user interface when the application first loads
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById("infoModal");
    const span = document.getElementsByClassName("close")[0];

    modal.style.display = "block";

    // clicks on <span> (x), so to close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // clicks anywhere outside the modal can also close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});
