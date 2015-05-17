//Canvas initialisation
var canvas = document.getElementById("canvas");
var playbutton = document.getElementById("playbutton");
var recordbutton = document.getElementById("recordbutton");
var downloadbutton = document.getElementById("downloadbutton");
var actualdownload = document.getElementById("actualdownload");
var tileSize = 6;
canvas.width = Math.floor((window.innerWidth-80)/tileSize)*tileSize;
canvas.height = Math.floor((window.innerHeight-80)/tileSize)*tileSize;
var ctx = canvas.getContext("2d");
var fps = 60;
var map = [];
var tempmaprow = [];
var mousePos = {x: 0, y: 0};
var playing = false;
var tempalive = [];
var loop = 0;
var oddMouseThing = true;
var button = 0;
var recording = false;
var encoder;
var binary_gif;
var data_url;

function play() {
	playing = !playing;
	if (playing) {
		playbutton.style.color = '#00FF00';
	}
	if (!playing) {
		playbutton.style.color = '#FF0000';
	}
}
function record() {
	recording = !recording;
	if (recording) {
		recordbutton.style.color = '#00FF00';
		encoder = new GIFEncoder();
		encoder.setRepeat(1);
		encoder.setFrameRate(fps);
		encoder.setQuality(1);
		encoder.setTransparent(null);
		encoder.start();
	}
	if (!recording) {
		recordbutton.style.color = '#FF0000';
		encoder.finish();
		binary_gif = encoder.stream().getData();
		data_url = 'data:image/gif;base64,' + encode64(binary_gif);
		downloadbutton.hidden = false;
		actualdownload.href = data_url;
	}
}
for (y = 0; y < canvas.height/tileSize; y++) {
	for (x = 0; x < canvas.width/tileSize; x++) {
		tempmaprow.push(0);
	}
	map.push(tempmaprow);
	tempmaprow = [];
}

function drawMap() {
	for (y = 0; y < map.length; y++) {
		for (x = 0; x < map[y].length; x++) {
			if (map[y][x] == 0) {
				ctx.fillStyle="#000000";
				ctx.fillRect(x*tileSize,y*tileSize,tileSize,tileSize);
			}
			if (map[y][x] == 1) {
				ctx.fillStyle="#00FF00";
				ctx.fillRect(x*tileSize,y*tileSize,tileSize,tileSize);
			}
		}
	}
}

function getMousePos(evt) {
	if (!oddMouseThing) {
		return {
			x: evt.clientX - (window.innerWidth - canvas.width)/2,
			y: evt.clientY - (window.innerWidth - canvas.width) + 48
		};
	}
	if (oddMouseThing) {
		return {
			x: evt.clientX - (window.innerWidth - canvas.width)/2 + 8,
			y: evt.clientY - (window.innerWidth - canvas.width) + 48
		};
	}
}
canvas.addEventListener('mousemove', function(evt) {
    mousePos = getMousePos(evt);
	if (mousePos.x >= tileSize && mousePos.y >= tileSize && mousePos.x < canvas.width - tileSize && mousePos.y < canvas.height - tileSize) {
		if (button == 1) {
			map[Math.floor(mousePos.y/tileSize)][Math.floor(mousePos.x/tileSize)] = 1;
		}
		if (button == 3) {
			map[Math.floor(mousePos.y/tileSize)][Math.floor(mousePos.x/tileSize)] = 0;
		}
	}
}, false);
canvas.addEventListener('mousedown', function(evt) {
	if (!playing) {
		evt = evt || window.event;
		button = evt.which || evt.button;
		if (mousePos.x >= tileSize && mousePos.y >= tileSize && mousePos.x < canvas.width - tileSize && mousePos.y < canvas.height - tileSize) {
			if (button == 1) {
				map[Math.floor(mousePos.y/tileSize)][Math.floor(mousePos.x/tileSize)] = 1;
			}
			if (button == 3) {
				map[Math.floor(mousePos.y/tileSize)][Math.floor(mousePos.x/tileSize)] = 0;
			}
		}
	}
}, false);
canvas.addEventListener('mouseup', function(evt) {
	button = 0;
}, false);

function update() {
	if (recording) {
		encoder.addFrame(ctx);
	}
	if (playing) {
		tempalive = [];
		for (y = 1; y < canvas.height/tileSize - 1; y++) {
			for (x = 1; x < canvas.width/tileSize - 1; x++) {
				around = 0;
				if (map[y-1][x] == 1) {
					around++;
				}
				if (map[y-1][x+1] == 1) {
					around++;
				}
				if (map[y][x+1] == 1) {
					around++;
				}
				if (map[y+1][x+1] == 1) {
					around++;
				}
				if (map[y+1][x] == 1) {
					around++;
				}
				if (map[y+1][x-1] == 1) {
					around++;
				}
				if (map[y][x-1] == 1) {
					around++;
				}
				if (map[y-1][x-1] == 1) {
					around++;
				}
				if (map[y][x] == 0 && around == 3) {
					tempalive.push([x, y, 1]);
				}
				if (map[y][x] == 1 && (around < 2 || around > 3)) {
					tempalive.push([x, y, 0]);
				}
			}
		}
		tempalive.forEach(function (item) {
			map[item[1]][item[0]] = item[2];
		});
	}
}

function draw() {
	drawMap();
}

loop = setInterval(function() {
	update();
	draw();
}, 1000/fps);