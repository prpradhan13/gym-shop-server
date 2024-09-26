import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoute from "./routes/userRoute.js";
import cookieParser from "cookie-parser";
import dbConnect from "./database/db.js";
import categoryRoute from "./routes/categoryRoute.js";
import featuredCategoryRoute from "./routes/featuredCategoryRoute.js";
import productRoute from "./routes/productRoute.js";
import userAddressRoute from "./routes/userAddressRoute.js";
import cluster from "cluster";
import os from "os";

// cofig env variables
dotenv.config({ path: "./.env" });

const totalCPU = os.cpus().length;

if (cluster.isPrimary) {
  // Master process
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < totalCPU; i++) {
    cluster.fork();  // This will create a worker
  }
  /* 
   cluster.fork() is part of Node.js's Cluster module, which is used to take advantage of multi-core systems and create multiple instances (workers) of your application. Each worker runs independently and can handle incoming requests, which allows you to distribute the load across several processes.
  */

  // If a worker dies, fork a new one
  cluster.on("exit", (worker, code, signal) => {
    if (code !== 0 && signal === null) {
      console.log(
        `Worker ${worker.process.pid} exited with error code: ${code}`
      );
    } else if (signal) {
      console.log(
        `Worker ${worker.process.pid} was killed by signal: ${signal}`
      );
    } else {
      console.log(`Worker ${worker.process.pid} exited normally`);
    }

    cluster.fork();
  });
} else {
  // Worker process: Run the Express server
  const app = express();

    // Connect to MongoDB once in the master process
    dbConnect();


  // Middlewares
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  // Routes Declarations
  app.use("/api/v1/user", userRoute);
  app.use("/api/v1/category", categoryRoute);
  app.use("/api/v1/featuredCategory", featuredCategoryRoute);
  app.use("/api/v1/product", productRoute);
  app.use("/api/v1/userAddress", userAddressRoute);

  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} listening on port ${PORT}`);
  });

  // Graceful shutdown handling
  process.on("SIGINT", async () => {
    console.log(`Worker ${process.pid} shutting down`);
    await mongoose.disconnect();
    server.close(() => {
      process.exit(0);
    });
  });
}
