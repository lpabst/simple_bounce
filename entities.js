var debugBoundaries = false;

// check if entities are touching in any way
function isCollision(entity1, entity2) {
  window.entity1 = entity1;
  window.entity2 = entity2;
  var entity1Left = entity1.x;
  var entity1Right = entity1.x + entity1.w;
  var entity1Top = entity1.y;
  var entity1Bottom = entity1.y + entity1.h;
  var entity2Left = entity2.x;
  var entity2Right = entity2.x + entity2.w;
  var entity2Top = entity2.y;
  var entity2Bottom = entity2.y + entity2.h;

  var sameVerticalSpace =
    (entity1Left < entity2Right && entity1Right > entity2Left) ||
    (entity2Left < entity1Right && entity2Right > entity1Left);
  var sameHorizontalSpace =
    (entity1Top < entity2Bottom && entity1Bottom > entity2Top) ||
    (entity2Top < entity1Bottom && entity2Bottom > entity1Top);

  if (sameVerticalSpace && sameHorizontalSpace) return true;
  else return false;
}

function Ball(x, y, color, xVel, bouncinessPercentage) {
  this.id = randomString(16);
  this.x = x;
  this.y = y;
  this.radius = 20;
  this.startX = x;
  this.startY = y;
  this.xVel = xVel;
  this.yVel = 0;
  this.color = color;
  this.type = "ball";
  this.bouncinessPercentage = bouncinessPercentage;

  // called by the game.update method
  this.update = function (data) {
    var newX = this.x;
    var newY = this.y;

    // gravity accelerates us up to a max speed
    if (this.yVel < maxGravitySpeed) {
      this.yVel += gravityAcceleration;
    }
    
    // air friction always reduces xVel towards zero
    if (airFriction > Math.abs(this.xVel)) {
      this.xVel = 0;
    } else {
      if (this.xVel > 0) this.xVel -= airFriction;
      else this.xVel += airFriction;
    }
    
    // xVel affects lateral movement
    newY += this.yVel;
    newX += this.xVel;

    // map edges are boundaries
    // left edge
    if (newX < this.radius) {
      newX = this.radius;
      this.xVel *= (-1 * this.bouncinessPercentage);
    }
    // ceiling
    if (newY < this.radius){
      newY = this.radius;
      this.yVel = this.yVel * (-1) * this.bouncinessPercentage;
    } 
    // right edge
    if (newX > data.canvas.w - this.radius) {
      newX = data.canvas.w - this.radius;
      this.xVel *= (-1 * this.bouncinessPercentage);
    }
    // ground
    if (newY > data.canvas.h - this.radius) {
      newY = data.canvas.h - this.radius;
      this.yVel *= (-1 * this.bouncinessPercentage);
      // introduce ground friction if we're on the ground
      if (groundFriction > Math.abs(this.xVel)) {
        this.xVel = 0;
      } else {
        if (this.xVel > 0) this.xVel -= groundFriction;
        else this.xVel += groundFriction;
      }
    }

    // see if we collided with any other balls
    data.balls.forEach(ball => {
      if (ball.id === this.id) return;
      const collided = isCollision(this, ball);
    })

    // update our location
    this.x = newX;
    this.y = newY;
  };

  // called by the game.render() method
  this.render = function (data) {
    data.canvas.drawCircle(this.x, this.y, this.radius, this.color, true);

    if (debugBoundaries) {
      data.canvas.drawRect(this.x, this.y, this.w, this.h, "blue");
    }
  };
}
