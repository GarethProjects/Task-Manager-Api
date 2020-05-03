const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { SendWelcomeEmail, sendCancelEmail } = require('../email/account')

// New router for login users
router.post('/users/login', async(req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken() //on the user instance not User.model
        res.send({ user, token })

    } catch (e) {
        res.status(400).send()
    }

})

// Route for users uploading their profile image to the server
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload either a jpg, jpeg, or png file'))
        }
        cb(undefined, true)
    }
})

// Router for setting up a profile pic
router.post('/users/me/avatar', auth, upload.single('avatar'), async(req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer //now we want to save the user and the new file 
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})


//New route for accessing the users avatar from the browser
router.get('/users/:id/avatar', async(req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)

    } catch (e) {
        res.status(404).send()
    }
})

// New route for logging the user out of our application
router.post('/users/logout', auth, async(req, res) => {
    try {
        // we will filter the tokens array
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()

        res.send()


    } catch (e) {
        res.status(500).send()

    }
})


// New route for logging out all users/wiping all tokens (e.g. Netflix)
router.post('/users/logoutAll', auth, async(req, res) => {
    try {
        req.user.tokens = []

        await req.user.save()

        res.send()

    } catch (e) {
        res.status(500).send()
    }

})

// route testing Changed to async-await
router.post('/users', async(req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        SendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })



    } catch (e) {
        res.status(400).send()
    }
})



// New Patch Endpoint updates a resource for users 
router.patch('/users/me', auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'age', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid Updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()

        //const user = await User.findByIdAndUpdate(req.params.id, req.body,{new: true, runValidators:true
        res.send(req.user)

    } catch (e) {
        res.status(400).send(e)
    }
})

// ? not sure about this route?
router.get('/users/me', auth, async(req, res) => {
    res.send(req.user)
})


// Endpoint for delete users 
router.delete('/users/me', auth, async(req, res) => {
    //try {
    req.user.remove()
    await res.send(req.user)
        //} catch (e) {
        //res.status(500).send()

})

// Delete route for the users avatar 
router.delete('/users/me/avatar', auth, async(req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})


module.exports = router