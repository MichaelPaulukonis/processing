var params = {
    paused: false,
    delay: 100,
    initialSize: 5,
    stepSize: 5,
    maxSteps: 20,
    singlestep: false,
    buildmode: false,
    step: function () { console.log('step'); this.singlestep = true; },
    build: () => { },
    gifOut: null,
    type: 2,
    dMin: 5,
    dMax: 20,
    iwidth: 100,
    iheight: 100,
    uri: '',
    frames: []
};


