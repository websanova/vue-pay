module.exports = {

    init: function() {
        var _this = this;

        if (window.Stripe) {
            return;
        }

        this.options.async('https://js.stripe.com/v2/', function () {
            Stripe.setPublishableKey(_this.options.publicKey);
        });
    },

    /**
     * Parse error, this should be formatted in normal error response for consistency.
     */
    parseTokenError: function (res) {
        return {
            data: {
                errors: [{rule: 'card', field: res.error.param || 'number', message: res.error.message}]
            }
        };
    },

    /**
     * Return token data.
     */
    parseTokenSuccess: function (res) {
        return res.id;
    },


    /**
     * Must send exact card data for stripe.
     */
    parseCardData: function (data) {
        return {
            name: data.name,
            number: data.number,
            exp: data.exp,
            cvc: data.cvc
        };
    }
};