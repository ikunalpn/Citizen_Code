const db = require('../config/db');

const Attachment = {
    create: (attachment, callback) => {
        db.query('INSERT INTO Attachments (grievance_id, file_name, file_path, file_type) VALUES (?, ?, ?, ?)',
            [attachment.grievanceId, attachment.fileName, attachment.filePath, attachment.fileType],
            callback
        );
    },
    getAll: (grievanceId, callback) => {
        db.query('SELECT * FROM Attachments WHERE grievance_id = ?', [grievanceId], callback);
    },
    delete: (attachmentId, callback) => {
        db.query('DELETE FROM Attachments WHERE attach_id = ?', [attachmentId], callback);
    },
    //... other methods
};

module.exports = Attachment;