var glitchweb = function() {

    var generation = 0,
        glitches = [],
        autorun = false;

    function getBase64Image(img) {
        // Create an empty canvas element
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        // Copy the image contents to the canvas
        var ctx = canvas.getContext("2d");

        try {
            ctx.drawImage(img, 0, 0);
        } catch (ex) {
            if (ex.name === "NS_ERROR_NOT_AVAILABLE") {
                automationOff();
                console.log('previous operation killed the image @ generation : ' + (generation - 1));
                undo();
            }
        }

        // Get the data-URL formatted image
        // Firefox supports PNG and JPEG. You could check img.src to
        // guess the original format, but be aware the using "image/jpg"
        // will re-encode the image.
        var dataURL = canvas.toDataURL("image/jpeg");

        return dataURL.replace(/^data:image\/(png|jpeg);base64,/, "");
        // return dataURL;

    }


    var automationOff = function() {

        console.log('stopping automation');
        autorun = false;
        var chk = document.getElementById('autorun');
        if (chk) chk.checked = false;

    };

    var undo = function() {
        console.log('undo from gen ' + generation + ' to ' + (generation - 1));
        generation--;
        glitches.length--;
        if (generation < 0) generation = 0;
        document.getElementById('source').src = glitches[generation];
        updateGeneration(generation);
        console.log('generation is now ' + generation);
    };

    var glitchit = function(transform) {

        var img = document.getElementById('source');
        var b64 = getBase64Image(img);

        if (b64 == undefined) {
            console.log('we had an error');
            return;
        }

        // see http://stackoverflow.com/a/12713326/41153
        var intary = new Uint8Array(atob(b64).split("").map(function(c) {
            return c.charCodeAt(0); }));
        var mod1 = transform(intary);

        updateGeneration(++generation);

        // see http://stackoverflow.com/a/12713326/41153
        var out64 =  btoa(String.fromCharCode.apply(null, mod1));

        var glitched = document.createElement('img');
        glitched.src = "data:image/jpeg;base64," + out64;
        glitched.id = 'source';
        glitched.onerror = function() {
            // TODO: UI feedback
            automationOff();
            console.log('previous glitch was un-renderable');
            undo();
        };
        glitched.onload = function() {
            if (autorun) {
                // setTimeout(function() { glitchit(transform); }, 25);
                glitchit(transform);
            };
        };

        glitches[generation] = glitched.src;

        var targets = document.getElementById('targets');
        targets.removeChild(img);

        targets.appendChild(glitched);

    };


    // Returns a random integer between min and max
    // Using Math.round() will give you a non-uniform distribution!
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    var transform1 = function(intary) {

        for (var i = 0; i < 4; i++) {
            var loc = getRandomInt(128, intary.length);
            var newval = getRandomInt(0, 255);
            intary[loc] = newval;
        }

        return intary;

    };

    var transform2 = function(intary) {

        var loc1 = getRandomInt(128, intary.length);
        var loc2 = getRandomInt(128, intary.length);
        var val1 = intary[loc1];
        var val2 = intary[loc2];

        for (var i = 128; i < intary.length; i++) {
            if (intary[i] == val1) {
                intary[i] = val2;
            } else if (intary[i] == val2) {
                intary[i] = val1;
            }
        }

        return intary;

    };

    var updateGeneration = function(gen) {

        document.getElementById('generation').textContent = gen;

    };

    var reset = function() {

        var orig = document.getElementById('original');
        var source = document.getElementById('source');
        source.src = orig.src;

        generation = 0;
        updateGeneration(generation);
        glitches = [];

    };


    // http://www.html5rocks.com/en/tutorials/file/dndfiles/
    var handleFileSelect = function(evt) {

        this.className = '';

        evt.stopPropagation();
        evt.preventDefault();

        // well, we're only going to use ONE fil
        var files = evt.target.files || evt.dataTransfer.files; // FileList object
        var f = files[0];

        // Only process image files.
        if (!f.type.match('image.*')) {
            console.log(f.type + ' is not an image file');
            return;
        }

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function(theFile) {

            return function(e) {

                var org = document.getElementById('original');
                var source = document.getElementById('source');
                var uri = e.target.result;
                org.src = uri;
                source.src = uri;

                org.onload = function(org) {
                    // hrm. do anything?
                    storeOrig(org);
                };

            };
        })(f);

        // Read in the image file as a data URL.
        reader.readAsDataURL(f);

    };


    var  handleDragOver = function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy';
        this.className = 'is_hover';
    };

    var activateGlitchButtons = function() {

        activate('glitcher', function() { glitchit(transform1); });
        activate('glitcher2', function() { glitchit(transform2); });

    };

    var activate = function(selector, fn) {

        var btn = document.getElementById(selector);
        if (btn) {
            btn.disabled = false;
            btn.onclick = fn;
        }

    };

    var storeOrig = function(img) {

        var b64 = getBase64Image(img);
        glitches[generation] = "data:image/jpeg;base64," + b64;

    };

    var showThumbs = function() {
        // TODO: clear out
        var thumbs = document.getElementById('thumbs');
        for (var i = 0; i < glitches.length; i ++) {
            var img = document.createElement('img');
            img.src = glitches[i];
            img.className = 'thumb';
            img.id = 'glitch' + i;
            thumbs.appendChild(img);
        }
    };

    var init = function() {

        var img = document.getElementById('original');
        img.onload = function() {

            storeOrig(img);

            activate('reset', reset);
            activate('glitcher', function() { glitchit(transform1); });
            activate('glitcher2', function() { glitchit(transform2); });
            activate('undo', undo);
            activate('showthumbs', showThumbs);

            var chk = document.getElementById('autorun');
            if (chk) {
                chk.onchange = function() {
                    console.log('changed!');
                    if (this.checked) {
                        autorun = true;
                    } else {
                        autorun = false;
                    }
                };
            };

            updateGeneration(generation);

            var dropZone = document.getElementById('targets');
            dropZone.addEventListener('dragover', handleDragOver, false);
            dropZone.addEventListener('drop', handleFileSelect, false);

            dropZone.ondragend = function() {
                this.className = '';
                return false;
            };

        };

    }();


}();
