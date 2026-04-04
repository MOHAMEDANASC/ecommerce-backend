import express from "express";
import prisma from "./config/prisma";
import authRoutes from "./routes/auth.routes";
import testRoutes from "./routes/test.routes";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/order.routes";
import userRoutes from "./routes/user.routes";
import adminRoutes from "./routes/admin.routes";


const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", testRoutes);
app.use("/api/products", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order",orderRoutes);
app.use("/api/profile",userRoutes);
app.use("/api/admin", adminRoutes);


async function testDB() {
  const users = await prisma.user.findMany();
  console.log(users);
  
}

testDB();

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});