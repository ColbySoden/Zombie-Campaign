const express = require('express')
const app = express()
const fs = require('fs');

const SimpleNodeLogger = require('simple-node-logger'),
        opts = {
                logFilePath: 'node.log',
                timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
        },
        log = SimpleNodeLogger.createSimpleFileLogger( opts );

app.set('view engine', 'ejs')

app.use(express.static('public'))

app.get('/', (req, res) => {
	res.render('index')
})

app.get('/play', (req, res) => {
	res.render('player1')
})

app.get('/setup', (req, res) => {
	res.render('setup', { name : 'TEST'})
})

var loginIds = ["admin", "abc", "123", "edf", "456"];

var players = [0,1,2,3];
var playerNames = ["Player A", "Player B", "Player C", "Player D"];
var playerDescriptions = ["Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.",
					"Another Description",
					"Another Description",
					"Another Description"];
var hitPointsMax = [20,20,20,20];
var hitPointsCur = [20,10,15,20];
var strengths = [10,10,10,10];
var dexs = [10,10,10,10];
var consts = [10,10,10,10];
var intels = [10,10,10,10];
var wisdoms = [10,10,10,10];
var chars = [10,10,10,10];
var feats = ["temp", "temp", "temp", "temp"];
var featDescription = ["A temporary description of what this feat can do for you.",
					"A temporary description of what this feat can do for you.",
					"A temporary description of what this feat can do for you.",
					"A temporary description of what this feat can do for you."];
var featsUsed = [false, false, false, false];
var skills = [["temp1", "temp2", "temp3"],
				["temp1", "temp2", "temp3"],
				["temp1", "temp2", "temp3"]];
				//name, Ammo/Count, damageDice, diceSize, profeciency type (0 for strength, 1 for ranged) (calculate hit bonus client side)
var inventories = [[["Knife", "N/A", 1, 4, 0],
					["Pistol", "10", 1, 10, 1],
					["Backpack", "N/A", 0, 0, -1],
					["Bedroll", "N/A", 0, 0, -1],
					["Bandages", "10", 0, 0, -1]
				],[["Machete", "N/A", 1, 6, 0],
					["Rifle", "10", 2, 10, 1],
					["Backpack", "N/A", 0, 0, -1],
					["Bedroll", "N/A", 0, 0, -1],
					["Matches", "5", 0, 0, -1]
				],[["Fire Axe", "N/A", 1, 6, 0],
					["Hatchet", "N/A", 1, 6, 0],
					["Backpack", "N/A", 0, 0, -1],
					["Bedroll", "N/A", 0, 0, -1],
					["Rope (ft)", "10", 0, 0, -1],
					["Town Map", "N/A", 0, 0, -1]
				],[["Knife", "N/A", 1, 4, 0],
					["Pistol", "10", 1, 10, 1],
					["Backpack", "N/A", 0, 0, -1],
					["Bedroll", "N/A", 0, 0, -1],
					["Bandages", "10", 0, 0, -1]
				]];

server = app.listen(80)

const io = require("socket.io")(server)

//starting values
var flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false,
    x = "black",
    y = 2;

var moves = [];
var newMove = [];

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

