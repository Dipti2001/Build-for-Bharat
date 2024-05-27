import bhashini from 'bhashini-translation';
import { getApiKey } from 'backend/keys.jsw';
import wixData from 'wix-data';

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

async function initBhashini() {
    const { UserId, UlcaApiKey, InferenceApiKey } = await getApiKey();
    bhashini.auth(UserId, UlcaApiKey, InferenceApiKey);
    return { UserId, UlcaApiKey, InferenceApiKey };
}

async function translateText(UserId, UlcaApiKey, InferenceApiKey, text, sourceLang, targetLang) {
    bhashini.auth(UserId, UlcaApiKey, InferenceApiKey);
    return await bhashini.nmt(sourceLang, targetLang, text);
}

async function performSearch(query) {
    try {
        const results = await wixData.query('BhashiniProducts')
            .contains('title', query)
            .or(wixData.query('BhashiniProducts').contains('productDescription', query))
            .find();
        $w('#repeater1').data = results.items;
    } catch (err) {
        console.error("Error querying BhashiniProducts:", err);
    }
}

async function handleTextInput(inputText) {
    const { UserId, UlcaApiKey, InferenceApiKey } = await initBhashini();
    const translatedText = await translateText(UserId, UlcaApiKey, InferenceApiKey, inputText, 'hi', 'en');
    console.log("Translated text:", translatedText);
    $w("#inputBar").value = translatedText;
    await performSearch(translatedText);
}

async function handleVoiceInput(audioBlob) {
    const base64Audio = await blobToBase64(audioBlob);
    const { UserId, UlcaApiKey, InferenceApiKey } = await initBhashini();
    const response = await bhashini.asr_nmt('hi', 'en', base64Audio);
    if (response) {
        $w("#inputBar").value = response;
        await performSearch(response);
    } else {
        console.error("No translation received from Bhashini API");
    }
}

function setupVoiceRecorder() {
    const voiceRecorder = $w('#voiceRecorder');
    const voiceButton = $w('#voiceButton');
    let isRecording = false;

    if (voiceRecorder) {
        console.log("VoiceRecorder custom element found");
        voiceRecorder.on('audiofile', async ({ detail: { audioBlob } }) => {
            if (audioBlob) {
                await handleVoiceInput(audioBlob);
            } else {
                console.error("Audio blob is undefined");
            }
        });

        voiceButton.onClick(() => {
            console.log("VoiceButton clicked");
            if (isRecording) {
                console.log("Stopping recording");
                voiceRecorder.setAttribute('startrecording', 'false');
                voiceButton.style.backgroundColor = 'white'; // Reset background color
            } else {
                console.log("Starting recording");
                voiceRecorder.setAttribute('startrecording', 'true');
                voiceButton.style.backgroundColor = '#7FFFD4'; // Change background color to indicate recording
            }
            isRecording = !isRecording;
        });
    } else {
        console.error("VoiceRecorder custom element or audio player not found");
    }
}

$w.onReady(async function () {
    console.log("Page is ready");

    setupVoiceRecorder();

    $w('#searchBtn').onClick(() => {
        const inputText = $w("#searchbar").value;
        handleTextInput(inputText);
    });

    let throttle;
    $w('#searchbar').onInput(() => {
        clearTimeout(throttle);
        throttle = setTimeout(() => {
            const inputText = $w("#searchbar").value;
            handleTextInput(inputText);
        }, 250);
    });
});
