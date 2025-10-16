const express = require('express');
const router = express.Router();
const {
  getPreferences,
  updatePreferences,
  unsubscribeAll
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// All notification routes are protected
router.use(protect);

router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);
router.put('/unsubscribe-all', unsubscribeAll);

module.exports = router;