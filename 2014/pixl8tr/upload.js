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
// probably won't need this -- going to be action-based, anyway

// var launch = function() {
//     pjs.drawText(msg);

// };

// var pjs, iID, uri;
// pjs = Processing.getInstanceById('jstest');
// if (!pjs) tID = setInterval(function() {
//     pjs = Processing.getInstanceById('jstest');
//     if (pjs) {
//         clearInterval(tID);
//         launch();
//     }
// }, 500);

// dynamic loading of sketch - say, if we need to know the sketch SIZE, for instance...
// http://stackoverflow.com/questions/14528558/load-processing-js-sketch-after-window-is-fully-loaded-with-innerhtml

var uri = "", iwidth = 100, iheight = 100;
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
                // Render thumbnail.
                // var span = document.createElement('span');
                // span.innerHTML = ['<img class="thumb" src="', e.target.result,
                //                   '" title="', escape(theFile.name), '"/>'].join('');
                // document.getElementById('list').insertBefore(span, null);
                var img = document.getElementById('uploaded');
                uri = e.target.result;
                document.getElementById('uploaded').src = uri;
                img.onload = function() {

                    iwidth = img.width;
                    iheight = img.height;

                    var oldc = document.getElementById('jstest');
                    if (oldc) {
                        oldc.parentNode.removeChild(oldc);
                    }

                    var c = document.createElement('canvas');
                    c.setAttribute('width', iwidth);
                    c.setAttribute('height', iheight);
                    c.setAttribute('id', 'jstest');
                    var placeholder = document.querySelector('#placeholder');
                    placeholder.appendChild(c);

                    var canvas = document.querySelector('#jstest');
                    Processing.loadSketchFromSources(canvas, ["pixel8.pde"]);
                };

                // var pjs = Processing.instances[0];
                // // pjs.println(e.target.result);
                // // pjs.drawThing();
                // uri = e.target.result;
                // var canvas = document.querySelector('#jstest');
                // // Processing.loadSketchFromSources(canvas, 'jstest.pde');
                // var ctx = canvas.getContext('2d');
                // var img = new Image;
                // img.onload = function() {
                //     ctx.drawImage(img,0,0);
                // };
                // img.src = e.target.result;
                // // aaaargh, doesn't matter, the jstest.pde thing will still bite us...

                // .drawThing();;



            };
        })(f);

        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
    }
}

document.getElementById('files').addEventListener('change', handleFileSelect, false);



// var form = document.getElementById('form');
// if (form.attachEvent) {
//     form.attachEvent("submit", processForm);
// } else {
//     form.addEventListener("submit", processForm);
// }
