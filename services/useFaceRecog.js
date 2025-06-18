import { useState } from "react";
import { Alert } from "react-native";

const BACKEND_API_URL = "http://127.0.0.1:9000/api/";


const useFaceRecognition = () => {
    const [matchedWorker, setMatchedWorker] = useState(null);
    const [loading, setLoading] = useState(false);

    const convertImageUriToBlob = async (imageUri) => {
        const response = await fetch(imageUri);
        return response.blob();
    };

    const recognizeFace = async (imageUri) => {
        try {
            setLoading(true);
            setMatchedWorker(null);

            const imageBlob = await convertImageUriToBlob(imageUri);
            const formData = new FormData();
            formData.append("image", imageBlob);

            const response = await fetch(`${BACKEND_API_URL}check_face/`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(`Recognition failed: ${response.statusText}`);
            }
            
            if (data.matchFound) {
                setMatchedWorker(data.matched_worker);
            } else {
                Alert.alert("No match found!");
            }

            return data;
        } catch (error) {
            return { matchFound: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    return { matchedWorker, recognizeFace, loading, convertImageUriToBlob };
};

export default useFaceRecognition;