const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobRole",
      required: [true, "Please provide a job role"],
    },
    isTechnical: {
      type: Boolean,
      required: true,
      default: false,
    },
    experience: {
      type: Number,
      required: [true, "Please provide your experience in years"],
      min: [0, "Experience cannot be negative"],
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    additionalNotes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Applied", "Reviewed", "Interview", "Offer", "Rejected"],
      default: "Applied",
    },
    comments: [
      {
        text: {
          type: String,
          required: true,
        },
        authorRole: {
          type: String,
          enum: ["applicant", "admin", "bot"],
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    logs: [
      {
        action: {
          type: String,
          required: true,
        },
        oldStatus: {
          type: String,
        },
        newStatus: {
          type: String,
        },
        byRole: {
          type: String,
          enum: ["applicant", "admin", "bot"],
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        comment: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to ensure required fields are present
applicationSchema.pre("save", function (next) {
  // Ensure experience field exists and is a number
  if (this.experience === undefined || this.experience === null) {
    this.experience = 0;
  }

  // Ensure skills is an array
  if (!Array.isArray(this.skills)) {
    this.skills = [];
  }

  // Ensure additionalNotes is a string
  if (typeof this.additionalNotes !== "string") {
    this.additionalNotes = "";
  }

  next();
});

module.exports = mongoose.model("Application", applicationSchema);
