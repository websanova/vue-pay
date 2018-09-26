# Vue Pay

A simple, light weight payment module for Vue.js.

This module is still in very early stages.




## Install

```bash
$ sudo npm install @websanova/vue-pay
``` 

Require in the project.

```vue
Vue.use(require('@websanova/vue-pay'));
```




## Usage

Coming soon.




## Methods

List of methods.

```javascript
this.$pay.init(); // For initializing driver / files (ex: Stripe).

this.$pay.subscribe(); // Subscribe to a selected plan.

this.$pay.unsubscribe(); // Subscribe to a selected plan.

this.$pay.billing(); // Update (or add) billing info (create customer).

this.$pay.select(); // get or set selected plan.

this.$pay.plan(); // get or set current plan.

this.$pay.plans(); // get plans.

this.$pay.fetchPlans(); // fetch plans

this.$pay.setMerchant(); // Swapping merchants

this.$pay.purchase();
```


### ToDo

* coupons
* purchase
* cart