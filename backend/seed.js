const bcrypt = require("bcryptjs");
const pool = require("./config/db");
require("dotenv").config();

async function seed() {
  try {
    console.log("Seeding database...");

    const adminHash = await bcrypt.hash("admin123", 10);
    const securityHash = await bcrypt.hash("security123", 10);

    await pool.query(
      `INSERT INTO profiles (id, email, password_hash, role) VALUES
        ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@mits.ac.in', $1, 'admin'),
        ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'security@mits.ac.in', $2, 'security')
       ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role`,
      [adminHash, securityHash]
    );
    console.log("  Profiles seeded.");

    await pool.query(
      `INSERT INTO vehicles (plate, full_name, department, phone) VALUES
        ('KL07CD1234', 'Rajesh Kumar', 'Computer Science', '9876543210'),
        ('TN09AB5678', 'Priya Sharma', 'Electronics', '9123456789'),
        ('KL08EF9012', 'Mohammed Ali', 'Mechanical', '9988776655')
       ON CONFLICT (plate) DO UPDATE
       SET full_name = EXCLUDED.full_name, department = EXCLUDED.department, phone = EXCLUDED.phone`
    );
    console.log("  Vehicles seeded.");

    console.log("Seed complete.");
    console.log("  admin@mits.ac.in / admin123");
    console.log("  security@mits.ac.in / security123");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

seed();
