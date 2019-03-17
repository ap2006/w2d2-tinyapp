var express = require("express");
var cookieSession = require('cookie-session')
var app = express();
var PORT = 8080;

const bcrypt = require('bcrypt');

app.use(cookieSession({
  name: 'session',
  keys: ["abghjk"],


  maxAge: 24 * 60 * 60 * 1000
}))
app.set("view engine", "ejs");

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

function urlsForUser(id) {
  let userURLs = {};
  for (var url in urlDatabase) {
    if  (urlDatabase[url].userID == id) {
      userURLs[url] = urlDatabase[url]
    }
  }
  return userURLs
}

var urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//Add routes here

//localhost page welcome message
app.get("/", (req, res) => {
  res.send("Hello!");
});

//urls.json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//lists new urls if logged in, if not redirects to login page
app.get("/urls/new", (req, res) => {
  let user_id = req.session.user_id
  if (!user_id) {
    res.redirect("/login/")
  } else {
    let templateVars = { user: users[user_id] };
    res.render("urls_new", templateVars);
  }
});

//shows list of updated urls with shortURL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session.user_id};
  console.log('new db', urlDatabase)
  res.redirect('/urls/' + shortURL);
});

//my local host root page with a Hello message
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//show urls page if user is logged in show with the urls associated with their id. it not, take them to urls page
app.get("/urls", (req, res) => {
  let user_id = req.session.user_id
  if (!user_id) {
    let templateVars = { urls: {}, user: users[user_id] };
    res.render("urls_index", templateVars);
  }
  else {
    var userURLs = urlsForUser(user_id);
    let templateVars = { urls: userURLs, user: users[user_id] };
    res.render("urls_index", templateVars);
  }

});

//show the shortened url page that you can update if you wish and are logged in
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
  res.render("urls_show", templateVars);
});

//with the newly created short url redirect user to the page with the long url saved in the short url
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//for the delete page for deleting urls, only show associated urls to the owner. if user does not exist, take them to login page
app.post("/urls/:shortURL/delete", (req, res) => {
  let user_id = req.session.user_id
  if (!user_id) {
    res.redirect("/login/");
  }
  else {
    var userURLs = urlsForUser(user_id);
    if (userURLs[req.params.shortURL]) {
      delete urlDatabase[req.params.shortURL];
    }
    res.redirect("/urls");
  }
});

//show urls belonging to user
app.post("/urls/:id", (req, res) => {
  let user_id = req.session.user_id
  if (!user_id) {
    res.redirect("/login/");
  }
  else {
    var userURLs = urlsForUser(user_id);
    if (userURLs[req.params.id]) {
      urlDatabase[req.params.id].longURL = req.body.longURL;
    }
    res.redirect("/urls");
  }
});

//Login page
app.get("/login", (req, res) => {
  res.render("login");
});

//if your login works, go to the urls page. If your password doesn't match the email, you get a 403.
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password ) {
    res.send(400);
    return;
  }
  for (var userId in users) {
    if (email === users[userId].email) {
      // if (password === users[userId].password) {
      if (bcrypt.compareSync(password, users[userId].password)) {
        req.session.user_id = userId
        res.redirect("/urls");
        return;
      } else {
        res.status(403).send("Password doesn't match");
        return;
      }
    }
  }
  res.status(403).send("Email does not exist");
});

//Logout page.
app.post("/logout", (req, res) => {

  req.session = null
    res.redirect("/urls");
});

//Register page
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString();

  if (!email || !password ) {
    res.send(400);
    return;
  }

//below you are adding in a check that says if an email already is registered, return a 400 with a message saying it's already taken
  for (var userId in users) {
    if (req.body.email === users[userId].email) {
      res.status(400).send("Email is already registered");
      return;
    }
  }
  users[id] = {id: id, email: email, password: hashedPassword}

  console.log("registered user", users);
  req.session.user_id = id
    res.redirect("/urls");
});

//server running
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
