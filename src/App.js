import React from 'react';
import './App.css';

import Model from './Game.js';
import { Up, Down, Left, Right } from './Game.js';
import { redrawCanvas } from './DrawGame.js';

import cat from './cat.svg';

var currentConfig = 0;

function App() {
  const [model, setModel] = React.useState(new Model(currentConfig));
  const [redraw, forceRedraw] = React.useState(0);

  const appRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  React.useEffect (() => {
    redrawCanvas(model, canvasRef.current, appRef.current);
  }, [model, redraw])

  const moveCat = (direction) => {
    model.ns.move(direction);
    model.pushSquares(direction);
    model.numMoves++
    model.canRemove();
    forceRedraw(redraw+1)  //reloads board after changes are made
  }

  const remove = () => {
    model.removeSquares();
    forceRedraw(redraw+1)
  }

  function switchConfig(config) {
    currentConfig = config;
    setModel(new Model(currentConfig));
  }

  function reset() {
    setModel(new Model(currentConfig));
  }

  return (
    <div className="App" ref={appRef}>
      <canvas tabIndex="1"  
        data-testid="canvas"
        className="App-canvas"
        ref={canvasRef}
        width={500}
        height={500}
        />
        <label className="moveCounter">{"Moves: " + model.numMoves}</label>
        <label className="selectConfig">{"Select Configuration:"}</label>
        <label className="victory" alt="hidden" hidden={model.victory !== 1} >YOU WIN!</label>
        <img id="cat" src={cat} alt="hidden" hidden></img>
      
        <button className="upbutton" data-testid="upbutton"   onClick={(e) => moveCat(Up)} disabled={model.ns.row === 0 || model.victory === 1}  >^</button>
        <button className="downbutton" data-testid="downbutton"   onClick={(e) => moveCat(Down)} disabled={model.ns.row === model.board.size - model.ns.height / 50 || model.victory === 1}  >v</button>
        <button className="rightbutton" data-testid="rightbutton"   onClick={(e) => moveCat(Right)} disabled={model.ns.column === model.board.size - model.ns.width / 50 || model.victory === 1}  >&gt;</button>
        <button className="leftbutton" data-testid="leftbutton"   onClick={(e) => moveCat(Left)} disabled={model.ns.column === 0 || model.victory === 1}  >&lt;</button>
        <button className="remove" data-testid="remove"   onClick={(e) => remove()} disabled={model.ableToRemove === 1 || model.victory === 1}  >Remove</button>

        <div className="configs">
          <button className="easy5x5" data-testid="5x5config"   onClick={(e) => switchConfig(0)} disabled={currentConfig === 0}  >1</button>
          <button className="hard5x5" data-testid="6x6config"   onClick={(e) => switchConfig(3)} disabled={currentConfig === 3}  >2</button>
          <button className="config4x4" data-testid="4x4config"   onClick={(e) => switchConfig(1)} disabled={currentConfig === 1}  >3</button>
          <button className="config6x6" data-testid="6x6config"   onClick={(e) => switchConfig(2)} disabled={currentConfig === 2}  >4</button>
          <button className="reset" data-testid="reset"   onClick={(e) => reset()} >Reset</button>
        </div>

        <div className="instructions">
          <div>How to play:</div>
          <div>Click the arrows next to the board to move the cat</div>
          <div>Push the colors into 2x2 squares of the same color</div>
          <div>Once in a 2x2, click remove to remove the 2x2 square</div>
          <div>Win by removing all colors from the board</div>
          <div>If a square is pushed off the board, it will wrap and appear on the other side</div>
          <div>The cat cannot wrap around the board</div>
        </div>
    </div>
  );
}

export default App;
