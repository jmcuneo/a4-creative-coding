// CDN Tweakpane import
import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.3/dist/tweakpane.min.js'
let noise = new SimplexNoise();
let scene = new THREE.Scene();
/**
 * @function vizInit
 * @description This function initializes the audio context and creates the 3D visualization of the audio file
 * @param {void}
 * @returns {void}
 */
let vizInit = function (){

    let file = document.getElementById("audioFile");
    let audio = document.getElementById("audio");
    let fileLabel = document.querySelector("label.file");
// document onload is used to play the audio file as soon as the page loads
    document.onload = function(e){
        console.log(e);
        audio.play();
        play();
    }
// file.onchange is used to play the audio file as soon as the file is selected
    file.onchange = function(){
        fileLabel.classList.add('normal');
        audio.classList.add('active');
        let files = this.files;
// audio.src is used to create a URL for the selected file
        audio.src = URL.createObjectURL(files[0]);
        audio.load();
        audio.play();
        play();
    }

    /**
     * @function play
     * @description This function creates the 3D visualization of the audio file.
     * It uses the Web Audio API.
     * It creates a scene, camera, renderer, and adds the audio file to the scene.
     * It also creates a plane, ball, and light sources to create the 3D visualization.
     * @param {void}
     * @returns {void}
     */
    function play() {
        let context = new AudioContext();
        let src = context.createMediaElementSource(audio);
        let analyser = context.createAnalyser();
        src.connect(analyser);
        analyser.connect(context.destination);
        analyser.fftSize = 512;
        let bufferLength = analyser.frequencyBinCount;
        let dataArray = new Uint8Array(bufferLength);
        let group = new THREE.Group();
        let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0,0,100);
        camera.lookAt(scene.position);
        scene.add(camera);

        let renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);

        let planeGeometry = new THREE.PlaneGeometry(800, 800, 20, 20);
        let planeMaterial = new THREE.MeshLambertMaterial({
            //color: 0x0,
            side: THREE.DoubleSide,
            wireframe: true
        });
// The plane is used to create the ground for the 3D visualization
        let plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -0.5 * Math.PI;
        plane.position.set(0, 30, 0);
        group.add(plane);
// The plane2 is used to create the ground for the 3D visualization
        let plane2 = new THREE.Mesh(planeGeometry, planeMaterial);
        plane2.rotation.x = -0.5 * Math.PI;
        plane2.position.set(0, -30, 0);
        group.add(plane2);
// The icosahedronGeometry is used to create the ball for the 3D visualization
        let icosahedronGeometry = new THREE.IcosahedronGeometry(10, 4);
        let lambertMaterial = new THREE.MeshLambertMaterial({
            color: 0x0,
            wireframe: true
        });

        let ball = new THREE.Mesh(icosahedronGeometry, lambertMaterial);
        ball.position.set(0, 0, 0);
        ball.name="ball"
        group.add(ball);
        let ambientLight = new THREE.AmbientLight(0xaaaaaa);
        scene.add(ambientLight);

        let spotLight = new THREE.SpotLight(0xffffff);
        spotLight.intensity = 0.9;
        spotLight.position.set(-10, 40, 20);
        spotLight.lookAt(ball);
        spotLight.castShadow = true;
        scene.add(spotLight);

        scene.add(group);

        document.getElementById('out').appendChild(renderer.domElement);

        window.addEventListener('resize', onWindowResize, false);

        render();

        /**
         * @function render
         * @description This function renders the 3D visualization of the audio file.
         * It uses the analyser to get the frequency data of the audio file.
         * It then creates the 3D visualization based on the frequency data.
         * @param {void}
         * @returns {void}
         */
        function render() {
            analyser.getByteFrequencyData(dataArray);

            let lowerHalfArray = dataArray.slice(0, (dataArray.length/2) - 1);
            let upperHalfArray = dataArray.slice((dataArray.length/2) - 1, dataArray.length - 1);

            let overallAvg = avg(dataArray);
            let lowerMax = max(lowerHalfArray);
            let lowerAvg = avg(lowerHalfArray);
            let upperMax = max(upperHalfArray);
            let upperAvg = avg(upperHalfArray);

            let lowerMaxFr = lowerMax / lowerHalfArray.length;
            let lowerAvgFr = lowerAvg / lowerHalfArray.length;
            let upperMaxFr = upperMax / upperHalfArray.length;
            let upperAvgFr = upperAvg / upperHalfArray.length;

            makeRoughGround(plane, modulate(upperAvgFr, 0, 1, 0.5, 4));
            makeRoughGround(plane2, modulate(lowerMaxFr, 0, 1, 0.5, 4));

            makeRoughBall(ball, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));

            group.rotation.y += 0.005;
            renderer.render(scene, camera);
            requestAnimationFrame(render);
        }

        /**
         * @function onWindowResize
         * @description This function is called when the window is resized.
         * It updates the camera aspect ratio and renderer size.
         * @param {void}
         * @returns {void}
         */
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    /**
     * @function makeRoughBall
     * @description This function creates a rough ball based on the frequency data of the audio file.
     * It uses SimplexNoise to create the rough ball.
     * @param {object} mesh - The mesh object of the ball
     * @param {number} bassFr - The bass frequency of the audio file
     * @param {number} treFr - The treble frequency of the audio file
     * @returns {void}
     */
        function makeRoughBall(mesh, bassFr, treFr) {
            mesh.geometry.vertices.forEach(function (vertex, i) {
                let offset = mesh.geometry.parameters.radius;
                let amp = 7;
                let time = window.performance.now();
                vertex.normalize();
                let rf = 0.00001;
                let distance = (offset + bassFr ) + noise.noise3D(vertex.x + time *rf*7, vertex.y +  time*rf*8, vertex.z + time*rf*9) * amp * treFr;
                vertex.multiplyScalar(distance);
            });
            mesh.geometry.verticesNeedUpdate = true;
            mesh.geometry.normalsNeedUpdate = true;
            mesh.geometry.computeVertexNormals();
            mesh.geometry.computeFaceNormals();
        }

        /**
         * @function makeRoughGround
         * @description This function creates a rough ground based on the frequency data of the audio file.
         * It uses SimplexNoise to create the rough ground.
         * @param {object} mesh - The mesh object of the ground
         * @param {number} distortionFr - The distortion frequency of the audio file
         * @returns {void}
         */
        function makeRoughGround(mesh, distortionFr) {
            mesh.geometry.vertices.forEach(function (vertex, i) {
                let amp = 2;
                let time = Date.now();
                let distance = (noise.noise2D(vertex.x + time * 0.0003, vertex.y + time * 0.0001) + 0) * distortionFr * amp;
                vertex.z = distance;
            });
            mesh.geometry.verticesNeedUpdate = true;
            mesh.geometry.normalsNeedUpdate = true;
            mesh.geometry.computeVertexNormals();
            mesh.geometry.computeFaceNormals();
        }

        audio.play();
    };
}
// The vizInit function is called when the window loads
window.onload = vizInit();

