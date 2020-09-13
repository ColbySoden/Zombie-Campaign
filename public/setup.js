var socket = io.connect('http://ec2-18-188-12-58.us-east-2.compute.amazonaws.com:80/');

var name, desc, feat, strengthVal, constVal, wisdomVal, dexVal, intelVal, charVal, equipment1, equipment2;
var abilities = [];

$("#submitButton").click(function() {
	var numberOfChecked = $('input:checkbox:checked').length;
	console.log('number checked :: ' + numberOfChecked);

	var checkedValid = false;

	if(numberOfChecked > 3){
		$("#skillFeedback").html("You can only choose 3 skills");
	}else if(numberOfChecked < 3){
		$("#skillFeedback").html("Please select 3 skills");
	}else{
		$("#skillFeedback").html("");
		checkedValid = true;
	}

	var allAbilitiesValid = true;

	if($("#inputStrength").val() == 0 || $("#inputStrength").val() == null){
		$("#inputStrength").addClass("is-invalid");
		$("#abilityFeedback").html("Please select a score for each ability");
		allAbilitiesValid = false;
	}else{
		$("#inputStrength").removeClass("is-invalid");
	}
	if($("#dexterityInput").val() == 0 || $("#dexterityInput").val() == null){
		$("#dexterityInput").addClass("is-invalid");
		$("#abilityFeedback").html("Please select a score for each ability");
		allAbilitiesValid = false;
	}else{
		$("#dexterityInput").removeClass("is-invalid");
	}
	if($("#constitutionInput").val() == 0 || $("#constitutionInput").val() == null){
		$("#constitutionInput").addClass("is-invalid");
		$("#abilityFeedback").html("Please select a score for each ability");
		allAbilitiesValid = false;
	}else{
		$("#constitutionInput").removeClass("is-invalid");
	}
	if($("#intelligenceInput").val() == 0 || $("#intelligenceInput").val() == null){
		$("#intelligenceInput").addClass("is-invalid");
		$("#abilityFeedback").html("Please select a score for each ability");
		allAbilitiesValid = false;
	}else{
		$("#intelligenceInput").removeClass("is-invalid");
	}
	if($("#wisdomInput").val() == 0 || $("#wisdomInput").val() == null){
		$("#wisdomInput").addClass("is-invalid");
		$("#abilityFeedback").html("Please select a score for each ability");
		allAbilitiesValid = false;
	}else{
		$("#wisdomInput").removeClass("is-invalid");
	}
	if($("#charismaInput").val() == 0 || $("#charismaInput").val() == null){
		$("#charismaInput").addClass("is-invalid");
		$("#abilityFeedback").html("Please select a score for each ability");
		allAbilitiesValid = false;
	}else{
		$("#charismaInput").removeClass("is-invalid");
	}

	if(allAbilitiesValid){
		$("#abilityFeedback").html("");
	}

	if(checkedValid && allAbilitiesValid){
		getVals();
		socket.emit('createCharacter', {playerName : $("#playerName").val(), 
										characterName : name,
										background : desc,
										feat : feat,
										ability1 : abilities[0],
										ability2 : abilities[1],
										ability3 : abilities[2],
										strength : strengthVal,
										dexterity : dexVal,
										constitution : constVal,
										intelligence : intelVal,
										wisdom : wisdomVal,
										charisma : charVal,
										equipment1 : equipment1,
										equipment2 : equipment2,
										timestamp : $.now()});
		alert("Character Submitted Thank you.");
	}

});

$( ".abilitySelector" ).on('focus', function () {
	console.log("ability focus");
    // Store the current value on focus and on change
    previous = this.value;
}).change(function() {
	console.log("ability change");
    if(previous != null && previous >= 8){
    	$('.abilitySelector').not(this).find('option[value="' + previous + '"]').show();
    }
	newVal = $(this).val();
	$('.abilitySelector').not(this).find('option[value="' + newVal + '"]').hide();
});

function getVals(){
	name = $("#inputName").val();
	desc = $("#inputDesc").val();
	var selectedFeat = $("input[type='radio'][name='featInput']:checked");
	if (selectedFeat.length > 0) {
	    feat = selectedFeat.val();
	}
	var counter = 0;
	$('input[type=checkbox]').each(function () {
		if(this.checked){
			abilities.push($(this).html());
		}
	});
	strengthVal = $("#inputStrength").val();
	dexVal = $("#dexterityInput").val();
	constVal = $("#constitutionInput").val();
	intelVal = $("#intelligenceInput").val();
	wisdomVal = $("#wisdomInput").val();
	charVal = $("#charismaInput").val();
	if($("#melee1").is(':checked')){
		equipment1 = "melee";
	}else{
		equipment1 = "knife";
	}

	if($("#melee2").is(':checked')){
		equipment2 = "melee";
	}else if($("#rifle").is(':checked')){
		equipment2 = "rifle";
	}else{
		equipment2 = "pistol";
	}
}