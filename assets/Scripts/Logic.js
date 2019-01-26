// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

// 游戏主体逻辑，此脚本应赋予气球object上

const user = require('User');

cc.Class({
  extends: cc.Component,

  ctor: function () {
    this.barriers = null;
    this.currentDistance = 0.7; // 0~1 from the balloon to the barrier.
    this.balloonScore = 1; // 气球大小，例: 1m
    this.barriersNode = null;
    this.listeningTouch = false;
    this.score = 1; // 1m originally
    this.shownScore = 1;
  },

  // public成员，是为了获取到游戏中其他素材、物件，需在IDE中拖弋物件来给入
  properties: {
    balloon: {
      default: null,
      type: cc.Node
    },
    barriersPrefab: {
      default: null,
      type: cc.Prefab
    },
    front: {
      default: null,
      type: cc.Node
    },
    touchArea: {
      default: null,
      type: cc.Node
    },
    scoreRoot: {
      default: null,
      type: cc.Node
    },
    pooh: {
      default: null,
      type: cc.Node
    },
    UI: {
      default: null,
      type: cc.Node
    },
    moneyLabel: {
      default: null,
      type: cc.Node
    },
    thisBalloonLabel: {
      default: null,
      type: cc.Node
    },
    biggestLabel: {
      default: null,
      type: cc.Node
    },
    gameOverSound: {
      default: null,
      type: cc.Node
    },
    windBlowSound: {
      default: null,
      type: cc.Node
    },
    blowBalloonSound: {
      default: null,
      type: cc.Node
    }
  },

  start () {
    
    // 初始化
    this.configs = this.node.getComponent('LogicConfigs');
    this.barriers = this.createBarriers(this.front, 177 * 1.7, this.currentDistance * this.configs.barrierInterval);
    this.previousBarriers = {
      root: new cc.Node()
    };
    this.scoreLabel = this.scoreRoot.children[0].getComponent('cc.Label');
    
    // 开始一关
    this.startStage();

    // 启用碰撞
    cc.director.getCollisionManager().enabled = true;

    this.UI.active = false;
    // this.barriers.node.setPosition(0, Configs.barrierInterval * this.currentDistance);
  },

  // update (dt) {},

  createBarriers (parent = null, gap = 0, distance = 0) {
    let barriers = this.node.getComponent('Barriers').instantiateBarriers(parent, gap, distance);
    // let barriers = new Barriers(parent, gap, distance);
    barriers.root.scale = this.balloon.scale;
    barriers.root.opacity = 0;
    barriers.root.runAction(cc.fadeTo(1, 255));
    return barriers;
  },

  startStage () {
    this.listeningTouch = true;
    this.timer = 0;
    this.touchArea.once(cc.Node.EventType.TOUCH_START, this.onTouch, this);
  },

  // 点击后调用此函数
  onTouch () {
    console.log('touch');

    // 停止update、即让气球停止变大变小
    this.listeningTouch = false;

    let radius = this.balloon.scale;

    // 调用数值策划的函数接口，根据radius决定要前进多少，(考虑移除此机制、改成总是前进等距)
    let forwardDistance = this.configs.getForwardDistance(radius, this.currentDistance);
    
    // 前进动画，实际上是让障碍物和背景往下移动
    this.forwardAct = cc.moveBy(this.configs.forwardDuration, cc.p(0, -forwardDistance * this.configs.barrierInterval / this.balloon.scale));
    
    // this.forwardAct.easing(cc.easeIn(3.0));
    
    // 此时必须先创建下一关的障碍物，让它也一起移动，进入到屏幕中，留意创建的y轴位置是(this.currentDistance + 1) * this.configs.barrierInterval
    this.nextBarriers = this.createBarriers(this.front, this.configs.getGap(this.currentDistance) * this.configs.gapBase, (this.currentDistance + 1) * this.configs.barrierInterval / this.balloon.scale);
    
    // 缩放动画，移动完后要缩放，也就是把摄像头拉远的感觉，使气球看起来又变成上一关进关时的大小
    this.scaleAct = cc.scaleBy(this.configs.scaleDuration, 1 / this.balloon.scale);
    
    // 安排缩放动画结束后要做的行为
    let scaleActCallback = cc.callFunc(function (target) {
      // 摧毁前一关的障碍物，并将当前障碍物赋为前一关障碍物，将下一关障碍物赋为当前障碍物
      this.previousBarriers.root.destroy();
      this.previousBarriers = this.barriers;
      this.barriers = this.nextBarriers;
      this.startStage();
    }, this);

    // 安排移动动画结束后要做的行为
    let forwardActCallback = cc.callFunc(function (target) {
      
      // 移动完后要对众多物件执行缩放动画
      this.barriers.root.runAction(cc.sequence(cc.scaleBy(this.configs.scaleDuration, 1 / this.balloon.scale), scaleActCallback));
      this.nextBarriers.root.runAction(cc.scaleBy(this.configs.scaleDuration, 1 / this.balloon.scale));
      this.previousBarriers.root.runAction(cc.scaleBy(this.configs.scaleDuration, 1 / this.balloon.scale));
      this.balloon.runAction(cc.scaleBy(this.configs.scaleDuration, 1 / this.balloon.scale));
      this.scoreRoot.runAction(cc.scaleBy(this.configs.scaleDuration, 1 / this.balloon.scale));
      
      // 也要不断将主角(维尼)缩小，不需套用动画，因为主角在屏幕外。此处用的缩放比例是独立的(避免缩小过快)
      this.pooh.scale *= this.configs.radiusToPoohScale(this.balloon.scale);
    }, this);

    // this.barriers.pair.runAction(this.forwardAct);

    // 对两对障碍物执行移动动画
    this.nextBarriers.pair.runAction(cc.sequence(this.forwardAct, cc.delayTime(0.1), forwardActCallback));
    this.barriers.pair.runAction(cc.moveBy(this.configs.forwardDuration, cc.p(0, -forwardDistance * this.configs.barrierInterval)));
    this.previousBarriers.pair.runAction(cc.moveBy(this.configs.forwardDuration, cc.p(0, -forwardDistance * this.configs.barrierInterval / this.previousBarriers.root.scale)));

    this.score = this.shownScore;

    this.windBlowSound.getComponent('cc.AudioSource').play();
  },

  update (dt) {
    // 若当前处于等待点击的状态，也就是"不处于"关与关的衔接过程
    if (this.listeningTouch) {
      if (this.timer < 0.016) {
        this.blowBalloonSound.getComponent('cc.AudioSource').play();
      }

      // 气球随时间来回变大变小
      this.balloon.scale = this.configs.expandRate(this.timer, this.currentDistance);
      this.shownScore = Math.round(this.score * this.configs.radiusToScoreScale(this.balloon.scale));
      this.scoreRoot.scale = this.balloon.scale;
      this.scoreLabel.string = this.shownScore + ' m';
      this.timer += dt;
      this.timer %= this.configs.cycle;
    }
  },

  // 撞到障碍物后调用此函数、activate UI、结束游戏中所有动画。
  gameOver () {
    this.gameOverSound.getComponent('cc.AudioSource').play();
    this.windBlowSound.getComponent('cc.AudioSource').pause();
    this.listeningTouch = false;
    this.front.stopAllActions();
    this.nextBarriers.pair.stopAllActions();
    this.barriers.pair.stopAllActions();
    if (this.previousBarriers.pair) {
      this.previousBarriers.pair.stopAllActions();
    }
    let that = this;
    let moveCallBack = cc.callFunc(function (target) {
      that.UI.active = true;
      that.moneyLabel.getComponent('cc.Label').string = user.money;
      that.thisBalloonLabel.getComponent('cc.Label').string = that.score + ' m';
      that.biggestLabel.getComponent('cc.Label').string = user.biggest_balloon + ' m';
    });
    // this.UI.runAction(cc.sequence(cc.delayTime(2), moveCallBack));
    let scale = 1 / this.pooh.scale * 1.4;
    let x = 9 * (scale - 1.4) - 100;
    let y = 256 * (scale - 1.4) + 367;
    // this.pooh.runAction(cc.sequence(cc.delayTime(0.5), cc.scaleBy(1.5, scale)));
    this.front.runAction(cc.sequence(cc.delayTime(0.5), cc.spawn(cc.moveTo(1.5, x, y), cc.scaleBy(1.5, scale)), moveCallBack));
    if (this.score > user.biggest_balloon) {
      user.biggest_balloon = this.score;
      console.log(user.biggest_balloon);
    }
    if (user.login) {
      user.moneyPlus(1); // record the new highest
    }
    console.log('game over.');
  },

  backToMenu () {
    console.log('back to menu');
    cc.director.loadScene('Menu');
  },

  // 续命(功能未完善)
  continue () {
    // not a complete function yet
    if (user.money > 0) {
      user.money -= 1;
      if (user.login) {
        user.buyUp(1);
      }
    }
  }
});
