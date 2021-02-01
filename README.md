# chrome-screen-scraper
demo of using a native API to do video capture in Chrome

The goal is to capture video with audio from a tab and save it locally.
Streaming to a server to save is acceptable but not ideal. The goal is no
browser extensions, but using a Javascript shim is acceptable if needed. User
prompting is totally ok for this, it isn't intended as a stealthy capture.

## References

* https://developer.chrome.com/docs/extensions/reference/tabCapture/ -
  Chrome-only API to capture video
* https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia -
  Cross-platform API to do video recording, seemingly
* https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture -
  Mozilla docs on using `getDisplayMedia`
* https://w.kast.live/ - site that does video capture. Bill's used this thing a lot,
  inspired the project.
* https://www.twilio.com/docs/video/screen-capture-chrome - Twillio javascript
  library to do screen capturing

