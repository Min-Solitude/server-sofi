import express from "express";
import authenticationRoute from "./authentication.route";
import usersRoute from "./users.route";

const router = express.Router();

export default (): express.Router => {
  authenticationRoute(router);
  usersRoute(router);

  return router;
};
