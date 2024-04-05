const path = require('path');
const express = require('express');
const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog');
const cookieParser = require('cookie-parser');

const Blog = require('./models/blog');

const app = express();
const PORT = 8000;
const mongoose = require('mongoose');
const { checkAuthenticationCookie } = require('./middlewares/authentication');


// mongoose.connect('mongodb://localhost:27017/blogcoast')
//     .then(e => console.log('MongoDB Connected'));

const pass = "BKsxhcGF1mIfxyUF";
const collection_name = "blogcoast";
const mongo = `mongodb+srv://amanchaurasiya783:${pass}@cluster0.hni5ok7.mongodb.net/${collection_name}?retryWrites=true&w=majority`;
mongoose.connect(mongo, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
})
    .then(e => console.log('MongoDBAtlas Connected'));

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.resolve('./public')));
app.use(checkAuthenticationCookie('token'));
app.use('/user', userRoute);
app.use('/blog', blogRoute);

app.get('/', async (req, res) => {
    const allBlogs = await Blog.find({})
    res.render('home', {
        user: req.user,
        blogs: allBlogs
    });
})

app.listen(PORT, () => console.log('Server started at PORT : ', PORT));