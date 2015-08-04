# Timeline.js

Timeline.js allows complete timeline-based animation, like how Flash works. It is small, but surprisngly powerful.
Timeline.js can easily replace CSS3 keyframe animations.

Before making this library, I searched for a library that solved this problem.  Lo and behold, none could be found. There were some related libraries:
- **Snabbt**: Snabbt does not have timeline control, so that was no-go.
- **Greensock**. Greensock is not free. Moreover, it is bloated with (tens of?) thousands of lines of code. Big time no-go!


## Demo

Here is a **demo** of a page made using Timeline.js: [view demo](https://e37d8bf05815d68846fc659f89a42d2ca1b57b8c.googledrive.com/host/0B1v99s-PldDPZmY0eXlkNXpCeG8/car_dealer.html) 


## Example Code

Assume we have a DIV called mydiv. This animates the div by creating a timeline with 5 sequences.

	var timeline = Timeline();
	
	
	timeline.add(mydiv, {seq:seq.fadein, duration:1} );
	timeline.add(mydiv, {seq:seq.bounce, duration:1} );
	timeline.add(mydiv, {seq:seq.tada, duration:1} );
	timeline.add(mydiv, {seq:seq.rotate36, duration:1} );
	timeline.add(mydiv, {seq:seq.slideup, duration:1} );
	
	timeline.complete_cb=function()
	{
		alert('timeline completed');
	}
	
	timeline.play();


## Goals and decisions

- **Speed and fluid animations**: We want to keep animations non-janky. These animations should be as fluid as CSS3-based animations. To achieve this, we only allow animating GPU-accelerated CSS properties, which are only two: **opacity** and **transform**.

- **Tiny code size**: The library itself is ~250 lines of code, which is considered *very* small. It does not require any third part library. We leave it non-essential fluff. An extension system might be created for additional functionility.

- **Flexible for various uses**: We achieve decoupling through the use of callbacks (e.g. a callback when the timeline has finished). In addition, the core of Timeline.js, the interpolating function, is very simple and general: it takes in a DOM element and property name (like opacity) and interpolates it.

- **Elegant, maintainable code**: The code emphasizes descriptive names for all variables and functions; this allows self-commenting of codes. An OOP approach is used. 


## Out-of-the-box sequences

Timeline.js provides ready-made sequences, which can be added to your timeline right away.

- Fade in
- Fade out
- Fade in-out
- Pop in
- Slide up
- Bounce
- Rotate 360
- Wobble
- Tada
- Rubber
- Swing
- Perspective down
- Perspective Up
- Zoom out left
- Tiny Shake



## License

Copyright Toolda. All Rights Reserved.