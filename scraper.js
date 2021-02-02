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

    var ext = mediaRecorder.mimeType.split(';')[0].split('/')[1]
    if (ext == "x-matroska" ) { ext = "mkv"; }

    const { readable, writable } = new TransformStream({
        transform: (chunk, ctrl) => chunk.arrayBuffer().then(
            b => ctrl.enqueue(new Uint8Array(b))
        )
    });
    const writer = writable.getWriter();
    readable.pipeTo(streamSaver.createWriteStream('test.' + ext));
    document.getElementById("stop").onclick = event => {
        videoElem = document.getElementById("video").srcObject
        let tracks = [
            ...videoElem.getAudioTracks(),
            ...videoElem.getVideoTracks()
        ]
        for (const track of tracks) track.stop();

        if (mediaRecorder.state != "inactive") { mediaRecorder.stop() }

        setTimeout(() => {
            writer.ready.then(() => {
                writer.close().catch((err) => {
                    // sometimes the stream is closed by the time we get
                    // here. I don't know, it's fine.
                });
            }).catch((err) => {
                console.log("Stream error:", err);
            });
        }, 1000 );
    }

    mediaRecorder.ondataavailable = evt => writer.write(evt.data);
    mediaRecorder.start();

    // if you click the Chrome "stop" button, still save media
    capture.addEventListener("inactive", function(evt) {
        document.getElementById("stop").click();
    }, false);
}

const startElem = document.getElementById("start").onclick = event => {
  getCapturing();
}
