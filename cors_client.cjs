xml_fetch = async function(fet_url) {
	return new Promise(function(a, r) {
		let y = new XMLHttpRequest;
		y.open("GET", fet_url, true);
		y.setRequestHeader("x-requested-with", "xml_fetch");
		y.onreadystatechange = function(ev) {
			console.log(y.readyState, y.status, y.response.length);
			if(y.readyState == 4) {
				let {response, responseType, status} = y;
				a({xml_http_request_instance: y, response, responseType, status});
			}
		};
		y.send("");
	});
};
