const AttachmentService = require('../services/attachmentService');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Create an 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

const AttachmentController = {
    uploadAttachment: [upload.single('file'), (req, res) => {
        const attachment = {
            grievanceId: req.params.grievanceId,
            fileName: req.file.filename,
            filePath: req.file.path,
            fileType: req.file.mimetype,
        };
        AttachmentService.create(attachment, (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Attachment uploaded successfully' });
        });
    }],
    getAllAttachments: (req, res) => {
        AttachmentService.getAll(req.params.grievanceId, (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        });
    },
    deleteAttachment: (req, res) => {
        AttachmentService.delete(req.params.attachmentId, (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Attachment deleted successfully' });
        });
    },
    //... other methods
};

module.exports = AttachmentController;