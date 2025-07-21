import { useState } from "react";
import { Alert } from "react-native";
import useCheckInfo from "./UserContext";

const useFaceRecognition = () => {
    const [matchedWorker, setMatchedWorker] = useState(null);
    const [loading, setLoading] = useState(false);

    const { BACKEND_API_URLS } = useCheckInfo();
    const BACKEND_API_URL = BACKEND_API_URLS.backend2;

    const recognizeFace = async (imageUri) => {
        try {
            console.log("recognizeFace: Starting process.");
            console.log("recognizeFace: BACKEND_API_URL:", BACKEND_API_URL);
            setLoading(true);
            setMatchedWorker(null);

            // --- CHANGED SECTION START ---
            // Create FormData and append the image directly using the URI object
            const formData = new FormData();
            formData.append('image', {
                uri: imageUri,
                type: 'image/jpeg', // IMPORTANT: Ensure this matches the actual image type (e.g., 'image/png')
                name: 'photo.jpg',
            });
            console.log("recognizeFace: FormData created with image URI directly.");
            // --- CHANGED SECTION END ---

            const requestUrl = `${BACKEND_API_URL}check_face/`;
            console.log("recognizeFace: Sending fetch request to:", requestUrl);

            const response = await fetch(requestUrl, {
                method: "POST",
                body: formData,
            });

            console.log("recognizeFace: Fetch response received. Status:", response.status);
            console.log("recognizeFace: Response OK status:", response.ok);

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`recognizeFace: HTTP Error: ${response.status} - ${response.statusText || 'No Status Text'}`);
                console.error("recognizeFace: Server error response body (non-OK status):", errorBody);
                throw new Error(`Recognition failed with status ${response.status}: ${response.statusText || 'No Status Text'}. Server response: ${errorBody}`);
            }

            console.log("recognizeFace: Response is OK. Attempting to read response body as text first...");
            const responseText = await response.text();
            console.log("recognizeFace: Raw response text:", responseText);

            let data = {};
            try {
                if (responseText) {
                    data = JSON.parse(responseText);
                    console.log("recognizeFace: Successfully parsed JSON data.");
                } else {
                    console.warn("recognizeFace: Response body was empty, setting data to empty object.");
                }
            } catch (jsonError) {
                console.error("recognizeFace: ERROR: Failed to parse response as JSON.", jsonError);
                console.error("recognizeFace: Original raw response text was:", responseText);
                throw new Error(`Invalid JSON response from server: ${jsonError.message}. Response text: ${responseText.substring(0, 200)}...`);
            }

            console.log("recognizeFace: Final data object:", data);

            if (data.matchFound) {
                setMatchedWorker(data.matched_worker);
                console.log("recognizeFace: Match found:", data.matched_worker);
            } else {
                Alert.alert("No match found!");
                console.log("recognizeFace: No match found.");
            }

            return data;
        } catch (error) {
            console.error("recognizeFace: CRITICAL ERROR caught in process:", error);
            console.error("recognizeFace: Error message:", error.message);
            console.error("recognizeFace: Error name:", error.name);
            Alert.alert("Recognition Error", `An error occurred: ${error.message}`);
            return { matchFound: false, error: error.message };
        } finally {
            setLoading(false);
            console.log("recognizeFace: Process finished. Loading set to false.");
        }
    };

    return { matchedWorker, recognizeFace, loading }; 
};

export default useFaceRecognition;
