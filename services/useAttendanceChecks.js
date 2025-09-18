import useCheckInfo from "./UserContext";
import * as Location from "expo-location";
import log from "./Logger";

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

      const { coords } = await Location.getCurrentPositionAsync({
        mayUseLastKnownLocation: true,
      });

      log.info("📍 Location acquired:", coords);

      return {
        timestamp,
        location: {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
      };
    } catch (error) {
      log.error("❌ Failed to get attendance info:", error.message);
      return null;
    }
  };

  const sendAttendanceRequest = async (
    endpoint,
    faceData,
    isCheckIn,
    additionalFields = {}
  ) => {
    try {
      log.info("🔄 Starting attendance submission...");
      const attendanceInfo = await getAttendanceInfo();
      if (!attendanceInfo) throw new Error("errors.TimeAndLocationError");

      const formData = new FormData();

      formData.append("attendance_monitor_id", user.id);
      formData.append("attendance_timestamp", attendanceInfo.timestamp);
      formData.append("attendance_location", JSON.stringify(attendanceInfo.location));
      formData.append("attendance_is_check_in", isCheckIn);
      formData.append(
        `attendance_is_supervisor_check_${isCheckIn ? "in" : "out"}`,
        user.role === "supervisor"
      );

      for (const key in additionalFields) {
        if (additionalFields[key] !== undefined && additionalFields[key] !== null) {
          formData.append(key, additionalFields[key]);
        }
      }

      if (faceData?.image) {
        log.info("🖼️ Attaching image file...");

        const localUri = faceData.image;

        const filename = localUri.split('/').pop();

        const match = /\.(jpg|jpeg|png)$/i.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        const fileToUpload = {
          uri: localUri,
          name: filename,
          type: type,
        };

        formData.append("attendance_photo", fileToUpload);
      }

      log.info("🌐 Sending to endpoint:", `${BACKEND_API_URL}${endpoint}/`);

      const response = await fetch(`${BACKEND_API_URL}${endpoint}/`, {
        method: "POST",
        body: formData,
      });

      const json = await response.json();

      log.info("📥 Server responded with:", json);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        log.error("❌ Server error response:", errorData);
        throw new Error("errors." + (errorData.error_type || "serverError"));
      }

      log.info(`✅ Check-${isCheckIn ? "in" : "out"} success`);
      return { message: `attendance.check${isCheckIn ? "in" : "out"}Success`, success: true };
    } catch (error) {
      log.error("🚨 Attendance error:", error.message);
      return { message: error.message, success: false };
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
    });
  };

  return {
    getAttendanceInfo,
    CheckInAttendance,
    CheckOutAttendance,
    SpecialReEntry,
  };
};

export default useAttendanceAndChecks;