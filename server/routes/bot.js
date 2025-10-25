const express = require("express");
const Application = require("../models/Application");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/bot/trigger:
 *   post:
 *     summary: Trigger bot automation for technical applications
 *     tags: [Bot]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bot automation triggered successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/trigger",
  authMiddleware,
  roleMiddleware(["bot"]),
  async (req, res) => {
    try {
      // Get all technical applications that are not in final states
      const technicalApplications = await Application.find({
        isTechnical: true,
        status: { $nin: ["Offer", "Rejected"] },
      }).populate("applicantId", "name email");

      const automationResults = [];

      for (const application of technicalApplications) {
        // Skip applications that are missing required fields
        if (!application.experience && application.experience !== 0) {
          console.warn(
            `Skipping application ${application._id} - missing experience field`
          );
          continue;
        }

        const oldStatus = application.status;
        let newStatus;
        let comment;

        // Define automation flow
        switch (oldStatus) {
          case "Applied":
            newStatus = "Reviewed";
            comment = "Application automatically reviewed by bot system";
            break;
          case "Reviewed":
            newStatus = "Interview";
            comment = "Interview scheduled automatically";
            break;
          case "Interview":
            //randomly decide between Offer and Rejected for demo purposes
            newStatus = Math.random() > 0.3 ? "Offer" : "Rejected";
            comment =
              newStatus === "Offer"
                ? "Interview passed - Offer extended automatically"
                : "Interview did not meet requirements";
            break;
          default:
            continue;
        }

        // Update application
        application.status = newStatus;

        // Add log entry
        application.logs.push({
          action: "Bot Automation",
          oldStatus,
          newStatus,
          byRole: "bot",
          comment,
        });

        // Add comment
        application.comments.push({
          text: comment,
          authorRole: "bot",
        });

        try {
          await application.save();
        } catch (saveError) {
          console.error(
            `Failed to save application ${application._id}:`,
            saveError.message
          );
          continue; // Skip this application and continue with others
        }

        automationResults.push({
          applicationId: application._id,
          applicantName: application.applicantId.name,
          jobRole: application.jobRole,
          oldStatus,
          newStatus,
          comment,
        });
      }

      res.json({
        message: "Bot automation completed",
        processedApplications: automationResults.length,
        results: automationResults,
      });
    } catch (error) {
      console.error("Bot automation error:", error);

      // Provide more specific error information
      if (error.name === "ValidationError") {
        return res.status(400).json({
          message: "Validation error in bot automation",
          details: error.message,
          errors: error.errors,
        });
      }

      res.status(500).json({
        message: "Server error during bot automation",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
);

/**
 * @swagger
 * /api/bot/technical-applications:
 *   get:
 *     summary: Get all technical applications
 *     tags: [Bot]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Technical applications retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/technical-applications",
  authMiddleware,
  roleMiddleware(["bot"]),
  async (req, res) => {
    try {
      const applications = await Application.find({ isTechnical: true })
        .populate("applicantId", "name email")
        .sort({ createdAt: -1 });

      res.json(applications);
    } catch (error) {
      console.error("Get technical applications error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * @swagger
 * /api/bot/logs:
 *   get:
 *     summary: Get bot activity logs
 *     tags: [Bot]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bot logs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/logs",
  authMiddleware,
  roleMiddleware(["bot"]),
  async (req, res) => {
    try {
      const applications = await Application.find({ isTechnical: true })
        .populate("applicantId", "name email")
        .sort({ "logs.timestamp": -1 });

      const botLogs = [];
      applications.forEach((app) => {
        app.logs.forEach((log) => {
          if (log.byRole === "bot") {
            botLogs.push({
              applicationId: app._id,
              applicantName: app.applicantId.name,
              jobRole: app.jobRole,
              ...log.toObject(),
            });
          }
        });
      });

      // Sort by timestamp descending
      botLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      res.json(botLogs);
    } catch (error) {
      console.error("Get bot logs error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
