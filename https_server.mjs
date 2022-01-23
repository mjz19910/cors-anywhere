import {readFileSync} from 'fs';
import {createServer} from './lib/cors-anywhere.js';

var host = process.env.HOST || '0.0.0.0';
var port_secure = 8443;
var port_unsecured = 8080;
let server_base_options = {
	originWhitelist: [], // Allow all origins
	requireHeader: ['origin', 'x-requested-with'],
	removeHeaders: ['cookie', 'cookie2']
};

createServer({
	...server_base_options,
	httpsOptions: {
		key: readFileSync("selfsigned.key"),
		cert: readFileSync("selfsigned.crt")
	}
}).listen(port_secure, host, function() {
	// clear the keys from the javascript view, make it harder to access
	this.cert = void 0;
	this.key = void 0;

	console.log('Running CORS Anywhere for https\ton ' + host + ':' + port_secure);
});
createServer(server_base_options).listen(port_unsecured, host, function() {
	console.log('Running CORS Anywhere for http\ton ' + host + ':' + port_unsecured);
});
