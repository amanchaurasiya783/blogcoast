const { createHmac, randomBytes } = require('crypto');
const { Schema, model } = require('mongoose');
const { createTokenForUser } = require('../services/auth');
const userSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    salt: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    profileImageURL: {
        type: String,
        default: "/images/default.png"
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    }
}, {
    timestamps: true
});

// encrypting User Password Before Saving to DB
userSchema.pre('save', function (next) {
    const user = this;

    if (!user.isModified('password')) return;

    const salt = randomBytes(16).toString();
    const hash = createHmac('sha256', salt)
        .update(user.password)
        .digest('hex');
    this.salt = salt;
    this.password = hash;

    next();

})

// encrypting User Entered Password and Matching
userSchema.static('matchPasswordAndGenerateToken', async function (email, password) {
    const userExist = await this.findOne({ email });
    if (!userExist) throw new Error('User Not Found!');
    const salt = userExist.salt;
    const hashedPassword = userExist.password;
    const userProvidedPassowrd = createHmac('sha256', salt).update(password).digest('hex');
    if (hashedPassword !== userProvidedPassowrd) throw new Error('Incorrect Password');

    const token = createTokenForUser(userExist);
    return token;
})

const User = model('users', userSchema);

module.exports = User;