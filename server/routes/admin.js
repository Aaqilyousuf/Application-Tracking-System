const express = require("express");
const Application = require("../models/Application");
const JobRole = require("../models/JobRole");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     JobRole:
 *       type: object
 *       required:
 *         - title
 *         - location
 *         - experienceRequired
 *         - isTechnical
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the job role
 *         title:
 *           type: string
 *           description: The job title
 *         description:
 *           type: string
 *           description: Job description
 *         location:
 *           type: string
 *           description: Job location
 *         experienceRequired:
 *           type: string
 *           description: Experience requirements
 *         isTechnical:
 *           type: boolean
 *           description: Whether the role is technical
 *         department:
 *           type: string
 *           description: Department name
 */

/**
 * @swagger
 * /api/admin/job-roles:
 *   post:
 *     summary: Create a new job role
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - location
 *               - experienceRequired
 *               - isTechnical
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               experienceRequired:
 *                 type: string
 *               isTechnical:
 *                 type: boolean
 *               department:
 *                 type: string
 *     responses:
 *       201:
 *         description: Job role created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/job-roles",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const {
        title,
        description,
        location,
        experienceRequired,
        isTechnical,
        department,
      } = req.body;

      const jobRole = new JobRole({
        title,
        description,
        location,
        experienceRequired,
        isTechnical,
        department,
      });

      await jobRole.save();

      res.status(201).json({
        message: "Job role created successfully",
        jobRole,
      });
    } catch (error) {
      console.error("Create job role error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * @swagger
 * /api/admin/job-roles:
 *   get:
 *     summary: Get all job roles (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Job roles retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/job-roles",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const jobRoles = await JobRole.find().sort({ createdAt: -1 });
      res.json(jobRoles);
    } catch (error) {
      console.error("Get job roles error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * @swagger
 * /api/admin/job-roles/public:
 *   get:
 *     summary: Get all job roles (Public - for applicants)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Job roles retrieved successfully
 */
router.get("/job-roles/public", async (req, res) => {
  try {
    const jobRoles = await JobRole.find().sort({ createdAt: -1 });
    res.json(jobRoles);
  } catch (error) {
    console.error("Get public job roles error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /api/admin/non-technical-applications:
 *   get:
 *     summary: Get all non-technical applications
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Non-technical applications retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/non-technical-applications",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const applications = await Application.find({ isTechnical: false })
        .populate("applicantId", "name email")
        .sort({ createdAt: -1 });

      res.json(applications);
    } catch (error) {
      console.error("Get non-technical applications error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * @swagger
 * /api/admin/applications/{id}/update-status:
 *   patch:
 *     summary: Manually update application status (non-technical only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Applied, Reviewed, Interview, Offer, Rejected]
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.patch(
  "/applications/:id/update-status",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { status, comment } = req.body;
      const applicationId = req.params.id;

      const application = await Application.findById(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      if (application.isTechnical) {
        return res
          .status(400)
          .json({ message: "Cannot manually update technical applications" });
      }

      const oldStatus = application.status;
      application.status = status;

      // Add log entry
      application.logs.push({
        action: "Manual Status Update",
        oldStatus,
        newStatus: status,
        byRole: "admin",
        comment:
          comment || `Status manually changed from ${oldStatus} to ${status}`,
      });

      if (comment) {
        application.comments.push({
          text: comment,
          authorRole: "admin",
        });
      }

      await application.save();
      await application.populate("applicantId", "name email");

      res.json({
        message: "Application status updated successfully",
        application,
      });
    } catch (error) {
      console.error("Update application status error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * @swagger
 * /api/admin/dashboard-stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/dashboard-stats",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const totalApplications = await Application.countDocuments();
      const technicalApplications = await Application.countDocuments({
        isTechnical: true,
      });
      const nonTechnicalApplications = await Application.countDocuments({
        isTechnical: false,
      });

      const statusCounts = await Application.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const recentApplications = await Application.find()
        .populate("applicantId", "name email")
        .sort({ createdAt: -1 })
        .limit(5);

      res.json({
        totalApplications,
        technicalApplications,
        nonTechnicalApplications,
        statusCounts,
        recentApplications,
      });
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
