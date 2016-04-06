

var ws = new WebSocketClient( "live-data", function(d) { 
		for( var cellName in d ) {
			update( document.getElementById( cellName ), d[cellName] ) ;
		}
	}) ;

var dependencies = {} ;

function update( elem, val ) {
	
	elem.textContent = val ;
	var dep = dependencies[elem.id] ;
	if( dep ) {
		for( var i=0 ; i<dep.length ; i++ ) {
			var f = dep[i].dataset.func ;
			// need to fix this ....
			update( dep[i], eval(f.replace(elem.id, val) ) ) ;
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
