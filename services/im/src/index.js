const express = require('express');
const cors = require('cors');
const app = express();
const socket = require('socket.io');
const mongoose = require('mongoose');
const { Message } = require('./model/message');
// global variables
const PORT = process.env.PORT || 3000;
const DB_URL = 'mongodb://im-db:27017/im';

mongoose.connect(DB_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    }
);

app.use(cors({
    origin: ['*'],
    exposedHeaders: ['auth-token']
}));

const server = app.listen(PORT, (_) => {
    console.log(`IM listening on PORT ${PORT}`);
    console.log(`Local:  http://localhost:${PORT}`);
});

const io = socket(server);
io.on('connection', function (socket) {
    console.log('socket is on');
    socket.on('chat', (msg) => {
        // const message = new Message;
        // message.senderId = 
        doAnalysis(msg);
        io.sockets.emit('chat', msg);
    });
});

const doAnalysis = function(msg) {
    if (msg.type == 'text') {
        if (filterEmail(msg.content) != null) {
            msg.analysis = {
                email: filterEmail(msg.content)[0],
                finding: 'email',
                resolution: `<em style="color: yellow; font-weight: bold;">Warning: </em><em style="color: yellow">This message was deleted due to MasterLance's customer policy trespassing</em>`
            }
            msg.content = '';
            msg.deleted = true;
        }
        if (filterPhoneNumber(msg.content) != null)  {
            msg.analysis = {
                phone: filterPhoneNumber(msg.content)[0],
                finding: 'phone',
                resolution: `<em style="color: yellow; font-weight: bold;">Warning: </em><em style="color: yellow">This message was deleted due to MasterLance's customer policy trespassing</em>`
            }
            msg.content = '';
            msg.deleted = true;
        }
        console.log(msg);
    }
}

const filterEmail = function(content) {
    return content.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
}

const filterPhoneNumber = function(content) {
    var regex = new RegExp("\\+?\\(?\\d*\\)? ?\\(?\\d+\\)?\\d*([\\s./-]?\\d{2,})+", "g");
    const match = regex.exec(content)
    if (match != null) 
        return match[0];
    return null;
}
// routes
const messageRoute = require('./routes/messages');
const analysisRoute = require('./routes/analysis');
const imageRoute = require('./routes/images');

app.use('/messages', messageRoute);
app.use('/analysis', analysisRoute);
app.use('/images', imageRoute);

app.use(express.static(__dirname + '/public'));
