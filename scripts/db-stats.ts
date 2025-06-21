import { getDatabase } from "@/lib/mongodb"

async function getDatabaseStats() {
  try {
    console.log("📊 Fetching database statistics...")

    const db = await getDatabase()

    // Get database stats
    const dbStats = await db.stats()

    // Get collection stats
    const collections = ["users", "scans", "sessions"]

    console.log("\n🗄️  Database Overview:")
    console.log(`Database Name: ${dbStats.db}`)
    console.log(`Total Collections: ${dbStats.collections}`)
    console.log(`Data Size: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`)
    console.log(`Storage Size: ${(dbStats.storageSize / 1024 / 1024).toFixed(2)} MB`)
    console.log(`Indexes: ${dbStats.indexes}`)
    console.log(`Index Size: ${(dbStats.indexSize / 1024 / 1024).toFixed(2)} MB`)

    console.log("\n📋 Collection Details:")

    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName)
        const count = await collection.countDocuments()
        const indexes = await collection.indexes()

        console.log(`\n${collectionName.toUpperCase()}:`)
        console.log(`  Documents: ${count}`)
        console.log(`  Indexes: ${indexes.length}`)

        if (count > 0) {
          const sample = await collection.findOne()
          console.log(`  Sample fields: ${Object.keys(sample || {}).join(", ")}`)
        }
      } catch (error) {
        console.log(`\n${collectionName.toUpperCase()}: Collection not found`)
      }
    }

    console.log("\n✅ Database statistics completed!")
    process.exit(0)
  } catch (error) {
    console.error("❌ Failed to get database stats:", error)
    process.exit(1)
  }
}

getDatabaseStats()
