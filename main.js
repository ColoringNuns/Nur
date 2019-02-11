function preload() {
  room = new Room();
  menu = new Select('Team Select',['Join','Host']);
  peer = new Peer('nur'+Math.floor(Math.random() * 1000), {key: 'lwjd5qra8257b9'});
  conn = null;
  peerID = null;
  isHost = false;
  peer.on('open', function(id) {
    peerID = id;
	});
  peer.on('connection', function(c) {
    conn = c;
  });
}

function setup() {
  createCanvas(960,560);
  frameRate(60);
  textFont(loadFont('assets/Prstart.ttf'));
  menu.initialize(width, height);
  gameState = 'PEER';
}

function keyPressed() {
  if (gameState != 'INGAME') {
    menu.handleKey(keyCode);
  } else {
    room.handleKey(keyCode);
  }
  return false;
}

function draw() {
  if (gameState != 'INGAME') {
    let chosen = menu.checkChosen();
    if (chosen !== false) {
      if (gameState == 'PEER') {
        if (peerID !== null) {
          if (chosen == "host") {
            menu.reset('Map Select',['Forest','Metal']);
            isHost = true;
            gameState = 'MAPSELECT';
          } else if (chosen == "join") {
            menu = new Prompt("Game ID:");
            menu.initialize(width,height);
            gameState = 'JOINGAME';
          }
        } else {
          menu.label = 'Connection err; try again.';
        }
      } else if (gameState == 'MAPSELECT') {
        if (conn != null) {
          conn.send({ map:chosen });
          room.initialize(width, chosen, conn, isHost);
          gameState = 'INGAME';
        } else {
          alert('Not Enough Players.');
        }
      } else if (gameState == 'JOINGAME') {
        conn = peer.connect(chosen);
        conn.on('open', (id) => {
          menu = new Alert("Host is making selections.");
          menu.initialize(width,height);
          gameState = 'MAPSELECT';
          conn.on('data', function(data) {
            if (data.map != null) {
              room.initialize(width, data.map, conn, isHost);
              gameState = 'INGAME';
            }
          });
        });
        menu.label = 'Joining...';
      }
    } else {
      if (gameState == 'MAPSELECT') {
        if (isHost) {
          menu.label = (conn != null ? "Map Select" : "Game ID: " + peerID);
        }
      }
      menu.draw();
    }
  } else {
    room.draw();
  }
}
