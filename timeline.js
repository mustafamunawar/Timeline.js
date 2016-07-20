
/**
 * Creates a new Timeline.
 * A timeline contains a list of sequences.
 * A sequence contains a list of keyframes (written in JSON format) that define a complex animation. Very similar to CSS keyframes.
 * @class
 */
 
function Timeline()
{
	if(!(this instanceof Timeline)) return new Timeline();
	this.cname='Timeline';
	
	this.sequences=[];
	this.time=0;
	this.is_playing=0;
	this.prev_systime=0;
}


/**
 * Add an animation sequence to the timeline
 *
 * @param dom_ele The DOM element to animate. 
 * @param opts Options for animating the sequence
 * @param opts.duration The duration in seconds
 * @param opts.pos Where to add the sequence. Can specify a absolute position (in seconds). Can  use arithmetic with 'last' or 'last.end' keywords. e.g. 'last+1' means the position is 1 second after the last sequence starts.
 * @param opts.accel Can be '+' or '-'. It is also known as the 'easing function'.
 * @param opts.loop Whether to loop the animation after it is done
 * @return the added Sequence object
 */
 
Timeline.prototype.add=function(dom_ele, opts)
{
	if(dom_ele==undefined)
		return;
		
		
	//set default values
	if(opts.duration==undefined) opts.duration=0.4; 
	if(opts.pos==undefined) opts.pos='last.end+0';  
	if(opts.accel==undefined) opts.accel='+'; 
	if(opts.loop==undefined) opts.loop='off';
	
	
	
	var abs_pos=opts.pos;
	
	
	//this is only needed to evaluate opts.pos if it is a string arithmetic expression e.g 'last+0.5';
	if(typeof  opts.pos === 'string')
	{
		var last_seq=this.sequences.last();
		var last_start=0;
		var last_end=0;
		if(last_seq!=u)
		{
			last_start=last_seq.abs_start_time;
			last_end=last_seq.abs_end_time;
		}
		abs_pos=str(opts.pos);
		abs_pos=abs_pos.replace('last.end', last_end); 
		abs_pos=abs_pos.replace('last', last_start); 
		abs_pos=eval(abs_pos);
	}
	
	
	
	//Let us  pre-compute as much as possibel the timeline sequence. This will save performance later when it is really needed (i.e. in RAF which will be called 55 times per second).
	var seq={}; 
	seq.id='';
	seq.abs_start_time=abs_pos;
	seq.abs_end_time=abs_pos+opts.duration ;
	seq.loop=opts.loop;
	seq.props=[];
	
	
	for(var prop_name in opts.seq)
	{
		if(!opts.seq.hasOwnProperty(prop_name))
			continue;
		
		var keyframes=opts.seq[prop_name];
		var cur=dom_ele[prop_name]();
		if(keyframes['0']==undefined)
			keyframes['0']='cur';
		
		if(keyframes['100']==undefined)
			keyframes['100']='cur';
		
		
		//a special keyframe value is 'cur'. It is the current value as computed when add() is called. 
		var percents=Object.keys(keyframes).map(Number).sort('number');
		for(var i=1; i<percents.length;  i++)
		{	
			//keyframes['0'] not added, used as start for next percent
			var prop={};	
			if(i==1)
				prop.orig_val=cur;
		
			prop.name=prop_name;
			prop.accel=opts.accel;
			var percent=percents[i];
			var percent_prev=percents[i-1];
			
			//eval is needed because keyframes can have string arithmetic expressions e.g. 'cur+360'
			prop.start_val= eval(keyframes[percent_prev]);
			prop.end_val  = eval(keyframes[percent]);
			
			
			prop.duration=(percent-percent_prev)/100 * opts.duration;
			prop.start_time=(percent_prev/100)*opts.duration;
			prop.end_time=(percent/100)*opts.duration;
			
			
			prop.dom_ele=dom_ele;
			seq.props.push(prop);
		}
	}
	this.sequences.push(  seq );
	return this.sequences.last();
}


