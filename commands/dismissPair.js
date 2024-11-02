const sendPostRequest = require('../utils/sendPostRequest');

module.exports = function(bot) {
  const waitingFor = {};

  bot.onText(/\/dismiss$/, async (msg) => {
    const chatId = msg.chat.id.toString(); // Convert chatId to string

    // Ask for the passkey
    bot.sendMessage(chatId, "What is your passkey?");
    waitingFor[chatId] = 'passkey';
  });

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id.toString(); // Convert chatId to string
    const waitingForType = waitingFor[chatId];

    if (waitingForType === 'passkey') {
      // Send dismiss pair request with the entered passkey
      const passkey = msg.text;

      const url = 'https://anonchat.xaviabot.repl.co/dismiss_pair/dismiss';
      const data = {
        uid: chatId,
        passkey: passkey
      };

      try {
        const result = await sendPostRequest(url, data);

        if (result && result.success) {
          bot.sendMessage(chatId, result.message);
        } else {
          // Display the response message if it exists, or a default error message
          bot.sendMessage(chatId, result.message || 'Error dismissing pair');
        }
      } catch (error) {
        // Display the error message if it exists, or a default error message
        bot.sendMessage(chatId, error.message || 'Error dismissing pair');
      }

      // Reset waitingFor state
      delete waitingFor[chatId];
    }
  });
};
