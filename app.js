const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to MongoDB
mongoose.connect("mongodb+srv://DerpNerd:KingAlanSanchez2007@globaldatabase.imwknpl.mongodb.net/?retryWrites=true&w=majority")
  .then(() => console.log('MongoDB connected :D'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define user schema and model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Define partner schema and model
const partnerSchema = new mongoose.Schema({
  orgName: String,
  orgType: String,
  resources: String,
  contactName: String,
  contactEmail: String
});

const Partner = mongoose.model('Partner', partnerSchema);
const User = mongoose.model('User', userSchema);

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Initialize Express app
const app = express();
app.use(express.json());
app.use(express.static('public'));

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

// Login route
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

app.post('/submit-partner-info', async (req, res) => {
  try {
    const newPartner = new Partner(req.body);
    await newPartner.save();
    res.status(201).json({ message: 'Partner information saved successfully' }); // Send JSON response
  } catch (err) {
    console.error('Error submitting partner info:', err);
    res.status(500).json({ message: 'Error saving partner information' }); // Send JSON even on error
  }
});


// Placeholder route for user-info if needed
app.get('/user-info', (req, res) => {
  // Logic to retrieve user info, or placeholder response
  res.json({ username: 'ExampleUser' });
});

// Route to get partner info
app.get('/get-partner-info', async (req, res) => {
  try {
    const partners = await Partner.find({});
    res.json(partners);
  } catch (err) {
    console.error('Error fetching partner info:', err);
    res.status(500).send('Error fetching partner information');
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
