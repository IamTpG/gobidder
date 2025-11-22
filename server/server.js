const express = require("express");
const cors = require("cors");
const prisma = require("./config/prisma");
const passport = require("passport");
const cookieParser = require("cookie-parser");

require("dotenv").config();
require("./config/passport");

// Routes
const authRoutes = require("./routes/auth.route");
const productsRoutes = require("./routes/product.route");
const categoryRoutes = require("./routes/category.routes.js");
const userRoutes = require("./routes/user.routes.js");
const bidHistoryRoutes = require("./routes/bidHistory.route.js");
const biddingRoutes = require("./routes/bidding.route");
const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.FE_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bid-history", bidHistoryRoutes);
app.use("/api/", biddingRoutes);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    process.on("SIGINT", async () => {
      console.log("\nInterrupting Signal");
      server.close(async () => {
        try {
          await prisma.$disconnect();
          console.log("Prisma disconnected successfully.");
        } catch (disconnectError) {
          console.error("Error during Prisma disconnect:", disconnectError);
        }
        console.log("Server shut down");
        process.exit(0);
      });
    });
  } catch (err) {
    console.error("Failed to start server: ", err);
  }
};

startServer();
