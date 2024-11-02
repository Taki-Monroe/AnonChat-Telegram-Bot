const axios = require('axios');
const config = require('../config');

module.exports = function(bot) {
  bot.onText(/\/ac(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id.toString(); // Convert chatId to string
    const message = match[1];

    if (!message) {
      bot.sendMessage(chatId, 'Please include a message.');
      return;
    }

    const url = 'https://anonchat.xaviabot.repl.co/send_message';
    const data = {
      uid: chatId,
      agent_username: config.agent_username,
      message: message
    };

    try {
      const response = await axios.post(url, data);
      if (response.data && response.data.success) {
        bot.sendMessage(chatId, 'Sent successfully.');
      } else {
        // Display the response message if it exists, or a default error message
        bot.sendMessage(chatId, response.data.message || 'Error sending message');
      }
    } catch (error) {
      console.error(error);
      // Display the error message if it exists, or a default error message
      bot.sendMessage(chatId, error.message || 'Error sending message');
    }
  });
};