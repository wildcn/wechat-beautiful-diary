var root_path = "./",
    util = require(root_path + 'util.js'),
    api = require(root_path + 'api.js');
var login = {
    init: function(call) {
        this.userLogin(call);
    },
    userLogin: function(call) {
        // 用户登录
        var me = this,
            sessionId = wx.getStorageSync('sessionId');
        if (sessionId) {
            me.getLogin({
                sessionId: sessionId
            }, function(data) {
                me.seeLoginData(data, call);
            })

        } else {
            me.getCode(function(res) {
                me.getLogin({
                    code: res.code
                }, function(data) {
                    me.seeLoginData(data, call);
                })
            })
        }
    },
    seeLoginData: function(data, call) {
        var me = this;

        if (data.data.errno == 0) {
            // 0 重新生成3rdid 1 读缓存
            let sessionId = this.sessionId = data.data.mySessionId.replace(/-41001/, '');
            wx.setStorageSync('sessionId', sessionId);
            me.getUserInfo(call);
        }else if(data.data.errno == 1){
            // 缓存
            let sessionId = this.sessionId = data.data.mySessionId.replace(/-41001/, '');
            let myId = this.myId =  data.data.userId;
            wx.setStorageSync('sessionId', sessionId);
            wx.setStorageSync('myId', myId);
            me.getUserInfo(call);

        } else if (data.data.errno == 2) {
            // 缓存失效
            me.getCode(function(res) {
                me.getLogin({
                    code: res.code
                }, function(data) {
                    me.seeLoginData(data, call);
                })
            })
        }
    },
    getLogin: function(param, call) {
        // 请求login接口
        var me = this;
        wx.request({
            url: api.login,
            data: param,
            success: function(data) {
                call && call(data);
            },
            fail:function(data){
                setTimeout(()=>{
                    me.getLogin(param,call);
                },300)
            }
        })
    },
    getCode: function(call) {
        console.log('重新请求code');
        wx.login({
            success: function(res) {
                call(res);
            },
            fail: function(res) {
                console.log(res)
            }
        })
    },
    check: function(callback) {
        wx.checkSession({
            success: callback,
            fail: () =>{
                this.userLogin(callback);
            }
        })
    },
    getUserInfo: function(call) {
        // 获取用户详细信息
        var me = this;
        var sessionId = this.sessionId || wx.getStorageSync('sessionId');
        if (!sessionId) {
            console.log('无登录签名');
            me.userLogin(call);
            return;
        }
        me.check(function() {
            // 登录态有效
            wx.getUserInfo({
                success: function(data) {
                    console.log('登录态有效')
                        // 拿到用户明文数据
                    var userData = JSON.parse(data.rawData);
                    if (me.myId) {
                        userData.myId = me.myId || wx.getStorageSync('myId');
                    }
                    wx.setStorageSync('userRawData', userData);
                    call && call(userData);
                    var param = {
                            sessionId: sessionId,
                            encryptedData: data.encryptedData,
                            iv: data.iv
                        }
                        // 请求服务器解密密文 拿openid
                    wx.request({
                        url: api.encry,
                        data: param,
                        success: function(data) {
                            if (data.data.errno == 2) {
                                // sesssionkey失效
                                wx.removeStorage({
                                    key: 'sessionId',
                                    success: function() {
                                        console.log('移除本地sessionId')
                                        me.userLogin();
                                    }
                                })
                            }
                        },
                        fail: function(res) {}
                    })
                }
            })
        })
    },

}


module.exports = login
