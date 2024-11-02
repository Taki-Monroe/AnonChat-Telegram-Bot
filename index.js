const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');

const token = '6080867240:AAGK01RDJxRuYxfrN6nTSb7pFggo4A3SQrM';

const bot = new TelegramBot(token, { polling: true });

// Import command handlers
const createAccount = require('./commands/createAccount')(bot);
const sendRequest = require('./commands/sendRequest')(bot);
const acceptRequest = require('./commands/acceptRequest')(bot);
const sendMessage = require('./commands/sendMessage')(bot);
const dismissPair = require('./commands/dismissPair')(bot);
const getAccountInfo = require('./commands/getAccountInfo')(bot);
const changeAccountInfo = require('./commands/changeAccountInfo')(bot);
const deleteAccount = require('./commands/deleteAccount')(bot);

const app = express();
app.use(bodyParser.json());

app.post('/sendToUser', async (req, res) => {
  const { uid, message } = req.body;
  if (!uid || !message) return res.status(400).send('Bad Request');

  try {
    await bot.sendMessage(uid, message);
    return res.status(200).json({ message: 'Message sent successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
});

bot.onText(/\/uid/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `Your User ID is: ${chatId}`)
    .catch((error) => console.error(error));
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Type /help to see all available commands.')
    .catch((error) => console.error(error));
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = 'Available commands:\n' +
    '/create - Create an AnonChat account\n' +
    '/ac - Send a message\n' +
    '/pair - Pair with a partner\n' +
    '/sendreq - Send a pairing request\n' +
    '/dismiss - Dismiss your current pair\n' +
    '/delete - Delete your account\n' +
    '/change - Change your name, username, or passkey\n' +
    '/info - View your account information\n';

  bot.sendMessage(chatId, helpMessage)
    .catch((error) => console.error(error));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));

bot.on('message', (msg) => {
  console.log(`Received message: ${msg.text}`);
});

bot.on('polling_error', (error) => {
  console.error(error);
});

console.log('Bot is running...');