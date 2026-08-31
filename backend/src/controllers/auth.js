const bcrypt = require('bcryptjs');
const { z } = require('zod');

const { pool } = require('../config/db');
const { sendEmail } = require('../services/emailService');
const {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  verifyRefreshToken,
} = require('../utils/token');

const passwordSchema = z.string().min(8, 'Password must be at least 8 characters long').max(128);

const optionalText = (maxLength) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }, z.string().max(maxLength).optional());

const loginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: passwordSchema,
  role: z.enum(['seeker', 'provider']),
});

const registerSeekerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required'),
  email: z.string().email().trim().toLowerCase(),
  password: passwordSchema,
  headline: optionalText(160),
  bio: optionalText(2000),
  location: optionalText(120),
  phone: optionalText(40),
  linkedinUrl: optionalText(255),
  portfolioUrl: optionalText(255),
  yearsOfExperience: z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? value : numberValue;
  }, z.number().int().min(0).optional()),
  availability: z.enum(['immediate', '2weeks', '1month']).optional(),
});

const registerProviderSchema = z.object({
  companyName: z.string().trim().min(2, 'Company name is required'),
  email: z.string().email().trim().toLowerCase(),
  password: passwordSchema,
  industry: optionalText(120),
  companySize: optionalText(60),
  description: optionalText(2000),
  website: optionalText(255),
  location: optionalText(120),
  logoUrl: optionalText(255),
  foundedYear: z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? value : numberValue;
  }, z.number().int().min(1800).max(new Date().getFullYear()).optional()),
});

function createHttpError(statusCode, message, errors = null) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.errors = errors;
  return error;
}

function buildUserPayload(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    role: row.role,
    is_verified: row.is_verified,
    created_at: row.created_at,
    updated_at: row.updated_at,
    profile: row.profile || null,
  };
}

async function fetchAuthenticatedUser(client, userId, role) {
  if (role === 'seeker') {
    const result = await client.query(
      `SELECT
        u.id,
        u.email,
        u.role,
        u.is_verified,
        u.created_at,
        u.updated_at,
        js.full_name,
        js.headline,
        js.bio,
        js.location,
        js.phone,
        js.linkedin_url,
        js.portfolio_url,
        js.years_of_experience,
        js.availability,
        js.profile_photo_url
      FROM users u
      LEFT JOIN job_seekers js ON js.user_id = u.id
      WHERE u.id = $1 AND u.role = 'seeker'
      LIMIT 1`,
      [userId]
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return buildUserPayload({
      ...row,
      profile: {
        full_name: row.full_name,
        headline: row.headline,
        bio: row.bio,
        location: row.location,
        phone: row.phone,
        linkedin_url: row.linkedin_url,
        portfolio_url: row.portfolio_url,
        years_of_experience: row.years_of_experience,
        availability: row.availability,
        profile_photo_url: row.profile_photo_url,
      },
    });
  }

  const result = await client.query(
    `SELECT
      u.id,
      u.email,
      u.role,
      u.is_verified,
      u.created_at,
      u.updated_at,
      jp.company_name,
      jp.industry,
      jp.company_size,
      jp.description,
      jp.website,
      jp.location,
      jp.logo_url,
      jp.founded_year
    FROM users u
    LEFT JOIN job_providers jp ON jp.user_id = u.id
    WHERE u.id = $1 AND u.role = 'provider'
    LIMIT 1`,
    [userId]
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return buildUserPayload({
    ...row,
    profile: {
      company_name: row.company_name,
      industry: row.industry,
      company_size: row.company_size,
      description: row.description,
      website: row.website,
      location: row.location,
      logo_url: row.logo_url,
      founded_year: row.founded_year,
    },
  });
}

async function sendWelcomeEmailSafely(email, fullName, role) {
  try {
    const label = role === 'seeker' ? 'job seeker' : 'job provider';
    await sendEmail({
      to: email,
      subject: 'Welcome to the Job Portal',
      text: `Welcome ${fullName || 'there'}! Your ${label} account is ready.`,
      html: `<p>Welcome ${fullName || 'there'}!</p><p>Your ${label} account is ready.</p>`,
    });
  } catch (error) {
    console.error('Failed to send welcome email', error.message);
  }
}

async function createUserWithProfile(client, { role, email, password, profile }) {
  const passwordHash = await bcrypt.hash(password, 12);

  const userResult = await client.query(
    `INSERT INTO users (email, password_hash, role, is_verified)
     VALUES ($1, $2, $3, FALSE)
     RETURNING id, email, role, is_verified, created_at, updated_at`,
    [email, passwordHash, role]
  );

  const user = userResult.rows[0];

  if (role === 'seeker') {
    await client.query(
      `INSERT INTO job_seekers (
        user_id,
        full_name,
        headline,
        bio,
        location,
        phone,
        linkedin_url,
        portfolio_url,
        years_of_experience,
        availability
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        user.id,
        profile.fullName,
        profile.headline || null,
        profile.bio || null,
        profile.location || null,
        profile.phone || null,
        profile.linkedinUrl || null,
        profile.portfolioUrl || null,
        profile.yearsOfExperience ?? 0,
        profile.availability || 'immediate',
      ]
    );
  } else {
    await client.query(
      `INSERT INTO job_providers (
        user_id,
        company_name,
        industry,
        company_size,
        description,
        website,
        location,
        logo_url,
        founded_year
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        user.id,
        profile.companyName,
        profile.industry || null,
        profile.companySize || null,
        profile.description || null,
        profile.website || null,
        profile.location || null,
        profile.logoUrl || null,
        profile.foundedYear || null,
      ]
    );
  }

  const authPayload = await fetchAuthenticatedUser(client, user.id, role);
  return authPayload || buildUserPayload(user);
}

async function registerSeeker(req, res, next) {
  const client = await pool.connect();

  try {
    const existingUser = await client.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [req.body.email]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'An account with this email already exists',
        errors: null,
      });
    }

    await client.query('BEGIN');

    const user = await createUserWithProfile(client, {
      role: 'seeker',
      email: req.body.email,
      password: req.body.password,
      profile: req.body,
    });

    await client.query('COMMIT');

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    setRefreshTokenCookie(res, refreshToken);

    await sendWelcomeEmailSafely(user.email, user.profile?.full_name, 'seeker');

    return res.status(201).json({
      success: true,
      data: {
        user,
        access_token: accessToken,
        refresh_token: refreshToken,
      },
      message: 'Seeker account created successfully',
      errors: null,
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (_) {}
    return next(error);
  } finally {
    client.release();
  }
}

async function registerProvider(req, res, next) {
  const client = await pool.connect();

  try {
    const existingUser = await client.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [req.body.email]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'An account with this email already exists',
        errors: null,
      });
    }

    await client.query('BEGIN');

    const user = await createUserWithProfile(client, {
      role: 'provider',
      email: req.body.email,
      password: req.body.password,
      profile: req.body,
    });

    await client.query('COMMIT');

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    setRefreshTokenCookie(res, refreshToken);

    await sendWelcomeEmailSafely(user.email, user.profile?.company_name, 'provider');

    return res.status(201).json({
      success: true,
      data: {
        user,
        access_token: accessToken,
        refresh_token: refreshToken,
      },
      message: 'Provider account created successfully',
      errors: null,
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (_) {}
    return next(error);
  } finally {
    client.release();
  }
}

