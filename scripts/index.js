//SIGNAL CHAIN: 12 OSC -> 12 GAIN NODES -> FILTER -> ANALYSER -> DESTINATION
// creates audio context, within which all audio is defined and configured
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();




// AUDIO ANALYSER
var canvas = document.getElementById('myCanvas');
var canvasCtx = canvas.getContext("2d")
var WIDTH = canvas.width;
var HEIGHT = canvas.height;


let analyser = audioCtx.createAnalyser();
analyser.smoothingTimeConstant = 0.9
let waveAnalyser = audioCtx.createAnalyser();


analyser.fftSize = 256;

function draw() {
  var bufferLength = analyser.frequencyBinCount; // equal to half of fftSize
  var dataArray = new Uint8Array(bufferLength); // creates an array of unsigned 8 bit integers, with a length of 1024
  canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
  drawVisual = window.requestAnimationFrame(draw);
  analyser.getByteFrequencyData(dataArray);
  canvasCtx.fillStyle = 'rgb(0, 0, 0)';
  canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

  var barWidth = (WIDTH / bufferLength) * 2.5;
    var barHeight;
    var x = 0;

  for (var i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i];
    canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
    canvasCtx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight);
    x += barWidth + 1;
  }
}
//draw()
// waveform visualizer; x-axis is time, y-axis is amplitude
waveAnalyser.fftSize = 2048;



// DRUM SAMPLE LOADER
// get data retrieves an audio file from the samples folder and decodes it, saving that audio file to a new buffer source. Think of it as making a sample ready to play.
var source;
var drumGain = audioCtx.createGain();
drumGain.gain.value = 3;

function getData(sound) {
  source = audioCtx.createBufferSource();

  var request = new XMLHttpRequest();
  request.open('GET', `./samples/${sound}.wav`, true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    var audioData = request.response;
    audioCtx.decodeAudioData(audioData, function(buffer) {
      source.buffer = buffer;
      source.connect(drumGain)
      drumGain.connect(audioCtx.destination);
      source.loop = true;
      },
      function(e){console.log('Error with decoding audio data' + e.err)});
  }
  request.send();
}

var play = document.getElementById('play')
  play.onclick = function() {
  getData('drum1');
  source.start(0);
  draw()
  //play.setAttribute('disabled', 'disabled');
}

var stop = document.getElementById('stop')
  stop.onclick = function(){
    source.stop(0);
  }
