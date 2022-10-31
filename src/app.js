const db = require('./db.js');
const mongoose = require('mongoose');
const Review = mongoose.model('Review');
const express = require('express');
const app = express();
const session = require('express-session');
const path = require('path');

const sessionOptions = { 
    secret: 'secret for signing session id', 
    saveUninitialized: false, 
    resave: false 
};

app.use(session(sessionOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req,res,next) => {
	console.log("Method: " + req.method + "\n" + "Path: " + req.path + "\n" + JSON.stringify(req.query));
	next();
});

app.use(function(req, res, next) {
    res.locals.user = req.user;
    if (req.session.pageVisits === undefined) {
        req.session.pageVisits = 1;
    } 
    else {
        req.session.pageVisits++;
    }
    next();
});

app.use((req, res, next) => {
    console.log("The Cookie header contains:\n", req.get('cookie'));
    next();
});

app.set('view engine', 'hbs');

app.get('/', (req, res) => {
    const review = {};
    if (req.query.yearQ) {
        review.year = req.query.yearQ;
    }
    if (req.query.semesterQ) {
        review.semester = req.query.semesterQ;
    }
    if (req.query.professorQ) {
        review.professor = req.query.professorQ;
    }
    Review.find(review, (err, reviews, count) => {
        if (err) {
            console.log(err);
        }
        res.render('home', {review: reviews, pageVisits: req.session.pageVisits});
    });
});

app.get('/reviews/add', (req,res) => {
    res.render('add', {pageVisits: req.session.pageVisits});
});

app.post('/reviews/add', (req, res) => {
    const addReview = new Review ({
        courseNumber: req.body.courseNumber, 
        courseName: req.body.courseName, 
        semester: req.body.semester, 
        year: req.body.year, 
        professor: req.body.professor, 
        review: req.body.review,
    });
    addReview.save((err, addReview) => {
        if (err){
            console.log(err);
        } 
        else if (req.session.myReviews === undefined){
            req.session.myReviews = [];
            req.session.myReviews.push(addReview);
        } 
        else {
            req.session.myReviews.push(addReview);
        }
        res.redirect('/');
    });
});

app.get('/reviews/mine', (req, res) => {
    let reviews = [];
    if (req.session.myReviews) {
        reviews = req.session.myReviews;
    }
    res.render('myreviews', {review: reviews, pageVisits: req.session.pageVisits}); 
});



app.listen(3000);