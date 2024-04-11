import { Pane } from "tweakpane";

const PARAMS = {
  gain: 1.0,
  color: { r: 28, g: 0, b: 204 },
  background: { r: 219, g: 202, b: 239 },
  radius: 4,
  scale: 5,
};

// Clears the canvas and returns the context
const newCanvas = function () {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = `rgb(${PARAMS.background.r}, ${PARAMS.background.g}, ${PARAMS.background.b})`;
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

  audioElement.src = "./test-audio-2.wav";
  audioElement.play();

  const results = new Uint8Array(analyser.frequencyBinCount);

  const draw = function () {
    window.requestAnimationFrame(draw);

    const ctx = newCanvas();
    ctx.strokeStyle = `rgb(${PARAMS.color.r}, ${PARAMS.color.g}, ${PARAMS.color.b})`;
    gainNode.gain.value = PARAMS.gain;
    analyser.getByteFrequencyData(results);

    for (let i = 0; i < analyser.frequencyBinCount; i++) {
      ctx.beginPath();
      let center = 512 / 2;
      let r = (PARAMS.radius * 512) / 24;
      let x = r * Math.cos((Math.PI * 2 * i) / 512);
      let y = r * Math.sin((Math.PI * 2 * i) / 512);
      let scale = results[i] * 0.001 * PARAMS.scale;
      ctx.moveTo(
        center + x * (1 - scale * 0.15),
        center + y * (1 - scale * 0.15)
      );
      ctx.lineTo(center + x * (1 + scale), center + y * (1 + scale));
      ctx.stroke();
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
  const tabs = pane.addTab({
    pages: [{ title: "Visual" }, { title: "Audio" }],
  });
  tabs.pages[0].addBinding(PARAMS, "color");
  tabs.pages[0].addBinding(PARAMS, "background");
  tabs.pages[0].addBinding(PARAMS, "radius", { min: 1, max: 8, step: 0.25 });
  tabs.pages[0].addBinding(PARAMS, "scale", { min: 1, max: 15, step: 0.5 });
  tabs.pages[1].addBinding(PARAMS, "gain", { min: 0.25, max: 5.0 });

  document.querySelector("button").onclick = play;
};
