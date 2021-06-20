# Vue Pay

A simple, light weight payment wrapper module third party payment libraries.

I've played with some other libraries out there, but felt I still needed to do too much wiring so wanted to make a simple little wrapper for my projects that just "worked" as simply as possible.

> For anyone taking a look, I haven't had time to setup a demo and more docs yet. It's probably best to just take a look at the source code or consider contrubuting before posting any issues.


## Release Notes

Please note that this is a work in progress release. The main idea is to use external/embedded elements to generate a user token which can then be used on the API for further processing with the merchant.

* Currently only tested with Stripe elements `card`, `cardNunber`, `cardExpiry`, and `cardCvc` elements.
* The plugin is designed to support multiple gateways in unison which will help with upgrades and testing of multiple versions and merchants.
* The goal is to simplify as much as possible the usage since there are multipe parts to getting thing to work:
    * Including the sdk script.
    * Embedding the elements.
    * Generating the tokens.
    * Sending off the final api request.
    * Easy integration with Vue / Vuex.
    * Dealing with sync and script loads.
* Loads the sdk on demand only via the elements (when used).
* Comes with support for Vue 2 and 3 (though Vue 3 version is just some copied code and untested).
* The plugin is mainly just a wrapper meaning the options and arguments passed in are directly feeding into the sdk.


## Install

```bash
$ sudo npm install @websanova/vue-pay
``` 


## Usage

Using the plugin comes in three (easy) steps.

Once the plugin is included, using the elements should pretty much be automagical for everything else.


### Step 1: Include the plugin / drivers.

Note the matching `stripe` gateway keys. These can be named whatever you like but will be the reference for later requests.

~~~js
// Pay
import pay    from '@websanova/vue-pay/src/v2.js';
import stripe from '@websanova/vue-pay/src/drivers/stripe.v3.js';

Vue.use(pay, {
    gateways: {
        stripe: stripe
    },
    options: {
        stripe: {
            key: process.env.VUE_APP_STRIPE_KEY
        }
    }
});
~~~

### Step 2: Include / style the elements.

The elements will auto load the sdk (url) for us as specifid in the driver. This means that 

**NOTE:** Note the `loaded` event which lets us put up a spinner / overlay while sdk/inputs are loading.

~~~vue
<template>
    <div
        class="form-control"
    >
        <el-input-stripe
            type="card"
            :options="options"
            @loaded="$emit('loaded', $event)"
        />
    </div>
</template>

<script>
    import ElInputStripe from '@websanova/vue-pay/src/elements/InputStripe.vue';

    export default {
        props: {
            type: String,
            placeholder: String,
        },

        computed: {
            options() {
                return {
                    style: {
                        base: {
                            fontSize: '16px',
                            lineHeight: '24px',
                            color: '#495057',
                        },
                        invalid: {}
                    },
                    placeholder: this.placeholder
                };
            }
        },

        components: {
            ElInputStripe
        }
    }
</script>
~~~

### Step 3: Generate the user token.

~~~vue
<template>
    <div>
        <button
            @click="submit"
        />
    </div>
</template>

<script>
    export default {

        methods: {
            submit() {
                Vue.pay.createUser({
                    // Only accepts "card" for now via
                    // "card" or "cardNumber" elements.
                    type:'card',      
                    
                    // keyword here from install letting
                    // us know which merchant to use.
                    gateway: 'stripe' 
                })
                .then((res) => {
                    // The "res" is the respone from the merchant.

                    // make api request
                });
            }
        }
    }
</script>
~~~

### Bonus: Reset

We can also call reset on our form to clear any existing input or errors.

~~~
this.$pay.reset({gateway: 'stripe'});
~~~