async function login(req, res, next) {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT id, email, password_hash, role, is_verified, created_at, updated_at
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [req.body.email]
    );

    const userRow = result.rows[0];

    if (!userRow) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid email or password',
        errors: null,
      });
    }

    const passwordMatches = await bcrypt.compare(req.body.password, userRow.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid email or password',
        errors: null,
      });
    }

    if (userRow.role !== req.body.role) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Please sign in with the correct role',
        errors: null,
      });
    }

    const authUser = await fetchAuthenticatedUser(client, userRow.id, userRow.role);
    const accessToken = generateAccessToken(authUser);
    const refreshToken = generateRefreshToken(authUser);

    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      data: {
        user: authUser,
        access_token: accessToken,
        refresh_token: refreshToken,
      },
      message: 'Login successful',
      errors: null,
    });
  } catch (error) {
    return next(error);
  } finally {
    client.release();
  }
}

async function logout(req, res) {
  clearRefreshTokenCookie(res);

  return res.status(200).json({
    success: true,
    data: null,
    message: 'Logged out successfully',
    errors: null,
  });
}

async function refreshToken(req, res, next) {
  const client = await pool.connect();

  try {
    const token =
      req.cookies?.refresh_token ||
      req.body?.refreshToken ||
      req.body?.refresh_token ||
      req.headers['x-refresh-token'];

    if (!token) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Refresh token is required',
        errors: null,
      });
    }

    const decoded = verifyRefreshToken(token);
    const user = await fetchAuthenticatedUser(client, decoded.id, decoded.role);

    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Refresh token is no longer valid',
        errors: null,
      });
    }

    const accessToken = generateAccessToken(user);
    const nextRefreshToken = generateRefreshToken(user);
    setRefreshTokenCookie(res, nextRefreshToken);

    return res.status(200).json({
      success: true,
      data: {
        user,
        access_token: accessToken,
        refresh_token: nextRefreshToken,
      },
      message: 'Token refreshed successfully',
      errors: null,
    });
  } catch (error) {
    return next(error);
  } finally {
    client.release();
  }
}

async function getMe(req, res, next) {
  const client = await pool.connect();

  try {
    const user = await fetchAuthenticatedUser(client, req.user.id, req.user.role);

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'User not found',
        errors: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: { user },
      message: 'User profile retrieved successfully',
      errors: null,
    });
  } catch (error) {
    return next(error);
  } finally {
    client.release();
  }
}

module.exports = {
  loginSchema,
  registerSeekerSchema,
  registerProviderSchema,
  registerSeeker,
  registerProvider,
  login,
  logout,
  refreshToken,
  getMe,
  createHttpError,
};