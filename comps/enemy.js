class Enemy {
  constructor(sprite,attSpr) {
    this.sp = sprite;
    this.attSpr = attSpr;
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
    (attAnm ? this.attSpr.changeAnimation('attack') : this.attSpr.changeAnimation('blank'));
  }
}
