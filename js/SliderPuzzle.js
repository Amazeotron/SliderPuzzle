var SliderPuzzle = function(config) {

  'use strict';
  
  this.config             = config;
  this.direction          = {
    LEFT: 'left',
    RIGHT: 'right',
    UP: 'up',
    DOWN: 'down'
  };
  this.tileSize           = {};
  this.shuffleTime        = 3000;
  this.gameBoard          = null; // div container where the canvas pieces will be rendered
  this.shuffleIntervalID  = null;
  this.solveIntervalID    = null;
  this.lastMovePosition   = -1; // holds the last moved position index (0-15)
  this.boardPieces        = [];
  this.moveHistory        = [];
  this.boardPositions     = [];
  this.startX             = 0;
  this.startY             = 0;
  this.offsetX            = 0;
  this.offsetY            = 0;
  this.distanceX          = 0;
  this.distanceY          = 0;
  this.draggedSquare      = null;
  this.winDiv             = config.container;
  this.gameBoard          = config.gameboard;
};


SliderPuzzle.prototype = {

  init: function() {
    var self = this;
    this.sourceImage = new Image();
    this.sourceImage.onload = function() {
      self.tileSize.width = self.sourceImage.width / 4;
      self.tileSize.height = self.sourceImage.height / 4;

      // once the image is loaded, draw the gameboard.
      self.drawGameboard();
    };
    this.sourceImage.src = this.config.imgURL;
    
    $('#solve-button').on('click', $.proxy(this.solve, this));
  
    $('#easy-button')
        .css({display:'block'})
        .on('click', function() {
      self.shuffleTime = 500;
      self.replay();
    });

    $('.loading').css({display: 'none'});
  }, 

  getEmptySquareIndex: function() {
    var i,
        len = this.boardPieces.length;
    for (i=0; i<len; i++) {
      if (this.boardPieces[i] === null) {
        return i;
      }
    }
    return i-1;
  },

  boardIsInWinningOrder: function() {
    for (var i=0; i<this.boardPieces.length; i++) {
      if (this.boardPieces[i] && this.boardPieces[i].isHome() === false) {
        return false;
      }
    }
    return true;
  },

  getValidMovePositions: function(emptyIndex, shouldRemoveLastMove) {
    // Choose a random piece out of the possible pieces that can move.
    // Eliminate illegal moves, i.e., if the empty square is on a side, emptyIndex+1 is not a valid move.
    var possibleMovePositions,
        moveLeft = {'move':this.direction.LEFT, 'index':emptyIndex+1},
        moveUp = {'move':this.direction.UP, 'index':emptyIndex+4},
        moveRight = {'move':this.direction.RIGHT, 'index':emptyIndex-1},
        moveDown = {'move':this.direction.DOWN, 'index':emptyIndex-4};
  
    switch (emptyIndex) {
      case 0:
        possibleMovePositions = [moveLeft, moveUp];
        break;
  
      case 1:
      case 2:
        possibleMovePositions = [moveRight, moveLeft, moveUp];
        break;
  
      case 3:
        possibleMovePositions = [moveRight, moveUp];
        break;
  
      case 4:
      case 8:
      case 12:
        possibleMovePositions = [moveLeft, moveDown, moveUp];
        break;
  
      case 5:
      case 6:
      case 9:
      case 10:
        possibleMovePositions = [moveRight, moveLeft, moveDown, moveUp];
        break;
  
      case 7:
      case 11:
        possibleMovePositions = [moveRight, moveDown, moveUp];
        break;
  
      case 13:
      case 14:
        possibleMovePositions = [moveRight, moveLeft, moveDown];
        break;
  
      case 15:
        possibleMovePositions = [moveRight, moveDown];
        break;
    }
    // remove the lastMovePosition index, if there is one.
    if (shouldRemoveLastMove) {
      for (var i=0; i<possibleMovePositions.length; i++) {
        if (this.lastMovePosition === possibleMovePositions[i].index) {
          possibleMovePositions.splice(i, 1);
        }
      }
    }
  
    return possibleMovePositions;
  },
  
  drawGameboard: function() {
    var xPos = 0, yPos=0, canvas, context, puzzlePiece;
  
    for (var i = 0; i < 15; i++) {
      xPos = this.tileSize.width * (i % 4);
      puzzlePiece = new PuzzlePiece(i, this.sourceImage, xPos, yPos, this.tileSize);
      this.gameBoard.append(puzzlePiece.getCanvas());
  
      if (i%4 === 3 && i >= 3) {
        yPos += this.tileSize.height;
      }

      this.boardPieces.push(puzzlePiece);
      this.boardPositions.push(puzzlePiece.getPosition());
    }
    // Add empty piece at end
    this.boardPieces.push(null);
    this.boardPositions.push({'left':this.tileSize.width*3, 'top':this.tileSize.height*3});
  },
  
  beginGameplay: function() {
    clearInterval(this.shuffleIntervalID);
    this.addInteraction();
  },
  
  replay: function() {
    this.closeOverlay();
    this.scramble();
  },
  
  scramble: function() {
    this.shuffleIntervalID = setInterval($.proxy(this.moveToEmptySquare, this), 50);
    setTimeout($.proxy(this.beginGameplay, this), this.shuffleTime);
  },
  
  solve: function() {
    this.removeInteraction();
    this.moveHistory.reverse();
    // loop through moveHistory, and move the squares to the position history
    var i = 0, self = this;
    this.solveIntervalID = setInterval(function() {
      if (i < self.moveHistory.length) {
        var boardPieceToMove = self.moveHistory[i].piece;
        var newPosition = self.boardPositions[self.moveHistory[i].move];
        var oldIndex = boardPieceToMove.getIndex();
        boardPieceToMove.setPosition(newPosition);
        boardPieceToMove.setIndex(self.moveHistory[i].move);

        self.boardPieces[self.moveHistory[i].move] = boardPieceToMove;
        self.boardPieces[oldIndex] = null;
        i++;
      } else {
        clearInterval(self.solveIntervalID);
        self.showOverlay(false);
        self.moveHistory = [];
      }
    }, 90);
  },
  
  addInteraction: function() {
    var i, piece;
    var validSquarePositions = this.getValidMovePositions(this.getEmptySquareIndex(), false);
    for (i=0; i<validSquarePositions.length; i++) {
      piece = this.boardPieces[parseInt(validSquarePositions[i].index, 10)];
      if (typeof piece !== 'undefined') { 
        piece.addInteraction(validSquarePositions[i]);
        $(piece.getCanvas()).on('mousedown', $.proxy(this.handleMouseDown, this));
      }
    }
  },
  
  removeInteraction: function() {
    var i, piece;
    for (i=0; i<this.boardPieces.length; i++) {
      piece = this.boardPieces[i];
      if (piece !== null) {
        piece.removeInteraction();
        $(piece.getCanvas()).off('mousedown');
      }
    }
  },
  
  moveToEmptySquare: function(square) {
    var emptyIndex = this.getEmptySquareIndex();
    var possibleMovePositions = this.getValidMovePositions(emptyIndex, true);
    this.lastMovePosition = emptyIndex;
    var actualMovePositions = [];
    var self = this;
  
    if (!square) {
      for (var i=0; i<this.boardPieces.length; i++) {
        if (this.boardPieces[i] !== null) {
          var boardPiece = $(this.boardPieces[i].getCanvas());
          // skip over the null square
          var boardPieceIndex = parseInt(boardPiece.attr('data-index'), 10);
          for (var k=0; k<possibleMovePositions.length; k++) {
            // There are always several pieces that can possibly move, so store them and choose one randomly as the next move
            if (boardPieceIndex === parseInt(possibleMovePositions[k].index, 10)) {
              actualMovePositions.push(boardPieceIndex);
            }
          }
        }
      }
    } else {
      actualMovePositions.push(square.attr('data-index'));
    }
  
    var randomMoveIndex = actualMovePositions[Math.floor(Math.random() * actualMovePositions.length)];
    var boardPieceToMove = this.boardPieces[randomMoveIndex];
    var newPosition = this.boardPositions[emptyIndex];
    
    // listen for transition end and check the gameboard
    $(boardPieceToMove.getCanvas()).on('webkitTransitionEnd transitionend', function(event) {
      $(boardPieceToMove.getCanvas()).off('webkitTransitionEnd transitionend');
      if (self.boardIsInWinningOrder()) {
        self.showOverlay(true);
      }
    });
    
    boardPieceToMove.setIndex(emptyIndex);
    boardPieceToMove.setPosition(newPosition);

    this.boardPieces[emptyIndex] = boardPieceToMove;
    this.boardPieces[randomMoveIndex] = null;

    this.moveHistory.push({'piece':boardPieceToMove, 'move':randomMoveIndex});
    
    // Reset interactions, since we just shuffled.
    if (square) {
      this.removeInteraction();
      this.addInteraction();
    }
  },
  
  showOverlay: function(wasManual) {
    this.winDiv.css({opacity: '1', display: 'block'});
  
    var title = $('#js-title'),
        details = $('#js-details');
    title.html(wasManual ? 'WIN!' : 'DONE');
    details.html(wasManual ? 'You solved the puzzle. Nice Job!' : 'You used the \'Solve\' button, so it doesn\'t count.');
  },
  
  closeOverlay: function(event) {
    if (typeof event !== 'undefined') { event.preventDefault(); }
    var self = this;
    this.winDiv.on('webkitTransitionEnd transitionend', function(event) {
      self.winDiv.css({display: 'none'});
    });
    this.winDiv.css({opacity: '0.0'});
  },
  
  handleMouseDown: function(event) {
    if (typeof event === 'undefined') {
      return;
    }
    event.preventDefault();
    this.draggedSquare = $(event.target);
    this.startX = event.pageX;
    this.startY = event.pageY;
    this.offsetX = parseInt(this.draggedSquare.css('left'), 10);
    this.offsetY = parseInt(this.draggedSquare.css('top'), 10);
    
    this.draggedSquare.addClass('square').removeClass('animatedSlow').removeClass('animatedFast');
    this.draggedSquare.on('mousemove', $.proxy(this.handleMouseMove, this));
    
    $(window).on('mouseup', $.proxy(this.handleMouseUp, this));
  },
  
  handleMouseMove: function(event) {
    if (typeof event === 'undefined') {
      return;
    }
    event.preventDefault();
    
    var dragDirection = this.draggedSquare.attr('drag');
    var newXPos = (this.offsetX + event.pageX - this.startX);
    var newYPos = (this.offsetY + event.pageY - this.startY);
    
    // Constrain dragging
    switch (dragDirection) {
      case this.direction.LEFT:
        if (this.startX > event.pageX && Math.abs(event.pageX - this.startX) <= this.tileSize.width) { this.draggedSquare.css({left: newXPos + 'px'}); }
        break;
  
      case this.direction.RIGHT:
        if (this.startX < event.pageX && Math.abs(event.pageX - this.startX) <= this.tileSize.width) { this.draggedSquare.css({left: newXPos + 'px'}); }
        break;
  
      case this.direction.UP:
        if (this.startY > event.pageY && Math.abs(event.pageY - this.startY) <= this.tileSize.height) { this.draggedSquare.css({top: newYPos + 'px'}); }
        break;
  
      case this.direction.DOWN:
        if (this.startY < event.pageY && Math.abs(event.pageY - this.startY) <= this.tileSize.height) { this.draggedSquare.css({top: newYPos + 'px'}); }
        break;
    }
  
    this.distanceX = event.pageX - this.startX;
    this.distanceY = event.pageY - this.startY;
  },
  
  handleMouseUp: function(event) {
    if (typeof event !== 'undefined') {
      event.preventDefault();
    }
    
    this.draggedSquare.off('mousemove');
    this.draggedSquare.off('mousedown');
    
    // Only move the tile to the new position if the drag is more than halfway
    if (Math.abs(this.distanceX) > this.tileSize.width/2 ||
        Math.abs(this.distanceY) > this.tileSize.height/2 ||
        this.distanceX === 0 || this.distanceY === 0) {
      this.moveToEmptySquare(this.draggedSquare);
    } else {
      this.draggedSquare
          .addClass('square animatedSlow')
          .css({top: this.offsetY, left: this.offsetX});
      this.removeInteraction();
      this.addInteraction();
    }

    $(window).off('mouseup');

    this.startX = 0;
    this.startY = 0;
    this.distanceX = 0;
    this.distanceY = 0;
  }

};

