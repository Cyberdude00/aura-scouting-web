require('dotenv').config();

const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const { body, validationResult } = require('express-validator');

const app = express();

// CONFIG
const PORT = process.env.PORT || 3000;
const allowedMimeTypes = process.env.ALLOWED_IMAGE_TYPES
  ? process.env.ALLOWED_IMAGE_TYPES.split(',')
  : [];
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.heif', '.heic'];
const maxFileSize = process.env.MAX_UPLOAD_FILE_SIZE
  ? Number(process.env.MAX_UPLOAD_FILE_SIZE_MB) * 1024 * 1024
  : 10 * 1024 * 1024;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());

// Multer (Memory Storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
      fileSize: maxFileSize
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (
      allowedMimeTypes.includes(file.mimetype) &&
      allowedExtensions.includes(ext)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, PNG, HEIF, and HEIC images are allowed'));
    }
  }
});

// Nodemailer Transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Validation rules
const modelSubmissionValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('age')
    .notEmpty().withMessage('Age is required')
    .isInt({ min: 12, max: 100 }).withMessage('Age must be between 12 and 100'),

  body('height')
    .notEmpty().withMessage('Height is required')
    .isInt({ min: 100, max: 250 })
    .withMessage('Height must be between 100cm and 250cm'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address'),

  body('social_network')
    .trim()
    .notEmpty().withMessage('Social network is required')
    .isLength({ max: 150 }).withMessage('Social network is too long'),

  body('about_me')
    .trim()
    .notEmpty().withMessage('About me is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('About me must be between 10 and 1000 characters'),

  body('cellphone')
    .trim()
    .notEmpty().withMessage('Cellphone is required')
    .matches(/^[0-9+\-\s()]{7,20}$/)
    .withMessage('Invalid phone number format')
];

// Route
app.post(
  '/api/model-submission',
  upload.single('photo'),
  modelSubmissionValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array()
        });
      }

      const {
        name,
        age,
        height,
        email,
        social_network,
        about_me,
        cellphone
      } = req.body;

      const photo = req.file;

      await transporter.sendMail({
        from: `"${process.env.SMTP_SENDER_NAME}" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_RECEIVER_EMAIL,
        subject: 'New Model Submission',
        html: `
          <h2>New Model Application</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Age:</strong> ${age}</p>
          <p><strong>Height:</strong> ${height}cm</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Social Network:</strong> ${social_network}</p>
          <p><strong>About me:</strong> ${about_me}</p>
          <p><strong>Cellphone:</strong> ${cellphone}</p>
        `,
        attachments: photo
          ? [
              {
                filename: photo.originalname,
                content: photo.buffer,
                contentType: photo.mimetype
              }
            ]
          : []
      });

      res.status(200).json({
        message: 'Application submitted successfully'
      });

    } catch (error) {
      console.error('Error:', error.message);

      if (error instanceof multer.MulterError) {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({
        message: error.message || 'Server error'
      });
    }
  }
);

// -------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
