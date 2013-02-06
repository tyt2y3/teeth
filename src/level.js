//level is an object managing the map, pellets and treasures

define(['teeth/selector','F.core/sprite','F.core/animator'],
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
			//sp:sp,
			//ani:ani,
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
	//generally it is not possible that more than one pellet is consumed at the same time
	this.counter++;
	if( this.counter%10===0) // every 1/3 second
	{
		var P = this.pellet.consuming;
		if( P)
		{
			if( P.ani.next_frame() === 0)
			{	//animation finishes
				P.sp.remove();
				this.pellet.consuming=0;
			}
		}
	}
}

return level;
});