document.body.addEventListener('touchend', function(ev) { context.resume(); });

/**
 * @function fractionate
 * @description This function calculates the fraction of a value between a minimum and maximum value.
 * @param {number} val - The value to calculate the fraction of
 * @param {number} minVal - The minimum value
 * @param {number} maxVal - The maximum value
 * @returns {number} - The fraction of the value between the minimum and maximum value
 */
function fractionate(val, minVal, maxVal) {
    return (val - minVal)/(maxVal - minVal);
}

/**
 * @function modulate
 * @description This function modulates a value between a minimum and maximum value to another minimum and maximum value.
 * @param {number} val - The value to modulate
 * @param {number} minVal - The minimum value
 * @param {number} maxVal - The maximum value
 * @param {number} outMin - The minimum output value
 * @param {number} outMax - The maximum output value
 * @returns {number} - The modulated value
 */
function modulate(val, minVal, maxVal, outMin, outMax) {
    let fr = fractionate(val, minVal, maxVal);
    let delta = outMax - outMin;
    return outMin + (fr * delta);
}

/**
 * @function avg
 * @description This function calculates the average of an array of numbers.
 * It uses the reduce function to sum all the numbers in the array and then divides the sum by the length of the array.
 * @param {array} arr - The array of numbers
 * @returns {number} - The average of the array of numbers
 */
function avg(arr){
    let total = arr.reduce(function(sum, b) { return sum + b; });
    return (total / arr.length);
}

/**
 * @function max
 * @description This function calculates the maximum value of an array of numbers.
 * It uses the reduce function to find the maximum value in the array.
 * @param {array} arr - The array of numbers
 * @returns {number} - The maximum value in the array of numbers
 */

function max(arr){
    return arr.reduce(function(a, b){ return Math.max(a, b); })
}
const pane = new Pane();
/**
 * @constant PARAMS
 * @description This constant object stores the parameters for the Tweakpane library.
 * The parameters are used to control the 3D visualization of the audio file.
 * The parameters include the factor, title, color, percentage, theme, volume, ArtistName, and Genre.
 */
const PARAMS = {
    volume: 0.5 ,
    background: {r: 13, g: 175, b: 173},
    ball: {r:0,g:0,b:0},
    playback_speed: 1.0,
};

const volumeBinding = pane.addBinding(PARAMS, 'volume', { min: 0, max: 1, step: 0.1 });
const backgroundBinding = pane.addBinding(PARAMS, 'background');
const ballBinding = pane.addBinding(PARAMS, 'ball')
const playbackBinding = pane.addBinding(PARAMS, 'playback_speed', { min: 0.3, max: 2.0, step: 0.1 })
/**
 * @function on
 * @description This function listens for changes in the volume parameter.
 * When the volume parameter changes, the audio volume is updated.
 * @param {string} change - The change event
 * @param {function} callback - The callback function to update the audio volume
 * @returns {void}
 */
volumeBinding.on('change', (ev) => {
    audio.volume = ev.value;
});

backgroundBinding.on('change', (ev) => {
    const background = document.getElementById('background')
    console.log(`rgb(${ev.value.r}, ${ev.value.g}, ${ev.value.b})`)
    background.style.background = `rgb(${ev.value.r}, ${ev.value.g}, ${ev.value.b})`;
});

ballBinding.on('change', (ev) => {
    const ball = scene.getObjectByName('ball')
    console.log(`rgb(${ev.value.r}, ${ev.value.g}, ${ev.value.b})`)
    ball.material.color = new THREE.Color(`rgb(${Math.floor(ev.value.r)}, ${Math.floor(ev.value.g)}, ${Math.floor(ev.value.b)})`);
});

playbackBinding.on('change', (ev) => {
    audio.playbackRate = ev.value;
});