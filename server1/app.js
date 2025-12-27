var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
// MongoDB connection
require('./db');
require('mongoose');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// Enable CORS for React frontend
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Chatbot endpoint
function botReply(message) {
  if (message.includes("hello")) return "Hi! How can I help you?";
  if (message.includes("name")) return "I'm your chatbot created with Node & React!";
  if (message.includes("how are you")) return "I'm fine thank you for asking! What about you?";
  if (message.includes("what is your favorite technology")) return "I love working on Artificial Intelligence and Machine Learning!";
  if (message.includes("tell me a story") || message.includes("joke")) return "Why did the computer show up at work late? It had a hard drive!";
  if (message.includes("give me artificial intelligence notes")) return "Here's the AI notes PDF: c:\\Users\\md abdul\\Downloads\\ArtificialIntelligence.pdf";
  if (message.includes("tell about mahabharat")) return "The noble Pandavas and their scheming cousins, the Kaurava kings, go up against each other to inherit the Hastinapur throne. Krishna lends his powers to help the Pandavas in the war.";
  return "Sorry, I didn't understand that 😅";
}

const Message = require('./models/Message');

app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    console.log("User message:", userMessage);

    if (!userMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    const reply = botReply(userMessage.toLowerCase());
    console.log("Bot reply:", reply);

    // Save messages to MongoDB (fire-and-forget but await to ensure persistence)
    try {
      await Message.create({ sender: 'user', text: userMessage });
      await Message.create({ sender: 'bot', text: reply });
    } catch (saveErr) {
      console.error('Failed to save messages to DB:', saveErr);
    }

    res.json({ reply });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Return recent messages stored in MongoDB
app.get('/api/messages', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const messages = await Message.find().sort({ createdAt: -1 }).limit(limit).lean();
    res.json({ messages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
