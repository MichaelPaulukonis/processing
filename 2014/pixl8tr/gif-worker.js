/*

 Take the code that's in

 https://developer.mozilla.org/en-US/docs/Web/Guide/Performance/Using_web_workers

 http://www.html5rocks.com/en/tutorials/workers/basics/


 lines 39..63 will be the CALLER (goes into upload.js or .pde)
 https://github.com/h5bp/mothereffinganimatedgif/blob/4fe38aeff8c88b02a1340a012ffc8b1a5565a6ac/assets/js/mfanimated.js

 this is an example of the worker code (called by the above) building a gif.
 This is roughly what now done after the frames are created.
 https://github.com/h5bp/mothereffinganimatedgif/blob/master/assets/js/libraries/omggif-worker.js

 */

importScripts('NeuQuant.js', 'LZWEncoder.js', 'GIFEncoder.js', 'b64.js');

onmessage = function(event) {
    // this was a preliminary test
    // postMessage('delay: ' + event.data.delay);

    var gifobj = event.data,
        encoder = new GIFEncoder(),
        stepsDone = 1;


    var startGif = function(gifobj) {
        // store original as first frame, w/ 1/2 delay

        encoder.setRepeat(0);
        encoder.setDelay(500);
        encoder.setSize(gifobj.width, gifobj.height);
        encoder.start();

        encoder.addFrame(gifobj.frames[0].data, true);
        encoder.setDelay(gifobj.delay);

    };



    startGif(gifobj);

    // we want a loop -- but are only provided with the upward pass
    // no probs -- reverse it
    for (var i = 1; i < gifobj.frames.length; i++) {
        encoder.addFrame(gifobj.frames[i].data, true);
        stepsDone++;
        self.postMessage({
            type: 'progress',
            stepsDone: stepsDone,
            stepsTotal: gifobj.stepsTotal
        });
    }

    // ugh. better way to come....
    for (i = gifobj.frames.length-1; i >= 1; i--) {
        encoder.addFrame(gifobj.frames[i].data, true);
        stepsDone++;
        self.postMessage({
            type: 'progress',
            stepsDone: stepsDone,
            stepsTotal: gifobj.stepsTotal
        });
    }


    encoder.finish();
    var url = 'data:image/gif;base64,' + encode64(encoder.stream().getData());


    self.postMessage({
        type: "gif",
        datauri: url
    });

};
