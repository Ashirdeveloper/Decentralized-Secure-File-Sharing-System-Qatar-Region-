const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const geoFence = require('../middleware/geoFence');
const { register, login } = require('../controllers/authController');
const { uploadFile, reconstructFile, getFileInfo } = require('../controllers/fileController');

// Multer config for Memory Storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Public Routes
router.post('/auth/register', register);
router.post('/auth/login', login);

// Protected Routes (Zero Trust: Verify Token + Geo Fence)
// Apply GeoFence to all file operations
router.use('/files', auth, geoFence);

router.post('/files/upload', upload.single('file'), uploadFile);
router.post('/files/reconstruct', reconstructFile);
router.get('/files/:fileId', getFileInfo);

module.exports = router;
