var pd = require('pd'),
	EventEmitter = require('eventemitter-light');

module.exports = {
	use: multipleAPIs(function use(name, module) {
		this.modules[name] = module;
		module.attach && module.attach(this);
	}),
	remove: multipleAPIs(function remove(name) {
		var modules = this.modules,
			module = modules[name];
		module.detach(this);
		delete modules[name];
	}),
	module: multipleAPIs(function module(name, module) {
		module = pd.bindAll(module);
		module.mediator = this;
		this.use(name, module);
		module.init && this.on("init", module.init);
		module.detach && this.on("destroy", module.detach);
	}),
	constructor: function constructor(eventEmitter) {
		eventEmitter = eventEmitter || EventEmitter;
		pd.extend(this, eventEmitter, { constructor: constructor });
		eventEmitter.constructor.call(this);
		this.modules = {};
		return this;
	}
};

function multipleAPIs(cb) {
	return proxy;

	function proxy(name) {
		if (typeof name !== "string") {
			return Object.keys(name).forEach(invokeCallback, this);
		}
		cb.apply(this, arguments);

		function invokeCallback(key) {
			cb.call(this, key, name[key]);
		}
	}
}