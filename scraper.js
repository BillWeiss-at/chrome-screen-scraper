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

    console.info("Track settings:");
    console.info(JSON.stringify(videoTrack.getSettings(), null, 2));
    if (videoElem.getAudioTracks().length > 0) {
        audioTrack = videoElem.getAudioTracks()[0];
        console.info(JSON.stringify(audioTrack.getSettings(), null, 2));
    } else {
        console.info("No audio track found");
    }
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
    var recordingOptions;
    if (MediaRecorder.isTypeSupported('video/x-matroska;codecs=avc1')) {
        recordingOptions = { mimeType: 'video/x-matroska;codecs=avc1' };
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        recordingOptions = { mimeType: 'video/webm;codecs=vp9' };
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        recordingOptions = { mimeType: 'video/webm;codecs=vp8' };
    } else {
        console.log("Can't find a supported mime type :(");
        return;
    }

    mediaRecorder = new MediaRecorder(capture, recordingOptions);

    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start();

    const ext = mediaRecorder.mimeType.split(';')[0].split('/')[1]

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
            type: mediaRecorder.mimeType
        });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        a.href = url;
        a.download = "test." + ext;
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
    // you'll get an error from mediaRecorder.stop but it's fine
    capture.addEventListener("inactive", function(evt) {
        stopCapture();
    }, false);
}

const startElem = document.getElementById("start");
startElem.addEventListener("click", function(evt) {
  getCapturing();
}, false);
