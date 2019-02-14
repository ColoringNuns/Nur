class Enemy {
  constructor(sprite,attSpr,bar) {
    this.sp = sprite;
    this.attSpr = attSpr;
    this.blanked = true;
    this.canAtt = true;
    this.bar = bar;
  }

  update(x,y,mirror,label,frame,attX,attAnm,lives) {
    if (lives > 0) {
      this.sp.position.x = x;
      this.attSpr.position.x = attX;
      (attX < x ? this.attSpr.mirrorX(-1) : this.attSpr.mirrorX(1));
      this.sp.position.y = y;
      this.attSpr.position.y = y;
      this.sp.mirrorX(mirror);
      if (label != this.sp.getAnimationLabel()) {
        this.sp.changeAnimation(animations[label]);
        this.sp.animation.stop();
      }
      this.sp.animation.changeFrame(frame);

      if (attAnm && this.attSpr.animation.getFrame() < 4) {
        if (this.blanked) {
          this.attSpr.changeAnimation('attack');
          this.attSpr.animation.changeFrame(0);
          this.attSpr.animation.looping = false;
          this.attSpr.animation.frameDelay = 3;
          this.blanked = false;
        }
      } else {
        this.attSpr.changeAnimation('blank');
        this.attSpr.animation.changeFrame(0);
        this.blanked = true;
        this.canAtt = true;
      }

      this.bar.set(lives / 4);
    } else {
      this.sp.changeAnimation('blank');
      this.attSpr.changeAnimation('blank');
      this.bar.set(0);
    }
  }
}
