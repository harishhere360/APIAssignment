
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


const app = express();


app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/tambula', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });


const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});


const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ticketNumber: { type: String, required: true },
});


const User = mongoose.model('User', userSchema);
const Ticket = mongoose.model('Ticket', ticketSchema);


app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }



    return res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/tickets', async (req, res) => {
  const { userId, numOfTickets } = req.body;

  try {
    
    const tickets = [];
    for (let i = 0; i < numOfTickets; i++) {
      const newTicket = new Ticket({
        userId,
        ticketNumber: 'Generated Ticket Number',
      });
      const savedTicket = await newTicket.save();
      tickets.push(savedTicket);
    }

    return res.status(200).json({ message: 'Tickets created successfully', tickets });
  } catch (error) {
    console.error('Ticket creation error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/tickets', async (req, res) => {
  const { userId, page, limit } = req.query;

  try {
    
    const tickets = await Ticket.find({ userId })
      .skip(page * limit)
      .limit(limit);

    return res.status(200).json({ tickets });
  } catch (error) {
    console.error('Ticket fetch error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(27017, () => {
  console.log('Server started on port 27017');
});
