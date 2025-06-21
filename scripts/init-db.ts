import { initializeDatabase, getDatabase } from "@/lib/mongodb"

async function initDatabase() {
  try {
    console.log("🚀 Initializing MongoDB database...")

    // Initialize database and create indexes
    await initializeDatabase()

    // Get database instance
    const db = await getDatabase()

    // Create collections if they don't exist
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    if (!collectionNames.includes("users")) {
      await db.createCollection("users")
      console.log("✅ Created 'users' collection")
    }

    if (!collectionNames.includes("scans")) {
      await db.createCollection("scans")
      console.log("✅ Created 'scans' collection")
    }

    if (!collectionNames.includes("sessions")) {
      await db.createCollection("sessions")
      console.log("✅ Created 'sessions' collection")
    }

    console.log("🎉 Database initialization completed!")
    console.log("📊 Database stats:")

    const stats = await db.stats()
    console.log(`- Database: ${stats.db}`)
    console.log(`- Collections: ${stats.collections}`)
    console.log(`- Data size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`)

    process.exit(0)
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
    process.exit(1)
  }
}

initDatabase()
