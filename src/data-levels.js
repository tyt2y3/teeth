//this is this JSON file defining levels
define({
	name:'level pack 1',
	sprite:
	{
		img:'sprites.png',
		col:10,
		row:10,
		blockw:35,
		blockh:35
	},
	blocks:
	{
		/**here it defines the building blocks of the map
			each block has:
			-code. to be identified on the map
			-name. it is optional for blocks without special function
			-sprite. the index of the sprite in the sprite image.
				note that the index starts counting 0 in the top-left corner
			-sprites. only specific blocks can have this.
				it defines a sequence of animation
		*/

		' ': { //floor must be ' '
			name:'floor', //!program keyword
			sprite: 99
		},
		'X': {
			name:'hero born point' //!program keyword
		},
		'Z': {
			name:'ghost born point' //!program keyword
		},
		'%': {
			name:'treasure', //!program keyword
			sprite: 12
		},
		'.': { //pellet must be '.'
			name:'pellet', //!program keyword
			sprites: [30,31,32] //this is the animation sequence after the pellet has been consumed
		},

		//below are custom blocks, just give them any code and names
		'|': { //any code
			name:'vertical', //any name
			sprite: 83
		},
		'^': {
			name:'vertical upper end',
			sprite: 73
		},
		'v': {
			name:'vertical lower end',
			sprite: 93
		},
		'-': {
			name:'horizontal',
			sprite: 91
		},
		'<': {
			name:'horizontal left end',
			sprite: 90
		},
		'>': {
			name:'horizontal right end',
			sprite: 92
		},
		'r': {
			name:'south-east junction',
			sprite: 70
		},
		'L': {
			name:'north-east junction',
			sprite: 80
		},
		'7': {
			name:'south-west junction',
			sprite: 71
		},
		'J': {
			name:'north-west junction',
			sprite: 81
		},
		'=': {
			name:'blank',
			sprite: 99
		}
	},
	levels:
	[
		{
			//level0 - the demo level
			col:11,
			row:9,
			bgcolor:'#B0B0B0',
			lives: 3,
			hero_respawn_time: 4, //in sec
			ghost_respawn_time: 20, //in key frames
			chase_timeout: 20, //in key frames; time that the hero can chase and eat the ghosts
			map:
			[
				'r','-','-','-','-','-','-','-','-','-','7',
				'|',' ',' ','X','%',' ',' ','Z','Z','Z','|',
				'|',' ','<','-','-','-','-','-','7',' ','|',
				'|',' ',' ',' ',' ',' ',' ',' ','|',' ','|',
				'|','-','-','-','-','-','>',' ','|',' ','|',
				'|',' ',' ',' ',' ',' ',' ',' ','|',' ','|',
				'|',' ','<','-','-','-','-','-','J',' ','|',
				'|',' ',' ',' ',' ',' ',' ',' ',' ',' ','|',
				'L','-','-','-','-','-','-','-','-','-','J'
			]
		},

		{
			//level1
			col:11,
			row:11,
			bgcolor:'#B0B0B0',
			lives: 2,
			hero_respawn_time: 4,
			ghost_respawn_time: 20,
			chase_timeout: 30,
			map:
			[
				'r','-','-','-','-','-','-','-','-','-','7',
				'|',' ',' ',' ',' ',' ',' ',' ',' ',' ','|',
				'|',' ','r','-','-','>',' ','<','7',' ','|',
				'|',' ','|',' ',' ',' ',' ',' ','|',' ','|',
				'|',' ','v',' ','r','Z','7',' ','v',' ','|',
				'|',' ',' ',' ','|','%','|',' ',' ',' ','|',
				'|',' ','^',' ','|','-','J',' ','^',' ','|',
				'|',' ','|',' ','|',' ',' ',' ','|',' ','|',
				'|',' ','|',' ','v',' ','^',' ','|',' ','|',
				'|','X','|',' ',' ',' ','|',' ','|',' ','|',
				'L','-','-','-','-','-','-','-','-','-','J'
			]
		},

		{
			//level2
			col:17,
			row:17,
			bgcolor:'#B0B0B0',
			lives: 6,
			hero_respawn_time: 4,
			ghost_respawn_time: 20,
			chase_timeout: 30,
			map:
			[
				'r','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','7',
				'|','X',' ',' ',' ','|',' ','|',' ',' ','v',' ',' ','Z',' ',' ','|',
				'|','-','-','7',' ','|',' ','|',' ',' ',' ',' ','^',' ','^',' ','|',
				'|',' ',' ','|',' ','v',' ','|',' ','^',' ',' ','|',' ','v',' ','|',
				'|',' ',' ','|',' ',' ',' ','|',' ','v',' ','<','J',' ',' ',' ','|',
				'|','>',' ','v',' ','^',' ','|',' ',' ',' ',' ',' ',' ','>',' ','|',
				'|','%',' ',' ',' ','|',' ','L','>',' ','^',' ',' ','r',' ',' ','|',
				'|','>',' ','^',' ','v',' ',' ',' ',' ','v',' ','r',' ',' ',' ','|',
				'|',' ',' ','|',' ',' ',' ',' ',' ',' ',' ','r',' ','%','<','-','J',
				'|',' ','<','J',' ','<','>','%',' ','Z','r',' ',' ','^','=','=','=',
				'|','Z',' ',' ',' ',' ',' ',' ','r','-',' ',' ',' ','|','=','=','=',
				'L','-','7',' ','^',' ',' ',' ','v',' ',' ','^',' ','|','=','=','=',
				'=','=','|',' ','|',' ',' ','r',' ',' ','r','|',' ','|','=','=','=',
				'=','=','|',' ','|',' ','r',' ',' ','r','=','|',' ','|','=','=','=',
				'=','=','|',' ','v',' ',' ',' ',' ','L','-','J',' ','|','=','=','=',
				'=','=','|',' ',' ',' ',' ','-',' ',' ',' ',' ',' ','|','=','=','=',
				'=','=','L','-','-','-','-','-','-','-','-','L','-','J','=','=','='
			]
		},

		{
			//level3
			col:19,
			row:14,
			bgcolor:'#B0B0B0',
			lives: 13,
			hero_respawn_time: 4,
			ghost_respawn_time: 30,
			chase_timeout: 120,
			map:
			[
				'r','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','7',
				'|',' ',' ',' ',' ','X',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','|',
				'|',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','|',
				'|',' ','<','-','-','7',' ','r','-','7',' ','^',' ','<','-','-','7',' ','|',
				'|',' ',' ',' ',' ','|',' ','|',' ','|',' ','|',' ',' ',' ',' ','|','Z','|',
				'|','Z',' ',' ',' ','|',' ','|',' ','|',' ','|',' ',' ',' ',' ','|',' ','|',
				'|',' ','r','-','-','J',' ','|',' ','|',' ','|',' ',' ','<','-','|',' ','|',
				'|',' ','|',' ',' ',' ',' ',' ','%',' ',' ','|',' ',' ',' ',' ','|',' ','|',
				'|',' ','|',' ',' ',' ',' ','|',' ','|',' ','|',' ',' ',' ',' ','|',' ','|',
				'|',' ','|',' ',' ','Z',' ','|',' ','|',' ','|',' ',' ',' ',' ','|',' ','|',
				'|',' ','L','-','-','>',' ','L','-','J',' ','v',' ','<','-','-','J',' ','|',
				'|',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','Z',' ',' ',' ',' ',' ',' ','|',
				'|',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','|',
				'L','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','J'
			]
		}
	]
});
