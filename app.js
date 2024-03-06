const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to MongoDB - Replace <your_connection_string> with your actual connection string
mongoose.connect("mongodb+srv://DerpNerd:KingAlanSanchez2007@globaldatabase.imwknpl.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define user schema and model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model('User', userSchema);

// Initialize Express app
const app = express();
app.use(express.json());
app.use(express.static('public')); // Serve static files from the 'public' directory

// Signup route
app.post('/signup', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const newUser = new User({ email, username, password });
    await newUser.save();
    res.status(201).send('User created successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating user');
  }
});

app.post('/logintest', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).exec();
    if (!user) {
      return res.status(404).send('User not found.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send('Incorrect password.');
    }

    res.send('Login successful');
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('An error occurred during the login process.');
  }
});


// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
