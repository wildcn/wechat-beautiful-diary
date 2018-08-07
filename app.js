//app.js
var root_path = "./",
    login = require(root_path + 'utils/login.js'),
    api = require(root_path + 'utils/api.js');
App({
    onLaunch: function() {
        var that = this;
        // 是否强制清缓存
        wx.request({
            url: api.getOptions,
            data: {
                name: 'bd_o_forceClear'
            },
            success: function(data) {
                if (data.statusCode == 200 && data.data.errno == 0 && data.data.data.option_value == 1) {
                    console.log('远程设置强制清除缓存')
                    let sessionId = wx.getStorageSync('sessionId'),
                        userRawData = wx.getStorageSync('userRawData'),
                        versionTips = wx.getStorageSync('versionTips');
                    wx.clearStorage();
                    wx.setStorage({
                        key: 'sessionId',
                        data: sessionId
                    })
                    wx.setStorage({
                        key: 'userRawData',
                        data: userRawData
                    })
                    wx.setStorage({
                        key: 'versionTips',
                        data: versionTips
                    })
                }
            }
        })
        login.init((userData) => {
            // console.log(userData);
            wx.setStorageSync('userRawData', userData);
            var pages = getCurrentPages(),
                len = pages.length,
                currentPage = pages[len - 1];
            currentPage && currentPage.setData({
                'userRawData': userData
            })
        });
    },
    globalData: {
        userRawData: null,
        newsDetail: {}
    }
})
