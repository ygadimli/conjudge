import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import passport from 'passport';
import crypto from 'crypto';
import { sendEmail } from '../utils/email';

const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'conjudge-secret-key-change-in-production';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Signup
router.post('/signup', async (req: Request, res: Response): Promise<any> => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }]
            }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');


        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                rating: 1200,
                isVerified: false,
                verificationToken
            }
        });

        // Send Verification Email
        const verificationLink = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000000; color: #ffffff; border: 1px solid #333; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #0D0D0D; padding: 20px; text-align: center; border-bottom: 2px solid #E80000;">
                    <h1 style="color: #E80000; margin: 0; font-size: 24px;">ConJudge</h1>
                </div>
                <div style="padding: 40px 20px; text-align: center;">
                    <h2 style="margin-top: 0;">Welcome Aboard! 🚀</h2>
                    <p style="color: #cccccc; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                        Thanks for joining the platform. To start solving problems and battling others, please verify your email address.
                    </p>
                    <a href="${verificationLink}" style="display: inline-block; background-color: #E80000; color: #ffffff; text-decoration: none; padding: 12px 30px; font-weight: bold; border-radius: 5px; font-size: 16px;">
                        Verify My Account
                    </a>
                    <p style="color: #666; font-size: 12px; margin-top: 30px;">
                        If you didn't sign up for ConJudge, you can safely ignore this email.
                    </p>
                </div>
                <div style="background-color: #111; padding: 15px; text-align: center; color: #555; font-size: 12px;">
                    &copy; ${new Date().getFullYear()} ConJudge Platform. All rights reserved.
                </div>
            </div>
        `;

        await sendEmail(email, 'Verify your ConJudge Account', emailHtml);

        res.status(201).json({
            message: 'Registration successful! Please check your email to verify your account.'
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify Email
router.post('/verify-email', async (req: Request, res: Response): Promise<any> => {
    try {
        const { token } = req.body;
        const user = await prisma.user.findFirst({ where: { verificationToken: token } });

        if (!user) return res.status(400).json({ error: 'Invalid token' });

        await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null // Clear token
            }
        });

        res.json({ message: 'Email verified successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Verification failed' });
    }
});

// Login (Username OR Email)
router.post('/login', async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body; // 'email' field can contain username OR email

        if (!email || !password) {
            return res.status(400).json({ error: 'Username/Email and password are required' });
        }

        // Find user by Email OR Username
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: email }
                ]
            }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if verified
        if (!user.isVerified) {
            return res.status(403).json({ error: 'Please verify your email address first.' });
        }

        // If user logged in via OAuth, they might not have a password
        if (!user.password) {
            return res.status(400).json({ error: 'This account uses social login. Please sign in with Google/GitHub.' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (user.isBanned) {
            return res.status(403).json({
                error: 'Your account has been banned',
                reason: user.banReason || 'No reason provided'
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                rating: user.rating,
                brainType: user.brainType,
                role: user.role,
                needsUsernameSetup: user.needsUsernameSetup
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Forgot Password
router.post('/forgot-password', async (req: Request, res: Response): Promise<any> => {
    try {
        const { email } = req.body; // Can be username or email

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: email }
                ]
            }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const resetToken = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpires: expires
            }
        });

        const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000000; color: #ffffff; border: 1px solid #333; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #0D0D0D; padding: 20px; text-align: center; border-bottom: 2px solid #E80000;">
                    <h1 style="color: #E80000; margin: 0; font-size: 24px;">ConJudge</h1>
                </div>
                <div style="padding: 40px 20px; text-align: center;">
                    <h2 style="margin-top: 0;">Password Reset Request 🔐</h2>
                    <p style="color: #cccccc; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                        We received a request to reset your password. If this was you, click the button below to secure your account.
                    </p>
                    <a href="${resetLink}" style="display: inline-block; background-color: #E80000; color: #ffffff; text-decoration: none; padding: 12px 30px; font-weight: bold; border-radius: 5px; font-size: 16px;">
                        Reset My Password
                    </a>
                    <p style="color: #666; font-size: 12px; margin-top: 30px;">
                        This link expires in 1 hour. If you didn't ask for this, you can ignore this email.
                    </p>
                </div>
                <div style="background-color: #111; padding: 15px; text-align: center; color: #555; font-size: 12px;">
                    &copy; ${new Date().getFullYear()} ConJudge Platform. All rights reserved.
                </div>
            </div>
        `;

        await sendEmail(user.email, 'Reset your ConJudge Password', emailHtml);

        res.json({ message: 'Reset link sent to your email' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error sending email' });
    }
});

// Reset Password
router.post('/reset-password', async (req: Request, res: Response): Promise<any> => {
    try {
        const { token, newPassword } = req.body;

        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { gt: new Date() }
            }
        });

        if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null
            }
        });

        res.json({ message: 'Password reset successful' });

    } catch (error) {
        res.status(500).json({ error: 'Reset failed' });
    }
});


// Get current user
router.get('/me', async (req: Request, res: Response): Promise<any> => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded: any = jwt.verify(token, JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                username: true,
                email: true,
                rating: true,
                brainType: true,
                role: true,
                needsUsernameSetup: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Complete Profile (Set Username)
router.post('/complete-profile', async (req: Request, res: Response): Promise<any> => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded: any = jwt.verify(token, JWT_SECRET);
        const { username } = req.body;

        if (!username || username.length < 3) {
            return res.status(400).json({ error: 'Username must be at least 3 characters long' });
        }

        // Check if username is taken
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ error: 'Username is already taken' });
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: decoded.id },
            data: {
                username,
                needsUsernameSetup: false
            }
        });

        res.json({
            message: 'Profile completed successfully',
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                rating: updatedUser.rating,
                brainType: updatedUser.brainType,
                role: updatedUser.role,
                needsUsernameSetup: false
            }
        });

    } catch (error) {
        console.error('Complete profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login?error=auth_failed` }),
    (req: any, res: Response) => {
        // Successful authentication
        const user = req.user;
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        // Redirect to frontend with token
        res.redirect(`${FRONTEND_URL}/login?token=${token}`);
    }
);

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: `${FRONTEND_URL}/login?error=auth_failed` }),
    (req: any, res: Response) => {
        // Successful authentication
        const user = req.user;
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        // Redirect to frontend with token
        res.redirect(`${FRONTEND_URL}/login?token=${token}`);
    }
);

export default router;
