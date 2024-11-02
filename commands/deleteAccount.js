const axios = require('axios');
const config = require('../config');

module.exports = function(bot) {
  const waitingFor = {};

  bot.onText(/\/delete/, async (msg) => {
    const chatId = msg.chat.id.toString(); // Convert chatId to string

    // Ask for the passkey
    bot.sendMessage(chatId, 'To confirm account deletion, please enter your passkey.');
    waitingFor[chatId] = 'passkey';
  });

  bot.on('message', async (reply) => {
    const chatId = reply.chat.id.toString(); // Convert chatId to string
    const waitingForType = waitingFor[chatId];

    if (waitingForType === 'passkey' && reply.text) {
      const passkey = reply.text.trim();

      const url = 'https://anonchat.xaviabot.repl.co/menu/delete-account';
      const data = {
        uid: chatId,
        passkey: passkey
      };

      try {
        const response = await axios.put(url, data);
        const result = response.data;

        if (result && result.success) {
          bot.sendMessage(chatId, result.message);
        } else {
          bot.sendMessage(chatId, result.message || 'Error deleting account');
        }
      } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, error.message || 'Error deleting account');
      }

      // Reset waitingFor state
      delete waitingFor[chatId];
    }
  });
};