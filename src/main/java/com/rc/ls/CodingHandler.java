package com.rc.ls;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.handler.AbstractHandler;

/**
 * This will pull a jpeg from directory and return its data as a raw stream.
 * This only supports jpeg files at present.
 * 
 * @author richard
 *
 */
public class CodingHandler extends AbstractHandler {


	public CodingHandler() {
	}

	@Override
	public void handle(String arg0, Request baseRequest, HttpServletRequest request, HttpServletResponse response)
			throws IOException, ServletException {
		try {
			PrintWriter pw = response.getWriter() ;
			if( arg0.equals("/") ) {
				response.setStatus( HttpServletResponse.SC_OK );	
				response.setContentType("text/html");
				printFile( pw, "/coding.html" ) ;
			} else if (arg0.equals("/data") ) {
				response.setStatus( HttpServletResponse.SC_OK );	
				response.setContentType("application/json");
				pw.print( "Some Secret Data!" ) ;
			} else if (arg0.endsWith(".js") ) {
				response.setStatus( HttpServletResponse.SC_OK );	
				response.setContentType("text/javascript");
//				response.setHeader( "cache-control", "public, max-age=3600, cache" ) ;
				printFile( pw, arg0 ) ;
			} else {
				response.setStatus( HttpServletResponse.SC_NOT_FOUND );	
			}

		} finally {
			response.flushBuffer();
		}
		baseRequest.setHandled( true ) ;		
	}

	protected void printRoadData( PrintWriter pw ) {
	}


	protected void printFile( PrintWriter pw, String fileName ) {
		File brainHtmlFile = new File( "src/main/resources", fileName ) ;
		if( !brainHtmlFile.exists() ) {
			brainHtmlFile = new File( ".", fileName ) ;
		}
		try ( FileReader fr = new FileReader( brainHtmlFile ) ) {
			char[] buf = new char[1024] ;

			int n ; 
			do { 
				n = fr.read(buf);
				if( n > 0 ) {
					pw.write(buf, 0, n );
				}
			} while( n > 0 ) ;
		} catch( IOException ioe ) {
			pw.write( "Error:" + ioe.getMessage() ) ;
		}
	}
}


