// 通用业务逻辑
var root_path = "./",
    api = require(root_path + 'api.js'),
    util = require(root_path + 'util.js'),
    bus = require(root_path + 'bus.js'),
    cpu = require(root_path + 'cpu.js'),
    update = require(root_path + 'update.js'),
    ws = {};
ws.init = function() {
        wx.connectSocket({
            url: 'wss://tp.fashionwhale.com/wss/',
            success: function(res) {
                // console.log(res);
            }
        })
        ws.on();
        wx.onSocketOpen(function(res) {
            // console.log(res)
        });
        // 监控连接关闭
        wx.onSocketClose(function() {
            ws.reConnect();
        })
        let pages = getCurrentPages(),
            len = pages.length,
            currentPage = this.currentPage = pages[len - 1];
        currentPage.sessionId = wx.getStorageSync('sessionId');
    }
    /*
     ** 更新长连接接受的数据
     */
ws.update = function({
    method,
    data
}) {
    try {
        data = JSON.parse(data);
    } catch (e) {
        console.log(e)
    }
    console.log(data);
    let me = this.currentPage;
    switch (method) {
        case 'privateMessage':
            // 更新用户私信
            cpu.update_chatDetail({
                data: data
            });
            // 万能球
            cpu.update_godBallChat({
                data: data
            })
            cpu.render_showGodBall();
            break;
        case 'publicDiary':
            // 更新公共日记
            cpu.update_godBallDiary({
                data: data
            })
            cpu.render_showGodBall();
            break;
        case 'commentsMessage':
            // 更新心情广场的评论
            cpu.update_squareComments({
                data: data
            })
            cpu.render_publicDiary();
            break;
    }
};
ws.on = function(call) {
    let me = this;
    wx.onSocketMessage(function(res) {
        // 处理参数
        let data = res.data;
        console.log(data);
        try {
            // console.log(data);
            let result = JSON.parse(data),
                method = result.method,
                receiveData = result.data;
            switch (method) {
                case "login":
                    // 长连接链接成功，向服务器发送cliend_id;
                    let client_id = receiveData.client_id;
                    console.log('用户id ' + client_id);
                    client_id && me.bindWs(client_id);
                    break;
                case 'bindSuc':
                    // console.log('绑定成功');
                    break;
                    // 接受私信
                default:
                    if (method) {
                        ws.update({
                            method: method,
                            data: receiveData
                        })
                    }

                    break;
            }
            call && call(res);
        } catch (e) {
            console.log(e)
            return;
        }

    })
}
ws.reConnect = function() {
    // 重连长连接

    wx.connectSocket({
        url: 'wss://tp.fashionwhale.com/wss/',
        success: function(res) {
            console.info('reConnect WebSocket')
        }
    })
}
ws.bindWs = function(client_id) {
    if (!client_id) {
        console.log('client_id参数缺失')
        return;
    }
    if (!wx.getStorageSync('sessionId')) {
        setTimeout(() => {
            this.bindWs(client_id);
        }, 100)
        return;
    }
    wx.request({
        url: api.bindWs,
        data: {
            sessionId: wx.getStorageSync('sessionId'),
            client_id: client_id
        },
        success: (res) => {
            console.log(res.data)
            if (res.data.errno == 12) {
                setTimeout(() => {
                    this.bindWs(client_id);
                }, 100)
                return;
            }
        }
    })
}
module.exports = ws;
