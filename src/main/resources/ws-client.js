


function WebSocketClient( path, cb ) {

	var loc = window.location, new_uri;
	var new_uri = (loc.protocol === "https:") ? "wss:" : "ws:" ;
	new_uri += "//" + loc.host + "/" + path ;

	var ws = null ;
	var intervalTimer = null ;
	
	var resetWebSocket = function() {
		ws = new WebSocket(new_uri);

		// called when socket connection established
		ws.onopen = function() {
			if( intervalTimer ) {
				clearInterval(intervalTimer);
				intervalTimer = null ;
			}
		};

		// called when a message received from server
		ws.onmessage = function(evt) {
			var data = JSON.parse(evt.data);
			cb( data ) ;
		};

		// called when socket connection closed
		ws.onclose = function() {
			intervalTimer = setInterval(resetWebSocket, 5000);
		};

		// called in case of an error
		ws.onerror = function(err) {
			console.log("ERROR!", err)
		};
	}
	
	resetWebSocket() ;
	
	// sends msg to the server over websocket
	this.send = function(msg) {
		if( ws )
			ws.send(msg);
	}
}

