import {inject  } from 'vue'
import {reactive} from 'vue';
import Pay       from './pay.js';

const payKey = 'pay';

// NOTE: Create pseudo Vue object for Vue 2 backwards compatibility.

function Vue (obj) {
    var data = obj.data();

    this.state = reactive(data.state);

    this.set = function (data, key, val) {
        data[key] = val;
    }
}

Pay.prototype.install = function (app, key) {
    app.provide(key || payKey, this);

    app.config.globalProperties.$pay = this;
}

//

export function createPay(options) {
    return new Pay(Vue, options);
}

export function usePay(key) {
    return inject(key ? key : payKey);
}