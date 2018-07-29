const CONFIG = {
	FlickerRadius:5,
	FlickerLineWidth:5,
	FlickerSpeed:0.3,
	biuSpeed:2,
	biuAccelection:1.02,
	biuCollectionCont:10,
	biuLineWidth:5,
	boomSpeed:10,
	boomAcceleration:0.95,
	boomAngle:Math.PI*2,
	boomTargetCount:100,
	boomGradient:0.015,
	boomGravity:0.98,
	boomCollectionCont: 2,
    boomLineWidth: 3,
    boomLineCont: {min: 10, max: 30},
    animateTimerTarget: 50
};
let canvas = document.querySelector('#fireworks');
let ctx = canvas.getContext("2d");
let cw = canvas.width = window.innerWidth;
let ch = canvas.height = window.innerHeight;

// 获得颜色参数
function randomColor() {
	let num =3;
	let color = [];
	while(num--){
		color.push(Math.floor(Math.random()*256));
	}
	return color.join(",");
}

class Flicker {
	constructor(targetX,targetY) {
		this.targetLoc = {x:targetX,y:targetY};
		this.radius = CONFIG.FlickerRadius;
	}
	draw(){
		ctx.beginPath();
		ctx.arc(this.targetLoc.x,this.targetLoc.y,this.radius,0,Math.PI*2);
		ctx.lineWidth = CONFIG.FlickerLineWidth;
		ctx.strokeStyle = `rgba(${randomColor()},1)`;
		ctx.stroke();
	}
	update(){
		if (this.radius<CONFIG.FlickerRadius) {
			this.radius += CONFIG.FlickerSpeed;
		} else {
			this.radius = 1;
		}
	}
	init() {
		this.draw();
		this.update();
	}
}

class Biubiubiu {
	constructor(startX,startY,targetX,targetY) {
		this.startLoc = {x:startX,y:startY};
		this.targetLoc = {x:targetX,y:targetY};
		this.nowLoc = {x:startX,y:startY};
		this.targetDistance = this.getDistance(this.startLoc.x,this.startLoc.y,this.targetLoc.x,this.targetLoc.y);
		this.speed = CONFIG.biuSpeed;
		this.acceleration = CONFIG.biuAccelection;
		this.angle = Math.atan2(this.targetLoc.y-this.startLoc.y,this.targetLoc.x-this.startLoc.x)
		this.collection = new Array(CONFIG.biuCollectionCont);
		// flag判断条件
		this.arrived = false;
	}
	draw(){
		ctx.beginPath();
		try{
			ctx.moveTo(this.collection[0][0], this.collection[0][1]);
		} catch(e){
			ctx.moveTo(this.nowLoc.x, this.nowLoc.y);
		}
		ctx.lineWidth = CONFIG.biuLineWidth;
		ctx.lineCap = "round";
		ctx.lineTo(this.nowLoc.x,this.nowLoc.y);
		ctx.strokeStyle = `rgba(${randomColor()},1)`;
		ctx.stroke();
	}
	update(){
		this.collection.shift();
		this.collection.push([this.nowLoc.x,this.nowLoc.y]);
		this.speed *= this.acceleration;
		let vx = Math.cos(this.angle)*this.speed;
		let vy = Math.sin(this.angle)*this.speed;
		let nowDistance = this.getDistance(this.startLoc.x,this.startLoc.y,this.nowLoc.x+vx,this.nowLoc.y+vy);
		if(nowDistance>=this.targetDistance){
			this.arrived = true;
		} else {
			this.nowLoc.x += vx;
			this.nowLoc.y += vy;
			this.arrived = false;
		}
	}
	getDistance(x0,y0,x1,y1){
		let X = x1-x0;
		let Y = y1-y0;
		return Math.sqrt(Math.pow(X,2)+Math.pow(Y,2));
	}
	init() {
		this.draw();
		this.update();
	}
}

class Boom {
	constructor(startX,startY){
		this.startLoc = {x:startX,y:startY};
		this.nowLoc = {x:startX,y:startY};
		this.speed = Math.random()*CONFIG.boomSpeed+2;
		this.acceleration = CONFIG.boomAcceleration;
		this.angle = Math.random()*CONFIG.boomAngle;
		this.targetCount = CONFIG.boomTargetCount;
		this.nowNum = 1;
		this.alpha = 1;
		this.gradient = CONFIG.boomGradient;
		this.gravity = CONFIG.boomGravity;

		this.collection = [];
		this.collection = new Array(CONFIG.boomCollectionCont);
		this.arrived = false;
	}
	draw(){
		ctx.beginPath();
		try{
			ctx.moveTo(this.collection[0][0], this.collection[0][1]);
		} catch(e){
			ctx.moveTo(this.nowLoc.x, this.nowLoc.y);
		}
		ctx.lineWidth = CONFIG.boomLineWidth;
		ctx.lineCap = "round";
		ctx.lineTo(this.nowLoc.x,this.nowLoc.y);
		ctx.strokeStyle = `rgba(${randomColor()},${this.alpha}`;
		ctx.stroke();
	}
	update(){
		this.collection.shift();
		this.collection.push([this.nowLoc.x,this.nowLoc.y]);
		this.speed *= this.acceleration;
		let vx = Math.cos(this.angle)*this.speed;
		let vy = Math.sin(this.angle)*this.speed+this.gravity;
		
		if(this.nowNum>=this.targetCount){
			this.alpha -= this.gradient;
		} else {
			this.nowLoc.x += vx;
			this.nowLoc.y += vy;
			this.nowNum++;
		}
		if(this.alpha<=0){
			this.arrived = true;
		}
	}
	init() {
		this.draw();
		this.update();
	}
}

class Animate{
    constructor(){
        this.flickers = [];
        this.bius = [];
        this.booms = [];
        this.timerTarget = CONFIG.animateTimerTarget;
        this.timerNum = 0;
    }
    pushBoom(x,y){
        for(let bi = Math.random()*(CONFIG.boomLineCont.max - CONFIG.boomLineCont.min)+CONFIG.boomLineCont.min; bi>0; bi--){
            this.booms.push(new Boom(x,y));
        }
    }
    initAnimate(target,cb){
        target.map((item,index) => {
            if(!(item instanceof Object)){
                console.error('数组值错');
                return false;
            } else {
                item.init();
                if (cb) {
                    cb(index);
                }
            }
        })
    }
    run() {
        window.requestAnimationFrame(this.run.bind(this));
        ctx.clearRect(0, 0, cw, ch);
        
        this.initAnimate(this.bius,(i) => {
            this.flickers[i].init();
            if(this.bius[i].arrived){
                this.pushBoom(this.bius[i].nowLoc.x,this.bius[i].nowLoc.y);
                this.bius.splice(i,1);
                this.flickers.splice(i,1);
            }
        })

        this.initAnimate(this.booms,(i) => {
            if(this.booms[i].arrived){
                this.booms.splice(i,1);
            }
        })

        if(this.timerNum>=this.timerTarget){
            var startX = Math.random()*(cw/2);
            var startY = ch;
            var targetX = Math.random()*cw;
            var targetY = Math.random()*(ch/2);

            let exbiu = new Biubiubiu(startX, startY, targetX, targetY);
            this.bius.push(exbiu);

            let exflicker = new Flicker(targetX,targetY);
            this.flickers.push(exflicker);
            this.timerNum = 0;
        } else {
            this.timerNum++;
        }
    }
}

let a = new Animate();
a.run();