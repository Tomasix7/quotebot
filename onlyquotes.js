const TelegramBot = require('node-telegram-bot-api');  
const axios = require('axios');  
const cron = require('node-cron');

// Замените 'YOUR_BOT_TOKEN' на токен вашего бота  
const bot = new TelegramBot('6758936853:AAHRu5q5Jg5ddxmwfzOYzSsRuWD0LtS2xco', {polling: true});

// ID чата, куда бот будет отправлять цитаты  
const CHAT_ID = '514396790';

// Функция для получения случайной цитаты  
async function getRandomQuote() {  
try {  
const response = await axios.get('https://api.quotable.io/random');
console.log(`"${response.data.content}" - ${response.data.author}`);  
return `"${response.data.content}" - *${response.data.author}*`;  
} catch (error) {  
console.error('Ошибка при получении цитаты:', error);  
return 'Извините, не удалось получить цитату.';  
}  
}

// Функция для отправки цитаты в чат  
async function sendQuote() {  
const quote = await getRandomQuote();  
bot.sendMessage(CHAT_ID, quote);  
}

// Запуск задачи по расписанию (каждый день в 9:00)  
cron.schedule('1 5 * * *', () => {  
sendQuote();  
});

console.log('Бот запущен и будет отправлять цитаты по расписанию.');
