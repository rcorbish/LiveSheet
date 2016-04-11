

var ws = new WebSocketClient( "live-data", function(d) { 
		for( var cellName in d ) {
			var tgt =  document.getElementById( cellName ) ;
			if( tgt ) {
				updateCellValue( tgt, d[cellName] ) ;
			}
		}
	}) ;

var dependencies = {} ;

function updateCellValue( elem, val ) {
	
	elem.textContent = val ;
	var dep = dependencies[elem.id] ;
	if( dep ) {
		for( var i=0 ; i<dep.length ; i++ ) {
			var f = dep[i].dataset.func ;
			// need to fix this ....
			var re = /([A-Z]+[0-9]+)(?![\\s]*[\\(]+)/g ;
			var m = re.exec( f ) ;
			var cellIds = [] ;
			while( m ) {
				cellIds.push( m[0] ) ;
				m = re.exec( f ) ;
			}
			f = f.replace( 'math.', 'Math.' ) ;
			for( var j=0 ; j<cellIds.length ; j++ ) {
				f = f.replace( cellIds[j] , "document.querySelector('#" + cellIds[j] + "').textContent" ) ;
			}
			try {
				updateCellValue( dep[i], eval(f) ) ;
			} catch( e ) {
				updateCellValue( dep[i], "#ERROR" ) ;
			}
		}
	}
}

function addDependency( parent, dependent ) {
	var deps = dependencies[parent.id] ;
	if( deps ) {
		deps.push( dependent ) ;
	} else { 
		dependencies[parent.id] = [ dependent ] ;
	}
}
