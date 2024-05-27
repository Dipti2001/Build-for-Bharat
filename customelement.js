import { MediaRecorder, register } from 'extendable-media-recorder';
import { connect as connectWavEncoder } from 'extendable-media-recorder-wav-encoder';

class VoiceRecorder extends HTMLElement {
    constructor() {
        super();
        this.audioBlobs = [];
        this.mediaRecorder = null;
        this.capturedStream = null;
        this.shadow = this.attachShadow({ mode: 'open' });
        this.shadow.innerHTML = `<p>Voice Recorder Ready</p>`; // Indicate readiness

        console.log("VoiceRecorder custom element created");

        // Register the WAV encoder once during initialization
        this.initializeEncoder();
    }

    static get observedAttributes() {
        return ['startrecording'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(`Attribute changed: ${name}, Old Value: ${oldValue}, New Value: ${newValue}`);
        if (name === 'startrecording') {
            if (newValue === 'true') {
                console.log("startrecording attribute is true, starting recording...");
                this.startRecording();
            } else if (newValue === 'false') {
                console.log("startrecording attribute is false, stopping recording...");
                this.stopRecording().then(audioBlob => {
                    if (audioBlob) {
                        this.dispatchEvent(new CustomEvent('audiofile', { detail: { audioBlob } }));
                        console.log("Recording stopped and audiofile event dispatched with blob:", audioBlob);
                    }
                });
            }
        }
    }

    async initializeEncoder() {
        try {
            await register(await connectWavEncoder());
            console.log("WAV encoder registered successfully");
        } catch (error) {
            console.error("Error initializing WAV encoder:", error);
        }
    }

    async startRecording() {
        console.log("Start recording called");

        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            console.log("MediaRecorder is already recording");
            return;
        }

        try {
            this.capturedStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true } });
            console.log("Media stream obtained");

            this.audioBlobs = [];

            this.mediaRecorder = new MediaRecorder(this.capturedStream, { mimeType: 'audio/wav' });

            this.mediaRecorder.addEventListener('dataavailable', event => {
                this.audioBlobs.push(event.data);
            });

            this.mediaRecorder.start();
            console.log("Recording started");
        } catch (error) {
            console.error("Error starting recording:", error);
        }
    }

    stopRecording() {
        console.log("Stop recording called");

        return new Promise(resolve => {
            if (!this.mediaRecorder) {
                resolve(null);
                return;
            }

            this.mediaRecorder.addEventListener('stop', () => {
                const mimeType = this.mediaRecorder.mimeType;
                const audioBlob = new Blob(this.audioBlobs, { type: mimeType });

                if (this.capturedStream) {
                    this.capturedStream.getTracks().forEach(track => track.stop());
                }

                resolve(audioBlob);
                this.mediaRecorder = null;
                this.audioBlobs = [];
                this.capturedStream = null;
            });

            this.mediaRecorder.stop();
        });
    }
}

customElements.define('voice-recorder', VoiceRecorder);
