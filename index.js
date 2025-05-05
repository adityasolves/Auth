import express from "express"
import dotenv from "dotenv"
import cors from "cors";
import db from "./utils/db.js"
import cookieParser from "cookie-parser";
import userRoutes from './routes/user.route.js'

const app = express();
app.use(cookieParser());
dotenv.config()
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

db()

const port = process.env.PORT || 4000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/api/v1/users', userRoutes)


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

