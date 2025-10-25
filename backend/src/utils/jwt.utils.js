// import jwt from "jsonwebtoken";
// import { generateToken } from "./password.utils.js";

// export const generateJwtToken = (user) => {

//     // const accessToken = jwt.sign({userId: user.userId, role: user.role}, process.env.JWT_SECRET, {
//     //     expiresIn: "30m"
//     // });

//   const accessToken = jwt.sign(
//     {
//       userId: user._id || user.userId,
//       role: user.role,
//     },
//     process.env.JWT_SECRET,
//     { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "30d" }
//   );


//   const refreshToken = generateToken();
//   return { accessToken, refreshToken };
// };

// export const tokenExpiresAt = () => {
//   return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
// };

// export const setCookies = (res, accessToken, refreshToken) => {
//   const cookieOpts = {
//     httpOnly: true,
//     secure: true,          // Always true. You're on HTTPS on Render.
//     sameSite: "none",      // Critical for cross-site (localhost/vercel → onrender)
//     path: "/"
//   };

//   res.cookie("access_token", accessToken, {
//     ...cookieOpts,
//     maxAge: 15 * 60 * 1000 // 15 minutes
//   });

//   res.cookie("refresh_token", refreshToken, {
//     ...cookieOpts,
//     maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
//   });

//   // optional: clean legacy names
//   res.clearCookie("accessToken", { path: "/" });
//   res.clearCookie("jwtToken", { path: "/" });
// };

// export const clearCookies = (res) => {
//   res.clearCookie("accessToken", {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict",
//   });

//   res.clearCookie("refreshToken", {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict",
//   });
// };


import jwt from "jsonwebtoken";
import { generateToken } from "./password.utils.js";

export const generateJwtToken = (user) => {
  const accessToken = jwt.sign(
    { id: user._id || user.userId, role: user.role },   // use "id" for consistency
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "30d" } // 30 days for long sessions
  );
  const refreshToken = generateToken(); // persist this server-side if you validate it
  return { accessToken, refreshToken };
};

export const tokenExpiresAt = () =>
  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days for refresh token

const COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
};

export const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("access_token", accessToken, {
    ...COOKIE_OPTS,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
  res.cookie("refresh_token", refreshToken, {
    ...COOKIE_OPTS,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  // cleanup legacy names if they existed
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("jwtToken", { path: "/" });
};

export const clearCookies = (res) => {
  // mirror the exact names and options used when setting
  res.clearCookie("access_token", COOKIE_OPTS);
  res.clearCookie("refresh_token", COOKIE_OPTS);
};
