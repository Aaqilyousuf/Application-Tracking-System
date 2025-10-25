import { useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

const ApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: "",
    comment: "",
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get("/api/admin/non-technical-applications");
      setApplications(response.data);
    } catch (error) {
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.patch(
        `/api/admin/applications/${selectedApplication._id}/update-status`,
        statusForm
      );
      toast.success("Application status updated successfully");
      setShowStatusModal(false);
      setSelectedApplication(null);
      setStatusForm({ status: "", comment: "" });
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const openStatusModal = (application) => {
    setSelectedApplication(application);
    setStatusForm({
      status: application.status,
      comment: "",
    });
    setShowStatusModal(true);
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Application Management
          </h1>
          <p className="text-gray-600 mb-6">
            Manage non-technical applications (technical applications are
            handled by the bot)
          </p>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {applications.map((application) => (
                <li key={application._id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-600">
                              {application.applicantId?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {application.applicantId?.email}
                            </p>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                application.status
                              )}`}
                            >
                              {application.status}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2">
                          <div className="text-sm text-gray-900">
                            <strong>Job Role:</strong> {application.jobRole}
                          </div>
                          <div className="text-sm text-gray-500">
                            <strong>Experience:</strong>{" "}
                            {application.experience} years
                          </div>
                          {application.skills &&
                            application.skills.length > 0 && (
                              <div className="text-sm text-gray-500">
                                <strong>Skills:</strong>{" "}
                                {application.skills.join(", ")}
                              </div>
                            )}
                          {application.additionalNotes && (
                            <div className="text-sm text-gray-500">
                              <strong>Notes:</strong>{" "}
                              {application.additionalNotes}
                            </div>
                          )}
                        </div>

                        {/* Comments */}
                        {application.comments &&
                          application.comments.length > 0 && (
                            <div className="mt-3">
                              <h4 className="text-sm font-medium text-gray-900">
                                Comments:
                              </h4>
                              <div className="mt-1 space-y-1">
                                {application.comments.map((comment, index) => (
                                  <div
                                    key={index}
                                    className="text-sm text-gray-600 bg-gray-50 p-2 rounded"
                                  >
                                    <span className="font-medium">
                                      {comment.authorRole}:
                                    </span>{" "}
                                    {comment.text}
                                    <span className="text-xs text-gray-400 ml-2">
                                      {new Date(
                                        comment.timestamp
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Logs */}
                        {application.logs && application.logs.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-gray-900">
                              Activity Log:
                            </h4>
                            <div className="mt-1 space-y-1">
                              {application.logs.map((log, index) => (
                                <div
                                  key={index}
                                  className="text-sm text-gray-600 bg-blue-50 p-2 rounded"
                                >
                                  <span className="font-medium">
                                    {log.action}
                                  </span>
                                  {log.oldStatus && log.newStatus && (
                                    <span>
                                      : {log.oldStatus} → {log.newStatus}
                                    </span>
                                  )}
                                  {log.comment && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {log.comment}
                                    </div>
                                  )}
                                  <span className="text-xs text-gray-400 ml-2">
                                    {new Date(
                                      log.timestamp
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="ml-4 flex-shrink-0">
                        <button
                          onClick={() => openStatusModal(application)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Update Status
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Update Application Status
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Applicant:</strong>{" "}
                  {selectedApplication.applicantId?.name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Current Status:</strong> {selectedApplication.status}
                </p>
              </div>

              <form onSubmit={handleStatusUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    New Status
                  </label>
                  <select
                    name="status"
                    value={statusForm.status}
                    onChange={(e) =>
                      setStatusForm({ ...statusForm, status: e.target.value })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="Applied">Applied</option>
                    <option value="Reviewed">Reviewed</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Comment (Optional)
                  </label>
                  <textarea
                    name="comment"
                    rows="3"
                    value={statusForm.comment}
                    onChange={(e) =>
                      setStatusForm({ ...statusForm, comment: e.target.value })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Add a comment about this status update..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowStatusModal(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
                  >
                    Update Status
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationManagement;
