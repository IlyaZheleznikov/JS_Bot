require("dotenv").config();
const { Bot, GrammyError, HttpError, Keyboard } = require("grammy");
const axios = require("axios");

const bot = new Bot(process.env.BOT_TOKEN);

const geo = new Keyboard()
  .requestLocation("Мне нужна геолокация!!!")
  .resized(true)
  .oneTime();

bot.api.setMyCommands([
  {
    command: "start",
    description: "Запускает бота",
  },
]);

bot.command(
  "start",
  async (ctx) =>
    await ctx.reply("Привет, я покажу тебе погоду, скидывай геолокацию", {
      reply_markup: geo,
    })
);

bot.on("message", async (ctx) => {
  if (ctx.message.location) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${ctx.message.location.latitude}&lon=${ctx.message.location.longitude}&appid=${process.env.API_KEY}&units=metric&lang=ru`;
    const response = await axios.get(url);
    await ctx.reply(
      `В ${response.data.name} сейчас ${response.data.main.temp} градусов. Ветер ${response.data.wind.speed} метров в секунду`
    );
    console.log(response);
  } else {
    await ctx.reply("Я тебя не понимаю", {
      reply_markup: geo,
    });
  }
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}`);
  const e = err.error;

  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram or Openweather", e);
  } else {
    console.error("Unknown error", e);
  }
});

bot.start();
