
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
        gui.add(pixel8, 'type', { UpperLeft: 0, Center: 1, Divvy: 2 } );

        gui.add(pixel8, 'dMin').min(1).max(20).step(1);
        gui.add(pixel8, 'dMax').min(2).max(50).step(1);

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