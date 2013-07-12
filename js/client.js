
var Stage = function(ele, spd) {

	this.eleQuery = ele;
	this.$stage = $(ele);
	this.stageSpeed = spd;
	
	this.curScene;
	this.propsArr = new Array();

}

var You = function () {

	//hitbox
	this.left;
	this.right;
	this.top;
	this.bottom;
	
	this.$you;
	
	this.weapon = new Weapon();

}

var Weapon = function () {
	
	//each block needs a hitbox, 
	//this array will contain arrays [ [top, left, bomttom, right], [...], [...]  ]
	this.blocks = new Array();
	this.$weapon;
	
	this.currentWeapon;  //determins animation

}


//these globals will eventually need to go in a Game module
var $GameView;
var you;
var advanceSpeed = 0;
var levelSceneWidth = 1000;
var playerMoveableWidth = 200;

var gameLoopTimer = null;

var stageArr = new Array();

$(document).ready(function() {

//cache important objects
	$GameView = $('#GameViewPort');
	you = new You();
	you.$you = $('#you');
	you.weapon.$weapon = $('#weapon1');

//load level - this is hard coded js/html now, but hopefully levels can be json objects in the future
	stageArr.push(new Stage('.stage1', 1));
	stageArr.push(new Stage('.stage2', 2));
	stageArr.push(new Stage('.stage3', 3));
	
	$('.stage1-scenes .scene').appendTo('.stage1');
	$('.stage2-scenes .scene').appendTo('.stage2');
	$('.stage3-scenes .scene').appendTo('.stage3');
	
	for(i in stageArr)
		stageArr[i].$stage.width( stageArr[i].$stage.find('li').length * levelSceneWidth + 'px' );
	
//start game loop
	gameLoop();

//start animations
	oscillateObject(1, 50, you.weapon.$weapon);
	oscillateObject(1, 150, $('.stage1 .enemy'));
	oscillateObject(3, 150, $('.stage2 .enemy'));
	oscillateObject(2, 150, $('.stage3 .enemy'));

});


//LEVEL consists in uls of a certain length populated with enemies, powerups and obscicles
//each STAGE of the LEVEL can move at different speeds
//the STAGE gets moved left in the gameLoop until it makes it to the end
//if YOU hit obscicles or enemies, YOU die
function gameLoop() {

//check hitboxes
	for(i in stageArr)
		if(hitDetection(stageArr[i]))
			return; //if there is a hit (currently) end game
	
//process message que
	//update position of you - This can probably be updated only on the basis of user input
	you.top    = you.$you.position().top;
	you.bottom = you.top + you.$you.height();
	you.left   = you.$you.position().left;
	you.right  = you.left + you.$you.width();
	// . . .
	
//advance stage (move it left)
	for(i in stageArr)
		stageArr[i].$stage.css('left', stageArr[i].$stage.position().left - stageArr[i].stageSpeed + 'px');
	
//see if game is over
	for(i in stageArr)
		if( (stageArr[i].$stage.position().left * -1) >= stageArr[i].$stage.width()-100 )
			return;
			
	gameLoopTimer = setTimeout( function() { gameLoop(); } , advanceSpeed);
};

//This function detects if the player has encountered any object in the scene
//ToDo: This should also detect if the player's weapon has been hit
//ToDo: Differentiate between power-ups and enemies
function hitDetection(stage) {

	var stageLeft = stage.$stage.position().left;
	
	//What part is visible?
	var curScene = Math.floor( Math.abs(stageLeft) / levelSceneWidth  )+1;
	
	//This tells us the offset of the current scene relative to the Game View Port
	var sceneLeft = Math.abs(stageLeft) - (levelSceneWidth * (curScene - 1));
	
	//this is the left boundary of things we are interested in hitboxes for
	var hitBoundryLeft = 0;//Math.abs((stageLeft) % levelSceneWidth);
	//this is the right boundary of things we are interested in hitboxes for
	var hitBoundryRight = hitBoundryLeft + playerMoveableWidth;
	
	//If a new scene has entered, cache the objects in it for performance
	if(curScene != stage.curScene) {
		stage.curScene = curScene;
		stage.propsArr = new Array();
		stage.$stage.find('.scene'+ curScene + ' .enemy').each(function() { stage.propsArr.push($(this)); });
	}
	
	for(i in stage.propsArr) {
		if(stage.propsArr[i].position().left - sceneLeft < hitBoundryRight &&
		   (stage.propsArr[i].position().left + stage.propsArr[i].width()) - sceneLeft > hitBoundryLeft  ) {
			
			//in hit area
			var oTop = stage.propsArr[i].position().top;
			var oBottom = oTop + stage.propsArr[i].height();
			var oLeft = stage.propsArr[i].position().left - sceneLeft;
			var oRight = oLeft + stage.propsArr[i].width();
			
			//Check to see if you have been killed
			if(
				(
					(oLeft  >= you.left  && oLeft   <= you.right) ||
					(oRight >= you.left  && oRight  <= you.right)
				) 
				&&
				(
					(oTop    <= you.bottom && oTop    >= you.top) ||
					(oBottom <= you.bottom && oBottom >= you.top)
				)
			   ) 
				return true;
			
			//Calculate hitbox of weapon
			//. . .
			
			//check to see if anything has hit your weapon
			//. . .
		}
	}
}

//Call this function to end the game loop
function endGame() {
	clearTimeout(gameLoopTimer);
}

//Animation Functions
function oscillateObject(spd, amp, $ele) {
	moveUp(spd, amp, $ele);
}

function moveUp(spd, amp, $ele) {
	$($ele).animate({ top : '-='+(amp)+'px' }, spd*1000, function() { 
		moveDown(spd, amp, $ele); 
	});
}
function moveDown(spd, amp, $ele) {
	$($ele).animate({ top : '+='+(amp)+'px' }, spd*1000, function() { 
		moveUp(spd, amp, $ele); 
	});
}