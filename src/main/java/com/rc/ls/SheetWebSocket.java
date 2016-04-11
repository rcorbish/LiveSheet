package com.rc.ls;

import java.io.IOException;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.WebSocketAdapter;

/**
 *  
 * @author richard
 *
 */

public class SheetWebSocket extends WebSocketAdapter {
	private int clock = 0 ;
	
	private Session session;
	private final ScheduledExecutorService executor ;

	public SheetWebSocket() {
		executor = Executors.newScheduledThreadPool(1);
	}

	// called when the socket connection with the browser is established
	public void onWebSocketConnect(Session session) {
		System.out.println( "Connected WebSocket !!!!!" ) ;
		this.session = session;
		
		executor.scheduleAtFixedRate(() -> {
				clock++ ;
				sendStuff( clock ); 
			}, 0, 60, TimeUnit.SECONDS
		);
		
	}

	// called when the connection closed
	public void onWebSocketClose(int statusCode, String reason) {
		System.out.println("Connection closed with statusCode=" 
				+ statusCode + ", reason=" + reason);
	}

	// called in case of an error
	public void onWebSocketError(Throwable error) {
		error.printStackTrace();    
	}

	// called when a message received from the browser
	public void onWebSocketText(String message) {
		System.out.println( "Received '" + message + "'." ) ;
	}
	
	
	public void sendStuff( int clock ) {
		try {
			if (session.isOpen()) {
				StringBuilder sb = new StringBuilder() ;
				sb.append( "{ \"A3\": " ).append( clock ).append( "," ) ;
				sb.append( "\"B5\": " ).append( clock ).append( "}" ) ;
				session.getRemote().sendString( sb.toString() ) ;
			}
		} catch (Throwable t) {
			t.printStackTrace();
		}
	}

	// closes the socket
	private void stop() {
		try {
			session.disconnect();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

}


