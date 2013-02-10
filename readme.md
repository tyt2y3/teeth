# Teeth
![screenshot](http://tyt2y3.github.com/teeth/web/images/cap01.png)

Teeth is a pacman style game based on F.core.
[__Play now!__](http://tyt2y3.github.com/teeth/)

It is my spare time project to make some fun out of teeth-teeth and brain demon.

I will be maintaining this code base until Jan 31 2013, and _may_ accept feature request.

# Hackability
This game is designed to be hackable. It should be easy to design custom levels, maps and sprites. And with some coding, everything is possible.
So you are come to hack me. First of all you need to clone this repository. Then look into the subdirectory `release/data`.
> Do not work in the `/src` directory. There will be no effect.

## Sprite changing
You can create sprites for __teeth__. Then do some configurations in data files, for example
```javascript
sprite:
{
	img:'sprites.png',
	col:10,
	row:10,
	blockw:35,
	blockh:35,
},
```
Then replace the sprite indices in the data files, for example
```javascript
'L': {
	name:'north-east junction',
	sprite: 80 //sprite index
},
```
keep in mind that the sprite index starts counting 0 in the top-left corner, going to the right first.
in the above example, 80 is really the 8th row, 0th column. to keep things simple, always size to 10 columns in your sprite map.

For characters, you see arrays and they are representing animation sequences
```javascript
action:
{
	wander:[1,1,1,1,1,20,20,20,20,20,20],
	chase:[0,1],
	be_chase:[10,11],
	be_eaten:[21]
},
```

## Data changing
There are 3 data files in __teeth__:
- data-levels.js  
- data-characters.js
- data-AI.js

You should be able to do the number changings easily.
However I hope that you can create more maps for this game.
Look at the sample map for the demo level 0:
```javascript
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
```
It is an array of characters. every char represents a block. `' '` represents floor.
Look up at the table above
```javascript
'L': {
	name:'north-east junction',
	sprite: 80
},
```
So `'L'` really means a north-east junction with sprite 80.
This shouldnt be hard to understand.

Some points to note:
- there can be only 1 hero born point
- there can be many ghost born points
- there can be many treasure points

Every other parameters in the data files should be well explained in the comments.
> some technical points to note:
> Each data-level.js file defines a JSON structure. And the concept is each data-level.js file is a level-pack containing multiple levels. All levels in a level-pack share the same sprites and building-blocks. This is a two-level data representation and is entirely an architectural thing. The up side is we can probably load level-packs on the fly and be fancy.

Happy hacking, good luck.
> if more people are playing this game, I will probably develop a level editor. but a GUI editor always has its down sides so please learn the textual basis first.

# Develop
developers,developers,developers,,, please read the [developer's guide](https://github.com/tyt2y3/teeth/blob/master/developers.md#develop).

### Finally
If you have designed good levels, please send them to me or make a pull request and I'll include them in the offical release.

## Project F
<img src="http://2.bp.blogspot.com/-k-My1B-YlaU/T8JUBAYpu9I/AAAAAAAAACI/OnCvkzFF5jw/s1600/logo_l1_s.png" height="80"/>
teeth is a member of [Project F games](http://project--f.blogspot.com/2013/02/games.html).
