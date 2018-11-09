//SIGNAL CHAIN: 12 OSC -> 12 GAIN NODES -> FILTER -> ANALYSER -> DESTINATION
// creates audio context, within which all audio is defined and configured
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var audio = document.getElementById('drum1')
var audioSource = audioCtx.createMediaElementSource(audio)



// AUDIO ANALYSER
var canvas = document.getElementById('layer1');
var canvasCtx = canvas.getContext("2d")
var canvas2 = document.getElementById('layer2')
var canvasCtx2 = canvas2.getContext("2d")
// var WIDTH = canvas.width;
// var HEIGHT = canvas.height;
// var WIDTH2 = canvas2.width;
// var HEIGHT2 = canvas2.height;
var WIDTH = 1200
var HEIGHT = 600

let analyser = audioCtx.createAnalyser();
analyser.smoothingTimeConstant = 0.9
let waveAnalyser = audioCtx.createAnalyser();


analyser.fftSize = 2048;

var bufferLength = analyser.frequencyBinCount; // equal to half of fftSize
let counter = 0;
function draw() {
  counter++
  //console.log(counter, 'in draw')
  var dataArray = new Uint8Array(bufferLength); // creates an array of unsigned 8 bit integers, with a length of 1024
  canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
  window.requestAnimationFrame(draw);
  analyser.getByteFrequencyData(dataArray);
  //console.log(dataArray)
  canvasCtx.fillStyle = 'blue';
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
   canvasCtx2.clearRect(0, 0, WIDTH, HEIGHT);
  var drawVisual = requestAnimationFrame(draw2);
  waveAnalyser.getByteTimeDomainData(dataArray2)

  //canvasCtx2.fillStyle = 'red';
  //canvasCtx2.fillRect(0, 0, WIDTH, HEIGHT);

  canvasCtx2.lineWidth = 2;
  canvasCtx2.strokeStyle = 'black';
  canvasCtx2.beginPath();

  var sliceWidth = WIDTH * 1.0 / bufferLength;
  var x = 0;

  for (var i = 0; i < bufferLength; i++) {

    var v = dataArray2[i] / 128.0;
    var y = v * HEIGHT / 2;

    if (i === 0) {
      canvasCtx2.moveTo(x, y);
    } else {
      canvasCtx2.lineTo(x, y);
    }

    x += sliceWidth;
  }

  canvasCtx2.lineTo(canvas2.width, canvas2.height / 2);
      canvasCtx2.stroke();


}
//draw()
// waveform visualizer; x-axis is time, y-axis is amplitude



// DRUM SAMPLE LOADER
// get data retrieves an audio file from the samples folder and decodes it, saving that audio file to a new buffer source. Think of it as making a sample ready to play.
var source;
var source2;
var drumGain = audioCtx.createGain();
drumGain.gain.value = 3;
var drumGain2 = audioCtx.createGain();
drumGain2.gain.value = 4;

function getData(sound) {
  source = audioCtx.createBufferSource();
 // source2 = audioCtx.createBufferSource();
  source.connect(analyser)
  //audioSource.connect(analyser)
 // source2.connect(waveAnalyser)
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
  //source = audioCtx.createBufferSource();
  source2 = audioCtx.createBufferSource();

  source2.connect(waveAnalyser)
  var request = new XMLHttpRequest();
  request.open('GET', `./samples/${sound}.wav`, true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    var audioData2 = request.response;
    audioCtx.decodeAudioData(audioData2, function(buffer) {
      source2.buffer = buffer;
      source2.connect(drumGain2)
      drumGain2.connect(audioCtx.destination);
      source2.loop = false;
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

var play2 = document.getElementById('crash')
  play2.onclick = function () {
    getData2('crash');
    //source.stop(0);
    source2.start(0);
    draw2()
  }

var stop = document.getElementById('stop')
  stop.onclick = function(){
    source.stop(0);
    //source2.stop(0);
   // source2.stop(0);
  }

  
