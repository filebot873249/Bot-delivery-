require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const { MongoClient } = require('mongodb');

const app = express();
app.use(express.json());

// Simple in-memory storage for start
const products = [
  { id: 1, name: "Digital Product 1", price: 10, description: "Test product 1" },
  { id: 2, name: "Digital Product 2", price: 25, description: "Test product 2" }
];

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: false });

// Webhook for production
app.post('/webhook', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const keyboard = {
    reply_markup: {
      inline_keyboard: products.map(p => [
        { text: `${p.name} - $${p.price}`, callback_data: `product_${p.id}` }
      ])
    }
  };
  bot.sendMessage(chatId, 'Welcome! Choose a product:', keyboard);
});

// Handle product selection
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const productId = query.data.split('_')[1];
  const product = products.find(p => p.id == productId);
  
  if (product) {
    bot.sendMessage(chatId, 
      `Selected: ${product.name}\nPrice: $${product.price}\n\nPayment system coming soon!`
    );
  }
  bot.answerCallbackQuery(query.id);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', anonymous: true });
});

app.listen(process.env.PORT, () => {
  console.log('Anonymous bot running on phone setup');
});
