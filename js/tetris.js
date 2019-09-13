//主界面存储
var data;
//当前块
var block;
//下一块
var nextBlock;
//当前位置
var x;
var y;
//计时器
var timer;
//是否暂停
var isPause = false;
//是否死亡
var isDie = false;
//阴影位置
var shadowY;
//是否在加速
var isSpeedUp = false;
//每个块
function Blo(code, color) {
	this.code = code;
	this.color = color;
}
//一个块组
function BlockGroup(data) {
	this.data = data;
	this.downInvalidLength = 0;
	this.leftInvalidLength = 0;
	this.rightInvalidLength = 0;
	this.topInvalidLength = 0;
}

$(document).ready(f);
function f() {
	$(document).keydown(function(event) {
		if (event.keyCode == 80) {
			pause();
		}
		if (isPause) {
			return;
		}
		if (event.keyCode == 39) {
			right();
		}
		if (event.keyCode == 37) {
			left();
		}
		if (event.keyCode == 38) {
			turn();
		}
		if (event.keyCode == 40) {
			speedUp();
		}
		if (event.ctrlKey && event.keyCode == 90) {
			y = 0;
		}
		//彩蛋
		if (event.keyCode == 32) {
			y = shadowY;
			draw();
			drop();
		}
	});
	$(document).keyup(function(event) {
		if (isPause) {
			return;
		}
		if (event.keyCode == 40) {
			slowDown();
		}
	});
	$("#help").mousemove(function(event) {
		$("#helpDiv").css({
			'display' : 'block',
			'left' : event.clientX + 5 + 'px',
			'top' : event.clientY - 136 + 'px'
		});
	});
	$("#help").mouseout(function() {
		$("#helpDiv").css("display", "none");
	});
	init();
	computeShadow();
	drop();
	start();
}
//加速
function speedUp() {
	if (isSpeedUp) {
		return;
	}
	stop();
	timer = setInterval(drop, 100);
	isSpeedUp = true;
}
//减速
function slowDown() {
	isSpeedUp = false;
	stop();
	start();
}
//初始化
function init() {
	$("#score").html("0");
	$("#line").html("0");
	data = new Array();
	for (var i = 0; i < 20; i++) {
		data[i] = new Array();
	}
	for (var i = 0; i < data.length; i++) {
		for (var j = 0; j < 10; j++) {
			data[i][j] = new Blo(0, "blank");
		}
	}
	block = getBlock();
	nextBlock = getBlock();
	drawNextData();
	beginCompute(block);
}
//画图
function draw() {
	var table = $("#show");
	table.html("");
	for (var i = 0; i < data.length; i++) {
		var tr = $("<tr></tr>");
		tr.attr("id", "show" + i);
		for (var j = 0; j < data[i].length; j++) {
			var td = $("<td></td>");
			var c;
			//j--x //i--y
			if (data[i][j].code == 1) {
				c = data[i][j].color;
			} else {
				c = fill(i, j);
			}
			td.addClass(c);
			tr.append(td);
		}
		table.append(tr);
	}
}
//原始数据
function getRawData() {
	var rawData = [
			[ [ [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ],[ 0, 1, 1, 1, 1 ], [ 0, 0, 0, 0, 0 ],[ 0, 0, 0, 0, 0 ] ], "i" ],
			[ [ [ 1, 1, 1 ], [ 0, 0, 1 ], [ 0, 0, 0 ] ], "j" ],
			[ [ [ 1, 1, 1 ], [ 1, 0, 0 ], [ 0, 0, 0 ] ], "l" ],
			[ [ [ 1, 1 ], [ 1, 1 ] ], "o" ],
			[ [ [ 0, 1, 1 ], [ 1, 1, 0 ], [ 0, 0, 0 ] ], "s" ],
			[ [ [ 0, 0, 0 ], [ 0, 1, 0 ], [ 1, 1, 1 ] ], "t" ],
			[ [ [ 1, 1, 0 ], [ 0, 1, 1 ], [ 0, 0, 0 ] ], "z" ] ];
	return rawData[parseInt(Math.random() * 7)];
}
//获取一个块
function getBlock() {
	var raw = getRawData();
	var d = raw[0];
	var color = raw[1];
	var arr = new Array();
	for (var i = 0; i < d.length; i++) {
		arr[i] = new Array();
	}
	for (var i = 0; i < d.length; i++) {
		for (var j = 0; j < d[i].length; j++) {
			arr[i][j] = new Blo(d[i][j], color);
		}
	}
	var num = parseInt(Math.random() * 4);
	var blockGroup = new BlockGroup(arr);
	for (var i = 0; i < num; i++) {
		blockGroup = onlyTurn(blockGroup);
	}
	return blockGroup;
}
//初始化一个方块需调用此函数计算
function beginCompute(blockGroup) {
	compute(blockGroup);
	x = parseInt((data[0].length - blockGroup.data[0].length) / 2);
	y = 0 - blockGroup.data.length + blockGroup.downInvalidLength;
}
//计算无效长度
function compute(arr) {
	computeDownInvalidLength(arr);
	computeLeftInvalidLength(arr);
	computeRightInvalidLength(arr);
	computeTopInvalidLength(arr);
}
//判断是否需要填充
function fill(a, b) {
	var flag = false;
	for (var i = block.topInvalidLength; i < block.data.length
			- block.downInvalidLength; i++) {
		for (var j = block.leftInvalidLength; j < block.data[i].length
				- block.rightInvalidLength; j++) {
			if (x + j == b && y + i == a && block.data[i][j].code == 1) {
				return block.data[i][j].color;
			}
			if (x + j == b && shadowY + i == a
					&& block.data[i][j].code == 1) {
				flag = true;
			}

		}
	}
	if (flag) {
		return "shadow";
	}
	return "blank";
}
//旋转
function turn() {
	//先转置
	var newBlock = onlyTurn(block);
	//求无效长度
	compute(newBlock);
	for (var i = 0; i < newBlock.data.length - newBlock.downInvalidLength; i++) {
		for (var j = 0 + newBlock.leftInvalidLength; j < newBlock.data[i].length
				- newBlock.rightInvalidLength; j++) {
			if (!((y + i < 0) || (x + j < 0) || (y + i >= data.length) || (x
					+ j >= data[0].length))) {
				if (data[y + i][x + j].code == 1
						&& newBlock.data[i][j].code == 1) {
					return;
				}
			}
		}
	}
	//让方块踢墙
	// 下边
	if (y + newBlock.data.length - newBlock.downInvalidLength > data.length) {
		y = data.length - newBlock.data.length + newBlock.downInvalidLength;
	}

	// 左边
	if (x + newBlock.leftInvalidLength < 0) {
		x = 0 - newBlock.leftInvalidLength;
	}
	// 右边
	if (newBlock.data[0].length + x - newBlock.rightInvalidLength > data[0].length) {
		x = data[0].length - newBlock.data[0].length
				+ newBlock.rightInvalidLength;
	}

	block = newBlock;
	compute(block);
	computeShadow();
	draw();
}
//转置方块组
function onlyTurn(blockGroup) {
	var newBlock = new Array();
	for (var i = 0; i < blockGroup.data.length; i++) {
		newBlock[i] = new Array();
	}
	for (var i = 0; i < blockGroup.data.length; i++) {
		for (var j = 0; j < blockGroup.data[i].length; j++) {
			newBlock[i][j] = new Blo(
					blockGroup.data[blockGroup.data.length - 1 - j][i].code,
					blockGroup.data[blockGroup.data.length - 1 - j][i].color);
		}
	}
	return new BlockGroup(newBlock);
}

