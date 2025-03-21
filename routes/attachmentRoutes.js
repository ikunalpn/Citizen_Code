const express = require('express');
const router = express.Router();
const AttachmentController = require('../controllers/attachmentController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/:grievanceId/attachments', authMiddleware, AttachmentController.uploadAttachment);
router.get('/:grievanceId/attachments', authMiddleware, AttachmentController.getAllAttachments);
router.delete('/:attachmentId', authMiddleware, AttachmentController.deleteAttachment);

module.exports = router;