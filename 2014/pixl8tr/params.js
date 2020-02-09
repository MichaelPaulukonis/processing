// const params = {
//     paused: false,
//     delay: 100,
//     initialSize: 5,
//     stepSize: 5,
//     maxSteps: 20,
//     step: function() { logger('step'); singlestep = true; },
//     build: build,
//     type: 2,
//     dMin: 5,
//     dMax: 20,
//     singlestep: false,
//     buildmode: false,
//     iwidth: 100,
//     iheight: 100
// };


var pixel8 = {
    paused: false,
    delay: 100,
    initialSize: 5,
    stepSize: 5,
    maxSteps: 20,
    step: () => { log('step'); singlestep = true; },
    build: () => {},
    type: 2,
    dMin: 5,
    dMax: 20
};


