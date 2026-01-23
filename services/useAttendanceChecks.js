import useCheckInfo from "./UserContext";
import * as Location from "expo-location";
import log from "../components/Logger";
import DeviceInfo from "react-native-device-info";
import ImageResizer from "react-native-image-resizer";
import NetInfo from "@react-native-community/netinfo";

const useAttendanceAndChecks = () => {
  const { user, BACKEND_API_URLS } = useCheckInfo();
  const BACKEND_API_URL = BACKEND_API_URLS.backend1;

  const getAttendanceInfo = async () => {
    try {
      const timestamp = new Date().toISOString();

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        log.error("❌ Location permission denied");
        throw new Error("Location permission denied");
      }

      const locationPromise = Location.getCurrentPositionAsync({
        mayUseLastKnownLocation: true,
      });

      const manufacturerPromise = DeviceInfo.getManufacturer();

      const [{ coords }, manufacturer] = await Promise.all([
        locationPromise,
        manufacturerPromise,
      ]);

      const brand = DeviceInfo.getBrand();
      const model = DeviceInfo.getModel();

      log.info("📍 Location acquired:", coords);
      log.info("📱 Device info:", model, manufacturer, brand);

      return {
        timestamp,
        location: {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
        device: {
          model,
          brand,
          manufacturer,
        },
      };
    } catch (error) {
      log.error("❌ Failed to get attendance info:", error.message);
      return null;
    }
  };

  const compressImageIfNeeded = async (uri) => {
    try {
      const { type } = await NetInfo.fetch();
      const quality = type === "wifi" ? 80 : 50;

      const resized = await ImageResizer.createResizedImage(
        uri,
        800,
        800,
        "JPEG",
        quality,
      );

      log.info(
        `🗜️ Image compressed (${quality}% quality):`,
        resized.size
          ? `${(resized.size / 1024).toFixed(1)} KB`
          : "unknown size",
      );

      return resized.uri;
    } catch (err) {
      log.error(
        "⚠️ Image compression failed, using original file:",
        err.message,
      );
      return uri;
    }
  };

  const handleAttendance = async (id, type, action) => {
    try {
      const method = action === "delete" ? "DELETE" : "POST";
      const response = await fetch(`${BACKEND_API_URL}handle_attendance/`, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type }),
      });

      const jsonError = await response.json();

      if (!response.ok) {
        throw new Error(t("errors." + (jsonError.error_type || "serverError")));
      }

      return { success: true };
    } catch (error) {
      log.error(error);
      return { success: false };
    }
  };

  const sendAttendanceRequest = async (
    endpoint,
    faceData,
    isCheckIn,
    additionalFields = {},
  ) => {
    let attendance_id;
    let subject_name;

    try {
      log.info("🔄 Starting attendance submission...");
      const attendanceInfo = await getAttendanceInfo();
      if (!attendanceInfo) throw new Error("errors.TimeAndLocationError");

      const formData = new FormData();

      formData.append("attendance_monitor_id", user.id);
      formData.append("attendance_project_id", user.projectId);
      formData.append("attendance_timestamp", attendanceInfo.timestamp);
      formData.append(
        "attendance_location",
        JSON.stringify(attendanceInfo.location),
      );
      formData.append(
        "attendance_device_manufacturer",
        attendanceInfo.device.manufacturer || "",
      );
      formData.append(
        "attendance_device_brand",
        attendanceInfo.device.brand || "",
      );
      formData.append(
        "attendance_device_model",
        attendanceInfo.device.model || "",
      );
      formData.append("attendance_is_check_in", isCheckIn);
      formData.append(
        `attendance_is_supervisor_check_${isCheckIn ? "in" : "out"}`,
        user.role === "supervisor",
      );

      for (const key in additionalFields) {
        if (
          additionalFields[key] !== undefined &&
          additionalFields[key] !== null
        ) {
          formData.append(key, additionalFields[key]);
        }
      }

      if (faceData?.image) {
        log.info("🖼️ Attaching image file...");

        const optimizedUri = await compressImageIfNeeded(faceData.image);
        const filename = optimizedUri.split("/").pop();
        const match = /\.(jpg|jpeg|png)$/i.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("attendance_photo", {
          uri: optimizedUri,
          name: filename,
          type,
        });
      }

      log.info("🌐 Sending to endpoint:", `${BACKEND_API_URL}${endpoint}/`);

      const start = Date.now();
      const response = await fetch(`${BACKEND_API_URL}${endpoint}/`, {
        method: "POST",
        body: formData,
      });
      const duration = ((Date.now() - start) / 1000).toFixed(2);
      log.info(`⏱️ Upload completed in ${duration}s`);

      let json = {};
      try {
        json = response ? await response.json() : {};
      } catch (e) {
        json = { _raw: response };
      }

      log.info("📥 Server responded with:", json, "status:", response.status);
      attendance_id = json.attendance_id || null;
      subject_name = json?.subject_name || "Unkown Person";

      if (!response.ok) {
        log.error("❌ Server error response:", json.message || "Unknown error");
        throw new Error("errors." + (json.error_type || "serverError"));
      }

      log.info(`✅ Check-${isCheckIn ? "in" : "out"} success`);
      return {
        message: `ui.check${isCheckIn ? "in" : "out"}Confirmed`,
        subject_name: subject_name,
        attendance_id: attendance_id,
        success: true,
      };
    } catch (error) {
      log.error("🚨 Attendance error:", error.message);
      return {
        message: error.message,
        attendance_id: attendance_id,
        subject_name: subject_name,
        success: false,
      };
    }
  };

  const CheckInAttendance = (faceData) => {
    log.info("➡️ Check-In initiated...");
    return sendAttendanceRequest("attendance", faceData, true);
  };

  const CheckOutAttendance = (faceData) => {
    log.info("⬅️ Check-Out initiated...");
    return sendAttendanceRequest("attendance", faceData, false, {
      attendance_is_work_completed: faceData?.is_work_completed,
      attendance_is_incomplete_checkout: !faceData?.is_work_completed,
      attendance_equipment_returned: faceData?.is_equipment_returned,
    });
  };

  const SpecialReEntry = (faceData) => {
    log.info("🔁 Special Re-Entry initiated...");
    return sendAttendanceRequest("attendance", faceData, true, {
      attendance_is_special_re_entry: true,
      attendance_is_approved_by_supervisor: faceData?.is_approved_by_supervisor,
      attendance_subject_id: faceData?.subject_id,
    });
  };

  return {
    getAttendanceInfo,
    CheckInAttendance,
    CheckOutAttendance,
    SpecialReEntry,
    compressImageIfNeeded,
    handleAttendance,
  };
};

export default useAttendanceAndChecks;
