const {Telegraf, session, Scenes: { BaseScene, Stage }, Markup } = require('telegraf');
const Trainee = require('./models/Trainee.js');
const Score = require('./models/Score.js');
const mongoose = require('mongoose');

const bot = new Telegraf('1984465282:AAE7uX3q3d8GE8eYARJxo3_typJnKhdqDxg');

bot.start(async (ctx) => {
    try {
        await mongoose.connect('mongodb://localhost:27017/myFirstTelegramBot', {
            useNewUrlParser: true,
            useFindAndModify: false,
        });
        ctx.reply('sup');
    } catch (e) {
        ctx.reply(e);
    }
});


//Определяю кнопки при вызове /trainees
const trainees_display_menu = Markup.inlineKeyboard([
    Markup.button.callback('Show all', 'showall'),
    Markup.button.callback('Front-end', 'frontend'),
    Markup.button.callback('Back-end', 'backend'),
    Markup.button.callback('Testers', 'tester'),
]);


//Сцена для отображения списка стажеров
const traineeScene = new BaseScene('traineeScene');
traineeScene.enter(ctx => ctx.reply('Which trainees to show: ', trainees_display_menu));
traineeScene.action('showall', async ctx => {
    // const promise = ctx.callbackQuery.data = 'showall' ? Trainee.find({}).exec() : Trainee.find({role: ctx.callbackQuery.data}).exec();
    const promise = Trainee.find().exec();
    let keyboard;
    let buttons = [];
    promise.then(function(tr){
        tr.forEach(function(trt){
            buttons.push(Markup.button.callback(trt.name + ', ' + trt.surname, 'eval_' + trt.name + '_' + trt.surname));
        });
        keyboard = Markup.inlineKeyboard(buttons);
        ctx.reply('Trainees: ', keyboard);
    });
});
traineeScene.action('frontend', async ctx => {
    // const promise = ctx.callbackQuery.data = 'showall' ? Trainee.find({}).exec() : Trainee.find({role: ctx.callbackQuery.data}).exec();
    const promise = Trainee.find({role:'frontend'}).exec();
    let keyboard;
    let buttons = [];
    promise.then(function(tr){
        tr.forEach(function(trt){
            buttons.push(Markup.button.callback(trt.name + ', ' + trt.surname, 'eval_' + trt.name + '_' + trt.surname));
        });
        keyboard = Markup.inlineKeyboard(buttons);
        ctx.reply('Trainees: ', keyboard);
    });
});
traineeScene.action('backend', async ctx => {
    // const promise = ctx.callbackQuery.data = 'showall' ? Trainee.find({}).exec() : Trainee.find({role: ctx.callbackQuery.data}).exec();
    const promise = Trainee.find({role:'backend'}).exec();
    let keyboard;
    let buttons = [];
    promise.then(function(tr){
        tr.forEach(function(trt){
            buttons.push(Markup.button.callback(trt.name + ', ' + trt.surname, 'eval_' + trt.name + '_' + trt.surname));
        });
        keyboard = Markup.inlineKeyboard(buttons);
        ctx.reply('Trainees: ', keyboard);
    });
});
traineeScene.action('tester', async ctx => {
    // const promise = ctx.callbackQuery.data = 'showall' ? Trainee.find({}).exec() : Trainee.find({role: ctx.callbackQuery.data}).exec();
    const promise = Trainee.find({role:'tester'}).exec();
    let keyboard;
    let buttons = [];
    promise.then(function(tr){
        tr.forEach(function(trt){
            buttons.push(Markup.button.callback(trt.name + ', ' + trt.surname, 'eval_' + trt.name + '_' + trt.surname));
        });
        keyboard = Markup.inlineKeyboard(buttons);
        ctx.reply('Trainees: ', keyboard);
    });
});

//Сцена для добавления стажеров
const addTraineeScene = new BaseScene('addTraineeScene');
addTraineeScene.enter(ctx => ctx.reply('Напишите имя, фамиля, должность, и как хорошо ты знаешь свою ролль от 0 до 10: '));
addTraineeScene.on('text', async ctx => {
    // if (ctx.message.text = '/exit'){
    //     ctx.reply('Trainee has not been added');
    //     ctx.scene.leave();
    // }
    const names = ctx.message.text.replace(/ /g,'').split(',');
    try {
        const trainee = new Trainee({
            name: names[0],
            surname: names[1],
            role: names[2],
            score: score[3]
        });
        await trainee.save();
        ctx.reply('Trainee has been added');
    } catch(e) {
        ctx.reply(e.toString());
    }
});


