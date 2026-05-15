require('dotenv').config();
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const mongoose = require("mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/user");
const profilesRouter = require("./routes/profiles");
const requestsRouter = require("./routes/requests");
const ridesRouter = require("./routes/rides");
const authRouter = require("./routes/auth");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// =========================
// MongoDB Atlas Connection
// =========================

//console.log("MONGO URI:", process.env.MONGO_URI);

mongoose.set("strictQuery", false);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log("MongoDB Atlas connected successfully");

    // Insert dummy data if collections are empty
    const Ride = require("./models/ride");
    const RequestForASeat = require("./models/request");
    const Profile = require("./models/profile");

    const rideCount = await Ride.countDocuments();
    if (rideCount === 0) {
      const dummyRides = [
        {
          driver: "John Doe",
          departureDetails: {
            departureLocation: "New York",
            departureDateTime: new Date("2026-05-20T10:00:00Z")
          },
          destinationDetails: {
            destinationLocation: "Boston",
            estimatedArrivalTime: "14:00"
          },
          additionalInformation: "Non-smoking ride, pets allowed",
          pricing: {
            pricePerSeat: "50"
          },
          availableSeats: {
            numberOfAvailableSeats: 3
          }
        },
        {
          driver: "Jane Smith",
          departureDetails: {
            departureLocation: "Los Angeles",
            departureDateTime: new Date("2026-05-21T08:00:00Z")
          },
          destinationDetails: {
            destinationLocation: "San Francisco",
            estimatedArrivalTime: "12:00"
          },
          additionalInformation: "Comfortable car, music on",
          pricing: {
            pricePerSeat: "40"
          },
          availableSeats: {
            numberOfAvailableSeats: 2
          }
        }
      ];
      await Ride.insertMany(dummyRides);
      console.log("Dummy rides inserted");
    }

    const requestCount = await RequestForASeat.countDocuments();
    if (requestCount === 0) {
      const dummyRequests = [
        {
          yourName: "Alice Johnson",
          yourEmail: "alice@example.com",
          messageToDriver: "Looking forward to the ride!",
          rideId: "dummyRideId1"
        },
        {
          yourName: "Bob Wilson",
          yourEmail: "bob@example.com",
          messageToDriver: "I have luggage, hope that's ok",
          rideId: "dummyRideId2"
        }
      ];
      await RequestForASeat.insertMany(dummyRequests);
      console.log("Dummy requests inserted");
    }

    const profileCount = await Profile.countDocuments();
    if (profileCount === 0) {
      const dummyProfiles = [
        {
          name: "John Doe",
          email: "john@example.com",
          displayName: "Johnny",
          bio: "Love traveling and meeting new people"
        },
        {
          name: "Jane Smith",
          email: "jane@example.com",
          displayName: "Janie",
          bio: "Adventure seeker, always on the go"
        }
      ];
      await Profile.insertMany(dummyProfiles);
      console.log("Dummy profiles inserted");
    }
  })
  .catch((err) => {
    console.log("MongoDB connection failed");
    console.log(err.message);
  });

/* =========================
   Middleware
========================= */

app.use(cookieParser());

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000", // frontend URL
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "sessionsecret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

/* =========================
   Google OAuth Strategy
========================= */

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
console.log("[INIT] BACKEND_URL:", BACKEND_URL);
console.log("[INIT] CLIENT_URL:", process.env.CLIENT_URL);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/auth/google/callback`,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("[GOOGLE] Profile received for:", profile.displayName);

        // Safety check for email
        if (!profile.emails || !profile.emails[0]) {
          console.error("[GOOGLE] No email found in profile");
          return done(new Error("No email found in Google profile"), null);
        }
        const googleEmail = profile.emails[0].value;
        console.log("[GOOGLE] Email:", googleEmail);

        // Safety check for profile picture
        const profilePic = (profile.photos && profile.photos[0])
          ? profile.photos[0].value
          : "";

        let user = await User.findOne({ email: googleEmail });
        console.log("[GOOGLE] Existing user found:", !!user);

        if (user) {
          user.googleId = profile.id;
          user.name = profile.displayName;
          user.profilePic = profilePic;
          user.authType = 'google';
          await user.save();
          console.log("[GOOGLE] Existing user updated");
        } else {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: googleEmail,
            profilePic: profilePic,
            authType: 'google',
          });
          console.log("[GOOGLE] New user created");
        }

        done(null, user);
      } catch (error) {
        console.error("[GOOGLE] AUTH ERROR:", error.message, error.stack);
        done(error, null);
      }
    }
  )
);

/* =========================
   Passport Session
========================= */

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {

    const user = await User.findById(id);

    done(null, user);

  } catch (error) {
    done(error, null);
  }
});

/* =========================
   Generate JWT
========================= */

const generateToken = (user) => {

  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
    },
    SECRET_KEY,
    {
      expiresIn: "30m",
    }
  );
};

/* =========================
   Routes
========================= */

// Google Login

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Google Callback

app.get(
  "/auth/google/callback",

  passport.authenticate("google", {
    failureRedirect: "/",
  }),

  (req, res) => {
    try {
      console.log("[CALLBACK] req.user:", req.user ? req.user.email : "MISSING - passport failed");

      if (!req.user) {
        console.error("[CALLBACK] No user on request — passport authentication failed");
        return res.status(500).send("Authentication failed: no user found");
      }

      const token = generateToken(req.user);
      console.log("[CALLBACK] Token generated successfully");

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 30 * 60 * 1000,
      });

      const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
      const redirectUrl = `${clientUrl}/authenticate`;
      console.log("[CALLBACK] Redirecting to:", redirectUrl);

      res.redirect(redirectUrl);
    } catch (err) {
      console.error("[CALLBACK] ERROR:", err.message, err.stack);
      res.status(500).send("Internal Server Error during callback");
    }
  }
);

/* =========================
   Verify JWT Middleware
========================= */

const verifyToken = (req, res, next) => {

  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {

    if (err) {
      return res.status(403).json({
        message: "Invalid token",
      });
    }

    req.user = decoded;

    next();
  });
};

/* =========================
   Protected Route
========================= */

app.get("/dashboard", verifyToken, (req, res) => {

  res.json({
    message: "Welcome to Dashboard",
    user: req.user,
  });

});

/* =========================
   Logout
========================= */

app.get("/logout", (req, res) => {

  res.clearCookie("token");

  res.json({
    message: "Logged out successfully",
  });

});

app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

app.get("/session", verifyToken, (req, res) => {
  res.json({
    authenticated: true,
    user: req.user,
  });
});

const notificationsRouter = require('./routes/notifications');

app.use("/auth", authRouter);
app.use("/profiles", profilesRouter);
app.use("/requests", requestsRouter);
app.use("/rides", ridesRouter);
app.use("/notifications", notificationsRouter);

/* =========================
   Server
========================= */

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});