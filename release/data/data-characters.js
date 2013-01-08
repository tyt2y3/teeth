//this is JS file defining sprites
define({
	list:
	[
		{
			name: '腦魔',
			sprite:
			{
				img:'sprites.png',
				img_mirror:'sprites_mirror.png',
				col:10, //no. of column
				row:10,
				blockw:35, //size of sprite in pixels
				blockh:35
			},
			action:
			{
				/**following are animation sequences for each state
					each sequence is an array of sprite indices.
					note that the sprite index starts counting 0 in the top-left corner
				*/
				wander:[16,17,18,16,16,16,16,16,16,16,16],
				transform_to_chase:[4,5,5,6,7],
				chase:[8],
				be_chase:[2,3],
				transform_to_be_eaten:[13,13,13,13],
				be_eaten:[14]
			},
			animation_framerate_inv: 3, //larger is slower; animation will be updated once per X frames
			properties:
			{
				/**speed must be a dividing fraction of the block width (an alignment issue)
					(block width must be 除得盡 by speed)
					follow the format 'state name'+'_'+'speed'
					it is optional for states to have a specified speed.
					if speed is not specified for a state,
					  the engine will use default_speed instead
				*/
				default_speed: 35/12,
				be_chase_speed: 35/7,
				chase_speed: 35/9,
				be_eaten_speed: 35/6
			}
		},
		{
			name: '格格',
			sprite:
			{
				img:'sprites.png',
				img_mirror:'sprites_mirror.png',
				col:10,
				row:10,
				blockw:35,
				blockh:35
			},
			action:
			{
				wander:[1,1,1,1,1,20,20,20,20,20,20],
				chase:[0,1],
				be_chase:[10,11],
				be_eaten:[21]
			},
			animation_framerate_inv: 2,
			properties:
			{
				default_speed: 35/7,
				wander_speed: 35/16,
				chase_speed: 35/8,
				be_chase_speed: 35/6,
				be_eaten_speed: 35/40
			}
		}
	]
});
