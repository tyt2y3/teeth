
define('teeth/selector',[],function()
{
	var OLIST={};
	return function (id)
	{
		if( id==='!clear-cache')
		{
			OLIST={};
			return ;
		}
		if( !OLIST[id])
			OLIST[id] = document.getElementById(id);
		return OLIST[id];
	}
});

/**	`css-built` is a version of the `css` plugin to be used after optimization.
	before optimization, the method is to load the css file by a `link` element.
	after optimization, since the content of the css file is already embedded
	into the built file into a module, the method is to inject the styles
	into the HTML doc by a `style` element.
 */

define('core/css',[],function() {
	var loaded=false;

	return {
		load: function (name, require, load, config) {
			if( !loaded)
			{
				loaded=true;
				embed_css = function (content)
				{
					var head = document.getElementsByTagName('head')[0],
						style = document.createElement('style'),
						rules = document.createTextNode(content);

					style.type = 'text/css';
					if(style.styleSheet)
						style.styleSheet.cssText = rules.nodeValue;
					else style.appendChild(rules);
					head.appendChild(style);
				}
				require(['cssout'], function(data){
					embed_css(data.content);
					load(true);
				});
			}
			else
				load(false);
		},
		pluginBuilder: './css-build'
	}
});

define("cssout", { content:
".F_sprite { position:absolute; overflow:hidden; width:10px; height:10px; } .F_sprite_img { position:absolute; } .canvas { position:relative; width:800px; /*height:577px;*/ height:300px; border:1px solid #000; } .page { position: absolute; left: 0px; top: 0px; border: 1px solid #000; z-index: 10000; } "});

/**	@fileOverview
	@description
	sprite system
	display and control sprites on page using <div> tag

	basically what set_xy does is the HTML4 way (set left, top)
	we actually have much room for performance enhancement here
	-use CSS transition (the HTML5 way) instead
	http://paulirish.com/2011/dom-html5-css3-performance/
	@example
	config=
	{
		canvas: canvas,   //canvas *DOM node*
		wh: {x:100,y:100},// width and height
		img:              //[optional] image list, can call `add_img()` later
		{
			'tag name':'image path',,,  //the first image is visible
		},
	}
 */

define('core/sprite',['core/css!core/style.css'],function() //exports a class `sprite`
{

var sp_count=0; //sprite count
/**	@class
*/
/**	no private member
	@constructor
	@param config config is one time only and should be dumped after constructor returns
*/
function sprite (config)
{
	this.ID=sp_count;
	sp_count++;

	this.el = document.createElement('div');
	this.el.setAttribute('class','F_sprite');
	this.el.id='sp'+this.ID;
	config.canvas.appendChild(this.el);

	this.img={};
	this.cur_img=null;

	this.set_wh(config.wh);
	if( config.img)
	for ( var I in config.img)
	{
		this.add_img(config.img[I], I);
	}
}
/**	@function
*/
sprite.prototype.set_wh=function(P)
{
	this.el.style.width=P.x+'px';
	this.el.style.height=P.y+'px';
}
/**	@function
*/
sprite.prototype.set_xy=function(P)
{
	this.el.style.left=P.x+'px';
	this.el.style.top=P.y+'px';
}
/**	set the css zIndex. Great! we do not need to do z-sorting manually
	@function
*/
sprite.prototype.set_z=function(z)
{
	this.el.style.zIndex=Math.round(z);
}
/**	@function
	@param imgpath
	@param name
*/
sprite.prototype.add_img=function(imgpath,name)
{
	var im = document.createElement('img');
	im.setAttribute('class','F_sprite_img');
	im.src=imgpath;
	this.el.appendChild(im);

	this.img[name]=im;
	this.switch_img(name);
	return im;
}
/**	@function
	@param name
*/
sprite.prototype.switch_img=function(name)
{
	var left,top;
	for ( var I in this.img)
	{
		if( this.img[I].style.visibility=='visible')
		{
			left=this.img[I].style.left;
			top =this.img[I].style.top;
			break;
		}
	}
	for ( var I in this.img)
	{
		if( I==name)
		{
			this.img[I].style.left=left;
			this.img[I].style.top=top;
			this.img[I].style.visibility='visible';
		}
		else
		{
			this.img[I].style.visibility='hidden';
		}
	}
	this.cur_img=name;
}
/**	remove from DOM
	@function
*/
sprite.prototype.remove=function()
{
	this.el.parentNode.removeChild(this.el);
	this.removed=true;
}
/**	if previously removed, attach back to DOM
	@function
*/
sprite.prototype.attach=function()
{
	if( this.removed)
		config.canvas.appendChild(this.el);
}
/**	hide (set display to none) without removing off DOM
	@function
*/
sprite.prototype.hide=function()
{
	this.el.style.display='none';
}
/**	show (set display to default)
	@function
*/
sprite.prototype.show=function()
{
	this.el.style.display='';
}

return sprite;

});

