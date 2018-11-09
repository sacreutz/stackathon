//SIGNAL CHAIN: 12 OSC -> 12 GAIN NODES -> FILTER -> ANALYSER -> DESTINATION
// creates audio context, within which all audio is defined and configured
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var audio = document.getElementById('drum1')
var audioSrc = audioCtx.createMediaElementSource(audio)



// AUDIO ANALYSER
var canvas = document.getElementById('myCanvas');
var canvasCtx = canvas.getContext("2d")
var WIDTH = canvas.width;
var HEIGHT = canvas.height;


let analyser = audioCtx.createAnalyser();
analyser.smoothingTimeConstant = 0.9
let waveAnalyser = audioCtx.createAnalyser();


analyser.fftSize = 2048;

var bufferLength = analyser.frequencyBinCount; // equal to half of fftSize
let counter = 0;
function draw() {
  counter++
  console.log(counter, 'in draw')
  var dataArray = new Uint8Array(bufferLength); // creates an array of unsigned 8 bit integers, with a length of 1024
  canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
  window.requestAnimationFrame(draw);
  analyser.getByteFrequencyData(dataArray);
  console.log(dataArray)
  canvasCtx.fillStyle = 'pink';
  canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

  let barWidth = (WIDTH / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

  for (var i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i] * 3;
    canvasCtx.fillStyle = 'green'
    canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight);
    x += barWidth + 1;
  }
}

waveAnalyser.fftSize = 2048;

function draw2() {
  var dataArray2 = new Uint8Array(bufferLength);
   canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
  var drawVisual = requestAnimationFrame(draw);
  waveAnalyser.getByteTimeDomainData(dataArray2)

  canvasCtx.fillStyle = 'rgb(200, 200, 200)';
  canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
  canvasCtx.beginPath();

  var sliceWidth = WIDTH * 1.0 / bufferLength;
  var x = 0;

  for (var i = 0; i < bufferLength; i++) {

    var v = dataArray2[i] / 128.0;
    var y = v * HEIGHT/2;

    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  canvasCtx.lineTo(canvas.width, canvas.height/2);
      canvasCtx.stroke();


}
//draw()
// waveform visualizer; x-axis is time, y-axis is amplitude



// DRUM SAMPLE LOADER
// get data retrieves an audio file from the samples folder and decodes it, saving that audio file to a new buffer source. Think of it as making a sample ready to play.
var source;
var source2;
var drumGain = audioCtx.createGain();
drumGain.gain.value = 3;

function getData(sound) {
  source = audioCtx.createBufferSource();
  source2 = audioCtx.createBufferSource();
  source.connect(analyser)
  source2.connect(analyser)
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

function getData2(sound) {

  source2 = audioCtx.createBufferSource();

  source2.connect(waveAnalyser)
  var request = new XMLHttpRequest();
  request.open('GET', `./samples/${sound}.wav`, true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    var audioData = request.response;
    audioCtx.decodeAudioData(audioData, function(buffer) {
      source2.buffer = buffer;
      source2.connect(drumGain)
      drumGain.connect(audioCtx.destination);
      source2.loop = true;
      },
      function(e){console.log('Error with decoding audio data' + e.err)});
  }
  request.send();
}

var play = document.getElementById('play')
  play.onclick = function() {
  getData('drum1');
  source.start(0);
  draw2()
  //play.setAttribute('disabled', 'disabled');
}

var play2 = document.getElementById('play2')
  play2.onclick = function () {
    getData2('crash');
    source2.start(0);
    draw2()
  }

var stop = document.getElementById('stop')
  stop.onclick = function(){
    source.stop(0);
  }

  var stop2 = document.getElementById('stop2')
  stop2.onclick = function(){
    source2.stop(0);
  }
