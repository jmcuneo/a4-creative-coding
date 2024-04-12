import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.3/dist/tweakpane.min.js'
let noise = new SimplexNoise();
let vizInit = function (){

    let file = document.getElementById("audioFile");
    let audio = document.getElementById("audio");
    let fileLabel = document.querySelector("label.file");

    document.onload = function(e){
        console.log(e);
        audio.play();
        play();
    }
    file.onchange = function(){
        fileLabel.classList.add('normal');
        audio.classList.add('active');
        let files = this.files;

        audio.src = URL.createObjectURL(files[0]);
        audio.load();
        audio.play();
        play();
    }

    function play() {
        let context = new AudioContext();
        let src = context.createMediaElementSource(audio);
        let analyser = context.createAnalyser();
        src.connect(analyser);
        analyser.connect(context.destination);
        analyser.fftSize = 512;
        let bufferLength = analyser.frequencyBinCount;
        let dataArray = new Uint8Array(bufferLength);
        let scene = new THREE.Scene();
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

        let plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -0.5 * Math.PI;
        plane.position.set(0, 30, 0);
        group.add(plane);

        let plane2 = new THREE.Mesh(planeGeometry, planeMaterial);
        plane2.rotation.x = -0.5 * Math.PI;
        plane2.position.set(0, -30, 0);
        group.add(plane2);

        let icosahedronGeometry = new THREE.IcosahedronGeometry(10, 4);
        let lambertMaterial = new THREE.MeshLambertMaterial({
            color: 0x0,
            wireframe: true
        });

        let ball = new THREE.Mesh(icosahedronGeometry, lambertMaterial);
        ball.position.set(0, 0, 0);
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

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

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

window.onload = vizInit();

document.body.addEventListener('touchend', function(ev) { context.resume(); });

function fractionate(val, minVal, maxVal) {
    return (val - minVal)/(maxVal - minVal);
}

function modulate(val, minVal, maxVal, outMin, outMax) {
    let fr = fractionate(val, minVal, maxVal);
    let delta = outMax - outMin;
    return outMin + (fr * delta);
}

function avg(arr){
    let total = arr.reduce(function(sum, b) { return sum + b; });
    return (total / arr.length);
}

function max(arr){
    return arr.reduce(function(a, b){ return Math.max(a, b); })
}
const pane = new Pane();

const PARAMS = {
    factor: 123,
    title: '3D Song Visualization',
    color: '#ff0055',
    percentage: 50,
    theme: 'dark',
    volume: 0.5 ,
    ArtistName: '',
    Genre: ''
};
pane.addBinding(PARAMS, 'title', { min: 0, max: 100, step: 10 });
pane.addBinding(PARAMS, 'ArtistName', { min: 0, max: 100, step: 10 });
pane.addBinding(PARAMS, 'Genre', { min: 0, max: 100, step: 10 });
const volumeBinding = pane.addBinding(PARAMS, 'volume', { min: 0, max: 1, step: 0.1 });
pane.addBinding(PARAMS, 'percentage', { min: 0, max: 100, step: 10 });
pane.addBinding(PARAMS, 'factor', { min: 0, max: 100, step: 10 });
volumeBinding.on('change', (ev) => {
    audio.volume = ev.value;
});
