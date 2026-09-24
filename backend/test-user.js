require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");

const testUser = async () => {
  try {
    console.log("🔍 Testing User Model...");

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Delete test user if exists
    await User.deleteOne({ email: "test@test.com" });

    // Create test user
    const user = await User.create({
      name: "Test User",
      email: "test@test.com",
      password: "password123",
    });

    console.log("✅ User created successfully:", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // Test password comparison
    const userWithPassword = await User.findById(user._id).select("+password");
    const isMatch = await userWithPassword.comparePassword("password123");
    console.log("✅ Password comparison works:", isMatch);

    // Cleanup
    await User.deleteOne({ _id: user._id });
    console.log("✅ Test user deleted");

    await mongoose.connection.close();
    console.log("✅ Test completed successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
};

testUser();
