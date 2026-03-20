const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const { User, ZONES } = require("./models/User");

const SEED_DATA = {
  admin: {
    name: "Super Admin",
    phone: "0000000000",
    password: "admin@samved",
    role: "admin",
    zone: null,
  },
  coordinators: [
    { name: "Coordinator Zone-A", phone: "1000000001", password: "coordA@samved", role: "zonal_coordinator", zone: "Zone A (North)" },
    { name: "Coordinator Zone-B", phone: "1000000002", password: "coordB@samved", role: "zonal_coordinator", zone: "Zone B (Central)" },
    { name: "Coordinator Zone-C", phone: "1000000003", password: "coordC@samved", role: "zonal_coordinator", zone: "Zone C (East)" },
    { name: "Coordinator Zone-D", phone: "1000000004", password: "coordD@samved", role: "zonal_coordinator", zone: "Zone D (South)" },
    { name: "Coordinator Zone-E", phone: "1000000005", password: "coordE@samved", role: "zonal_coordinator", zone: "Zone E (West)" },
    { name: "Coordinator Zone-F", phone: "1000000006", password: "coordF@samved", role: "zonal_coordinator", zone: "Zone F (Industrial)" },
  ],
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Wipe all admins and coordinators to ensure clean slate
    await User.deleteMany({ role: { $in: ["admin", "zonal_coordinator"] } });
    console.log("🗑️  Cleared existing admin and coordinator accounts\n");

    const allSeeds = [SEED_DATA.admin, ...SEED_DATA.coordinators];
    const created = [];

    for (const seed of allSeeds) {
      const hashed = await bcrypt.hash(seed.password, 10);
      const user = await User.create({
        id: uuidv4(),
        name: seed.name,
        phone: seed.phone,
        password: hashed,
        role: seed.role,
        zone: seed.zone,
      });
      created.push({ name: user.name, phone: seed.phone, password: seed.password, role: user.role, zone: user.zone });
    }

    console.log("🌱 Seeded Accounts:\n");
    console.table(created);

    console.log("\n✅ Seeding complete! Keep these credentials safe.");
    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
