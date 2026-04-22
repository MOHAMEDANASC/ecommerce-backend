import express from "express";
import prisma from "./config/prisma";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import productAdminRoutes from "./routes/productadminRoutes";
import categoryAdminRoutes from "./routes/categoryadminRoutes";
import cartRoutes from "./routes/cartRoutes";
import orderRoutes from "./routes/orderRoutes";
import adminRoutes from "./routes/adminRoutes";
import productRoutes from "./routes/productRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import orderAdminRoutes from "./routes/orderadminRoutes";
import addressRoutes from "./routes/addressRoutes";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`REQUEST: ${req.method} ${req.url}`);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin/products", productAdminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin/categories", categoryAdminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", orderAdminRoutes);
app.use("/api/admin", adminRoutes);


app.use((err: any, req: any, res: any, next: any) => {
  console.error(" GLOBAL ERROR:", err);
  res.status(500).json({
    message: err.message || "Internal server error",
  });

});

app.get("/", (req, res) => {
  res.send("SERVER WORKING");
});


async function testDB() {
  try {
    const users = await prisma.user.findMany();
    console.log(" DB Connected. Users count:", users.length);
  } catch (error) {
    console.error(" DB ERROR:", error);
  }
}

testDB();

const PORT = 5050;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
setInterval(() => {}, 1000);

