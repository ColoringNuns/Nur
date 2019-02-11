class Enemy {
  constructor(sprite) {
    this.sp = sprite;
  }

  update(x,y,mirror,label) {
    this.sp.position.x = x;
    this.sp.position.y = y;
    this.sp.mirrorX(mirror);
    this.sp.changeAnimation(label);
  }
}
