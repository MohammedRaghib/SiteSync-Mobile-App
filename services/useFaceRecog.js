import { useState } from "react";
import { Alert } from "react-native";

const useFaceRecognition = () => {
    const [matchedWorker, setMatchedWorker] = useState(null);
    const [loading, setLoading] = useState(false);

    const FACE_API_KEY = "YOUR_AZURE_FACE_API_KEY";
    const FACE_API_ENDPOINT = "https://<your-resource-name>.cognitiveservices.azure.com";
    const PERSON_GROUP_ID = "your-attendance-system"; 

    const recognizeFace = async (imageUri) => {
        try {
            setLoading(true);
            setMatchedWorker(null);

            const response = await fetch(imageUri);
            const imageBlob = await response.blob();

            const detectResponse = await fetch(
                `${FACE_API_ENDPOINT}/face/v1.0/detect?returnFaceId=true`,
                {
                    method: "POST",
                    headers: {
                        "Ocp-Apim-Subscription-Key": FACE_API_KEY,
                        "Content-Type": "application/octet-stream",
                    },
                    body: imageBlob,
                }
            );

            if (!detectResponse.ok) {
                throw new Error(`Face detection failed: ${await detectResponse.text()}`);
            }

            const faces = await detectResponse.json();
            if (faces.length === 0) {
                Alert.alert("No faces detected in the image");
                return { matchFound: false };
            }

            const identifyResponse = await fetch(
                `${FACE_API_ENDPOINT}/face/v1.0/identify`,
                {
                    method: "POST",
                    headers: {
                        "Ocp-Apim-Subscription-Key": FACE_API_KEY,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        faceIds: [faces[0].faceId],
                        personGroupId: PERSON_GROUP_ID,
                        maxNumOfCandidatesReturned: 1,
                        confidenceThreshold: 0.5,
                    }),
                }
            );

            if (!identifyResponse.ok) {
                throw new Error(`Identification failed: ${await identifyResponse.text()}`);
            }

            const identificationResults = await identifyResponse.json();
            if (identificationResults[0].candidates.length === 0) {
                Alert.alert("No matching worker found");
                return { matchFound: false };
            }

            const personId = identificationResults[0].candidates[0].personId;
            const personResponse = await fetch(
                `${FACE_API_ENDPOINT}/face/v1.0/persongroups/${PERSON_GROUP_ID}/persons/${personId}`,
                {
                    headers: {
                        "Ocp-Apim-Subscription-Key": FACE_API_KEY,
                    },
                }
            );

            const personData = await personResponse.json();

            const formattedResponse = {
                matchFound: true,
                matched_worker: {
                    person_id: personId,
                    name: personData.name,
                    face_encoding: null,
                    ...(personData.userData ? JSON.parse(personData.userData) : {}),
                },
            };

            setMatchedWorker(formattedResponse.matched_worker);
            return formattedResponse;
            
        } catch (error) {
            console.error("Face recognition error:", error);
            Alert.alert("Error", error.message);
            return { 
                matchFound: false, 
                error: error.message 
            };
        } finally {
            setLoading(false);
        }
    };

    return { matchedWorker, recognizeFace, loading };
};

export default useFaceRecognition;