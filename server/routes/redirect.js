const express = require('express');
const router = express.Router();
const Link = require('../models/Link');
const { redirectLimiter } = require('../middleware/rateLimiter');
const { getClientIp } = require('../utils/helpers');

// GET /:code — redirect to original URL
router.get('/:code', redirectLimiter, async (req, res) => {
  try {
    const { code } = req.params;

    const link = await Link.findOne({ shortCode: code, isActive: true });

    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found or has been deactivated' });
    }

    // Check expiry
    if (link.expiresAt && new Date() > link.expiresAt) {
      await Link.findByIdAndUpdate(link._id, { isActive: false });
      return res.status(410).json({ success: false, message: 'This link has expired' });
    }

    // Record click analytics
    const clickData = {
      timestamp: new Date(),
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'] || 'unknown',
      referrer: req.headers['referer'] || 'Direct',
    };

    // Non-blocking update
    Link.findByIdAndUpdate(link._id, {
      $inc: { clicks: 1 },
      $push: { clickHistory: { $each: [clickData], $slice: -500 } },
    }).exec();

    return res.redirect(301, link.originalUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
