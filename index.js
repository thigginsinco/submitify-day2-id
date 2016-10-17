/*jshint esversion:6*/

var tellMeWhenYouRestart = false;

// require express
var express = require("express");

// run express
var app = express();

// set port to dynamically set port, or 8000
const PORT = process.env.port || 8000;

// bring in what we `module.export`ed from Project.js
var Project = require("./Project.js");

// bring in what we `module.export`ed from Storage.js
var Storage = require("./Storage.js");

var User = require("./User.js");

// create our storage object
var storage = new Storage();
var project = new Project();

// Create two test projects, so we have some data on the frontend.
// Todo: remove this for production!
// storage.addProject(
// 	new Project("Test", "Testing a project", "Me")
// );

// storage.addProject(
// 	new Project("Test 2", "Testing another project", "You")
// );

// Create a fake test user for testing :)
// storage.addUser(
// 	new User("erty", "hunter2")
// );

// storage.addUser(
// 	new User("tom", "tom")
// );
// give us req.body for post requests
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


//give us req.session for all requests
var session = require("express-session");
app.use(session({
	secret: "ecroq348ncro7834yqcnriueyc",
	resave: false,
	saveUninitialized: false
}));

// sets up a handler to respond to a GET request for "/" (site root)
app.get("/", (req, res) => {
	// make sure the user is authenticated before they are allowed to see the
	// homepage
	if(!req.session.user) {
		res.redirect("/login");
		return;
	}
	res.sendFile(__dirname + "/public/index.html");
});

// Sends the login.html forward to the user so they can log in
app.get("/login", (req, res) => {
	//console.log(storage.getAllUsers(), "all")
	res.sendFile(__dirname + "/public/login.html");
});

// sets up a handler to respond to a GET request for /api/projects
// responds with, as JSON, all of the projects currently in storage.
app.get("/api/projects", (req, res) => {
	// Check auth
	if (!req.session.user) {
		res.status(418);
		res.send("I'm a teapot");
		return;
	}
	storage.getAllProjects((projects) => {
		res.send(projects);
	});
});

// sets up a handler to respond to a POST request to /api/project
// responds with, as JSON, the new project as it exists in the storage
// (i.e. with the author and votes fields filled in)
app.post("/api/project", (req, res) => {
	// Check auth
	if (!req.session.user) {
		res.status(418);
		res.send("I'm a teapot");
		return;
	}
	var p = new Project(
		req.body.name,
		req.body.description,
		req.session.user.username // use the username of the user as the author
	);
	storage.addProject(p, () => {
		res.send(p);
	});
});

app.post("/api/vote", (req, res) => {
	// check auth
	//console.log(req.session.user);
	if (!req.session.user) {
		res.status(418);
		res.send("I'm a teapot");
		return;
	}
	//console.log(req.session.user.username);
	// get the project based on the name from the frontend
	storage.getProjectByName(req.body.name, (proj) => {
		//console.log(req.body.name);
		//console.log(proj, "index");
		// add a vote to the project for the current user
		var voted = project.addVote(req.body.name, req.session.user.username);
		// send back some info about whether we voted, etc.
		res.send({
			voted: voted,
			votes: project.getVoteCount()
		});
	});
});

/*
	This handles any post requests to /api/login,
	we expect a username and password to come in on req.body
	currently, we check that against some hard-coded values
	("erty" and "hunter2"), but we need to change this so that
	we can authenticate any user in storage.
*/
app.post('/api/login', (req, res) => {
	// if (req.body.username == "erty" &&
	// 	req.body.password === "hunter2"
	// ) {
	// 	// change erty to req.body.username check for errors u = null
	// 	// or password fails, if u.password==req.body.password
	// 	storage.getUserByUsername("erty", (u) => {
	// 		// if we have a successfully authenticated user
	// 		// then we set their req.session.user to be that
	// 		// user object
	// 		req.session.user = u;
	// 		res.send("success");
	// 	});
	// } else {
	// 	res.send("error");
	// }
	// console.log("first");
	if (!req.body.password || !req.body.username) {
		res.send({status: "error", message: "No password/username"});
		return;
	}

	//console.log("second");
	if (req.session.user) {
		res.send({status: "error", message: "User already logged in"});
		return;
	}
	//console.log("third");
	storage.getUserByName(req.body.username, (u) => {
		if (u === null) {
			res.send({status: "error", message: "User not found"});
			return;
		}
		if (u.password !== req.body.password) {
			res.send({status: "error", message: "Bad passsword"});
			return;
		}

		req.session.user = u;

		res.send({
			status: "success",
			user: u
		});
	});
	//console.log("last");
});
// this will intake a new user login, verify the name does not already
// exist, adn then let the user in to the site
app.post('/api/signup', (req, res) => {
	// if (req.body.username == "erty" &&
	// 	req.body.password === "hunter2"
	// ) {
	// 	storage.getUserByUsername("erty", (u) => {
	// 		// if we have a successfully authenticated user
	// 		// then we set their req.session.user to be that
	// 		// user object
	// 		req.session.user = u;
	// 		res.send("success");
	// 	});
	// } else {
	// 	res.send("error");
	// }
	storage.getUserByName(req.body.username, (u) => {
		if (u !== null) {
			res.send({status: "error", message: "User name already exists"});
			return;
		}

		var user = new User(req.body.username, req.body.password);
		storage.addUser(user, (success) => {
			if (success) {
				res.send({status: "success", message: "Welcome!"});
			} else {
				res.send({status: "error", message: "Could not save user"});
			}
		});
	});
});

// serve anything in the "public" directory without changes
// note the lack of "/"
app.use(express.static('public'));

// 404 handler
app.use((req, res, next) => {
	res.status(404);
	res.send("404 - File Not Found");
});

// 500 error handler
app.use((err, req, res, next) => {
	console.log(err);
	res.status(500);
	res.send("500 - Internal Server Error.\n<br />CHECK YOUR TERMINAL!");
});

// listen for new connections!
app.listen(PORT, () => {
	console.log("Listening on port " + PORT);

	if (tellMeWhenYouRestart) {
		var exec = require("child_process").exec;
		exec("say \"Server Started\"");
	}
});
