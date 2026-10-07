import dotenv from 'dotenv'
import app from './src/app.js'
import connectDB from './src/config/db.js'

dotenv.config()

connectDB()

const PORT = process.env.PORT

app.listen(PORT, ()=>{
    console.log(`server is running on localhost:${PORT}`)
})