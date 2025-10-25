import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get("/applications");
      setApplications(response.data);
    } catch (error) {
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Applied: "#3B82F6",
      Reviewed: "#F59E0B",
      Interview: "#8B5CF6",
      Offer: "#10B981",
      Rejected: "#EF4444",
    };
    return colors[status] || "#6B7280";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              My Applications
            </h1>
            <p className="text-gray-600 mt-2">
              View and track your job applications. Apply for new positions from
              the{" "}
              <Link
                to="/dashboard"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Dashboard
              </Link>
              .
            </p>
          </div>

          {/* Applications List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Application History
              </h3>
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No applications
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by applying for a job.
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Browse Jobs
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {applications.map((app) => (
                    <div
                      key={app._id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                                {app.jobRole?.title ||
                                  "Job Title Not Available"}
                              </h4>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-1 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                  </svg>
                                  {app.jobRole?.location || "N/A"}
                                </div>
                                <div className="flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-1 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  Applied:{" "}
                                  {new Date(app.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-1 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  {app.isTechnical
                                    ? "Technical"
                                    : "Non-Technical"}
                                </div>
                              </div>
                            </div>
                            <span
                              className="px-3 py-1 rounded-full text-sm font-medium text-white"
                              style={{
                                backgroundColor: getStatusColor(app.status),
                              }}
                            >
                              {app.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Your Experience
                              </p>
                              <p className="text-sm text-gray-600">
                                {app.experience} years
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Experience Required
                              </p>
                              <p className="text-sm text-gray-600">
                                {app.jobRole?.experienceRequired || "N/A"}
                              </p>
                            </div>
                          </div>

                          {app.skills && app.skills.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Skills
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {app.skills.map((skill, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {app.additionalNotes && (
                            <div className="mb-4">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">
                                Additional Notes:
                              </h5>
                              <div className="bg-blue-50 p-3 rounded-md">
                                <p className="text-sm text-gray-800">
                                  {app.additionalNotes}
                                </p>
                              </div>
                            </div>
                          )}

                          {app.comments && app.comments.length > 0 && (
                            <div className="border-t pt-4">
                              <h5 className="text-sm font-medium text-gray-700 mb-3">
                                Comments & Updates:
                              </h5>
                              <div className="space-y-3">
                                {app.comments.map((comment, index) => (
                                  <div
                                    key={index}
                                    className="bg-gray-50 p-3 rounded-md border-l-4 border-blue-200"
                                  >
                                    <p className="text-sm text-gray-800 mb-2">
                                      {comment.text}
                                    </p>
                                    <div className="flex items-center text-xs text-gray-500">
                                      <svg
                                        className="w-3 h-3 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                      </svg>
                                      By {comment.authorRole} •{" "}
                                      {new Date(
                                        comment.timestamp
                                      ).toLocaleString()}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Applications;
