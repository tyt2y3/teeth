//the game loader used in release

requirejs.config({
	baseUrl: './',
	paths: {
		'teeth':'',
		'data':'data'
	}
});

requirejs(['teeth/selector','teeth/main-game'],
function($, main_game)
{
	$('fps').style.display='none';
});
