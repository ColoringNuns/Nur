class Room {
  constructor() {
    this.doux = this.loadSprites('doux');
    this.mort = this.loadSprites('mort');
    this.tard = this.loadSprites('tard');
    this.vita = this.loadSprites('vita');

    this.attack = loadSpriteSheet('assets/attack.png', 24, 20, 5);
    this.blank = loadSpriteSheet('assets/blank.png', 24, 20, 1);

    this.loadAnimations(this.doux);
    this.loadAnimations(this.mort);
    this.loadAnimations(this.tard);
    this.loadAnimations(this.vita);
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

  loadSprites(name) {
    return {
      run: loadSpriteSheet('assets/' + name + '/run.png', 24, 24, 6),
      idle: loadSpriteSheet('assets/' + name + '/idle.png', 24, 24, 4),
      somer: loadSpriteSheet('assets/' + name + '/somer.png', 24, 24, 4),
      jump: loadSpriteSheet('assets/' + name + '/jump.png', 24, 24, 3),
      kick: loadSpriteSheet('assets/' + name + '/kick.png', 24, 24, 4)
    };
  }

  loadAnimations(anims) {
    for (let i in anims) {
      loadAnimation(anims[i]);
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

  addAnimations(dino,obj) {
    obj.addAnimation('idle', dino.idle);
    obj.addAnimation('run', dino.run);
    obj.addAnimation('somer', dino.somer);
    obj.addAnimation('jump', dino.jump);
    obj.addAnimation('kick', dino.kick);
    obj.addAnimation('blank', this.blank);
  }

  generate(fore,back,type,index) {
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
    this.mapF = new Group();

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

          this.mapF.add(tile);
        }
      }
    }

    const dinos = [this.doux,this.mort,this.tard,this.vita];
    this.player = createSprite(50, height / 2 - 200);
    this.addAnimations(dinos[index],this.player);
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

    const bar = new ProgressBar.Line('#plr0bar', {
      strokeWidth: 5,
      easing: 'easeInOut',
      color: '#' + colors[index],
      trailColor: '#565656',
      trailWidth: 5,
      svgStyle: { width: '100%', height: '100%'},
    });
    bar.set(1);

    this.player = new Player(this.player,height,this.mapF, attSpr, bar);

    noSmooth();

    this.ready = true;
  }

  initialize(type, conn, isHost, len, index) {
    this.ready = false;
    this.conn = conn;
    this.isHost = isHost;
    this.len = len;
    this.cameraShake = 0;

    this.enemies = [];
    let k = 0;
    for (let i = 0; i < len; i++) {
      if (i != index) {
        this.enemies.push(this.createEnemy(k + 1, i));

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
        k++;
      } else {
        this.enemies.push(null);
      }
    }
    if (!isHost) {
      this.hostSpr = this.createEnemy(len, len);

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
        .then(back => this.generate(fore,back,type,(index != -1 ? index : len))))
  }

  createEnemy(index,color) {
    const dinos = [this.doux,this.mort,this.tard,this.vita];
    const enem = createSprite();
    this.addAnimations(dinos[color],enem);
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

    const bar = new ProgressBar.Line('#plr' + index + 'bar', {
      strokeWidth: 5,
      easing: 'easeInOut',
      color: '#' + colors[color],
      trailColor: '#565656',
      trailWidth: 5,
      svgStyle: { width: '100%', height: '100%'},
    });
    bar.set(1);

    return new Enemy(enem, attSpr, bar);
  }

  handleKey(key) {
    if (key == 32 || key == 87) {
      if (this.ready && !this.player.dead) this.player.jump();
    }
  }

  draw() {
    scale(2);
    background('#20263e');
    if (this.cameraShake != 0) {
      camera.position.x = (Math.random() * 5) + width / 2;
      camera.position.y = (Math.random() * 5) + height / 2;
      this.cameraShake -= 1;
    }

    for (let i = 0; i < this.background.length; i++) {
      image(...this.background[i]);
    }

    if (this.ready) {
      if (!this.player.dead) {
        this.player.draw();
        for (let i = 0; i < this.enemies.length; i++) {
          if (this.enemies[i] != null) {
            for (let j = 0; j < this.enemies.length; j++) {
              if (this.enemies[j] != null && i != j) {
                if (this.enemies[j].sp.overlap(this.enemies[i].attSpr) && this.enemies[i].attSpr.getAnimationLabel() == 'attack' && this.enemies[i].canAtt) {
                  this.cameraShake = 10;
                }
              }
            }
            if (this.enemies[i].sp.overlap(this.player.attSpr) && this.player.attSpr.getAnimationLabel() == 'attack') {
              this.cameraShake = 10;
            }
            if (this.player.sp.overlap(this.enemies[i].attSpr) && this.enemies[i].attSpr.getAnimationLabel() == 'attack' && this.enemies[i].canAtt) {
              this.enemies[i].canAtt = false;
              this.player.sp.velocity.y = -4;
              this.player.xspd = 0.25 * this.player.mult * (this.enemies[i].sp.position.x > this.player.sp.position.x ? -1 : 1);
              this.player.mult++;
              this.cameraShake = 15;
            }
          }
        }
      }
      const data = [
        this.player.sp.position.x,
        this.player.sp.position.y,
        this.player.sp.mirrorX(),
        animations.indexOf(this.player.sp.getAnimationLabel()),
        this.player.sp.animation.getFrame(),
        this.player.attSpr.position.x,
        (this.player.attSpr.getAnimationLabel() == 'attack'),
        this.player.lives
      ];
      if (this.isHost) {
        for (let i = 0; i < this.len; i++) {
          this.conn.nodes[i].send({
            enemy:[data,-1]
          });
        }
      } else {
        for (let j = 0; j < this.enemies.length; j++) {
          if (this.enemies[j] != null) {
            if (this.enemies[j].sp.overlap(this.hostSpr.attSpr) && this.hostSpr.attSpr.getAnimationLabel() == 'attack' && this.hostSpr.canAtt) {
              this.cameraShake = 10;
            }
          }
        }
        if (this.hostSpr.sp.overlap(this.player.attSpr) && this.player.attSpr.getAnimationLabel() == 'attack') {
          this.cameraShake = 10;
        }
        if (this.player.sp.overlap(this.hostSpr.attSpr) && this.hostSpr.attSpr.getAnimationLabel() == 'attack' && this.hostSpr.canAtt) {
          this.hostSpr.canAtt = false;
          this.player.sp.velocity.y = -4;
          this.player.xspd = 0.25 * this.player.mult * (this.hostSpr.sp.position.x > this.player.sp.position.x ? -1 : 1);
          this.player.mult++;
          this.cameraShake = 15;
        }
        this.conn.host.send({enemy:data});
      }
    }

    drawSprites(this.mapF);
    for (let i = 0; i < this.enemies.length; i++) {
      if (this.enemies[i] != null) {
        drawSprite(this.enemies[i].sp);
        drawSprite(this.enemies[i].attSpr);
      }
    }
    if (!this.isHost) {
      drawSprite(this.hostSpr.sp);
      drawSprite(this.hostSpr.attSpr);
    }
  }
}
