const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const Blog = require('../models/blog');

const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(`./public/uploads`));
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage });

router.get('/addnew', async (req, res) => {
    return res.render('addblog', {
        user: req.user
    })
})

router.post('/', upload.single('coverImage'), async (req, res) => {
    const { title, body } = req.body;
    const blog = await Blog.create({
        body,
        title,
        createdBy: req.user._id,
        coverImageURL: `uploads/${req.file.filename}`,
    })
    return res.redirect(`/blog/${blog._id}`);
})


router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).send('Blog Not Found');
        }

        return res.render('blog', {
            user: req.user,
            blog
        })
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
})

module.exports = router;