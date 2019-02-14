class Player {
  constructor(sprite, height, map, attSpr, bar) {
    this.sp = sprite;
    this.jumpCounter = 0;
    this.attDelay = 0;
    this.attCool = 0;
    this.hasAttacked = false;
    this.height = height;
    this.currAnime = sprite.getAnimationLabel();
    this.sprintAdd = 2;
    this.map = map;
    this.attSpr = attSpr;
    this.lives = 4;
    this.mult = 1;
    this.hb = bar;
    this.dead = false;
    this.xspd = 0;
  }

  fell() {
    this.lives--;
    this.mult = 1;
    if (this.lives <= 0) {
      this.lives = 0;
      this.dead = true;
    }
    this.hb.set(this.lives / 4);
  }

  jump() {
    if (this.onGround() || this.jumpCounter < 2) {
      this.sp.velocity.y = -4;
      this.jumpCounter++;
    }
  }

  onGround() {
    const map = this.map.toArray();
    for (let i = 0; i < map.length; i++) {
      if (this.sp.position.y + 16 >= map[i].position.y && this.sp.position.y + 8 < map[i].position.y) {
        if (this.sp.position.x + 9 > map[i].position.x && this.sp.position.x - 9 < map[i].position.x) {
          return true;
        }
      }
    }
    return false;
  }

  draw() {
    if (this.sp.position.y - 20 > this.height) {
      this.fell();
      if (this.lives > 0) {
        this.sp.position.y = this.height / 2 - 200;
        this.sp.position.x = 50;
        this.xspd = 0;
        this.sp.velocity.y = 0;
      }
    }

    this.getAttack();
    if (this.attDelay == 0) {
      this.attSpr.changeAnimation('blank');
      if (this.currAnime != 'jump') {
        this.sp.changeAnimation(this.currAnime);
      }
    };

    const movement = this.getMovement();
    this.sp.position.x += movement + this.xspd;
    this.xspd *= 0.95;

    this.sp.velocity.y += 0.2;
    this.sp.collide(this.map, (spr1, spr2) => {
      const onGround = this.onGround();

      if (this.sp.velocity.y > 0 && onGround) {
        this.sp.velocity.y = 0;
        this.xspd = 0;
        this.jumpCounter = 0;
      }
    });

    this.attDelay = Math.max(0,this.attDelay - 1);
    this.attCool = Math.max(0,this.attCool - 1);

    this.attSpr.position.y = this.sp.position.y;
    this.attSpr.position.x = this.sp.position.x + (8 * this.sp.mirrorX());
    this.attSpr.mirrorX(this.sp.mirrorX());

    drawSprite(this.sp);
    drawSprite(this.attSpr);
  }

  getMovement() {
    let finalMovement = 0;
    if (keyIsDown(65)) {
      this.currAnime = 'run';
      this.sp.mirrorX(-1);
      finalMovement = -2;
    }
    if (keyIsDown(68)) {
      this.currAnime = 'run';
      this.sp.mirrorX(1);
      finalMovement = 2;
    }
    if ((keyIsDown(65) && keyIsDown(68)) || (!keyIsDown(65) && !keyIsDown(68))) {
      this.currAnime = 'idle';
      finalMovement = 0;
    }
    if (keyIsDown(16) || keyIsDown(72)) {
      finalMovement *= 1 + this.sprintAdd;
      this.sprintAdd *= 7;
      this.sprintAdd /= 8;
    } else {
      this.sprintAdd = 2;
    }
    if (!this.onGround()) {
      if (this.jumpCounter == 1) {
        this.currAnime = 'jump';
        if (this.attDelay == 0) {
          this.sp.changeAnimation('jump');
          this.sp.animation.stop();
          if (this.sp.velocity.y < 0) {
            this.sp.animation.changeFrame(1);
          } else if (this.sp.velocity.y < 1) {
            this.sp.animation.changeFrame(0);
          } else {
            this.sp.animation.changeFrame(2);
          }
        }
      } else {
        this.currAnime = 'somer';
      }
    }
    if (keyIsDown(83)) {
      this.sp.velocity.y += 0.2;
    }
    return finalMovement;
  }

  getAttack() {
    const att1 = keyIsDown(74);
    if (!att1) {
      this.hasAttacked = false;
    }
    if (att1 && this.attDelay == 0 && !this.hasAttacked && this.attCool == 0) {
      this.sp.changeAnimation('kick');
      this.attSpr.changeAnimation('attack');
      this.attSpr.animation.frameDelay = 3;
      this.attSpr.animation.changeFrame(0);
      this.attSpr.animation.looping = false;
      this.sp.animation.changeFrame(0);
      this.hasAttacked = true;
      this.attDelay = 10;
      this.attCool = 40;
    }
  }
}
