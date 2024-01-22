const bcrypt = require('bcrypt');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');
const User = require('./models/user');
const flash = require('connect-flash');

const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

const uri = "mongodb+srv://DerpNerd:KSvw9xj7J6zXVV2p@fblabizbond.xgvbq7z.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1
});

mongoose.connect(uri)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/submit-partner-info', async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("FBLABizbond").collection("partners");
    await collection.insertOne(req.body);
    res.send("Partner information saved successfully");
  } catch (err) {
    console.error(err);
    res.send("Error saving data");
  } finally {
    await client.close();
  }
});

app.get('/view-data', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'view-data.html'));
});

app.get('/get-partner-info', async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("FBLABizbond").collection("partners");
    const data = await collection.find({}).toArray();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching data");
  } finally {
    await client.close();
  }
});

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!await bcrypt.compare(password, user.password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      password: hashedPassword
    });
    await user.save();
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.redirect('/register');
  }
  
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));


app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/user-info', (req, res) => {
  if (req.isAuthenticated()) {
      res.json({ username: req.user.username });
  } else {
      res.json(null);
  }
});


app.listen(3000, () => {
  console.log("Server is running on port 3000");
});