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

      let base64Image = null;

      if (faceData?.image) {
        log.info("🖼️ Converting image to base64...");
        base64Image = await fetch(faceData?.image)
          .then((res) => res.blob())
          .then(
            (blob) =>
              new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(",")[1]);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              })
          );
      }

      const payload = {
        attendance_is_unauthorized: Boolean(faceData?.is_unauthorized),
        attendance_subject_id: faceData?.subject_id || null,
        attendance_monitor_id: user.id,
        attendance_timestamp: attendanceInfo.timestamp,
        attendance_location: attendanceInfo.location,
        attendance_is_check_in: isCheckIn,
        [`attendance_is_supervisor_check_${isCheckIn ? "in" : "out"}`]:
          user.role === "supervisor",
        attendance_photo: base64Image ? base64Image : null,
        ...additionalFields,
      };

      log.info("📤 Payload ready to send:", payload['attendance_subject_id']);
      log.info("🌐 Sending to endpoint:", `${BACKEND_API_URL}${endpoint}/`);

      const response = await fetch(`${BACKEND_API_URL}${endpoint}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      log.info("📥 Server responded with status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        log.error("❌ Server error response:", errorData);
        throw new Error("errors." + errorData.error_type);
      }

      log.info("✅ Check-in success");
      return "attendance.checkinSuccess";
    } catch (error) {
      log.error("🚨 Attendance error:", error.message);
      return error.message;
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
      attendance_is_entry_permitted: faceData?.is_entry_permitted,
      attendance_is_special_re_entry: true,
      attendance_is_unauthorized: !faceData?.is_entry_permitted,
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