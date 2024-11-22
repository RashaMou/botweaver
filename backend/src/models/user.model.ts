import mongoose from "mongoose";
import { hash, verify } from "@node-rs/bcrypt";
import { RefreshTokenPayload } from "@/utils/token.utils";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    refreshTokens: [
      {
        family: String,
        version: String,
        expiresAt: Date,
      },
    ],
    lastLogin: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return verify(candidatePassword, this.password);
};

export interface UserDocument extends mongoose.Document {
  email: string;
  password: string;
  refreshTokens: RefreshTokenPayload[];
  lastLogin: Date;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export const User = mongoose.model<UserDocument, mongoose.Model<UserDocument>>(
  "User",
  userSchema,
);