define('core/animator',[],function() //exports a class `animator`
{

/**	@class
	@description
	animate sprites
	samle config @example
	config=
	{
		x:0,y:0,     //top left margin of the frames
		w:100, h:100,//width, height of a frame
		gx:4,gy:4,   //define a gx*gy grid of frames
		tar:         //target F.sprite
		ani:         //animation sequence:
		   null,     //if undefined or null, loop through top left to lower right, row by row
		   [0,1,2,1,0],//use custom frame sequence
		graph:       //graph:
		   [[0,1],   //	a 2d array gx*gy sized
		    [2,3]],  //		to store custom data for each frame
		borderright: 1, //trim the right edge pixels away
		borderbottom: 1,
		borderleft: 1
		bordertop: 1,
	}
 */
/**	@constructor
	no private member
	@param config multiple animator reference to the same config
*/
function animator (config)
{
	this.config=config;
	this.target=config.tar;
	this.I=0;//current frame
	this.horimirror=false;//horizontal mirror
	if( !config.borderright)  config.borderright=0;
	if( !config.borderbottom) config.borderbottom=0;
	if( !config.borderleft)  config.borderleft=0;
	if( !config.bordertop)   config.bordertop=0;
}
/**	@function
	@description
	turn to the next frame, return the index of the frame just shown
*/
animator.prototype.next_frame=function()
{
	var c=this.config;
	this.I++;
	if (!c.ani)
	{
		if ( this.I==c.gx*c.gy)
		{
			this.I=0;
		}
		this.show_frame(this.I);
	}
	else
	{
		var fi=c.ani[this.I];
		if ( this.I>=c.ani.length || this.I<0)
		{	//repeat sequence
			this.I=0; fi=c.ani[0];
		}
		this.show_frame(fi);
	}
	return this.I;
}
/**	@function
	@description
	set to a particular frame
	@param i
*/
animator.prototype.set_frame=function(i)
{
	this.I=i;
	this.show_frame(i);
}
/**	@function
	@description
	set the horizontal mirror mode
	@param val true: mirrored, false: normal
*/
animator.prototype.hmirror=function(val)
{
	this.horimirror = val;
}
animator.prototype.show_frame=function(i)
{
	var c=this.config;
	var left,top;
	if( !this.horimirror)
	{
		left= -((i%c.gx)*c.w+c.x+c.borderleft);
		top = -((Math.floor(i/c.gx))*c.h+c.y+c.bordertop);
	}
	else
	{
		left= -((c.gx-1)*c.w-(i%c.gx)*c.w+c.borderright);
		top = -((Math.floor(i/c.gx))*c.h+c.y+c.bordertop);
	}
	this.target.set_wh({
		x:  c.w-c.borderleft-c.borderright,
		y:  c.h-c.bordertop-c.borderbottom
	});
	this.target.img[this.target.cur_img].style.left= left+'px';
	this.target.img[this.target.cur_img].style.top = top+'px';
	//may also need to set_xy to compensate the border
}
animator.prototype.get_at=function(i) //get the content of the graph at frame i
{	//by default at the current frame
	if( !i) i=this.I;
	var c=this.config;
	return c.graph[(i%c.gx)][(Math.floor(i/c.gx))];
}

/**	@function
	@description
	a helper function to constructor a set of animators
	animator set is not a class. do NOT <code>var ani = new animator_set()</code>,
	instead do <code>var ani = animator_set()</code>
	@example
	set_config=
	{
		'base': //default parameters, must be specified as base when calling animator_set(set_config,*base*)
		{
			x:0,y:0,     //top left margin of the frames
			w:L, h:L,    //width, height of a frame
			gx:4,gy:1,   //define a gx*gy grid of frames
			tar:null,    //target sprite
		},

		'standing':
		{	//change only values you want to
			x:0,y:0,     //top left margin of the frames
			gx:4,gy:1,   //define a gx*gy grid of frames
		},,,
	}
 */
animator.set=function(set_config, base)
{
	if(!set_config)
		return null;
	var A=new Object();

	for( var I in set_config)
	{
		if( base) if( I==base)
			continue;

		if( base) if( set_config[base])
		{
			for( var J in set_config[base])
				set_config[I][J] = set_config[base][J];
		}

		A[I]=new animator(set_config[I]);
	}
	return A;
}

return animator;

});

