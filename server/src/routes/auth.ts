import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../lib/jwt';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

/**
 * POST /api/auth/register
 * Creates a new user account with display name, email, and password.
 * NEVER requires real banking/salary/SSN info!
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { displayName, email, password } = parseResult.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({
        error: 'Email already exists',
        message: 'An account with this email address is already registered. Please log in.',
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and an unhardcoded clean starter game save in a transaction
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName,
        gameSaves: {
          create: {
            characterName: displayName,
            currentAge: 18,
            currentMonth: 1,
            currentStage: 'zero',
            totalMonthsSimulated: 0,
            balanceSheet: {
              cash: 0,
              emergencyFund: 0,
              assets: [],
              liabilities: [],
            },
            budget: {
              monthlyIncome: 0,
              needs: 0,
              wants: 0,
              savings: 0,
            },
            healthScore: {
              overallScore: 0,
              emergencyFundMonths: 0,
              debtToIncomeRatio: 0,
              savingsRate: 0,
            },
            gamification: {
              level: 1,
              experiencePoints: 0,
              unlockedBadges: [],
            },
          },
        },
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        createdAt: true,
      },
    });

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Store refresh token with 30-day expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    res.status(201).json({
      message: 'Account registered successfully',
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Unable to complete registration.' });
  }
});

/**
 * POST /api/auth/login
 * Verifies email & password, returning JWT access and refresh tokens.
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials', message: 'Incorrect email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials', message: 'Incorrect email or password.' });
      return;
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Unable to log in.' });
  }
});

/**
 * POST /api/auth/refresh
 * Exchanges a valid refresh token for a new access token.
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: 'Missing token', message: 'Refresh token is required.' });
      return;
    }

    const verified = verifyRefreshToken(refreshToken);
    if (!verified) {
      res.status(401).json({ error: 'Invalid token', message: 'Refresh token is invalid or expired.' });
      return;
    }

    const tokenDoc = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      if (tokenDoc) {
        await prisma.refreshToken.delete({ where: { id: tokenDoc.id } });
      }
      res.status(401).json({ error: 'Expired token', message: 'Refresh token has expired.' });
      return;
    }

    const newAccessToken = generateAccessToken({
      userId: tokenDoc.user.id,
      email: tokenDoc.user.email,
    });

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Unable to refresh token.' });
  }
});

/**
 * POST /api/auth/logout
 * Invalidates the provided refresh token.
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Unable to logout.' });
  }
});

/**
 * GET /api/auth/me
 * Returns current authenticated user and save summary.
 */
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        createdAt: true,
        gameSaves: {
          select: {
            id: true,
            characterName: true,
            currentAge: true,
            currentMonth: true,
            currentStage: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: 'desc' },
          take: 3,
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/auth/profile
 * Updates user display name
 */
router.put('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { displayName } = req.body;

    if (!displayName || typeof displayName !== 'string' || displayName.trim().length < 2) {
      res.status(400).json({ error: 'Display name must be at least 2 characters.' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { displayName: displayName.trim() },
      select: { id: true, email: true, displayName: true, updatedAt: true },
    });

    res.json({ message: 'Profile updated successfully', user: updated });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/auth/password
 * Securely changes account password after verifying old password
 */
router.put('/password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Current password is incorrect.' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Invalidate other refresh tokens for security
    await prisma.refreshToken.deleteMany({ where: { userId } });

    res.json({ message: 'Password updated successfully. Please log in again.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/auth/account
 * Complete account deletion and cascade wipe of all saves (GDPR compliant)
 */
router.delete('/account', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: 'Account and all simulation saves deleted successfully.' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
