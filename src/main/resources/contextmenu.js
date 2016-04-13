
var contextCodeBlock = null ;

function handleContextMenu(e) {

	var mp = getMousePos(canvas, e);

	// find which thing we clicked on ( or null if FA )
	contextCodeBlock  = codeBlocks.codeBlockAt(mp.x, mp.y);

	// XFER menu to page coords
	var pageX = canvas.offsetLeft + mp.x - 2;
	var pageY = canvas.offsetTop + mp.y - 2 ;

	// We right clicked on a hot zone - something's getting opened ...
	openMenu( contextCodeBlock, pageX, pageY ) ;

	// Don't do automatic stuff  - like a standard menu
	e.preventDefault() ;
	return false ;
}

var menu ;
function openMenu( codeBlock, x, y ) {
	if( menu ) {
		if( menu.parentNode ) {
			menu.parentNode.removeChild(menu);
		}
		menu = null ;
	} else {
		menu = document.createElement("nav");
		menu.onmouseleave = function(e) { 
			if( menu.parentNode ) {
				menu.parentNode.removeChild(menu);
			}
			menu = null ;
		} ;
		document.getElementById("code").appendChild(menu);
		menu.className = "context-menu" ;
		menu.innerHTML = 
			'<ul class="context-menu__items">' +
			'	<li class="context-menu__item">View Task</li>' +
			'	<li class="context-menu__item">Edit Task</li>' +
			'	<li class="context-menu__item">Delete Task</li>' +
			'</ul>' ;

		menu.style.left = x+ "px" ;
		menu.style.top = y+ "px" ;
	}
}

