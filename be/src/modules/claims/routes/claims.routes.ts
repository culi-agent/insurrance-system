import { Router } from 'express';
import { ClaimsController } from '../controllers/claims.controller';
import { authenticate, authorize } from '../../../shared/middleware/authenticate';

const router = Router();

// Customer claims routes (authenticated)
router.use(authenticate);
router.post('/', ClaimsController.submitClaim);
router.get('/', ClaimsController.getMyClaims);
router.get('/:claimId', ClaimsController.getClaimDetail);
router.post('/:claimId/documents', ClaimsController.uploadDocument);
router.post('/:claimId/messages', ClaimsController.addMessage);
router.get('/:claimId/settlement', ClaimsController.getSettlementStatus);
router.post('/:claimId/appeal', ClaimsController.submitAppeal);

export default router;

// Admin claims routes
export const adminClaimsRouter = Router();
adminClaimsRouter.use(authenticate);
adminClaimsRouter.use(authorize('admin'));
adminClaimsRouter.get('/queue', ClaimsController.getClaimsQueue);
adminClaimsRouter.post('/:claimId/assign', ClaimsController.assignClaim);
adminClaimsRouter.post('/:claimId/decide', ClaimsController.decideClaim);
adminClaimsRouter.post('/:claimId/messages', ClaimsController.adminAddMessage);
adminClaimsRouter.post('/:claimId/settlement', ClaimsController.initiateSettlement);
adminClaimsRouter.post('/:claimId/fast-track', ClaimsController.fastTrackClaim);
