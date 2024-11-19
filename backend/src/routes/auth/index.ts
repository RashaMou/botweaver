import { Router, Request, Response } from "express";
import { asyncHandler } from "@/routes/middleware/errorHandler";

const router = Router();

router.post(
  "/register",
  asyncHandler(async (req: Request, res: Response) => {
    // 1. validate input
    // 2. check if user exists in db
    // 3. hash password using bcrypt/argon2
    // 4. create new user record
    // 5. generate initial access and refresh tokens
    // 6. store refresh token with user in DB
    // 7. set httpOnly cookies with tokens
    // 8. return success response with user info (excluding sensitive data)
  }),
);

router.post(
  "/login",
  asyncHandler(async (req: Request, res: Response) => {
    // 1. validate email/password input
    // 2. find user in db
    // 3. compare password hash
    // 4. generate new access and refresh tokens
    // 5. store new refresh token in db (invalidating old ones)
    // 6. set httpOnly cookies with tokens
    // 7. return user info and success message
  }),
);

router.post(
  "/refresh",
  asyncHandler(async (req: Request, res: Response) => {
    // 1. extract refresh token from cookies
    // 2. validate refresh token authenticity
    // 3. check if refresh token exists and is valid in db
    // 4. generate new access token (and optionally new refresh token)
    // 5. if generating new refresh token:
    //    - invalidate old refresh token in db
    //    - store new refresh token
    //    - update cookie
    // 6. otherwise, just update access token cookie
    // 7. return success response
  }),
);

export default router;
