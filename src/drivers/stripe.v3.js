export default {
    url: 'https://js.stripe.com/v3',

    isLoaded() {
        return global.Stripe ? true : false;
    },

    /*
     * NOTE: Stripe doesn't seem to like us creating
     *       multiple instance or elements of the same
     *       type which can be a bit problematic in Vue
     *       as we may be using are credit card form in
     *       multiple pages/components. This all helps
     *       in keeping our components fresh and free
     *       of errors whenever/wherever they are used.
     */
    createElement(options, args) {
        var _this = this;

        this._createInstance(options);

        return new Promise(function(resolve) {
            _this._resolvers[args.type] = resolve;

            if (!_this._fields[args.type]) {
                _this._fields[args.type] = _this._elements.create(args.type, args.options);
                
                if (args.onBlur) {
                    _this._fields[args.type].on('blur', args.onBlur);
                }

                if (args.onFocus) {
                    _this._fields[args.type].on('focus', args.onFocus);
                }

                if (args.onChange) {
                    _this._fields[args.type].on('change', args.onChange);
                }

                _this._fields[args.type].on('ready', function() {
                    _this._resolvers[args.type]({
                        elementType: args.type
                    });
                });
            }

            _this._fields[args.type].clear();

            _this._fields[args.type].mount('#' + args.id);
        });
    },

    createUser(options, args) {
        this._createInstance(options);
        
        if (args.type === 'card') {
            return this._instance.createPaymentMethod(Object.assign(args.options || {}, {
                type: 'card',
                card: this._fields.card || this._fields.cardNumber
            }));
        }
    },

    reset() {
        var i;

        for (i in this._fields) {
            this._fields[i].clear();
        }
    },

    _createInstance(options) {
        if (!this._instance) {
            this._fields    = {};
            this._resolvers = {};
            this._instance  = global.Stripe(options.key);
            this._elements  = this._instance.elements();
        }
    }
}