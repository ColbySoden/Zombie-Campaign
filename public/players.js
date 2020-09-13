var socket = io.connect('http://ec2-18-188-12-58.us-east-2.compute.amazonaws.com:80/');

var playerId = 1;
var name = "";
var description = "";
var inventory; //array of arrays
var totalHealth = -1;
var currHealth = -1;
var strength = 0;
var dexterity = 0;
var constitution = 0;
var intelligence = 0;
var wisdom = 0;
var charisma = 0;
var feat = "TBD";
var featDescription = "";
var featUsed = false;
var skills = ["TBD", "TBD", "TBD"];

socket.on("playerLogin", (data) => {
	console.log('playerLogin received');
	//set player vars
	playerId = data.playerId;
	name = data.name;
	description = data.description;
	inventory = data.inventory;
	totalHealth = data.hitPoints;
	currHealth = data.currHitPoints;
	strength = data.strength;
	dexterity = data.dexterity;
	constitution = data.constitution;
	intelligence = data.intelligence;
	wisdom = data.wisdom;
	charisma = data.charisma;
	feat = data.feat;
	featDescription = data.featDescription;
	featUsed = data.featUsed;
	skills[0] = data.skill1;
	skills[1] = data.skill2;
	skills[2] = data.skill3;

	//update page
	//TODO: update home section
	$('#playerName').html(name);
	var healthCounter = 0;
	for(var j=0; j<currHealth; j++){
		$("#healthBar").append('<span class="sectionHeader" style="font-size:48px;">&#9829;</span>');
		healthCounter++;
	}
	for(; healthCounter<totalHealth; healthCounter++){
		$("#healthBar").append('<span class="sectionHeader" style="font-size:48px;">&#9825;</span>');
	}
	$("#characterDescription").html(description);
	$("#featName").html(feat);
	$("#featDescription").html(featDescription);
	if(featUsed){
		$("#featName").addClass("usedUp");
		$("#featDescription").addClass("usedUp");
	}
	//update color pallette
	$('body').find('.headerTab').addClass('headerTab'+playerId);
	$('body').find('.sectionHeader').addClass('colorSet'+playerId);
	//update inventory
	for(var i = 0; i < inventory.length; i++){
		var description = inventory[i][0];
		var count = inventory[i][1];
		var damageDice = inventory[i][2];
		var diceSize = inventory[i][3];
		var hitBonus = -1;
		var profType = inventory[i][4];
		if(damageDice > 0 && diceSize > 0){
			hitBonus = 0;
			if(profType == 0){
				hitBonus += Math.floor((strength - 10) / 2);
			}else if(profType == 1){
				hitBonus += Math.floor((dexterity - 10) / 2);
			}
		}
		var newLI = '<li class="list-group-item"><ul class="list-group list-group-horizontal headerRow">';
		newLI += '<li class="list-group-item">' + description + '</li>';
		newLI += '<li class="list-group-item">' + count + '</li>';
		if(hitBonus >= 0){
			newLI += '<li class="list-group-item"><button type="button" class="btn btn-outline-success" onClick="attack('+hitBonus+')"> +' + hitBonus + '</button></li>';
		}else{
			newLI += '<li class="list-group-item">N/A</li>';
		}
		if(damageDice > 0 && diceSize > 0){
			newLI += '<li class="list-group-item"><button type="button" class="btn btn-outline-danger" onClick="damage('+damageDice+','+diceSize+')">'+damageDice+'d'+diceSize+'</button></li>';
		}else{
			newLI += '<li class="list-group-item">N/A</li>';
		}
		newLI += '</ul></li>';

		$("#inventoryList").append(newLI);
	}
	//Update stats
	$("#currHit").html(currHealth);
	$("#maxHit").html(totalHealth);
	$("#strengthVal").html(strength);
	$("#dexterityVal").html(dexterity);
	$("#constitutionVal").html(constitution);
	$("#intelligenceVal").html(intelligence);
	$("#wisdomVal").html(wisdom);
	$("#charismaVal").html(charisma);
	$("#featVal").html(feat);
	$("#skill1").html(skills[0]);
	$("#skill2").html(skills[1]);
	$("#skill3").html(skills[2]);


	$('#loginModal').modal('hide');
	var scale = 'scale(1)';
	document.body.style.webkitTransform =  scale;    // Chrome, Opera, Safari
 	document.body.style.msTransform =   scale;       // IE 9
 	document.body.style.transform = scale;     // General
})

socket.on("errorLogin", (data) => {
	if(!$("#inputId").hasClass("is-invalid")){
		$("#inputId").addClass("is-invalid");
	}
	alert("INVALID Player ID");
})

function attack(bonus){
	socket.emit('attack', {player : playerId, bonusMod : bonus})
}

function damage(num, diceSize){
	socket.emit('damage', {player : playerId, numOfDice : num, sizeOfDice : diceSize})
}

function roll(){
	var d = 20;
	socket.emit('roll', {player : playerId, sizeOfDice : d})
}

function login(){
	var loginId = $("#inputId").val();
	if(loginId != null && loginId.length > 0){
		socket.emit('login', {id : loginId})
	}else{
		$("#inputId").addClass("is-invalid");
	}
}