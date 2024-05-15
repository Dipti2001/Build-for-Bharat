class VoiceRecorder extends HTMLElement {
  constructor() {
    super();
    this.audioChunks = [];
    this.mediaRecorder = null;
    this.stream = null;
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.innerHTML = `<p>Voice Recorder Ready</p>`; // Indicate readiness

    console.log("VoiceRecorder custom element created");
  }

  static get observedAttributes() {
    return ['startrecording'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`Attribute changed: ${name}, Old Value: ${oldValue}, New Value: ${newValue}`);
    if (name === 'startrecording' && newValue === 'true') {
      console.log("startrecording attribute is true, starting recording...");
      this.startRecording();
    }
  }

  async startRecording() {
    console.log("Start recording called");

    if (this.mediaRecorder) {
      console.log(`MediaRecorder state: ${this.mediaRecorder.state}`);
      if (this.mediaRecorder.state === 'recording') {
        console.log("MediaRecorder is already recording, stopping it");
        this.mediaRecorder.stop();
        return;
      } else if (this.mediaRecorder.state === 'inactive') {
        console.log("Resetting MediaRecorder and audioChunks");
        this.mediaRecorder = null;
        this.audioChunks = [];
      }
    }

    try {
      if (!this.stream) {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Media stream obtained");
      }

      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = event => {
        console.log("Data available event");
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        console.log("MediaRecorder stopped event");
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        console.log("Audio blob created:", audioBlob);
        this.dispatchEvent(new CustomEvent('audiofile', { detail: { audioBlob } }));
        console.log("Recording stopped and audiofile event dispatched with blob:", audioBlob);
        this.removeAttribute('startrecording'); // Reset attribute

        // Reset media recorder for next use
        this.mediaRecorder = null;
        this.audioChunks = [];
      };

      this.mediaRecorder.start();
      console.log("Recording started");

      setTimeout(() => {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
          this.mediaRecorder.stop();
        }
      }, 5000);
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  }
}

customElements.define('voice-recorder', VoiceRecorder);
