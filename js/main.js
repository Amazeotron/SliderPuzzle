'use strict';

$(document).ready(function() {
  
  var puzzle = new SliderPuzzle({
    container: $('#js-game-container'),
    gameboard: $('#gameboard'),
    imgURL: 'img/beach-small.jpg'
  });
  puzzle.init();
  
});