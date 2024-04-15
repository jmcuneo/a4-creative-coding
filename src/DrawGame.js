export function redrawCanvas(model, canvasObj, appObj) {
    const ctx = canvasObj.getContext('2d');

    ctx.clearRect( 0,0, canvasObj.width, canvasObj.height);  

    let size = model.board.size
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        let square = model.board.grid[r][c]
        let x = c * 50
        let y = r * 50
        let w = 50
        let h = 50
        ctx.fillStyle = square.color
        ctx.fillRect(x, y, w, h)
      }
    }

    let image = document.getElementById('cat');
    ctx.drawImage(image, model.ns.column * 50, model.ns.row * 50, 100, 100);

    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.rect(0, 0, 50*size, 50*size)
    ctx.stroke();
}