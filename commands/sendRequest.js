const axios = require('axios');
const config = require('../config');

module.exports = function(bot) {
  const waitingFor = {};

  bot.onText(/\/sendreq$/, async (msg) => {
    const chatId = msg.chat.id.toString(); // Convert chatId to string

    // Ask for message
    bot.sendMessage(chatId, 'What message would you like to include with your pairing request?');
    waitingFor[chatId] = 'message';
  });

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id.toString(); // Convert chatId to string
    const waitingForType = waitingFor[chatId];

    if (waitingForType === 'message') {
      // Send pairing request with message
      const message = msg.text;

      const url = 'https://anonchat.xaviabot.repl.co/pair_request/send';
      const data = {
        uid: chatId,
        agent_username: config.agent_username,
        message: message
      };

      try {
        const response = await axios.post(url, data, { timeout: 10000 }); // increase timeout value to 10 seconds
        if (response.data && response.data.success) {
          const pairRequestSent = response.data.pairrequestssent;
          const message = `Pairing request sent.`;
          bot.sendMessage(chatId, message);
        } else {
          // Display the response message if it exists, or a default error message
          bot.sendMessage(chatId, response.data.message || 'Error sending request');
        }
      } catch (error) {
        console.error(error);
        // Display the error message if it exists, or a default error message
        bot.sendMessage(chatId, error.message || 'Error sending request');
      }

      // Reset waitingFor state
      delete waitingFor[chatId];
    }
  });
};
