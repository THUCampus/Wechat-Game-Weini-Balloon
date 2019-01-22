// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

// 所有要方便策划调整数值或行为的函数，写于此脚本中。


cc.Class({
  extends: cc.Component,

  ctor: function () {
    this.forwardEase = cc.easeIn(3.0);
  },

  // public成员、包含多个需要方便调整的数值
  properties: {
    // foo: {
    //     // ATTRIBUTES:
    //     default: null,        // The default value will be used only when the component attaching
    //                           // to a node for the first time
    //     type: cc.SpriteFrame, // optional, default is typeof default
    //     serializable: true,   // optional, default is true
    // },
    // bar: {
    //     get () {
    //         return this._bar;
    //     },
    //     set (value) {
    //         this._bar = value;
    //     }
    // },
    barrierInterval: 1100, // pixel
    cycle: 2, // 2 seconds a cycle
    forwardDuration: 1.5,  // 1.5 seconds
    forwardEase: {
      default: null,
      type: cc.ActionEase
    },
    scaleDuration: 1,
    gapBase: 177
  },

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {},

  start () {

  },

  expandRate (time, currentDistance) {
    // return 2 + Math.sin(Math.PI * 2 * (time / this.cycle + 3 / 4));
    return 1.5 - 0.5 * Math.cos(Math.PI * time);
  },
  getForwardDistance (radius, currentDistance) {
    let rMin = 1.4 + 0.4 * (currentDistance - 0.7);
    let rMax = 1.7 - 0.4 * (currentDistance - 0.7);
    let distance = currentDistance + (Math.pow(radius, 2) - Math.pow(rMin, 2)) / (Math.pow(rMax, 2) - Math.pow(rMin, 2)) * (1 - currentDistance);
    distance = 0.10 + currentDistance + 5.0 / 6.0 * (distance - currentDistance);
    return distance;
  },
  getGap (currentDistance) {
    return (1.7 - 0.4 * (currentDistance - 0.7));
  },
  radiusToScoreScale (radius) {
    return 1 + 5 * (radius - 1) / 2;
  },
  radiusToPoohScale (radius) {
    return 1 - (radius - 1) * 0.3;
  }
  // update (dt) {},
});
