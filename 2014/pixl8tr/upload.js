
/*

 NOTES

 http://stackoverflow.com/questions/14528558/load-processing-js-sketch-after-window-is-fully-loaded-with-innerhtml

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

 http://www.html5rocks.com/en/tutorials/file/dndfiles/

 */

// based on code @ http://stackoverflow.com/a/8779876/41153


// dynamic loading of sketch - say, if we need to know the sketch SIZE, for instance...
// http://stackoverflow.com/questions/14528558/load-processing-js-sketch-after-window-is-fully-loaded-with-innerhtml

var uri = "",
    iwidth = 100,
    iheight = 100,
    singlestep = false,
    encoder,
    binary_gif,
    gif_url,
    gifOut,
    buildmode = false;

var pixel8 = {
    paused: false,
    speed: 100,
    stepSize: 5,
    maxSteps: 20,
    step: function() { console.log('step'); singlestep = true; },
    // TODO: will need some user feedback on the process....
    // since frame-count is known, a progress bar? !!!
    build: function() { console.log('buildGif'); buildmode = true; }
};

// http://www.html5rocks.com/en/tutorials/file/dndfiles/
function handleFileSelect(evt) {

    var files = evt.target.files; // FileList object

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

                    var canvas = document.querySelector('#jstest');
                    Processing.loadSketchFromSources(canvas, ["pixel8.pde"]);
                };

            };
        })(f);

        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
    }
}


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

        gui.add(pixel8, 'speed').min(10).max(1000).step(10);
        gui.add(pixel8, 'paused');
        gui.add(pixel8, 'step'); // advance one frame (when paused)
        gui.add(pixel8, 'stepSize').min(1).max(50).step(1);
        gui.add(pixel8, 'maxSteps').min(1).max(100).step(1);
        gui.add(pixel8, 'build');

    }

};


var cleanUp = function() {

    removeOldCanvas();

    // TODO: remove old gif

    setupGui();

    encoder = new GIFEncoder();
    buildmode = false;

};


// TODO: drag-n-drop uploads
document.getElementById('files').addEventListener('change', handleFileSelect, false);
