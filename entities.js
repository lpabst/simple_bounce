var debugBoundaries = false;

// check if entities are touching in any way
function isBallCollision(ball1, ball2) {
  window.ball1 = ball1;
  window.ball2 = ball2;
  var ball1Left = ball1.x - ball1.radius * 0.9;
  var ball1Right = ball1.x + ball1.radius * 0.9;
  var ball1Top = ball1.y - ball1.radius * 0.9;
  var ball1Bottom = ball1.y + ball1.radius * 0.9;
  var ball2Left = ball2.x - ball2.radius * 0.9;
  var ball2Right = ball2.x + ball2.radius * 0.9;
  var ball2Top = ball2.y - ball2.radius * 0.9;
  var ball2Bottom = ball2.y + ball2.radius * 0.9;

  var sameVerticalSpace =
    (ball1Left < ball2Right && ball1Right > ball2Left) ||
    (ball2Left < ball1Right && ball2Right > ball1Left);
  var sameHorizontalSpace =
    (ball1Top < ball2Bottom && ball1Bottom > ball2Top) ||
    (ball2Top < ball1Bottom && ball2Bottom > ball1Top);

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
  this.currentCollisions = {};

  // called by the game.update method
  this.update = function (data) {
    // if the mouse is holding this ball, it should do nothing
    if (data.ballHeldByMouse && data.ballHeldByMouse.id === this.id) {
      this.yVel = 0;
      this.xVel = 0;
      this.currentCollisions = {};
      return;
    }

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
      this.xVel *= -1 * this.bouncinessPercentage;
    }
    // ceiling
    if (newY < this.radius) {
      newY = this.radius;
      this.yVel = this.yVel * -1 * this.bouncinessPercentage;
    }
    // right edge
    if (newX > data.canvas.w - this.radius) {
      newX = data.canvas.w - this.radius;
      this.xVel *= -1 * this.bouncinessPercentage;
    }
    // ground
    if (newY > data.canvas.h - this.radius) {
      newY = data.canvas.h - this.radius;
      this.yVel *= -1 * this.bouncinessPercentage;
      // introduce ground friction if we're on the ground
      if (groundFriction > Math.abs(this.xVel)) {
        this.xVel = 0;
      } else {
        if (this.xVel > 0) this.xVel -= groundFriction;
        else this.xVel += groundFriction;
      }
    }

    if (data.ballsInteract) {
      // see if we collided with any other balls
      data.balls.forEach((ball) => {
        // don't interact with self
        if (ball.id === this.id) return;
        // if either ball is being held by the mouse, don't interact
        if (
          data.ballHeldByMouse &&
          (data.ballHeldByMouse.id === this.id ||
            data.ballHeldByMouse.id === ball.id)
        ) {
          return;
        }
        const collided = isBallCollision(this, ball);
        if (collided) {
          // if 2 balls are on top of each other, they should "roll" off of each other
          if (this.y !== ball.y) {
            if (this.x > ball.x) {
              this.xVel += gravityAcceleration;
              ball.xVel -= gravityAcceleration;
            }
            if (this.x <= ball.x) {
              this.xVel -= gravityAcceleration;
              ball.xVel += gravityAcceleration;
            }
          }

          // if we already reacted to this collision, do not exchange energy (track collision for each ball)
          if (
            this.currentCollisions[ball.id] ||
            ball.currentCollisions[this.id]
          )
            return;
          this.currentCollisions[ball.id] = true;
          ball.currentCollisions[this.id] = true;

          // the higher bounciness of the 2 balls will determine how much force exits the collision
          const higherBounciness =
            this.bouncinessPercentage > ball.bouncinessPercentage
              ? this.bouncinessPercentage
              : ball.bouncinessPercentage;

          // equal and opposite reactions (multiplied by bouncinessPercentage)
          const tempY = this.yVel;
          this.yVel = ball.yVel * higherBounciness;
          ball.yVel = tempY * higherBounciness;
          const tempX = this.xVel;
          this.xVel = ball.xVel * higherBounciness;
          ball.xVel = tempX * higherBounciness;
        } else {
          delete this.currentCollisions[ball.id];
          delete ball.currentCollisions[this.id];
        }
      });
    }

    // update our location
    this.x = newX;
    this.y = newY;
  };

  // called by the game.render() method
  this.render = function (data) {
    data.canvas.drawCircle(this.x, this.y, this.radius, this.color, true);

    if (debugBoundaries) {
      data.canvas.drawRect(
        this.x - this.radius,
        this.y - this.radius,
        this.radius * 2,
        this.radius * 2,
        "blue"
      );
    }
  };
}
