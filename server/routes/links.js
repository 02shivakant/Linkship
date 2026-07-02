const express = require('express');
const router = express.Router();
const Link = require('../models/Link');
const { generateShortCode, isValidUrl, isValidAlias, getClientIp } = require('../utils/helpers');
const { createLimiter } = require('../middleware/rateLimiter');

// POST /api/links — create a short link
router.post('/', createLimiter, async (req, res) => {
  try {
    const { originalUrl, customAlias, title, expiryDays } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ success: false, message: 'Original URL is required' });
    }

    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid URL (must include http:// or https://)' });
    }

    let shortCode;

    if (customAlias) {
      if (!isValidAlias(customAlias)) {
        return res.status(400).json({
          success: false,
          message: 'Alias must be 3–20 characters, letters/numbers/hyphens only',
        });
      }
      const existing = await Link.findOne({ shortCode: customAlias });
      if (existing) {
        return res.status(409).json({ success: false, message: 'This alias is already taken. Try another.' });
      }
      shortCode = customAlias;
    } else {
      // Generate unique short code with collision check
      let attempts = 0;
      do {
        shortCode = generateShortCode(6);
        attempts++;
        if (attempts > 10) {
          return res.status(500).json({ success: false, message: 'Could not generate unique code. Try again.' });
        }
      } while (await Link.findOne({ shortCode }));
    }

    const expiresAt = expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) : null;

    const link = await Link.create({
      originalUrl,
      shortCode,
      customAlias: customAlias || null,
      title: title || '',
      expiresAt,
    });

    const shortUrl = `${process.env.BASE_URL}/${shortCode}`;

    return res.status(201).json({
      success: true,
      message: 'Link created successfully',
      data: {
        id: link._id,
        shortUrl,
        shortCode: link.shortCode,
        originalUrl: link.originalUrl,
        title: link.title,
        clicks: link.clicks,
        expiresAt: link.expiresAt,
        createdAt: link.createdAt,
      },
    });
  } catch (error) {
    console.error('Create link error:', error);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// GET /api/links — get all links with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [links, total] = await Promise.all([
      Link.find({ isActive: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-clickHistory'),
      Link.countDocuments({ isActive: true }),
    ]);

    const BASE_URL = process.env.BASE_URL;

    return res.status(200).json({
      success: true,
      data: links.map((l) => ({
        id: l._id,
        shortUrl: `${BASE_URL}/${l.shortCode}`,
        shortCode: l.shortCode,
        originalUrl: l.originalUrl,
        title: l.title,
        clicks: l.clicks,
        expiresAt: l.expiresAt,
        createdAt: l.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get links error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/links/:id/stats — get detailed stats for one link
router.get('/:id/stats', async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }

    // Compute clicks per day (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentClicks = link.clickHistory.filter((c) => c.timestamp >= sevenDaysAgo);

    const clicksByDay = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      clicksByDay[key] = 0;
    }

    recentClicks.forEach((c) => {
      const key = new Date(c.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      if (clicksByDay[key] !== undefined) clicksByDay[key]++;
    });

    return res.status(200).json({
      success: true,
      data: {
        id: link._id,
        shortUrl: `${process.env.BASE_URL}/${link.shortCode}`,
        shortCode: link.shortCode,
        originalUrl: link.originalUrl,
        title: link.title,
        totalClicks: link.clicks,
        createdAt: link.createdAt,
        expiresAt: link.expiresAt,
        isActive: link.isActive,
        clicksByDay,
        recentActivity: link.clickHistory.slice(-10).reverse(),
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/links/:id — deactivate a link
router.delete('/:id', async (req, res) => {
  try {
    const link = await Link.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }
    return res.status(200).json({ success: true, message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
