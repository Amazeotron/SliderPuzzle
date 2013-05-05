function PuzzlePiece(index, sourceImage, left, top, tileSize) {

  'use strict';
  
  this.canvas = document.createElement('canvas');
  this.canvas.setAttribute('width', tileSize.width+'px');
  this.canvas.setAttribute('height', tileSize.height+'px');
  this.canvas.setAttribute('id', 'square'+index);
  this.canvas.setAttribute('class', 'square animatedFast');
  this.canvas.setAttribute('data-homeindex', index);
  this.canvas.setAttribute('data-index', index);
  this.canvas.setAttribute('style', 'left: '+ left + 'px; top: ' + top + 'px');

  this.context = this.canvas.getContext('2d');
  this.context.drawImage(sourceImage, left, top, tileSize.width, tileSize.height, 0, 0, tileSize.width, tileSize.height);
  this.context.strokeStyle = '#ffffff';
  this.context.strokeRect(0.5,0.5,tileSize.width,tileSize.height);
  this.context.font = 'bold 16px sans-serif';
  this.context.textAlign = 'left';
  this.context.textbaseline = 'bottom';
  this.context.fillStyle = '#ffffff';

  this.position = {left: left, top: top};
}


PuzzlePiece.prototype = {
  
  drawIndex: function(index) {
    this.context.fillText((index+1).toString(), 2, 15);
  }, 
  
  getCanvas: function() {
    return this.canvas;
  },
  
  setIndex: function(index) {
    this.canvas.setAttribute('data-index', index);
  },
  
  getIndex: function() {
    return this.canvas.getAttribute('data-index');
  },
  
  setPosition: function(pos) {
    this.position = pos;
    this.canvas.style = null;
    this.canvas.style.left = this.position.left + 'px';
    this.canvas.style.top = this.position.top + 'px';
  },
  
  getPosition: function() {
    return this.position;
  },

  addInteraction: function(position) {
    this.canvas.setAttribute('class', 'square animatedSlow');
    switch(position.move) {
      case 'up':
        this.canvas.style.cursor = 'n-resize';
        break;

      case 'down':
        this.canvas.style.cursor = 's-resize';
        break;

      case 'left':
        this.canvas.style.cursor = 'w-resize';
        break;

      case 'right':
        this.canvas.style.cursor = 'e-resize';
        break;
    }
    this.canvas.setAttribute('drag', position.move);
  },
  
  removeInteraction: function() {
    this.canvas.setAttribute('class', 'square animatedFast');
    this.canvas.style.cursor = 'default';
    this.canvas.removeAttribute('drag');
  },
  
  isHome: function() {
    return parseInt(this.canvas.getAttribute('data-index'), 10) === parseInt(this.canvas.getAttribute('data-homeindex'), 10);
  }
};