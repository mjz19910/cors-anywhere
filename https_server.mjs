import {readFileSync} from 'fs';
import {createServer} from './lib/cors-anywhere.js';

var host = process.env.HOST || '0.0.0.0';
var port_secure = 8443;
var port_unsecured = 8080;

let server_base_options = {
	originWhitelist: [], // Allow all origins
	// requireHeader: ['origin', 'x-requested-with'],
	removeHeaders: ['cookie', 'cookie2'],
};

class PromiseDelay {
	constructor(when_done) {
		let pd_state = {
			object_ref: new WeakRef(this)
		};
		let promise = make_delay_promise(pd_state);
		let t = this;
		promise.then(function() {
			t.on_complete();
		});
		this.on_complete = when_done;
		this.immediate = true;
		if(!this.accept)
			this.accept = function() {
				console.log("don't know what promise to unblock");
			};
		if(!this.reject)
			this.reject = function(e) {
				console.warn("No promise to reject");
				console.error(e);
			};
	}
	done() {
		if(this.immediate) {
			this.accept();
			return void this.on_complete();
		}
		this.accept();
	}
}

let next_server_state = new PromiseDelay(() => {
	createServer(server_base_options).listen(port_unsecured, host, function() {
		console.log('Running CORS Anywhere for http  on ' + host + ':' + port_unsecured);
	});
});
createServer({
	...server_base_options,
	httpsOptions: {
		key: readFileSync("selfsigned.key"),
		cert: readFileSync("selfsigned.crt")
	}
}).listen(port_secure, host, function() {
	next_server_state.immediate = false;
	// clear the keys from the javascript view, make it harder to access
	this.cert = void 0;
	this.key = void 0;

	console.log('Running CORS Anywhere for https on ' + host + ':' + port_secure);
});
next_server_state.done();
function make_delay_promise(state) {
	return new Promise(function(accept, reject) {
		let object = state.object_ref.deref();
		object.accept = accept;
		object.reject = reject;
	});
}