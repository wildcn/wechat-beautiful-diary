/*
** 中转处理
*/
var root_path = "./",
    handle = require(root_path + 'handle.js'),
    update = require(root_path + 'update.js'),
    monitor = require(root_path + 'monitor.js'),
    render = require(root_path + 'render.js');

let cpu = {
    // 加载私信详情页
    render_chatDetail:(object)=>{return render.chatDetail(object)},
    // 加载心情广场
    render_publicDiary:(object)=>{return render.publicDiary(object)},
    // 初始化用户信件
	handle_initUserEmail:(object)=>{return handle.initUserEmail(object)},
    // 加载用户信件数据
    render_userEmail:(object)=>{return render.userEmail(object)},
    // 更新一条私信 @param 长连接返回私信内容
    update_chatDetail:(object)=>{return update.privateMessage(object)},
    // 显示万能球详细内容
    render_showGodBall:(object)=>{return render.showGodBall(object)},
    // 更新万能球 -> 私信
    update_godBallChat:(object)=>{return update.godBallChat(object)},
    // 更新万能球 -> 日记
    update_godBallDiary:(object)=>{return update.godBallDiary(object)},
    // 加载日记详情页
    render_dirayDetail:(object)=>{return render.dirayDetail(object)},
    // 加载日记详情页
    handle_initPublicDiary:(object)=>{return handle.initPublicDiary(object)},
     // 日记浏览数
    monitor_diaryBrow:(object)=>{return monitor.diaryBrow(object)},
    // 处理提示
    handle_initOptionTips:(object)=>{return handle.initOptionTips(object)},
    // 更新心情广场评论
    update_squareComments:(object)=>{return update.squareComments(object)},
};
module.exports = cpu;