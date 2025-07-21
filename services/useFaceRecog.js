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
            setLoading(true);
            setMatchedWorker(null);

            const formData = new FormData();
            formData.append('image', {
                uri: imageUri,
                type: 'image/jpeg',
                name: 'photo.jpg',
            });

            const requestUrl = `${BACKEND_API_URL}check_face/`;

            const response = await fetch(requestUrl, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Recognition failed with status ${response.status}: ${response.statusText || 'No Status Text'}. Server response: ${errorBody}`);
            }

            const responseText = await response.text();

            let data = {};
            try {
                if (responseText) {
                    data = JSON.parse(responseText);
                } else {
                    console.warn("recognizeFace: Response body was empty, setting data to empty object.");
                }
            } catch (jsonError) {
                throw new Error(`Invalid JSON response from server: ${jsonError.message}. Response text: ${responseText.substring(0, 200)}...`);
            }


            if (data.matchFound) {
                setMatchedWorker(data.matched_worker);
            } else {
                Alert.alert("No match found!");
            }

            return data;
        } catch (error) {
            Alert.alert("Recognition Error", `An error occurred: ${error.message}`);
            return { matchFound: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    return { matchedWorker, recognizeFace, loading }; 
};

export default useFaceRecognition;
