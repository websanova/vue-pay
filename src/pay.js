module.exports = function() {

    function _async(u, c) {
        var d = document, t = 'script',
            o = d.createElement(t),
            s = d.getElementsByTagName(t)[0];
      
        o.src = u;
      
        if (c) { o.addEventListener('load', function (e) { c(null, e); }, false); }
      
        s.parentNode.insertBefore(o, s);
    }

    function _duckPunch(ctx, name, data) {
        data = Object.assign({}, this.options[name + 'Data'], data);

        data.url = this.watch.prepend + data.url;

        if (data.success) {
            data.success = data.success.bind(ctx);
        }
        
        if (data.error) {
            data.error = data.error.bind(ctx);
        }

        this.options.http.call(this, data);
    }

    function _http(data) {
        this.Vue.http(data).then(data.success, data.error);
    }

    function _parsePlans(res) {
        return res.data.data;
    }

    function _processPlans() {
        var i, ii,
            plan = null,
            key = this.options.planKey,
            plans = this.watch.plans;

        for (i = 0, ii = plans.length; i < ii; i++) {
            plan = plans[i];

            plan.current = plans[i][key] === (this.watch.plan || {})[key] ? true : false;
            plan.selected = plans[i][key] === (this.watch.selected || {})[key] ? true : false;

            this.Vue.set(plans, i, plan);
        }
    }

    var defaultOptions = {
        http: _http,
        async: _async,

        parsePlans: _parsePlans,

        fetchPlansData: {
            url: 'plans',
            success: function(res) {
                this.watch.plans = this.options.parsePlans(res);
                _processPlans.call(this);
            }
        },

        publicKey: null,

        subscribeData: {
            method: 'post',
            url: 'subscriptions'
        },

        billingData: {
            method: 'put',
            url: 'billing'
        },

        cancelData: {
            method: 'delete',
            url: 'subscriptions'
        },

        resumeData: {
            method: 'put',
            url: 'subscriptions/resume'
        },

        swapData: {
            method: 'put',
            url: 'subscriptions/swap'
        },

        purchaseData: {
            method: 'post',
            url: 'purchases'
        },

        merchantKey: null,

        planKey: 'id'
    };

    function Pay(Vue, options) {
        this.options = Object.assign(defaultOptions, options);
        this.Vue = Vue;

        this.watch = new this.Vue({
            data: function() {
                return {
                    prepend: '',
                    plans: [],
                    plan: null,
                    selected: null
                };
            }
        });
    }

    Pay.prototype.init = function(data) {
        var _this = this;

        data = data || {};

        if (!this.watch.plans.length || !this.options.fetchPlansData) {
            if (this.options.fetchPlansData.success) {
                this.options.fetchPlansData.success = this.options.fetchPlansData.success.bind(this);
            }

            this.options.http.call(this, this.options.fetchPlansData);
        }

        this.watch.plan = data.plan || null;
        this.watch.selected = data.selected || null;
        this.watch.prepend = data.prepend || '';

        _processPlans.call(this);

        this.options.merchant.init.call(this);
    };

    Pay.prototype.subscribe = function(data) {
        var _this = this.$pay,
            card,
            success = data.success;

        data = Object.assign({}, _this.options.subscribeData, data);
        data.url = _this.watch.prepend + data.url;
        data.body = data.body || {};

        data.success = function (res) {
            _this.watch.plan = Object.assign({}, _this.watch.selected);
            _this.watch.selected = null;
            _processPlans.call(_this);

            if (success) {
                success.call(this, res);
            }
        };

        if (data.success) { data.success = data.success.bind(this); }
        if (data.error) { data.error = data.error.bind(this); }

        card = _this.options.merchant.parseCardData(data.body);

        Stripe.card.createToken(card, function(status, res) {
            if (res.error) {
                if (data.error) {
                    data.error(_this.options.merchant.parseTokenError(res));
                }
            }
            else {
                data.body.plan_id = _this.select()[_this.options.planKey];
                data.body.subscription_id = _this.options.merchant.parseTokenSuccess(res);

                _this.options.http.call(_this, data);
            }
        });
    };

    Pay.prototype.billing = function(data) {
        var _this = this.$pay,
            card;

        data = Object.assign({}, _this.options.billingData, data);
        data.url = _this.watch.prepend + data.url;
        data.body = data.body || {};

        if (data.success) { data.success = data.success.bind(this); }
        if (data.error) { data.error = data.error.bind(this); }

        card = _this.options.merchant.parseCardData(data.body);

        Stripe.card.createToken(card, function(status, res) {
            if (res.error) {
                if (data.error) {
                    data.error(_this.options.merchant.parseTokenError(res));
                }
            }
            else {
                data.body.subscription_id = _this.options.merchant.parseTokenSuccess(res);

                _this.options.http.call(_this, data);
            }
        });
    };

    Pay.prototype.swap = function(data) {
        var success,
            _this = this.$pay;

        data = data || {};

        if (data.plan) {
            data.body = data.body || {};
            data.body.plan_id = data.plan[_this.options.planKey];

            success = data.success;

            data.success = function (res) {
                _this.watch.selected = null;
                _this.watch.plan = Object.assign({}, data.plan);
                _processPlans.call(_this);

                if (success) {
                    success.call(this, res);
                }
            };

            if (data.success) { data.success = data.success.bind(this); }
            if (data.error) { data.error = data.error.bind(this); }
        }

        _duckPunch.call(this.$pay, this, 'swap', data);
    };

    Pay.prototype.cancel = function(data) {
        _duckPunch.call(this.$pay, this, 'cancel', data);
    };

    Pay.prototype.resume = function(data) {
        _duckPunch.call(this.$pay, this, 'resume', data);
    };

    Pay.prototype.purchase = function(data) {
        _duckPunch.call(this.$pay, this, 'purchase', data);
    };

    Pay.prototype.plans = function(plans) {
        if ( ! plans) {
            return this.watch.plans;
        }

        this.watch.plans = plans;

        _processPlans.call(this);
    };

    Pay.prototype.plan = function(plan) {
        if (plan === undefined) {
            return this.watch.plan;
        }

        this.watch.plan = plan;

        _processPlans.call(this);
    };

    Pay.prototype.select = function(plan) {
        if (plan === undefined) {
            return this.watch.selected;
        }

        this.watch.selected = plan;

        _processPlans.call(this);
    };

    return Pay;
};