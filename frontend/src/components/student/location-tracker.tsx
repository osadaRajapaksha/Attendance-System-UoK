// React and core React hooks
import React, { useEffect, useState, type JSX } from "react";
// UI icons used by the component
import { MapPin, Send, AlertTriangle, CheckCircle } from "lucide-react";

// A simple structure representing a single geolocation reading
interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

// Structure of the object we store in the simulated DB (submittedData)
interface SubmittedRecord {
  userId: string;
  deviceId: string;
  location: LocationData;
  timestamp: string;
  isDuplicateDevice: boolean;
  userAgent: string;
  // Added device metadata
  deviceModel?: string; // 'mobile' | 'laptop'
  os?: string; // e.g., 'Windows', 'macOS', 'Android', 'iOS'
  screenArea?: number; // width * height
}

interface DeviceInfo {
  deviceModel: string;
  os: string;
  screenArea: number;
  width: number;
  height: number;
}

// Top-level helper so it can be used during initial state setup without
// causing a "cannot access before initialization" runtime error.
const detectDeviceInfo = (): DeviceInfo => {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isMobile = /Mobi|Android|iPhone|iPad|Mobile/i.test(ua);
  const deviceModel = isMobile ? 'mobile' : 'laptop';

  let os = 'Unknown';
  if (/Windows NT/i.test(ua)) os = 'Windows';
  else if (/Mac OS X/i.test(ua) || /Macintosh/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  const width = typeof screen !== 'undefined' ? (screen.width || 0) : 0;
  const height = typeof screen !== 'undefined' ? (screen.height || 0) : 0;
  const screenArea = width * height;

  return { deviceModel, os, screenArea, width, height };
};

// The LocationTracker component manages user/device state and shows
// a UI for submitting the current device location. It also keeps a
// simulated in-memory store of submitted records for demo purposes.
function LocationTracker(): JSX.Element {
  const [userId, setUserId] = useState<string>("");
  const [deviceId, setDeviceId] = useState<string>("");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [submittedData, setSubmittedData] = useState<SubmittedRecord[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState<boolean>(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => detectDeviceInfo());

  // State initialization:
  // - `userId` is provided by the user via an input.
  // - `deviceId` is a locally persisted identifier for this browser/device.
  // - `location` contains the last known geolocation.
  // - `status`, `loading`, `duplicateWarning` are UI states.

  // Generate persistent device ID and store it in localStorage.
  // This `useEffect` runs once on mount and ensures a stable device ID is
  // available across refreshes. This is a non-secure convenience ID used
  // for demo/demo-detection purposes only.
  useEffect(() => {
    let persistentDeviceId = localStorage.getItem("deviceId");

    if (!persistentDeviceId) {
      // Build a small fingerprint from user agent and screen properties.
      // This is moderately stable across loads on the same device.
      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width,
        screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        !!window.sessionStorage,
        !!window.localStorage,
      ].join("|");

      // Simple (non-cryptographic) hash of the fingerprint string.
      // It reduces the fingerprint to a numeric value suitable for an ID.
      let hash = 0;
      for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }

      // Create a readable ID combining the hash and a short timestamp
      // to minimize collisions in this demo.
      persistentDeviceId =
        "device_" + Math.abs(hash).toString(36) + "_" + Date.now().toString(36);
      localStorage.setItem("deviceId", persistentDeviceId);
    }

    setDeviceId(persistentDeviceId);
    // initialize device info and update on resize
    setDeviceInfo(detectDeviceInfo());

    const onResize = () => setDeviceInfo(detectDeviceInfo());
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // getCurrentLocation wraps the browser `navigator.geolocation` API with a
  // Promise so it can be used with async/await. It resolves with
  // a `LocationData` object or rejects with the geolocation error.
  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      // We intentionally pass success and error callbacks directly to the
      // underlying API so the Promise resolves or rejects accordingly.
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  };



  // Detects if the current `deviceId` has been used previously with a
  // different `userId` according to our `submittedData` history.
  // Returns `true` if we detect a different userId for the same device.
  const checkForDuplicateDevice = (newUserId: string): boolean => {
    // Check if this device has sent a different user ID before
    const previousUserIds = submittedData
      .filter((record) => record.deviceId === deviceId)
      .map((record) => record.userId);

    const uniqueUserIds = new Set(previousUserIds);

    if (uniqueUserIds.size > 0 && !uniqueUserIds.has(newUserId)) {
      return true; // Duplicate device with different user ID detected
    }

    return false;
  };

  // Main form submission handler:
  // Steps:
  // 1. Validate user input.
  // 2. Get the current geolocation.
  // 3. Check whether this device was previously used by a different user.
  // 4. Build a `SubmittedRecord` and simulate a network/database save.
  // 5. Update UI (status, spinner, warnings) and clear the form.
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    // Basic validation: require a non-empty userId
    if (!userId.trim()) {
      setStatus("Please enter a user ID");
      return;
    }

    setLoading(true);
    setStatus("Getting location...");
    setDuplicateWarning(false);

    try {
      const currentLocation = await getCurrentLocation();
      // Persist the location to the local `location` state for UI display
      setLocation(currentLocation);

      // Check if the device was previously used by a different user.
      // That result will be stored on the record as `isDuplicateDevice`.
      const isDuplicate = checkForDuplicateDevice(userId);

      // Build the record we would send to an API/database, including device info
      const deviceInfo = detectDeviceInfo();

      const dataToSend: SubmittedRecord = {
        userId: userId,
        deviceId: deviceId,
        location: currentLocation,
        timestamp: new Date().toISOString(),
        isDuplicateDevice: isDuplicate,
        userAgent: navigator.userAgent,
        deviceModel: deviceInfo.deviceModel,
        os: deviceInfo.os,
        screenArea: deviceInfo.screenArea,
      };

      // Try to send the payload to the backend; fall back to simulated local store
      const API_BASE = 'http://localhost:8081';
      const token = localStorage.getItem('token');

      try {
        const resp = await fetch(`${API_BASE}/api/location`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            userId: dataToSend.userId,
            deviceId: dataToSend.deviceId,
            latitude: dataToSend.location.latitude,
            longitude: dataToSend.location.longitude,
            accuracy: dataToSend.location.accuracy,
            deviceModel: dataToSend.deviceModel,
            os: dataToSend.os,
            screenArea: dataToSend.screenArea,
            timestamp: dataToSend.timestamp,
          }),
        });

        if (!resp.ok) {
          // Backend not available or returned error — append locally as fallback
          await new Promise((resolve) => setTimeout(resolve, 700));
          setSubmittedData((prev) => [...prev, dataToSend]);
        } else {
          // Optionally use backend response for confirmation — append anyway for UI
          setSubmittedData((prev) => [...prev, dataToSend]);
        }
      } catch (err) {
        // Network error — fall back to local simulated store
        await new Promise((resolve) => setTimeout(resolve, 700));
        setSubmittedData((prev) => [...prev, dataToSend]);
      }

      // Update UI status based on duplicate detection
      if (isDuplicate) {
        setDuplicateWarning(true);
        setStatus(
          "⚠️ Warning: This device has sent a different user ID before!"
        );
      } else {
        setStatus("✓ Location sent successfully!");
      }

      setUserId("");
    } catch (error: any) {
      setStatus("Error: " + (error?.message ?? String(error)));
    } finally {
      setLoading(false);
    }
  };

  // Page wrapper and spacing
  return (
    <div className="min-vh-100 bg-light py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8 mx-auto">
            <div className="card shadow-sm location-card">
              <div className="card-body">
                {/* Header with icon and title */}
                <div className="d-flex align-items-center gap-3 mb-3">
                  <MapPin className="text-primary" size={32} />
                  <h1 className="h4 fw-bold mb-0">Location Tracker</h1>
                </div>

                {/* Display the persistent device ID so the user can copy/see it */}
                <div className="bg-light rounded p-3 mb-3">
                  <p className="mb-0 small text-muted">
                    <strong>Device ID:</strong>{" "}
                    <span className="font-monospace small">{deviceId}</span>
                  </p>

                  <div className="mt-2 small device-info">
                    <div><strong>Device model:</strong> {deviceInfo.deviceModel}</div>
                    <div><strong>OS:</strong> {deviceInfo.os}</div>
                    <div>
                      <strong>Screen:</strong> {deviceInfo.width} × {deviceInfo.height} px ({deviceInfo.screenArea.toLocaleString()} px²)
                    </div>
                  </div>
                </div>

                {/* User ID form - collects ID and submits the current location */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">User ID</label>
                    <input
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="Enter your ID number"
                      className="form-control"
                    />
                  </div>

                  {/* Send button: shows a spinner while `loading` is true */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} className="me-2" />
                        Send Location
                      </>
                    )}
                  </button>
                </form>

                {/* Status alert: success, warning, or error based on state */}
                {status && (
                  <div
                    className={`mt-3 alert d-flex align-items-start gap-2 ${
                      duplicateWarning
                        ? "alert-warning"
                        : status.includes("Error")
                        ? "alert-danger"
                        : "alert-success"
                    }`}
                    role="alert"
                  >
                    {duplicateWarning ? (
                      <AlertTriangle
                        className="text-warning flex-shrink-0"
                        size={18}
                      />
                    ) : status.includes("Error") ? (
                      <AlertTriangle
                        className="text-danger flex-shrink-0"
                        size={18}
                      />
                    ) : (
                      <CheckCircle
                        className="text-success flex-shrink-0"
                        size={18}
                      />
                    )}
                    <div className="small mb-0">{status}</div>
                  </div>
                )}

                {/* Show last captured location if available */}
                {location && (
                  <div className="mt-3 alert alert-info">
                    <h6 className="mb-1">Last Location:</h6>
                    <p className="mb-0 small">
                      Latitude: {location.latitude.toFixed(6)}
                      <br />
                      Longitude: {location.longitude.toFixed(6)}
                      <br />
                      Accuracy: ±{location.accuracy.toFixed(0)}m
                      <br />
                      <strong className="mt-1 d-block">Device model:</strong> {deviceInfo.deviceModel}
                      <br />
                      <strong>OS:</strong> {deviceInfo.os}
                      <br />
                      <strong>Screen area:</strong> {deviceInfo.screenArea.toLocaleString()} px²
                    </p>
                  </div>
                )}

                {/* Simulated database list - shows previously submitted records */}
                {submittedData.length > 0 && (
                  <div className="mt-4">
                    <h6 className="mb-2">Simulated Database Records:</h6>
                    <ul className="list-group">
                      {submittedData.map((record, index) => (
                        <li
                          key={index}
                          className={`list-group-item ${
                            record.isDuplicateDevice
                              ? "list-group-item-warning"
                              : ""
                          }`}
                        >
                          <div className="d-flex justify-content-between">
                            <div className="small font-monospace text-truncate record-meta">
                              <strong>User:</strong> {record.userId} |{" "}
                              <strong>Device:</strong>{" "}
                              {record.deviceId.substring(0, 20)}...
                              {record.isDuplicateDevice && (
                                <span className="ms-2 text-warning fw-semibold">
                                  ⚠️ DUPLICATE DEVICE
                                </span>
                              )}
                            </div>
                            <div className="small text-muted">
                              {new Date(record.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocationTracker;
