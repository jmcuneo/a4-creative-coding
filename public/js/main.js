import { Pane } from "tweakpane";

const PARAMS = {
  gain: 1.0,
  color: { r: 69, g: 43, b: 230 },
  background: { r: 219, g: 202, b: 239 },
  radius: 3.5,
  scale: 6,
  music: "./audio/ersatz.mp3",
  pan: 0,
  invert: false,
};

// Clears the canvas and returns the context
const newCanvas = function () {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  if (PARAMS.invert === false) {
    ctx.fillStyle = `rgb(${PARAMS.background.r}, ${PARAMS.background.g}, ${PARAMS.background.b})`;
  } else {
    ctx.fillStyle = `rgb(${255 - PARAMS.background.r}, ${
      255 - PARAMS.background.g
    }, ${255 - PARAMS.background.b})`;
  }

  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return ctx;
};

const start = function () {
  const audioCtx = new AudioContext();

  const audioElement = document.createElement("audio");
  document.body.appendChild(audioElement);

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 4096;

  const gainNode = audioCtx.createGain();
  const pannerOptions = { pan: PARAMS.pan };
  const panner = new StereoPannerNode(audioCtx, pannerOptions);

  const player = audioCtx.createMediaElementSource(audioElement);
  player.connect(gainNode).connect(panner).connect(audioCtx.destination);
  player.connect(analyser);

  audioElement.src = PARAMS.music;
  audioElement.addEventListener("ended", () => {
    document.querySelector("button").onclick = start;
    document.querySelector("button").dataset.playing = "false";
  });

  const results = new Uint8Array(analyser.frequencyBinCount);

  const draw = function () {
    if (document.querySelector("button").dataset.playing === "true") {
      window.requestAnimationFrame(draw);
    }

    const ctx = newCanvas();

    if (PARAMS.invert === false) {
      ctx.strokeStyle = `rgb(${PARAMS.color.r}, ${PARAMS.color.g}, ${PARAMS.color.b})`;
    } else {
      ctx.strokeStyle = `rgb(${255 - PARAMS.color.r}, ${
        255 - PARAMS.color.g
      }, ${255 - PARAMS.color.b})`;
    }

    gainNode.gain.value = PARAMS.gain;
    panner.pan.value = PARAMS.pan;
    analyser.getByteFrequencyData(results);

    for (let i = 0; i < analyser.frequencyBinCount; i++) {
      let center = 512 / 2;
      let r = (PARAMS.radius * 512) / 24;
      let x = r * Math.cos((Math.PI * 2 * i) / analyser.frequencyBinCount);
      let y = r * Math.sin((Math.PI * 2 * i) / analyser.frequencyBinCount);
      let scale = results[i] * 0.001 * PARAMS.scale;

      ctx.beginPath();
      ctx.moveTo(
        center - x * (1 - scale * 0.15),
        center - y * (1 - scale * 0.15)
      );
      ctx.lineTo(center - x * (1 + scale), center - y * (1 + scale));
      ctx.stroke();
    }
  };

  const playPause = function () {
    let button = document.querySelector("button");
    if (button.dataset.playing === "true") {
      audioElement.pause();
      button.dataset.playing = "false";
    } else {
      audioElement.play();
      button.dataset.playing = "true";
      draw();
    }
  };

  const stop = function () {
    let button = document.querySelector("button");
    button.dataset.playing = "false";
    button.onclick = start;
    audioElement.pause();
  };

  document.querySelector("button").onclick = playPause;
  document.getElementById("btn_stop").onclick = stop;
  playPause();
};

window.onload = async function () {
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);

  canvas.width = canvas.height = 512;
  newCanvas();

  const pane = new Pane({ title: "Controls" });
  pane.addBinding(PARAMS, "music", {
    options: {
      Ersatz: "./audio/ersatz.mp3",
      New_World: "./audio/new-world.mp3",
      Fourth_track: "./audio/fourth-track.mp3",
      Owl_Eyes: "./audio/owl-eyes.mp3",
    },
  });
  const tabs = pane.addTab({
    pages: [{ title: "Visual" }, { title: "Audio" }],
  });
  tabs.pages[0].addBinding(PARAMS, "color");
  tabs.pages[0].addBinding(PARAMS, "background");
  tabs.pages[0].addBinding(PARAMS, "radius", { min: 1, max: 8, step: 0.25 });
  tabs.pages[0].addBinding(PARAMS, "scale", { min: 1, max: 15, step: 0.5 });
  tabs.pages[0].addBinding(PARAMS, "invert");
  tabs.pages[1].addBinding(PARAMS, "gain", { min: 0.25, max: 5.0 });
  tabs.pages[1].addBinding(PARAMS, "pan", { min: -1, max: 1 });

  document.querySelector("button").onclick = start;
};
