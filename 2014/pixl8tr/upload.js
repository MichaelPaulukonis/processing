
/*

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

 */

var uri = "",
    iwidth = 100,
    iheight = 100,
    singlestep = false,
    binary_gif,
    gif_url,
    gifOut,
    buildmode = false,
    progress = document.querySelector('.percent'),
    frames = [];


function getProcessingSketchId () { return 'jstest'; }

var savecanvas = function() {
    var cvs = document.getElementsByTagName('canvas');
    if (cvs && cvs[0]) {
        var img = cvs[0].toDataURL('image/jpg');
        window.open(img, '_blank');
    }
};

var log = function(msg) {
    if (console && console.log) console.log(msg);
};

var build = function() {
    log('buildGif');
    gifOut.removeAttribute('src');
    getProcessingInstance(getProcessingSketchId()).loop();
    buildmode = true;
};


var pixel8 = {
    paused: false,
    delay: 100,
    initialSize: 5,
    stepSize: 5,
    maxSteps: 20,
    step: function() { log('step'); singlestep = true; },
    build: build,
    saveframe: savecanvas,
    type: 0
};

var getProcessingInstance = function(id) {

    var i = Processing.getInstanceById(id);
    return i;

};

var cleanUp = function() {

    // kill previous code (if any)
    var oldp = getProcessingInstance(getProcessingSketchId());
    if (oldp) oldp.exit();

    removeOldCanvas();
    gifOut.removeAttribute('src');

    setupGui();
    buildmode = false;
    frames = [];
    document.getElementById('progress_bar').className = '';
};



var removeOldCanvas = function() {

    var oldc = document.getElementById(getProcessingSketchId());
    if (oldc) {
        oldc.parentNode.removeChild(oldc);
    }

};

var setupGui = function() {

    var oldg = document.getElementsByClassName('dg ac');
    if (oldg.length === 0) {

        var gui = new dat.GUI();
        // anything below 0.02 millis is rounded up to... .10 (ie, 10 => 100)
        // WTF
        // http://nullsleep.tumblr.com/post/16524517190/animated-gif-minimum-frame-delay-browser-compatibility
        gui.add(pixel8, 'delay').min(20).max(1000).step(10);
        gui.add(pixel8, 'paused');
        gui.add(pixel8, 'step'); // advance one frame (when paused)
        gui.add(pixel8, 'initialSize');
        gui.add(pixel8, 'stepSize').min(1).max(50).step(1);
        gui.add(pixel8, 'maxSteps').min(1).max(100).step(1);
        gui.add(pixel8, 'build');
        gui.add(pixel8, 'saveframe');
        gui.add(pixel8, 'type', { UpperLeft: 0, Center: 1, Divvy: 2 } );
    }
};



var updateProgress = function(step, total) {
    var percentLoaded = Math.round((step/total) * 100);
    if (percentLoaded < 100) {
        progress.style.width = percentLoaded + '%';
        progress.textContent = '' + step + '/' + total + ' : ' + percentLoaded + '%';
    }
};

var scaleCanvas = function(width) {
    var canvas = document.querySelector('canvas');

    var pct = Math.round(600/width * 100);
    if (pct < 100) {
        canvas.style.width = '100%'; // shrink large; leave smaller alone
    }
};

// http://www.html5rocks.com/en/tutorials/file/dndfiles/
var handleFileSelect = function(evt) {

    this.className = '';

    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.target.files || evt.dataTransfer.files; // FileList object

    // Loop through the FileList and render image files as thumbnails.
    for (var i = 0, f; f = files[i]; i++) {

        // Only process image files.
        if (!f.type.match('image.*')) {
            continue;
        }

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function(theFile) {

            return function(e) {

                gifOut = document.getElementById('generated');
                var img = document.getElementById('uploaded');
                uri = e.target.result;
                document.getElementById('uploaded').src = uri;
                img.onload = function() {

                    iwidth = img.width;
                    iheight = img.height;

                    cleanUp();

                    var c = document.createElement('canvas');
                    c.setAttribute('width', iwidth);
                    c.setAttribute('height', iheight);
                    c.setAttribute('id', getProcessingSketchId());

                    var placeholder = document.querySelector('#placeholder');
                    placeholder.appendChild(c);


                    var canvas = document.querySelector('#jstest');
                    Processing.loadSketchFromSources(canvas, ["pixel8.pde"]);
                };

            };
        })(f);

        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
    }
};


function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
    this.className = 'is_hover';
}

var dropZone = document.getElementById('content');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);

dropZone.ondragend = function() {
    this.className = '';
    return false;
};


var buildgif = function(gifdata) {
    // build the gif AFTER we generate the frames
    document.getElementById('progress_bar').className = 'loading';

    var stepsTotal = (pixel8.maxSteps * 2) + 1;

    gifdata.stepsTotal = stepsTotal;

    // TODO: notify that gif-assembly is beginning

    log('starting worker build');

    var gifworker = new Worker('gif-worker.js');

    gifworker.onmessage = function(event) {
        if (event.data.type === 'progress') {
            updateProgress(event.data.stepsDone, event.data.stepsTotal);
        } else if (event.data.type === 'gif') {
            gifOut.src = event.data.datauri;
            gifOut.parentElement.style.width = iwidth + 'px';
            progress.style.width = '100%';
            progress.textContent = '100%';
        }
    };

    gifworker.postMessage(gifdata);

};


var startGif = function(gifobj) {
    // store original as first frame, w/ 1/2 delay

    encoder.setRepeat(0);
    encoder.setDelay(500);
    encoder.setSize(gifobj.width, gifobj.height);
    encoder.start();

    encoder.addFrame(gifobj/frames[0].data, true);
    encoder.setDelay(pixel8.delay);
    console.log('speed: ' + pixel8.delay);

};

var endGif = function() {

    encoder.finish();
    binary_gif = encoder.stream().getData();
    gif_url = 'data:image/gif;base64,' + encode64(binary_gif);
    gifOut.src = gif_url;

};
