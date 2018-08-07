//配置
var radar = {
    init: function(path) {
        // 将path数据导入
        for (var i in path) {
            this[i] = path[i]
        };
        this.ctx = wx.createCanvasContext('radar');
        var data = this.data;
        this.allPoints = [];
        this.clickPoints = [2, 2, 2, 2, 2, 2];
        this.point = [];
        // 直径
        this.diameter = this.edgeLength/2;
        // 圆心
        this.circleCenter = [this.width/2, this.height/2];
        // 画出5个六边形
        this.drawHexagon(this.edgeLength); 

        // 设置文字偏移量
        this.deviation = [
            [-15,-5],
            [10,0],
            [10,5],
            [-15,15],
            [-35,5],
            [-35,0]
        ]
        this.drawLines(); // 画出交叉线
        


        // 画出描点 layer 几层显示 1为最外层显示 最大 5
        this.drawPoints(this.pointRadius, 1);
        // 画出文字
        this.drawText();
        this.linePoint(this.allPoints);
        for (var i = 0; i < data.length; i++) {
            var num = 5 - Math.floor(parseInt(data[i]) / 20);
            data[i] = this.point[i][num];
        };
        // console.log(data);
        var coverPoints = data;

        this.drawCover(coverPoints); // 根据传入数据画出覆盖物范围

        // 画出最外层六边形的边框
        var outPoint = this.allPoints[0];
        this.outStroke(outPoint);
        this.ctx.draw(); // 绘制

    },
    //画六个六边形
    drawHexagon: function(sixParam) {
        var allPoints = this.allPoints,
            ctx = this.ctx;

        for (var i = 0; i < 6; i++) {
            allPoints[i] = this.getHexagonPoints(this.width, this.height, sixParam - i * sixParam / 5); // 每个点坐标
            ctx.beginPath();
            ctx.moveTo(allPoints[i][5][0], allPoints[i][5][1]); //5 首尾连接
            for (var j = 0; j < 6; j++) {
                ctx.lineTo(allPoints[i][j][0], allPoints[i][j][1]); //1 1-5端对端连接
            }
            var color = 'rgba('+this.themeColor+',0.' + (i/4+2) + ')';
            ctx.setStrokeStyle(color);
            ctx.setFillStyle(color);
            ctx.stroke()
            ctx.fill()
        }
        // ctx.draw()
    },
    // 将每部分直线上的点归为一个数组
    linePoint: function(allPoints) {

        var firstPoint = [],
            secondPoint = [],
            thirdPoint = [],
            forthPoint = [],
            fifthPoint = [],
            sixthPoint = [];
        for (var i = 0; i < allPoints.length; i++) {
            firstPoint.push(allPoints[i][0]);
            secondPoint.push(allPoints[i][1]);
            thirdPoint.push(allPoints[i][2]);
            forthPoint.push(allPoints[i][3]);
            fifthPoint.push(allPoints[i][4]);
            sixthPoint.push(allPoints[i][5]);
        };
        // 将每部分直线上的点归为一个数组
        this.point.push(firstPoint, secondPoint, thirdPoint, forthPoint, fifthPoint, sixthPoint);
        return this.point;
    },
    //画覆盖物
    drawCover: function(coverPoints,grd) {
        var ctx = this.ctx;
        ctx.beginPath();
        // 设置渐变色
        var grd = ctx.createCircularGradient(this.circleCenter[0], this.circleCenter[1], this.diameter);
        grd.addColorStop(0, 'rgba('+this.themeColor+',0.4)');
        grd.addColorStop(1, 'rgba('+this.themeColor+',1)');
        ctx.setFillStyle(grd);
        ctx.setStrokeStyle('white');
        ctx.moveTo(coverPoints[5][0], coverPoints[5][1]); //5
        for (var j = 0; j < 6; j++) {
            ctx.lineTo(coverPoints[j][0], coverPoints[j][1]);
        }
        ctx.stroke();
        ctx.closePath();
        ctx.fill();
    },
    //描点
    drawPoints: function(pointRadius, layer = 5) {
        var ctx = this.ctx,
            allPoints = this.allPoints;
        for (var i = 0; i < layer; i++) {
            for (var k = 0; k < 6; k++) {
                ctx.beginPath();
                ctx.arc(allPoints[i][k][0], allPoints[i][k][1], pointRadius, 0, Math.PI * 2);
                var color = 'rgba('+this.themeColor+',0.' + (k + 2) + ')';
                ctx.setFillStyle(color);
                ctx.closePath();
                ctx.fill();
            }
        }
    },
    // 画出六边形名称
    drawText: function() {
        var ctx = this.ctx,
            allPoints = this.allPoints,
            name = this.name;
        for (var k = 0; k < 6; k++) {
            ctx.beginPath();
            ctx.setFontSize(14);
            var left = allPoints[0][k][0],
                top = allPoints[0][k][1],
                deviation = this.deviation[k];
            left += deviation[0];
            top += deviation[1];
            ctx.fillText(name[k], left, top);
            var color = 'rgb(255,255,255)';
            // ctx.setFillStyle(color);
            ctx.closePath();
        }
        ctx.fill();
    },
    //画交叉的线
    drawLines: function() {
        var ctx = this.ctx,
            allPoints = this.allPoints;
        ctx.beginPath();
        for (var i = 0; i < 3; i++) {
            ctx.moveTo(allPoints[0][i][0], allPoints[0][i][1]); //1-4
            ctx.lineTo(allPoints[0][i + 3][0], allPoints[0][i + 3][1]); //1-4
            var color = 'rgba('+this.themeColor+',0.' + i + ')';
            ctx.setStrokeStyle(color);
            ctx.stroke();
        }
        ctx.closePath();

    },
    outStroke: function(outPoint) {
        var ctx = this.ctx;
        ctx.beginPath();
        ctx.setFillStyle("rgba(0,0,0,0)");
        ctx.fillStyle = "rgba(0,0,0,0)";
        ctx.moveTo(outPoint[5][0], outPoint[5][1]); //5 首尾连接
        for (var j = 0; j < 6; j++) {
            ctx.lineTo(outPoint[j][0], outPoint[j][1]); //1 1-5端对端连接
        }
        ctx.stroke();
        ctx.closePath();
        ctx.fill();
    },
    //传入canvas的宽度和高度还有六边形的边长，就可以确定一个六边形的六个点的坐标了
    getHexagonPoints: function(width, height, edgeLength) {

        var paramX = edgeLength * Math.sqrt(3) / 2;
        var marginLeft = (width - 2 * paramX) / 2;
        var x6 = marginLeft,
            x5 = x6,
            x3 = marginLeft + paramX * 2,
            x2 = x3,
            x4 = marginLeft + paramX,
            x1 = x4,
            paramY = edgeLength / 2,
            marginTop = (height - 4 * paramY) / 2,
            y1 = marginTop,
            y6 = marginTop + paramY,
            y2 = y6,
            y5 = marginTop + 3 * paramY,
            y3 = y5,
            y4 = marginTop + 4 * paramY,
            points = new Array();

        points[0] = [x1, y1];
        points[1] = [x2, y2];
        points[2] = [x3, y3];
        points[3] = [x4, y4];
        points[4] = [x5, y5];
        points[5] = [x6, y6];
        
        return points;
    }
}
module.exports = radar;
