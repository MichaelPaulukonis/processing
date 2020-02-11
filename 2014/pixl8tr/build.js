var build = function () {
    console.log('buildGif');
    pixel8.gifOut.removeAttribute('src');
    getProcessingInstance(getProcessingSketchId()).loop();
    pixel8.buildmode = true;
};

var buildgif = function (gifdata) {
    // build the gif AFTER we generate the frames
    document.getElementById('progress_bar').className = 'loading';

    // TODO: steps are not correct for the "new" method
    var stepsTotal = (pixel8.maxSteps * 2) + 1;
    gifdata.stepsTotal = stepsTotal;

    // TODO: notify that gif-assembly is beginning

    console.log('starting worker build');
    var gifworker = new Worker('gif-worker.js');
    gifworker.onmessage = function (event) {
        if (event.data.type === 'progress') {
            updateProgress(event.data.stepsDone, event.data.stepsTotal);
        } else if (event.data.type === 'gif') {
            pixel8.gifOut.src = event.data.datauri;
            pixel8.gifOut.parentElement.style.width = pixel8.iwidth + 'px';
            updateProgress(event.data.stepsDone, event.data.stepsTotal);
        }
    };
    gifworker.postMessage(gifdata);
};


(() => {
    pixel8.build = build
})()