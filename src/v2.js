import Pay from './pay.js';

function plugin(Vue, options) {
    Vue.pay = new Pay(Vue, options);

    Object.defineProperties(Vue.prototype, {
        $pay: {
            get: function () {
                return Vue.pay;
            }
        }
    });
}

if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(plugin);
}

export default plugin;