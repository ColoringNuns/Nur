class Select {
  constructor(label,options) {
    this.label = label;
    this.options = options;
    this.current = 0;
    this.allow = false;
  }

  reset(label,options) {
    this.label = label;
    this.options = options;
    this.current = 0;
  }

  handleKey(key) {
    if (key == 87) this.current = (this.current + 1) % this.options.length;
    if (key == 83) this.current = (this.current - 1 < 0 ? this.options.length - 1 : this.current - 1);
  }

  checkChosen() {
    if (!keyIsDown(13)) {
      this.allow = true;
    }
    if (keyIsDown(13) && this.allow) {
      this.allow = false;
      return (this.options[this.current].toLowerCase());
    }
    return false;
  }

  draw() {
    background('#20263e');
    fill('#fff');
    textSize(20);
    textAlign(RIGHT, BOTTOM);
    for (let i = 0; i < this.options.length; i++) {
      text((this.options[this.current] == this.options[i] ? '> ' : '') + this.options[i], width - 20, height - 10 - (30 * i));
    }

    textSize(30);
    textAlign(LEFT, BOTTOM);
    text(this.label, 20, height - 10);
  }
}
