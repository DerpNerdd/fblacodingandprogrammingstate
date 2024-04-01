const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const path = require('path');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Initialize the express application here
const app = express();

// Define user schema and model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: '' }, // URL to the image
  bio: { type: String, default: '' },

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
  addInformation: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});


const User = mongoose.model('User', userSchema);

const Partner = mongoose.model('Partner', partnerSchema);



// Now you  cansafely use 'app' for setting views and engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
console.log(path.join(__dirname, 'public/uploads'));



// Connect to MongoDB
mongoose.connect("mongodb+srv://DerpNerd:KingAlanSanchez2007@globaldatabase.imwknpl.mongodb.net/?retryWrites=true&w=majority")
.then(() => {
  console.log('MongoDB connected');
  Partner.init().then(() => {
    console.log('Indexes have been initialized');
  }).catch(err => console.error('Error initializing indexes:', err));
}).catch(err => console.error('MongoDB connection error:', err));


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

app.get('/register', (req, res) => {
  res.render('register', { messages: req.flash('error') });
});


// This endpoint receives data from the client-side and creates a new partner information entry in the database
app.post('/submit-partner-info', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(403).send('User not authenticated');
  }

  const partnerInfo = new Partner({
    ...req.body,
    user: req.user._id, // Attach the user's ID to the submission
  });

  try {
    await partnerInfo.save();
    res.json({ message: 'Submission successful' }); // Respond with JSON
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ message: 'Error processing your submission' });
  }
});



app.put('/edit-partner-info/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(403).send('User not authenticated');
  }

  try {
    const partnerInfo = await Partner.findOne({ _id: req.params.id, user: req.user._id });
    if (!partnerInfo) {
      return res.status(404).send('Submission not found or user not authorized to edit');
    }

    // Update fields
    Object.assign(partnerInfo, req.body);

    await partnerInfo.save();
    res.send('Submission updated successfully');
  } catch (error) {
    console.error('Edit error:', error);
    res.status(500).send('Error updating the submission');
  }
});


app.delete('/delete-partner-info/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
      return res.status(401).send('Not Authorized');
  }
  
  try {
      const submission = await Partner.findOneAndDelete({ _id: req.params.id, user: req.user._id });
      if (!submission) {
          return res.status(404).send('Submission not found or not authorized');
      }
      res.send({ message: 'Submission deleted successfully' });
  } catch (error) {
      res.status(400).send('Error deleting submission');
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

// Route to get filtered partner info
app.get('/get-partner-info', async (req, res) => {
  // Extract query parameters for filtering
  const { search, state, city, name } = req.query;
  let query = {};

  // Build the query based on provided parameters
  if (state) query.orgState = state;
  if (city) query.orgCity = city;
  if (search) {
      query.$or = [
          { firstName: new RegExp(search, 'i') },
          { lastName: new RegExp(search, 'i') },
          { contactEmail: new RegExp(search, 'i')},
          { phoneNumber: new RegExp(search, 'i')},
          { orgName: new RegExp(search, 'i') },
          { orgAddress: new RegExp(search, 'i')},
          { orgCity: new RegExp(search, 'i') },
          { orgState: new RegExp(search, 'i') },
          { resources: new RegExp(search, 'i')}
      ];
  }

  try {
    let partners = await Partner.find(query).lean(); // Use lean() for performance and ease of manipulation

    // Check ownership for each partner information
    partners = partners.map(partner => ({
      ...partner,
      isOwner: req.isAuthenticated() && partner.user.toString() === req.user._id.toString()
    }));

    res.json(partners);
  } catch (error) {
    console.error('Error fetching partner info:', error);
    res.status(500).send('Error fetching partner information');
  }
});



// Route to get partner info
// Endpoint to get submissions made by the logged-in user
// Endpoint to get submissions with ownership information
// Endpoint to get all partner info with ownership information
app.get('/get-all-partner-info', async (req, res) => {
  try {
    let submissions = await Partner.find({})
                                   .select('-__v') // Exclude version key
                                   .lean(); // Convert documents to plain JS objects to add isOwner property
    
    // Check ownership for each submission
    submissions = submissions.map(submission => ({
      ...submission,
      isOwner: req.isAuthenticated() && submission.user.toString() === req.user._id.toString()
    }));

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Error fetching submissions' });
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

app.put('/change-email', async (req, res) => {
  if (!req.isAuthenticated()) {
      return res.status(403).send('Not authenticated');
  }
  const { newEmail } = req.body;
  try {
      const user = await User.findById(req.user._id);
      user.email = newEmail;
      await user.save();
      // Adding a callback function to req.logout()
      req.logout(function(err) {
          if (err) {
              console.error('Logout error:', err);
              return res.status(500).send('Error during logout');
          }
          res.send({ message: 'Email updated successfully. Please log in again.' });
      });
  } catch (error) {
      console.error('Error updating email:', error);
      res.status(500).send('Error updating email');
  }
});


app.put('/change-password', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(403).json({ message: 'Not authenticated' });
  }

  const { currentPassword, newPassword } = req.body;
  
  try {
    const user = await User.findById(req.user._id);
    
    // Check if the current password matches
    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update the password
    user.password = bcrypt.hashSync(newPassword, 10);
    await user.save();

    // Log the user out after changing the password
    req.logout(function(err) {
      if (err) { 
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Error logging out' });
      }
      res.json({ message: 'Password updated successfully' });
    });

  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Error updating password' });
  }
});


app.put('/change-password', async (req, res) => {
  if (!req.isAuthenticated()) {
      return res.status(403).send('Not authenticated');
  }
  const { currentPassword, newPassword } = req.body;
  try {
      const user = await User.findById(req.user._id);
      if (!bcrypt.compareSync(currentPassword, user.password)) {
          return res.status(400).send('Incorrect current password');
      }
      user.password = bcrypt.hashSync(newPassword, 10);
      await user.save();
      res.send('Password updated successfully');
  } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).send('Error updating password');
  }
});

