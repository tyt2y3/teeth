//a too simple level designer

requirejs.config({
	baseUrl: '../../',
	paths: {
		'teeth':'teeth/src'
	}
});

requirejs(['teeth/selector','teeth/game','teeth/data-levels'],
function($,Game,data_levels)
{
	var game={ delete:function(){} };
	var current_level;

	function restart()
	{
		var parsed_levels;
		try {
			parsed_levels = JSON.parse($('code').value);
			current_level = $('select_level').value;
			$('startpage').style.display='none';
			$('gametext').style.display='none';
			game.delete();
			$('!clear-cache');
			game = new Game('play',parsed_levels,current_level,callback);
		} catch (e) {
			alert(e);
		}
	}

	restart();

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
				$('infotext').innerHTML= 'restarting in 5 sec...';
				setTimeout(restart,5000);
			break;
		}
	}

	$('update').onclick=function()
	{
		restart();
	}
	$('template').onclick=function()
	{
		$('code').value = JSON.stringify(data_levels, null, '\t');
	}

	var store = new Persist.Store('map_designer');
	window.onbeforeunload = function()
	{
		store.set('data', $('code').value);
	}
	store.get('data',
	function(ok,value){
		if(ok && value!='')
		{
			$('code').value = value;
		}
	});
});