define('teeth/level',['teeth/selector','core/sprite','core/animator'],
function($,Fsprite,Fanimator)
{

function level(lev,mapi,manager) //create map `mapi` of level `lev`
{
	this.map=[];			//[ {sp,ani,type},,,]
	this.charpoint=[];		//[ {x,y,role},,,]
	this.treasure=[];
	this.pellet=
	{
		list:[],			//[ {sp,ani},,,]
		consuming:0,
		count:0
	};
	this.counter=0;
	this.manager=manager;

	var sp_config=
	{
		canvas: $('stage'), //canvas *DOM node*
		wh: {x:lev.sprite.blockw, y:lev.sprite.blockh}, //width and height
		img: {'0':lev.sprite.img}
	}
	var ani_config=
	{	//please be careful that all blocks on map are sharing the same ani_config object
		x:0, y:0,     //top left margin of the frames
		w:lev.sprite.blockw, h:lev.sprite.blockh, //width, height of a frame
		gx:lev.sprite.col, gy:lev.sprite.row,   //define a gx*gy grid of frames
		tar: null    //target F.sprite
	}
	//create the map
	var map=this.map;
	var sub=lev.levels[mapi];
	this.col=sub.col;
	this.row=sub.row;
	$('game').style.width= sub.col*lev.sprite.blockw+'px';
	$('stage').style.width= sub.col*lev.sprite.blockw+'px';
	$('stage').style.height= sub.row*lev.sprite.blockh+'px';
	$('stage').style.backgroundColor= sub.bgcolor;
	for( var i=0; i<sub.map.length; i++)
	{
		var I=sub.map[i];
		//create the map elements
		var sp=new Fsprite(sp_config);
			ani_config.tar=sp;
		var ani=new Fanimator(ani_config);
		var type='';
		var position={
			x: (i%sub.col)*lev.sprite.blockw,
			y: Math.floor(i/sub.col)*lev.sprite.blockh
		};
		switch (lev.blocks[I].name)
		{
			case 'hero born point':
			case 'ghost born point':
				this.charpoint.push({
					x:i%sub.col,
					y:Math.floor(i/sub.col),
					role: lev.blocks[I].name==='hero born point'?'hero':'ghost'
				});
			case 'treasure':
			case 'floor':
				type='floor';
				ani.set_frame(lev.blocks[' '].sprite);
			break;

			default:
				type='block';
				ani.set_frame(lev.blocks[I].sprite);
		}
		map.push({
			sp:sp,
			ani:ani,
			type:type
		});
		sp.set_xy(position);
		sp.set_z(0);

		if( lev.blocks[I].name==='treasure')
		{
			//create the treasure
			var tre=new Fsprite(sp_config);
				ani_config.tar=tre;
			var tre_ani=new Fanimator(ani_config);
			tre_ani.set_frame(lev.blocks[I].sprite);
			tre.set_xy(position);
			tre.set_z(20);
			tre.hide();
			this.treasure.push({
				x: (i%sub.col),
				y: Math.floor(i/sub.col),
				sp: tre,
				state: 'hidden', //can be 'hidden', 'shown' or 'consumed'
				show_when: 0
			});
		}

		//create the pellets
		if( type==='floor')
		{
			var p_ani_config=
			{
				x:ani_config.x, y:ani_config.y,
				w:ani_config.w, h:ani_config.h,
				gx:ani_config.gx, gy:ani_config.gy,
				ani: lev.blocks['.'].sprites
			}
			var p_sp=new Fsprite(sp_config);
				p_ani_config.tar=p_sp;
			var p_ani=new Fanimator(p_ani_config);
			this.pellet.list.push({
				sp:p_sp,
				ani:p_ani
			});
			p_ani.I=-1;
			p_ani.next_frame();
			p_sp.set_xy(position);
			p_sp.set_z(20);
			this.pellet.count++;
		}
		else
		{
			this.pellet.list.push({});
		}
	}
}

level.prototype.game_start=function()
{
	//calculate how many pellets are left when each treasure should be shown
	var portion = this.pellet.count / this.treasure.length;
	for( var i=0; i<this.treasure.length; i++)
	{
		this.treasure[i].show_when = Math.floor(this.pellet.count - portion*(i+1));
	}
}

level.prototype.at=function(P) //get the block at a specified point {x,y} on map
{
	var I = P.x+P.y*this.col;
	if( I>=0 && I<this.map.length)
		return this.map[I];
	else
		return 'error';
}
level.prototype.atI=function(I) //get the block at a specified index I
{
	if( I>=0 && I<this.map.length)
		return this.map[I];
	else
		return 'error';
}
level.prototype.consume=function(P)
{
	var I = P.x+P.y*this.col;
	if( !this.pellet.list[I].consumed)
	{
		if( this.pellet.consuming)
			this.pellet.consuming.sp.remove();
		this.pellet.consuming=this.pellet.list[I];
		this.pellet.list[I]={ consumed:true };
		this.pellet.count--;
	}
	for( var i=0; i<this.treasure.length; i++)
	{
		if( this.treasure[i].state==='hidden')
		{
			//unhide the treasure
			if( this.pellet.count===this.treasure[i].show_when)
			{
				this.treasure[i].sp.show();
				this.treasure[i].state='shown';
				this.manager.signal('level','treasure shown');
			}
		}
		else if( this.treasure[i].state==='shown')
		{
			//attain the treasure
			if( P.x===this.treasure[i].x &&
				P.y===this.treasure[i].y )
			{
				this.treasure[i].sp.remove();
				this.treasure[i].state='consumed';
				this.manager.signal('level','treasure got');
				return 'treasure';
			}
		}
	}
}
level.prototype.frame=function()
{
	this.counter++;
	//generally it is not possible that more than one pellet is consumed at the same time
	if( this.counter%10===0)
	{
		var P = this.pellet.consuming;
		if( P)
		{
			if( P.ani.next_frame() === P.ani.config.ani.length-1)
			{	//animation finishes
				P.sp.remove();
				this.pellet.consuming=0;
			}
		}
	}
}

return level;
});

