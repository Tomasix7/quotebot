const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cron = require('node-cron');

// Использование переменных окружения
const bot = new TelegramBot(process.env.ROONEYKEY, {polling: true});
const CHAT_ID = process.env.CHATID;
const UNSPLASH_ACCESS_KEY = process.env.UNSKEY;

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

// Функция для отправки цитаты
async function sendQuote() {
  try {
    const quote = await getRandomQuote();
    await bot.sendMessage(CHAT_ID, quote);
    console.log('Цитата отправлена успешно');
  } catch (error) {
    console.error('Ошибка при отправке цитаты:', error);
    bot.sendMessage(CHAT_ID, 'Извините, произошла ошибка при отправке цитаты.');
  }
}

// Функция для отправки изображения
async function sendImage() {
  try {
    const image = await getRandomImage();
    if (image) {
      await bot.sendPhoto(CHAT_ID, image.url, {
        caption: image.description
      });
      console.log('Изображение отправлено успешно');
    } else {
      bot.sendMessage(CHAT_ID, 'Извините, не удалось получить изображение.');
    }
  } catch (error) {
    console.error('Ошибка при отправке изображения:', error);
    bot.sendMessage(CHAT_ID, 'Извините, произошла ошибка при отправке изображения.');
  }
}

// Расписание для отправки цитат (каждый день в 9:00)
cron.schedule('0 9 * * *', sendQuote);

// Расписание для отправки изображений
cron.schedule('45 7 * * *', sendImage);  // 7:45
cron.schedule('15 12 * * *', sendImage); // 12:15
cron.schedule('45 17 * * *', sendImage); // 17:45
cron.schedule('15 20 * * *', sendImage); // 20:15

console.log('Бот запущен и будет отправлять цитаты и изображения по расписанию.');

// Обработка ошибок для предотвращения падения бота
bot.on('polling_error', (error) => {
  console.error('Ошибка поллинга:', error);
});

// Простая команда для проверки работоспособности бота
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Бот работает и готов отправлять цитаты и изображения по расписанию!');
});
