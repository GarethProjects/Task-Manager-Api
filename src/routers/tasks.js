const express = require('express')
const router = new express.Router()
const Task  = require('../models/task')
const auth = require('../middleware/auth')
const User = require('../models/user')


//2nd routing point for task POST request
router.post('/task', auth, async(req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try{
        await task.save()
        res.status(201).send(task)
    }catch(e) {
        res.status(400).send(e)
    }   
})



// New Patch Resource updates the endpoint for all tasks
router.patch('/task/:id', auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['TaskCompleted', 'Description']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
        res.status(400).send({error: 'Invalid updates'})
    }
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
        
        updates.forEach((update) => task [update] = req.body[update])
        await task.save()

    } catch(e){
        res.status(400).send(e)
    }
})



//refactor the code 
//  route for tasks application GET all tasks back using Async-Await
// Using query string we will pass url GET / tasks?TaskCompleted = true or false
router.get('/task',auth, async (req, res) => {
    const match ={}
    const sort = {}
//we set an empty object
    if(req.query.TaskCompleted){
        match.TaskCompleted = req.query.TaskCompleted === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try{
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
                
        }).execPopulate()
        
        res.send(req.user.tasks)
    } catch(e) {
        res.status(400).send()
    }
})


// Route for tasks application get a specific task back for a description Using Async-Await
router.get('/task/:id', auth, async (req, res) => {
    const _id = req.params.id
    try{
        //const task = await Task.findById(_id) we fetch task by findone
        const task = await Task.findOne({_id, owner: req.user._id})

        if(!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})


//Endpoint for Deleting Tasks based on id
router.delete('/task/:id',auth, async(req, res) => {
    try{
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})

        if(!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch(e) {
        res.status(500).send(e)
    }
})


module.exports = router

