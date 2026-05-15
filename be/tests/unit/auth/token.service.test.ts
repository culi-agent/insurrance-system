import jwt from 'jsonwebtoken';
import { TokenService, TokenPayload } from '../../../src/modules/auth/services/token.service';

describe('TokenService', () => {
  const mockPayload: TokenPayload = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    role: 'customer',
  };

  describe('generateAccessToken', () => {
    it('should generate a valid JWT access token', () => {
      const token = TokenService.generateAccessToken(mockPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should contain correct payload data', () => {
      const token = TokenService.generateAccessToken(mockPayload);
      const decoded = jwt.decode(token) as TokenPayload & { iat: number; exp: number };
      expect(decoded.id).toBe(mockPayload.id);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
    });

    it('should set expiration time', () => {
      const token = TokenService.generateAccessToken(mockPayload);
      const decoded = jwt.decode(token) as TokenPayload & { iat: number; exp: number };
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid JWT refresh token', () => {
      const token = TokenService.generateRefreshToken(mockPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should have longer expiration than access token', () => {
      const accessToken = TokenService.generateAccessToken(mockPayload);
      const refreshToken = TokenService.generateRefreshToken(mockPayload);
      const accessDecoded = jwt.decode(accessToken) as { exp: number };
      const refreshDecoded = jwt.decode(refreshToken) as { exp: number };
      expect(refreshDecoded.exp).toBeGreaterThan(accessDecoded.exp);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token and return payload', () => {
      const token = TokenService.generateAccessToken(mockPayload);
      const decoded = TokenService.verifyAccessToken(token);
      expect(decoded.id).toBe(mockPayload.id);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        TokenService.verifyAccessToken('invalid.token.here');
      }).toThrow();
    });

    it('should throw error for expired token', () => {
      const expiredToken = jwt.sign(mockPayload, process.env.JWT_ACCESS_SECRET!, {
        expiresIn: '-1s',
      });
      expect(() => {
        TokenService.verifyAccessToken(expiredToken);
      }).toThrow();
    });

    it('should throw error when using refresh secret to verify access token', () => {
      const tokenWithWrongSecret = jwt.sign(mockPayload, 'wrong-secret', {
        expiresIn: '15m',
      });
      expect(() => {
        TokenService.verifyAccessToken(tokenWithWrongSecret);
      }).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token and return payload', () => {
      const token = TokenService.generateRefreshToken(mockPayload);
      const decoded = TokenService.verifyRefreshToken(token);
      expect(decoded.id).toBe(mockPayload.id);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        TokenService.verifyRefreshToken('invalid.token.here');
      }).toThrow();
    });

    it('should not verify an access token as refresh token', () => {
      const accessToken = TokenService.generateAccessToken(mockPayload);
      // Access token signed with different secret should fail refresh verification
      expect(() => {
        TokenService.verifyRefreshToken(accessToken);
      }).toThrow();
    });
  });

  describe('decodeToken', () => {
    it('should decode a valid token without verification', () => {
      const token = TokenService.generateAccessToken(mockPayload);
      const decoded = TokenService.decodeToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded!.id).toBe(mockPayload.id);
    });

    it('should return null for invalid token format', () => {
      const result = TokenService.decodeToken('completely-invalid');
      expect(result).toBeNull();
    });
  });
});
