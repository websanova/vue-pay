module.exports = function () {

    var __pay = null;

    var __defaultOptions = {

        merchant: 'stripe',

        http: _http,
        
        promise: _promise,

        async: _async,

        plansKey: 'id',

        plansData: {
            url: 'plans'
        },

        plansAutoFetch: true,

        plansParseResponse: _parseResponse,

        invalidCardNumberMsg: 'Invalid card number.',

        invalidCardExpiryMsg: 'Invalid card expiry.',

        billingData: {
            method: 'put',
            url: 'billing/update'
        },

        subscribeData: {
            method: 'put',
            url: 'subscriptions/update',
            billing: true
        },

        subscribeStopData: {
            method: 'put',
            url: 'subscriptions/stop'
        },

        subscribeCancelData: {
            method: 'put',
            url: 'subscriptions/cancel'
        }
    };

    function _async(u, c) {
        var d = document, t = 'script',
            o = d.createElement(t),
            s = d.getElementsByTagName(t)[0];
      
        o.src = u;
      
        if (c) { o.addEventListener('load', function (e) { c(null, e); }, false); }
      
        s.parentNode.insertBefore(o, s);
    }

    function _http(options) {
        var http = __pay.Vue.http(options);

        http.then(options.success, options.error);

        return http;
    }

    function _promise(func) {
        return Promise.resolve({
            then: function (onFulfill, onReject) {
                func(onFulfill, onReject);
            }
        });
    }

    function _parseResponse(res) {
        return res.data.data;
    }

    function _processPlans() {
        var i, ii,
            key = __pay.options.plansKey,
            current = __pay.$vm.current,
            selected = __pay.$vm.selected,
            plans = __pay.$vm.plans || [];

        for (i = 0, ii = plans.length; i < ii; i++) {
            (function (i) {
                __pay.Vue.set(plans[i], 'current', plans[i][key] === (current || {})[key] ? true : false);
                
                __pay.Vue.set(plans[i], 'selected', plans[i][key] === (selected || {})[key] ? true : false);
            })(i);
        }
    }

    function _getToken(data, cb) {
        return __pay.options.promise(function (onFulfill, onReject) {
            __pay.merchants[__pay.options.merchant].getToken(
                data.card,
                
                function (res) {
                    data.body = data.body || {};

                    data.body.token = res.data.token;

                    onFulfill(cb(data));
                },
                
                onReject
            );
        });
    }

    function _findPlan(plan) {
        var i, ii,
            id,
            key,
            plans;

        key = __pay.options.plansKey;
        
        id = plan[key] || plan;

        plans = __pay.plans() || [];

        for (i = 0, ii = plans.length; i < ii; i++) {
            if (plans[i][key] === id) {
                return plans[i];
            }
        }

        return null;
    }

    function Pay(Vue, options) {
        this.options = Object.assign({}, __defaultOptions, options);

        this.Vue = Vue;

        this.$vm = new Vue({
            data: function() {
                return {
                    plans: null,
                    current: null,
                    selected: null
                };
            }
        });

        this.merchants = {};

        __pay = this;
    }

    Pay.prototype.subscribe = function(data) {
        var planKey = 'plan_' + __pay.options.plansKey,
            selected = __pay.$vm.selected;

        data = Object.assign({}, __pay.options.subscribeData, data);

        if (selected) {
            data.body[planKey] = selected[__pay.options.plansKey];
        }

        if (data.billing) {
            return __pay.billing(data);
        }

        return __pay.options.http(data);
    };

    Pay.prototype.billing = function(data) {
        data = Object.assign({}, __pay.options.billingData, data);

        return _getToken(data, function () {
            return __pay.options.promise(function (onFulfill, onReject) {
                __pay.Vue
                    .http(data)
                    .then(onFulfill, onReject);
            });
        });
    };

    Pay.prototype.unsubscribe = function(data) {
        var subscribeData = __pay.options['subscribe' + (data.stop ? 'Stop' : 'Cancel') + 'Data'];

        data = Object.assign({}, subscribeData, data);

        return __pay.options.http(data);
    };

    Pay.prototype.init = function(merchant, key) {
        __pay.merchants[merchant].key = key;

        __pay.merchants[merchant].instance = __pay;

        __pay.merchants[merchant].init();

        if (__pay.options.plansAutoFetch && ! __pay.$vm.plans) {
            __pay.fetchPlans();
        }
    };

    Pay.prototype.fetchPlans = function() {
        var data = Object.assign({}, __pay.options.plansData);

        if (!data.success) {
            data.success = function (res) {
                __pay.Vue.set(__pay.$vm, 'plans', __pay.options.plansParseResponse(res));

                _processPlans();
            };
        }

        return __pay.options.http(data);
    };

    Pay.prototype.plans = function(plans) {
        if ( ! plans) {
            return __pay.$vm.plans;
        }

        __pay.Vue.set(__pay.$vm, 'plans', plans);

        _processPlans();
    };


    Pay.prototype.plan = function(plan) {
        if ( ! plan) {
            return __pay.$vm.current;
        }

        __pay.Vue.set(__pay.$vm, 'current', _findPlan(plan));

        _processPlans();
    };

    Pay.prototype.select = function(plan) {
        if ( ! plan) {
            return __pay.$vm.selected;
        }

        __pay.Vue.set(__pay.$vm, 'selected', _findPlan(plan));

        _processPlans();
    };

    Pay.prototype.unselect = function(plan) {
        __pay.Vue.set(__pay.$vm, 'selected', null);

        _processPlans();
    };

    Pay.prototype.setMerchant = function(name) {
        __pay.options.merchant = name;
    };

    return Pay;
}