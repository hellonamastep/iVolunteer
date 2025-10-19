// config/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/User.js";

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
  console.error("Missing Google OAuth env vars.");
}

// Sessions only if you ever use { session: true }
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) =>
  User.findById(id).then(u => done(null, u)).catch(err => done(err))
);

// Helper: safe defaults to satisfy your schema on first OAuth signup
function buildRequiredDefaults(profile) {
  // name is required
  const nameFromProfile = profile?.displayName?.trim()
    || profile?.name?.givenName
    || profile?.emails?.[0]?.value?.split("@")[0]
    || "Google User";

  // city/profession/nearestRailwayStation required for role "user"
  return {
    name: nameFromProfile,
    role: "user",
    isOAuthUser: true,                 // skips password and age
    city: "unknown",                   // >= 2 chars
    profession: "general",
    nearestRailwayStation: "unknown",
    contactNumber: "+10000000000",     // passes your phone validator
    profilePicture: profile?.photos?.[0]?.value ?? null,
    provider: "google",
  };
}

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_CALLBACK_URL) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile?.emails?.[0]?.value?.toLowerCase();
          if (!email) return done(new Error("Google profile missing email"));

          // Your schema has no googleId field. Always resolve by email.
          let user = await User.findOne({ email });

          if (!user) {
            // First time OAuth signup → provide every required field
            const doc = {
              id: undefined, // let schema default generate it
              email,
              ...buildRequiredDefaults(profile),
            };
            user = await User.create(doc);
          } else {
            // Existing user → mark as OAuth-capable and fill any missing requireds for role=user
            const patch = {};
            if (!user.isOAuthUser) patch.isOAuthUser = true;
            if (!user.name) patch.name = buildRequiredDefaults(profile).name;
            if (!user.city) patch.city = "unknown";
            if (!user.profession) patch.profession = "general";
            if (!user.nearestRailwayStation) patch.nearestRailwayStation = "unknown";
            if (!user.contactNumber) patch.contactNumber = "+10000000000";
            if (!user.profilePicture && profile?.photos?.[0]?.value)
              patch.profilePicture = profile.photos[0].value;
            if (!user.provider) patch.provider = "google";

            if (Object.keys(patch).length) {
              await User.updateOne({ _id: user._id }, { $set: patch });
              // reflect patched values in memory (optional)
              Object.assign(user, patch);
            }
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}

// Debug (remove in prod)
// @ts-ignore
if (process.env.NODE_ENV !== "production") {
  // @ts-ignore
  console.log("Passport strategies:", Object.keys(passport._strategies || {}));
}

export default passport;
