let progress = document.querySelector('.percent')

function getProcessingSketchId () { return 'jstest'; }

var savecanvas = function () {
    var cvs = document.getElementsByTagName('canvas');
    if (cvs && cvs[0]) {
        var img = cvs[0].toDataURL('image/jpg');
        window.open(img, '_blank');
    }
};

const getProcessingInstance = (id) => Processing.getInstanceById(id);

var cleanUp = function () {
    // kill previous code (if any)
    var oldp = getProcessingInstance(getProcessingSketchId());
    if (oldp) oldp.exit();

    removeOldCanvas();
    params.gifOut.removeAttribute('src');

    setupGui();
    params.buildmode = false;
    params.frames = [];
    document.getElementById('progress_bar').className = '';
};

var removeOldCanvas = function () {
    var oldc = document.getElementById(getProcessingSketchId());
    if (oldc) {
        oldc.parentNode.removeChild(oldc);
    }
};

var setupGui = function () {
    var oldg = document.getElementsByClassName('dg ac');
    if (oldg.length === 0) {
        var gui = new dat.GUI();
        // anything below 0.02 millis is rounded up to... .10 (ie, 10 => 100)
        // WTF
        // http://nullsleep.tumblr.com/post/16524517190/animated-gif-minimum-frame-delay-browser-compatibility
        gui.add(params, 'delay').min(20).max(1000).step(10);
        gui.add(params, 'paused');
        gui.add(params, 'step'); // advance one frame (when paused)
        gui.add(params, 'initialSize');
        gui.add(params, 'stepSize').min(1).max(50).step(1);
        gui.add(params, 'maxSteps').min(1).max(100).step(1);
        gui.add(params, 'build');
        gui.add(params, 'type', { UpperLeft: 0, Center: 1, Divvy: 2 });

        gui.add(params, 'dMin').min(1).max(20).step(1);
        gui.add(params, 'dMax').min(2).max(50).step(1);

    }
};

var updateProgress = function (step, total) {
    var percentLoaded = Math.round((step / total) * 100);
    if (percentLoaded < 100) {
        progress.style.width = percentLoaded + '%';
        progress.textContent = '' + step + '/' + total + ' : ' + percentLoaded + '%';
    } else {
        progress.style.width = '100%';
        progress.textContent = '100%';
    }
};

var scaleCanvas = function (width) {
    var canvas = document.querySelector('canvas');
    var pct = Math.round(600 / width * 100);
    if (pct < 100) {
        canvas.style.width = '100%'; // shrink large; leave smaller alone
    }
};

// http://www.html5rocks.com/en/tutorials/file/dndfiles/
var handleFileSelect = function (evt) {
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
        reader.onload = (function (theFile) {
            return function (e) {
                params.gifOut = document.getElementById('generated');
                var img = document.getElementById('uploaded');
                params.uri = e.target.result;
                document.getElementById('uploaded').src = params.uri;

                img.onload = function () {
                    params.iwidth = img.width;
                    params.iheight = img.height;
                    cleanUp();
                    var c = document.createElement('canvas');
                    c.setAttribute('width', params.iwidth);
                    c.setAttribute('height', params.iheight);
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

function handleDragOver (evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
    this.className = 'is_hover';
}

var dropZone = document.getElementById('content');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);

dropZone.ondragend = function () {
    this.className = '';
    return false;
};