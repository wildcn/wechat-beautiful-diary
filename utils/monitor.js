var root_path = "./",
    api = require(root_path + 'api.js');


let monitor = {};


monitor.diaryBrow = (id) => {
    wx.request({
        url: api.addDiaryBrow,
        data: {
            id: id
        },
        success: (res) => {
            console.log(res.data);
        }
    })
}

module.exports = monitor;
