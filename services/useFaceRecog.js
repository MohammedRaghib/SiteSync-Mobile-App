import { useState } from "react";
import { Alert } from "react-native";
import useCheckInfo from "./UserContext";
import log from "./Logger";

const useFaceRecognition = () => {
    const [matchedWorker, setMatchedWorker] = useState(null);
    const [loading, setLoading] = useState(false);

    const { BACKEND_API_URLS } = useCheckInfo();
    const BACKEND_API_URL = BACKEND_API_URLS.backend1;

    const recognizeFace = async (imageUri) => {
        log.info("📸 Starting face recognition with image URI:", imageUri);

        const requestUrl = BACKEND_API_URL + "check_face/";

        try {
            setLoading(true);
            setMatchedWorker(null);

            const formData = new FormData();
            formData.append("image", {
                uri: imageUri,
                type: "image/jpeg",
                name: "photo.jpg",
            });

            let response;
            try {
                log.info("📩 Sending POST request to URL:", requestUrl);

                response = await fetch(requestUrl, {
                    method: "POST",
                    body: formData,
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
            } catch (err) {
                log.error("❌ Fetch crashed:", err.message, err.stack);
                return { matchFound: false, error: err.message };
            }

            log.info("📥 Response status:", response.status);

            if (!response.ok) {
                let errorBody = "Unknown error";
                try {
                    const errorJson = await response.json();
                    errorBody = errorJson.detail || JSON.stringify(errorJson);
                    log.error("❌ Server error JSON:", errorJson);
                } catch (e) {
                    errorBody = await response.text();
                    log.error("❌ Server error (non-JSON):", errorBody);
                }
                throw new Error(`Recognition failed with status ${response.status}. Server response: ${errorBody}`);
            }

            const responseText = await response.text();
            log.info("📄 Raw response text:", responseText);

            let data = {};
            try {
                if (responseText) {
                    data = JSON.parse(responseText);
                    log.info("✅ Parsed JSON:", data);
                }
            } catch (jsonError) {
                log.error("❌ Failed to parse JSON. Raw text:", responseText);
                throw new Error(`Invalid JSON response. Text: ${responseText.substring(0, 200)}...`);
            }

            if (data.matchFound) {
                log.info("👤 Match found:", data.matchedPerson);
                setMatchedWorker(data.matchedPerson);
            }

            return data;
        } catch (error) {
            const errorMessage = typeof error.message === "string" ? error.message : JSON.stringify(error);
            log.error("🚨 Face recognition error:", errorMessage);
            return { matchFound: false, error: errorMessage };
        } finally {
            setLoading(false);
            log.info("📴 Face recognition completed.");
        }
    };

    return { matchedWorker, recognizeFace, loading };
};

export default useFaceRecognition;
