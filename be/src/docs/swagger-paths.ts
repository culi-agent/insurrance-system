/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register new customer account
 *     description: Creates a new customer account and sends OTP for verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registration successful, OTP sent
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/RegisterResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email or phone already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Customer login
 *     description: Authenticate with email/phone and password. Returns JWT tokens.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       423:
 *         description: Account locked due to too many failed attempts
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */

/**
 * @swagger
 * /api/v1/auth/verify-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify OTP code
 *     description: Verify email/phone OTP after registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtpRequest'
 *     responses:
 *       200:
 *         description: OTP verified, tokens issued
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         verified:
 *                           type: boolean
 *                         access_token:
 *                           type: string
 *                         refresh_token:
 *                           type: string
 *                         expires_in:
 *                           type: integer
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/v1/auth/resend-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Resend OTP
 *     description: Resend OTP to email/phone for verification or password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResendOtpRequest'
 *     responses:
 *       200:
 *         description: OTP resent
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */

/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     description: Exchange a valid refresh token for new access + refresh tokens (token rotation)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: New tokens issued
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/RefreshTokenResponse'
 *       401:
 *         description: Invalid or expired refresh token
 */

/**
 * @swagger
 * /api/v1/auth/social-login:
 *   post:
 *     tags: [Auth]
 *     summary: Social login (Google/Facebook)
 *     description: Login or register via social provider. Creates account if new.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SocialLoginRequest'
 *     responses:
 *       200:
 *         description: Social login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/LoginResponse'
 *                         - type: object
 *                           properties:
 *                             is_new_user:
 *                               type: boolean
 *       401:
 *         description: Invalid social token
 */

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset OTP
 *     description: Sends OTP to email/phone for password reset. Always returns success for security.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: OTP sent if account exists
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password with OTP
 *     description: Set new password using valid OTP. Revokes all existing sessions.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout
 *     description: Revoke refresh token / all sessions
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: Optional. If provided, only revokes this session.
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CustomerProfile'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   put:
 *     tags: [Auth]
 *     summary: Update current user profile
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change password (authenticated)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Current password incorrect
 */

/**
 * @swagger
 * /api/v1/auth/social-accounts:
 *   get:
 *     tags: [Auth]
 *     summary: Get linked social accounts
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of linked social accounts
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/v1/auth/social-accounts/{provider}:
 *   delete:
 *     tags: [Auth]
 *     summary: Unlink social account
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: provider
 *         required: true
 *         schema:
 *           type: string
 *           enum: [google, facebook]
 *     responses:
 *       200:
 *         description: Social account unlinked
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         description: Cannot unlink the only login method
 */
