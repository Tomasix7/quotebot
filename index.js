const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cron = require('node-cron');

// Использование переменных окружения
const bot = new TelegramBot(process.env.ROONEYKEY, {polling: true});
const CHAT_ID = process.env.CHATID;
const UNSPLASH_ACCESS_KEY = process.env.UNSKEY;

// debug 1
console.log('Bot started');

// Функция для получения случайной цитаты
async function getRandomQuote() {
  try {
    const response = await axios.get('https://api.quotable.io/random');
    return `"${response.data.content}" - ${response.data.author}`;
  } catch (error) {
    console.error('Ошибка при получении цитаты:', error);
    return 'Извините, не удалось получить цитату.';
  }
}

// Функция для получения случайного изображения
async function getRandomImage() {
  try {
    const response = await axios.get('https://api.unsplash.com/photos/random', {
      params: {
        client_id: UNSPLASH_ACCESS_KEY,
        orientation: 'landscape'
      }
    });
    return {
      url: response.data.urls.regular,
      description: response.data.description || 'Случайное изображение'
    };
  } catch (error) {
    console.error('Ошибка при получении изображения:', error);
    return null;
  }
}

// Функция для отправки цитаты и изображения
async function sendQuoteAndImage() {
  try {
    const quote = await getRandomQuote();
    const image = await getRandomImage();

    if (image) {
      await bot.sendPhoto(CHAT_ID, image.url, {
        caption: `${quote}\n\n${image.description}`
      });
    } else {
      await bot.sendMessage(CHAT_ID, quote);
    }
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
    bot.sendMessage(CHAT_ID, 'Извините, произошла ошибка при отправке сообщения.');
  }
}

// Запуск задачи по расписанию (каждый день в 9:00)
cron.schedule('0 9 * * *', () => {
  sendQuoteAndImage();
});

console.log('Бот запущен и будет отправлять цитаты и изображения по расписанию.');

// Обработка ошибок для предотвращения падения бота
bot.on('polling_error', (error) => {
  console.error('Ошибка поллинга:', error);
});

// Простая команда для проверки работоспособности бота
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Я буду любить тебя ВСЕГДА! ♥️ Твоя Руни');
});
