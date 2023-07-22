import express from "express";
import cors from "cors";
import { initializeDatabase } from "./utils/db";
import { initializeBucket } from "./utils/files";
import filesRouter from "./controllers/files";
import objectsRouter from "./controllers/objects";
import authRouter from "./controllers/auth";

const app = express();

async function establishConnections() {
  await initializeDatabase();
  await initializeBucket();
}
void establishConnections();

app.use(express.json());
app.use(cors());

app.use("/api/files", filesRouter);
app.use("/api/objects", objectsRouter);
app.use("/api/auth", authRouter);

export default app;
