const axios = require('axios');

module.exports = function(bot) {
  const waitingFor = {};

  bot.onText(/\/change/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'What do you want to change? Reply with name/username/passkey.');

    waitingFor[chatId] = { type: 'changeType' };
  });

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const waitingForType = waitingFor[chatId] && waitingFor[chatId].type;

    if (waitingForType === 'changeType') {
      const changeType = msg.text.toLowerCase();

      if (!['name', 'username', 'passkey'].includes(changeType)) {
        bot.sendMessage(chatId, 'Invalid option. Please reply with name, username or passkey.');
        return;
      }

      bot.sendMessage(chatId, `Reply with your new ${changeType}.`);

      waitingFor[chatId] = { type: 'newValue', changeType };
    } else if (waitingForType === 'newValue') {
      const newValue = msg.text;
      const changeType = waitingFor[chatId].changeType;

      bot.sendMessage(chatId, 'Reply with your passkey.');

      waitingFor[chatId] = { type: 'passkey', changeType, newValue };
    } else if (waitingForType === 'passkey') {
      const passkey = msg.text;
      const uid = chatId.toString();
      const { changeType, newValue } = waitingFor[chatId];

      const data = {
        uid,
        passkey
      };

      if (changeType === 'name') {
        data.newName = newValue;
      } else if (changeType === 'username') {
        data.newUsername = newValue;
      } else if (changeType === 'passkey') {
        data.newPasskey = newValue;
      }

      const url = 'https://anonchat.xaviabot.repl.co/menu/change';

      try {
        const response = await axios.put(url, data);
        const result = response.data;

        if (result && result.success) {
          bot.sendMessage(chatId, `Account ${changeType} changed successfully.`);
        } else {
          bot.sendMessage(chatId, `Error changing account ${changeType}: ${result.message}`);
        }
      } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, 'Error changing account. Please try again.');
      }

      delete waitingFor[chatId];
    }
  });
};