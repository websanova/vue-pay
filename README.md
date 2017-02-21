# Vue Upload

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
this.$pay.init(); // For initializing driver / files (like Stripe)

this.$pay.subscribe(); // Subscribe to a selected plan or argument

this.$pay.billing(); // Update (or add) billing info (create customer).

this.$pay.swap();

this.$pay.cancel();

this.$pay.resume();

this.$pay.select();

this.$pay.plan();

this.$pay.plans();

this.$pay.purchase();
```
