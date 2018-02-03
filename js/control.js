const fs = require('fs');
const RecordRTC = require('recordrtc');
const ffmpeg = require('fluent-ffmpeg');
const StereoAudioRecorder = RecordRTC.StereoAudioRecorder;

let preview = document.getElementById("preview");
let record = document.getElementById("record");
let startButton = document.getElementById("start");
let stopButton = document.getElementById("stop");

function millisToMinutesAndSeconds(millis) {
  const minutes = Math.floor(millis / 60000);
  const seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

function controls() {
  navigator.mediaDevices.getUserMedia({audio: true})
    .then(stream => {
      const options = {
        recorderType: StereoAudioRecorder,
        mimeType: 'audio/wav'
      };
      const recordRTC = RecordRTC(stream, options);

      startButton.onclick = function () {
        recordRTC.startRecording();
        preview.srcObject = stream;
      };

      stopButton.onclick = function () {
        recordRTC.stopRecording(function (audioURL) {
          record.src = audioURL;

          const recordedBlob = recordRTC.getBlob();

          const fileReader = new FileReader();
          fileReader.onload = function () {
            fs.writeFileSync('test.wav', Buffer(new Uint8Array(fileReader.result)));
          };
          fileReader.readAsArrayBuffer(recordedBlob);
        });

        const current = Date.now();

        ffmpeg('./test.wav')
          .audioBitrate(128)
          .audioChannels(1)
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
      }
    })
}

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  controls();
}
