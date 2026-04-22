import prisma from "./config/prisma";
import bcrypt from "bcrypt";
import readlineSync from "readline-sync";

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst();

    if (existingAdmin) {
      console.log(" Admin already exists. Delete it first if you want to recreate.");
      return;
    }

    // Get input
    const email = readlineSync.question("Enter admin email: ");

    const password = readlineSync.question("Enter admin password: ", {
      hideEchoBack: true, // ✅ hides input properly
    });

    // Validation (important)
    if (!email || !password) {
      console.log(" Email and password are required");
      return;
    }

    if (password.length < 6) {
      console.log(" Password must be at least 6 characters");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        name: "Super Admin",
        email: email.trim(),
        password: hashedPassword,
        role: "SUPER_ADMIN",
      },
    });

    console.log(" Admin created successfully:");
    console.log({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });

  } catch (error) {
    console.error(" Error creating admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();