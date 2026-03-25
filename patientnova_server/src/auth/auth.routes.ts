import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/prismaClient.js';
import { apiError, ok } from '../utils/apiUtils.js';
import { config } from '../utils/config.js';
import { authenticate, requireSuperAdmin } from '../middlewares/authenticate.js';

export const authRouter = Router();

/**
 * POST /auth/login
 * Public endpoint. Validates credentials and returns a JWT token + user info.
 */
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      apiError(res, 'Email and password required', 400);
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      apiError(res, 'Invalid credentials', 401);
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      apiError(res, 'Invalid credentials', 401);
      return;
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      config.auth.jwtSecret,
      { expiresIn: '7d' }
    );

    ok(res, {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    });
  } catch {
    apiError(res, 'Login failed', 500);
  }
});

/**
 * POST /auth/register
 * Protected (SUPER_ADMIN only). Creates a new user with a hashed password.
 */
authRouter.post('/register', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
      apiError(res, 'Email, password, and name are required', 400);
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      apiError(res, 'Email already registered', 409);
      return;
    }

    const passwordHash = await bcrypt.hash(password, config.auth.bcryptRounds);
    const user = await prisma.user.create({
      data: { email, passwordHash, name, role: role ?? 'ADMIN' },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    ok(res, user, 201);
  } catch {
    apiError(res, 'Failed to create user', 500);
  }
});

/**
 * GET /auth/users
 * Protected (SUPER_ADMIN only). Lists all users.
 */
authRouter.get('/users', authenticate, requireSuperAdmin, async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, isActive: true, lastLoginAt: true },
      orderBy: { createdAt: 'desc' },
    });
    ok(res, users);
  } catch {
    apiError(res, 'Failed to list users', 500);
  }
});