/**	@fileOverview
	@description
	keyboard controller system
	maintains a table of key states
	see http://project--f.blogspot.hk/2012/11/keyboard-controller.html for explainations
 */

define('core/controller',[],function() //exports a class `controller`
{

function keydown(e)
{
	return master_controller.key(e,1);
}

function keyup(e)
{
	return master_controller.key(e,0);
}

var master_controller = (function()
{
	if (document.addEventListener){
		document.addEventListener("keydown", keydown, true);
		document.addEventListener("keyup", keyup, true);
	} else if (document.attachEvent){
		document.attachEvent("keydown", keydown);
		document.attachEvent("keyup", keyup);
	} else {
		//window.onkeydown = F.double_delegate(window.onkeydown, keydown);
		//window.onkeyup   = F.double_delegate(window.onkeydown, keyup);
	}

	var mas = new Object();
	mas.child = [];
	mas.key = function(e,down)
	{
		if (!e) e = window.event;
		for (var I in this.child)
		{
			if ( this.child[I].key(e,down))
				break;//if one controller catches a key, the next controller will never receive an event
		}
	}
	return mas;
}());

/**	@class
	keyboard controller
	@example
	config=
	{
		up:'h', down:'n', left:'b', 'control name':'control key',,,
	}
	@description
	on the other hand, there can be other controllers with compatible definition and behavior,
	(e.g. AI controller, network player controller, record playback controller)
	-has the member variables `state`, `config`, `child`, `sync`
	-behavior: call the `key` method of every member of `child` when keys arrive
	-has the method `clear_states`, `fetch` and `flush`
	-behavior: if `sync` is true, the controller should buffer key inputs,
	           and only dispatch to child when `fetch` is called,
	           and flush the buffer when `flush` is called
 */
function controller (config)
{
	this.state={};
	this.config=config;
	this.keycode={};
	/**	@property controller.child child system that has the method key('control name',down)
		push a child into this array to listen to key events
	*/
	this.child=new Array();
	/**	@property controller.sync controllers can work in 2 modes, sync and async.
		if sync===false, a key up-down event will be distributed to all child **immediately**.
		if sync===true, a key up-down event will be buffered, and must be fetch manually.
	*/
	this.sync=false;
	this.buf=new Array();

	/**	supply events to controller
		(master controller will do this automatically)
		@function
		@param e event
		@param down
	*/
	this.key=function(e,down) //interface to master_controller------
	{
		var caught=0;
		for(var I in this.config)
		{
			if ( this.keycode[I]==e.keyCode)
			{
				if( this.sync===false)
				{
					if( this.child)
						for(var J in this.child)
							this.child[J].key(I,down);
					this.state[I]=down;
				}
				else
				{
					this.buf.push([I,down]);
				}
				caught=1;
				break;
			}
		}
		return caught;
	}

	//interface to application--------------------------------------
	/**	clear the key state table
		@function
	*/
	this.clear_states=function()
	{
		for(var I in this.config)
			this.state[I]=0;
	}
	/**	fetch for inputs received since the last fetch
		will flush buffer afterwards
		@function
	*/
	this.fetch=function()
	{
		for( var i in this.buf)
		{
			var I=this.buf[i][0];
			var down=this.buf[i][1];
			if( this.child)
				for(var J in this.child)
					this.child[J].key(I,down);
			this.state[I]=down;
		}
		this.buf=[];
	}
	/**	flush the buffer manually
		@function
	*/
	this.flush=function()
	{
		this.buf=[];
	}

	//[--constructor
	master_controller.child.push(this);
	this.clear_states();
	for(var I in this.config)
	{
		this.keycode[I] = controller.keyname_to_keycode(this.config[I]);
	}
	//--]
}

/**	convert keyname to keycode
	@function
*/
controller.keyname_to_keycode=function(A)
{
	var code;
	if( A.length==1)
	{
		var a=A.charCodeAt(0);
		if ( (a>='a'.charCodeAt(0) && a<='z'.charCodeAt(0)) || (a>='A'.charCodeAt(0) && a<='Z'.charCodeAt(0)) )
		{
			A=A.toUpperCase();
			code=A.charCodeAt(0);
		}
		else if (a>='0'.charCodeAt(0) && a<='9'.charCodeAt(0))
		{
			code=A.charCodeAt(0);
		}
		else
		{	//different browsers on different platforms are different for symbols
			switch(A)
			{
				case '`': code=192; break;
				case '-': code=189; break;
				case '=': code=187; break;
				case '[': code=219; break;
				case ']': code=221; break;
				case '\\': code=220; break;
				case ';': code=186; break;
				case "'": code=222; break;
				case ',': code=188; break;
				case '.': code=190; break;
				case '/': code=191; break;
				case ' ': code=32; break;
			}
		}
	}
	else
	{
		switch(A)
		{
			case 'ctrl': code=17; break;
			case 'up': code=38; break; //arrow keys
			case 'down': code=40; break;
			case 'left': code=37; break;
			case 'right': code=39; break;
		}
	}
	return code;
}

/**	convert keycode back to keyname
	@function
*/
controller.keycode_to_keyname=function(code)
{
	if( (code>='A'.charCodeAt(0) && code<='Z'.charCodeAt(0)) ||
	    (code>='0'.charCodeAt(0) && code<='9'.charCodeAt(0)) )
	{
		return String.fromCharCode(code).toLowerCase();
	}
	else
	{
		return ''+code;
	}
}

return controller;

// http://www.quirksmode.org/js/keys.html
// http://unixpapa.com/js/key.html
});

