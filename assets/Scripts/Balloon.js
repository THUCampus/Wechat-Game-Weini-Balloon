// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

// 气球遭碰撞后的行为

cc.Class({
  extends: cc.Component,
  properties: {
    Logic: {
      default: null,
      type: cc.Node
    }
  },
  // LIFE-CYCLE CALLBACKS:
  // onLoad () {},
  start () {
    // console.log("bu!");

    // 获取Logic脚本中的Logic class
    this.logicScript = this.Logic.getComponent('Logic');
  },

  // 碰到其他东西时，调用gameOver()
  onCollisionEnter: function (self, other) {
    this.logicScript.gameOver();
  }
  // update (dt) {},
});
