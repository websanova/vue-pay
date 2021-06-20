var __pay = null;

var __defaultOptions = {
    
};

function _addResolver(gateway, resolver) {
    if (!__pay.resolvers[gateway]) {
        __pay.resolvers[gateway] = [];
    }

    __pay.resolvers[gateway].push(resolver);
}

function _processResolvers(gateway) {
    var resolver;

    if(__pay.scriptLoadStatus === 'loaded') {
        resolver = __pay.resolvers[gateway].splice(0, 1);

        if (resolver.length) {
            resolver[0]();

            if (__pay.resolvers[gateway].length) {
                _processResolvers(gateway);
            }
        }
    }
}

function _loadScript(gateway) {
    return new Promise(function (resolve, reject) {
        var script;

        if (
            !__pay.gateways[gateway].isLoaded() &&
           __pay.scriptLoadStatus === null
        ) {
           __pay.scriptLoadStatus = 'loading';

            script = document.createElement('script');
        
            script.setAttribute('src', __pay.gateways[gateway].url);
            
            script.onload = function() {

                // NOTE: Give the script some time to insert and boot up.
                setTimeout(function() {
                    __pay.scriptLoadStatus = 'loaded';

                    resolve();
                }, 250);
            };
            
            document.body.appendChild(script);
        }
        else {
            resolve();
        }
    });
}

function _createElement(args) {
    return __pay.gateways[args.gateway].createElement(__pay.options[args.gateway], args);
}

function _createUser(args) {
    return __pay.gateways[args.gateway].createUser(__pay.options[args.gateway], args);
}

function _reset(args) {
    __pay.gateways[args.gateway].reset();
}

function Pay(Vue, args) {
    __pay  = this;

    args = args || {};
    
    this.options   = Object.assign(__defaultOptions, args.options);
    this.gateways  = args.gateways;
    this.resolvers = [];

    this.scriptLoadStatus = null;

    delete args.options;
    delete args.gateways;
}

Pay.prototype.generateId = function() {
    return 'el-vue-pay-id-' + Math.floor(Math.random() * 100000000);
};

Pay.prototype.createElement = function(args) {
    return new Promise(function(resolve) {
        _addResolver(args.gateway, function() {
            _createElement(args).then(resolve);
        });

        _loadScript(args.gateway)
            .then(function() {
                _processResolvers(args.gateway);
            });
    });
};

Pay.prototype.createUser = function(args) {
    return _createUser(args);
};

Pay.prototype.createForm = function(args) {
    // TODO: For embedding an entire form.
}

Pay.prototype.reset = function(args) {
    _reset(args);
}

export default Pay;