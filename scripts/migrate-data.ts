import { getDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

async function migrateLocalStorageData() {
  try {
    console.log("🔄 Starting data migration from localStorage...")

    // This script helps migrate existing localStorage data to MongoDB
    // Run this in browser console first to export data:

    const exportScript = `
    // Run this in your browser console on the current app
    const users = JSON.parse(localStorage.getItem('mediscan_users_v2') || '[]');
    const scans = JSON.parse(localStorage.getItem('mediscan_scans_v2') || '[]');
    
    const exportData = {
      users: users,
      scans: scans,
      exportDate: new Date().toISOString()
    };
    
    console.log('Export this data:', JSON.stringify(exportData, null, 2));
    
    // Download as file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mediscan-export.json';
    a.click();
    `

    console.log("📋 To migrate existing data:")
    console.log("1. Open your current app in browser")
    console.log("2. Open browser console (F12)")
    console.log("3. Run this script:")
    console.log(exportScript)
    console.log("4. Save the exported JSON file")
    console.log("5. Place it in the project root as 'migration-data.json'")
    console.log("6. Run this script again")

    // Try to read migration data
    const fs = require("fs")
    const path = require("path")

    const migrationFile = path.join(process.cwd(), "migration-data.json")

    if (!fs.existsSync(migrationFile)) {
      console.log("⏳ No migration-data.json found. Follow steps above to export data first.")
      process.exit(0)
    }

    const migrationData = JSON.parse(fs.readFileSync(migrationFile, "utf8"))

    const db = await getDatabase()

    // Migrate users
    if (migrationData.users && migrationData.users.length > 0) {
      console.log(`👥 Migrating ${migrationData.users.length} users...`)

      const usersCollection = db.collection("users")

      for (const user of migrationData.users) {
        try {
          // Check if user already exists
          const existing = await usersCollection.findOne({ email: user.email })

          if (!existing) {
            // Hash a default password (users will need to reset)
            const defaultPassword = "TempPassword123!"
            const passwordHash = await bcrypt.hash(defaultPassword, 12)

            await usersCollection.insertOne({
              email: user.email,
              name: user.name,
              firstName: user.firstName,
              lastName: user.lastName,
              passwordHash,
              createdAt: new Date(user.createdAt),
              lastLogin: new Date(user.lastLogin),
              isActive: true,
            })

            console.log(`✅ Migrated user: ${user.email}`)
          } else {
            console.log(`⏭️  User already exists: ${user.email}`)
          }
        } catch (error) {
          console.error(`❌ Failed to migrate user ${user.email}:`, error)
        }
      }
    }

    // Migrate scans
    if (migrationData.scans && migrationData.scans.length > 0) {
      console.log(`🔬 Migrating ${migrationData.scans.length} scans...`)

      const scansCollection = db.collection("scans")
      const usersCollection = db.collection("users")

      for (const scan of migrationData.scans) {
        try {
          // Find the user by ID (might need to map old IDs to new ones)
          const user = await usersCollection.findOne({
            $or: [
              { email: scan.userId }, // If userId was email
              { _id: scan.userId }, // If userId was ObjectId
            ],
          })

          if (user) {
            await scansCollection.insertOne({
              userId: user._id.toString(),
              name: scan.name,
              type: scan.type,
              fileName: scan.fileName,
              fileSize: scan.fileSize,
              uploadDate: new Date(scan.uploadDate),
              status: scan.status,
              diagnosis: scan.diagnosis,
              confidence: scan.confidence,
              severity: scan.severity,
              findings: scan.findings,
              recommendations: scan.recommendations,
              prescription: scan.prescription,
              imageData: scan.imageData,
              thumbnailData: scan.thumbnailData,
            })

            console.log(`✅ Migrated scan: ${scan.name}`)
          } else {
            console.log(`⚠️  User not found for scan: ${scan.name}`)
          }
        } catch (error) {
          console.error(`❌ Failed to migrate scan ${scan.name}:`, error)
        }
      }
    }

    console.log("🎉 Data migration completed!")
    console.log("⚠️  Note: All migrated users have default password 'TempPassword123!'")
    console.log("📧 Users should reset their passwords on first login")

    process.exit(0)
  } catch (error) {
    console.error("❌ Migration failed:", error)
    process.exit(1)
  }
}

migrateLocalStorageData()
