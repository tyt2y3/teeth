//the game loader used in release

requirejs.config({
	baseUrl: './',
	paths: {
		'teeth':'',
		'data':'data'
	}
});

requirejs(['teeth/main-game'],
function(main_game)
{
});
