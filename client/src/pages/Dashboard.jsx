import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [jobRoles, setJobRoles] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState({});
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyFormData, setApplyFormData] = useState({
    experience: "",
    skills: "",
    additionalNotes: "",
  });

  // Helper function to get status colors for charts
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

  // Calculate summary statistics
  const getSummaryStats = () => {
    const totalApplications = applications.length;
    const offersReceived = applications.filter(
      (app) => app.status === "Offer"
    ).length;
    const pendingApplications = applications.filter((app) =>
      ["Applied", "Reviewed", "Interview"].includes(app.status)
    ).length;
    const rejectedApplications = applications.filter(
      (app) => app.status === "Rejected"
    ).length;

    return {
      totalApplications,
      offersReceived,
      pendingApplications,
      rejectedApplications,
    };
  };

  // Process data for charts
  const getChartData = () => {
    // Status distribution for pie chart
    const statusData = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    const pieChartData = Object.entries(statusData).map(([status, count]) => ({
      status,
      count,
      fill: getStatusColor(status),
    }));

    // Applications per job role for bar chart
    const jobRoleData = applications.reduce((acc, app) => {
      const jobTitle = app.jobRole?.title || "Unknown Job";
      acc[jobTitle] = (acc[jobTitle] || 0) + 1;
      return acc;
    }, {});

    const barChartData = Object.entries(jobRoleData).map(
      ([jobTitle, count]) => ({
        jobTitle:
          jobTitle.length > 15 ? jobTitle.substring(0, 15) + "..." : jobTitle,
        count,
      })
    );

    return { pieChartData, barChartData };
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      roles: ["applicant", "admin", "bot"],
    },
    { name: "My Applications", href: "/applications", roles: ["applicant"] },
    { name: "Admin Panel", href: "/admin", roles: ["admin"] },
    { name: "Bot Panel", href: "/bot", roles: ["bot"] },
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role)
  );

  // Fetch job roles and user applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch job roles (public endpoint)
        const jobRolesResponse = await api.get("/admin/job-roles/public");
        setJobRoles(jobRolesResponse.data);

        // Fetch user applications if user is an applicant
        if (user?.role === "applicant") {
          const applicationsResponse = await api.get("/applications");
          setApplications(applicationsResponse.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.role]);

  // Handle job application - open modal
  const handleApply = (jobRole) => {
    setSelectedJob(jobRole);
    setApplyFormData({
      experience: "",
      skills: "",
      additionalNotes: "",
    });
    setShowApplyModal(true);
  };

  // Handle form submission
  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    try {
      setApplying({ ...applying, [selectedJob._id]: true });

      const skillsArray = applyFormData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);

      await api.post("/applications", {
        jobRole: selectedJob._id,
        isTechnical: selectedJob.isTechnical,
        experience: parseInt(applyFormData.experience),
        skills: skillsArray,
        additionalNotes: applyFormData.additionalNotes,
      });

      // Refresh applications to update the UI
      const applicationsResponse = await api.get("/applications");
      setApplications(applicationsResponse.data);

      setShowApplyModal(false);
      setSelectedJob(null);
      setApplyFormData({
        experience: "",
        skills: "",
        additionalNotes: "",
      });

      alert("Application submitted successfully!");
    } catch (error) {
      console.error("Error applying for job:", error);
      if (error.response?.status === 400) {
        alert(
          error.response.data.message ||
            "You have already applied for this job position."
        );
      } else {
        alert("Failed to submit application. Please try again.");
      }
    } finally {
      setApplying({ ...applying, [selectedJob._id]: false });
    }
  };

  // Close modal
  const closeApplyModal = () => {
    setShowApplyModal(false);
    setSelectedJob(null);
    setApplyFormData({
      experience: "",
      skills: "",
      additionalNotes: "",
    });
  };

  // Check if user has already applied for a job
  const hasApplied = (jobRoleId) => {
    return applications.some((app) => app.jobRole === jobRoleId);
  };

  // Get application status for a job
  const getApplicationStatus = (jobRoleId) => {
    const application = applications.find((app) => app.jobRole === jobRoleId);
    return application ? application.status : null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">ATS</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {filteredNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      location.pathname === item.href
                        ? "border-primary-500 text-primary-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.name} ({user?.role})
              </span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Dashboard Overview
            </h2>
            <p className="text-lg text-gray-600">
              Application Tracking System -{" "}
              {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)} Portal
            </p>
          </div>

          {/* Summary Cards - Only show for applicants */}
          {user?.role === "applicant" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {(() => {
                const stats = getSummaryStats();
                return [
                  {
                    title: "Total Applications",
                    value: stats.totalApplications,
                    icon: "📊",
                    color: "bg-blue-500",
                    textColor: "text-blue-600",
                  },
                  {
                    title: "Offers Received",
                    value: stats.offersReceived,
                    icon: "🎉",
                    color: "bg-green-500",
                    textColor: "text-green-600",
                  },
                  {
                    title: "Pending Applications",
                    value: stats.pendingApplications,
                    icon: "⏳",
                    color: "bg-yellow-500",
                    textColor: "text-yellow-600",
                  },
                  {
                    title: "Rejected Applications",
                    value: stats.rejectedApplications,
                    icon: "❌",
                    color: "bg-red-500",
                    textColor: "text-red-600",
                  },
                ].map((card, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
                  >
                    <div className="flex items-center">
                      <div
                        className={`p-3 rounded-full ${card.color} text-white text-xl`}
                      >
                        {card.icon}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          {card.title}
                        </p>
                        <p className={`text-2xl font-bold ${card.textColor}`}>
                          {card.value}
                        </p>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}

          {/* Charts Section - Only show for applicants */}
          {user?.role === "applicant" && applications.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {(() => {
                const { pieChartData, barChartData } = getChartData();
                return (
                  <>
                    {/* Status Distribution Pie Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Application Status Distribution
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ status, count }) => `${status}: ${count}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Applications per Job Role Bar Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Applications by Job Role
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="jobTitle"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3B82F6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Quick Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.name}
                </h3>
                <p className="text-gray-600">
                  {item.name === "Dashboard" &&
                    "Overview and quick access to all features"}
                  {item.name === "My Applications" &&
                    "View and manage your job applications"}
                  {item.name === "Admin Panel" &&
                    "Manage applications and job postings"}
                  {item.name === "Bot Panel" &&
                    "Automate technical application processing"}
                </p>
              </Link>
            ))}
          </div>

          {/* Job Openings Section - Only show for applicants */}
          {user?.role === "applicant" && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Available Job Openings
                </h3>
                <p className="text-gray-600 mt-1">
                  Browse and apply for available positions
                </p>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 mt-2">
                      Loading job openings...
                    </p>
                  </div>
                ) : jobRoles.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      No job openings available at the moment.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobRoles.map((job) => (
                      <div
                        key={job._id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="mb-4">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {job.title}
                          </h4>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <svg
                                className="w-4 h-4 mr-2 text-gray-400"
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
                              {job.location}
                            </div>
                            <div className="flex items-center">
                              <svg
                                className="w-4 h-4 mr-2 text-gray-400"
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
                              {job.experienceRequired}
                            </div>
                            <div className="flex items-center">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  job.isTechnical
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {job.isTechnical
                                  ? "Technical"
                                  : "Non-Technical"}
                              </span>
                            </div>
                            {job.department && (
                              <div className="flex items-center">
                                <svg
                                  className="w-4 h-4 mr-2 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                  />
                                </svg>
                                {job.department}
                              </div>
                            )}
                          </div>
                        </div>

                        {job.description && (
                          <p
                            className="text-sm text-gray-600 mb-4 overflow-hidden"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {job.description}
                          </p>
                        )}

                        <div className="mt-4">
                          {hasApplied(job._id) ? (
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-green-600">
                                Applied - {getApplicationStatus(job._id)}
                              </span>
                              <Link
                                to="/applications"
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                              >
                                View Application
                              </Link>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleApply(job)}
                              disabled={applying[job._id]}
                              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                            >
                              {applying[job._id] ? (
                                <span className="flex items-center justify-center">
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Applying...
                                </span>
                              ) : (
                                "Apply Now"
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Application Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Apply for {selectedJob.title}
                </h3>
                <button
                  onClick={closeApplyModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>Location:</strong> {selectedJob.location}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Experience Required:</strong>{" "}
                  {selectedJob.experienceRequired}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Type:</strong>{" "}
                  {selectedJob.isTechnical ? "Technical" : "Non-Technical"}
                </p>
              </div>

              <form onSubmit={handleSubmitApplication}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={applyFormData.experience}
                    onChange={(e) =>
                      setApplyFormData({
                        ...applyFormData,
                        experience: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Enter years of experience"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills *
                  </label>
                  <input
                    type="text"
                    value={applyFormData.skills}
                    onChange={(e) =>
                      setApplyFormData({
                        ...applyFormData,
                        skills: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Enter skills separated by commas (e.g., React, Node.js, Python)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate multiple skills with commas
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={applyFormData.additionalNotes}
                    onChange={(e) =>
                      setApplyFormData({
                        ...applyFormData,
                        additionalNotes: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Any additional information you'd like to share..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeApplyModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applying[selectedJob._id]}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {applying[selectedJob._id] ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Applying...
                      </span>
                    ) : (
                      "Submit Application"
                    )}
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

export default Dashboard;
