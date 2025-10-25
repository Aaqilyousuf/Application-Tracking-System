const mongoose = require("mongoose");
const Application = require("../models/Application");
require("dotenv").config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ats",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const fixMissingExperience = async () => {
  try {
    console.log("Checking for applications with missing experience field...");

    // Find applications where experience is null, undefined, or missing
    const applicationsWithMissingExperience = await Application.find({
      $or: [
        { experience: { $exists: false } },
        { experience: null },
        { experience: undefined },
      ],
    });

    console.log(
      `Found ${applicationsWithMissingExperience.length} applications with missing experience field`
    );

    if (applicationsWithMissingExperience.length > 0) {
      console.log("Fixing applications by setting default experience to 0...");

      // Update all applications with missing experience to have experience: 0
      const result = await Application.updateMany(
        {
          $or: [
            { experience: { $exists: false } },
            { experience: null },
            { experience: undefined },
          ],
        },
        { $set: { experience: 0 } }
      );

      console.log(`Updated ${result.modifiedCount} applications`);
    } else {
      console.log("No applications with missing experience field found.");
    }

    // Verify the fix
    const remainingIssues = await Application.find({
      $or: [
        { experience: { $exists: false } },
        { experience: null },
        { experience: undefined },
      ],
    });

    if (remainingIssues.length === 0) {
      console.log("✅ All applications now have experience field!");
    } else {
      console.log(
        `❌ Still ${remainingIssues.length} applications with missing experience field`
      );
    }
  } catch (error) {
    console.error("Error fixing missing experience:", error);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run the script
connectDB().then(() => {
  fixMissingExperience();
});