app.delete('/delete-account', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(403).json({ message: 'Not authenticated' });
  }
  try {
    await User.findByIdAndDelete(req.user._id);
    req.logout(function(err) {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Error during logout' });
      }
      // Ensure you are sending a JSON response before redirecting or ending the response
      res.json({ message: 'Account deleted successfully' });
      // Redirecting via server-side is not effective for SPA or AJAX-based applications
      // Instead, handle the redirect client-side after successful response
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Error deleting account' });
  }
});

app.post('/upload-profile-picture', upload.single('profileImage'), async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(403).send('Not authenticated');
  }
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const user = await User.findById(req.user._id);
    user.profilePicture = `/uploads/${req.file.filename}`;
    await user.save();
    res.send({ message: 'Profile picture updated successfully.' });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).send('Error updating profile picture');
  }
});

// Route to update bio
app.post('/update-bio', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(403).send('Not authenticated');
  }

  const { bio } = req.body;

  try {
    const user = await User.findById(req.user._id);
    user.bio = bio;
    await user.save();
    res.send({ message: 'Bio updated successfully.' });
  } catch (error) {
    console.error('Error updating bio:', error);
    res.status(500).send('Error updating bio');
  }
});

// Route to get user profile
app.get('/get-user-profile', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(403).send('Not authenticated');
  }

  try {
    const user = await User.findById(req.user._id).select('username email profilePicture bio');
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).send('Error fetching user profile');
  }
});



// Assuming a Repository schema exists similar to this
const repositorySchema = new mongoose.Schema({
  name: String,
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // additional fields as necessary
});

const Repository = mongoose.model('Repository', repositorySchema);

// Update the User schema
userSchema.add({
  pinnedRepositories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Repository' }]
});


app.get('/profile/:username', async (req, res) => {
  try {
    // Log the username for debugging
    console.log("Requested profile for username:", req.params.username);

    const userProfile = await User.findOne({ username: req.params.username }).lean();
    
    // Log the fetched user profile for debugging
    console.log("Fetched userProfile:", userProfile);

    if (!userProfile) {
      return res.status(404).send("User not found.");
    }

    res.render('profile', {
      userProfile,
      followers: [], // Example data for testing
      following: [], // Example data for testing
      pinnedRepositories: [], // Example data for testing
      canFollow: false, // Example data for testing
      isAuthenticated: req.isAuthenticated(),
      currentUser: req.user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).send("Error fetching user profile.");
  }
});



app.get('/user/:username', async (req, res) => {
  try {
    // Extract the username from the URL parameter.
    const { username } = req.params;
    
    // Attempt to find the user by their username.
    const userProfile = await User.findOne({ username }).lean();
    
    // If no user is found, return a 404 error.
    if (!userProfile) {
      return res.status(404).send("User not found.");
    }

    // If a user is found, render the profile template with the user's data.
    // Make sure the key matches what your EJS template expects.
    res.render('profile', {
      userProfile,
      // If you're not using the following fields in the simplified template, you can omit them.
      followers: [], 
      following: [], 
      pinnedRepositories: [],
      canFollow: false,
      isAuthenticated: req.isAuthenticated(),
      currentUser: req.user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).send("Error fetching user profile.");
  }
});
app.use(express.static(path.join(__dirname, 'public')));

app.get('/dashboard', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  
  // Assuming you have a method to find the user by ID
  const user = await User.findById(req.user._id).lean();
  
  if (!user) {
    return res.status(404).send('User not found');
  }

  // Render the dashboard with the user object
  res.render('dashboard', { user });
});

app.get('/api/current-user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send({ error: 'User is not authenticated' });
  }
  const profilePicturePath = req.user.profilePicture.startsWith('/uploads/')
    ? req.user.profilePicture
    : `/uploads/${req.user.profilePicture}`;
  res.json({
    username: req.user.username,
    profilePicture: req.user.profilePicture ? profilePicturePath : '/path/to/default/image.jpg',
  });
});



app.get('/api/search', async (req, res) => {
  console.log("Search query received:", req.query.query);
  const searchQuery = req.query.query; // Extract query from URL parameters
  try {
      // Perform the search operation. Assuming a simple text search for simplicity.
      const searchResults = await Partner.find({
          $text: { $search: searchQuery }
      }).lean();

      // Render the view-data.ejs template with the searchResults data
      res.render('view-data', { searchResults: searchResults });
  } catch (error) {
      console.error('Search error:', error);
      res.status(500).render('error', { error: error }); // Assume you have an error.ejs for error rendering
  }
});

// New JSON search endpoint
app.get('/api/current-user', (req, res) => {
  if (!req.isAuthenticated()) {
    // If the user is not authenticated, return an appropriate status and message
    return res.status(401).json({ error: 'User is not authenticated' });
  }

  // Assuming the profilePicture field contains just the filename and not the full path
  // Construct the full path for the profile picture
  const profilePicturePath = req.user.profilePicture
    ? `/uploads/${req.user.profilePicture}`
    : '/path/to/default/image.jpg'; // Provide a default image path if not set

  // Return the user data as JSON
  res.json({
    username: req.user.username,
    profilePicture: profilePicturePath,
  });
});





// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));