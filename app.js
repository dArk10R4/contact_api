require('dotenv').config();
const express = require("express");
const setRateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");

const app = express();


/**
 * Mongoose section
 */
const mongoose = require("mongoose");

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(
    process.env.MONGO_DB_URI
  );
}

const messageSchema = mongoose.Schema({
  name: String,
  email: { type: String, required: true },
  message: String,
  phone: String,
  subject: String,
}, {
  timestamps: true
});

const Message = mongoose.model("Message", messageSchema);

const newsSchema = mongoose.Schema({
  email: { type: String, required: true },
}, {
  timestamps: true
});

const News = mongoose.model("News", newsSchema);

const rateLimitMiddleware = setRateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: {"error":"You have exceeded your 5 requests per minute limit."},
    headers: true,
  });



/**
 * middvares
 */
app.set('trust proxy', 3)
app.use(cors())
app.use(helmet())
app.use(rateLimitMiddleware)
app.use(express.json());





/**
 * custom functions
 */




let isString = value => typeof value === 'string' || value instanceof String;
function containsSpecialChars(str) {
  const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  return specialChars.test(str);
}

function isEmail(str) {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return emailRegex.test(str);
}

function isPhone(str) {
  const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g;
  return phoneRegex.test(str);
}


/**
 * app routes
 */
app.post("/contact", async (req, res) => {
  const { name, email, message, phone, subject } = req.body.data;
  console.log(req.body)
  if (name) {
    if (!(isString(name)))
      return res.status(400).json({ error: "name must be a string" });
    if (containsSpecialChars(name))
      return res
        .status(400)
        .json({ error: "name can't contain special character" });
  }

  if (email) {
    if (!(isString(email)))
      return res.status(400).json({ error: "email must be a string" });
    if (!isEmail(email))
      return res.status(400).json({ error: "invalid email format" });
  }
  if (message && !(isString(message)))
    return res.status(400).json({ error: "message must be a string" });
  if (phone) {
    if (!(isString(phone)))
      return res.status(400).json({ error: "phone must be a string" });
    if (!isPhone(phone))
      return res.status(400).json({ error: "invalid phone format" });
  }
  const new_message = new Message({
    name,
    email,
    message,
    phone,
    subject,
  });

  try {
    await new_message.save();
    console.log(`inserted with email : ${email}`)
    res.status(201).send({});
  } catch (e) {
    if (e.name === "ValidationError") {
      let errors = {};

      Object.keys(e.errors).forEach((key) => {
        errors[key] = e.errors[key].message;
      });
      return res.status(400).send({"error":errors});
    }

    console.log(e);
    return res.status(504).send({"error":"something get bad"});
  }
});

app.post("/news", async (req, res) => {
  const { email } = req.body.data;
  console.log(req.body)
  if (email) {
    if (!(isString(email)))
      return res.status(400).json({ error: "email must be a string" });
    if (!isEmail(email))
      return res.status(400).json({ error: "invalid email format" });
  }

  const new_news = new News({
    email,
  });

  try {
    await new_news.save();
    console.log(`inserted with email : ${email}`)
    res.status(201).send({});
  } catch (e) {
    if (e.name === "ValidationError") {
      let errors = {};

      Object.keys(e.errors).forEach((key) => {
        errors[key] = e.errors[key].message;
      });
      return res.status(400).send({"error":errors});
    }

    console.log(e);
    return res.status(504).send({"error":"something get bad"});
  }
});

app.get("/hello", (req, res) => {
  res.send("Hello");
});

module.exports = app;
