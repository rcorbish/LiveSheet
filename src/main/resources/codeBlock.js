

function CodeBlocks() {
	this.codeBlocks = [] ;

	this.add = function( codeBlock ) {
		this.codeBlocks.push( codeBlock ) ;
	}


	this.joinedToEdgeOf = function(codeBlock) {
		// Is the codeBlock underneath any another block ?
		var rc = {} ;

		for (var i = 0; i < this.codeBlocks.length; i++) {
			var testCodeBlock = this.codeBlocks[i];
			if( codeBlock === testCodeBlock ) continue ;   // can't join to self don't test
			if( testCodeBlock.following === codeBlock ) continue ;	// if we're already joined to the block don't test
			// if we're at the same x and the top of the input test block is at the bottom of another block...
			if (Math.abs(codeBlock.x - testCodeBlock.x) < 9
					&& Math.abs(codeBlock.y - (testCodeBlock.y + testCodeBlock.height - 7)) < 9) {
				rc.top = testCodeBlock ;
			}			
			// if we're at the same y and the top of the input test block is at the right of another block...
			if (Math.abs(codeBlock.y - testCodeBlock.y) < 9
					&& Math.abs(codeBlock.x - (testCodeBlock.x + testCodeBlock.width - 7)) < 9) {
				rc.left = testCodeBlock ;
			}			
			// if we're at the same y and the top of the input test block is at the left of another block...
			if (Math.abs(codeBlock.y - testCodeBlock.y) < 9
					&& Math.abs(testCodeBlock.x - (codeBlock.x + codeBlock.width - 7)) < 9) {
				rc.right = testCodeBlock ;
			}			

			if (Math.abs(codeBlock.x - testCodeBlock.x) < 9
					&& Math.abs(testCodeBlock.y - (codeBlock.y + codeBlock.effectiveHeight - 7)) < 9) {
				rc.bottom = testCodeBlock ;
			}
			// At an offset x and the parent is a nestable
			if ( testCodeBlock.nested && 
					Math.abs(codeBlock.x - testCodeBlock.x -50) < 9
					&& Math.abs(codeBlock.y - (testCodeBlock.y + 40 - 7)) < 9) {
				rc.nested = testCodeBlock ;
			}			
		}
		return rc ;
	}

	this.joinBlock  = function(codeBlock) {
		var joinInfo = this.joinedToEdgeOf( codeBlock ) ;

		if( joinInfo.top && !codeBlock.start ) {  // don't test for join top if we're a start block
			console.log( "Join", joinInfo.top.name, "above", codeBlock.name ) ;
			codeBlock.insertAfter( joinInfo.top ) ;
		} else if( joinInfo.bottom ) {
			var endOfChain = codeBlock ;
			while( endOfChain.following ) endOfChain=endOfChain.following ;
			console.log( "Join", joinInfo.bottom.name, "below", codeBlock.name ) ;
			joinInfo.bottom.insertAfter( endOfChain ) ;
		} else if( joinInfo.nested ) {
			console.log( "Join", codeBlock.name, "inside", joinInfo.nested.name ) ;
			joinInfo.nested.child = codeBlock ;
			codeBlock.parent = joinInfo.nested ; 
		}
	}


	this.draw = function( ctx, draggedCodeBlock ) {
		for (var i = 0; i < this.codeBlocks.length; i++) {
			var codeBlock = this.codeBlocks[i];
			if( draggedCodeBlock !== codeBlock ) {
				if (!codeBlock.parent) {
					codeBlock.draw( ctx );
				}
			}
		}
	} ;

	this.codeBlockAt = function( x,y, color ) {
		var rc = null;
		for (var i = this.codeBlocks.length; i>0 ; i--) {
			var codeBlock = this.codeBlocks[i-1];
// Color[3] is alpha component - if we're 0 then we're over a transparent area
			if( color[3]!==0 && x > codeBlock.x
					&& x<codeBlock.x+codeBlock.width && y>codeBlock.y
					&& y < codeBlock.y + codeBlock.height) {
				rc = codeBlock;
				break;
			}
		}
		return rc;
	} ;
}

