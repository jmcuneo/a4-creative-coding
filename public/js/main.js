import { Pane } from "tweakpane";

const PARAMS = {
  gain: 1.0,
  color: { r: 255, g: 0, b: 55 },
};

// Clears the canvas and returns the context
const clearCanvas = function () {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return ctx;
};

const play = function () {
  document.querySelector("button").onclick = null;

  const audioCtx = new AudioContext();

  const audioElement = document.createElement("audio");
  document.body.appendChild(audioElement);

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;

  const gainNode = audioCtx.createGain();

  const player = audioCtx.createMediaElementSource(audioElement);
  player.connect(gainNode).connect(audioCtx.destination);
  player.connect(analyser);

  audioElement.src = "./test-audio.wav";
  audioElement.play();

  const results = new Uint8Array(analyser.frequencyBinCount);

  const draw = function () {
    window.requestAnimationFrame(draw);

    const ctx = clearCanvas();
    ctx.fillStyle = `rgb(${PARAMS.color.r}, ${PARAMS.color.g}, ${PARAMS.color.b})`;
    gainNode.gain.value = PARAMS.gain;
    analyser.getByteFrequencyData(results);

    for (let i = 0; i < analyser.frequencyBinCount; i++) {
      ctx.fillRect(i, 512, 1, -1 * results[i]);
    }
  };
  draw();
};

window.onload = async function () {
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);

  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const pane = new Pane({ title: "Controls" });
  pane.addBinding(PARAMS, "gain", { min: 0.25, max: 5.0 });
  pane.addBinding(PARAMS, "color");

  document.querySelector("button").onclick = play;
};
