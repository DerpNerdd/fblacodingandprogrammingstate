const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const path = require('path');

const app = express(); // Initialize the express application here


// Now you can safely use 'app' for setting views and engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

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

passport.use(new LocalStrategy((username, password, done) => {
  User.findOne({ username: username }, function (err, user) {
    if (err) { return done(err); }
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  });
}));

// Passport Local Strategy
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
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
  User.findById(id)
    .then(user => done(null, user))
    .catch(err => done(err));
});


userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  console.log(`Original password: ${this.password}`);
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log(`Hashed password: ${this.password}`);
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});


app.use(express.static(path.join(__dirname, 'public')));

const sessionStore = MongoStore.create({
  mongoUrl: 'mongodb+srv://DerpNerd:KingAlanSanchez2007@globaldatabase.imwknpl.mongodb.net/?retryWrites=true&w=majority',
  collectionName: 'sessions'
});

// Optional: Listen to events from the session store
sessionStore.on('create', (sessionId) => {
  console.log(`Session created: ${sessionId}`);
});
sessionStore.on('touch', (sessionId) => {
  console.log(`Session touched: ${sessionId}`);
});
sessionStore.on('destroy', (sessionId) => {
  console.log(`Session destroyed: ${sessionId}`);
});

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // Example: setting cookie to expire after 24 hours
}));

app.use(passport.initialize());
app.use(passport.session()); // This relies on the express-session middleware
app.use(flash()); // Use connect-flash middleware


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html'); // Adjust the path according to your project structure
});

// Signup route
app.post('/signup', async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Manually hash the password
    const newUser = new User({ email, username, password: hashedPassword }); // Use the hashed password
    await newUser.save();
    console.log(`User ${username} created with hashed password.`);
    res.status(201).send('User created successfully');
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Error creating user');
  }
});



app.post('/logintest', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'An error occurred' });
    }
    if (!user) {
      return res.status(401).json({ isAuthenticated: false, message: 'Incorrect username or password.' });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({ message: 'An error occurred during login' });
      }
      return res.json({ isAuthenticated: true });
    });
  })(req, res, next);
});



app.get('/login', (req, res) => {
  // Retrieve flash message and pass it to the template
  const messages = req.flash('error');
  res.render('login', { messages: messages });
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


app.get('/user-info', (req, res) => {
  console.log('Session:', req.session);
  console.log('Session ID:', req.sessionID);
  console.log('User in session:', req.user);
  console.log('Authenticated:', req.isAuthenticated());
  if (req.isAuthenticated()) {
    res.json({ username: req.user.username });
  } else {
    res.json({ username: null });
  }
});

app.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.session.destroy(function(err) {
        if (err) {
            console.error("Error destroying the session:", err);
            return next(err);
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.redirect('/'); // Redirect to home page or login page
    });
  });
});



app.get('/submit-data', (req, res) => {
  if (req.isAuthenticated()) {
      res.render('submit-data', { user: req.user });
  } else {
      res.render('submit-data', { user: null });
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
