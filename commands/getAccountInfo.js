const axios = require('axios');

module.exports = function(bot) {
  bot.onText(/\/info/, async (msg) => {
    const chatId = msg.chat.id.toString(); // Convert chatId to string

    const url = `https://anonchat.xaviabot.repl.co/menu/account?uid=${chatId}`;
    
    try {
      const response = await axios.get(url);
      const accountInfo = response.data;

      if (accountInfo.success) {
        let message = `Name: ${accountInfo.name}\nAnonChat Username: ${accountInfo.anonchat_username}`;

        if (accountInfo.pairing_partner) {
          message += `\nPairing Partner:\n  Name: ${accountInfo.pairing_partner.name}\n  AnonChat Username: ${accountInfo.pairing_partner.anonchat_username}`;
        }

        return bot.sendMessage(chatId, message);
      } else {
        // Display the response message if it exists, or a default error message
        return bot.sendMessage(chatId, accountInfo.message || 'Failed to retrieve account information');
      }
    } catch (error) {
      console.error(error);
      return bot.sendMessage(chatId, 'Error retrieving account information');
    }
  });
};
