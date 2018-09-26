var Pay = require('./pay.js')();

function plugin(Vue, options) {
    var pay = new Pay(Vue, options);

    Vue.pay = pay;

    Object.defineProperties(Vue.prototype, {
        $pay: {
            get: function () {
                return pay;
            }
        }
    });
};

if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(plugin);
}

export default plugin;