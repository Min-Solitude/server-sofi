import express from "express";

import { authentication, random } from "../helpers";
import { createUser, getUserByEmail } from "../db/user.db";

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.sendStatus(400);
    }

    const user = await getUserByEmail(email).select(
      "+authentication.salt +authentication.password"
    );

    if (!user) {
      return res.sendStatus(400);
    }

    const expectedHash = authentication(user.authentication.salt, password);

    if (user.authentication.password != expectedHash) {
      return res
        .status(403)
        .json({
          message: "Sai mật khẩu",
        })
        .end();
    }

    const salt = random();
    user.authentication.sessionToken = authentication(
      salt,
      user._id.toString()
    );

    await user.save();

    res.cookie("ANTONIO-AUTH", user.authentication.sessionToken, {
      domain: "localhost",
      path: "/",
    });

    return res
      .status(200)
      .json({
        id: user._id,
        email: user.email,
        username: user.username,
        message: "Đăng nhập thành công",
        accessToken: user.authentication.sessionToken,
      })
      .end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.sendStatus(400);
    }

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return res
        .status(400)
        .json({
          message: "Tài khoản đã tồn tại",
        })
        .end();
    }

    const salt = random();
    const user = await createUser({
      email,
      username,
      authentication: {
        salt,
        password: authentication(salt, password),
      },
    });

    return res
      .status(200)
      .json({
        email: user.email,
        username: user.username,
        message: "Đăng ký thành công",
      })
      .end();
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({
        message: "Đăng ký thất bại",
      })
      .end();
  }
};