//下落
function drop() {
	draw();
	if (!isDown(y)) {
		y++;
	} else {
		put();
		var needClearLine = clear();
		if (needClearLine != 0) {
			stop();
			del(needClearLine);
		}
		block = nextBlock;
		beginCompute(block);
		nextBlock = getBlock();
		computeShadow();
		drawNextData();
	}
}
//放置
function put() {
	var flag = false;
	for (var i = 0; i < block.data.length - block.downInvalidLength; i++) {
		//+1
		for (var j = 0 + block.leftInvalidLength; j < block.data[i].length
				- block.rightInvalidLength; j++) {
			if (y + i + block.topInvalidLength < 0) {
				flag = true;
				break;
			}
			if (block.data[i][j].code == 1) {
				data[y + i][x + j] = new Blo(block.data[i][j].code,
						block.data[i][j].color);
			}
		}
		if (flag) {
			break;
		}
	}
	if (flag) {
		isDie = true;
		pause();
		$("#pauseButton").attr("value", "开始");
		alert("游戏结束，您的得分为" + $("#score").html() + ",共消除了"
				+ $("#line").html() + "行");
		init();
		shadowY = -9999;
		draw();
		drawNextData();
	}
}

//左移
function left() {
	if (isLeft()) {
		return;
	}
	x--;
	computeShadow();
	draw();
}
//右移
function right() {
	if (isRight()) {
		return;
	}
	x++;
	computeShadow();
	draw();
}
//判断是否可以向下移动
function isDown(y) {
	var length = block.data.length - block.downInvalidLength;
	if (y + length == data.length) {
		return true;
	}
	for (var i = block.topInvalidLength; i < length; i++) {
		for (var j = block.leftInvalidLength; j < block.data[i].length
				- block.rightInvalidLength; j++) {
			if (!(y + i + 1 < 0)) {
				if (data[y + i + 1][x + j].code == 1
						&& block.data[i][j].code == 1) {
					return true;
				}
			}
		}
	}
	return false;
}
//判断是否可以向左移动
function isLeft() {
	if (x - 1 + block.leftInvalidLength < 0) {
		return true;
	}
	for (var i = block.topInvalidLength; i < block.data.length
			- block.downInvalidLength; i++) {
		//+1
		for (var j = block.leftInvalidLength; j < block.data[i].length
				- block.rightInvalidLength; j++) {
			if (!((y + i < 0))) {
				if (data[y + i][x + j - 1].code == 1
						&& block.data[i][j].code == 1) {
					return true;
				}
			}
		}
	}
	return false;
}
//判断是否可以向右移动
function isRight() {
	if (x + 1 + block.data[0].length - block.rightInvalidLength > data[0].length) {
		return true;
	}
	for (var i = block.topInvalidLength; i < block.data.length
			- block.downInvalidLength; i++) {
		for (var j = block.leftInvalidLength; j < block.data[i].length
				- block.rightInvalidLength; j++) {
			if (!(y + i < 0)) {
				if (data[y + i][x + j + 1].code == 1
						&& block.data[i][j].code == 1) {
					return true;
				}
			}
		}
	}
	return false;
}
//分别计算上下左右的无效长度
function computeTopInvalidLength(blockGroup) {
	var length = 0;
	var flag = true;
	for (var i = 0; i < blockGroup.data.length; i++) {
		for (var j = 0; j < blockGroup.data[i].length; j++) {
			if (blockGroup.data[i][j].code == 1) {
				flag = false;
				break;
			}
		}
		if (!flag) {
			break;
		} else {
			length++;
		}
	}
	blockGroup.topInvalidLength = length;
}
function computeDownInvalidLength(blockGroup) {
	var length = 0;
	var flag = true;
	for (var i = blockGroup.data.length - 1; i >= 0; i--) {
		for (var j = 0; j < blockGroup.data[i].length; j++) {
			if (blockGroup.data[i][j].code == 1) {
				flag = false;
				break;
			}
		}
		if (!flag) {
			break;
		} else {
			length++;
		}
	}
	blockGroup.downInvalidLength = length;
}
function computeLeftInvalidLength(blockGroup) {
	var length = 0;
	var flag = true;
	for (var i = 0; i < blockGroup.data[0].length; i++) {
		for (var j = 0; j < blockGroup.data.length; j++) {
			if (blockGroup.data[j][i].code == 1) {
				flag = false;
				break;
			}
		}
		if (!flag) {
			break;
		} else {
			length++;
		}
	}
	blockGroup.leftInvalidLength = length;
}
function computeRightInvalidLength(blockGroup) {
	var length = 0;
	var flag = true;
	for (var i = blockGroup.data[0].length - 1; i >= 0; i--) {
		for (var j = 0; j < blockGroup.data.length; j++) {
			if (blockGroup.data[j][i].code == 1) {
				flag = false;
				break;
			}
		}
		if (!flag) {
			break;
		} else {
			length++;
		}
	}
	blockGroup.rightInvalidLength = length;
}
//计算出需要删除的行
function clear() {
	var arr = new Array();
	for (var i = 0; i < data.length; i++) {
		var flag = true;
		for (var j = 0; j < data[i].length; j++) {
			if (data[i][j].code == 0) {
				flag = false;
				break;
			}
		}
		if (flag) {
			arr[arr.length] = i;
		}
	}
	return arr;
}
//删除需要删除的行
function del(arr) {
	var clas = $("#blank").css("background-color");
	for (var i = 0; i < arr.length; i++) {
		$("#show" + arr[i]).children().animate({
			"background-color" : clas
		}, 200);
	}
	$("#score").fadeOut("fast", function() {
		var score = $("#score").html();
		score = Number(score);
		switch (arr.length) {
		case 1:
			score += 100;
			break;
		case 2:
			score += 300;
			break;
		case 3:
			score += 600;
			break;
		case 4:
			score += 1000;
			break;
		}
		$("#score").html(score);
		$(this).fadeIn("fast");
	});
	$("#line").fadeOut("fast", function() {
		var line = $("#line").html();
		line = Number(line);
		line += arr.length;
		$("#line").html(line);
		$(this).fadeIn("fast");
	});
	setTimeout(slowDown, 200);
	for (var k = 0; k < arr.length; k++) {
		for (var i = arr[k]; i > 0; i--) {
			for (var j = 0; j < data[i].length; j++) {
				data[i][j] = data[i - 1][j];
			}
		}
		for (var j = 0; j < data[0].length; j++) {
			data[0][j] = new Blo(0, "blank");
		}
	}

}
//开始
function start() {
	if (isSpeedUp) {
		isSpeedUp = false;
		return;
	}
	timer = setInterval(drop, 400);
}
//停止
function stop() {
	clearTimeout(timer);
}
//画下一个块
function drawNextData() {
	compute(nextBlock);
	var table = $("#next");
	table.html("");
	for (var i = 0; i < 5; i++) {
		var tr = $("<tr></tr>");
		tr.attr("id", "next" + i);
		for (var j = 0; j < 5; j++) {
			var td = $("<td></td>");
			var c;
			//j--x //i--y
			c = nextFill(i, j);
			td.addClass(c);
			tr.append(td);
		}
		table.append(tr);
	}
}
//下一个块的填充判断函数
function nextFill(a, b) {
	for (var i = 0; i < nextBlock.data.length; i++) {
		for (var j = 0; j < nextBlock.data[i].length; j++) {
			if (j == b && i == a && nextBlock.data[i][j].code == 1) {
				return nextBlock.data[i][j].color;
			}
		}
	}
	return "nextBlank";
}
//暂停
function pause() {
	if (isDie && isSpeedUp) {
		isSpeedUp = false;
	}
	if (isPause) {
		start();
		if (isDie) {
			isDie = false;
		}
		$("#pauseButton").attr("value", "暂停");
		isPause = false;
	} else {
		stop();
		isSpeedUp = false;
		$("#pauseButton").attr("value", "继续");
		isPause = true;
	}
}
//计算阴影区域
function computeShadow() {
	shadowY = y;
	while (!isDown(shadowY)) {
		shadowY++;
	}
}