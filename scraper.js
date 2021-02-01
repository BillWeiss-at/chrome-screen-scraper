async function startCapture(displayMediaOptions) {
    let captureStream = null;

    try {
        captureStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        document.getElementById("video").srcObject = captureStream;
    } catch(err) {
        console.error("Error: " + err);
    }
    return captureStream;
}

function dumpOptionsInfo(videoElem) {
    const videoTrack = videoElem.getVideoTracks()[0];
    const audioTrack = videoElem.getAudioTracks()[0];

    console.info("Track settings:");
    console.info(JSON.stringify(videoTrack.getSettings(), null, 2));
    console.info(JSON.stringify(audioTrack.getSettings(), null, 2));
    console.info("Track constraints:");
    console.info(JSON.stringify(videoTrack.getConstraints(), null, 2));
    console.info(JSON.stringify(audioTrack.getConstraints(), null, 2));
}

async function getCapturing() {
    // set up capture and start
    var captureOptions = {
        video: {
            cursor: "never"
        },
        audio: {
            echoCancellation: false,
            noiseSuppression: false,
            sampleRate: 44100
        }
    };
    capture = await startCapture(captureOptions);
    dumpOptionsInfo(capture);

    // set up recording and, hopefully, get streaming?
    var recordedChunks = [];
    var recordingOptions = {
        mimeType: "video/webm; codecs=h264"
    };
    mediaRecorder = new MediaRecorder(capture, recordingOptions);

    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start();

    function handleDataAvailable(event) {
        console.log("data-available");
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
            console.log(recordedChunks);
            download();
        } else {
            console.log("Not sure what to do here, idk");
        }
    }

    function download() {
        var blob = new Blob(recordedChunks, {
            type: "video/mp4"
        });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        a.href = url;
        a.download = "test.mkv";
        a.click();
        window.URL.revokeObjectURL(url);
    }

    function stopCapture(event){
        mediaRecorder.stop()
        document.getElementById("video").srcObject.getTracks().forEach(track => track.stop());
        document.getElementById("video").srcObject = null;
    }

    const stopElem = document.getElementById("stop");
    stopElem.addEventListener("click", function(evt) {
      stopCapture();
    }, false);

    // if you click the Chrome "stop" button, still save media
    capture.addEventListener("inactive", function(evt) {
        stopCapture();
    }, false);
}

const startElem = document.getElementById("start");
startElem.addEventListener("click", function(evt) {
  getCapturing();
}, false);
