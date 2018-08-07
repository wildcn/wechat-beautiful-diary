var root_path = "../../../",
    util = require(root_path + 'utils/util.js'),
    api = require(root_path + 'utils/api.js'),
    config = require(root_path + 'utils/config.js'),
    bus = require(root_path + 'utils/bus.js'),
    all = require(root_path + 'utils/all.js'),
    QQMapWX = require(root_path + 'public/js/libs/qqmap-wx-jssdk.min.js'),
    toast = require(root_path + 'utils/webtoast.js'),
    calendar = require(root_path + 'utils/calendar.js');
Page({
    data: config, // 载入config
    onLoad: function(options) {
        // 设置初始日期
        this.setData({
            date: util.formatDate(+new Date(), {
                format: '{year}-{month}-{day}'
            }),
            feedback:{
                qType:['其他问题','界面UI太丑','功能无法实现','用户体验不友好'],
                qIndex:0,
                tips:'请描述具体出现问题的页面和过程。'
            }
        });
        this.root_path = root_path;
        this.setData({
            'curData.option.root_path': root_path
        })
        wx.setNavigationBarTitle({
            title: '意见反馈'
        })
        util.objInsert(all, this);
        bus.init(this)
        this.toast = new toast();
        
    },
    
    savefeedback:function(){
        let sessionId = wx.getStorageSync('sessionId');
        if (!sessionId) {
            return;
        }
        let me = this,fb = me.data.feedback;
        if (!fb.qContent) {
            me.toast.toast({
                title:'内容不能为空'
            })
            return;
        }
        let param = {
            sessionId:sessionId,
            qType:fb.qType[fb.qIndex],
            qContent:fb.qContent
        }
        wx.request({
            url:api.pushFeedback,
            data:param,
            success:function(data){
                if (data.statusCode == 200 && data.data.errno == 0) {
                    me.toast.toast({
                        title:'问题反馈成功'
                    });
                    setTimeout(()=>{
                        wx.navigateBack();
                    },1000)
                }
            }
        })
    },
    contentChange:function(e){
        this.setData({
            'feedback.qContent':e.detail.value
        })
    },
    bindPickerChange:function(e){
        this.setData({
            'feedback.qIndex':e.detail.value
        })
    }
})