define('teeth/controller',['core/controller'],function (Fcontroller)
{
	var control_config={
		up:'up', down:'down', left:'left', right:'right'
	};
	var control = new Fcontroller(control_config);
	return control;
});

define('teeth/data-AI',{
	normal:
	{
		alert_distance: 6, //the distance to be alert of opponent to change state to chase
		out_of_wander: 0.2, //probability to walk off the patrol path in wandering
	}
});

define('teeth/character',['teeth/selector','teeth/controller','core/sprite','core/animator','teeth/data-AI'],
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

//this is JS file defining sprites
define('teeth/data-characters',{
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
				blockh:35,
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
				blockh:35,
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

define('teeth/game',[
'teeth/selector', 'teeth/level', 'teeth/character', 'teeth/data-characters'
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
								setTimeout( function() {
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
		var hero;
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
				hero=chars[i];
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
		var timer=setInterval(frame,1000/31); //30fps
		function frame()
		{
			for( var i in chars)
				chars[i].frame();
			level.frame();
		}

		//destructor to remove all DOM nodes
		this.delete=function()
		{
			clearInterval(timer);
			$('stage').parentNode.removeChild($('stage'));
		}
	}

	return game;
});

//this is this JSON file defining levels
define('teeth/data-levels',{
	name:'level pack 1',
	sprite:
	{
		img:'sprites.png',
		col:10,
		row:10,
		blockw:35,
		blockh:35,
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
			lives: 999,
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
		}
	]
});

//manages the course of the game

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
		current_level=0;
		$('startpage').style.display='';
		$('gametext').style.display='none';
		game.delete();
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
			game.delete();
			$('!clear-cache');
			game = new Game('play',data_levels,current_level,callback);
		}
		else
		{
			$('gametext').style.display='';
			$('gametext').innerHTML='Game complete.<br><span style="font-size:40px;">you can design your own level!';
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
});

define("teeth/main",[], function(){});
