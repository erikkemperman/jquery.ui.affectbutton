(function( $, window, undefined ) { // begin plugin

// Survey-optimized weights, due to Joost Broekens et. al.
// For each of 9 archetypes: radius of influence, affect (x3), features (x8):
var NUM_FEATURES = 8,
  NUM_ARCHETYPES = 9,
  ARCHETYPES = [
    1.7,       0,   0,   0,        0,    0,    0,    0,    0, -0.5,    0,    1,
    1.3,      -1,  -1,  -1,       -1,   -1,   -1,    1,   -1,   -1,   -1,    1,
    1.3,      -1,  -1,   1,     -0.3,    0,    0,   -1,   -1, -0.5, -0.5,    1,
    1.3,      -1,   1,  -1,        1,    1, -0.8,  0.8,    0,    0, -0.3,  0.5,
    1.3,      -1,   1,   1,      0.5,    0,  0.8, -0.8,    1,    1,   -1,    1,
    1.3,       1,  -1,  -1,       -1,   -1,    0,    0,    0,   -1,  0.7,    1,
    1.3,       1,  -1,   1,     -0.5,    0,    0,    0,    0, -0.5,    1,    1,
    1.3,       1,   1,  -1,      0.3,    1,    0,    0, -1.5,  0.7,  0.5, -0.5,
    1.3,       1,   1,   1,      0.5,  0.5,    0,    0,    1,  0.5,    1,  0.5
  ];

$.widget( 'ui.affectbutton', { // begin widget
  
  // ---- Declare user-configurable options with their default values: ----
  options: {
    
    // behavior
    active:           true,
    drag:             typeof $.mobile !== 'undefined',
    offset:           0, // index of initial affect (archetype 0,...,8)
    interval:         40, // (maximum) 25 frames per second
    sensitivity:      1.1,
    sigmoidSteepness: 11,
    sigmoidZero:      8.5,
    swapAD:           false,
    
    // appearance
    cursor:           'crosshair',
    lineCap:          'round',
    scaleMin:         10,
    scaleMax:         370, // max-min=360 is highly composite
    padding:          2,
    
    /* ---- These are the colors preferred by Joost Broekens: ----
    ground: {
      fill0:          '#edfeff',
      fill1:          '#cbdcff',
      stroke:         '#45609c',
      width:          1
    },
    
    face: {
      fill0:          '#ffc800',
      fill1:          '',
      stroke:         '#f0c030',
      width:          1,
      shadow:         '#301020',
      shadowX:        0,
      shadowY:        0
    },
    
    brow: {
      stroke:         '#000000',
      width:          3,
      shadow:         '#c0a060',
      shadowX:        0,
      shadowY:        0
    },
    
    eye: {
      fill0:          '#ffffff',
      stroke:         '#ffffff',
      width:          0.1
    },
    
    iris: {
      fill0:          '#00c8c8',
      fill1:          '',
      stroke:         '#00c8c8',
      width:          0.5
    },
    
    pupil: {
      fill0:          '#000000',
      stroke:         '#00ffff',
      width:          0.25
    },
    
    mouth: {
      fill0:          '#ffc800',
      fill1:          '',
      stroke:         '#c86400',
      width:          1
    },
    
    teeth: {
      fill0:          '#ffffff',
      shadow:         '',
      stroke:         '#ffc800',
      width:          1,
      grid:           [.1, .25, .5, .75, .9]
    }
    */
    
    /* ---- These are colors I personally like better: ---- */
    ground: {
      fill0:         '#534',
      fill1:         '#756',
      stroke:        '#645',
      width:         1
    },
    
    face: {
      fill0:         '#fdb',
      fill1:         '#eb0',
      stroke:        '#fc3',
      width:         1,
      shadow:        '#312',
      shadowX:       2,
      shadowY:       3
    },
    
    brow: {
      stroke:        '#000',
      width:         1,
      shadow:        '#ca6',
      shadowX:       0.75,
      shadowY:       1.5
    },
    
    eye: {
      fill0:         '#fff',
      stroke:        '#aaa',
      width:         0.5
    },
    
    iris: {
      fill0:         '#aed',
      fill1:         '#adf',
      stroke:        '#48c',
      width:         0.5
    },
    
    pupil: {
      fill0:         '#000'
    },
    
    mouth: {
      fill0:         '#200',
      fill1:         '#700',
      stroke:        '#f55',
      width:         0.5
    },
    
    teeth: {
      fill0:         '#fff',
      shadow:        '#ddd',
      stroke:        '#ccc',
      width:         0.5,
      grid:          [0.1, 0.25, 0.5, 0.75, 0.9]
    }
  },
  
  
  // ---- Standard widget functions: ----
  
  _create: function() {
    // TODO assert that this.element is a CANVAS and that options have sane values
    
    var k = this.options.offset * (4 + NUM_FEATURES),
    element = this.element;
    
    // Set up instance state
    $.extend( this, {
      state: {
        pleasure:  ARCHETYPES[k + 1],
        arousal:   ARCHETYPES[k + 2],
        dominance: ARCHETYPES[k + 3]
      },
      feats:   ARCHETYPES.slice( k + 4, k + 4 + NUM_FEATURES ),
      width:   0,
      height:  0,
      active:  this.options.active,
      repaint: true,
      down:    false
    } );
    
    element.css( 'cursor', this.options.cursor );
    
    // Bind event listeners
    $.each( this._eventMap(), function( key, callback ) {
      // When using jQueryMobile, bind to its 'virtual' events
      if ( typeof $.mobile !== 'undefined'
          && ( key === 'mousedown' || key === 'mousemove' || key === 'mouseup' ) ) {
        key = 'v' + key;
      }
      element.on( key + '.ui-affectbutton', callback );
    } );
    
  },
  
  _init: function() {
    if ( this.active ) {
      this.active = false;
      this.alive( true );
    } else {
      this.repaint = true;
      this._paint();
    }
  },
  
  destroy: function() {
    this.element.off( '.ui-affectbutton' );
  },
  
  
  // ---- Public plugin functions: ----
  
  alive: function( active ) {
    if (arguments.length === 0) {
      return this.active;
    }
    active = !!active;
    if ( active !== this.active ) {
      this.active = active;
      if ( active ) {
        this.repaint = true;
        this._paint();
      } else {
        window.clearTimeout( this.timer );
      }
    }
  },
  
  affect: function( affect, value ) {
    var thiz = this;
    switch ( arguments.length ) {
      case 0:
        return $.extend({}, this.state);
      case 1:
        $.each( affect, function( k, v ) {
          thiz.affect( k, v );
        } );
        break;
      case 2:
        if ( thiz.state.hasOwnProperty( affect ) && !isNaN( value = parseFloat( value ) ) ) {
          thiz.state[affect] = thiz._clip( value );
        }
        break;
      default:
        throw 'too many args'; 
    }
    this.repaint = true;
    if ( ! this.active ) {
      this._paint();
    }
  },
  
  reset: function() {
    this.mouseX = this.mouseY = 0;
    this.affect( {
      pleasure: 0,
      arousal: 0, 
      dominance: 0
    } );
  },
  
  
  // ---- Private plugin functions: ----
  
  _eventMap: function() {
    var thiz = this;
    return {
      'selectstart': false,
      'mouseenter': function() {
        thiz.down = false;
        thiz.clicked = false;
        return false;
      },
      'mouseleave': function() {
        thiz.down = false;
        thiz.clicked = false;
        return false;
      },
      'mousedown': function( event ) {
        thiz.down = true;
        thiz.clicked = false;
        thiz._doMouse( event );
        return false;
      },
      'mousemove': function( event ) {
        thiz.clicked = false;
        thiz._doMouse( event );
        return false;
      },
      'mouseup': function( event ) {
        if ( thiz.down ) {
          thiz.clicked = true;
        }
        thiz.down = false;
        thiz._doMouse( event );
        return false;
      }
    };
  },
  
  _doMouse: function( event ) {
    var off;
    if ( this.active && (this.down || !this.options.drag) ) {
      off = this.element.offset();
      this.mouseX = event.pageX - off.left;
      this.mouseY = event.pageY - off.top;
      this._setXY( 2 * this.mouseX / (this.width - 1) - 1
          , 1 - 2 * this.mouseY / (this.height - 1) );
      if ( this.clicked || this.down ) {
        this.element.trigger( 'affectchanged', [this.affect()] );// TODO array???
      }
    }
  },
  
  _setXY: function( x, y ) {
    var pleasure = this.options.sensitivity * x,
      dominance = this.options.sensitivity * y,
      max = Math.max( Math.abs( pleasure ), Math.abs( dominance ) ),
      arousal = 2.1 / (1 + Math.exp( -(this.options.sigmoidSteepness * max - this.options.sigmoidZero) )) - 1;
    this.affect( {
      pleasure: pleasure,
      arousal: this.options.swapAD ? dominance : arousal,
      dominance: this.options.swapAD ? arousal : dominance
    } );
  },
  
  
  _updateFeatures: function() {
    var i, j, k, v, w, r, d1, d2, d3;
    
    // Set all features to 0
    for ( i = 0; i < NUM_FEATURES; i++ ) {
      this.feats[i] = 0;
    }
    
    // We'll need the sum of all weights to normalize at the end
    w = 0;
    
    // For each of the archetypes ...
    for ( j = 0; j < NUM_ARCHETYPES; j++ ) {
      k = j * (4 + NUM_FEATURES);
      
      // ... determine if current PAD is within radius of influence ... 
      if ( (r = ARCHETYPES[k++]) > 0
      && (d1 = Math.abs(this.state.pleasure - ARCHETYPES[k++])) < r
      && (d2 = Math.abs(this.state.arousal - ARCHETYPES[k++])) < r
      && (d3 = Math.abs(this.state.dominance - ARCHETYPES[k++])) < r
      && (v = Math.sqrt(d1*d1 + d2*d2 + d3*d3)) < r ) {
        // ... and if so compute weight as function of distance
        v = r - v;
        // add to the features
        for ( i = 0; i < NUM_FEATURES; i++ ) {
          this.feats[i] += v * ARCHETYPES[k++];
        }
        // and increment total sum of weights
        w += v;
      }
    }
    
    // Normalize the features using summed weight
    for ( i = 0; i < NUM_FEATURES; i++ ) {
      this.feats[i] /= w;
    }
  },
  
  
  // TODO paint function still waaaay too long, split up further
  _paint: function() {
    var time, context, width, height, padding, size,
      // TODO explain/rename variables:
      bew, beh, bmw, bmh,
      cx, cy, gx, gy, fx, fy,
      ex, ey, ew, eh,
      bs, bo, bi,
      mx, my, mu, mw, mh, mt, ml,
      tv;
    
    time = Date.now();
    
    if ( ! (width = this.element.width())
    || ! (height = this.element.height())
    || ! this.element.is( ':visible' ) ) {
      this._repaint( 250 );
      return;
    }
    
    size = width < height ? width : height;
    padding = Math.max( 1, this._scale( size, this.options.padding ) );
    size = Math.max( size - 2*padding, 0 );
    gx = Math.round( (width - size) / 2 );
    gy = Math.round( (height - size) / 2 );
    
    // repaint background if necessary
    if ( width !== this.width || height !== this.height ) {
      context = this.element.get( 0 ).getContext( '2d' );
      $.extend( this, { size: size, width: width, height: height } );
      
      // background
      this._style( context, size, 'ground', 0, 0, 0, height );
      context.fillRect( 0, 0, width, height );
      context.strokeRect( 0, 0, width, height );
      
      // face
      this._face( context, size, width, height, gx, gy );
      
      this.backdrop = context.getImageData( 0, 0, width, height );
      this.repaint = true;
    }
    
    // repaint features if necessary
    if ( this.repaint ) {
      context = context || this.element.get( 0 ).getContext( '2d' );
      this.repaint = false;
      context.putImageData( this.backdrop, 0, 0, 0, 0, width, height );
      
      this._updateFeatures();
      
      // 'base' dimensions of eyes and mouth
      bew = size/4;
      beh = size/12;
      bmw = size/2;
      bmh = size/6;
      
      // offset to follow mouse cursor
      cx = this._clip( (this.mouseX || width/2) - width/2, -width, width ) / 20;
      cy = this._clip( (this.mouseY || height/2) - height/2, -height, height ) / 20;
      
      // features within face
      fx = cx + gx;
      fy = gy + size/10 - ((this.state.arousal + this.state.dominance) * size/20);
      
      // left eye
      ew = bew;
      eh = (beh * (this.feats[0] + 1)) + 1;
      ex = fx + size*(3/20);
      ey = fy + size/3 - eh/2;
      
      // brow (relative to ex,ey)
      bs = (beh * (this.feats[1] + 1)/2) + beh/2 + 1;
      bo = (beh * -this.feats[2])/2;
      bi = (beh * -this.feats[3])/2;
      
      // mouth
      mw = bmw * (this.feats[4] + 1)/6 + bmw/2;
      mh = bmh * (this.feats[5] + 1)/3;
      mt = (bmh * this.feats[6])/2;
      mx = fx + size/2 - mw/2;
      my = fy + size*(2/3) - mt;
      mu = mh - mt;
      ml = mh + mt;
      
      // teeth
      tv = bmh * (this.feats[7] - 1)/3;
      
      // paint eye/brows
      for ( var k = 0; k < 2; k++ ) {
        this._eye( context, size, ex, ey, ew, eh );
        context.save();
        context.clip();
        this._iris( context, size, cx, cy, ex, ey, ew, eh );
        this._pupil( context, size, cx, cy, ex, ey, ew, eh );
        context.restore();
        this._brow( context, size, ex, ey, ew, eh, bs, bi, bo, k );
        ex = fx + size * (6/10);
      }
      
      // paint mouth
      
      // draw shape, fill with teeth color, or shadow if enabled
      this._mouth( context, size, mx, my, mw, mu, ml );
      context.fillStyle = this.options.teeth.shadow || this.options.teeth.fill0;
      context.fill();
      // clip to mouth shape
      context.save();
      context.clip();
      if ( this.options.teeth.shadow ) {
        // if enabled, cover shadow with teeth color 
        this._mouth( context, size, mx + mh/5, my + mh/3, mw, mu, ml );
        context.fillStyle = this.options.teeth.fill0;
        context.fill();
      }
      
      // draw the grid of teeth (non-uniform, suggests a bit of a depth?)
      this._style( context, size, 'teeth' );
      $.each( this.options.teeth.grid, function( kk, vv ) {
        context.beginPath();
        context.moveTo( mx + vv*mw, Math.min(my, my - mu) );
        context.lineTo( mx + vv*mw, Math.max(my, my + ml) );
        context.closePath();
        context.stroke();
      });
      if ( tv === 0 ) {
        // if teeth clenched, draw line in grid color
        context.moveTo( mx, my + mt );
        context.lineTo( mx + mw, my + mt );
        context.stroke();
      } else {
        // otherwise fill mouth
        this._style( context, size, 'mouth'
            , mx + mw/2, my + mh, mw/6
            , mx + mw/2, my + mh/2, mw/2 );
        context.fillRect( mx, my + mt + tv, mw, -2*tv );
      }
      context.restore();

      // ugly.. need to do mouth shape again to paint lips
      this._mouth( context, size, mx, my, mw, mu, ml );
      this._style( context, size, 'mouth' );
      context.stroke();
    }
    
    // schedule next (potential) repaint
    if ( this.active ) {
      this._repaint( this.options.interval - (Date.now() - time) );
    }
  },
  
  _repaint: function( time ) {
    var thiz = this;
    this.timer = window.setTimeout( function() { thiz._paint(); }, time );
  },
  
  _face: function( context, size, width, height, gx, gy ) {
    context.beginPath();
    context.moveTo( gx, gy + size/3 );
    context.bezierCurveTo( gx, gy + size/7, gx + size/6, gy, width/2, gy );
    context.bezierCurveTo( width - gx - size/6, gy, width - gx, gy + size/7, width - gx, gy + size/3 );
    context.lineTo( width - gx, height/2 );
    context.bezierCurveTo( width - gx, height - gy-size/3, width - gx - size/6, height - gy, width/2, height - gy );
    context.bezierCurveTo( gx + size/6, height - gy, gx, height - gy - size/3, gx, height/2 );
    context.lineTo( gx, gy + size/3 );
    context.closePath();
    this._style( context, size, 'face', width/2 - size/4, height/2 - size/7, size/4, width/2, height/2, size );
    this._shadow( context, size, 'face', true );
    this._shadow( context );
    context.fill();
    context.stroke();
  },
  
  _eye: function( context, size, ex, ey, ew, eh ) {
    context.beginPath();
    context.moveTo( ex, ey + eh/2 );
    context.bezierCurveTo( ex, ey + eh/4, ex + ew/6, ey, ex + ew/2, ey );
    context.bezierCurveTo( ex + ew - ew/6, ey, ex + ew, ey + eh/4, ex + ew, ey + eh/2 );
    context.bezierCurveTo( ex + ew, ey + eh - eh/4, ex + ew - ew/6, ey + eh, ex + ew/2, ey + eh );
    context.bezierCurveTo( ex + ew/6, ey + eh, ex, ey + eh - eh/4, ex, ey + eh/2 );
    context.closePath();
    this._style( context, size, 'eye' );
    context.fill();
    context.stroke();
  },
  
  _iris: function( context, size, cx, cy, ex, ey, ew, eh ) {
    context.beginPath();
    context.arc( cx + ex + ew/2, cy + ey + eh/2, ew/4, 0, 2*Math.PI );
    context.closePath();
    this._style( context, size, 'iris'
        , cx + ex + ew/2, cy + ey + eh/2, ew/10
        , cx + ex + ew/2, cy + ey + eh/2, ew/4 ); 
    context.fill();
    context.stroke();
  },
  
  _pupil: function( context, size, cx, cy, ex, ey, ew, eh ) {
    context.beginPath();
    context.arc( cx + ex + ew/2, cy + ey + eh/2, ew/10, 0, 2*Math.PI );
    context.closePath();
    this._style( context, size, 'pupil' );
    context.fill();
    context.stroke();
  },
  
  _brow: function( context, size, ex, ey, ew, eh, bs, bi, bo, k ) {
    context.beginPath();
    context.moveTo( ex, ey + eh/2 - bs + (k ? bi : bo) - (bi-bo)/8 );
    context.lineTo( ex + ew, ey + eh/2 - bs + (k ? bo : bi) );
    context.closePath();
    this._shadow( context, size, 'brow' );
    this._style( context, size, 'brow' );
    context.stroke();
    this._shadow( context );
  },
  
  _mouth: function( context, size, mx, my, mw, up, lo ) {
    context.beginPath();
    context.moveTo( mx, my );
    context.bezierCurveTo( mx, my - up/2, mx + mw/4, my - up, mx + mw/2, my - up );
    context.bezierCurveTo( mx + mw - mw/4, my - up, mx + mw, my - up/2, mx + mw, my );
    context.bezierCurveTo( mx + mw, my + lo/2, mx + mw - mw/4, my + lo, mx + mw/2, my + lo );
    context.bezierCurveTo( mx + mw/4, my + lo, mx, my + lo/2, mx, my );
    context.closePath();
  },
  
  _shadow: function( context, size, feature, blur ) {
    if ( arguments.length === 1 ) {
      context.shadowColor = '';
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 0;
      context.shadowBlur = 0;
    } else {
      context.shadowColor = this.options[feature].shadow;
      context.shadowOffsetX = this._scale( size, this.options[feature].shadowX );
      context.shadowOffsetY = this._scale( size, this.options[feature].shadowY );
      context.shadowBlur = blur ? context.shadowOffsetX + context.shadowOffsetY : 0;
    }
  },
  
  _style: function( context, size, feature ) {
    var color0 = this.options[feature].fill0,
      color1 = this.options[feature].fill1 || color0,
      gradient;
    context.lineWidth = this._scale( size, this.options[feature].width );
    context.strokeStyle = this.options[feature].stroke;
    if ( arguments.length > 3 && color0 !== color1 ) {
      gradient = context['create' + (arguments.length > 7 ? 'Radial' : 'Linear') + 'Gradient']
          .apply( context, Array.prototype.slice.call( arguments, 3 ) );
      gradient.addColorStop( 0, color0 );
      gradient.addColorStop( 1, color1 );
    } else {
      gradient = color0;
    }
    context.fillStyle = gradient;
  },
  
  _scale: function( size, factor ) {
    size = this._clip( size, this.options.scaleMin, this.options.scaleMax );
    return (size * factor) / 100;
  },
  
  _clip: function( value, min, max ) {
    min = min || -1;
    max = max || 1;
    return value < min ? min : value > max ? max : value;
  }

} ); // end widget

} )( jQuery, this ); // end plugin
