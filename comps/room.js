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

    this.loadMaps();
  }

  loadMaps() {
    for (let i = 0; i < maps.length; i++) {
      this[maps[i].toLowerCase()] = loadImage('maps/'+maps[i].toLowerCase()+'/bg.png');
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

  addAnimations(dino,obj) {
    obj.addAnimation('idle', dino.idle);
    obj.addAnimation('run', dino.run);
    obj.addAnimation('somer', dino.somer);
    obj.addAnimation('jump', dino.jump);
    obj.addAnimation('kick', dino.kick);
    obj.addAnimation('blank', this.blank);
  }

  generate(map,type,index) {
    map = this.parseMap(map);
    const obst = new Group();
    const spawn = {x:0,y:0};

    for (let i = 0; i < map.length; i++) {
      if (map[i][0] == "spawn") {
        if (parseInt(map[i][1],10) == index) {
          spawn.x = parseInt(map[i][2],10);
          spawn.y = parseInt(map[i][3],10);
        }
      } else {
        let tile = createSprite(parseInt(map[i][1],10),parseInt(map[i][2],10));
        tile.setCollider(map[i][0],0,0,parseInt(map[i][3],10),parseInt(map[i][4],10));
        obst.add(tile);
      }
    }

    const dinos = [this.doux,this.mort,this.tard,this.vita];
    this.player = createSprite(spawn.x, spawn.y);
    this.addAnimations(dinos[index],this.player);
    this.player.changeAnimation('idle');
    this.player.animation.frameDelay = 12;
    this.player.setCollider('rectangle', 0, 0, 16, 16);

    const attSpr = createSprite();
    attSpr.addAnimation('attack', this.attack);
    attSpr.addAnimation('blank', this.blank);
    attSpr.setCollider('rectangle', 0, 0, 20, 20);
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

    this.player = new Player(this.player, height, obst, attSpr, bar, spawn);

    noSmooth();

    this.ready = true;
  }

  initialize(type, conn, isHost, len, index) {
    this.ready = false;
    this.conn = conn;
    this.isHost = isHost;
    this.len = len;
    this.cameraShake = 0;
    this.bg = this[type];

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

    fetch('maps/'+ type +'/data.txt')
      .then(response => response.text())
      .then(fore => this.generate(fore,type,(index != -1 ? index : len)))
  }

  createEnemy(index,color) {
    const dinos = [this.doux,this.mort,this.tard,this.vita];
    const enem = createSprite();
    this.addAnimations(dinos[color],enem);
    enem.changeAnimation('blank');
    enem.animation.frameDelay = 12;
    enem.setCollider('rectangle', 0, 0, 15, 16);

    const attSpr = createSprite();
    attSpr.addAnimation('attack', this.attack);
    attSpr.addAnimation('blank', this.blank);
    attSpr.changeAnimation('blank');
    attSpr.setCollider('rectangle', 0, 0, 20, 20);

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
    scale(width / 480);
    background('#20263e');

    image(this.bg,0,0);

    for (let i = 0; i < this.enemies.length; i++) {
      if (this.enemies[i] != null) {
        drawSprite(this.enemies[i].sp);
      }
    }
    if (!this.isHost) {
      drawSprite(this.hostSpr.sp);
    }
    if (this.ready) {
      drawSprite(this.player.sp);
    }
    for (let i = 0; i < this.enemies.length; i++) {
      if (this.enemies[i] != null) {
        drawSprite(this.enemies[i].attSpr);
      }
    }
    if (!this.isHost) {
      drawSprite(this.hostSpr.attSpr);
    }
    if (this.ready) {
      drawSprite(this.player.attSpr);
    }
  }

  update() {
    if (this.cameraShake != 0) {
      camera.position.x = (Math.random() * 5) + width / 2;
      camera.position.y = (Math.random() * 5) + height / 2;
      this.cameraShake -= 1;
    }

    if (this.ready) {
      if (!this.player.dead) {
        this.player.update();
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
              this.player.yspd = -4;
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
          this.player.yspd = -4;
          this.player.xspd = 0.4 * this.player.mult * (this.hostSpr.sp.position.x > this.player.sp.position.x ? -1 : 1);
          this.player.mult++;
          this.cameraShake = 15;
        }
        this.conn.host.send({enemy:data});
      }
    }
  }
}
