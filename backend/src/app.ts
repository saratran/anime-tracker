import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { Server } from "http";
import { config } from "~/configs/config";
import { TryDBConnect } from "~/helpers/dbConnection";

const app: express.Application = express();
let server: Server;

const initServer = async () => {
  app.use(
    cors({
      origin: [config.CLIENT_ORIGIN], // allow to server to accept request from different origin
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      credentials: true, // allow session cookie from browser to pass through
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(async (req: Request, res: Response, next) => {
    await TryDBConnect(() => {
      res.json({
        error: "Database connection error, please try again later",
      });
    }, next);
  });

  // Health check route for AWS
  app.get("/health", (req, res) => {
    res.status(200).send("Server is running");
  });

  // Setting up routes
  // app.use("/", apiRoute);

  // Route for Twitter data

  // Catching errors
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(err);
    res.status(404).send({ error: err.name, message: err.message });
  });

  // Just checking if given PORT variable is an integer or not
  let port = parseInt(config.PORT || "");
  if (isNaN(port) || port === 0) {
    port = 8888;
  }

  server = app.listen(port, () => {
    console.log(`Server Started at: http://localhost:${port}`);
  });
};

initServer();
export { app, server };
