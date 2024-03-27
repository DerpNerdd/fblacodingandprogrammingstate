const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const MongoStore = require('connect-mongo');


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
  firstName: String,
  lastName: String,
  contactEmail: String,
  phoneNumber: String,
  orgName: String,
  orgAddress: String,
  orgCity: String,
  orgState: String,
  resources: String,
  addInformation: String
});

const Partner = mongoose.model('Partner', partnerSchema);
const User = mongoose.model('User', userSchema);

// Passport Local Strategy
passport.use(new LocalStrategy(
  { usernameField: 'email' }, // Use email to login
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Passport serializeUser and deserializeUser
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const app = express();
app.use(express.static('public'));

app.use(session({
  secret: 'secret', // Secret used to sign the session ID cookie
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb+srv://DerpNerd:KingAlanSanchez2007@globaldatabase.imwknpl.mongodb.net/?retryWrites=true&w=majority'
  }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // Example: setting cookie to expire after 24 hours
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html'); // Adjust the path according to your project structure
});

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

app.post('/logintest', 
  passport.authenticate('local', { 
    successRedirect: '/', // Redirect on success
    failureRedirect: '/login', // Redirect on failure
    failureFlash: true // Optional: use flash messages for feedback
  })
);

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


app.get('/user-info', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ username: req.user.username });
  } else {
    res.json({ username: null });
  }
});

// Route to get partner info
app.get('/get-partner-info', async (req, res) => {
  // Extract query parameters
  const { state, city, name, search } = req.query;
  let query = {};

  // Build query based on parameters
  if (state) query.orgState = state;
  if (city) query.orgCity = city;
  if (search) {
    query.$or = [
      { orgName: new RegExp(search, 'i') }, // case-insensitive search
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') }
    ];
  }

  try {
    let partners = await Partner.find(query);

    // Sort by name if requested
    if (name) {
      partners = partners.sort((a, b) => {
        const nameA = a.orgName.toUpperCase(); // ignore upper and lowercase
        const nameB = b.orgName.toUpperCase(); // ignore upper and lowercase
        if (name === 'asc') return nameA < nameB ? -1 : 1;
        else if (name === 'desc') return nameA > nameB ? -1 : 1;
        return 0;
      });
    }

    res.json(partners);
  } catch (err) {
    console.error('Error fetching partner info:', err);
    res.status(500).send('Error fetching partner information');
  }
});

// Route to get unique states
app.get('/unique-states', async (req, res) => {
  try {
    const uniqueStates = await Partner.distinct("orgState"); // Assumes orgState is the field for states
    res.json(uniqueStates.sort());
  } catch (err) {
    console.error('Error fetching unique states:', err);
    res.status(500).send('Error fetching unique states');
  }
});

// Route to get unique cities for a given state
app.get('/unique-cities', async (req, res) => {
  try {
    const { state } = req.query;
    const uniqueCities = await Partner.find({ orgState: state }).distinct("orgCity"); // Assumes orgCity is the field for cities
    res.json(uniqueCities.sort());
  } catch (err) {
    console.error('Error fetching unique cities:', err);
    res.status(500).send('Error fetching unique cities');
  }
});


// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
