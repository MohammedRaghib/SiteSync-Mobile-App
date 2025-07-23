import { useState } from "react";
import { Alert } from "react-native";
import useCheckInfo from "./UserContext";

const useFaceRecognition = () => {
    const [matchedWorker, setMatchedWorker] = useState(null);
    const [loading, setLoading] = useState(false);

    const { BACKEND_API_URLS } = useCheckInfo();
    const BACKEND_API_URL = BACKEND_API_URLS.backend2;

    const recognizeFace = async (imageUri) => {
        //Debug console.log("📸 Starting face recognition with image URI:", imageUri);

        try {
            setLoading(true);
            setMatchedWorker(null);

            const formData = new FormData();
            formData.append('image', {
                uri: imageUri,
                type: 'image/jpeg',
                name: 'photo.jpg',
            });

            const requestUrl = `${BACKEND_API_URL}check_face/`;
            //Debug console.log("📤 Sending POST request to:", requestUrl);

            const response = await fetch(requestUrl, {
                method: "POST",
                body: formData,
            });

            //Debug console.log("📥 Response status:", response.status, response.statusText);

            if (!response.ok) {
                let errorBody = "Unknown error";
                try {
                    const errorJson = await response.json();
                    errorBody = errorJson.detail || JSON.stringify(errorJson);
                    //Debug console.error("❌ Server error JSON:", errorJson);
                } catch (e) {
                    errorBody = await response.text();
                    //Debug console.error("❌ Server error (non-JSON):", errorBody);
                }
                throw new Error(`Recognition failed with status ${response.status}: ${response.statusText || 'No Status Text'}. Server response: ${errorBody}`);
            }

            const responseText = await response.text();
            //Debug console.log("📄 Raw response text:", responseText);

            let data = {};
            try {
                if (responseText) {
                    data = JSON.parse(responseText);
                    //Debug console.log("✅ Parsed JSON:", data);
                }
            } catch (jsonError) {
                //Debug console.error("❌ Failed to parse JSON. Raw text:", responseText);
                throw new Error(`Invalid JSON response from server. Response text: ${responseText.substring(0, 200)}...`);
            }

            if (data.matchFound) {
                //Debug console.log("👤 Match found:", data.matched_worker);
                setMatchedWorker(data.matched_worker);
            }

            return data;
        } catch (error) {
            const errorMessage = typeof error.message === 'string' ? error.message : JSON.stringify(error);
            //Debug console.error("🚨 Face recognition error:", errorMessage);
            return { matchFound: false, error: errorMessage };
        } finally {
            setLoading(false);
            //Debug console.log("📴 Face recognition completed.");
        }
    };

    return { matchedWorker, recognizeFace, loading };
};

export default useFaceRecognition;