class Enemy {
  constructor(sprite) {
    this.sp = sprite;
  }

  update(x,y,mirror,label,frame) {
    this.sp.position.x = x;
    this.sp.position.y = y;
    this.sp.mirrorX(mirror);
    if (label != this.sp.getAnimationLabel()) {
      this.sp.changeAnimation(animations[label]);
      this.sp.animation.stop();
    }
    this.sp.animation.changeFrame(frame);
  }
}
