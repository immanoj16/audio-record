let preview = document.getElementById("preview");
let record = document.getElementById("record");
let startButton = document.getElementById("start");
let stopButton = document.getElementById("stop");


function controls() {
  navigator.mediaDevices.getUserMedia({audio: true})
    .then(stream => {
      var mediaRecorder = new MediaRecorder(stream);

      startButton.onclick = function () {
        mediaRecorder.start();
        preview.srcObject = stream;
      }

      var data = [];

      mediaRecorder.ondataavailable = event => data.push(event.data);

      stopButton.onclick = function () {
        mediaRecorder.stop();
      }

      mediaRecorder.onstop = function () {
        let recordedBlob = new Blob(data, { type: "audio/ogg; codecs=opus" });
        record.src = URL.createObjectURL(recordedBlob);
      }
    })
    .catch(err => {
      console.log(err);
    })
}

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  controls();
}
