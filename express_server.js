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

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
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
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
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

app.post("/login", (req, res) => {
  let newName = req.body.username
  console.log(req.body.username);

  res.cookie("username",newName)
    res.redirect("/urls");
});

app.post("/logout", (req, res) => {

  res.clearCookie("username")
    res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