io.on('connection', (socket) => {
	log.info('recieved a connection');

	socket.emit('startup', {prevMoves : moves})

	socket.on('draw', (data) => {

		newMove = ['draw', data.pX, data.pY, data.cX, data.cY];
		moves.push(newMove);

		//send to other clients
		socket.broadcast.emit('draw', {pX : data.pX, pY : data.pY, cX : data.cX, cY : data.cY})
	})

	socket.on('clear', (data) => {
		log.info('recieved a clear()');
		moves = [];

		//send to other clients
		socket.broadcast.emit('clear')
	})

	socket.on('color', (data) => {
		log.info('recieved a color()');
		newMove = ['color', data.name, data.yVal];
		moves.push(newMove);

		//send to other clients
		socket.broadcast.emit('color', {color : data.name, yVal : data.yVal})
	})

	socket.on('attack', (data) => {
		var id = data.player;
		var bonus = data.bonusMod;
		if(players.includes(id)){
			var rolledNum = randomIntFromInterval(1,20);
			log.info("Player #" + id + " rolled a " + rolledNum + " +" + bonus + " on attack");
			socket.broadcast.emit('attack', {player : id, num : rolledNum, bonus : bonus})
		}else{
			log.error("PLAYER DOESNT EXIST");
		}
	})

	socket.on('damage', (data) => {
		var id = data.player;
		var num = data.numOfDice;
		var size = data.sizeOfDice;
		var rolledNum = 0;
		var totalDamage = [0,0,0,0,0];
		if(players.includes(id)){
			for(var i = 0; i < num; i++){
				rolledNum = randomIntFromInterval(1,size);
				log.info("Player #" + id + " rolled a " + rolledNum + " on damage");
				totalDamage[i] = rolledNum;
			}
			socket.broadcast.emit('damage', {player : id, total : totalDamage})
		}else{
			log.error("PLAYER DOESNT EXIST");
		}
	})

	socket.on('roll', (data) => {
		var id = data.player;
		var size = data.sizeOfDice;
		if(players.includes(id)){
			var rolledNum = randomIntFromInterval(1,size);
			log.info("Player #" + id + " rolled a " + rolledNum);
			socket.broadcast.emit('roll', {player : id, size : size, roll : rolledNum})
		}else{
			log.error("PLAYER DOESNT EXIST");
		}
	})

	socket.on('login', (data) => {
		var loginId = data.id;
		if(loginIds.includes(loginId)){
			var lID = loginIds.indexOf(loginId);
			if(lID > 0){
				var pID = players[lID-1];
				socket.emit("playerLogin", {playerId : pID,
					name : playerNames[pID],
					description : playerDescriptions[pID],
					inventory : inventories[pID],
					hitPoints : hitPointsMax[pID],
					currHitPoints : hitPointsCur[pID],
					strength : strengths[pID],
					dexterity : dexs[pID],
					constitution : consts[pID],
					intelligence : intels[pID],
					wisdom : wisdoms[pID],
					charisma : chars[pID],
					feat : feats[pID],
					featDescription : featDescription[pID],
					featUsed : featsUsed[pID],
					skill1 : skills[pID][0],
					skill2 : skills[pID][1],
					skill3 : skills[pID][2]
				})
			}else if(lID == 0){
				//DM page
			}
		}else{
			log.error("INVALID LOGIN");
			socket.emit("errorLogin");
		}
	})

	socket.on('disconnect', (data) => {
		log.info('disconnection');
	})

	socket.on('createCharacter', (data) => {

		player = data.playerName;
		fileName = "character_" + player + ".txt";

		characterInfo = "Name: " + data.characterName + "\n" + 
						"Background: " + data.background + "\n" +
						"Feat: " + data.feat + "\n" +
						"Abilities: " + data.ability1 + ", " + data.ability2 + ", " + data.ability3 + "\n" + 
						"Strength: " + data.strength + "\n" + 
						"Dexterity: " + data.dexterity + "\n" + 
						"Constitution: " + data.constitution + "\n" + 
						"Intelligence: " + data.intelligence + "\n" + 
						"Wisdom: " + data.wisdom + "\n" + 
						"Charisma: " + data.charisma + "\n" + 
						"Equipment: " + data.equipment1 + " & " + data.equipment2 + "\n" + 
						"Timestamp: " + data.timestamp + "\n -------";
		log.info("Creating: " + characterInfo);

		// write to a new file named 2pac.txt
		fs.writeFile(fileName, characterInfo, (err) => {
		    // throws an error, you could also catch it here
		    if (err) throw err;

		    // success case, the file was saved
		    log.info('Character file write successful');
		});
	})
})