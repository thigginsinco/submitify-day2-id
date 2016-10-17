/*jshint esversion:6 */
var fs = require('fs');
var projects = fs.readFileSync('./projects.json');
projects = JSON.parse(projects);


/*
	Description of a Project object. Currently only on the backend, but
	we could actually share this with the frontend if we wanted... hmm...
*/
function Project(name, description, author) {
	this.name = name;
	this.description = description;
	this.votes = [];
	this.author = author;

	this.getVoteCount = () => {
		return this.votes.length;
	};

	this.addVote = (proj_name, user_id) => {
		//console.log(user_id, "user");
		//console.log(proj_name, "proj name");
		//for (var p of projects) {
			//console.log(this.name);
			//console.log(proj_name);
			//if (proj_name === name){
				if (this.votes.includes(user_id)) {
					return false;
				}
				this.votes.push(user_id);
				return true;
			//}
		//}	
	};
}

module.exports = Project;