/**
 * Reset all DOM elements to make their properties have the original values (the values before the timeline was run)
 */

Timeline.prototype.restore_orig_values=function()
{
	for(var i=0; i<this.sequences.length; i++)
	{
		var seq=this.sequences[i];
		for(var j=0; j<seq.props.length; j++)
		{
			var prop=seq.props[j];
			if(prop.orig_val!=u)
				prop.dom_ele[prop.name](prop.orig_val);
		}
	}
}



/**
 * Play the timeline at normal speed.
 */

Timeline.prototype.play=function()
{
	this.is_playing=1;
	if(this.raf_bind==undefined)
		this.raf_bind=this.raf.bind(this);
	requestAnimationFrame(this.raf_bind);
}



/**
 * Pause the timeline.
 */

Timeline.prototype.pause=function()
{
	this.is_playing=0;
	this.prev_systime=0;
}



 
 
/**
 * Reset the timleine to its beginning state (as if it was never run).
 */

 
Timeline.prototype.reset=function()
{
	this.time=0;
	this.prev_systime=0;
	this.is_playing=0;
	this.sequences=[];
	this.restore_orig_values();
}




/**
 * @private
 * Is called on each Request Animation Frame. In many systems, this is about every ~17ms to achieve an 56 frames per second.
 * I tend to keep functions small. However, RAF needs every bit of performance (for smooth animations), hence it minimizes external function calls.
 */

Timeline.prototype.raf=function(systime)
{
	//return if paused or stopped
	if(this.is_playing==0)
		return;
	
	if(this.prev_systime==0)
		this.prev_systime=systime;
	
	//see the change in time since the last RAF call. Add this delta to the total elapsed time of the timeline
	var dt = systime - this.prev_systime;
	this.prev_systime=systime;
	this.time+=(dt/1000);
	
	//iterate over sequences
	var num_seq_completed=0;
	for(var i=0; i<this.sequences.length; i++)
	{
		var seq=this.sequences[i];
		if(seq.abs_start_time>this.time)
			continue;
		
		
		if(seq.completed)
		{
			num_seq_completed++;
			continue;
		}
		
		for(var j=0; j<seq.props.length; j++)
		{
			var prop=seq.props[j];
			var abs_prop_start_time=seq.abs_start_time+prop.start_time;
			var prop_end_time_abs=seq.abs_start_time+prop.end_time;
			if(abs_prop_start_time>this.time)
				continue;
			

			//an easing function takes in a percentage (of time), and returns a new percentage
			
			
			var percent=(this.time-abs_prop_start_time)/prop.duration;  //percent progress of prop
			
			if(prop.accel=='+') //easein cubic
				percent=percent*percent*percent;

			else if(prop.accel=='-')  //easeout quadric
				percent=(--percent)*percent*percent+1;


			var new_val;
			if(prop.start_val.length==undefined)
				new_val=prop.start_val + (percent*  (prop.end_val-prop.start_val)   ) ;
			else
			{
				new_val=array(prop.start_val.length);
				for(var k=0; k<prop.start_val.length; k++)
					new_val[k]=prop.start_val[k] + (percent*  (prop.end_val[k]-prop.start_val[k])   ) ;
			}

			if(prop_end_time_abs<=this.time)
			{
				prop.item[prop.name](prop.end_val);
				continue;
			}


			prop.item[prop.name](new_val);
		}
		
		
		if(seq.abs_end_time<=this.time)
		{
			if( (seq.loop=='on') || (seq.loop=='pause') )
			{
				var seq_duration=seq.abs_end_time-seq.abs_start_time;
				seq.abs_start_time+=seq_duration;
				if(seq.loop=='pause')
					seq.abs_start_time+=1.5;
				seq.abs_end_time=seq.abs_start_time+seq_duration;
				continue;
			}
			
			seq.completed=1;
		}
	}
	
	if(num_seq_completed==this.sequences.length)
	{
		//completed entire timeline. send a callback
		if(this.complete_cb)
			this.complete_cb();
		
		return;
	}
	
	
	requestAnimationFrame(this.raf_bind);
}