function CodeBlock( args ) {
	this.name = args.name || "name" ;
	this.type = args.type || 'block' ;
	this.x = args.x || 0 ;
	this.y = args.y || 0 ;
	this.start = this.type === 'event' ;
	this.end = this.type === 'end' ;
	this.nested = (this.type === 'if' || this.type === 'repeat' || this.type === 'else') ;
	this.numInputs = args.numInputs || 0 ;
	this.output = args.output || false ;
	this.height = this.nested ? 95 : ( 20 * ( 2 + Math.max( 0, ( this.numInputs - 1 ) ) ) ) ;
	this.width = args.width || 300 ;
	this.effectiveHeight = this.height ;
	this.following = null,
	this.parent = null

	switch ( this.type ) {
	case 'block' :
		this.color = '#0aa' ;
		break ;
	case 'event' :
		this.color = '#2a0' ;
		break ;
	case 'display' :
		this.color = '#02a' ;
		break ;
	case 'end' :
		this.color = '#a20';
		break ;
	case 'if' :
	case 'else' :
	case 'repeat' :
		this.color = '#abc';
		break ;
	default :
		this.color = '#eee';
		break ;
	}

	this.calcHeight = function() {
		this.effectiveHeight = this.height;
		if( this.following ) {
			this.effectiveHeight += this.following.calcHeight() - 5 ;
		}
		return this.effectiveHeight;
	} ;

	this.insertAfter = function( above ) {
		var currentChild = above.following ;
		if( currentChild ) {
			// if the above already has a child  - replace it with this (or the bottom of this' chain )
			var bottomChild = this ;			
			while( bottomChild.following ) bottomChild = bottomChild.following ; 
			currentChild.insertAfter( bottomChild ) ;
		}
		if( this.parent && above && above.start ) {  // if a start block is replacing existing parent...
													// we won't join properly so move 
													// the above blocks out of the way
			var up = this.parent ;
			while( up.parent ) { 
				up = up.parent ; 
			}
			up.x -= 15 ;
			up.y -= 15 + above.height ;			
		}
		this.setParent( above ) ;

		var ultimateParent = above;
		while (ultimateParent.parent) {
			ultimateParent = ultimateParent.parent;
		}
		ultimateParent.calcHeight();
	} ;


	this.setParent = function( p ) {
		if( !this.start ) { 
			// if already have a parent - make sure parent doesn't think 
			// I'm still part of the chain
			if( this.parent ) {
				this.parent.following = null ;
				var up = this.parent ;
				while( up.parent ) up = up.parent ;
				up.calcHeight() ;
			}

			// if parent has something else in the chain (that I am replacing)...
			if( p ) {
				if( p.following ) {
					p.following.parent = this ;
				}
				if( !p.end ) {
					p.following = this ;  // other part of main code
					this.parent = p ;
				} else {
					p.following = null ;
					this.parent = null ;
					this.y = p.y+p.height+15 ;
					this.x += 15 ;
				}
			} else {
				this.parent = p ;	// Always set a null parent
			}
		}
	} ;

	this.draw = function ( ctx ) {
		var poly;
		if( !this.nested ) {
			var lhs = this.output ? 
					[ 5, 5, 5, this.height-15, 0, this.height-15, 0, this.height - 5, 5, this.height - 5,  5, this.height ] :
					[ 5, 5, 5, this.height ] ;
			var bot = this.end ? 
					[20, this.height, this.width, this.height ] :
					[20, this.height, 20, this.height - 5, 30, this.height - 5, 30, this.height, this.width, this.height ] ;
			var rhs = this.numInputs > 0 ? 
					[ this.width, this.height - 5, this.width - 5, this.height - 5,this.width - 5, this.height - 15 , this.width, this.height - 15,this.width, 5 ] :
					[ this.width, 5 ] ;
			var top = this.start ? [ ] : [ 30, 5, 30, 0, 20, 0, 20, 5 ] ; 
	
			poly =  lhs.concat( bot, rhs, top ) ;
		} else {
			poly = [ 5,5, 5,this.height,   20,this.height,   20,this.height-5,   30,this.height-5, 
			         30,this.height,   45,this.height,   45,40, 70,40, 70,35, 80,35, 
			         80,40, this.width,40, this.width,5, 30,5, 30,0, 20,0, 20,5]
		}
		ctx.fillStyle = this.color ;
		ctx.beginPath();
		ctx.moveTo(poly[0] + this.x, poly[1] + this.y);
		for (var item = 2; item < poly.length - 1; item += 2) {
			ctx.lineTo(poly[item] + this.x, poly[item + 1]
			+ this.y);
		}

		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		if( this.following ) {
			this.following.x = this.x;
			this.following.y = this.y + this.height -5 ;
			this.following.draw(ctx);
		}

		if( this.child ) {
			this.child.x = this.x + 50 ;
			this.child.y = this.y + 40 -5 ;
			this.child.draw(ctx);
		}


		ctx.font = "12px sans";
		ctx.fillStyle = "#fff" ;
		ctx.fillText( this.name, this.x+15, this.y+20, this.width-30 );
	} ;
}

