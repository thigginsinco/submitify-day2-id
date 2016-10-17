/* jshint esversion:6 */
var fs = require('fs');
var users = fs.readFileSync('./users.json');
users = JSON.parse(users);
var projects = fs.readFileSync('./projects.json');
projects = JSON.parse(projects);

/*
	This is our extensible storage object. We've written it so that we can
	replace any parts of it in the future with calls to file system or mongo
	without too much effort.
*/
function Storage() {
	//var projects = []; // array of Project objects
	//var users = []; // array of User objects

	this.getAllUsers = () => {
		return users;
	};

	this.addProject = (project, cb)  => {
		// cb = callback
		projects.push(project);
		this.saveProjects(cb);
		//if (cb) {
		//	cb();
		//}
	};

	this.getAllProjects = (cb) => {
		var projects = fs.readFileSync('./projects.json');
		projects = JSON.parse(projects);
		// for (var p of projects) {
		// 	if (u.username === name) {
		// 		console.log("tom2");
		// 		cb(u);
		// 		return;
		// 	}
		// }
		//cb(null);	// cb = callback
		cb(projects);
	};

	this.getProjectByName = (name, cb) => {
		
		var projects = fs.readFileSync('./projects.json');
		projects = JSON.parse(projects);
		//console.log(projects, "all");
		for (var p of projects) {
			if (p.name === name) {
				cb(p);
				return;
			}
		}
	};

	this.saveProjects = (cb) => {
		fs.writeFile(
			"./projects.json",
			JSON.stringify(projects),
			(err) => {
				if (err) {
					console.log("Error writing new project to file");
					cb(false);
					return;
				}
				cb(true);
			}
		);
	};	

	// this.addVote = (proj_name, user_id) => {
	// console.log(user_id, "user");
	// console.log(proj_name, "proj name");
	// 	//for (var p of projects) {
	// 		//console.log(this.name, "this name");
	// 		//console.log(projects);
	// 		//if (proj_name === req.body.name){
	// 			if (this.votes.includes(user_id)) {
	// 				return false;
	// 			}
	// 			this.votes.push(user_id);
	// 			return true;
	// 		//}
	// 	//}	
	// };


	/*
		Takes in a user object to store, and stores
		it in the users array in user.json
	*/

	this.addUser = (user, cb) => {
		users.push(user);
		this.saveUsers(cb);
	};

	/*
		Takes in a username string and returns the user
		with that username
	*/

	this.getUserByName = (name, cb) => {
		var users = fs.readFileSync('./users.json');
		users = JSON.parse(users);
		for (var u of users) {
			if (u.username === name) {
				//console.log("tom2");
				cb(u);
				return;
			}
		}
		cb(null);
	};

	this.saveUsers = (cb) => {
		fs.writeFile(
			"./users.json",
			JSON.stringify(users),
			(err) => {
				if (err) {
					console.log("Error writing new user to file");
					cb(false);
					return;
				}
				cb(true);
			}
		);
	};	
}

module.exports = Storage;
