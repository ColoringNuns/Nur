function preload() {
  room = new Room();
  menu = new Select('Team Select',['Join','Host']);
  peer = new Peer('nur'+Math.floor(Math.random() * 1000), {key: 'lwjd5qra8257b9'});
  conn = { nodes:[], host:null };
  peerID = null;
  isHost = false;
  peer.on('open', function(id) {
    peerID = id;
	});
  peer.on('connection', function(c) {
    conn.nodes.push(c);
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
            conn.host = peerID;
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
        if (conn.nodes.length != 0 && isHost) {
          for (let i = 0; i < conn.nodes.length; i++) {
            conn.nodes[i].send({ map:[chosen, conn.nodes.length] });
          }
          room.initialize(width, chosen, conn, isHost, conn.nodes.length);
          gameState = 'INGAME';
        } else {
          alert('Not Enough Players.');
        }
      } else if (gameState == 'JOINGAME') {
        conn.host = peer.connect(chosen);
        conn.host.on('open', (id) => {
          menu = new Alert("Host is making selections.");
          menu.initialize(width,height);
          gameState = 'MAPSELECT';
          conn.host.on('data', function(data) {
            if (data.map != null) {
              room.initialize(width, data.map[0], conn, isHost, data.map[1]);
              gameState = 'INGAME';
            }
          });
        });
        menu.label = 'Joining...';
      }
    } else {
      if (gameState == 'MAPSELECT') {
        if (isHost) {
          menu.label = "ID: " + peerID + ", " + conn.nodes.length + " Players";
        }
      }
      menu.draw();
    }
  } else {
    room.draw();
  }
}
