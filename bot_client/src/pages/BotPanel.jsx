import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

const BotPanel = () => {
  const [applications, setApplications] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [automationRunning, setAutomationRunning] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [applicationsRes, logsRes] = await Promise.all([
        api.get("/api/bot/technical-applications"),
        api.get("/api/bot/logs"),
      ]);
      setApplications(applicationsRes.data);
      setLogs(logsRes.data);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const triggerAutomation = async () => {
    setAutomationRunning(true);
    try {
      const response = await api.post("/api/bot/trigger");
      toast.success(
        `Automation completed! Processed ${response.data.processedApplications} applications`
      );
      fetchData(); // Refresh data
    } catch (error) {
      toast.error("Failed to trigger automation");
    } finally {
      setAutomationRunning(false);
    }
  };

  const toggleAutoMode = () => {
    if (autoMode) {
      // Stop auto mode
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      setAutoMode(false);
      toast.success("Auto mode disabled");
    } else {
      // Start auto mode (every 30 seconds)
      const id = setInterval(() => {
        triggerAutomation();
      }, 30000);
      setIntervalId(id);
      setAutoMode(true);
      toast.success("Auto mode enabled (30s intervals)");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Applied":
        return "bg-blue-100 text-blue-800";
      case "Reviewed":
        return "bg-yellow-100 text-yellow-800";
      case "Interview":
        return "bg-purple-100 text-purple-800";
      case "Offer":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Bot Automation Panel
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={toggleAutoMode}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  autoMode
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {autoMode ? "Stop Auto Mode" : "Start Auto Mode"}
              </button>
              <button
                onClick={triggerAutomation}
                disabled={automationRunning}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {automationRunning ? "Running..." : "Trigger Automation"}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Bot Status
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      autoMode ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></div>
                  <span className="ml-2 text-sm text-gray-600">
                    Auto Mode: {autoMode ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      automationRunning ? "bg-blue-500" : "bg-gray-400"
                    }`}
                  ></div>
                  <span className="ml-2 text-sm text-gray-600">
                    Automation: {automationRunning ? "Running" : "Idle"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Technical Applications */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Technical Applications ({applications.length})
                </h3>
                <div className="flow-root">
                  <ul className="-my-5 divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {applications.map((application) => (
                      <li key={application._id} className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {application.applicantId?.name?.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {application.applicantId?.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {application.applicantId?.email}
                            </p>
                            <p className="text-sm text-gray-500">
                              Job: {application.jobRole}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                application.status
                              )}`}
                            >
                              {application.status}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Bot Activity Logs */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Bot Activity Logs ({logs.length})
                </h3>
                <div className="flow-root">
                  <ul className="-my-5 divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {logs.map((log, index) => (
                      <li key={index} className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                              <svg
                                className="h-4 w-4 text-green-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {log.action}
                            </p>
                            <p className="text-sm text-gray-500">
                              {log.applicantName} - {log.jobRole}
                            </p>
                            {log.oldStatus && log.newStatus && (
                              <p className="text-sm text-gray-500">
                                {log.oldStatus} → {log.newStatus}
                              </p>
                            )}
                            {log.comment && (
                              <p className="text-sm text-gray-600 italic">
                                "{log.comment}"
                              </p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <p className="text-xs text-gray-400">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Automation Info */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Automation Workflow
            </h4>
            <div className="text-sm text-blue-800">
              <p className="mb-2">
                The bot automatically processes technical applications through
                the following workflow:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Applied</strong> → <strong>Reviewed</strong>:
                  Automatic review after application
                </li>
                <li>
                  <strong>Reviewed</strong> → <strong>Interview</strong>:
                  Schedule interview automatically
                </li>
                <li>
                  <strong>Interview</strong> → <strong>Offer/Rejected</strong>:
                  Random decision (70% offer, 30% reject)
                </li>
              </ul>
              <p className="mt-2 text-xs">
                Note: Each status change includes automated comments and
                timestamps.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotPanel;
