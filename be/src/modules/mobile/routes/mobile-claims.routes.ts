import { Router } from 'express';
import { MobileClaimsController } from '../controllers/mobile-claims.controller';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();

router.use(authenticate);

// Get eligible policies for claim
router.get('/eligible-policies', MobileClaimsController.getEligiblePolicies);

// Get required documents by claim type
router.get('/required-documents', MobileClaimsController.getRequiredDocuments);

// Submit claim
router.post('/', MobileClaimsController.submitClaim);

// Document management
router.post('/:claimId/upload-url', MobileClaimsController.getUploadUrl);
router.post('/:claimId/documents', MobileClaimsController.addDocument);
router.get('/:claimId/documents', MobileClaimsController.getClaimDocuments);

export default router;
