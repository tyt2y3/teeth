//`game` is a playable level of the game

define([
'teeth/selector', 'teeth/level', 'teeth/character', 'data/data-characters'
],
function(
$, Level, Character, data_characters
)
{
	function game(mode,data_levels,sublevel,callback)
	{
		//create the DOM node
		create_at( $('game'), 'div', 'stage');
		function create_at(parent, tag, id)
		{
			var E = document.createElement(tag);
			parent.insertBefore(E, parent.firstChild);
			if( id)
				E.id = id;
			return E;
		}

		//the game manager
		var manager=
		{
			opponents: function(myrole) //return an array of opponents
			{
				var result=[];
				for( var i in chars)
					if( chars[i].role!==myrole)
						result.push(chars[i]);
				return result;
			},
			friends: function(myrole,myself) //return an array of friends
			{
				var result=[];
				for( var i in chars)
					if( chars[i].role===myrole && chars[i]!==myself)
						result.push(chars[i]);
				return result;
			},
			level: null,
			signal: function(caller,signal)
			{
				switch (caller)
				{
					case 'level':
					switch (signal)
					{
						case 'treasure shown':
						$('infotext').innerHTML= 'lick the foot';
						break;

						case 'treasure got':
						$('infotext').innerHTML= 'clear all 牙 before you get back to normal';
						break;
					}
					break;

					case 'hero':
					switch (signal)
					{
						case 'ate a ghost':
							$('infotext').innerHTML= 'good!';
						break;

						case 'ate all ghost':
							if( !level_cleared)
							{
								level_cleared=true;
								callback('level clear');
							}
						break;

						case 'be eaten':
							hero.life--;
							if( hero.life>0)
							{
								$('infotext').innerHTML=
								'too bad. you have '+hero.life+' lives left.<br>'+
								'respawning in '+map.hero_respawn_time+' sec...';
								timeout = setTimeout( function() {
									hero.signal('respawn');
									$('infotext').innerHTML= 'try again.';
								}, map.hero_respawn_time*1000);
							}
							else
							{
								callback('gameover');
							}
						break;
					}
					break;
				}
			}
		};

		//create level and characters
		var map = data_levels.levels[sublevel];
		var level = manager.level = new Level(data_levels,sublevel,manager);
		var chars = [];
		var hero; this.hero;
		var level_cleared=false;
		for( var i=0; i<level.charpoint.length; i++)
		{
			var cha,control;
			var role=level.charpoint[i].role;
			if( role==='hero')
			{
				cha = data_characters.list[0];
				if( mode==='demo')
					control = 'AI';
				else
					control = 'human';
			}
			else if( role==='ghost')
			{
				cha = data_characters.list[1];
				control = 'AI';
			}
			chars[i] = new Character(cha, role, control, manager);
			chars[i].set_map_xy(level.charpoint[i]);
			if( role==='hero')
			{
				this.hero=hero=chars[i];
				hero.life=map.lives;
				hero.dat.chase_timeout=map.chase_timeout;
			}
			else if( role==='ghost')
			{	chars[i].dat.be_eaten_timeout=map.ghost_respawn_time;
			}
		}

		//start the game
		for( var i in chars)
			chars[i].game_start();
		level.game_start();
		$('infotext').innerHTML='collect all pellets';
		var timer=setInterval(frame,1000/35); //targeted at ~30fps
		var timeout;
		function frame()
		{
			for( var i in chars)
				chars[i].frame();
			level.frame();

			//calculate fps
			var ot=this.time;
			this.time=new Date().getTime();
			var diff=this.time-ot;
			$('fps').value = Math.round(1000/diff)+'fps';
		}

		//destructor to clear all DOM nodes and timers
		this._delete=function()
		{
			if( timeout)
				clearTimeout(timeout);
			clearInterval(timer);
			$('stage').parentNode.removeChild($('stage'));
		}
	}

	return game;
});
