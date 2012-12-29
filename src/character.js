define(['teeth/selector','teeth/controller','core/sprite','core/animator','data/data-AI'],
function($,controller,Fsprite,Fanimator,data_AI)
{

/** @constructor
	@param cha data object
	@param role the role this character plays, can be 'hero' or 'ghost'
	@param control who controls this character, can be 'AI' or 'human'
 */
function character(cha,role,control,manager)
{
	this.dat=cha;
	this.role=role;
	this.control=control;
	this.manager=manager;
	this.map=manager.level;
	this.state='';
	this.state_timeout=0;
	this.counter;
	this.ani_counter=0;

	//mechanical properties
	this.x=0; this.y=0; //position on map
	this.sx=0; this.sy=0; //pixel position on stage
	this.vx=0; this.vy=0; //velocity; can be -1,0,1
	this.nx=0; this.ny=0; //the 'next velocity' when I arrive at a position where I can turn
	this.speed=0;
	this.keyframe_rate;

	this.sp; //F.sprite object
	this.ani; //F.animator object
	this.controller; //keyboard controller
	this.AI; //AI data object
	this.opp; //list of opponents
	this.friend; //list of friends
	this.pending_signal=[];

	var sp_config=
	{
		canvas: $('stage'), //canvas *DOM node*
		wh: {x:cha.sprite.blockw, y:cha.sprite.blockh}, //width and height
		img: {
			'r':cha.sprite.img,
			'l':cha.sprite.img_mirror
		}
	}
	var ani_config=
	{
		x:0, y:0,     //top left margin of the frames
		w:cha.sprite.blockw, h:cha.sprite.blockh, //width, height of a frame
		gx:cha.sprite.col, gy:cha.sprite.row,   //define a gx*gy grid of frames
		ani: null,   //use custom frame sequence
		tar: null    //target F.sprite
	}
	this.sp=new Fsprite(sp_config);
	this.sp.switch_img('r');
	this.sp.set_z(role==='hero'?10:30);
	ani_config.tar=this.sp;
	this.ani=new Fanimator(ani_config);

	this.set_state('wander');
	//if( this.role==='hero')
	//	this.set_state('chase');

	if( control==='human')
	{
		var This = this;
		controller.child=[{
			key: function(key,down)
			{
				if(down)
				{
					switch (key)
					{
						case 'up':
							This.ny=-1;
						break;
					
						case 'down':
							This.ny=+1;
						break;
					
						case 'left':
							This.nx=-1;
						break;
					
						case 'right':
							This.nx=+1;
						break;
					}
				}
			}
		}];
	}
	else if( control==='AI')
	{
		this.AI=data_AI.normal;
	}
}

character.prototype.game_start=function()
{
	this.opp = this.manager.opponents(this.role);
	this.friend = this.manager.friends(this.role,this);
}

character.prototype.set_state=function(statename)
{
	if( this.state===statename)
		return;
	this.state=statename;
	this.ani.config.ani=this.dat.action[statename];
	this.ani.I=-1; //restart the animation sequence
	this.ani.next_frame();

	if(!this.dat.properties[statename+'_speed'])
	if( statename.indexOf('transform_to_')===0)
		statename = statename.substring('transform_to_'.length);

	if( this.dat.properties[statename+'_speed'])
		this.speed = this.dat.properties[statename+'_speed'];
	else
		this.speed = this.dat.properties['default_speed'];

	//the number of cycle it takes to the next block
	this.keyframe_rate = this.dat.sprite.blockw/this.speed;
	this.counter=0;
}

character.prototype.transform_to_state=function(statename)
{
	//will go through a 'transforming' state if one exists
	if( this.dat.action['transform_to_'+statename])
	{
		this.set_state('transform_to_'+statename);
	}
	else
	{
		this.set_state(statename);
	}
}

character.prototype.frame=function()
{
	this.sx += this.speed*this.vx;
	this.sy += this.speed*this.vy;
	this.x = this.where().x;
	this.y = this.where().y;
	this.update_xy();
	//
	if( this.counter===this.keyframe_rate-1)
	{
		this.keyframe();
		this.counter=0;
	}
	else
		this.counter++;
	//
	if( this.ani_counter===this.dat.animation_framerate_inv-1)
	{
		if( this.ani.next_frame() === this.ani.config.ani.length-1)
		{	//animation ends
			if( this.state.indexOf('transform_to_')===0)
			{	//if I am in a transforming state, end the transforming
				this.signal('end_'+this.state);
				this.ani.I--; //keep the animation at the same frame
			}
		}
		this.ani_counter=0;
	}
	else
		this.ani_counter++;
	//
	if( this.role==='hero')
	{
		for( var i=0; i<this.opp.length; i++)
		{
			var dist= Math.sqrt( (this.sx-this.opp[i].sx)*(this.sx-this.opp[i].sx)+
							(this.sy-this.opp[i].sy)*(this.sy-this.opp[i].sy));
			if( dist < this.dat.sprite.blockw/2)
			{
				if( this.state==='chase' ||
					this.state==='transform_to_chase')
				{	//I ate a ghost!
					if( this.opp[i].state!=='transform_to_be_eaten' &&
						this.opp[i].state!=='be_eaten')
					{
						this.opp[i].signal('I ate you!');
						this.manager.signal('hero','ate a ghost');
					}
				}
				else
				{	//I am being eaten
					this.signal('be eaten');
					break;
				}
			}
		}
	}
}

character.prototype.keyframe=function() //when I reach another point on map
{
	this.set_map_xy(this.where()); //eliminate fractional error

	this.consume_signal();

	this.state_timeout--;

	if( this.control==='AI')
		this.decide();

	if( this.role==='hero')
	{
		if( this.state_timeout === 0)
		{
			switch (this.state)
			{
				case 'chase':
					for( var i=0; i<this.opp.length; i++)
						this.opp[i].signal('return to normal');
				case 'be_chase':
					this.transform_to_state('wander');
				break;
			}
		}

		if( this.state.indexOf('be_eaten')===-1)
		{
			var result = this.map.consume(this.where());
			if( result==='treasure')
			{
				if( this.state === 'wander' ||
					this.state === 'be_chase' )
				{
					this.state_timeout = this.dat.chase_timeout;
					this.transform_to_state('chase');
					for( var i=0; i<this.opp.length; i++)
						this.opp[i].signal('I want you!');
				}
			}
		}
	}
	else if( this.role==='ghost')
	{
		var aware_of = distance(this.opp[0],this) < this.AI.alert_distance;
		if( aware_of)
		{
			if( this.state==='wander' || this.state==='chase')
				this.opp[0].signal('aware of you!');
		}

		switch (this.state)
		{
			case 'wander':
			if( aware_of)
				this.transform_to_state('chase');
			break;

			case 'chase':
			if( !aware_of)
			{
				//lose your trace
				this.vx=-this.vx;
				this.vy=-this.vy;
				this.transform_to_state('wander');
			}
			break;
		}
		
		if( this.state_timeout === 0)
		{
			if( this.state==='be_eaten')
				this.transform_to_state('wander');
		}
	}

	//handle movements
	if( this.nx && !this.is_block_ahead({x:this.nx, y:0}))
	{	//if that direction is not a wall
		this.vx=this.nx;
		this.vy=0;
		this.nx=0;
	}
	else if( this.ny && !this.is_block_ahead({x:0, y:this.ny}))
	{
		this.vx=0;
		this.vy=this.ny;
		this.ny=0;
	}

	if( this.is_block_ahead({x:this.vx, y:0}))
		this.vx=0;
	if( this.is_block_ahead({x:0, y:this.vy}))
		this.vy=0;
	if( this.is_block_ahead({x:0, y:0}))
		console.log('error! character stuck in a block');

	//horizontal mirror of sprites
	if( this.vx>=0 && this.ani.horimirror)
	{
		this.ani.horimirror=false;
		this.sp.switch_img('r');
		this.ani.next_frame();
	}
	else if( this.vx<0 && !this.ani.horimirror)
	{
		this.ani.horimirror=true;
		this.sp.switch_img('l');
		this.ani.next_frame();
	}

	//helpers
	function distance(A,B)
	{
		return Math.sqrt((A.x-B.x)*(A.x-B.x)+(A.y-B.y)*(A.y-B.y));
	}
}

//serves as communication between players
//and a buffered event system (because signals can only be comsumed in keyframes)
character.prototype.signal=function(signal)
{
	//pend the signal to be consumed in keyframe
	this.pending_signal.push(signal);
}

character.prototype.consume_signal=function()
{
	for( var i=0; i<this.pending_signal.length; i++)
	{
		if( this.role==='hero')
		{
			switch (this.pending_signal[i])
			{
				case 'aware of you!':
					if( this.state === 'wander')
						this.transform_to_state('be_chase');
					if( this.state === 'wander' || this.state==='be_chase')
						this.state_timeout=10;
				break;

				case 'be eaten':
					if( this.state!=='transform_to_be_eaten' &&
						this.state!=='be_eaten')
					{
						this.transform_to_state('be_eaten');
						this.manager.signal('hero','be eaten');
					}
				break;

				case 'respawn':
					this.transform_to_state('wander');
				break;
			}
		}

		else if( this.role==='ghost')
		{
			switch (this.pending_signal[i])
			{
				case 'I want you!':
					if( this.state==='wander' || this.state==='chase')
						this.transform_to_state('be_chase');
				break;
				case 'I ate you!':
					this.state_timeout = this.dat.be_eaten_timeout;
					this.transform_to_state('be_eaten');
					var left=0;
					for ( var j=0; j<this.friend.length; j++)
						if( this.friend[j].state!=='transform_to_be_eaten' &&
							this.friend[j].state!=='be_eaten')
							left++;
					if( left===0)
						this.manager.signal('hero','ate all ghost');
				break;
				case 'return to normal':
					if( this.state==='be_chase')
						this.transform_to_state('wander');
				break;
			}
		}

		if( this.pending_signal[i].indexOf('end_transform_to_')===0)
		{
			var target = this.pending_signal[i].substring('end_transform_to_'.length);
			this.set_state(target);
		}
	}
	this.pending_signal=[];
}

character.prototype.update_xy=function()
{
	this.sp.set_xy({
		x:this.sx,
		y:this.sy
	});
}

character.prototype.set_xy=function(P)
{
	this.sx=P.x;
	this.sy=P.y;
	this.sp.set_xy(P);
}

character.prototype.set_map_xy=function(G)
{
	this.x=G.x;
	this.y=G.y;
	this.set_xy({
		x:G.x*this.dat.sprite.blockw,
		y:G.y*this.dat.sprite.blockh
	});
}

character.prototype.where=function() //return where am I on the map
{
	return {
		x: Math.round(this.sx/this.dat.sprite.blockw),
		y: Math.round(this.sy/this.dat.sprite.blockh)
	}
}

character.prototype.is_block=function(P) //return whether a point on map is an obstacle
{
	if( !this.map.at(P)) return false;
	return this.map.at(P).type==='block';
}

character.prototype.is_block_ahead=function(V) //return whether a point ahead is an obstacle
{
	return this.is_block({x:this.x+V.x, y:this.y+V.y});
}

character.prototype.is_friend_ahead_blocking=function(V,dir)
{
	for( var i=0; i<this.friend.length; i++)
	{
		var F=this.friend[i];
		if( this.x+V.x===F.x && this.y+V.y===F.y)
		//there is a friend ahead
		{
			if( !dir)
			{
				if( !F.vx && !F.vy)
				//return true if he is not moving
					return true;
			}
			else
			{
				if( (dir.x===-F.vx && F.vx) ||
					(dir.y===-F.vy && F.vy) )
				//return true if he is making head-on collision with me
					return true;
			}
		}
	}
	return false;
}

character.prototype.decide=function()
{
	var all_dir = [{x:0,y:-1},{x:0,y:1},{x:-1,y:0},{x:1,y:0}];
	var poss=[]; //possible paths
	var back=inverse({x:this.vx,y:this.vy});

	for( var I in all_dir)
	{	//for each direction
		var D=all_dir[I];
		if( (!equal(back,D) || (this.role==='hero' && this.state==='be_chase')) &&
			!this.is_block_ahead(D) &&
			!this.is_friend_ahead_blocking(D,D) )
		//if there is no block ahead
		//and there is also no friend ahead of me
		//if being chased hero can go backwards, ghost cannot
		{
			poss.push(D);
		}
	}

	var decision={x:0,y:0};

	//decision making
	if( poss.length===0)
	{
		//I am trapped in a dead end!
		decision = back;
		if( this.is_block_ahead(back))
			; //I am completely trapped
	}
	else if( this.state==='wander')
	{
		if( poss.length>1)
			//wander is to patrol back and,,
			decision = back;
		else 
		{	//,,and forth
			decision.x = this.vx;
			decision.y = this.vy;
		}
		if( Math.random()<this.AI.out_of_wander || equal(decision,{x:0,y:0}))
		{	//with a small probability to walk off the patrol path
			var dice = Math.floor(Math.random()*poss.length);
			decision = poss[dice]; //choose a path by random
		}
	}
	else if( (this.role==='ghost' && this.state==='chase') ||
			(this.role==='hero' && this.state==='be_chase') ||
			(this.role==='hero' && this.state==='be_eaten') )
	{
		//measure the distance to the closest opponent for taking each possible path
		  //and take the best path (max if being chased, min if chasing)
		var This=this;
		var closest = min_max( This.opp, //search in this array
			function (R) { return distance( This, R); }, //the ranker function
			false); //minimum
		var best = min_max( poss,
			function (R) {
				return distance(add(R,This), This.opp[closest])+(equal(back,R)?-1:0);
				//if the path is going backward, add penalty
			},
			this.state==='be_chase'); //take the max if being chased
		decision = poss[best];
	}
	else if( (this.role==='ghost' && this.state==='be_chase') ||
			(this.role==='ghost' && this.state==='be_eaten') ||
			(this.role==='hero' && this.state==='chase') )
	{
		//just choose a path by random
		var dice = Math.floor(Math.random()*poss.length);
		decision = poss[dice];
	}
	if( this.is_friend_ahead_blocking({x:0,y:0},inverse(decision)) )
	{
		//if I am stepping on a friend and he is planning to move with same direction as me
		//	I will stop to let him do so
		decision={x:0,y:0};
	}

	this.nx = decision.x;
	this.ny = decision.y;

	function add(A,B)
	{
		return {x:A.x+B.x, y:A.y+B.y};
	}
	function distance(A,B)
	{
		return Math.sqrt((A.x-B.x)*(A.x-B.x)+(A.y-B.y)*(A.y-B.y));
	}
	function dir(V)
	{
		if( V.x>0 && V.y===0)
			return 'right';
		else if( V.x<0 && V.y===0)
			return 'left';
		else if( V.x===0 && V.y<0)
			return 'up';
		else if( V.x===0 && V.y>0)
			return 'down';
	}
	function vec(D)
	{
		switch (x)
		{
			case 'up': return {x:0,y:-1};
			case 'down': return {x:0,y:1};
			case 'left': return {x:-1,y:0};
			case 'right': return {x:1,y:0};
		}
	}
	function inverse(V)
	{
		return {x:-V.x, y:-V.y};
	}
	function equal(A,B)
	{
		return A.x===B.x && A.y===B.y;
	}
	function min_max(arr,ranker,max)
	{
		var index=0;
		var rank=ranker(arr[0]);
		for( var i=0; i<arr.length; i++)
		{
			var irank = ranker(arr[i]);
			if( irank > rank === max)
			{
				index=i;
				rank=irank;
			}
		}
		return index;
	}
}

return character;
});
