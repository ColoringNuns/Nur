class Prompt {
    constructor(label) {
        this.label = label;
        this.text = '';
        this.allow = false;
        this.entered = false;
    }

    handleKey(key) {
        if (key == 8) this.text = this.text.substring(0, this.text.length - 1);
        else if (key != 13) {
            if (!this.entered) {
                const lett = String.fromCharCode(key).toLowerCase();
                this.text += (letters.indexOf(lett) != -1 || numbers.indexOf(lett) != -1 ? lett : '');
            }
        }
    }

    checkChosen() {
        if (!keyIsDown(13)) {
            this.allow = true;
        }
        if (keyIsDown(13) && this.allow && !this.entered) {
            this.allow = false;
            this.entered = true;
            return this.text;
        }
        return false;
    }

    draw() {
        background('#20263e');
        fill('#fff');
        textSize(20);
        textAlign(RIGHT, BOTTOM);
        text(this.text, width - 20, height - 10);

        textSize(30);
        textAlign(LEFT, BOTTOM);
        text(this.label, 20, height - 10);
    }
}
