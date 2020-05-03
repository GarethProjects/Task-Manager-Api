const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    userFindAndModify: false
})


// const newTask = new Task({
//     Description: 'take out the garbage!!!'
//     //TaskCompleted: 
// })

// newTask.save().then(() =>{
//     console.log(newTask)
// }).catch(() => {
//     console.log(error)
// })





//validate(value){
//if (value.includes("password"){
//throw new Error('Users Password contains password')

// if (value.length <6 || value.includes("password")){
//     throw new Error('Password is too small or it includes the word password')