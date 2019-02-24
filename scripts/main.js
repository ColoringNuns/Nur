function preload() {
  room = new Room();
  menu = new Select('Nur',['Join','Host']);
  custID = Math.floor(Math.random() * 1000);
  peer = new Peer('nurnunscf'+custID, {key: 'lwjd5qra8257b9'});
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
    if (conn.nodes.length >= 3) {
      menu.label = "Room Full";
    }
  });
}

function getSize() {
  const screenRatio = windowWidth / windowHeight;
  const aspectRatio = 12 / 7;
  let wid = 12;
  let hei = 7;
  if (screenRatio > aspectRatio) {
		hei = windowHeight;
		wid = (12 * windowHeight) / 7;
	} else {
		wid = windowWidth;
		hei = (7 * windowWidth) / 12;
	}
  return {wid:wid,hei:hei};
}

function setup() {
  const size = getSize();
  createCanvas(size.wid, size.hei);
  frameRate(60);
  textFont(loadFont('assets/Prstart.ttf'));
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
            menu.reset('Map Select',maps);
            isHost = true;
            conn.host = peerID;
            gameState = 'MAPSELECT';
          } else if (chosen == "join") {
            menu = new Prompt("Game ID:");
            gameState = 'JOINGAME';
          }
        } else {
          menu.label = 'Conn Err';
        }
      } else if (gameState == 'MAPSELECT') {
        if (conn.nodes.length != 0 && isHost) {
          for (let i = 0; i < conn.nodes.length; i++) {
            conn.nodes[i].send({ begin:[chosen.toLowerCase(), conn.nodes.length, i] });
          }
          room.initialize(chosen, conn, isHost, conn.nodes.length, -1);
          gameState = 'INGAME';
        }
      } else if (gameState == 'JOINGAME') {
        conn.host = peer.connect('nurnunscf' + chosen);
        conn.host.on('open', (id) => {
          menu = new Alert("Awaiting Host");
          gameState = 'MAPSELECT';
          conn.host.on('data', function(data) {
            if (data.begin != null) {
              room.initialize(data.begin[0], conn, isHost, data.begin[1], data.begin[2]);
              gameState = 'INGAME';
            }
          });
        });
        menu.label = 'Joining...';
      }
    } else {
      if (gameState == 'MAPSELECT') {
        if (isHost) {
          menu.label = "ID" + custID + " " + (conn.nodes.length + 1) + "P";
        }
      }
      menu.draw();
    }
  } else {
    room.update();
    room.draw();
  }
}
