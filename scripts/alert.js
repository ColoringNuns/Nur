class Alert {
    constructor(label) {
        this.label = label;
    }

    handleKey() {}

    checkChosen() { return false; }

    draw() {
        background('#20263e');
        fill('#fff');
        textSize(30);
        textAlign(LEFT, BOTTOM);
        text(this.label, 20, height - 10);
    }
}
