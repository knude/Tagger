import express from "express";
import cors from "cors";
import { initializeDatabase } from "./utils/db";
import filesRouter from "./controllers/files";

const app = express();

async function establishConnections() {
  await initializeDatabase();
}
void establishConnections();

app.use(express.json());
app.use(cors());

app.use("/api/files", filesRouter);

export default app;
