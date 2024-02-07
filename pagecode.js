import bhashini from 'bhashini-translation';
import { getApiKey } from 'backend/keys.jsw';
import wixData from 'wix-data';

$w.onReady(async function () {
    let { UserId, UlcaApiKey, InferenceApiKey } = await getApiKey();

    // Function to perform translation and search
    async function translateAndSearch() {
        try {
            // Get the input value in Hindi from the input field with ID 'searchbar'
            const hindiInput = $w("#searchbar").value;
            console.log("Hindi input:", hindiInput);

            // Assuming bhashini.auth() needs to be called each time before translation
            bhashini.auth(UserId, UlcaApiKey, InferenceApiKey);

            // Translate the input and then perform the search
            const translatedText = await bhashini.nmt('hi', "en", hindiInput);
            console.log(translatedText); // Log the translated text for debugging
            $w("#inputBar").value = translatedText; // Assuming you want to display the translated text

            // Now perform the search with the translated text
            search(translatedText);
        } catch (error) {
            console.error("Translation or search error", error);
        }
    }

    // Function to query the database and update the repeater
    async function search(query) {
        try {
            const query = $w('#inputBar').value;
            const results = await wixData.query('BhashiniProducts')
                .contains('title', query)
                .or(wixData.query('BhashiniProducts').contains('productDescription', query))
                .find();

            $w('#repeater1').data = results.items;
        } catch (err) {
            console.error("Error querying BhashiniProducts:", err);
        }
    }

    // Event listener for search button click
    $w('#searchBtn').onClick(() => translateAndSearch());

    // Event listener for input in searchbar
    let throttle;
    $w('#searchbar').onInput(() => {
        clearTimeout(throttle);
        throttle = setTimeout(() => {
            translateAndSearch();
        }, 250);
    });
});
