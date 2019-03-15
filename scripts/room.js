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
    obj.animation.frameDelay = 3;
    obj.addAnimation('run', dino.run);
    obj.changeAnimation('run');
    obj.animation.frameDelay = 1;
    obj.addAnimation('somer', dino.somer);
    obj.changeAnimation('somer');
    obj.animation.frameDelay = 3;
    obj.addAnimation('jump', dino.jump);
    obj.changeAnimation('jump');
    obj.animation.frameDelay = 1;
    obj.addAnimation('kick', dino.kick);
    obj.changeAnimation('kick');
    obj.animation.frameDelay = 2;
    obj.addAnimation('blank', this.blank);
    obj.changeAnimation('blank');
    obj.animation.frameDelay = 1;
    obj.changeAnimation('idle');
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

    this.player.sp.position.x = spawn.x;
    this.player.sp.position.y = spawn.y;
    this.player.map = obst;

    this.ready = true;
  }

  initialize(type, conn, myID, connection, gameID, myIndex) {
    this.ready = false;
    this.conn = conn;
    this.ident = myID;
    this.gameID = gameID;
    this.cameraShake = 0;
    this.bg = this[type];
    this.client = connection;

    const dinos = [this.doux,this.mort,this.tard,this.vita];
    const charSpr = createSprite(0,0);
    this.addAnimations(dinos[myIndex],charSpr);
    charSpr.changeAnimation('idle');
    charSpr.setCollider('rectangle', 0, 0, 16, 16);

    const attSpr = createSprite();
    attSpr.addAnimation('attack', this.attack);
    attSpr.addAnimation('blank', this.blank);
    attSpr.setCollider('rectangle', 0, 0, 20, 20);

    const obst = new Group();
    obst.add(createSprite(0,0));

    this.player = new Player(charSpr, height, obst, attSpr, {x:0,y:0});

    fetch('maps/'+ type +'/data.txt')
      .then(response => response.text())
      .then(fore => this.generate(fore,type,myIndex))
  }

  handleKey(key) {
    if (key == 32 || key == 87) {
      if (this.ready && !this.player.dead) this.player.jump();
    }
  }

  draw(others) {
    scale(width / 480);
    background('#20263e');

    image(this.bg,0,0);

    for (let i in others) {
      drawSprite(others[i].sp);
    }
    drawSprite(this.player.sp);

    for (let i in others) {
      drawSprite(others[i].attSpr);
    }
    drawSprite(this.player.attSpr);
  }

  update(others) {
    if (this.cameraShake != 0) {
      camera.position.x = (Math.random() * 5) + width / 2;
      camera.position.y = (Math.random() * 5) + height / 2;
      this.cameraShake--;
    } else {
      camera.position.x = width / 2;
      camera.position.y = height / 2;
    }

    if (!this.player.dead) {
      this.player.update();
      for (let i in others) {
        for (let j in others) {
          if (i != j) {
            if (others[j].sp.overlap(others[i].attSpr) && others[i].attSpr.getAnimationLabel() == 'attack' && others[i].canAtt) {
              this.cameraShake = 10;
            }
          }
        }
        if (others[i].sp.overlap(this.player.attSpr) && this.player.attSpr.getAnimationLabel() == 'attack') {
          this.cameraShake = 10;
        }
        if (this.player.sp.overlap(others[i].attSpr) && others[i].attSpr.getAnimationLabel() == 'attack' && others[i].canAtt) {
          others[i].canAtt = false;
          this.player.yspd = -10;
          this.player.xspd = 0.25 * this.player.mult * (others[i].sp.position.x > this.player.sp.position.x ? -1 : 1);
          this.player.mult++;
          this.cameraShake = 15;
        }
      }
    }
    this.client.append("TOMERNUR" + this.gameID, {update:[
      this.player.sp.position.x,
      this.player.sp.position.y,
      this.player.sp.mirrorX(),
      animations.indexOf(this.player.sp.getAnimationLabel()),
      this.player.sp.animation.getFrame(),
      this.player.attSpr.position.x,
      (this.player.attSpr.getAnimationLabel() == 'attack'),
      this.player.lives
    ], ident:this.ident});
  }
}
