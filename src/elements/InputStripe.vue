<template>
    <component
        :id="id"
        :is="tag"
    >
        <slot />
    </component>
</template>

<script>
    export default {
        props: {
            tag: {
                type: String,
                default: 'div'
            },
            type: String,
            options: Object
        },

        data() {
            return {
                id: null
            }
        },

        mounted() {
            var timer;

            if (!this.$pay) {
                console.error('Vue-Pay: Plugin must be installed for use with elements.');
            }
            else {
                this.id = this.$pay.generateId();

                // NOTE: There seems to be occasional issues with
                //       the Stripe mount failing in a race with
                //       Vue actually rendering the element (id).
                //       This little timer will help with that.
                timer = setInterval(() => {
                    if (document.getElementById(this.id)) {
                        clearInterval(timer);
                        
                        this.$pay.createElement({
                            id: this.id,
                            type: this.type,
                            gateway: 'stripe',
                            options: this.options,
                            onBlur: (event) => {
                                this.$emit('blur', event);
                            },
                            onFocus: (event) => {
                                this.$emit('focus', event);
                            },
                            onChange: (event) => {
                                this.$emit('change', event);
                            }
                        })
                        .then(() => {
                            this.$emit('loaded', this.type);
                        });
                    }
                }, 10);
            }
        }
    }
</script>