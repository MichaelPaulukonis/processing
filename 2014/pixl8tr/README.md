# PIXL8TR

Animated gifs of image undergoing successive pixellation

## Originall in Processing, then Processing.js

I do not know if this works standalone (ie, as a Processing sketch on desktop) anymore. Doubtful.

## Roadmap

- break apart `upload.js` which contains both notes and gui and other code
- convert to p5js and other GUIS, maybe?
- Add a slider to allow to skip to different frames
- Allow to download each frame individually (or as a set of frames)
- select different focus location for the pixellation
- posterize colors?
- no partial squares - divide by width

## extracted from `upload.js`

Load an image
Processing will pixellate it progressively.
Controls on right (via dat.gui)
When you like what you see, generate an animated GIF !
whee.

TODO:
DONE drag-n-drop
better looking interface (ANY, really)
** TODO better instructions
** TODO notification that frame-building is starting
** DONE output gif is centered
** INPROGRESS progress-bar of conversion
*** depends upon webworker code
** INPROGRESS on-screen notes as to what this is/what is does
** INPROGRESS on-screen notes as to what was used
** DONE: scale canvas to fit screen
DONE output single image if desired (when on-pause)
CANCELLED optionally use fixed canvas size, and clip image?
** TOO MUCH WORK
** yech. this isn't a swiss-army knife.
optionally used scaled block (that is -- scaled to size of canvas)
** this was in the original code I looked at


built using:

http://www.html5rocks.com/en/tutorials/file/dndfiles/
https://github.com/antimatter15/jsgif

maybe some of the following:

http://processingjs.org/articles/jsQuickStart.html#writingpureprocessingcode

***
https://hacks.mozilla.org/2011/01/how-to-develop-a-html5-image-uploader/
***
http://stackoverflow.com/questions/2434458/image-resizing-client-side-with-javascript-before-upload-to-the-server
http://stackoverflow.com/questions/934012/get-image-data-in-javascript
http://webmasters.stackexchange.com/questions/28445/upload-image-file-is-compression-on-client-side-already-possible
http://coding.smashingmagazine.com/2013/10/11/we-wanted-to-build-a-file-uploader/
http://www.html5rocks.com/en/tutorials/canvas/integrating/
***
http://processingjs.org/reference/loadImage_/
http://forum.processing.org/one/topic/how-to-load-an-image-in-base64-with-processing-js.html

http://makeitsolutions.com/labs/jic/
