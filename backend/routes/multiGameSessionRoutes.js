const express = require('express');
const router = express.Router();
const MultiplayerController = require('../Controllers/MultiplayerController');
const auth = require('../middleware/auth'); 

// Performance and scoring routes
router.post('/performance', auth, MultiplayerController.updatePerformance);
router.post('/finalscore', auth, MultiplayerController.saveFinalScore);

// Room details route
router.get('/rooms/:roomId', auth, MultiplayerController.getRoomDetails);

router.post('/stats/user', MultiplayerController.getUserMultiplayerStats);


module.exports = router;