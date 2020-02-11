var build = function () {
    console.log('buildGif');
    params.gifOut.removeAttribute('src');
    getProcessingInstance(getProcessingSketchId()).loop();
    params.buildmode = true;
};

var buildgif = function (gifdata) {
    // build the gif AFTER we generate the frames
    document.getElementById('progress_bar').className = 'loading';

    // TODO: steps are not correct for the "new" method
    var stepsTotal = (params.maxSteps * 2) + 1;
    gifdata.stepsTotal = stepsTotal;

    // TODO: notify that gif-assembly is beginning

    console.log('starting worker build');
    var gifworker = new Worker('gif-worker.js');
    gifworker.onmessage = function (event) {
        if (event.data.type === 'progress') {
            updateProgress(event.data.stepsDone, event.data.stepsTotal);
        } else if (event.data.type === 'gif') {
            params.gifOut.src = event.data.datauri;
            params.gifOut.parentElement.style.width = params.iwidth + 'px';
            updateProgress(event.data.stepsDone, event.data.stepsTotal);
        }
    };
    gifworker.postMessage(gifdata);
};


(() => {
    params.build = build
})()