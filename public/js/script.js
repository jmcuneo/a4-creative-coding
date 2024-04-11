document.addEventListener('DOMContentLoaded', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const cubes = [];
    function createCube(color, position) {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: color });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(position, 0, -5);
        scene.add(cube);
        return cube;
    }
    //init cubes
    const colorInputs = document.querySelectorAll('input[type="color"]');
    const cubePositions = [-2, 0, 2, 4]; // X positions of cubes
    colorInputs.forEach((input, index) => {
        const cube = createCube(input.value, cubePositions[index]);
        cubes.push(cube);
    });

    //init audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioElement = document.createElement('audio');
    audioElement.src = '/song.mp3';
    audioElement.crossOrigin = 'anonymous';
    const source = audioContext.createMediaElementSource(audioElement);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    function updateVisualization() {
        requestAnimationFrame(updateVisualization);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);

        //frequency spectrum
        const bandSizes = [4, 8, 8, 8];
        const bandSums = bandSizes.map((size, index) => {
            return dataArray.slice(index * size, (index + 1) * size).reduce((a, b) => a + b, 0);
        });
        cubes.forEach((cube, index) => {
            const average = bandSums[index] / bandSizes[index];
            cube.scale.y = average / 100;
        });

        renderer.render(scene, camera);
    }

    const playButton = document.getElementById('playButton');
    playButton.addEventListener('click', () => {
        audioElement.play()
            .then(() => {
                console.log("playing song")
                updateVisualization();
            })
            .catch((error) => {
                console.error('error :', error);
            });
    });
    camera.position.z = 5;

    colorInputs.forEach((input, index) => {
        input.addEventListener('input', () => {
            cubes[index].material.color.set(input.value);
        });
    });
});
