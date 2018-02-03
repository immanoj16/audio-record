const fs = require('fs');
const RecordRTC = require('recordrtc');
const ffmpeg = require('fluent-ffmpeg');
const StereoAudioRecorder = RecordRTC.StereoAudioRecorder;

let preview = document.getElementById("preview");
let record = document.getElementById("record");
let startButton = document.getElementById("start");
let stopButton = document.getElementById("stop");

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

function controls() {
  navigator.mediaDevices.getUserMedia({audio: true})
    .then(stream => {
      var options = {
        recorderType: StereoAudioRecorder,
        mimeType: 'audio/wav',
        autoWriteToDisk: true
      };
      var recordRTC = RecordRTC(stream, options);
      startButton.onclick = function () {
        recordRTC.startRecording();
        preview.srcObject = stream;
      }

      stopButton.onclick = function () {
        recordRTC.stopRecording(function(audioURL) {
          record.src = audioURL;

          var recordedBlob = recordRTC.getBlob();
          var fileReader = new FileReader();
          fileReader.onload = function () {
            fs.writeFileSync('test.wav', Buffer(new Uint8Array(fileReader.result)));
          };
          fileReader.readAsArrayBuffer(recordedBlob);
        })

        while (true) {
          const path = __dirname + './test.wav';
          const current = Date.now();

          if (fs.existsSync(path)) {
            ffmpeg('./test.wav')
              .toFormat('mp3')
              .on('error', err => {
                console.log('An error is occurred: ' + err.message);
              })
              .on('progress', progress => {
                console.log('Processing: ' + progress.targetSize + ' KB converted');
              })
              .on('end', () => {
                console.log('Finished!');
                console.log(millisToMinutesAndSeconds(Date.now() - current));
              })
              .save('./test.mp3');

            break;
          } else {
            console.log('file is not exist');
          }
        }
      }
    })
}

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  controls();
}
