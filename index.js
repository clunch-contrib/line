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

export default ['number', 'boolean', 'json', '$ruler', '$getLoopColors', '$cardinal', function ($number, $boolean, $json, $ruler, $getLoopColors, $cardinal) {
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
            "min-value": $number(null)(true),

            // 是否插值
            "is-interpolation": $boolean(false)

        },
        region: {
            default: function (render, attr) {
                initConfig(attr, this);

                var ruler = $ruler(attr['max-value'], attr['min-value'], 5);

                // 校对颜色
                if (attr.colors == null) attr.colors = $getLoopColors(attr.data.length);

                var i, j, x, y;

                var yTemp = (attr.height - 100) / (ruler.max - ruler.min);

                // 绘制曲线
                for (i = 0; i < attr.data.length; i++) {
                    for (j = 0; j < attr.data[i].length; j++) {
                        x = attr.x + 50 + (attr.width - 100) / (attr.data[i].length - 1) * j;
                        y = attr.y + attr.height - 50 - (attr.data[i][j] - ruler.min) * yTemp;
                        render(i + '-' + j, {
                            value: attr.data[i][j],
                            color: attr.colors[i],
                            ruler: attr.ruler[j]
                        }).fillCircle(x, y, 10);
                    }
                }

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

            var i, j, x, y, positions, cardinal;

            var yTemp = (attr.height - 100) / (ruler.max - ruler.min);

            // 绘制曲线
            for (i = 0; i < attr.data.length; i++) {

                painter.beginPath().config('strokeStyle', attr.colors[i]);
                if (attr["is-interpolation"]) positions = [];

                for (j = 0; j < attr.data[i].length; j++) {
                    x = attr.x + 50 + (attr.width - 100) / (attr.data[i].length - 1) * j;
                    y = attr.y + attr.height - 50 - (attr.data[i][j] - ruler.min) * yTemp;

                    // 如果需要插值，就把点记录下来先
                    if (attr["is-interpolation"]) positions.push([x, y]);

                    // 否则直接绘制
                    else painter.lineTo(x, y);
                }

                // 插值的话，需要自己计算插值函数
                if (attr["is-interpolation"]) {
                    cardinal = $cardinal().setP(positions);
                    for (j = positions[0][0]; j < positions[positions.length - 1][0]; j += 5) {
                        painter.lineTo(j, cardinal(j));
                    };
                }


                painter.stroke();
            }

        }
    };
}];
