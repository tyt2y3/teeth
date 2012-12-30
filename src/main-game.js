//manages the course of the game, proceeds to the next level

define(['teeth/selector','teeth/game','data/data-levels'],
function($,Game,data_levels)
{
	var game={ _delete:function(){} };
	var current_level;

	function restart()
	{
		current_level=0;
		$('startpage').style.display='';
		$('gametext').style.display='none';
		game._delete();
		$('!clear-cache');
		game = new Game('demo',data_levels,current_level,callback);
	}

	restart();

	function next_level()
	{
		if( current_level+1 < data_levels.levels.length)
		{
			current_level++;
			$('startpage').style.display='none';
			$('gametext').style.display='none';
			game._delete();
			$('!clear-cache');
			game = new Game('play',data_levels,current_level,callback);
		}
		else
		{
			$('gametext').style.display='';
			$('gametext').innerHTML='Game complete!<br><span style="font-size:30px;">Please <a style="color:#FFF;" href="https://github.com/tyt2y3/teeth#teeth" target="_blank">design</a> levels and sprites for this game.</span>';
			$('infotext').innerHTML= 'restarting in 15 sec...';
			setTimeout(restart,15000);
		}
	}

	$('start').onclick=function()
	{
		current_level=0;
		next_level();
	}

	function callback(signal)
	{
		switch (signal)
		{
			case 'gameover':
				$('gametext').style.display='';
				$('gametext').innerHTML='Gameover';
				$('infotext').innerHTML= 'restarting in 5 sec...';
				setTimeout(restart,5000);
			break;

			case 'level clear':
				$('gametext').style.display='';
				$('gametext').innerHTML= 'Level Clear!';
				$('infotext').innerHTML= 'starting next level in 5 sec...';
				setTimeout(next_level,5000);
			break;
		}
	}
	
	return game;
});
