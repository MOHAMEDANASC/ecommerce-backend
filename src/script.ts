import prisma from "./config/prisma";
import bcrypt from "bcrypt";

async function createAdmin() {
  try {
    const existingAdmin = await prisma.admin.findFirst();

    if (existingAdmin) {
      console.log(" Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const admin = await prisma.admin.create({
      data: {
        name: "Super Admin",
        email: "admin@gmail.com",
        password: hashedPassword,
        role: "SUPER_ADMIN",
      },
    });

    console.log(" Admin created successfully:", admin);
  } catch (error) {
    console.error(" Error creating admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();