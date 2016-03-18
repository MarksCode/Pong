var main = function(){
	
//********************//
// Random variables   //
//********************//	
	var didStart = false;
	isCollision = false;
	var paddleL = $("#paddleL"); // Left paddle
	var paddleR = $("#paddleR"); // Right paddle
	var ball = $("#ball"); // Ball
	var arena = $("#arena"); // Playing field
	var paddleHeight = paddleL.height()/3; // Thirds of paddle height for speed increments
	var ballHeight = ball.height();
	var toServe = true;   // If true, left side serving
	var keysPressed = {   // Keeps track of keys being pressed
		w: false,
		s: false,
		up: false,
		down: false
	};	
	var ballSpeed = {     // Keeps track of balls velocity 
		horizontal: 10,
		top: 10
	}
	reset();               // Moves ball back to start position	
	
	jQuery.fn.cssNumber = function(prop){     // For getting css
		var v = parseInt(this.css(prop), 10);
		return isNaN(v) ? 0 : v;
	};
	
	
//****************************//
// Records keys being pressed //
//****************************//
	$(document).keydown(function(e){
		if (e.which == 32) // Spacebar pressed
			if (!didStart)
				didStart = true; // Start the game!
			else didStart = false;

		switch(e.which){
			case 87: 
				keysPressed.w = true; // w key pressed
				break;
			case 83:
				keysPressed.s = true; // s key pressed
				break;
			case 38:
				keysPressed.up = true; // up arrow pressed
				break;
			case 40:
				keysPressed.down = true; // down arrow pressed
				break
		};
	});

//****************************//
// Records keys being lifted  //
//****************************//
	$(document).keyup(function(e){
		switch(e.which){
			case 87: 
				keysPressed.w = false; // w button lifted
				break;
			case 83:
				keysPressed.s = false; // s button lifted
				break;
			case 38:
				keysPressed.up = false; // up arrow lifted
				break;
			case 40:
				keysPressed.down = false; // down arrow lifted
				break
		};
	});
	
//*********************//
// Move to next frame  //
//*********************//
	setInterval(function(){
		var leftPaddleMove = 0;
		var rightPaddleMove = 0;
		var speed = 8;	
		
		if (paddleL.position().top > arena.position().top) // If left paddle not at top
			if (keysPressed.w) leftPaddleMove -= speed;
		if (paddleL.position().top+paddleL.height() < arena.position().top + arena.height() - 15) // If left paddle not at bottom
			if (keysPressed.s) leftPaddleMove += speed;
		if (paddleR.position().top > arena.position().top) // If right paddle not at top
			if (keysPressed.up) rightPaddleMove -= speed;
		if (paddleR.position().top+paddleR.height() < arena.position().top + arena.height() - 15) // If right paddle not at bottom
			if (keysPressed.down) rightPaddleMove += speed;
		
		paddleL.css({  // Move left paddle
			top: paddleL.cssNumber('top') + leftPaddleMove + 'px'
		});
		paddleR.css({ // Move right paddle
			top: paddleR.cssNumber('top') + rightPaddleMove + 'px'
		});
		
		if (didStart){  // If game has started
			ball.css({ // Move ball
				left: ball.cssNumber('left') + ballSpeed.horizontal + 'px',
				top: ball.cssNumber('top') + ballSpeed.top + 'px'
			});
		
			collision(); // Check for collision
			if (isCollision){  // Reverse speed if collision happened
				ballSpeed.horizontal *= -1;
				isCollision = false;
			}
			if (ball.position().top <= $("#arena").position().top | ball.position().top >= $("#arena").height()-ball.height()) ballSpeed.top *= -1;  // If ball collided with top or bottom
			if (ball.position().left < -30){ // If ball out of bounds left
				reset(); 
				$("#rightScore").text(parseInt($("#rightScore").text()) + 1)
			}
			if (ball.position().left > $("#arena").width()){ // If ball out of bounds right
				reset();
				$("#leftScore").text(parseInt($("#leftScore").text()) + 1)
			}
		} else {        // Game hasn't started yet, keep ball on paddle
			if (!toServe){
				var leftPadPos = paddleL.position();
				var ballCoord = {
					top: leftPadPos.top + paddleL.height()/2 - ball.height()/2,
					left: leftPadPos.left + paddleL.width() + 2
				};
			} else {
				var rightPadPos = paddleR.position();
				var ballCoord = {
					top: rightPadPos.top + paddleR.height()/2 - ball.height()/2,
					left: rightPadPos.left - ball.width() - 2
				}
			}
			ball.css({
				top: ballCoord.top,
				left: ballCoord.left
			});
		}
	}, 20);

//*************************//
// Checks for collisions   //
//*************************//	
	function collision(){
		/* Getting current positions of paddles and ball */
		var curBallPos = ball.position(); // Balls current position
		var paddleLPos = paddleL.position(); // Left paddle's position
		var paddleRPos = paddleR.position(); // Right paddle's position
		var LHor = paddleLPos.left + paddleL.width(); // Right edge of left paddle
		var RHor = paddleRPos.left; // Left edge of right paddle
		var LTop = paddleLPos.top; // Top of left paddle
		var LBot = paddleLPos.top+paddleL.height(); // Bottom of left paddle
		var RTop = paddleRPos.top; // Top of right paddle
		var RBot = paddleRPos.top+paddleR.height(); // Bottom of right paddle
		var ballTop = curBallPos.top; // Top of ball
		var ballLeft = curBallPos.left; // Left edge of ball
		
		/* Testing for collisions with paddles, special cases if top or bottom third of paddle */
		if (ballLeft <= LHor+5 && ballLeft >= LHor-5 && ballTop >= LTop-ballHeight && ballTop <= LBot){ //left paddle
			if (ballTop < LTop+paddleHeight-ballHeight){ // Top third of left paddle hit, incrememnt speed
				if (ballSpeed.top < 0) // If ball moving upwards, increment vertical speed
					ballSpeed.top -= 2; 
				ballSpeed.horizontal +=1;
			}
			if (ballTop > LBot-paddleHeight){ // Bottom third of left paddle hit, increment speed
				if (ballSpeed.top > 0) // If ball moving downwards, increment vertical speed
					ballSpeed.top += 2;
				ballSpeed.horizontal +=1;
			}
			paddleL.addClass("flash"); // Make paddle flash
			setTimeout(function(){
				paddleL.removeClass("flash");
			}, 500);
			isCollision = true;
		}
		if (ballLeft+ballHeight <= RHor+5 && ballLeft+ballHeight >= RHor-5 && ballTop >= RTop-ballHeight && ballTop <= RBot){ //right paddle
			if (ballTop < RTop+paddleHeight-ballHeight){ // Top third of right paddle hit, increment speed
				if (ballSpeed.top < 0) // If ball moving upwards, increment vertical speed
					ballSpeed.top -= 2;
				ballSpeed.horizontal -=1;
			}
			if (ballTop > LBot-paddleHeight){ // Bottom third of right paddle hit, increment speed
				if (ballSpeed.top > 0) // If ball moving downwards, increment vertical speed
					ballSpeed.top += 2;
				ballSpeed.horizontal -=1;
			}
			paddleR.addClass("flash"); // Make paddle flash
			setTimeout(function(){
				paddleR.removeClass("flash");
			}, 500);
			isCollision = true;
		}
	}
	
//****************************//
// Resets ball position       //
//****************************//
	function reset(){
		if (toServe){ // Left to serve
			var leftPadPos = paddleL.position();
			var ballCoord = {
				top: leftPadPos.top + paddleL.height()/2 - ball.height()/2,
				left: leftPadPos.left + paddleL.width() + 2
			};
			ballSpeed.top = 10;
			ballSpeed.horizontal = 10;
			toServe = false;
		} else { // Right to serve
			var rightPadPos = paddleR.position();
			var ballCoord = {
				top: rightPadPos.top + paddleR.height()/2 - ball.height()/2,
				left: rightPadPos.left - ball.width() - 2
			}
			ballSpeed.top = 10;
			ballSpeed.horizontal = -10;
			toServe = true;
		}
		ball.css({
			top: ballCoord.top,
			left: ballCoord.left
		});
		didStart = false; // Pause game
	}
}

$(document).ready(main);