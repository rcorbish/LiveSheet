package com.rc.ls;

import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.MultipartConfigElement;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.handler.AbstractHandler;

/**
 * 
 * @author richard
 *
 */
@MultipartConfig
public class UploadHandler extends AbstractHandler {

	@Override
	public void handle(String arg0, Request baseRequest, HttpServletRequest request, HttpServletResponse response)
			throws IOException, ServletException {
		if( arg0.equals("/") ) {
			MultipartConfigElement multipartConfigElement = new MultipartConfigElement((String)null);
			request.setAttribute(Request.__MULTIPART_CONFIG_ELEMENT, multipartConfigElement);

			response.setStatus( HttpServletResponse.SC_OK );	
			Collection<Part> parts = request.getParts() ;				
			baseRequest.setHandled( true ) ;		

			for( Part part : parts ) {
				try( InputStream is = part.getInputStream() ; ) {
					DAG dag = parseExcel(is);
					String rsp = dag.toJson() ;
					response.setContentLength(rsp.length() ); 
					response.setContentType( "application/json");
					PrintWriter pw = response.getWriter() ;
					pw.append( rsp ) ;
					pw.flush();
				}
			}
		}
	}



	private DAG parseExcel( InputStream is ) throws IOException {
		DAG dag = new DAG() ;

		try( Workbook workbook = new XSSFWorkbook(is) ) {
			int numberOfSheets = workbook.getNumberOfSheets();
			if( numberOfSheets>0 ) {
				Sheet sheet = workbook.getSheetAt(0);
				for( Row row : sheet ) {
					if( row.getRowNum()>dag.numRows ) {
						dag.numRows = row.getRowNum()  ;
					}
					for( Cell cell : row ) {
						dag.add( cell ) ;
						if( cell.getColumnIndex()>dag.numColumns ) {
							dag.numColumns = cell.getColumnIndex() ;
						}
					}
				}
			}
		}
		
		return dag ;
	}
}

class DAG {
	Map<String,CellNode> cells = new HashMap<>();
	Map<String,List<String>> edges = new HashMap<>();
	int numRows = 0 ;
	int numColumns = 0 ;

	public void add( Cell cell ) {
		CellNode cn = new CellNode(cell) ;
		cells.put( cn.name, cn ) ;
		for( String dep : cn.dependencies ) {
			if( !cells.containsKey(dep) ) {
				cells.put( dep, new CellNode( dep ) ) ;
			}
			List<String> dependents = edges.get(dep) ;
			if( dependents==null ) {
				dependents = new ArrayList<>() ;
				edges.put( dep, dependents ) ;
			}
			dependents.add( cn.name ) ;
		}
	}

	public String toJson() {
		StringBuilder rc = new StringBuilder() ;
		rc.append( "{\"rows\":").append( numRows ).append( ",\"cols\":").append( numColumns ).append( ",\"dependencies\":{") ;
		char sep = ' ' ;
		for( String source : edges.keySet() ) {
			rc.append( sep ).append( '"' ).append( source ).append( "\":" ) ;
			sep = ',' ;
			char sep2 = '[' ;
			for( String dependent : edges.get( source ) ) {
				rc.append( sep2 ).append( '"' ).append( dependent ).append( '"' ) ;
				sep2 = ',' ;
			}
			rc.append( ']' ) ;
		}
		rc.append( "},\"content\":{") ;
		sep = ' ' ;
		for( CellNode cn : cells.values() ) {
			if( cn.content != null ) {				
				rc.append( sep ).append( '"' ).append( cn.name ).append( "\":" ).append( cn.content ) ;
				sep =',' ;
			}
		}
		rc.append( "}}" ) ;
		return rc.toString() ;
	}
}


class CellNode {
	Pattern formulaReferences = Pattern.compile( "([A-Z]+[0-9]+)(?![\\s]*[\\(]+)" ) ; 

	final String name ;
	String content ;

	List<String> dependencies = new ArrayList<>() ;
	public CellNode( String name ) {
		this.name = name ;
		content = null ;
	}

	public CellNode( Cell cell ) {
		name = String.valueOf( (char)( 'A' + cell.getColumnIndex() ) ) + String.valueOf( cell.getRowIndex() + 1 ) ;
		if( cell.getCellType() == Cell.CELL_TYPE_FORMULA ) {
			content = "\"=" + cell.getCellFormula() + "\"" ;
			Matcher m = formulaReferences.matcher( content ) ;
			while( m.find() ) {
				dependencies.add( m.group() ) ;
			}
		} else if( cell.getCellType() == Cell.CELL_TYPE_STRING ) {
			content = "\"" + cell.getStringCellValue() + "\"" ;
		} else if( cell.getCellType() == Cell.CELL_TYPE_BOOLEAN ) {
			content = cell.getBooleanCellValue() ? "\"true\"" : "\"false\"" ;
		} else if( cell.getCellType() == Cell.CELL_TYPE_NUMERIC ) {
			content = String.valueOf( cell.getNumericCellValue() ) ;
		}
	}
}
