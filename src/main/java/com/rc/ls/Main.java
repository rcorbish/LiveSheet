package com.rc.ls;

public class Main {

	public static void main(String[] args) {
		try {
		WebServer server = new WebServer() ;
		} catch( Throwable t ) {
			t.printStackTrace(); 
			System.exit( -1 ); 
		}
	}

}
