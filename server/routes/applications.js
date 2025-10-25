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
 *     Application:
 *       type: object
 *       required:
 *         - applicantId
 *         - jobRole
 *         - isTechnical
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the application
 *         applicantId:
 *           type: string
 *           description: The ID of the applicant
 *         jobRole:
 *           type: string
 *           description: The job role applied for
 *         isTechnical:
 *           type: boolean
 *           description: Whether the role is technical
 *         experience:
 *           type: number
 *           description: Years of experience
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           description: List of skills
 *         additionalNotes:
 *           type: string
 *           description: Additional notes from applicant
 *         status:
 *           type: string
 *           enum: [Applied, Reviewed, Interview, Offer, Rejected]
 *           description: Current status of the application
 *         comments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               authorRole:
 *                 type: string
 *                 enum: [applicant, admin, bot]
 *               timestamp:
 *                 type: string
 *                 format: date
 *         logs:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *               oldStatus:
 *                 type: string
 *               newStatus:
 *                 type: string
 *               byRole:
 *                 type: string
 *                 enum: [applicant, admin, bot]
 *               timestamp:
 *                 type: string
 *                 format: date
 *               comment:
 *                 type: string
 */

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Create a new application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobRole
 *               - isTechnical
 *               - experience
 *             properties:
 *               jobRole:
 *                 type: string
 *               isTechnical:
 *                 type: boolean
 *               experience:
 *                 type: number
 *                 minimum: 0
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               additionalNotes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["applicant"]),
  async (req, res) => {
    try {
      const { jobRole, isTechnical, experience, skills, additionalNotes } =
        req.body;

      // Check if user has already applied for this job
      const existingApplication = await Application.findOne({
        applicantId: req.user.userId,
        jobRole: jobRole,
      });

      if (existingApplication) {
        return res.status(400).json({
          message: "You have already applied for this job position",
        });
      }

      const application = new Application({
        applicantId: req.user.userId,
        jobRole,
        isTechnical,
        experience,
        skills: skills || [],
        additionalNotes: additionalNotes || "",
        status: "Applied",
        logs: [
          {
            action: "Application Created",
            newStatus: "Applied",
            byRole: "applicant",
            comment: "Application submitted with detailed information",
          },
        ],
      });

      await application.save();
      await application.populate([
        { path: "applicantId", select: "name email" },
        {
          path: "jobRole",
          select: "title location experienceRequired department",
        },
      ]);

      res.status(201).json({
        message: "Application created successfully",
        application,
      });
    } catch (error) {
      console.error("Create application error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * @swagger
 * /api/applications:
 *   get:
 *     summary: Get user's applications
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["applicant"]),
  async (req, res) => {
    try {
      const applications = await Application.find({
        applicantId: req.user.userId,
      })
        .populate([
          { path: "applicantId", select: "name email" },
          {
            path: "jobRole",
            select: "title location experienceRequired department",
          },
        ])
        .sort({ createdAt: -1 });

      res.json(applications);
    } catch (error) {
      console.error("Get applications error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * @swagger
 * /api/applications/all:
 *   get:
 *     summary: Get all applications (Admin only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All applications retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/all",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const applications = await Application.find()
        .populate("applicantId", "name email")
        .sort({ createdAt: -1 });

      res.json(applications);
    } catch (error) {
      console.error("Get all applications error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * @swagger
 * /api/applications/{id}:
 *   patch:
 *     summary: Update application status
 *     tags: [Applications]
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
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Applied, Reviewed, Interview, Offer, Rejected]
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Application updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "bot"]),
  async (req, res) => {
    try {
      const { status, comment } = req.body;
      const applicationId = req.params.id;

      const application = await Application.findById(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      const oldStatus = application.status;
      application.status = status;

      // Add log entry
      application.logs.push({
        action: "Status Updated",
        oldStatus,
        newStatus: status,
        byRole: req.user.role,
        comment: comment || `Status changed from ${oldStatus} to ${status}`,
      });

      // Add comment if provided
      if (comment) {
        application.comments.push({
          text: comment,
          authorRole: req.user.role,
        });
      }

      await application.save();
      await application.populate("applicantId", "name email");

      res.json({
        message: "Application updated successfully",
        application,
      });
    } catch (error) {
      console.error("Update application error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
