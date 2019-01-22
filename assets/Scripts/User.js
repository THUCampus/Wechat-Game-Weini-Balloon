// 与后端、微信使用者相关的功能

const User = class {
  constructor () {
    this.init = false;
    this.login = false;
    this.money = 0;
    this.biggest_balloon = 1;
  }
  onLoad () {
    this.init = true;
    let self = this;
    wx.login({
      success: function (res) {
        if (res.code) {
          console.log(res.code);
          wx.request({
            url: 'https://zengz16.iterator-traits.com/onLogin',
            data: {
              code: res.code
            },
            method: 'GET',
            success: function (response) {
              console.log('loginSucceed');
              console.log(response.data);
              self.secret = response.data.secret;
              self.biggest_balloon = response.data.biggest_balloon;
              self.money = parseInt(response.data.money);
              self.login = true;
              // self.label.string = self.text + self.money;
            },
            fail: function () {
              console.log('loginFailed');
              self.money = 0;
              self.biggest_balloon = 1;
              self.login = false;
              // self.label.string = self.text + self.money;
            }
          });
        }
      }
    });
  }

  moneyPlus (value) {
    let self = this;
    wx.request({
      url: 'https://zengz16.iterator-traits.com/api/addMoney',
      data: {
        secret: self.secret,
        money: self.money + value,
        score: self.biggest_balloon
      },
      method: 'GET',
      success: function (res) {
        if (res.statusCode === 200) {
          self.money += value;
          console.log('addMoney success');
        }
      },
      fail: function () {
        self.money += value;
        console.log('addMoney failed');
      }
    });
  }

  buyUp (value) {
    let self = this;
    wx.request({
      url: 'https://zengz16.iterator-traits.com/api/buy',
      data: {
        secret: self.secret
      },
      method: 'GET',
      success: function (res) {
        console.log(res.data);
        if (res.data.purchase === 'succeed') {
          self.money -= value;
          console.log('purchase succeed');
        } else {
          console.log('purchase failed!');
        }
      },
      fail: function () {
        console.log('wtf');
      }
    });
  }
};

const user = new User()
module.exports = user;
