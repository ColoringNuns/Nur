class Prompt {
  constructor(label) {
    this.label = label;
    this.text = '';
    this.allow = false;
  }

  initialize(width, height) {
    this.width = width;
    this.height = height;
  }

  handleKey(key) {
    if (key == 8) this.text = this.text.substring(0, this.text.length - 1);
    else if (key != 13) this.text += String.fromCharCode(key).toLowerCase();
  }

  checkChosen() {
    if (!keyIsDown(13)) {
      this.allow = true;
    }
    if (keyIsDown(13) && this.allow) {
      this.allow = false;
      return this.text;
    }
    return false;
  }

  draw() {
    background('#20263e');
    fill('#fff');
    textSize(20);
    textAlign(RIGHT, BOTTOM);
    text(this.text, this.width - 20, this.height - 10);

    textSize(30);
    textAlign(LEFT, BOTTOM);
    text(this.label, 20, this.height - 10);
  }
}
