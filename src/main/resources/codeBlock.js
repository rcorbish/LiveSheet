

function CodeBlocks() {
	this.codeBlocks = [] ;

	this.add = function( codeBlock ) {
		this.codeBlocks.push( codeBlock ) ;
	}

	this.testJoin = function(codeBlock) {
		if ( !codeBlock.start ) {
			for (var i = 0; i < this.codeBlocks.length; i++) {
				var testCodeBlock = this.codeBlocks[i];
				if( testCodeBlock.following !== codeBlock ) {
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
			this.effectiveHeight += this.following.calcHeight();
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
				[ 7, 7, 7, this.height - 17, 2, this.height - 17, 2, this.height - 7, 7, this.height - 7,   7, this.height - 2 ] :
					[ 7, 7, 7, this.height - 2 ] ;
				var bot = [20, this.height - 2, 20, this.height - 7, 30, this.height - 7, 30, this.height - 2, this.width - 2, this.height - 2 ] ;
				var rhs = this.numInputs > 0 ? 
						[ this.width - 2, this.height - 7, this.width - 7, this.height - 7,this.width - 7, this.height - 17 , this.width - 2, this.height - 17,this.width - 2, 7 ] :
							[ this.width - 2, 7 ] ;
						var top = this.start ? [ ] : [ 30, 7, 30, 2, 20, 2, 20, 7 ] ; 

						poly =  lhs.concat( bot, rhs, top ) ;

						ctx.fillStyle = this.type === 'block' ? '#0aa' : this.type === 'event' ?'#0a0': '#820' ;

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
							this.following.y = this.y + this.height - 7;
							this.following.draw(ctx);
						}


						ctx.font = "12px sans";
						ctx.fillStyle = "#fff" ;
						ctx.fillText( this.name, this.x+15, this.y+20, this.width-30 );
	} ;
}

