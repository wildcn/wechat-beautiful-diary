var util = require('../utils/util.js');
//得到每月的天数  
function getDaysOfMonth(year, month) {
    if (year && month) {
        if (month == 2) {
            //2月闰年判断  
            if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
                return 29;
            }
            return 28;
        }
        var bigMonth = [1, 3, 5, 7, 8, 10, 12];
        var littleMonth = [4, 6, 9, 11];
        for (var m in bigMonth) {
            if (bigMonth[m] == month)
                return 31;
        }
        for (var m in littleMonth) {
            if (littleMonth[m] == month)
                return 30;
        }
    }
}

// 根据年月生成日历
function showCalendar(ts = +new Date(), opt = {
    format: '{year,4}-{month,2,0}-{day,2,0}'
}) {
    var year = new Date(ts).getFullYear();
    var month = new Date(ts).getMonth() + 1;
    var date = new Date(year, month - 1, 1); //month月的第一天  
    var curDay = util.formatDate(+new Date(), {
        format: '{year}-{month}-{day}'
    });
    var day = date.getDay() == 0 ? 7 : date.getDay(); //星期 周日设为7 
    var days = getDaysOfMonth(year, month); //month月的总天数  
    var temp = Math.floor((days + day) / 7);
    var rows = (days + day) % 7 == 0 ? temp : (temp + 1); //要循环的行数  
    var allDays = 7 * rows;
    var d = 1;
    var rowsArr = [];

    var formatOpt = {
        format: '{year,4}-{month,2,0}-{day,2,0}'
    };
    var allDate = [],
        arrDate = [];
    for (var i = 1; i <= allDays; i++) {
        allDate.push(util.formatDate(+new Date(year, month - 1, i - (day - 1)), opt));
    }
    var rowsDate = [];
    for (var j = 0; j < rows; j++) {
        var obj = {};
        obj.day = [];
        for (var x = j * 7; x < j * 7 + 7; x++) {

            var className = '',
                tmpl = {},
                cur_month = false,
                name = '',
                cur_day = false;

            if (new Date(allDate[x]).getMonth() + 1 == month) {
                className += 'cur_month';
                cur_month = true;
            }
            if (util.formatDate(+new Date(allDate[x]), {
                    format: '{year}-{month}-{day}'
                }) == curDay) {
                className += " cur_day";
                cur_day = true;
            }
            tmpl.name = util.formatDate(+new Date(year, month - 1, x - (day - 2)), {
                format: '{day}'
            });
            tmpl.time = allDate[x];
            tmpl.className = className;
            tmpl.opt = [cur_month, cur_day];
            tmpl.iconArr = [];
            /* 生成日历的属性 数组 相对属性如下
             ** 是否当月 是否今天
             */
            obj.day.push(tmpl);
        }
        rowsDate.push(obj);
    }
    return {
        allDate: allDate,
        rowsDate: rowsDate,
        option: {
            rows: rows,
            year: year,
            month: month

        }

    };

}
module.exports = {
    showCalendar: showCalendar
}
