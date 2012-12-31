define("teeth/selector",[],function(){var e={};return function(t){if(t==="!clear-cache"){e={};return}return e[t]||(e[t]=document.getElementById(t)),e[t]}}),define("core/css",[],function(){var e=!1;return{load:function(t,n,r,i){e?r(!1):(e=!0,embed_css=function(e){var t=document.getElementsByTagName("head")[0],n=document.createElement("style"),r=document.createTextNode(e);n.type="text/css",n.styleSheet?n.styleSheet.cssText=r.nodeValue:n.appendChild(r),t.appendChild(n)},n(["cssout"],function(e){embed_css(e.content),r(!0)}))},pluginBuilder:"./css-build"}}),define("cssout",{content:".F_sprite { position:absolute; overflow:hidden; width:10px; height:10px; } .F_sprite_img { position:absolute; } .canvas { position:relative; width:800px; /*height:577px;*/ height:300px; border:1px solid #000; } .page { position: absolute; left: 0px; top: 0px; border: 1px solid #000; z-index: 10000; } "}),define("core/sprite",["core/css!core/style.css"],function(){function t(t){this.ID=e,e++,this.el=document.createElement("div"),this.el.setAttribute("class","F_sprite"),this.el.id="sp"+this.ID,t.canvas.appendChild(this.el),this.img={},this.cur_img=null,this.set_wh(t.wh);if(t.img)for(var n in t.img)this.add_img(t.img[n],n)}var e=0;return t.prototype.set_wh=function(e){this.el.style.width=e.x+"px",this.el.style.height=e.y+"px"},t.prototype.set_xy=function(e){this.el.style.left=e.x+"px",this.el.style.top=e.y+"px"},t.prototype.set_z=function(e){this.el.style.zIndex=Math.round(e)},t.prototype.add_img=function(e,t){var n=document.createElement("img");return n.setAttribute("class","F_sprite_img"),n.src=e,this.el.appendChild(n),this.img[t]=n,this.switch_img(t),n},t.prototype.switch_img=function(e){var t,n;for(var r in this.img)if(this.img[r].style.visibility=="visible"){t=this.img[r].style.left,n=this.img[r].style.top;break}for(var r in this.img)r==e?(this.img[r].style.left=t,this.img[r].style.top=n,this.img[r].style.visibility="visible"):this.img[r].style.visibility="hidden";this.cur_img=e},t.prototype.remove=function(){this.el.parentNode.removeChild(this.el),this.removed=!0},t.prototype.attach=function(){this.removed&&config.canvas.appendChild(this.el)},t.prototype.hide=function(){this.el.style.display="none"},t.prototype.show=function(){this.el.style.display=""},t}),define("core/animator",[],function(){function e(e){this.config=e,this.target=e.tar,this.I=0,this.horimirror=!1,e.borderright||(e.borderright=0),e.borderbottom||(e.borderbottom=0),e.borderleft||(e.borderleft=0),e.bordertop||(e.bordertop=0)}return e.prototype.next_frame=function(){var e=this.config;this.I++;if(!e.ani)this.I==e.gx*e.gy&&(this.I=0),this.show_frame(this.I);else{var t=e.ani[this.I];if(this.I>=e.ani.length||this.I<0)this.I=0,t=e.ani[0];this.show_frame(t)}return this.I},e.prototype.set_frame=function(e){this.I=e,this.show_frame(e)},e.prototype.hmirror=function(e){this.horimirror=e},e.prototype.show_frame=function(e){var t=this.config,n,r;this.horimirror?(n=-((t.gx-1)*t.w-e%t.gx*t.w+t.borderright),r=-(Math.floor(e/t.gx)*t.h+t.y+t.bordertop)):(n=-(e%t.gx*t.w+t.x+t.borderleft),r=-(Math.floor(e/t.gx)*t.h+t.y+t.bordertop)),this.target.set_wh({x:t.w-t.borderleft-t.borderright,y:t.h-t.bordertop-t.borderbottom}),this.target.img[this.target.cur_img].style.left=n+"px",this.target.img[this.target.cur_img].style.top=r+"px"},e.prototype.get_at=function(e){e||(e=this.I);var t=this.config;return t.graph[e%t.gx][Math.floor(e/t.gx)]},e.set=function(t,n){if(!t)return null;var r=new Object;for(var i in t){if(n&&i==n)continue;if(n&&t[n])for(var s in t[n])t[i][s]=t[n][s];r[i]=new e(t[i])}return r},e}),define("teeth/level",["teeth/selector","core/sprite","core/animator"],function(e,t,n){function r(r,i,s){this.map=[],this.charpoint=[],this.treasure=[],this.pellet={list:[],consuming:0,count:0},this.counter=0,this.manager=s;var o={canvas:e("stage"),wh:{x:r.sprite.blockw,y:r.sprite.blockh},img:{0:r.sprite.img}},u={x:0,y:0,w:r.sprite.blockw,h:r.sprite.blockh,gx:r.sprite.col,gy:r.sprite.row,tar:null},a=this.map,f=r.levels[i];this.col=f.col,this.row=f.row,e("game").style.width=f.col*r.sprite.blockw+"px",e("stage").style.width=f.col*r.sprite.blockw+"px",e("stage").style.height=f.row*r.sprite.blockh+"px",e("stage").style.backgroundColor=f.bgcolor;for(var l=0;l<f.map.length;l++){var c=f.map[l],h=new t(o);u.tar=h;var p=new n(u),d="",v={x:l%f.col*r.sprite.blockw,y:Math.floor(l/f.col)*r.sprite.blockh};switch(r.blocks[c].name){case"hero born point":case"ghost born point":this.charpoint.push({x:l%f.col,y:Math.floor(l/f.col),role:r.blocks[c].name==="hero born point"?"hero":"ghost"});case"treasure":case"floor":d="floor",p.set_frame(r.blocks[" "].sprite);break;default:d="block",p.set_frame(r.blocks[c].sprite)}a.push({sp:h,ani:p,type:d}),h.set_xy(v),h.set_z(0);if(r.blocks[c].name==="treasure"){var m=new t(o);u.tar=m;var g=new n(u);g.set_frame(r.blocks[c].sprite),m.set_xy(v),m.set_z(20),m.hide(),this.treasure.push({x:l%f.col,y:Math.floor(l/f.col),sp:m,state:"hidden",show_when:0})}if(d==="floor"){var y={x:u.x,y:u.y,w:u.w,h:u.h,gx:u.gx,gy:u.gy,ani:r.blocks["."].sprites},b=new t(o);y.tar=b;var w=new n(y);this.pellet.list.push({sp:b,ani:w}),w.I=-1,w.next_frame(),b.set_xy(v),b.set_z(20),this.pellet.count++}else this.pellet.list.push({})}}return r.prototype.game_start=function(){var e=this.pellet.count/this.treasure.length;for(var t=0;t<this.treasure.length;t++)this.treasure[t].show_when=Math.floor(this.pellet.count-e*(t+1))},r.prototype.at=function(e){var t=e.x+e.y*this.col;return t>=0&&t<this.map.length?this.map[t]:"error"},r.prototype.atI=function(e){return e>=0&&e<this.map.length?this.map[e]:"error"},r.prototype.consume=function(e){var t=e.x+e.y*this.col;this.pellet.list[t].consumed||(this.pellet.consuming&&this.pellet.consuming.sp.remove(),this.pellet.consuming=this.pellet.list[t],this.pellet.list[t]={consumed:!0},this.pellet.count--);for(var n=0;n<this.treasure.length;n++)if(this.treasure[n].state==="hidden")this.pellet.count===this.treasure[n].show_when&&(this.treasure[n].sp.show(),this.treasure[n].state="shown",this.manager.signal("level","treasure shown"));else if(this.treasure[n].state==="shown"&&e.x===this.treasure[n].x&&e.y===this.treasure[n].y)return this.treasure[n].sp.remove(),this.treasure[n].state="consumed",this.manager.signal("level","treasure got"),"treasure"},r.prototype.frame=function(){this.counter++;if(this.counter%10===0){var e=this.pellet.consuming;e&&e.ani.next_frame()===e.ani.config.ani.length-1&&(e.sp.remove(),this.pellet.consuming=0)}},r}),define("core/controller",[],function(){function e(e){return n.key(e,1)}function t(e){return n.key(e,0)}function r(e){this.state={},this.config=e,this.keycode={},this.child=new Array,this.sync=!1,this.buf=new Array,this.key=function(e,t){var n=0;for(var r in this.config)if(this.keycode[r]==e.keyCode){if(this.sync===!1){if(this.child)for(var i in this.child)this.child[i].key(r,t);this.state[r]=t}else this.buf.push([r,t]);n=1;break}return n},this.clear_states=function(){for(var e in this.config)this.state[e]=0},this.fetch=function(){for(var e in this.buf){var t=this.buf[e][0],n=this.buf[e][1];if(this.child)for(var r in this.child)this.child[r].key(t,n);this.state[t]=n}this.buf=[]},this.flush=function(){this.buf=[]},n.child.push(this),this.clear_states();for(var t in this.config)this.keycode[t]=r.keyname_to_keycode(this.config[t])}var n=function(){document.addEventListener?(document.addEventListener("keydown",e,!0),document.addEventListener("keyup",t,!0)):document.attachEvent&&(document.attachEvent("keydown",e),document.attachEvent("keyup",t));var n=new Object;return n.child=[],n.key=function(e,t){e||(e=window.event);for(var n in this.child)if(this.child[n].key(e,t))break},n}();return r.keyname_to_keycode=function(e){var t;if(e.length==1){var n=e.charCodeAt(0);if(n>="a".charCodeAt(0)&&n<="z".charCodeAt(0)||n>="A".charCodeAt(0)&&n<="Z".charCodeAt(0))e=e.toUpperCase(),t=e.charCodeAt(0);else if(n>="0".charCodeAt(0)&&n<="9".charCodeAt(0))t=e.charCodeAt(0);else switch(e){case"`":t=192;break;case"-":t=189;break;case"=":t=187;break;case"[":t=219;break;case"]":t=221;break;case"\\":t=220;break;case";":t=186;break;case"'":t=222;break;case",":t=188;break;case".":t=190;break;case"/":t=191;break;case" ":t=32}}else switch(e){case"ctrl":t=17;break;case"up":t=38;break;case"down":t=40;break;case"left":t=37;break;case"right":t=39}return t},r.keycode_to_keyname=function(e){return e>="A".charCodeAt(0)&&e<="Z".charCodeAt(0)||e>="0".charCodeAt(0)&&e<="9".charCodeAt(0)?String.fromCharCode(e).toLowerCase():""+e},r}),define("teeth/controller",["core/controller"],function(e){var t={up:"up",down:"down",left:"left",right:"right"},n=new e(t);return n}),define("teeth/character",["teeth/selector","teeth/controller","core/sprite","core/animator","data/data-AI"],function(e,t,n,r,i){function s(s,o,u,a){this.dat=s,this.role=o,this.control=u,this.manager=a,this.map=a.level,this.state="",this.state_timeout=0,this.counter,this.ani_counter=0,this.x=0,this.y=0,this.sx=0,this.sy=0,this.vx=0,this.vy=0,this.nx=0,this.ny=0,this.speed=0,this.keyframe_rate,this.sp,this.ani,this.controller,this.AI,this.opp,this.friend,this.pending_signal=[];var f={canvas:e("stage"),wh:{x:s.sprite.blockw,y:s.sprite.blockh},img:{r:s.sprite.img,l:s.sprite.img_mirror}},l={x:0,y:0,w:s.sprite.blockw,h:s.sprite.blockh,gx:s.sprite.col,gy:s.sprite.row,ani:null,tar:null};this.sp=new n(f),this.sp.switch_img("r"),this.sp.set_z(o==="hero"?10:30),l.tar=this.sp,this.ani=new r(l),this.set_state("wander");if(u==="human"){var c=this;t.child=[{key:function(e,t){if(t)switch(e){case"up":c.ny=-1;break;case"down":c.ny=1;break;case"left":c.nx=-1;break;case"right":c.nx=1}}}]}else u==="AI"&&(this.AI=i.normal)}return s.prototype.game_start=function(){this.opp=this.manager.opponents(this.role),this.friend=this.manager.friends(this.role,this)},s.prototype.set_state=function(e){if(this.state===e)return;this.state=e,this.ani.config.ani=this.dat.action[e],this.ani.I=-1,this.ani.next_frame(),this.dat.properties[e+"_speed"]||e.indexOf("transform_to_")===0&&(e=e.substring("transform_to_".length)),this.dat.properties[e+"_speed"]?this.speed=this.dat.properties[e+"_speed"]:this.speed=this.dat.properties.default_speed,this.keyframe_rate=this.dat.sprite.blockw/this.speed,this.counter=0},s.prototype.transform_to_state=function(e){this.dat.action["transform_to_"+e]?this.set_state("transform_to_"+e):this.set_state(e)},s.prototype.frame=function(){this.sx+=this.speed*this.vx,this.sy+=this.speed*this.vy,this.x=this.where().x,this.y=this.where().y,this.update_xy(),this.counter===this.keyframe_rate-1?(this.keyframe(),this.counter=0):this.counter++,this.ani_counter===this.dat.animation_framerate_inv-1?(this.ani.next_frame()===this.ani.config.ani.length-1&&this.state.indexOf("transform_to_")===0&&(this.signal("end_"+this.state),this.ani.I--),this.ani_counter=0):this.ani_counter++;if(this.role==="hero")for(var e=0;e<this.opp.length;e++){var t=Math.sqrt((this.sx-this.opp[e].sx)*(this.sx-this.opp[e].sx)+(this.sy-this.opp[e].sy)*(this.sy-this.opp[e].sy));if(t<this.dat.sprite.blockw/2)if(this.state==="chase"||this.state==="transform_to_chase")this.opp[e].state!=="transform_to_be_eaten"&&this.opp[e].state!=="be_eaten"&&(this.opp[e].signal("I ate you!"),this.manager.signal("hero","ate a ghost"));else if(this.opp[e].state!=="transform_to_be_eaten"&&this.opp[e].state!=="be_eaten"){this.signal("be eaten");break}}},s.prototype.keyframe=function(){function r(e,t){return Math.sqrt((e.x-t.x)*(e.x-t.x)+(e.y-t.y)*(e.y-t.y))}this.set_map_xy(this.where()),this.consume_signal(),this.state_timeout--,this.control==="AI"&&this.decide();if(this.role==="hero"){if(this.state_timeout===0)switch(this.state){case"chase":for(var e=0;e<this.opp.length;e++)this.opp[e].signal("return to normal");case"be_chase":this.transform_to_state("wander")}if(this.state.indexOf("be_eaten")===-1){var t=this.map.consume(this.where());if(t==="treasure")if(this.state==="wander"||this.state==="be_chase"){this.state_timeout=this.dat.chase_timeout,this.transform_to_state("chase");for(var e=0;e<this.opp.length;e++)this.opp[e].signal("I want you!")}}}else if(this.role==="ghost"){var n=r(this.opp[0],this)<this.AI.alert_distance;n&&(this.state==="wander"||this.state==="chase")&&this.opp[0].signal("aware of you!");switch(this.state){case"wander":n&&this.transform_to_state("chase");break;case"chase":n||(this.vx=-this.vx,this.vy=-this.vy,this.transform_to_state("wander"))}this.state_timeout===0&&this.state==="be_eaten"&&this.transform_to_state("wander")}this.nx&&!this.is_block_ahead({x:this.nx,y:0})?(this.vx=this.nx,this.vy=0,this.nx=0):this.ny&&!this.is_block_ahead({x:0,y:this.ny})&&(this.vx=0,this.vy=this.ny,this.ny=0),this.is_block_ahead({x:this.vx,y:0})&&(this.vx=0),this.is_block_ahead({x:0,y:this.vy})&&(this.vy=0),this.is_block_ahead({x:0,y:0})&&console.log("error! character stuck in a block"),this.vx>=0&&this.ani.horimirror?(this.ani.horimirror=!1,this.sp.switch_img("r"),this.ani.next_frame()):this.vx<0&&!this.ani.horimirror&&(this.ani.horimirror=!0,this.sp.switch_img("l"),this.ani.next_frame())},s.prototype.signal=function(e){this.pending_signal.push(e)},s.prototype.consume_signal=function(){for(var e=0;e<this.pending_signal.length;e++){if(this.role==="hero")switch(this.pending_signal[e]){case"aware of you!":this.state==="wander"&&this.transform_to_state("be_chase");if(this.state==="wander"||this.state==="be_chase")this.state_timeout=10;break;case"be eaten":this.state!=="transform_to_be_eaten"&&this.state!=="be_eaten"&&(this.transform_to_state("be_eaten"),this.manager.signal("hero","be eaten"));break;case"respawn":this.transform_to_state("wander")}else if(this.role==="ghost")switch(this.pending_signal[e]){case"I want you!":(this.state==="wander"||this.state==="chase")&&this.transform_to_state("be_chase");break;case"I ate you!":this.state_timeout=this.dat.be_eaten_timeout,this.transform_to_state("be_eaten");var t=0;for(var n=0;n<this.friend.length;n++)this.friend[n].state!=="transform_to_be_eaten"&&this.friend[n].state!=="be_eaten"&&t++;if(t===0){this.manager.signal("hero","ate all ghost");for(var r=0;r<this.friend.length;r++)this.friend[r].state_timeout=999}break;case"return to normal":this.state==="be_chase"&&this.transform_to_state("wander")}if(this.pending_signal[e].indexOf("end_transform_to_")===0){var i=this.pending_signal[e].substring("end_transform_to_".length);this.set_state(i)}}this.pending_signal=[]},s.prototype.update_xy=function(){this.sp.set_xy({x:this.sx,y:this.sy})},s.prototype.set_xy=function(e){this.sx=e.x,this.sy=e.y,this.sp.set_xy(e)},s.prototype.set_map_xy=function(e){this.x=e.x,this.y=e.y,this.set_xy({x:e.x*this.dat.sprite.blockw,y:e.y*this.dat.sprite.blockh})},s.prototype.where=function(){return{x:Math.round(this.sx/this.dat.sprite.blockw),y:Math.round(this.sy/this.dat.sprite.blockh)}},s.prototype.is_block=function(e){return this.map.at(e)?this.map.at(e).type==="block":!1},s.prototype.is_block_ahead=function(e){return this.is_block({x:this.x+e.x,y:this.y+e.y})},s.prototype.is_friend_ahead_blocking=function(e,t){for(var n=0;n<this.friend.length;n++){var r=this.friend[n];if(this.x+e.x===r.x&&this.y+e.y===r.y)if(!t){if(!r.vx&&!r.vy)return!0}else if(t.x===-r.vx&&r.vx||t.y===-r.vy&&r.vy)return!0}return!1},s.prototype.decide=function(){function l(e,t){return{x:e.x+t.x,y:e.y+t.y}}function c(e,t){return Math.sqrt((e.x-t.x)*(e.x-t.x)+(e.y-t.y)*(e.y-t.y))}function h(e){if(e.x>0&&e.y===0)return"right";if(e.x<0&&e.y===0)return"left";if(e.x===0&&e.y<0)return"up";if(e.x===0&&e.y>0)return"down"}function p(e){switch(x){case"up":return{x:0,y:-1};case"down":return{x:0,y:1};case"left":return{x:-1,y:0};case"right":return{x:1,y:0}}}function d(e){return{x:-e.x,y:-e.y}}function v(e,t){return e.x===t.x&&e.y===t.y}function m(e,t,n){var r=0,i=t(e[0]);for(var s=0;s<e.length;s++){var o=t(e[s]);o>i===n&&(r=s,i=o)}return r}var e=[{x:0,y:-1},{x:0,y:1},{x:-1,y:0},{x:1,y:0}],t=[],n=d({x:this.vx,y:this.vy});for(var r in e){var i=e[r];(!v(n,i)||this.role==="hero"&&this.state==="be_chase")&&!this.is_block_ahead(i)&&!this.is_friend_ahead_blocking(i,i)&&t.push(i)}var s={x:0,y:0};if(t.length===0)s=n,this.is_block_ahead(n);else if(this.state==="wander"){t.length>1?s=n:(s.x=this.vx,s.y=this.vy);if(Math.random()<this.AI.out_of_wander||v(s,{x:0,y:0})){var o=Math.floor(Math.random()*t.length);s=t[o]}}else if(this.role==="ghost"&&this.state==="chase"||this.role==="hero"&&this.state==="be_chase"||this.role==="hero"&&this.state==="be_eaten"){var u=this,a=m(u.opp,function(e){return c(u,e)},!1),f=m(t,function(e){return c(l(e,u),u.opp[a])+(v(n,e)?-1:0)},this.state==="be_chase");s=t[f]}else if(this.role==="ghost"&&this.state==="be_chase"||this.role==="ghost"&&this.state==="be_eaten"||this.role==="hero"&&this.state==="chase"){var o=Math.floor(Math.random()*t.length);s=t[o]}this.is_friend_ahead_blocking({x:0,y:0},d(s))&&(s={x:0,y:0}),this.nx=s.x,this.ny=s.y},s}),define("teeth/game",["teeth/selector","teeth/level","teeth/character","data/data-characters"],function(e,t,n,r){function i(i,s,o,u){function a(e,t,n){var r=document.createElement(t);return e.insertBefore(r,e.firstChild),n&&(r.id=n),r}function E(){for(var e in h)h[e].frame();c.frame()}a(e("game"),"div","stage");var f={opponents:function(e){var t=[];for(var n in h)h[n].role!==e&&t.push(h[n]);return t},friends:function(e,t){var n=[];for(var r in h)h[r].role===e&&h[r]!==t&&n.push(h[r]);return n},level:null,signal:function(t,n){switch(t){case"level":switch(n){case"treasure shown":e("infotext").innerHTML="lick the foot";break;case"treasure got":e("infotext").innerHTML="clear all 牙 before you get back to normal"}break;case"hero":switch(n){case"ate a ghost":e("infotext").innerHTML="good!";break;case"ate all ghost":d||(d=!0,u("level clear"));break;case"be eaten":p.life--,p.life>0?(e("infotext").innerHTML="too bad. you have "+p.life+" lives left.<br>"+"respawning in "+l.hero_respawn_time+" sec...",w=setTimeout(function(){p.signal("respawn"),e("infotext").innerHTML="try again."},l.hero_respawn_time*1e3)):u("gameover")}}}},l=s.levels[o],c=f.level=new t(s,o,f),h=[],p;this.hero;var d=!1;for(var v=0;v<c.charpoint.length;v++){var m,g,y=c.charpoint[v].role;y==="hero"?(m=r.list[0],i==="demo"?g="AI":g="human"):y==="ghost"&&(m=r.list[1],g="AI"),h[v]=new n(m,y,g,f),h[v].set_map_xy(c.charpoint[v]),y==="hero"?(this.hero=p=h[v],p.life=l.lives,p.dat.chase_timeout=l.chase_timeout):y==="ghost"&&(h[v].dat.be_eaten_timeout=l.ghost_respawn_time)}for(var v in h)h[v].game_start();c.game_start(),e("infotext").innerHTML="collect all pellets";var b=setInterval(E,1e3/31),w;this._delete=function(){w&&clearTimeout(w),clearInterval(b),e("stage").parentNode.removeChild(e("stage"))}}return i}),define("teeth/main-game",["teeth/selector","teeth/game","data/data-levels"],function(e,t,n){function s(){i=3,e("startpage").style.display="",e("gametext").style.display="none",r._delete(),e("!clear-cache"),r=new t("demo",n,i,u),r.hero.life=999}function o(){i+1<n.levels.length?(i++,e("startpage").style.display="none",e("gametext").style.display="none",r._delete(),e("!clear-cache"),r=new t("play",n,i,u)):(e("gametext").style.display="",e("gametext").innerHTML='Happy 2013!<br><span style="font-size:30px;">Game complete.<br><a style="color:#FFF;" href="https://github.com/tyt2y3/teeth#teeth" target="_blank">Design</a> your levels and sprites</span>',e("infotext").innerHTML="restarting in 15 sec...",setTimeout(s,15e3))}function u(t){switch(t){case"gameover":e("gametext").style.display="",e("gametext").innerHTML="Gameover",e("infotext").innerHTML="restarting in 5 sec...",setTimeout(s,5e3);break;case"level clear":e("gametext").style.display="",e("gametext").innerHTML="Level Clear!",e("infotext").innerHTML="starting next level in 5 sec...",setTimeout(o,5e3)}}var r={_delete:function(){}},i;return s(),e("start").onclick=function(){i=0,o()},e("2013special").onclick=function(){i=2,o()},r}),requirejs.config({baseUrl:"./",paths:{teeth:"",data:"data"}}),requirejs(["teeth/main-game"],function(e){}),define("teeth/main-build",[],function(){})