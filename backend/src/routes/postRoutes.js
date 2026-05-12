const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/', postController.getPosts);
router.post('/', postController.createPost);
router.post('/:id/like', postController.likePost);
router.post('/:id/favorite', postController.favoritePost);
router.post('/:id/comment', postController.commentPost);
router.post('/:id/report', postController.reportPost);

module.exports = router;
