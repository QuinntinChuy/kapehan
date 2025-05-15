const express = require('express');
const menuController = require('../controllers/menuController');
const router = express.Router();

router.get('/items', menuController.getAllItems);

router.get('/items/category/:category', menuController.getItemsByCategory);

router.get('/items/:id', menuController.getItemById);

router.post('/items', menuController.createItem);

router.put('/items/:id', menuController.updateItem);

router.delete('/items/:id', menuController.deleteItem);

module.exports = router;