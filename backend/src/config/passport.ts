import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const prisma = new PrismaClient();

// Serializer
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

// Deserializer
passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Google Strategy
console.log("Google Client ID Loaded:", process.env.GOOGLE_CLIENT_ID ? "Yes (" + process.env.GOOGLE_CLIENT_ID.substring(0, 5) + "...)" : "No");

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'missing_client_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'missing_client_secret',
    callbackURL: "http://localhost:5000/api/auth/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // 1. Check if user exists by googleId
            let user = await prisma.user.findUnique({ where: { googleId: profile.id } });

            if (user) {
                return done(null, user);
            }

            // 2. Check if user exists by email (if email is provided)
            if (profile.emails && profile.emails.length > 0) {
                const email = profile.emails[0].value;
                user = await prisma.user.findUnique({ where: { email } });

                if (user) {
                    // Link accounts
                    user = await prisma.user.update({
                        where: { id: user.id },
                        data: { googleId: profile.id }
                    });
                    return done(null, user);
                }

                // 3. Create new user
                // Generate a temporary username until they pick one
                let username = `user_${crypto.randomBytes(4).toString('hex')}`;

                // Ensure uniqueness (rare collision check)
                while (await prisma.user.findUnique({ where: { username } })) {
                    username = `user_${crypto.randomBytes(4).toString('hex')}`;
                }

                user = await prisma.user.create({
                    data: {
                        googleId: profile.id,
                        email: email,
                        username: username,
                        name: profile.displayName,
                        isVerified: true, // Google emails are verified
                        profilePicture: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
                        needsUsernameSetup: true
                    }
                });
                return done(null, user);
            }

            return done(new Error("No email found in Google profile"), undefined);

        } catch (err) {
            return done(err, undefined);
        }
    }));

// GitHub Strategy
console.log("GitHub Client ID Loaded:", process.env.GITHUB_CLIENT_ID ? "Yes (" + process.env.GITHUB_CLIENT_ID.substring(0, 5) + "...)" : "No");

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'missing_client_id',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'missing_client_secret',
    callbackURL: "http://localhost:5000/api/auth/github/callback",
    scope: ['user:email']
},
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
            // 1. Check if user exists by githubId
            let user = await prisma.user.findUnique({ where: { githubId: profile.id } });

            if (user) {
                return done(null, user);
            }

            // 2. Check by email (GitHub might have null email in profile, fetch from emails array if available)
            let email = null;
            if (profile.emails && profile.emails.length > 0) {
                // Try to find the primary/verified email
                const primary = profile.emails.find((e: any) => e.primary) || profile.emails[0];
                email = primary.value;
            }

            if (email) {
                user = await prisma.user.findUnique({ where: { email } });
                if (user) {
                    // Link accounts
                    user = await prisma.user.update({
                        where: { id: user.id },
                        data: { githubId: profile.id }
                    });
                    return done(null, user);
                }
                // 3. Create new user
                let username = `user_${crypto.randomBytes(4).toString('hex')}`;

                while (await prisma.user.findUnique({ where: { username } })) {
                    username = `user_${crypto.randomBytes(4).toString('hex')}`;
                }

                user = await prisma.user.create({
                    data: {
                        githubId: profile.id,
                        email: email,
                        username: username,
                        name: profile.displayName || profile.username,
                        isVerified: true,
                        profilePicture: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
                        needsUsernameSetup: true
                    }
                });
                return done(null, user);
            } else {
                return done(new Error("No public email found on GitHub account. Please make your email public or use another method."), undefined);
            }

        } catch (err) {
            return done(err, undefined);
        }
    }));

export default passport;
