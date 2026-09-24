require("dotenv").config();
const mongoose = require("mongoose");

const testConnection = async () => {
  try {
    console.log("🔍 Testing MongoDB Atlas connection...");

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ Successfully connected to MongoDB Atlas!");
    console.log("📊 Database:", mongoose.connection.name);
    console.log("🌐 Host:", mongoose.connection.host);

    // List all collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      "📁 Collections:",
      collections.length > 0
        ? collections.map((c) => c.name)
        : "No collections yet"
    );

    await mongoose.connection.close();
    console.log("✅ Connection closed successfully");

    process.exit(0);
  } catch (error) {
    console.error("❌ Connection Error:", error.message);
    process.exit(1);
  }
};

testConnection();
