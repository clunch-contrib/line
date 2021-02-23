import { isArray } from '@hai2007/tool/type';

/**
 * 折线图
 */

var initConfig = function (attr, that) {

    if (attr.x == null) attr.x = 0;
    if (attr.y == null) attr.y = 0;
    if (attr.width == null) attr.width = that._width;
    if (attr.height == null) attr.height = that._height;

    // 求最值并校对数据格式
    var dataArray = [], maxValue = null, minValue = null;
    for (var i = 0; i < attr.data.length; i++) {
        if (isArray(attr.data[i])) {
            var temp = [];
            for (var j = 0; j < attr.data[i].length; j++) {
                if (maxValue == null || maxValue < attr.data[i][j]) maxValue = attr.data[i][j];
                if (minValue == null || minValue > attr.data[i][j]) minValue = attr.data[i][j];
                temp.push(attr.data[i][j]);
            }
            dataArray.push(temp);
        } else {
            if (maxValue == null || maxValue < attr.data[i]) maxValue = attr.data[i];
            if (minValue == null || minValue > attr.data[i]) minValue = attr.data[i];
            dataArray.push(attr.data[i]);
        }
    }

    // 登记最终和数据
    attr.data = isArray(dataArray[0]) ? dataArray : [dataArray];
    if (attr["max-value"] == null) attr["max-value"] = maxValue;
    if (attr["min-value"] == null) attr["min-value"] = minValue;

};

export default ['number', 'json', '$ruler', '$getLoopColors', function ($number, $json, $ruler, $getLoopColors) {
    return {
        attrs: {

            // 图形绘制的区域
            x: $number(null)(true),
            y: $number(null)(true),
            width: $number(null)(true),
            height: $number(null)(true),

            // 数据
            // [1,2,3,...]
            // [[1,2,3,4,5,6],[6,5,4,3,2,1]]
            data: $json(),

            // 刻度尺数据
            ruler: $json(),

            // 颜色
            colors: $json(null),

            // 最值
            "max-value": $number(null)(true),
            "min-value": $number(null)(true)

        },
        region: {
            default: function (render, attr) {
                initConfig(attr, this);

            }
        },
        link: function (painter, attr) {
            initConfig(attr, this);

            var ruler = $ruler(attr['max-value'], attr['min-value'], 5);

            // 校对颜色
            if (attr.colors == null) attr.colors = $getLoopColors(attr.data.length);

            // Y刻度尺
            this.$reuseSeriesLink('ruler', {
                attr: {
                    x: attr.x + 50,
                    y: attr.y + attr.height - 50,
                    length: attr.width - 100,
                    value: attr.ruler
                }
            });

            // X刻度尺
            this.$reuseSeriesLink('ruler', {
                attr: {
                    x: attr.x + 50,
                    y: attr.y + attr.height - 50,
                    length: attr.height - 100,
                    value: ruler.ruler,
                    direction: "BT",
                    "mark-direction": "left"
                }
            });

            var i, j, x, y;

            var yTemp = (attr.height - 100) / (ruler.max - ruler.min);

            // 绘制曲线
            for (i = 0; i < attr.data.length; i++) {
                painter.beginPath().config('strokeStyle', attr.colors[i]);
                for (j = 0; j < attr.data[i].length; j++) {
                    x = attr.x + 50 + (attr.width - 100) / (attr.data[i].length - 1) * j;
                    y = attr.height - 50 - (attr.data[i][j] - ruler.min) * yTemp;
                    painter.lineTo(x, y);
                }
                painter.stroke();
            }

        }
    };
}];