//These are example sequences that can be added to the timeline right away.
seq={};
seq.fadein=
{
	opacity: 
	{
		0: 0,
		100: 1
	}
};

seq.fadeout=
{
	opacity: 
	{
		0: 1,
		100: 0
	}
};

seq.fadeinout=
{
	opacity: 
	{
		0: 0,
		50: 1,
		100: 0
	}
};

seq.popin=
{
	scale: 
	{
		0:  [0.4, 0.4],
		85: [1.08, 1.08]
	}
};


seq.slideup=
{
	translate: 
	{
		0: [0,20,0]
	}
};





seq.bounce=
{
	translate: 
	{
		20: [0,0,0],
		40: [0,-30,0],
		43: [0,-30,0],
		53: [0,0,0],
		70: [0,-15,0],
		80: [0,0,0],
		90: [0,-5,0]
	}
};

seq.rotate360=
{
	rotatez:
	{
		100: 'cur+360'
	}
};



seq.wobble=
{
	translate: 
	{
		15: [-50,0,0],
		30: [40,0,0],
		45: [-30,0,0],
		60: [20,0,0],
		75: [-10,0,0]
	},
	
	rotate: 
	{
		15: [0,0, -5],
		30: [0,0, 3],
		45: [0,0, -3],
		60: [0,0, 3],
		75: [0,0, -2]
	}
};



seq.tada=
{
	scale: 
	{
		10: [1, 0.9],
		20: [1, 0.9],
		30: [1, 1.1],
		40: [1, 1.1],
		50: [1, 1.1],
		60: [1, 1.1],
		70: [1, 1.1],
		80: [1, 1.1],
		90: [1, 1.1]
	},
	
	rotatez: 
	{
		10: 'cur+3',
		20: 'cur+3',
		30: 'cur+3',
		40: 'cur-3',
		50: 'cur+3',
		60: 'cur-3',
		70: 'cur+3',
		80: 'cur-3',
		90: 'cur+3'
	}
};




seq.rubber=
{
	scale:
	{
		30: [1.25, 0.75],  
		40: [0.75, 1.24],
		50: [1.15, 0.85],
		65: [0.95, 1.05],
		75: [1.05, 0.95]
	}
};



seq.shake=
{
	translate:
	{
		10: [-10, 0, 0],  
		20: [ 10, 0, 0],
		30: [-10, 0, 0],
		40: [ 10, 0, 0],
		50: [-10, 0, 0],
		60: [ 10, 0, 0],
		70: [-10, 0, 0],
		80: [ 10, 0, 0],
		90: [-10, 0, 0]
	}
};



seq.swing=
{
	rotate:
	{
		20: [0,0, 15],  
		40: [0,0,-10],
		60: [0,0, 5],
		80: [0,0,-5]
	},
	
	org:
	{ 
		0: [50,0],
		100: [50,0]
	}
};



seq.persp_down=
{
	rotate:
	{
		0: [0,0,0],
		100: [-180,0,0],
		
	},
	

	org:
	{ 
		0: [0,100],
		100: [0,100]
	},
	
	
	persp:
	{ 
		0: 800,
		100: 800
	}
}


seq.zoomout_left=
{
	opacity:
	{
		40: 1,
		100:0,
		
	},

	scale:
	{ 
		40: [0.475, 0.475],
		100: [0.1, 0.1]
	},
	
	translate:
	{ 
		40: [42, 0, 0],
		100: [-2000, 0, 0]
	},
	
	org:
	{ 
		0: [0,50],
		100: [0,50]
	},
	
}



seq.persp_up=
{
	rotate:
	{
		0: [-180,0,0],
		100: [0,0,0],
		
	},
	

	org:
	{ 
		0: [0,100],
		100: [0,100]
	},
	
	
	persp:
	{ 
		0: 800,
		100: 800
	}
}



seq.tinyshake=
{
	rotatez:
	{
		20:  'cur+4', 
		40:'cur-4',
		60: 'cur+4',
		80:'cur-4',
	}
};



