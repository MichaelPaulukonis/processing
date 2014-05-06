/*

 using jsgif to encode
 https://github.com/antimatter15/jsgif

 */

importScripts('NeuQuant.js', 'LZWEncoder.js', 'GIFEncoder.js', 'b64.js');

onmessage = function(event) {

    var gifobj = event.data,
        encoder = new GIFEncoder(),
        stepsDone = 1,
        stepsTotal = gifobj.frames.length;


    // hrm. what're the docs on gifobj...
    var startGif = function(gifobj) {
        // store original as first frame, w/ 1/2 delay

        // actually, we have TWO loop scenarios
        // repeat thegif ad infinitum
        // and loop back to origin....
        encoder.setRepeat(gifobj.loop); // 0 = forever, 1+ loop n times [or once, in our case]
        encoder.setDelay(500);
        encoder.setSize(gifobj.width, gifobj.height);
        encoder.start();

        encoder.addFrame(gifobj.frames[0].data, true);
        encoder.setDelay(gifobj.delay);

    };

    self.postMessage({type: 'message', message: 'stepsTotal: ' + stepsTotal}); //+ gifobj.frames.length});

    startGif(gifobj);

    // we want a loop -- but are only provided with the upward pass
    // no probs -- reverse it
    for (var i = 1; i < gifobj.frames.length; i++) {
        encoder.addFrame(gifobj.frames[i].data, true);
        stepsDone++;
        self.postMessage({
            type: 'progress',
            stepsDone: stepsDone,
            stepsTotal: stepsTotal
        });
    }

    // hrm. should we pause on the "last" frame?
    // if we reverse, the last frame is the first frame. so....
    // but if we do not reverse, we have ALREADY PASSED the last frame...

    if (gifobj.reverse) {
        // ugh. better way to come....
        for (i = gifobj.frames.length-1; i >= 1; i--) {
            encoder.addFrame(gifobj.frames[i].data, true);
            stepsDone++;
            self.postMessage({
                type: 'progress',
                stepsDone: stepsDone,
                stepsTotal: stepsTotal
            });
        }
    }

    encoder.finish();
    var url = 'data:image/gif;base64,' + encode64(encoder.stream().getData());


    self.postMessage({
        type: "gif",
        datauri: url
    });

};
