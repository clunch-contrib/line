import Clunch from 'clunch';
import line from '../index';
import image from './test.clunch';

window.clunch = new (Clunch.series('ui-line', line))({
    el: document.getElementById('root'),
    data: function () {
        return {
            data1: [123, 98, 10, -38, 1, 2, 3, 4, 45, 33, 22, 122],
            data2: [
                [123, 98, 10, -38, 1, 2, 3, 4, 45, 33, 22, 122],
                [0, -98, 310, -138, 31, 12, 13, 104, 145, 3, 2, 12]
            ]
        };
    },
    render: image
});
