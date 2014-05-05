var glitchweb = function() {

    var generation = 0,
        glitches = [],
        glitches2 = [],
        autorun = false,
        running = false,
        gallery = G;

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
                // TODO: this should be conditional
                // plus, fails in IE - wrap the console1
                console.log('previous operation killed the image @ generation : ' + (generation - 1));
                undo();
            }
        }

        // Get the data-URL formatted image
        // Firefox supports PNG and JPEG. You could check img.src to
        // guess the original format, but be aware the using "image/jpg"
        // will re-encode the image.
        var dataURL = canvas.toDataURL("image/jpeg");

        var data = { uri: dataURL.replace(/^data:image\/(png|jpeg);base64,/, ""),
                     frame: ctx.getImageData(0,0, canvas.width, canvas.height)
                   };

        return data;

    }


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
        var data = getBase64Image(img);
        var b64 = data.uri;

        if (b64 == undefined) {
            console.log('we had an error');
            return;
        }

        // transform to intarry and back
        // as we manipulate the array
        // if we can do the manipulations on the raw URI this time-sink is removed

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
            // TODO: this should be conditional
            // plus, fails in IE - wrap the console1
            console.log('previous glitch was un-renderable');
            undo();
        };
        glitched.onload = function() {
            addThumb(glitched.src, generation);
            if (autorun) {
                glitchit(transform);
            };
        };

        glitches[generation] = glitched.src;
        glitches2[generation] = { uri: glitched.src, frame: data.frame };

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

        clearThumbs();

        generation = 0;
        updateGeneration(generation);
        glitches = [];

    };

    var storeInSource = function(uri) {

        var source = $('#source')[0];
        source.src = uri;

    };

    // http://www.html5rocks.com/en/tutorials/file/dndfiles/
    var handleFileSelect = function(evt) {

        this.className = ''; // clear the class set in dragOver

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

                org.onload = function(src) {
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

    var storeOrig = function(img) {

        var b64 = getBase64Image(img);
        glitches[generation] = "data:image/jpeg;base64," + b64;

    };

    var getThumbArea = function() {
        return $('#thumbs');
    };

    // not completely happy w/ returning ts as a side-effect
    // but we don't "waste" resources
    // "premature optimization is the root of all evil"
    var clearThumbs = function() {
        var ts = getThumbArea();
        ts.empty(); // clear out any previous thumbs
        return ts; // side-effect
    };

    var deleter = function() {

        if(confirm('Delete all checked images?')) {
            $('input[type=checkbox]:checked').parent().each(function() {
                // problem -- what index are we in glitches[]
                var idx = parseInt($(this).find('img').attr('id').replace('glitch', ''), 10);
                glitches.splice(idx,1);
                // TODO: parse out index
                this.remove();
                // TODO: remove checked items from the glitches array!

            });
            generation = $('.thumb').length;
            updateGeneration(generation);
        }
    };

    var addThumb = function(uri, idx) {


        $div = $('<div></div>', {'class': 'container'});
        var img = document.createElement('img');
        img.src = uri;
        img.className = 'thumb';
        img.id = 'glitch' + idx;

        $chk = $('<input />', {type: 'checkbox', id: 'chk' + idx, value: img.id, 'class': 'checkbox'});

        $div.append(img);
        $div.append($chk);

        getThumbArea().append($div);

        $img = $('#'+img.id);

        $img.bind('dblclick', function(event) {
            // this is the actual image clicked-on.
            gallery.init(this);
        });

        // gallery.add($img[0]);

    };

    // also, note: these aren't really thumbs.
    // they're full-size images shrunk-down
    var showThumbs = function() {

        var ts = getThumbArea();
        ts.empty();

        gallery.init();

        for (var i = 0; i < glitches.length; i ++) {
            addThumb(glitches[i], i);
        }

    };


    var activate = function(selector, fn) {

        var btn = document.getElementById(selector);
        if (btn) {
            btn.disabled = false;
            btn.onclick = fn;
        }

    };

    var init = function() {

        $('#source').bind('load', function() {
            $('#targets').width($(this).width());
        });

        var img = document.getElementById('original');
        img.onload = function() {

            // gallery.init();
            addThumb(img.src, generation);
            storeOrig(img);

            activate('reset', reset);
            activate('glitcher', function() { glitchit(transform1); });
            activate('glitcher2', function() { glitchit(transform2); });
            activate('undo', undo);
            activate('showthumbs', showThumbs);
            activate('deletechecked', deleter);

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

    };

    var deleteImage = function(id) {
        var idx = parseInt(id.replace('glitch', ''), 10);
        glitches.splice(idx, 1);
        generation--;
        updateGeneration(generation);
        $('#glitch' + idx).parent().remove();
    };

    var builder = function() {

        // frames[] is populated as frames.push(externals.context.getImageData(0,0,width,height));
        // we are going to have to keep this either _in parallel_ (ugh) with glitches[]
        // or create a new array that stores an object containing
        // { uri: "", frame: "" }
        // or summat
        var frames = [];

        // frame = { width: 0,
        //           height: 0,
        //           data: Uint8ClampedArray[10]
        //           };

        var delay = 100;
        var width = 100; // hrm. we can change this during the glitching process....
        var height = 100;

        var workerobj = {
            'frames': frames,
            'delay': delay,
            'width': width,
            'height': height
        };

        buildgif(workerobj);

    };

    // taken whole-hog from pixl8r
    var buildgif = function(gifdata) {

        document.getElementById('progress_bar').className = 'loading';

        // TODO: notify that gif-assembly is beginning

        console.log('starting worker build');

        // TODO: needs to be rebuilt, as its a back-n-forth generator
        var gifworker = new Worker('gif-worker.js');

        gifworker.onmessage = function(event) {
            if (event.data.type === 'progress') {
                // updateProgress(event.data.stepsDone, event.data.stepsTotal);
            } else if (event.data.type === 'gif') {
                // gifOut.src = event.data.datauri;
                // gifOut.parentElement.style.width = iwidth + 'px';
                // progress.style.width = '100%';
                // progress.textContent = '100%';
            }
        };

        gifworker.postMessage(gifdata);

    };

    return {
        init: init,
        gallery: gallery,
        storeInSource: storeInSource,
        deleteImage: deleteImage
    };


}();

glitchweb.init();
