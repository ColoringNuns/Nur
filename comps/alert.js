class Alert {
  constructor(label) {
    this.label = label;
  }

  initialize(width, height) {
    this.width = width;
    this.height = height;
  }

  handleKey(key) {}

  checkChosen() {
    return false;
  }

  draw() {
    background('#20263e');
    fill('#fff');
    textSize(30);
    textAlign(LEFT, BOTTOM);
    text(this.label, 20, this.height - 10);
  }
}
