const express = require('express')
require('./db/mongoose') //we require mongoose to connect to the db
const User = require('./models/user')
const Task = require('./models/task')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/tasks')

const app = express()
const port = process.env.PORT

// Express to parse incoming data to json
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.listen(port, () => {
    console.log('Server is up and running! on port ' + port)
})