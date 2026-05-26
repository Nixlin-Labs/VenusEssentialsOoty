const { User } = require('../models');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt');
const { createOTP, verifyOTP: verifyOTPUtil } = require('../utils/otp');
const { sendOTPEmail, sendPasswordResetEmail } = require('../utils/email');
const response = require('../utils/response');

/**
 * POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return response.badRequest(res, 'An account with this email already exists');
    }

    // Create user
    const user = await User.create({ name, email, phone, password });

    // Generate OTP for verification
    const otp = createOTP();
    user.otp = otp;
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp.code, name);

    return response.created(res, {
      data: { email: user.email },
    }, 'Registration successful. Please verify your email with the OTP sent.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return response.unauthorized(res, 'Invalid email or password');
    }

    if (user.isBlocked) {
      return response.forbidden(res, 'Your account has been blocked. Please contact support.');
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return response.unauthorized(res, 'Invalid email or password');
    }

    // Check if verified
    if (!user.isVerified) {
      // Generate new OTP
      const otp = createOTP();
      user.otp = otp;
      await user.save();
      await sendOTPEmail(email, otp.code, user.name);

      return res.status(403).json({
        success: false,
        message: 'Email not verified. A new OTP has been sent.',
        code: 'EMAIL_NOT_VERIFIED',
        data: { email },
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user._id, user.role);

    // Store refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'],
    });

    // Limit stored refresh tokens to 5
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    user.lastLogin = new Date();
    await user.save();

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return response.success(res, {
      data: {
        user: user.toSafeJSON(),
        accessToken,
        refreshToken,
      },
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/verify-otp
 */
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return response.notFound(res, 'User');
    }

    const result = verifyOTPUtil(user.otp, otp);
    if (!result.valid) {
      user.otp.attempts = (user.otp.attempts || 0) + 1;
      await user.save();
      return response.badRequest(res, result.message);
    }

    // Mark as verified
    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user._id, user.role);

    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'],
    });
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return response.success(res, {
      data: {
        user: user.toSafeJSON(),
        accessToken,
        refreshToken,
      },
    }, 'Email verified successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/resend-otp
 */
exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return response.notFound(res, 'User');
    }

    if (user.isVerified) {
      return response.badRequest(res, 'Email is already verified');
    }

    const otp = createOTP();
    user.otp = otp;
    await user.save();

    await sendOTPEmail(email, otp.code, user.name);

    return response.success(res, {}, 'OTP sent successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return response.success(res, {}, 'If an account with this email exists, a reset code has been sent.');
    }

    const otp = createOTP();
    user.otp = otp;
    await user.save();

    await sendPasswordResetEmail(email, otp.code, user.name);

    return response.success(res, {}, 'If an account with this email exists, a reset code has been sent.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/reset-password
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return response.badRequest(res, 'Invalid request');
    }

    const result = verifyOTPUtil(user.otp, otp);
    if (!result.valid) {
      user.otp.attempts = (user.otp.attempts || 0) + 1;
      await user.save();
      return response.badRequest(res, result.message);
    }

    user.password = newPassword;
    user.otp = undefined;
    // Invalidate all refresh tokens
    user.refreshTokens = [];
    await user.save();

    return response.success(res, {}, 'Password reset successful. Please login with your new password.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh-token
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      return response.unauthorized(res, 'Refresh token required');
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      return response.unauthorized(res, 'Invalid refresh token');
    }

    // Find user with this refresh token
    const user = await User.findOne({
      _id: decoded.userId,
      'refreshTokens.token': token,
    });

    if (!user) {
      return response.unauthorized(res, 'Invalid refresh token');
    }

    // Remove old token
    user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== token);

    // Generate new pair
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user._id, user.role);

    user.refreshTokens.push({
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'],
    });
    await user.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return response.success(res, {
      data: { accessToken, refreshToken: newRefreshToken },
    }, 'Token refreshed');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 */
exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (token) {
      req.user.refreshTokens = req.user.refreshTokens.filter((rt) => rt.token !== token);
      await req.user.save();
    }

    res.clearCookie('refreshToken');

    return response.success(res, {}, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 */
exports.getProfile = async (req, res) => {
  return response.success(res, {
    data: { user: req.user.toSafeJSON() },
  });
};

/**
 * PUT /api/auth/profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    return response.success(res, {
      data: { user: user.toSafeJSON() },
    }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/change-password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return response.badRequest(res, 'Current password is incorrect');
    }

    user.password = newPassword;
    // Invalidate all refresh tokens except current
    user.refreshTokens = [];
    await user.save();

    return response.success(res, {}, 'Password changed successfully. Please login again.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/admin/login
 */
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return response.unauthorized(res, 'Invalid credentials');
    }

    const adminRoles = ['super_admin', 'manager', 'inventory_staff', 'content_manager'];
    if (!adminRoles.includes(user.role)) {
      return response.forbidden(res, 'Access denied. Admin privileges required.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return response.unauthorized(res, 'Invalid credentials');
    }

    if (user.isBlocked) {
      return response.forbidden(res, 'Your account has been blocked.');
    }

    const { accessToken, refreshToken } = generateTokenPair(user._id, user.role);

    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'],
    });
    user.lastLogin = new Date();
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return response.success(res, {
      data: {
        user: user.toSafeJSON(),
        accessToken,
        refreshToken,
      },
    }, 'Admin login successful');
  } catch (error) {
    next(error);
  }
};
