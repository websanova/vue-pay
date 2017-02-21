var Pay = require('./pay.js')();

module.exports = (function() {

    return function install(Vue, options) {
        var pay        = new Pay(Vue, options || {}),
            _subscribe = pay.subscribe,
            _billing   = pay.billing,
            _cancel    = pay.cancel,
            _resume    = pay.resume,
            _swap      = pay.swap;
            _purchase  = pay.purchase;

        Object.defineProperties(Vue.prototype, {
            $pay: {
                get: function() {
                    pay.subscribe = _subscribe.bind(this);
                    pay.billing   = _billing.bind(this);
                    pay.cancel    = _cancel.bind(this);
                    pay.resume    = _resume.bind(this);
                    pay.swap      = _swap.bind(this);
                    pay.purchase  = _purchase.bind(this);

                    return pay;
                }
            }
        });
    }
})();
