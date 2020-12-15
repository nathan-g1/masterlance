const express = require('express');
const router = express.Router();
const Message = require('../model/message');
const MessageType = require('../model/messageType');



router.get('/:senderId/:receiverId', async (req, res) => {
    try {
        const messages = await Message.find({
            senderId: req.params.senderId,
            receiverId: req.params.receiverId
        });
        res.json(messages);
    } catch (err) {
        res.send({ message: err });
    }
});

router.post('/add', async (req, res) => {

    const product = new (req.body);
    try {
        const newProduct = await product.save();
        return res.json(newProduct );
    } catch (err) {
        return res.json({ message: err });
    }
});

// const Chat = require('../model/Product');
module.exports = router;