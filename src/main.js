//game loader

requirejs.config({
	baseUrl: '../../',
	paths: {
		'teeth':'teeth/src',
		'data':'teeth/src'
	}
});

requirejs(['teeth/main-game'],
function(main_game)
{
});
