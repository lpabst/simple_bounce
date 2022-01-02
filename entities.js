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

// I still have substantial bugs with the visuals and bouncing of these balls. I haven't quite figured out how real life bouncing works well enough to translate it into code :shrug:
function BallWithSquishVisuals(x, y, color, bouncinessPercentage, squishinessPercentage) {
  this.x = x;
  this.y = y;
  this.radius = 20;
  this.startX = x;
  this.startY = y;
  this.xVel = 2;
  this.yVel = 0;
  this.color = color;
  this.type = "ball";
  this.bouncinessPercentage = bouncinessPercentage;
  this.squishinessPercentage = squishinessPercentage;
  this.squishHeightRadius = this.radius * (1 - (this.squishinessPercentage / 2));
  this.squishWidthRadius = this.radius + (this.radius - this.squishHeightRadius); 
  this.showSquished = false;

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
      this.xVel = this.xVel * (-1) * this.bouncinessPercentage;
    }
    // ceiling
    if (newY < this.radius){
      newY = this.radius;
      this.yVel = this.yVel * (-1) * this.bouncinessPercentage;
    } 
    // right edge
    if (newX > data.canvas.w - this.radius) {
      newX = data.canvas.w - this.radius;
      this.xVel = this.xVel * (-1) * this.bouncinessPercentage;
    }
    // ground
    const heightRadiusToUse = this.yVel > 3 
      ? this.squishHeightRadius
      : this.radius
    if (newY > data.canvas.h - heightRadiusToUse) {
      newY = data.canvas.h - heightRadiusToUse;
      // squishiness determines how long it takes for the ball to squish on the ground then rebound upwards for now we can do that based on a timer and see how it goes
      if (!this.squishStartTime) {
        this.squishStartTime = Date.now();
        // a percentage of how fast the ball is going compared to terminal velocity
        this.impactPercentage = this.yVel / maxGravitySpeed;
        // squish duration can take up to 1000ms, depending on ball squishiness and impact speed
        this.squishDuration = 200 * this.squishinessPercentage * this.impactPercentage * passageOfTime
      } else {
        // determine what our rebound velocity should be after the squish / rebound
        this.reboundVelocity = this.reboundVelocity || this.yVel * (-1) * this.bouncinessPercentage;
        if (Math.abs(this.reboundVelocity) < gravityAcceleration * 3) {
          this.reboundVelocity = 0;
          this.yVel = 0;
        }
        // see if we've been squishing for the full squish duration. If so, spring upwards
        const now = Date.now();
        if (now - this.squishStartTime > this.squishDuration) {
          this.yVel = this.reboundVelocity
          this.squishStartTime = null;
          this.squishDuration = null;
          this.reboundVelocity = null;
          this.showSquished = false;
        } else {
          // if not, reduce yVel and keep squishing. yVel must be reduced as a function of squishiness
          this.yVel *= (1 - this.squishinessPercentage);
          this.showSquished = true;
          // while squishing into the ground, xVel is drastically reduced for a bit
          newX -= (this.xVel * 0.35);
        }
      }
      // introduce ground friction if we're on the ground
      if (groundFriction > Math.abs(this.xVel)) {
        this.xVel = 0;
      } else {
        if (this.xVel > 0) this.xVel -= groundFriction;
        else this.xVel += groundFriction;
      }
    }

    // update our location
    this.x = newX;
    this.y = newY;
  };

  // called by the game.render() method
  this.render = function (data) {
    if (this.showSquished) {
      // the amount to squish the ball visually depends on the yVel. as yVel nears zero, we'll reach our mas squished-ness visually
      const maxSquish = this.squishWidthRadius - this.radius;
      const currentSquish = (this.impactPercentage / this.yVel) * maxSquish * 2;

      // this squish to draw right now is based on our 'currentSquish' number
      const currentRadiusX = this.radius + currentSquish;
      const currentRadiusY = this.radius - currentSquish;
      data.canvas.drawOval(this.x, this.y, currentRadiusX, currentRadiusY, this.color, true);
    } else {
      // otherwise, draw a circle
      data.canvas.drawCircle(this.x, this.y, this.radius, this.color, true);
    }

    if (debugBoundaries) {
      data.canvas.drawRect(this.x, this.y, this.w, this.h, "blue");
    }
  };
}