let traineeName;
let traineeSurname;


//Начальная сцена проверки. Искользуется для выбора стажера для проверки
const evalScene = new BaseScene('evalScene');
evalScene.enter(ctx => ctx.reply('Enter the name of the evaluated trainee: '));
evalScene.on('callback_query', ctx => {
    traineeName = ctx.callbackQuery.data.split('_')[1];
    traineeSurname = ctx.callbackQuery.data.split('_')[2];
    ctx.scene.enter('uiuxscoring');
});
evalScene.leave();


let totalScore = 0;


//Сцена выставления баллов за ui/ux
const uiuxscoring = new BaseScene('uiuxscoring');
uiuxscoring.enter(ctx => ctx.reply('Enter ui/ux score (0-100): '));
uiuxscoring.on('text', ctx => {
    // if (ctx.message.text = '/exit'){
    //     ctx.reply('Left the evaluation');
    //     ctx.scene.leave();
    // }
    if (Number(ctx.message.text) > 0 && Number(ctx.message.text) < 100){
        totalScore += Number(ctx.message.text);
        ctx.scene.enter('codescoring');
    }
    else {
        ctx.reply('Invalid number');
        totalScore = 0;
        ctx.scene.leave();
    }
});


//Сцена выставления баллов за код
const codescoring = new BaseScene('codescoring');
codescoring.enter(ctx => ctx.reply('Enter coding score (0-100): '));
codescoring.on('text', ctx => {
    // if (ctx.message.text = '/exit'){
    //     ctx.reply('Left the evaluation');
    //     ctx.scene.leave();
    // }
    if (Number(ctx.message.text) > 0 && Number(ctx.message.text) < 100){
        totalScore += Number(ctx.message.text);
        ctx.scene.enter('finalscoring');
    }
    else {
        ctx.reply('Invalid number');
        totalScore = 0;
        ctx.scene.leave();
    }
});


//Сцена выставления баллов за какую-нибудь третью категорию (нет, не придумал)
const finalscoring = new BaseScene('finalscoring');
finalscoring.enter(ctx => ctx.reply('Enter the last score (0-100): '));
finalscoring.on('text', async ctx => {
    // if (ctx.message.text = '/exit'){
    //     ctx.reply('Left the evaluation');
    //     ctx.scene.leave();
    // }
    if (Number(ctx.message.text) > 0 && Number(ctx.message.text) < 100) {
        totalScore += Number(ctx.message.text);
        ctx.scene.enter('endscoring');
        // const score = new Score({
        // trainee_name: traineeName,
        // trainee_surname: traineeSurname,
        // trainee_score: totalScore
        // });
        // await score.save();
        // ctx.reply(`${traineeName}'s total score is ` + totalScore.toString());
        // totalScore = 0;
        // traineeName = '';
        // ctx.scene.leave();
    } else {
        ctx.reply('Invalid number');
        totalScore = 0;
        ctx.scene.leave();
    }
});

const endscoring = new BaseScene('endscoring');
endscoring.on('text', async ctx => {
    if (ctx.message.text = '/endeval'){
        const score = new Score({
            trainee_name: traineeName,
            trainee_surname: traineeSurname,
            trainee_score: totalScore
            });
        await score.save();
        ctx.reply(`${traineeName}'s total score is ` + totalScore.toString());
        totalScore = 0;
        traineeName = '';
        ctx.scene.leave();
    }
})


//Сцена для просмотра истории проверок
const evalHistory = new BaseScene('evalHistory');
evalHistory.enter(ctx => {
    const promise = Score.find({}).sort({createdAt: -1}).exec();
    promise.then(function(trainees){
        trainees.forEach(function(trainee){
            ctx.reply(trainee.trainee_name + ', ' + trainee.trainee_surname + ', Score: ' + trainee.trainee_score + ', Date: ' + trainee.createdAt);
        });
    });
    ctx.scene.leave();
});


const stage = new Stage([traineeScene, evalScene, addTraineeScene, uiuxscoring, codescoring, finalscoring, evalHistory, endscoring]);


bot.use(session());
bot.use(stage.middleware());
bot.command('/trainees', ctx => ctx.scene.enter('traineeScene'));
bot.command('/add', ctx => ctx.scene.enter('addTraineeScene'));
bot.command('/history', ctx => ctx.scene.enter('evalHistory'));
bot.command('/eval', ctx => ctx.scene.enter('evalScene'));
bot.launch();