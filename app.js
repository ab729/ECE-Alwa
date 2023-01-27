require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const User = require('./models/userSchema.js');


mongoose.connect(`mongodb+srv://${process.env.db_user}:${process.env.db_password}@cluster0.4zxou.mongodb.net/${process.env.db_name}?retryWrites=true&w=majority`)

let app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

let maxAge = 3*24*60*60;
const createToken= (id) =>{
    return jwt.sign({id}, process.env.secret, {
        expiresIn: maxAge
    })
}

const authValidation = (req, res ,next) =>{
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, 'ape neo', (err, decodedToken)=>{
            if (err) {
                console.log(err.message);
                res.redirect('/sign-in')
            } else {
                next();
            }
        })
    } else {
        res.redirect('/sign-in')
    }
}



app.get('/main/:id', authValidation, (req, res)=>{
    User.findById(req.params.id, (err, data)=>{
        if (err) {
            res.status(404).send("Better luck next time :)");
        } else {
            res.render('main', { pageName: 'main', user: data.username, stage: data.stage, id: data._id});
        }
    });
});

app.get('/sign-in', (req, res)=>{
    
    res.render('sign-in', { pageName: 'Sign in', qs: req.query });
});
app.post('/sign-in', (req, res)=>{
    User.findOne({username: req.body.userName}, (err, data)=>{
        if (!data) {
            res.status(404).redirect('/sign-in?passError=false&userError=true&isCompleted=false');
        } else {
            if (err || data.username === null) {
                res.status(400).send(err);
            } else {
                if (data.password === req.body.Password) {
                    const token = createToken(User._id);
                    res.cookie('jwt', token, { httpOnly: true, maxAge: 1000 * maxAge });
                    res.redirect(`/main/${data._id}`);
                } else {
                    if (data.password != req.body.Password) {
                        res.redirect('/sign-in?passError=true&userError=false&isCompleted=false')
                    }
                }
            }
        }
    });
});
app.get('/sign-up', (req, res)=>{
    res.render('sign-up', {pageName: "Sign up"})
});
app.post('/sign-up', (req, res)=>{
    let user = new User({
        username: req.body.userName,
        password: req.body.Password,
        stage: req.body.satge,
        thirdName: req.body.nameInArabic,
    });
    // const token = createToken(User._id);
    // res.cookie('jwt', token, {httpOnly: true, maxAge: 1000* maxAge});
    user.save().then(res.redirect('/sign-in?passError=false&userError=false&isCompleted=true'));
});


app.get('/main/:id/about-us', (req, res)=>{
    res.render('about-us', {pageName: 'about us'});
});
app.get('/main/:id/bot', (req, res)=>{
    res.render('tobe', { pageName: 'Telegram Bot', icon: 'https://img.icons8.com/fluency/96/null/chatbot.png', projectName: "The bot", phase: "Testing phase"});
});
app.get('/main/:id/Mr-Parabola', (req, res) => {
    res.render('tobe', { pageName: 'Mr. Parabola', icon: '/images/upcoming.png', projectName: "The Game", phase: "Pre-Production stage" });
});


app.listen('3200', ()=>{
    console.log('started listening on port 3200');
});