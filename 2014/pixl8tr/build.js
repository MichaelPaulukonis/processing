var uri = "",
    iwidth = 100,
    iheight = 100,
    singlestep = false,
    binary_gif,
    gif_url,
    gifOut,
    buildmode = false,
    progress = document.querySelector('.percent'),
    frames = [];

var build = function () {
    log('buildGif');
    gifOut.removeAttribute('src');
    getProcessingInstance(getProcessingSketchId()).loop();
    buildmode = true;
};

var buildgif = function (gifdata) {
    // build the gif AFTER we generate the frames
    document.getElementById('progress_bar').className = 'loading';

    // TODO: steps are not correct for the "new" method
    var stepsTotal = (pixel8.maxSteps * 2) + 1;
    gifdata.stepsTotal = stepsTotal;

    // TODO: notify that gif-assembly is beginning

    log('starting worker build');
    var gifworker = new Worker('gif-worker.js');
    gifworker.onmessage = function (event) {
        if (event.data.type === 'progress') {
            updateProgress(event.data.stepsDone, event.data.stepsTotal);
        } else if (event.data.type === 'gif') {
            gifOut.src = event.data.datauri;
            gifOut.parentElement.style.width = iwidth + 'px';
            progress.style.width = '100%';
            progress.textContent = '100%';
        }
    };
    gifworker.postMessage(gifdata);
};


(() => {
    pixel8.build = build
})()