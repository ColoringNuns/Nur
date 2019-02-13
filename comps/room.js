class Room {
  constructor() {
    this.run = loadSpriteSheet('assets/doux/run.png', 24, 24, 72);
    this.idle = loadSpriteSheet('assets/doux/idle.png', 24, 24, 72);
    this.somer = loadSpriteSheet('assets/doux/somer.png', 24, 24, 72);
    this.jump = loadSpriteSheet('assets/doux/jump.png', 24, 24, 72);
    this.kick = loadSpriteSheet('assets/doux/kick.png', 24, 24, 72);
    this.attack = loadSpriteSheet('assets/doux/attack.png', 24, 20, 72);
    this.blank = loadSpriteSheet('assets/doux/blank.png', 24, 20, 72);

    loadAnimation(this.run);
    loadAnimation(this.idle);
    loadAnimation(this.somer);
    loadAnimation(this.jump);
    loadAnimation(this.kick);
    loadAnimation(this.attack);
    loadAnimation(this.blank);

    this.background = [];
    for (let i = 1; i < 26; i++) {
      this['tilef' + letters[i - 1]] = loadImage('assets/tiles/forest/tile' + i + '.jpg');
    }
    for (let i = 1; i < 26; i++) {
      this['tilem' + letters[i - 1]] = loadImage('assets/tiles/metal/tile' + i + '.jpg');
    }
  }

  parseMap(text) {
    let vt = text.split('\n');
    vt.splice(-1);

    for (let i = 0; i < vt.length; i++) {
      vt[i] = vt[i].split(',');
    }

    return vt;
  }

  getReverse(img) {
    const rev = createImage(img.width, img.height);
    for (let i = 0; i < img.width; i++) {
      for (let j = 0; j < img.height; j++) {
        rev.set(img.width - i - 1, j, img.get(i,j));
      }
    }
    rev.updatePixels();
    return rev;
  }

  generate(fore,back,type) {
    const mapBT = this.parseMap(back);
    this.background = [];

    for (let i = 0; i < 60; i++) {
      for (let j = 0; j < 35; j++) {
        if (mapBT[j][i] != "-") {
          if (mapBT[j][i] == mapBT[j][i].toUpperCase()) {
            this.background.push([this.getReverse(this['tile' + type[0] + mapBT[j][i].toLowerCase()]), i*8, j*8]);
          } else {
            this.background.push([this['tile' + type[0] + mapBT[j][i]], i*8, j*8]);
          }
        }
      }
    }

    const mapFT = this.parseMap(fore);
    const mapF = new Group();

    for (let i = 0; i < 60; i++) {
      for (let j = 0; j < 35; j++) {
        if (mapFT[j][i] != "-") {
          let tile = createSprite(i*8 + 4, j*8 + 4, 8, 8);
          tile.depth = 0;
          if (mapFT[j][i] == mapFT[j][i].toUpperCase()) {
            tile.addImage('tile',this['tile' + type[0] + mapFT[j][i].toLowerCase()]);
            tile.mirrorX(-1);
          } else {
            tile.addImage('tile',this['tile' + type[0] + mapFT[j][i]]);
          }

          mapF.add(tile);
        }
      }
    }

    this.player = createSprite(50, height / 2 - 200);
    this.player.addAnimation('idle', this.idle);
    this.player.addAnimation('run', this.run);
    this.player.addAnimation('somer', this.somer);
    this.player.addAnimation('jump', this.jump);
    this.player.addAnimation('kick', this.kick);
    delete this.run;
    delete this.idle;
    delete this.somer;
    delete this.jump;
    delete this.kick;
    this.player.changeAnimation('idle');
    this.player.animation.frameDelay = 12;
    this.player.setCollider('rectangle', 0, 0, 15, 16);
    this.player.depth = 1;

    const attSpr = createSprite();
    attSpr.addAnimation('attack', this.attack);
    attSpr.addAnimation('blank', this.blank);
    attSpr.setCollider('rectangle', 0, 0, 20, 20);
    attSpr.depth = 2;
    delete this.attack;
    delete this.blank;

    const bar0 = new ProgressBar.Line('#plr0bar', {
      strokeWidth: 5,
      easing: 'easeInOut',
      color: '#' + colors[0],
      trailColor: '#565656',
      trailWidth: 5,
      svgStyle: { width: '100%', height: '100%'},
    });
    bar0.set(1);
    const bar1 = new ProgressBar.Line('#plr1bar', {
      strokeWidth: 5,
      easing: 'easeInOut',
      color: '#' + colors[1],
      trailColor: '#565656',
      trailWidth: 5,
      svgStyle: { width: '100%', height: '100%'},
    });
    bar1.set(1);
    const bar2 = new ProgressBar.Line('#plr2bar', {
      strokeWidth: 5,
      easing: 'easeInOut',
      color: '#' + colors[2],
      trailColor: '#565656',
      trailWidth: 5,
      svgStyle: { width: '100%', height: '100%'},
    });
    bar2.set(1);
    const bar3 = new ProgressBar.Line('#plr3bar', {
      strokeWidth: 5,
      easing: 'easeInOut',
      color: '#' + colors[3],
      trailColor: '#565656',
      trailWidth: 5,
      svgStyle: { width: '100%', height: '100%'},
    });
    bar3.set(1);

    this.player = new Player(this.player,height,mapF, attSpr, bar0);

    noSmooth();

    this.ready = true;
  }

  initialize(height, type, conn, isHost, len) {
    this.ready = false;
    this.conn = conn;
    this.isHost = isHost;
    this.len = len;

    this.enemies = [];
    for (let i = 0; i < len; i++) {
      this.enemies.push(this.createEnemy());

      if (isHost) {
        this.conn.nodes[i].on('data', (data) => {
          if (data.enemy !== null) {
            this.enemies[i].update(...data.enemy);
            for (let j = 0; j < len; j++) {
              if (i != j) {
                this.conn.nodes[j].send({enemy:[data.enemy,i]});
              }
            }
          }
        });
      }
    }
    if (!isHost) {
      this.hostSpr = this.createEnemy();

      this.conn.host.on('data', (data) => {
        if (data.enemy !== null) {
          if (data.enemy[1] != -1) {
            this.enemies[data.enemy[1]].update(...data.enemy[0]);
          } else {
            this.hostSpr.update(...data.enemy[0]);
          }
        }
      });
    }

    fetch('maps/'+ type +'/fore.txt')
      .then(response => response.text())
      .then(fore => fetch('maps/'+ type +'/back.txt')
        .then(response => response.text())
        .then(back => this.generate(fore,back,type)))
  }

  createEnemy() {
    const enem = createSprite();
    enem.addAnimation('idle', this.idle);
    enem.addAnimation('run', this.run);
    enem.addAnimation('somer', this.somer);
    enem.addAnimation('jump', this.jump);
    enem.addAnimation('kick', this.kick);
    enem.addAnimation('blank', this.blank);
    enem.changeAnimation('blank');
    enem.animation.frameDelay = 12;
    enem.setCollider('rectangle', 0, 0, 15, 16);
    enem.depth = 1;

    const attSpr = createSprite();
    attSpr.addAnimation('attack', this.attack);
    attSpr.addAnimation('blank', this.blank);
    attSpr.changeAnimation('blank');
    attSpr.setCollider('rectangle', 0, 0, 20, 20);
    attSpr.depth = 2;

    return new Enemy(enem, attSpr);
  }

  handleKey(key) {
    if (key == 32 || key == 87) {
      if (this.ready) this.player.jump();
    }
  }

  draw() {
    scale(2);
    background('#20263e');
    for (let i = 0; i < this.background.length; i++) {
      image(...this.background[i]);
    }
    if (this.ready && !this.player.dead) {
      this.player.draw();
      if (this.isHost) {
        for (let i = 0; i < this.len; i++) {
          this.conn.nodes[i].send({
            enemy:[
              [
                this.player.sp.position.x,
                this.player.sp.position.y,
                this.player.sp.mirrorX(),
                animations.indexOf(this.player.sp.getAnimationLabel()),
                this.player.sp.animation.getFrame(),
                this.player.attSpr.position.x,
                (this.player.attSpr.getAnimationLabel() == 'attack'),
              ],
              -1
            ]
          });
        }
      } else {
        this.conn.host.send({
          enemy:[
            this.player.sp.position.x,
            this.player.sp.position.y,
            this.player.sp.mirrorX(),
            animations.indexOf(this.player.sp.getAnimationLabel()),
            this.player.sp.animation.getFrame(),
            this.player.attSpr.position.x,
            (this.player.attSpr.getAnimationLabel() == 'attack'),
          ]
        });
      }
    }
    drawSprites();
  }
}

const letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
const numbers = ['1','2','3','4','5','6','7','8','9','0'];
const animations = ['idle','run','somer','jump','kick','blank'];
const colors = ["4180AF","A9373E","F9BA48","91B036"];
