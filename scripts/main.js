let gameID = Math.floor(Math.random() * 100000);
let connection;
let GameState;
let conn = [];
let others = {};
let query;
let menu;
let room;
let font;

/*
Game States:
LOAD: Awaiting server connection
MODE: Select whether you want to be a host or client
HOST: A state for the host that allows them to start a game and view stats about the game
MAPS: A state for the host that allows them to pick a map once they've started a game
JOIN: A state for the client that allows them to type the identifier of a game to join it
WAIT: A state for the client that tells them that they must wait for the host to make selections
GAME: A state for the game that tells the draw method that the game was started
*/

DrivelineClient.connect('wss://driveline.1533.io:8080', {onConnected:connect});
function connect(client) {
  connection = client;
  GameState = "MODE";
  menu.reset("SELECT","Nur V2.0",["Host","Join"]);
}

function preload() {
  font = loadFont('assets/start.ttf');
}

function setup() {
  createCanvas(...getSize());
  frameRate(24);
  textFont(font);
  noSmooth();

  menu = new Menu("ALERT","Loading...");
  room = new Room();
  GameState = "LOAD";
}

function draw() {
  update();

  if (GameState != "GAME") {
    menu.draw();
  } else {
    room.draw(others);
  }
}

function update() {
  if (GameState != "GAME") {
    if (GameState == "HOST") {
      menu.label = "ID" + gameID + " " + conn.length + "P";
    }

    const chosen = menu.checkChosen();
    if (chosen) {
      switch(GameState) {
        case "MODE":
          if (chosen == "host") {
            //TODO: Check to make sure that the stream is empty... otherwise maybe assign a different ID?

            GameState = "HOST";
            menu.reset("SELECT","ID" + gameID + " 0P",["Choose Map","Random Map"]);
            //SAY THAT I JOINED THE STREAM
            connection.append("TOMERNUR" + gameID, {conn:gameID});
            //BEGIN LISTENING TO THE STREAM
            beginListening(gameID);
          } else {
            GameState = "JOIN";
            menu.reset("PROMPT","Enter ID");
          }
          break;
        case "JOIN":
          //TODO: Check to make sure that the stream isn't empty... otherwise tell them to chose another ID.
          //TODO: Also make sure that they can't join a stream which has the {game:"BEGIN"} item.
          //TODO: Also make sure they can't join a stream which has >3 members.

          //SAY THAT I JOINED THE STREAM
          connection.append("TOMERNUR" + chosen, {conn:gameID});
          //BEGIN LISTENING TO THE STREAM
          beginListening(chosen);
          GameState = "WAIT";
          menu.reset("ALERT","Awaiting Host");
          break;
        case "HOST":
          if (chosen == "choose map") {
            GameState = "MAPS";
            menu.reset("SELECT", "Map Select", maps);
          } else {
            //BROADCAST THAT THE GAME STARTED
            connection.append("TOMERNUR" + gameID, {game:"BEGIN",map:maps[Math.floor(Math.random() * maps.length)].toLowerCase()});
          }
          break;
        case "MAPS":
          //BROADCAST THAT THE GAME STARTED
          connection.append("TOMERNUR" + gameID, {game:"BEGIN",map:chosen});
          break;
      }
    }
  } else {
    room.update(others);
  }
}

function beginListening(identifier) {
  query = connection.continuousQuery("SELECT * FROM STREAM TOMERNUR" + identifier, ({recordId, record, error}) => {
    if (error) return;

    if (record.conn != undefined) {
      conn.push(record.conn);
    }

    if (record.game != undefined && GameState != "GAME") {
      const myIndex = createEnemies();
      room.initialize(record.map, conn, gameID, connection, identifier, myIndex);
      GameState = "GAME";
    }

    if (record.ident != undefined && record.ident != gameID) {
      others[record.ident].update(...record.update);
    }
  }, {lastMessageId:new Uint8Array(8)});
}

function createEnemies() {
  for (let i = 0; i < conn.length; i++) {
    if (conn[i] != gameID) {
      others[conn[i]] = this.createEnemy(i);
    }
  }
  return conn.indexOf(gameID);
}

function createEnemy(color) {
  const dinos = [room.doux,room.mort,room.tard,room.vita];
  const enem = createSprite();
  room.addAnimations(dinos[color],enem);
  enem.changeAnimation('blank');
  enem.setCollider('rectangle', 0, 0, 15, 16);

  const attSpr = createSprite();
  attSpr.addAnimation('attack', room.attack);
  attSpr.addAnimation('blank', room.blank);
  attSpr.changeAnimation('blank');
  attSpr.setCollider('rectangle', 0, 0, 20, 20);

  return new Enemy(enem, attSpr);
}

function keyPressed(e) {
  if (GameState != "GAME") {
    menu.handleKey(e.keyCode);
  } else {
    room.handleKey(e.keyCode);
  }
}

function getSize() {
  const screenRatio = windowWidth / windowHeight;
  const aspX = 12;
  const aspY = 7;
  let wid = aspX;
  let hei = aspY;
  const aspectRatio = aspX / aspY;
  if (screenRatio > aspectRatio) {
		hei = windowHeight;
		wid = (aspX * windowHeight) / aspY;
	} else {
		wid = windowWidth;
		hei = (aspY * windowWidth) / aspX;
	}
  return [wid, hei];
}

/*
To write to the stream:
client.append(STEAM_NAME, MESSAGE);

To listen to the steam:
const query = client.continuousQuery("SELECT * FROM STREAM STREAM_NAME", ({recordId, record, error}) =>{
  if (error) {
    //Handle the error
    return;
  }
  //Run when message is recieved
});

To reset the stream:
client.truncate(STREAM_NAME);
*/
