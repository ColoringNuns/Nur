class Menu {
  constructor(type, label, options) {
    this.type = type;
    this.label = label;
    this.options = options;
    this.current = 0;
    this.allow = false;
    this.entered = false;
    this.text = "";
  }

  handleKey(key) {
    switch(this.type) {
      case "SELECT":
        if (key == 87) this.current = (this.current + 1) % this.options.length;
        if (key == 83) this.current = (this.current - 1 < 0 ? this.options.length - 1 : this.current - 1);
        break;
      case "PROMPT":
        if (key == 8) this.text = this.text.substring(0, this.text.length - 1);
        else if (key != 13) {
          if (!this.entered) {
            const lett = String.fromCharCode(key).toLowerCase();
            this.text += (letters.indexOf(lett) != -1 || numbers.indexOf(lett) != -1 ? lett : '');
          }
        }
        break;
      default:
        break;
    }
  }

  checkChosen() {
    switch(this.type) {
      case "SELECT":
        if (!keyIsDown(13)) {
          this.allow = true;
        }
        if (keyIsDown(13) && this.allow) {
          this.allow = false;
          return (this.options[this.current].toLowerCase());
        }
        return false;
        break;
      case "PROMPT":
        if (!keyIsDown(13)) {
          this.allow = true;
        }
        if (keyIsDown(13) && this.allow && !this.entered) {
          this.allow = false;
          this.entered = true;
          return this.text;
        }
        return false;

      default:
        return false;
    }
  }

  reset(type, label, options) {
    this.type = type;
    this.label = label;
    this.options = options;
    this.current = 0;
    this.allow = false;
    this.text = "";
  }

  draw() {
    background('#20263e');
    fill('#fff');
    textSize(30);
    textAlign(LEFT, BOTTOM);
    text(this.label, 20, height - 10);
    if (this.type == "PROMPT") {
      textSize(20);
      textAlign(RIGHT, BOTTOM);
      text(this.text, width - 20, height - 10);
    } else if (this.type == "SELECT") {
      textSize(20);
      textAlign(RIGHT, BOTTOM);
      for (let i = 0; i < this.options.length; i++) {
        text((this.options[this.current] == this.options[i] ? '> ' : '') + this.options[i], width - 20, height - 10 - (30 * i));
      }
    }
  }
}
