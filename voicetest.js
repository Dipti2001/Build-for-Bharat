$w.onReady(function () {
  console.log("Page is ready");

  const voiceRecorder = $w('#voiceRecorder');
  const audioPlayer = $w('#myAudioPlayer');

  if (voiceRecorder && audioPlayer) {
    console.log("VoiceRecorder custom element found");

    voiceRecorder.on('audiofile', ({ detail: { audioBlob } }) => {
      if (audioBlob) {
        console.log("Audio file received:", audioBlob);

        // Create a URL for the audio blob
        const audioUrl = URL.createObjectURL(audioBlob);

        // Set the audio player source to the audio blob URL
        audioPlayer.src = audioUrl;
        audioPlayer.play();
      } else {
        console.error("Audio blob is undefined");
      }
    });

    $w('#voiceButton').onClick(() => {
      console.log("VoiceButton clicked");
      console.log("Setting startrecording attribute to true");
      voiceRecorder.setAttribute('startrecording', 'true');
    });
  } else {
    console.error("VoiceRecorder custom element or audio player not found");
  }
});
