import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
    Platform,
    Button,
    Image,
    ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { launchImageLibrary } from "react-native-image-picker";
import useCheckInfo from "../services/UserContext";
import log from "../components/Logger";
import CustomAlert from "../components/CustomAlert";
import useAttendanceAndChecks from "../services/useAttendanceChecks";

const RegisterPersonScreen = () => {
    const navigation = useNavigation();
    const { setUser, loggedIn, BACKEND_API_URLS } = useCheckInfo();
    const { t } = useTranslation();
    const BACKEND_API_URL = BACKEND_API_URLS.backend1;
    const { compressImageIfNeeded } = useAttendanceAndChecks();

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertType, setAlertType] = useState("error");
    const [alertMessage, setAlertMessage] = useState("");

    const [form, setForm] = useState({
        nationalIdNumber: "",
        nationalIdSerial: "",
        name: "",
        gender: "",
        dateOfBirth: new Date(),

        contact: "",
        email: "",

        roleId: "",
        roleName: "",
        username: "",
        password: "",

        projects: [],
        supervisors: [],

        photo: null,
        idFront: null,

        baseRate: 0,
        overtimeRate: 0,

        hoursStart: new Date(),
        hoursEnd: new Date(),
    });
    const [projects, setProjects] = useState([]);
    const [supervisors, setSupervisors] = useState([]);
    const [roles, setRoles] = useState([]);

    const [projectsModalVisible, setProjectsModalVisible] = useState(false);
    const [supervisorsModalVisible, setSupervisorsModalVisible] = useState(false);

    const [showDOBPicker, setShowDOBPicker] = useState(false);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const [IsAccountEditable, setIsAccountEditable] = useState(false);

    const showAlert = (type, message) => {
        setAlertType(type);
        setAlertMessage(message);
        setAlertVisible(true);
    };

    const closeAlert = () => {
        setAlertVisible(false);
        setAlertMessage("");
    };

    const fetchProjects = async () => {
        try {
            const resp = await fetch(`${BACKEND_API_URL}projects/`);
            let data = {}

            try {
                log.info("Fetching projects response:", resp);
                data = await resp.json();
            } catch (e) {
                log.error("Failed to parse projects response", e);
            }

            if (!resp.ok) {
                log.error("Fetching projects failed", data);
                throw new Error(t("errors." + (data.error_type || "serverError")));
            }

            setProjects(data.projects || data);
        } catch (e) {
            log.error("fetchProjects error", e);
            showAlert("warning", e.message);
        }
    };

    const fetchRoles = async () => {
        try {
            const resp = await fetch(`${BACKEND_API_URL}roles/`);
            let data = {}

            try {
                log.info("Fetching roles response:", resp);
                data = await resp.json();
            } catch (e) {
                log.error("Failed to parse projects response", e);
            }

            if (!resp.ok) {
                log.error("Fetching roles failed", data);
                throw new Error(t("errors." + (data.error_type || "serverError")));
            }

            setRoles(data.roles || data);
        } catch (e) {
            log.error("fetchRoles error", e);
            showAlert("warning", e.message);
        }
    };

    const fetchSupervisorsForProjects = async (projIds) => {
        try {
            const supMap = new Map();

            await Promise.all(
                projIds.map(async (pid) => {
                    const resp = await fetch(`${BACKEND_API_URL}supervisor_project/?project_id=${pid}`);
                    const data = await resp.json();

                    if (!resp.ok) {
                        log.error("Fetching supervisors failed", data);
                        throw new Error(t("errors." + (data.error_type || "serverError")));
                    }

                    if (Array.isArray(data.supervisor_ids)) {
                        data.supervisor_ids.forEach((s) =>
                            supMap.set(s.id || s, s.name || s)
                        );
                    }
                })
            );

            const supArray = Array.from(supMap.entries()).map(([id, name]) => ({
                id,
                name,
            }));

            setSupervisors(supArray);
            setForm((prev) => ({
                ...prev,
                supervisors: prev.supervisors.filter((id) => supMap.has(id)),
            }));
        } catch (e) {
            log.error("fetchSupervisorsForProjects error", e);
        }
    };

    const pickImage = async (field) => {
        try {
            const result = await launchImageLibrary({
                mediaType: "photo",
                quality: 0.8,
            });
            if (result.didCancel) return;

            const asset = result.assets?.[0];
            if (!asset) return;

            setForm({ ...form, [field]: asset });
        } catch (e) {
            console.error(t("errors.imagePickError"), e);
            showAlert("error", t("errors.imagePickError"));
        }
    };

    const onRoleChange = async (id, name) => {
        const accountBased = ["guard", "supervisor"];
        const roleLower = (name || "").toLowerCase();

        let username = form.username;
        let password = form.password;

        if (!accountBased.includes(roleLower)) {
            setIsAccountEditable(false);
            username = "";
            password = "";
        } else {
            setIsAccountEditable(true);
        }

        setForm({
            ...form,
            roleId: id,
            roleName: name,
            username,
            password,
        });

        try {
            if (!id) return;
            const resp = await fetch(`${BACKEND_API_URL}role_details/?role_id=${id}`);
            const data = await resp.json();

            if (!resp.ok) {
                log.error("Fetching role details failed", data);
                throw new Error(t("errors." + (data.error_type || "serverError")));
            }

            const rd = data.role_details || data;

            setForm((prev) => ({
                ...prev,
                baseRate: rd.base_rate ?? 0,
                overtimeRate: rd.overtime_rate ?? 0,
                hoursStart: rd.hours_start ? new Date(`1970-01-01T${rd.hours_start}`) : prev.hoursStart,
                hoursEnd: rd.hours_end ? new Date(`1970-01-01T${rd.hours_end}`) : prev.hoursEnd,
            }));
        } catch (e) {
            log.error("onRoleChange error", e.message);
        }
    };

    const toggleProject = (id) => {
        const already = form.projects.includes(id);
        const updated = already
            ? form.projects.filter((x) => x !== id)
            : [...form.projects, id];

        setForm({ ...form, projects: updated });
    };

    const toggleSupervisor = (id) => {
        const already = form.supervisors.includes(id);
        const updated = already
            ? form.supervisors.filter((x) => x !== id)
            : [...form.supervisors, id];

        setForm({ ...form, supervisors: updated });
    };

    const submit = async () => {
        if (form.projects.length === 0) {
            showAlert("error", t("errors.selectAtLeastOneProject"));
            return;
        }

        const body = new FormData();
        const append = (key, value) => body.append(key, value);

        const simpleFields = {
            "national_id_number": form.nationalIdNumber,
            "national_id_serial": form.nationalIdSerial,
            "name": form.name,
            "gender": form.gender,
            "contact": form.contact,
            "email": form.email,
            "role": form.roleId,
            "username": form.username,
            "password": form.password,
            "base_rate": form.baseRate,
            "overtime_rate": form.overtimeRate,
            "is_whitelisted": true,
        };

        Object.entries(simpleFields).forEach(([key, value]) => append(key, value));

        append("date_of_birth", form.dateOfBirth.toISOString().split("T")[0]);
        append("hours_start", form.hoursStart.toTimeString().slice(0, 5));
        append("hours_end", form.hoursEnd.toTimeString().slice(0, 5));

        append("projects", JSON.stringify(form.projects));
        append("supervisors", JSON.stringify(form.supervisors));

        if (form.photo?.uri) {
            const optimizedUri = await compressImageIfNeeded(form.photo.uri);
            const filename = optimizedUri.split("/").pop();
            const match = /\.(jpg|jpeg|png)$/i.exec(filename);
            const type = match ? `image/${match[1]}` : "image/jpeg";

            append("photo", {
                uri: optimizedUri,
                name: filename,
                type,
            });
        }

        if (form.idFront?.uri) {
            const optimizedUri = await compressImageIfNeeded(form.idFront.uri);
            const filename = optimizedUri.split("/").pop();
            const match = /\.(jpg|jpeg|png)$/i.exec(filename);
            const type = match ? `image/${match[1]}` : "image/jpeg";

            append("id_front", {
                uri: optimizedUri,
                name: filename,
                type,
            });
        }

        try {
            const resp = await fetch(`${BACKEND_API_URL}register_person/`, {
                method: "POST",
                body,
            });

            const ResponseText = await resp.text();
            let data = {};
            try {
                data = JSON.parse(ResponseText);
            } catch (e) {
                log.error("Failed to parse error response", e);
            }

            if (!resp.ok) {
                log.error("Register person failed", ResponseText);
                throw new Error(t("errors." + (data.error_type || "serverError")));
            }

            showAlert("success", t("ui.RegisteredSuccessfully"));
        } catch (e) {
            log.error("submit error", e);
            showAlert("error", e.message || t("errors.serverError"));
        }
    };

    const renderProjectItem = ({ item }) => {
        const selected = form.projects.includes(item.id);
        return (
            <TouchableOpacity
                style={[styles.selectButton, selected && styles.selectedButton]}
                onPress={() => toggleProject(item.id)}
            >
                <Text style={[styles.selectButtonText, selected && styles.selectedButtonText]}>
                    {item.name}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderSupervisorItem = ({ item }) => {
        const selected = form.supervisors.includes(item.id);
        return (
            <TouchableOpacity
                style={[styles.selectButton, selected && styles.selectedButton]}
                onPress={() => toggleSupervisor(item.id)}
            >
                <Text style={[styles.selectButtonText, selected && styles.selectedButtonText]}>
                    {item.name}
                </Text>
            </TouchableOpacity>
        );
    };

    useEffect(() => {
        fetchProjects();
        fetchRoles();
    }, []);

    useEffect(() => {
        if (form.projects.length === 0) {
            setSupervisors([]);
            setForm({ ...form, supervisors: [] });
            return;
        }
        fetchSupervisorsForProjects(form.projects);
    }, [form.projects]);


    return (
        <ScrollView contentContainerStyle={styles.container}>
            <CustomAlert
                visible={alertVisible}
                type={alertType}
                message={alertMessage}
                onClose={closeAlert}
            />
            <Text style={styles.title}>{t("ui.registerWorker")}</Text>

            <View style={styles.row}>
                <View style={styles.col}>
                    <Text style={styles.label}>{t("ui.nationalIdNumber")}</Text>
                    <TextInput
                        value={form.nationalIdNumber}
                        onChangeText={(v) => setForm({ ...form, nationalIdNumber: v })}
                        style={styles.input}
                    />
                </View>

                <View style={styles.col}>
                    <Text style={styles.label}>{t("ui.nationalIdSerial")}</Text>
                    <TextInput
                        value={form.nationalIdSerial}
                        onChangeText={(v) => setForm({ ...form, nationalIdSerial: v })}
                        style={styles.input}
                    />
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.col}>
                    <Text style={styles.label}>{t("ui.name")}</Text>
                    <TextInput
                        value={form.name}
                        onChangeText={(v) => setForm({ ...form, name: v })}
                        style={styles.input}
                    />
                </View>

                <View style={styles.col}>
                    <Text style={styles.label}>{t("ui.gender")}</Text>
                    <View style={styles.genderSelectionContainer}>
                        <TouchableOpacity
                            style={[
                                styles.genderButton,
                                form.gender === "male" && styles.genderButtonSelected,
                            ]}
                            onPress={() => setForm({ ...form, gender: "male" })}
                        >
                            <Text
                                style={
                                    form.gender === "male"
                                        ? styles.genderTextSelected
                                        : styles.genderText
                                }
                            >
                                {t("ui.genderMale")}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.genderButton,
                                form.gender === "female" && styles.genderButtonSelected,
                            ]}
                            onPress={() => setForm({ ...form, gender: "female" })}
                        >
                            <Text
                                style={
                                    form.gender === "female"
                                        ? styles.genderTextSelected
                                        : styles.genderText
                                }
                            >
                                {t("ui.genderFemale")}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.col}>
                    <Text style={styles.label}>{t("ui.dateOfBirth")}</Text>

                    <TouchableOpacity
                        onPress={() => setShowDOBPicker(true)}
                        style={styles.input}
                    >
                        <Text>{form.dateOfBirth.toISOString().split("T")[0]}</Text>
                    </TouchableOpacity>

                    {showDOBPicker && (
                        <DateTimePicker
                            value={form.dateOfBirth}
                            mode="date"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={(_, d) => {
                                setShowDOBPicker(Platform.OS === "ios");
                                if (d) setForm({ ...form, dateOfBirth: d });
                            }}
                        />
                    )}
                </View>

                <View style={styles.col}>
                    <Text style={styles.label}>{t("ui.contact")}</Text>
                    <TextInput
                        value={form.contact}
                        onChangeText={(v) => setForm({ ...form, contact: v })}
                        keyboardType="phone-pad"
                        style={styles.input}
                    />
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.col}>
                    <Text style={styles.label}>{t("ui.email")}</Text>
                    <TextInput
                        value={form.email}
                        onChangeText={(v) => setForm({ ...form, email: v })}
                        keyboardType="email-address"
                        style={styles.input}
                    />
                </View>

                <View style={styles.col}>
                    <Text style={styles.label}>{t("ui.role")}</Text>

                    <View style={styles.pickerContainer}>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={roles}
                            keyExtractor={(r) => String(r.id)}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.roleButton,
                                        form.roleId === item.id && styles.roleButtonSelected,
                                    ]}
                                    onPress={() => onRoleChange(item.id, item.name)}
                                >
                                    <Text
                                        style={
                                            form.roleId === item.id
                                                ? styles.roleTextSelected
                                                : styles.roleText
                                        }
                                    >
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.col}>
                    <Text style={styles.label}>{t("ui.username")}</Text>
                    <TextInput
                        value={form.username}
                        onChangeText={(v) => setForm({ ...form, username: v })}
                        style={styles.input}
                        editable={IsAccountEditable}
                        placeholder={IsAccountEditable ? "" : t("ui.accountNotRequired")}
                        placeholderTextColor="#888"
                    />
                </View>

                <View style={styles.col}>
                    <Text style={styles.label}>{t("ui.password")}</Text>
                    <TextInput
                        value={form.password}
                        onChangeText={(v) => setForm({ ...form, password: v })}
                        style={styles.input}
                        secureTextEntry
                        editable={IsAccountEditable}
                        placeholder={IsAccountEditable ? "" : t("ui.accountNotRequired")}
                        placeholderTextColor="#888"
                    />
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.col}>
                    <Text style={styles.label}>{t("ui.projects")}</Text>
                    <TouchableOpacity
                        style={styles.bigButton}
                        onPress={() => setProjectsModalVisible(true)}
                    >
                        <Text>{t("ui.selectProjects", { count: form.projects.length })}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.col}>
                    <Text style={styles.label}>{t("ui.supervisors")}</Text>
                    <TouchableOpacity
                        style={styles.bigButton}
                        onPress={() => setSupervisorsModalVisible(true)}
                    >
                        <Text>{t("ui.selectSupervisors", { count: form.supervisors.length })}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.col}>
                    <Text style={styles.label}>{t("ui.photo")}</Text>
                    <TouchableOpacity
                        style={styles.bigButton}
                        onPress={() => pickImage("photo")}
                    >
                        <Text>{t("ui.choosePhoto")}</Text>
                    </TouchableOpacity>
                    {form.photo && (
                        <Image source={{ uri: form.photo.uri }} style={styles.previewImage} />
                    )}
                </View>

                <View style={styles.col}>
                    <Text style={styles.label}>{t("ui.idCardFront")}</Text>
                    <TouchableOpacity
                        style={styles.bigButton}
                        onPress={() => pickImage("idFront")}
                    >
                        <Text>{t("ui.chooseIDFront")}</Text>
                    </TouchableOpacity>
                    {form.idFront && (
                        <Image source={{ uri: form.idFront.uri }} style={styles.previewImage} />
                    )}
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.col}>
                    <Text style={styles.label}>{t("ui.baseRate")}</Text>
                    <TextInput
                        value={String(form.baseRate)}
                        onChangeText={(v) =>
                            setForm({ ...form, baseRate: Number(v) || 0 })
                        }
                        keyboardType="numeric"
                        style={styles.input}
                    />
                </View>

                <View style={styles.col}>
                    <Text style={styles.label}>{t("ui.overtimeRate")}</Text>
                    <TextInput
                        value={String(form.overtimeRate)}
                        onChangeText={(v) =>
                            setForm({ ...form, overtimeRate: Number(v) || 0 })
                        }
                        keyboardType="numeric"
                        style={styles.input}
                    />
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.col}>
                    <Text style={styles.label}>{t("ui.hoursStart")}</Text>
                    <TouchableOpacity
                        style={styles.input}
                        onPress={() => setShowStartPicker(true)}
                    >
                        <Text>{form.hoursStart.toTimeString().slice(0, 5)}</Text>
                    </TouchableOpacity>

                    {showStartPicker && (
                        <DateTimePicker
                            value={form.hoursStart}
                            mode="time"
                            is24Hour
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={(_, d) => {
                                setShowStartPicker(Platform.OS === "ios");
                                if (d) setForm({ ...form, hoursStart: d });
                            }}
                        />
                    )}
                </View>

                <View style={styles.col}>
                    <Text style={styles.label}>{t("ui.hoursEnd")}</Text>
                    <TouchableOpacity
                        style={styles.input}
                        onPress={() => setShowEndPicker(true)}
                    >
                        <Text>{form.hoursEnd.toTimeString().slice(0, 5)}</Text>
                    </TouchableOpacity>

                    {showEndPicker && (
                        <DateTimePicker
                            value={form.hoursEnd}
                            mode="time"
                            is24Hour
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={(_, d) => {
                                setShowEndPicker(Platform.OS === "ios");
                                if (d) setForm({ ...form, hoursEnd: d });
                            }}
                        />
                    )}
                </View>
            </View>

            <View style={styles.submitRow}>
                <Button title={t("ui.register")} onPress={submit} />
            </View>

            <Modal
                visible={projectsModalVisible}
                animationType="slide"
                onRequestClose={() => setProjectsModalVisible(false)}
            >
                <View style={styles.modalInner}>
                    <Text style={styles.modalTitle}>{t("ui.selectProjectsModalTitle")}</Text>

                    <FlatList
                        data={projects}
                        keyExtractor={(p) => String(p.id)}
                        renderItem={renderProjectItem}
                    />

                    <View style={styles.modalActions}>
                        <Button
                            title={t("ui.done")}
                            onPress={() => setProjectsModalVisible(false)}
                        />
                    </View>
                </View>
            </Modal>

            <Modal
                visible={supervisorsModalVisible}
                animationType="slide"
                onRequestClose={() => setSupervisorsModalVisible(false)}
            >
                <View style={styles.modalInner}>
                    <Text style={styles.modalTitle}>{t("ui.selectSupervisorsModalTitle")}</Text>

                    {supervisors.length === 0 ? (
                        <Text style={styles.hint}>
                            {t("ui.noSupervisorsAvailable")}
                        </Text>
                    ) : (
                        <FlatList
                            data={supervisors}
                            keyExtractor={(s) => String(s.id)}
                            renderItem={renderSupervisorItem}
                        />
                    )}

                    <View style={styles.modalActions}>
                        <Button
                            title={t("ui.done")}
                            onPress={() => setSupervisorsModalVisible(false)}
                        />
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: "#fff",
        flexGrow: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 12,
        textAlign: "center",
    },
    row: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 12,
    },
    col: {
        flex: 1,
    },
    label: {
        marginBottom: 6,
        color: "#333",
        fontWeight: "600",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 10,
        borderRadius: 8,
        backgroundColor: "#fff",
    },
    pickerContainer: {
        minHeight: 40,
    },
    roleButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: "#f5f5f5",
        marginRight: 8,
        borderWidth: 1,
        borderColor: "transparent",
    },
    roleButtonSelected: {
        backgroundColor: "#357ABD",
        borderColor: "#357ABD",
    },
    roleText: {
        color: "#222",
    },
    roleTextSelected: {
        color: "#fff",
    },
    bigButton: {
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        backgroundColor: "#fff",
    },
    selectButton: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        marginBottom: 8,
        marginHorizontal: 8,
    },
    selectButtonText: {
        color: "#222",
    },
    selectedButton: {
        backgroundColor: "#4A90E2",
        borderColor: "#357ABD",
    },
    selectedButtonText: {
        color: "#fff",
    },
    previewImage: {
        width: 80,
        height: 80,
        marginTop: 8,
        borderRadius: 8,
    },
    submitRow: {
        marginTop: 16,
        marginBottom: 40,
    },
    modalInner: {
        flex: 1,
        padding: 16,
        backgroundColor: "#fff",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
    },
    modalActions: {
        paddingVertical: 12,
    },
    hint: {
        textAlign: "center",
        color: "#666",
        marginTop: 12,
    },
    genderSelectionContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 4,
        backgroundColor: "#fff",
    },
    genderButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },
    genderButtonSelected: {
        backgroundColor: "#4A90E2",
    },
    genderText: {
        color: "#222",
        fontWeight: "600",
    },
    genderTextSelected: {
        color: "#fff",
        fontWeight: "600",
    },
});

export default RegisterPersonScreen;