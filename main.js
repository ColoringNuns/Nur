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
    if (conn.nodes.length < 3) {
      conn.nodes.push(c);
    }
    if (conn.nodes.length == 4) {
      menu.label = "Room is full.";
    }
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
            conn.nodes[i].send({ begin:[chosen, conn.nodes.length, colors[i]] });
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
            if (data.begin != null) {
              room.initialize(width, data.begin[0], conn, isHost, data.begin[1]);
              gameState = 'INGAME';
            }
          });
        });
        menu.label = 'Joining...';
      }
    } else {
      if (gameState == 'MAPSELECT') {
        if (isHost) {
          menu.label = "ID: " + peerID + ", " + (conn.nodes.length + 1) + " Players";
        }
      }
      menu.draw();
    }
  } else {
    room.draw();
  }
}
