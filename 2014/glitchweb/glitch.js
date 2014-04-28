var generation = 0;

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
            alert('bad image!');
            console.log('previous operation killed the image @ generation : ' + (generation - 1));
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


var glitchit = function(transform) {

    var img = document.getElementById('source');
    var b64 = getBase64Image(img);

    var mod1 = transform(b64);

    // console.log(mod1);
    // console.log('the same? ' + b64 == mod1);

    var glitched = document.createElement('img');
    glitched.src = "data:image/jpeg;base64," + mod1;
    glitched.id = 'source';
    glitched.onload = function() {
        if (this.complete === false) {
            console.log('HOUSTON WE HAVE A BAD IMAGE');
        } else {
            console.log('good image');
        }
    };

    var targets = document.getElementById('targets');
    targets.removeChild(img);

    targets.appendChild(glitched);

};

// Returns a random integer between min and max
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var transform1 = function(b64) {

    var out64 = b64;

    // see http://stackoverflow.com/a/12713326/41153
    var uintArray = new Uint8Array(atob(b64).split("").map(function(c) {
        return c.charCodeAt(0); }));

    for (var i = 0; i < 4; i++) {
        var loc = getRandomInt(128, uintArray.length);
        var newval = getRandomInt(0, 255);
        // console.log('loc: ' + loc + ' oldval: ' + uintArray[loc] + ' newVal: ' + newval);
        uintArray[loc] = newval;
    }

    updateGeneration(++generation);

    // see http://stackoverflow.com/a/12713326/41153
    return btoa(String.fromCharCode.apply(null, uintArray));


};

var transform2 = function(b64) {

    var out64 = b64;

    // see http://stackoverflow.com/a/12713326/41153
    var uintArray = new Uint8Array(atob(b64).split("").map(function(c) {
        return c.charCodeAt(0); }));

    var loc1 = getRandomInt(128, uintArray.length);
    var loc2 = getRandomInt(128, uintArray.length);
    var val1 = uintArray[loc1];
    var val2 = uintArray[loc2];

    for (var i = 128; i < out64.length; i++) {
        if (uintArray[i] == val1) {
            uintArray[i] = val2;
        } else if (uintArray[i] == val2) {
            uintArray[i] = val1;
        }
    }

    updateGeneration(++generation);

    // see http://stackoverflow.com/a/12713326/41153
    return btoa(String.fromCharCode.apply(null, uintArray));


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

};

var init = function() {

    var btn = document.getElementById('glitcher');
    if (btn) {
        btn.onclick = function() { glitchit(transform1); };
    }

    var btn2 = document.getElementById('glitcher2');
    if (btn2) {
        btn2.onclick = function() { glitchit(transform2); };
    }

    var btn3 = document.getElementById('reset');
    if (btn3) {
        btn3.onclick = reset;
    }

    updateGeneration(generation);


}();
