const mongoose = require("mongoose");

const jobRoleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a job title"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Please provide a job location"],
      trim: true,
    },
    experienceRequired: {
      type: String,
      required: [true, "Please provide experience requirements"],
      trim: true,
    },
    isTechnical: {
      type: Boolean,
      required: true,
      default: false,
    },
    department: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("JobRole", jobRoleSchema);
