const game = {
    /*********** INITIALIZATION ******************/
  
    init: function (editorData = null) {
      console.log("game.init()");
      // hide buttons, inputs, etc
      document.getElementById("controls").classList.add("hidden");
  
      // create data object to be passed around
      const ballsInteract = document.getElementById(
        "ballsInteractToggle"
      ).checked;
      const data = {
        startTime: Date.now(),
        canvas: null,
        animationFrame: 0,
        balls: [],
        walls: [],
        eventListeners: [],
        keys: { down: {} },
        levelStartTime: null,
        ballsInteract,
        ballHeldByMouse: null,
        mousePos: {
          prevX: null,
          prevY: null,
          x: null,
          y: null
        },
      };
  
      game.initCanvas(data);
      game.initEntities(data);
      game.initEventListeners(data);
  
      game.run(data);
    },
  
    initCanvas: function (data) {
      console.log("game.initCanvas()");
      const canvas = new Canvas("canvas");
      canvas.clear();
      data.canvas = canvas;
    },
  
    initEventListeners: function (data) {
      console.log("game.initEventListeners()");
      // helper function creates the event listener and adds it to the data.eventListeners array so we can unbind it later
      function createEventListener(target, eventType, handler) {
        target.addEventListener(eventType, handler);
        data.eventListeners.push({
          target: target,
          eventType: eventType,
          handler: handler,
        });
      }
  
      createEventListener(window, "keydown", (e) => game.handleKeydown(e, data));
      createEventListener(window, "keyup", (e) => game.handleKeyup(e, data));
      window.data = data;
      createEventListener(data.canvas.canvas, "mousedown", (e) =>
        game.handleMouseDown(e, data)
      );
      createEventListener(data.canvas.canvas, "mousemove", (e) =>
        game.handleMouseMove(e, data)
      );
      createEventListener(data.canvas.canvas, "mouseup", (e) =>
        game.handleMouseUp(e, data)
      );
    },
  
    initEntities: async function(data) {
      console.log("game.initEntities()");
      // grab balls from user inputs
      const ballRows = document.getElementById('ballInputs').children;
      for (let i = 1; i < ballRows.length; i++){
        const startX = Number(document.getElementById(`ball${i}StartX`).value)
        const startY = Number(document.getElementById(`ball${i}StartY`).value)
        const color = document.getElementById(`ball${i}Color`).value
        const xVelocity = Number(document.getElementById(`ball${i}XVelocity`).value)
        const bounciness = Number(document.getElementById(`ball${i}Bounciness`).value)
        const ball = new Ball(startX, startY, color, xVelocity, bounciness)
        data.balls.push(ball)
      }
      console.log(data.balls)
    },
  
    /***************** END INITIALIZATION ******************/
  
    /***************** EVENT HANDLERS ******************/
  
    handleKeydown: function (e, data) {
      const keysInUse = [27, 32, 37, 40, 66, 83];
      // get key code and prevent default action for that key
      const key = e.which || e.keyCode || 0;
      keysInUse.forEach((k) => {
        if (key === k) {
          e.preventDefault();
        }
      });
  
      // esc key pauses game
      if (key === 27) {
        game.pauseGame(data);
      }
  
      // keep track of which keys are down
      data.keys.down[key] = true;
    },
  
    handleKeyup: function (e, data) {
      const key = e.which || e.keyCode || 0;
      data.keys.down[key] = false;
    },

    handleMouseDown: function(e, data) {
        data.balls.forEach(ball => {
          // check for horizontal clicking on a ball
          if (ball.x - ball.radius * 0.9 < e.offsetX && ball.x + ball.radius * 0.9 > e.offsetX) {
            // check for vertical clicking on a ball
            if (ball.y - ball.radius * 0.9 < e.offsetY && ball.y + ball.radius * 0.9 > e.offsetY) {
              data.ballHeldByMouse = ball;
            }
          }
        })
    },

    handleMouseMove: function(e, data) {
      // track mouse velocity for when we release
      data.mousePos.prevX = data.mousePos.x;
      data.mousePos.prevY = data.mousePos.y;
      data.mousePos.x = e.offsetX;
      data.mousePos.y = e.offsetY;

      // if mouse is not holding a ball, do nothing else
      if (!data.ballHeldByMouse) return;

      // otherwise, move the ball to wherever the mouse moves it
      data.ballHeldByMouse.x = e.offsetX;
      data.ballHeldByMouse.y = e.offsetY;
    },

    handleMouseUp: function(e, data) {
      if (!data.ballHeldByMouse) return;
      
      // calculate the ball's new x and y velocity based on the mouse velocity
      const xVel = data.mousePos.x - data.mousePos.prevX;
      const yVel = data.mousePos.y - data.mousePos.prevY;
      data.ballHeldByMouse.xVel = xVel;
      data.ballHeldByMouse.yVel = yVel;

      // release the ball
      data.ballHeldByMouse = null;
    },
  
    /***************** END EVENT HANDLERS ******************/
  
    /***************** GAME LOOP ******************/
  
    run: function (data) {
      console.log("game.run()");
      function loop() {
        game.update(data);
        game.render(data);
        data.animationFrame++;
        setTimeout(() => {
          window.requestAnimationFrame(loop);
        }, passageOfTime)
      }
  
      loop();
    },
  
    update: function (data) {  
      // tell entities that move to move themselves
      data.balls.forEach(ball => ball.update(data));
    },
  
    render: function (data) {
      data.canvas.clear();
      data.balls.forEach(ball => ball.render(data));
    },
  
    /***************** END GAME LOOP ******************/
  
    /***************** OTHER METHODS ******************/
  
    // unbinds all of the event listeners saved in the data.eventListeners list
    removeEventListeners: function (data) {
      data.eventListeners.forEach(function (eventListener) {
        eventListener.target.removeEventListener(
          eventListener.eventType,
          eventListener.handler
        );
      });
      data.eventListeners = [];
    },
  };
  