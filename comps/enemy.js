class Enemy {
  constructor(sprite,attSpr) {
    this.sp = sprite;
    this.attSpr = attSpr;
    this.blanked = true;
  }

  update(x,y,mirror,label,frame,attX,attAnm) {
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

    if (attAnm && this.attSpr.animation.getFrame() != 4) {
      this.attSpr.changeAnimation('attack');
      if (this.blanked) {
        this.attSpr.animation.changeFrame(0);
        this.blanked = !this.blanked;
      }
      this.attSpr.animation.looping = false;
      this.attSpr.animation.frameDelay = 3;
    } else {
      this.attSpr.changeAnimation('blank');
      this.blanked = true;
    }
  }
}
