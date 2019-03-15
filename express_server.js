var express = require("express");
var cookieParser = require('cookie-parser')
var app = express();
var PORT = 8080; //default port is 8080

app.use(cookieParser())
app.set("view engine", "ejs");

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// const createUser = (email, password) => {
//   const id = nextId++;
//   const newUser = {
//     id: id,
//     email: email,
//     password: password
//   };
//
//   users[id] = newUser;
//   return newUser;
// };

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

console.log(users);

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let user_id = req.cookies.user_id
  if (!user_id) {
    res.redirect("/login/")
  } else {
    let templateVars = { user: users[user_id] };
    res.render("urls_new", templateVars);
  }
});

app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console; this is also where you will find the submitted form data
  const shortURL = generateRandomString(); // jkcjgk
  urlDatabase[generateRandomString()] = req.body.longURL; // urlDatabase['jkcjgk'] = "http://whatever.com"
  console.log('new db', urlDatabase)
  res.redirect('/urls/' + shortURL); // '/urls/' + 'jkcjgk'
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let user_id = req.cookies.user_id
  let templateVars = { urls: urlDatabase, user: users[user_id] };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]/* What goes here? */ };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let deletedURL = [req.params.shortURL];
  // console.log(deletedURL); logging each step so I can remember what I did
  delete urlDatabase[deletedURL];
  //The reason we use urlDatabase[deletedURL] and not delete urlDatabase.deletedURL is because we can't pass a variable in a previously defined object
    res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  // modify longURL
  let newURL = req.body.longURL
  console.log(req.body.longURL);
  urlDatabase[req.params.id] = newURL
    res.redirect("/urls");
});
//Login
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password ) {
    res.send(400);
    return;
  }
//below you are adding in a check that says if an email already is registered, return a 400 with a message saying it's already taken
  for (var userId in users) {
    if (email === users[userId].email) {
      if (password === users[userId].password) {
        res.cookie("user_id", userId)
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

app.post("/logout", (req, res) => {

  res.clearCookie("user_id")
    res.redirect("/urls");
});
//Register
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
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
  users[id] = {id: id, email: email, password: password}

  console.log("registered user", users);
  res.cookie("user_id",id)
    res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
