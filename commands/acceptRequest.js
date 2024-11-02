const sendPostRequest = require('../utils/sendPostRequest');

module.exports = function(bot) {
  const waitingFor = {};

  bot.onText(/\/pair$/, async (msg) => {
    const chatId = msg.chat.id.toString(); // Convert chatId to string

    // Ask for the username of the person to pair with
    bot.sendMessage(chatId, 'Give me the username of the person you want to pair with.');
    waitingFor[chatId] = 'username';
  });

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id.toString(); // Convert chatId to string
    const waitingForType = waitingFor[chatId];

    if (waitingForType === 'username') {
      // Send pairing request with the entered username
      const username = msg.text;

      const url = 'https://anonchat.xaviabot.repl.co/pair_request/accept';
      const data = {
        uid: chatId,
        username: username
      };

      try {
        const result = await sendPostRequest(url, data);

        if (result && result.success) {
          bot.sendMessage(chatId, result.message);
        } else {
          // Display the response message if it exists, or a default error message
          bot.sendMessage(chatId, result.message || 'Error accepting request');
        }
      } catch (error) {
        // Display the error message if it exists, or a default error message
        bot.sendMessage(chatId, error.message || 'Error accepting request');
      }

      // Reset waitingFor state
      delete waitingFor[chatId];
    }
  });
};
