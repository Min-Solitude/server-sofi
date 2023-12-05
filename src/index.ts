import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";

import router from "./routers";
import mongoose from "mongoose";

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();

app.use(
  cors({
    credentials: true,
  })
);

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const server = http.createServer(app);

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sofi API",
      version: "1.0.0",
      description: "Sofi API Information",
      contact: {
        name: "Antonio",
        email: "",
      },
      servers: [
        {
          api: "http://localhost:8080",
        },
      ],
    },
  },
  apis: ["./src/routers/*.ts"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

server.listen(8080, () => {
  console.log("Server running on http://localhost:8080/api/");
});

const MONGO_URL = "mongodb://localhost:27017/sofi-server"; // DB URI

mongoose.Promise = Promise;
mongoose.connect(MONGO_URL);
mongoose.connection.on("error", (error: Error) => console.log(error));

app.use("/api/", router());
