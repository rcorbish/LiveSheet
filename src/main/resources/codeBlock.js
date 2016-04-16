

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
			if (Math.abs(codeBlock.x - testCodeBlock.x) < 5
				&& Math.abs(codeBlock.y - (testCodeBlock.y + testCodeBlock.height - 7)) < 5) {
				rc.top = testCodeBlock.name ;
			}			
			// if we're at the same y and the top of the input test block is at the right of another block...
			if (Math.abs(codeBlock.y - testCodeBlock.y) < 5
				&& Math.abs(codeBlock.x - (testCodeBlock.x + testCodeBlock.width - 7)) < 5) {
				rc.left = testCodeBlock.name ;
			}			
			// if we're at the same y and the top of the input test block is at the left of another block...
			if (Math.abs(codeBlock.y - testCodeBlock.y) < 5
				&& Math.abs(testCodeBlock.x - (codeBlock.x + codeBlock.width - 7)) < 5) {
				rc.right = testCodeBlock.name ;
			}			

			if (Math.abs(codeBlock.x - testCodeBlock.x) < 5
				&& Math.abs(testCodeBlock.y - (codeBlock.y + codeBlock.effectiveHeight - 7)) < 5) {
				rc.bottom = testCodeBlock.name ;
			}

		}
/*
		// Is the codeblock immediately above another block
		// we need to move to the bottom of the chain of joined blocks for this test
		var cb = codeBlock ;
		while( cb.following ) cb=cb.following ;  // find bottom block in chain to match

		for (var i = 0; i < this.codeBlocks.length; i++) {
			var testCodeBlock = this.codeBlocks[i];
			if( codeBlock === testCodeBlock ) continue ;   // can't join to self don't test
			if( cb.following === testCodeBlock ) continue ; // already joined ? - ignore this test
			
			if (Math.abs(codeBlock.x - testCodeBlock.x) < 5
				&& Math.abs(testCodeBlock.y - (cb.y + cb.height - 7)) < 5) {
				rc.bottom = testCodeBlock.name ;
			}
		}


*/
		
		return rc ;
	}

	this.testJoin = function(codeBlock) {

		if ( !codeBlock.start ) {
			for (var i = 0; i < this.codeBlocks.length; i++) {
				var testCodeBlock = this.codeBlocks[i];
				if( testCodeBlock.following !== codeBlock && !testCodeBlock.end ) {
					if (Math.abs(codeBlock.x - testCodeBlock.x) < 5
							&& Math
							.abs(codeBlock.y
									- (testCodeBlock.y
											+ testCodeBlock.height - 7)) < 5) {
						codeBlock.joinBelow( testCodeBlock ) ;
						return;
					}
				}
			}
		}
		// Joining by moving above a block
		var cb = codeBlock ;
		while( cb.following ) cb=cb.following ;  // find bottom block in chain to match

		if( !codeBlock.end ) {
			for (var i = 0; i < this.codeBlocks.length; i++) {
				var testCodeBlock = this.codeBlocks[i];
				if( cb.following !== testCodeBlock ) {
					if (Math.abs(codeBlock.x - testCodeBlock.x) < 5
							&& Math
							.abs(testCodeBlock.y - (cb.y + cb.height - 7)) < 5) {
						testCodeBlock.joinBelow( cb ) ;
						return;
					}
				}
			}
		}
	} ;

	this.draw = function( ctx ) {
		for (var i = 0; i < this.codeBlocks.length; i++) {
			var codeBlock = this.codeBlocks[i];
			if (!codeBlock.parent) {
				codeBlock.draw( ctx );
			}
		}
	} ;

	this.codeBlockAt = function( x,y ) {
		var rc = null;
		for (var i = 0; i < this.codeBlocks.length; i++) {
			var codeBlock = this.codeBlocks[i];

			if (x > codeBlock.x
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
	this.numInputs = args.numInputs || 0 ;
	this.output = args.output || false ;
	this.height = args.height || ( 30 + ( 15 * this.numInputs ) ) ;
	this.width = args.width || 300 ;
	this.effectiveHeight = this.height ;
	this.following = null,
	this.parent = null

	this.calcHeight = function() {
		this.effectiveHeight = this.height;
		if( this.following ) {
			this.effectiveHeight += this.following.calcHeight() - 5 ;
		}
		return this.effectiveHeight;
	}


	this.joinBelow = function( above ) {
		this.parent = above;
		if( above.following ) {
			var cb = this ;
			while( cb.following ) cb = cb.following ;
			above.following.joinBelow( cb ) ;
		}
		above.following = this ;
		var ultimateParent = above;
		while (ultimateParent.parent) {
			ultimateParent = ultimateParent.parent;
		}
		ultimateParent.calcHeight();
	}

	this.draw = function ( ctx ) {
		var poly;
		
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

/*								
								var lhs = this.output ? 
										[ 7, 7, 7, this.height - 17, 2, this.height - 17, 2, this.height - 7, 7, this.height - 7,   7, this.height - 2 ] :
											[ 7, 7, 7, this.height - 2 ] ;
										var bot = this.end ? 
												[20, this.height - 2, this.width - 2, this.height - 2 ] :
													[20, this.height - 2, 20, this.height - 7, 30, this.height - 7, 30, this.height - 2, this.width - 2, this.height - 2 ] ;
												var rhs = this.numInputs > 0 ? 
														[ this.width - 2, this.height - 7, this.width - 7, this.height - 7,this.width - 7, this.height - 17 , this.width - 2, this.height - 17,this.width - 2, 7 ] :
															[ this.width - 2, 7 ] ;
														var top = this.start ? [ ] : [ 30, 7, 30, 2, 20, 2, 20, 7 ] ; 
*/
								poly =  lhs.concat( bot, rhs, top ) ;

								switch ( this.type ) {
								case 'block' :
									ctx.fillStyle = '#0aa' ;
									break ;
								case 'event' :
									ctx.fillStyle = '#2a0' ;
									break ;
								case 'display' :
									ctx.fillStyle = '#02a' ;
									break ;
								case 'end' :
									ctx.fillStyle = '#a20';
									break ;
								default :
									ctx.fillStyle = '#aaa';
								break ;
								}
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


								ctx.font = "12px sans";
								ctx.fillStyle = "#fff" ;
								ctx.fillText( this.name, this.x+15, this.y+20, this.width-30 );
	} ;
}

