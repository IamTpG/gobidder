const express = require("express");
const cors = require("cors");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const prisma = require("./config/prisma");

require("dotenv").config();
require("./config/passport");

// Routes
const authRoutes = require("./routes/auth.route");
const productsRoutes = require("./routes/product.route");

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

app.use("/api/auth", authRoutes);
app.use("api/products", productsRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Server is running!");
});

const startServer = async () => {
  try {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Handel interrupt
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
