module.exports = {

    /**
     * Sets the key to use for authentication when generating tokens.
     */
    key: null,

    /**
     * Set the name of this merchant driver.
     */
    name: 'braintree',

    /**
     * Load the library if not loaded and init key.
     */
    init: function() {
        var _this = this;

        if (window.braintree) {
            return;
        }

        this.instance.options.async('https://js.braintreegateway.com/web/3.38.1/js/client.min.js', function () {
            //
        });
    },

    /**
     * Fetch token to pass on.
     */
    getToken: function(card, success, error) {
        var _this = this;

        card = this.parseCardData(card);

        braintree.client.create({
            authorization: this.key,
        }, function (createErr, clientInstance) {
              clientInstance.request({
                endpoint: 'payment_methods/credit_cards',
                method: 'post',
                data: {
                    creditCard: card
                }
              }, function (err, res) {
                  if (err) {
                      error(_this.parseTokenError(err));
                  }
                  else {
                      success(_this.parseTokenSuccess(res));
                  }
              });
        });
    },

    /**
     * Parse error, this should be formatted in normal error response for consistency.
     */
    parseTokenError: function (res) {
        var msg,
            field,
            param;

        param = ((((res.details || {}).originalError || {}).fieldErrors || [])[0].fieldErrors || {})[0] || {};

        if (~[undefined, 'number'].indexOf(param.field)) {
            field = 'number';
            msg = this.instance.options.invalidCardNumberMsg;
        }
        else if (~['expirationDate'].indexOf(param.field)) {
            field = 'expiry';
            msg = this.instance.options.invalidCardExpiryMsg;
        }
        else {
            field = res.error.param.field;
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
                token: res.creditCards[0].nonce
            }
        };
    },

    /**
     * Format card data.
     */
    parseCardData: function (data) {
        if (data.expiry && data.expiry.indexOf('/') < 0) {
            data.expiry = data.expiry.substring(0, 2) + '/' + data.expiry.substring(2);
        }

        return {
            name: data.name,
            number: data.number,
            expirationDate: data.expiry,
            billingAddress: data.address,
            cvv: data.cvv || data.cvc
        };
    }
};