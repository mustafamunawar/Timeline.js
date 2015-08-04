
/*Timeline.js


Demo:

this is a small, but surprisngly powerful library. It allows complete timeline-based animation. It can replace CSS3 animations.
Motivation for making this library
*/


//These are example sequences that can be used right away.
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


//have rubber options: rubber right, rubber left

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




//org has nine places, def is 'c'.
//each percent vacent va cent va l l 

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
	
	/*
	persp:
	{ 
		0: 800,
		100: 800
	}*/
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
	/*translatey:
	{
		0:'-800',
		100:460
	}, */
	rotatez:
	{
		20:  'cur+4', 
		40:'cur-4',
		60: 'cur+4',
		80:'cur-4',
	}//,
	
//org:{ 0: 'top center' }
};




//timeline.props=[];  //maybe for performance, sort arrays based on start time

function Timeline()
{
	if(!(this instanceof Timeline)) return new Timeline();
	this.cname='Timeline';
	
	this.sequences=[];
	this.time=0;
	this.is_playing=0;
	this.prev_systime=0;
}

//item has _rotate, _scale
Timeline.prototype.add=function(dom_ele, opts)
{
	if(dom_ele==u)
		return;
	
	 //opts: seq,duration,pos,posmode
	if(opts.duration==u) opts.duration=0.4; 
	if(opts.pos==u) opts.pos='last.end+0';  
	if(opts.posmode==u) opts.posmode='after'; 
	if(opts.accel==u) opts.accel='+'; 
	if(opts.loop==u) opts.loop='off';
	
	//start can be 'with,after'. default is after. meaning: with prev sequence, after prev sequence.

	//pos can have seq ids. use .end to specify end of seq.  e.g. 'last.end+5'
	var last_seq=this.sequences.last();
	var last_start=0;
	var last_end=0;
	if(last_seq!=u)
	{
		last_start=last_seq.abs_start_time;
		last_end=last_seq.abs_end_time;
	}
	
	
	var abs_pos=str(opts.pos);
	abs_pos=abs_pos.replace('last.end', last_end); 
	abs_pos=abs_pos.replace('last', last_start); 
	abs_pos=eval(abs_pos);
	
	
	var seq={}; //a computed timeline sequence
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
		if(keyframes['0']==u)
			keyframes['0']='cur';
		
		if(keyframes['100']==u)
			keyframes['100']='cur';
		
		var percents=Object.keys(keyframes).mp('int').sort('number');
		for(var i=1; i<percents.length;  i++)
		{	
			//keyframes['0'] not added, used as start for next percent
			//cur is current value, and computed when add() is called.   use + or -. e.g. 0:cur, 100:cur+360
			var prop={};	
			if(i==1)
				prop.orig_val=cur;
		
			prop.name=prop_name;
			prop.accel=opts.accel;
			var percent=percents[i];
			var percent_prev=percents[i-1];
			
			prop.start_val= eval(keyframes[percent_prev]);
			prop.end_val  = eval(keyframes[percent]);
			
			prop.duration=(percent-percent_prev)/100 * opts.duration;
			prop.start_time=(percent_prev/100)*opts.duration;
			prop.end_time=(percent/100)*opts.duration;
			//log('prop='+obj2str(prop));
			prop.dom_ele=dom_ele;
			seq.props.push(prop);
		}
	}
	this.sequences.push(  seq );
	return this.sequences.last();
}

Timeline.prototype.set_start_vals=function()
{
	for(var i=0; i<this.sequences.length; i++)
	{
		var seq=this.sequences[i];
		for(var j=0; j<seq.props.length; j++)
		{
			var prop=seq.props[j];
			
			if(prop.orig_val!=u)
			{
				prop.dom_ele[prop.name](prop.start_val);
			}
		}
	}
	
}


Timeline.prototype.restore_orig_vals=function()
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



Timeline.prototype.play=function()
{
	this.is_playing=1;
	if(this.raf_bind==u)
		this.raf_bind=this.raf.bind(this);
	requestAnimationFrame(this.raf_bind);
}

Timeline.prototype.pause=function()
{
	this.is_playing=0;
	this.prev_systime=0;
}

Timeline.prototype.reset=function()
{
	this.time=0;
	this.prev_systime=0;
	this.is_playing=0;
	this.sequences=[];
}

/*Normally, I tend to keep functions small. However, RAF needs every bit of performance*/
Timeline.prototype.raf=function(systime)
{
	
	if(this.is_playing==0)
		return;
	
	//systime = new Date().getTime();
	if(this.prev_systime==0)
		this.prev_systime=systime;
	
	var dt = systime - this.prev_systime;
	this.prev_systime=systime;
	this.time+=(dt/1000);
	
	//loop through items
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
			
			
		//log('seq.props.length='+seq.props.length);
		for(var j=0; j<seq.props.length; j++)
		{
			var prop=seq.props[j];
			var abs_prop_start_time=seq.abs_start_time+prop.start_time;
			var prop_end_time_abs=seq.abs_start_time+prop.end_time;
			if(abs_prop_start_time>this.time)
				continue;
			

			//easing function takes in a percentage (of time), and returns a new percentage
			
			
			var percent=(this.time-abs_prop_start_time)/prop.duration;  //percent progress of prop
			if(prop.accel=='+') //easein cubic
				percent=percent*percent*percent;

			else if(prop.accel=='-')  //easeout quadric
				percent=(--percent)*percent*percent+1;


			var new_val;
			if(prop.start_val.length==u)
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
		//completed entire timeline
		if(this.complete_cb)
			this.complete_cb();
		log('done timeline');
		return;
	}
	
	
	requestAnimationFrame(this.raf_bind);
}
