module.exports = {

    /**
     * Sets the key to use for authentication when generating tokens.
     */
    key: null,

    /**
     * Set the name of this merchant driver.
     */
    name: 'stripe',

    /**
     * Load the library if not loaded and init key.
     */
    init: function() {
        var _this = this;

        if (window.Stripe) {
            return;
        }

        this.instance.options.async('https://js.stripe.com/v2/', function () {
            Stripe.setPublishableKey(_this.key);
        });
    },

    /**
     * Fetch token to pass on.
     */
    getToken: function(card, success, error) {
        var _this = this;

        card = this.parseCardData(card);

        Stripe.card.createToken(card, function(status, res) {
            if (res.error) {
                error(_this.parseTokenError(res));
            }
            else {
                success(_this.parseTokenSuccess(res));
            }
        });
    },

    /**
     * Parse error, this should be formatted in normal error response for consistency.
     */
    parseTokenError: function (res) {
        var msg,
            field,
            param;

        param = res.error.param;

        if (~[undefined, 'number'].indexOf(param)) {
            field = 'number';
            msg = this.instance.options.invalidCardNumberMsg;
        }
        else if (~['card[exp_month]', 'exp_year'].indexOf(param)) {
            field = 'expiry';
            msg = this.instance.options.invalidCardExpiryMsg;
        }
        else {
            field = res.error.param;
            msg = res.error.message;
        }

        return {
            data: {
                errors: [{
                    rule: 'card',
                    field: field,
                    msg: msg
                }]
            }
        };
    },

    /**
     * Return token data.
     */
    parseTokenSuccess: function (res) {
        return {
            data: {
                token: res.id
            }
        };
    },

    /**
     * Must send exact card data for stripe.
     */
    parseCardData: function (data) {
        return {
            name: data.name,
            number: data.number,
            exp: data.expiry,
            cvc: data.cvc
        };
    }
};