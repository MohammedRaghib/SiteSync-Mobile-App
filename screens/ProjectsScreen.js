import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, TouchableOpacity, ScrollView, View } from "react-native";
import log from "../components/Logger";
import { useTranslation } from "react-i18next";
import useCheckInfo from "../services/UserContext";

function Projects() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { setUser, user, loggedIn, BACKEND_API_URLS } = useCheckInfo();
    const BACKEND_API_URL = BACKEND_API_URLS.backend1;

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const fetchProjects = async () => {
        try {
            const response = await fetch(`${BACKEND_API_URL}get_person_projects/${user?.id}/`);
            const json = await response.json().catch(() => {
                throw new Error(t("errors.fetchError"));
            });

            if (!response.ok) {
                throw new Error(t("errors." + (json.error_type || "fetchError")));
            }

            setProjects(json.projects || []);
        } catch (error) {
            log.error(error);
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const selectProject = (projectId, projectName) => {
        setUser((prev) => ({ ...prev, projectId, projectName }));
        navigation.navigate("Home");
    };

    useEffect(() => {
        if (loggedIn) fetchProjects();
        else setLoading(false);
    }, []);

    const renderLoading = () => <Text style={styles.loading}>{t("ui.loading")}</Text>;

    const renderError = () => <Text style={styles.error}>{t(errorMessage)}</Text>;

    const renderNoData = () => <Text style={styles.noData}>{t("ui.noData")}</Text>;

    const renderProjectList = () => (
        <>
            {user?.projectId && (
                <Text style={styles.title}>
                    {t("ui.selectedProject")}: {user.projectName}
                </Text>
            )}
            {projects.map((p) => (
                <TouchableOpacity
                    key={p.id}
                    style={styles.link}
                    onPress={() => selectProject(p.id, p.name)}
                >
                    <Text style={styles.text}>{p.name}</Text>
                </TouchableOpacity>
            ))}
            {projects.length === 0 && renderNoData()}
        </>
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {!loggedIn && (
                <TouchableOpacity style={styles.link} onPress={() => navigation.navigate("Login")}>
                    <Text style={styles.text}>{t("ui.login")}</Text>
                </TouchableOpacity>
            )}

            {loggedIn && (
                <View style={{ width: "100%", alignItems: "center" }}>
                    {loading && renderLoading()}
                    {!loading && errorMessage && renderError()}
                    {!loading && !errorMessage && renderProjectList()}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: "5%",
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 22,
        fontWeight: "600",
        marginBottom: 20,
        textAlign: "center",
    },
    link: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: "#007AFF",
        width: "80%",
        alignItems: "center",
        borderRadius: 10,
        marginVertical: 10,
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    text: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    error: {
        fontSize: 16,
        color: "red",
        textAlign: "center",
        marginVertical: 10,
    },
    noData: {
        fontSize: 16,
        fontStyle: "italic",
        color: "#666",
        textAlign: "center",
    },
    loading: {
        fontSize: 16,
        textAlign: "center",
        color: "#333",
    },
});

export default Projects;