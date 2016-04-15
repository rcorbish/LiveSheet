

function handleContextMenu(e) {

	var mp = getMousePos(canvas, e);

	// find which thing we clicked on ( or null if FA )
	var contextCodeBlock  = codeBlocks.codeBlockAt(mp.x, mp.y);

	// XLAT menu to page coords
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
	menu = document.createElement("nav");
	menu.onmouseleave = function(e) { 
		if( menu.parentNode ) {
			menu.parentNode.removeChild(menu);
		}
		redrawAll() ;
		menu = null ;
	} ;
	document.getElementById("code").appendChild(menu);
	menu.className = "context-menu" ;

	menu.innerHTML = 
		'<input id="name-edit">' +
		'<ul class="context-menu__items">' +
		'	<li class="context-menu__item">View Task</li>' +
		'	<li class="context-menu__item">Edit Task</li>' +
		'	<li class="context-menu__item">Delete Task</li>' +
		'</ul>' ;

	var nameInput = menu.querySelector( "#name-edit" ) ;
	nameInput.value = codeBlock.name ;	
	nameInput.oninput = function(e) {
		codeBlock.name = this.value ;
		codeBlock.draw(ctx) ;
	} ;
	
	nameInput.focus() ;
	menu.style.left = x+ "px" ;
	menu.style.top = y+ "px" ;
}

