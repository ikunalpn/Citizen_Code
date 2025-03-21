const Attachment = require('../models/attachmentModel');

const AttachmentService = {
    create: (attachment, callback) => {
        Attachment.create(attachment, callback);
    },
    getAll: (grievanceId, callback) => {
        Attachment.getAll(grievanceId, callback);
    },
    delete: (attachmentId, callback) => {
        Attachment.delete(attachmentId, callback);
    },
    //... other methods
};

module.exports = AttachmentService;