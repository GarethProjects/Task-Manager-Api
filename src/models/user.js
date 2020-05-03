const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain word "Password" ')
            }
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be greater than one')
            }
        }
    }, //we add new features here
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }], //array of objects
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

//creating a virtual relationship
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// Create a method to only show the user the data we want to show and not show
userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}


// create a jwt token for the user --instance methods
userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()


    return token
}


// Find a user by their credentials method --model moethds
userSchema.statics.findByCredentials = async(email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('unable to login')
    }
    //Now we want to check the password is correct
    const isPasswordMatch = await bcrypt.compare(password, user.password)

    if (!isPasswordMatch) {
        throw new Error('unable to login')
    }

    return user
}



// Hash the plain text password before saving
userSchema.pre('save', async function(next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// Delete user Tasks when the user is deleted
userSchema.pre('remove', async function(next) {
    const user = this
    await Task.deleteMany({ owner: user._id })

    next()
})


const User = mongoose.model('User', userSchema)


// // const me = new User({
// //     name: '    Paul       ',
// //     password: '        re32           ',
// //     age: 20,
// //     email: 'NEWEMAIL@New.com      '
// //    // age: 30
// // })
// //save data to the mongodb
// me.save().then(() =>{
//     console.log(me)
// }).catch((error) => {
//     console.log(error)
// })

module.exports = User