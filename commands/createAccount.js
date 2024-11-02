const sendPostRequest = require('../utils/sendPostRequest');
const config = require('../config');

module.exports = function(bot) {
  const waitingFor = {};

  bot.onText(/\/create$/, async (msg) => {
    const chatId = msg.chat.id.toString(); // convert chatId to string

    // Ask for name
    bot.sendMessage(chatId, 'What is your name?');
    waitingFor[chatId] = 'name';
  });

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id.toString(); // convert chatId to string
    const waitingForType = waitingFor[chatId];

    if (waitingForType === 'name') {
      // Save name and ask for passkey
      waitingFor[chatId] = 'passkey';
      waitingFor[`${chatId}_name`] = msg.text;
      bot.sendMessage(chatId, 'What is your passkey?');
    } else if (waitingForType === 'passkey') {
      // Send POST request with name and passkey
      const name = waitingFor[`${chatId}_name`];
      const passkey = msg.text;

      const url = 'https://anonchat.xaviabot.repl.co/create_account';
      const data = {
        uid: chatId,
        name: name,
        passkey: passkey,
        agent_username: config.agent_username
      };

      try {
        const result = await sendPostRequest(url, data);

        if (result && result.success) {
          const message = `AnonChat account created for ${name}. Your username is ${result.anonchat_username}.`;
          bot.sendMessage(chatId, message);
        } else {
          bot.sendMessage(chatId, result.message || 'Error creating account');
        }

        // Reset waitingFor state
        delete waitingFor[chatId];
        delete waitingFor[`${chatId}_name`];
      } catch (error) {
        // Handle any errors that occurred while sending the POST request
        bot.sendMessage(chatId, `An error occurred: ${error.message}`);
      }
    }
  });
};
