const { asyncHandler } = require('../middleware/errorHandler');
const { uploadToCloudinary } = require('../config/cloudinary');

// POST /api/upload/image
exports.uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image file provided.' });
  const result = await uploadToCloudinary(req.file.buffer, 'community-smart-general');
  res.json({ url: result.url, public_id: result.public_id, message: 'Image uploaded successfully.' });
});
