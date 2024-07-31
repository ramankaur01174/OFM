const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticated = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.redirect("/login");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.redirect("/login");
  }
};

exports.protect = async (req, res, next) => {
  let token;
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({
      status: "fail",
      message: "You are not logged in! Please log in to get access.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token does no longer exist.",
      });
    }

    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (err) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid token. Please log in again!",
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};

exports.checkUser = async (req, res, next) => {
  let token;
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      req.user = null;
      return next();
    }

    req.user = currentUser;
    res.locals.user = currentUser;
    return next();
  } catch (err) {
    req.user = null;
    return next();
  }
};
exports.isLoggedIn = (req, res, next) => {
  if (!req.cookies || !req.cookies.jwt) {
    return res.redirect("/login");
  }

  jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, async (err, decoded) => {
    if (err || !decoded) {
      return res.redirect("/login");
    }

    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.redirect("/login");
    }

    next();
  });
};
