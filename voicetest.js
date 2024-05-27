import bhashini from 'bhashini-translation';
import { getApiKey } from 'backend/keys.jsw';

function blobToBase64(blob) {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise((resolve, reject) => {
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                reject('Error: reader result is not a string');
            }
        };
        reader.onerror = reject;
    });
}


$w.onReady(async function () {
    console.log("Page is ready");

    // Fetch API keys
    const { UserId, UlcaApiKey, InferenceApiKey } = await getApiKey();
    bhashini.auth(UserId, UlcaApiKey, InferenceApiKey);

    const voiceRecorder = $w('#voiceRecorder');
    const resultText = $w('#result');
    let isRecording = false;

    if (voiceRecorder) {
        console.log("VoiceRecorder custom element found");

        voiceRecorder.on('audiofile', async ({ detail: { audioBlob } }) => {
            if (audioBlob) {
                console.log("Audio file received:", audioBlob);

                const audioUrl = URL.createObjectURL(audioBlob);
                console.log("Generated audio URL:", audioUrl)
        

                try {
                    const base64Audio = await blobToBase64(audioBlob);
                    console.log("Base64 audio data:", base64Audio);

                    const sourceLang = 'hi';  // Hindi
                    const targetLang = 'en';  // English

                    const response = await bhashini.asr(sourceLang, base64Audio);
                    console.log("Bhashini API response:", response);

                    if (response) {
                        resultText.text = response;
                    } else {
                        console.error("No translation received from Bhashini API");
                    }
                } catch (error) {
                    console.error("Error processing audio file:", error);
                    if (error.response) {
                        console.error("Bhashini API response error:", error.response.data);
                    } else {
                        console.error("Unknown error:", error);
                    }
                }
            } else {
                console.error("Audio blob is undefined");
            }
        });

        $w('#voiceButton').onClick(() => {
            console.log("VoiceButton clicked");
            if (!isRecording) {
                console.log("Starting recording");
                voiceRecorder.setAttribute('startrecording', 'true');
            } else {
                console.log("Stopping recording");
                voiceRecorder.setAttribute('startrecording', 'false');
            }
            isRecording = !isRecording;
        });
    } else {
        console.error("VoiceRecorder custom element or audio player not found");
    }
});
