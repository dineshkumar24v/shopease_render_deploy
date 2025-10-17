const NotificationPreference = require("../models/NotificationPreference");

// @desc    Get user's notification preferences
// @route   GET /api/notifications/preferences
// @access  Private
exports.getPreferences = async (req, res) => {
  try {
    let preferences = await NotificationPreference.findOne({
      user: req.user.id,
    });

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await NotificationPreference.create({
        user: req.user.id,
      });
    }

    res.status(200).json({
      success: true,
      preferences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update notification preferences
// @route   PUT /api/notifications/preferences
// @access  Private
exports.updatePreferences = async (req, res) => {
  try {
    const { emailNotifications } = req.body;

    let preferences = await NotificationPreference.findOne({
      user: req.user.id,
    });

    if (!preferences) {
      preferences = await NotificationPreference.create({
        user: req.user.id,
        emailNotifications,
      });
    } else {
      preferences.emailNotifications = {
        ...preferences.emailNotifications,
        ...emailNotifications,
      };
      await preferences.save();
    }

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      preferences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Unsubscribe from all emails
// @route   PUT /api/notifications/unsubscribe-all
// @access  Private
exports.unsubscribeAll = async (req, res) => {
  try {
    let preferences = await NotificationPreference.findOne({
      user: req.user.id,
    });

    if (!preferences) {
      preferences = await NotificationPreference.create({
        user: req.user.id,
      });
    }

    // Disable all email notifications
    preferences.emailNotifications = {
      orderConfirmation: false,
      orderStatusUpdate: false,
      promotions: false,
      newsletter: false,
      priceDrops: false,
      backInStock: false,
    };

    await preferences.save();

    res.status(200).json({
      success: true,
      message: "Unsubscribed from all email notifications",
      preferences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
