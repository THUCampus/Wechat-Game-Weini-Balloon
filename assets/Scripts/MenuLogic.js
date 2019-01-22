// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

// 菜单逻辑与行为

const user = require('User');

cc.Class({
  extends: cc.Component,

  properties: {

    front: {
      default: null,
      type: cc.Node
    },
    UI: {
      default: null,
      type: cc.Node
    },
    scoreLabel: {
      default: null,
      type: cc.Node
    }
  },

  start () {
    cc.director.preloadScene('Game', function () {
      cc.log('Next scene preloaded');
    });
    this.scoreLabel.children[1].getComponent('cc.Label').string = user.biggest_balloon + ' m';
  },

  startGame () {
    this.UI.runAction(cc.fadeTo(1, 0));
    this.scoreLabel.runAction(cc.fadeTo(1, 0));
    this.front.runAction(cc.moveTo(2, 0, -500));
    let cameraMovedCallback = cc.callFunc(function (target) {
      cc.director.loadScene('Game');
    });
    this.front.runAction(cc.sequence(cc.scaleTo(2, 1), cameraMovedCallback));
  },

  onLoad () {
    if (!user.init) {
      console.log('init user');
      try {
        user.onLoad();
      } catch (error) {
        user.login = false;
        user.init = true;
        user.money = 0
        user.biggest_balloon = 1;
      }
    }
  }
});
