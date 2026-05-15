const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    googleId:   { type: String, default: null },       // only for Google OAuth users
    name:       { type: String, required: true },
    email:      { type: String, required: true, unique: true },
    password:   { type: String, default: null },       // only for local auth users (bcrypt hash)
    profilePic: { type: String, default: null },
    authType:   { type: String, enum: ["local", "google"], default: "local" }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);

