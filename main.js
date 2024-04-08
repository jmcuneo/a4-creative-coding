let audioElement

const start = function() {
    const canvas = document.getElementById('visualizer');
    const ctx = canvas.getContext('2d');

    // audio init
    const audioCtx = new AudioContext();
    audioElement = document.createElement('audio');
    document.body.appendChild(audioElement);

    // audio graph setup
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024; // 512 bins
    const player = audioCtx.createMediaElementSource(audioElement);
    player.connect(audioCtx.destination);
    player.connect(analyser);

    // make sure, for this example, that your audio file is accessible
    // from your server's root directory... here we assume the file is
    // in the same location as our index.html file
    audioElement.src = './attss.mp3';
    audioElement.play();

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    function draw() {
        // temporal recursion, call the function in the future
        window.requestAnimationFrame(draw);

        // fill our canvas with a black box
        // by doing this every frame we 'clear' the canvas
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // set the color to white for drawing our visualization
        ctx.fillStyle = 'white';

        analyser.getByteFrequencyData(dataArray);

        const bufferLength = dataArray.length;
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];

            ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight);

            x += barWidth + 1;
        }
    }

    draw();
};

const stop = function() {
    audioElement.pause();
};

window.onload = () => {
    document.getElementById('startButton').onclick = start;
    document.getElementById('stopButton').onclick = stop;
}
