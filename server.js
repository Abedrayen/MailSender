const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { EventEmitter } = require('events');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const eventBus = new EventEmitter();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/send-email', (req, res) => {
  const userEmail = req.query.email;
  const productName = req.query.product;

  eventBus.emit('sendEmail', userEmail, productName);

  res.send('Email sending process initiated!');
});

eventBus.on('sendEmail', (userEmail, productName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: [userEmail, process.env.EMAIL_USER],
    subject: `Thank you for clicking on ${productName}!`,
    text: `From Rayen Abed the owner of ChessBoard Store and the best chess player ever, We appreciate your interest in ${productName}.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      eventBus.emit('sendEmailError', userEmail);
    } else {
      console.log('Email sent:', info.response);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
