let audioElement
let backgroundColor
let columnColor
let coloredPageBackground = true
let barCount = 1024

document.addEventListener('DOMContentLoaded', function() {
    const popup = document.getElementById('info');
    // Show popup on page load
    popup.style.display = 'block';

    // Close popup when clicked outside
    document.addEventListener('click', function(event) {
        if (!popup.contains(event.target) && popup.style.display === 'block') {
            popup.style.display = 'none';
        }
    });
});

const start = function() {
    if(audioElement)audioElement.pause()
    const canvas = document.getElementById('visualizer');
    const ctx = canvas.getContext('2d');

    // audio init
    const audioCtx = new AudioContext();
    audioElement = document.createElement('audio');
    document.body.appendChild(audioElement);

    audioElement.crossOrigin = 'anonymous'

    // audio graph setup
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = barCount; // Variable number, has to be power of 2
    const player = audioCtx.createMediaElementSource(audioElement);
    player.connect(audioCtx.destination);
    player.connect(analyser);

    // Link to music file, may have to adjust when hosted
    const fileInput = document.getElementById('fileInput');
    if(backgroundColor === "#e6b96f" && columnColor === "#cc213c"){ // 230 185 111 204 33 60
        audioElement.src = './DrumsOfLiberation.mp3';
        document.body.style.backgroundColor = "white"
        changeTextColors("#b46aaf")
    }
    else if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function(e) {
            // Set the source of the audio element to the data URL representing the file content
            audioElement.src = e.target.result;
            // Load and play the audio

        }
        reader.readAsDataURL(file);
    }
    else {
        audioElement.src = './attss.mp3';
    }



    audioElement.play();

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    function draw() {
        // temporal recursion, call the function in the future
        window.requestAnimationFrame(draw);

        // Fill canvas background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Set Bar Color
        ctx.fillStyle = columnColor;

        analyser.getByteFrequencyData(dataArray);

        const bufferLength = dataArray.length;
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            // TODO: Add bar size adjustment with values ranging from /2 to *1.75

            barHeight = dataArray[i] * (1 + (document.getElementById("verticalSlider").value*0.01));

            ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight);

            x += barWidth + 1;
        }
    }

    draw();
};

const stop = function() {
    audioElement.pause();
};

function adjustBarCount() {
    let sliderValue = document.getElementById("barSlider").value;
    barCount = Math.pow(2, sliderValue);
}

const initializeCanvas = function(){
    const canvas = document.getElementById('visualizer');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

const setColors = function(){
    backgroundColor = document.getElementById('backgroundColorPicker').value
    columnColor = document.getElementById('columnColorPicker').value

    //Change page background color
    if(coloredPageBackground) {
        document.body.style.backgroundColor = averageColor(backgroundColor, columnColor)
        let whiteText = isDarkColor(averageColor(backgroundColor, columnColor))
        if (whiteText) {
            changeTextColors("white")
        } else {
            changeTextColors("#4A4A4A")
        }
    }
    initializeCanvas()
}

function changeTextColors(color){
    const header = document.getElementById("header");
    header.style.color = color;
    const labels = document.querySelectorAll("label");
    labels.forEach(label => {
        label.style.color = color; // Change to the desired color
    });

}

function averageColor(hex1, hex2) {
    const hexToRgb = hex => ({
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16)
    });

    const rgbToHex = rgb => '#' + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);

    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);

    const avgR = Math.round((rgb1.r + rgb2.r) / 2);
    const avgG = Math.round((rgb1.g + rgb2.g) / 2);
    const avgB = Math.round((rgb1.b + rgb2.b) / 2);

    return rgbToHex({ r: avgR, g: avgG, b: avgB });
}

function isDarkColor(hex) {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Calculate brightness using the formula (R * 299 + G * 587 + B * 114) / 1000
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Return true if brightness is below a certain threshold (adjust as needed)
    return brightness < 128;
}

function toggleVariable() {
    coloredPageBackground = !coloredPageBackground; // Toggle the variable value
    if(!coloredPageBackground){
        document.body.style.backgroundColor = "gray"
        changeTextColors("#4A4A4A")
        document.getElementById("toggleButton").textContent = "Background Color Off"
    } else{
        document.getElementById("toggleButton").textContent = "Background Color On"
        setColors()
    }
}


window.onload = () => {

    setColors()
    document.getElementById('startButton').onclick = start;
    document.getElementById('stopButton').onclick = stop;
    document.getElementById('colorSubmit').onclick = setColors;
    document.getElementById("toggleButton").onclick = toggleVariable;
    document.getElementById("barSlider").addEventListener("input", adjustBarCount);
}
