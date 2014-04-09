
/*

Load an image
Processing will pixellate it progressively.
Controls on right (via dat.gui)
When you like what you see, generate an animated GIF !
whee.

TODO:
 DONE drag-n-drop
 better looking interface (ANY, really)
 output single image if desired (when on-pause)
 progress-bar (notification) on gif-build...


built using:

http://www.html5rocks.com/en/tutorials/file/dndfiles/


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
    encoder,
    binary_gif,
    gif_url,
    gifOut,
    buildmode = false,
    progress = document.querySelector('.percent');

var pixel8 = {
    paused: false,
    delay: 100,
    initialSize: 5,
    stepSize: 5,
    maxSteps: 20,
    step: function() { console.log('step'); singlestep = true; },
    // TODO: will need some user feedback on the process....
    // since frame-count is known, a progress bar? !!!
    build: function() { console.log('buildGif'); buildmode = true; }
};

// http://www.html5rocks.com/en/tutorials/file/dndfiles/
function handleFileSelect(evt) {

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

                // TODO: delete previously generated gif

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
                    c.setAttribute('id', 'jstest');
                    var placeholder = document.querySelector('#placeholder');
                    placeholder.appendChild(c);

                    // kill previous code (if any)
                    var oldp = Processing.getInstanceById('jstest');
                    if (oldp) oldp.exit();

                    var canvas = document.querySelector('#jstest');
                    Processing.loadSketchFromSources(canvas, ["pixel8.pde"]);
                };

            };
        })(f);

        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
    }
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
}

var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);


var removeOldCanvas = function() {

    var oldc = document.getElementById('jstest');
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

    }

};

// this may remove the old canvas, but the old processing code is still sticking around!!!
var cleanUp = function() {

    removeOldCanvas();

    gifOut.removeAttribute('src');

    setupGui();

    encoder = new GIFEncoder();
    buildmode = false;

};


// TODO: drag-n-drop uploads
document.getElementById('files').addEventListener('change', handleFileSelect, false);


var updateProgress = function(step, total) {
    var percentLoaded = Math.round((step/total) * 100);
    if (percentLoaded < 100) {
        progress.style.width = percentLoaded + '%';
        progress.textContent = percentLoaded + '%';
    }
};
