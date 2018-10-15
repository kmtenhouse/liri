//CODE THAT RUNS WHEN WE RUN THIS PROGRAM:
//First, check what the user has input as a command...
var userCommand = process.argv[2]; 

//next, prep an array with any arguments the user may have sent in
//if the user provided nothing, the array will have length of 0
 var userArguments = [];
for(let i=3; i<process.argv.length; i++) {
    userArguments.push(process.argv[i]);
} 
//Then call one of our subordinate functions, based on the command we gave:
liri(userCommand, userArguments);

//FUNCTION DECLARATIONS
//
//LIRI(command, arguments[])
//the liri function accepts a command (string) and an array of arguments
function liri(command, arguments) {
    switch(command) {
        case "concert-this": lookUpBands(arguments); 
                            break;
        case "spotify-this-song": lookUpSong(arguments);
                            break;
        case "movie-this": lookUpMovie(arguments);
                            break;
        case "do-what-it-says": 
                            lookUpInstructions(arguments);
                            break;
        case "help":
                    console.log("Welcome to liri, your command line personal assistant!");
                    console.log("Please try the following options");
                    console.group(); 
                    console.log("spotify-this-song <title> -- search for information about a song");
                    console.log("concert-this <bandname> -- search for information about concerts");
                    console.log("movie-this <movie title> -- search for information about a movie");
                    console.log("do-what-it-says <filename> -- execute a liri command stored in comma separated file");
                    console.groupEnd();
                    break;
        default:
                     console.log("Sorry, I don't understand how to do that. Try 'help' to see the available options.");
                    break;
    };
}

function lookUpBands(arguments) {
    console.log("Searching for bands...");
    //first, join together the band name...
    var bandName = arguments.join(" ");
    //NOTE: we don't have a default band, so we'll just error and exit if no band name was provided
    if(bandName==="") {
        console.log("Please provide a bandname in order to search for concerts!");
        return;
    }

    //otherwise, we attempt to make the request!
    var request = require('request');
    request("https://rest.bandsintown.com/artists/" + bandName + "/events?app_id=codingbootcamp", function (error, response, data) {
    if(error) {
       return console.log('Sorry, something went wrong:', error); // Print the error if one occurred
        }
        if(response.statusCode===200) { //if we got a positive response, go through each of the events and grab exactly what we want   
            var moment = require('moment'); 
            var allEvents = [];
            var eventList = JSON.parse(data);

            eventList.forEach(currentEvent => {
                //put together a reasonable location string based on what we have:
                 var location = currentEvent.venue.city + (currentEvent.venue.region ? " " + currentEvent.venue.region : "") + ", " +    currentEvent.venue.country;
        
                var humanreadableDate = moment(currentEvent.datetime).format("MM/DD/YYYY");

                //now put together a simplified object to store all our info!
                var newConcert = {
                    band: bandName,
                    venue: currentEvent.venue.name,
                    location: location,
                    date: humanreadableDate
                };
                allEvents.push(newConcert); 
            });

            //log all results to our log file
            logFile("concert-this", bandName, allEvents);

            //lastly, show the results to the user
            var customText = [
            {property: "venue", description: "Live at"},  
            {property: "date", description: "Appearing on"}, 
            {property: "location", description: "In"}, 
            ];

            displayResults(allEvents, {summarizeBy: ["date", "location"], separator: "", descriptors: customText});
        }
    });

}

function lookUpSong(arguments) {

    //ASSUMPTION: the user is providing only one song name, possibly separated by spaces
    //First, see if the user provided anything - if not, you'll use a default
    var songName; 
    (arguments.length>0? songName = arguments.join(" ") : songName = "The Sign by Ace of Base");
    //next, initialize what we need to make a call to spotify api
    var dotenv= require("dotenv").config(); //configure the .env to process environment variables
    var keys = require('./keys.js'); //export our keys using the wrapper keys.js
    //require the spotify module itself
    var Spotify = require('node-spotify-api'); 
 
    //start a specific instance of spotify using the keys we exported using keys.js -- the info we want will be in the spotify property
    var spotify = new Spotify(keys.spotify);

    spotify.search({ type: 'track', query: songName, limit: 10 }, function(err, data) {
        //if there's an error, throw the error first
        if (err) {
            return console.log('Sorry, an error occurred: ' + err);
        }
        console.log("Searching for " + songName + "...");
        //add the results to our logfile
        // logFile("#Command: spotify-this" + " " + songName, JSON.stringify(data, null,2));    
        var allSongs = data.tracks.items;
        //now we create an array of just the data we need (so that the user can interact with our UI)
        var truncatedSongs =[];
        for(let j=0; j<allSongs.length; j++) {
            //first, make an object for our truncated results...
              var currentItem = {
                title: allSongs[j].name, 
                album: allSongs[j].album.name,
                bands: "",
                songPreviewLink: allSongs[j].external_urls.spotify
            };
            //next, look through all the artists that contributed to this song and grab just the band names 
            //(some songs have multiple bands involved, like Grizfolk/RAC's collab for 'hymnals')
            var artists = allSongs[j].artists; //list of artists for this particular song
            var bandsInvolved = [];
            artists.forEach(currentArtist => {
                if(currentArtist.type==="artist") {
                    bandsInvolved.push(currentArtist.name);
                }
            });
            currentItem.bands = bandsInvolved.join(", ");
            //now, store our finished item in the array of truncated results!
            truncatedSongs.push(currentItem);
        }

        //log the results of this search in our log file
        logFile("spotify-this-song", songName, truncatedSongs);

        //lastly, display the results to the user
        var customText = [
            {property: "title", description: "Song Name:"}, 
            {property: "bands", description: "By:"}, 
            {property: "album", description: "From the album:"}, 
            {property: "songPreviewLink", description: "Listen to a sample:"}
        ];

        displayResults(truncatedSongs, {summarizeBy: ["title", "bands"], separator: "-", descriptors: customText});
    }); 
}

function lookUpMovie(arguments) {
    //first, determine if we have a movie or not...if not, our default will be 'Mr. Nobody'
    var movieName;
    (arguments.length>0 ? movieName = arguments.join(" ") : movieName = "Mr. Nobody");
    //begin a request
    var request = require('request');
    request('http://www.omdbapi.com/?apikey=trilogy&t='+movieName, function (error, response, result) {
            if(error) {
                return console.log("Sorry, something went wrong: " + error);
            }
        
          //otherwise if we received a response, attempt to grab the results we want!
            currentMovie = JSON.parse(result);
            if(response.statusCode===200) {
                console.log("Searching for the movie " + movieName + "...");
                var myMovie = [{
                    title: currentMovie.Title,
                    year: currentMovie.Year,
                    imdb: currentMovie.imdbRating,
                    rottentomatoes: "",
                    producedIn: currentMovie.Country,
                    language: currentMovie.Language,
                    plot: currentMovie.Plot,
                    actors: currentMovie.Actors
                }];

             //NOTE: we have to do a little extra work to find rotten tomatoes rating
            for(let i=0; currentMovie.Ratings; i++) {
                if(currentMovie.Ratings[i].Source==="Rotten Tomatoes") {
                    myMovie.rottentomatoes = currentMovie.Ratings[i].Value;
                    break;
                }
            }
            //finally our result object is complete!
            //log our search info to the logfile
            logFile("movie-this", movieName, myMovie);

            //Finally, show all results to the user...
            var customText = [
                {property: "title", description: "Movie Title:"}, 
                {property: "year", description: "Year Released:"}, 
                {property: "imdb", description: "IMDB Rating:"},
                {property: "rottentomatoes", description: "Rotten Tomatoes Score:"},
                {property: "producedIn", description: "Production Occurred In:"},
                {property: "language", description: "Languages:"},
                {property: "plot", description: "Synopsis:"},
                {property: "actors", description: "Starring:"}
            ];
            displayResults(myMovie, {summarizeBy: ["title", "year"], separator: "(", descriptors: customText});
         }
    });   
}

//attempts to parse instructions that are found within a file - assumes they are comma separated
function lookUpInstructions(arguments) {
    //first, determine if the user tried to provide a filename...if not, we default to 'random.txt'
    var filename; 
    (arguments.length>0 ? filename = arguments.join("") : filename = "random.txt");

    //attempt to open the file and read in its contents
    var fs = require('fs');
    fs.readFile(filename, 'utf8', function(err, data) {
        if(err) {
            return console.log("Sorry, there was a problem reading from the file (" + filename + "): " + err);
        }
        //first, parse the results into an array (assuming that the original file is comma separated)
        var fileResults = data.split(",");
        //the first thing in the results array should be the command, the remainder is the arguments
        var fileCommand = fileResults.shift();
        //now we call liri based on the command + the array of any remaining arguments
        liri(fileCommand, fileResults);       
    });
}

//logs commands/arguments/searches to a log file
//assumes that results will be objects that need to be stringified
function logFile(command, searchTerm, result) {
    var fs = require('fs');
    //assemble our (commented out) command string
    var logCommand = "//" + command + " " + searchTerm;
    //stringify any objects
    if(typeof(result)==="object") {
        var logData = JSON.stringify(result, null, 2);
    }
    fs.appendFile('log.txt', logCommand+"\n"+logData+"\n", 'utf8', function(err) {
        if(err) {
            return console.log("Sorry, there was an error writing to the log file: " + err);
        }
        //otherwise we successfully wrote to the file!
    });
}

//this function allows the user to look through the results of their previous search in a user-friendly way 
//assumes that 'resultsArr' is an array of objects, and 'messages' is a message object that tells us what to display
function displayResults(resultsArr, messages) {

    //first, create the list of summary string(s)
    var allSummarizedChoices = [];
    resultsArr.forEach(function(currentObj, index) {
        var summarizedString = "";
        for(let i=0; i<messages.summarizeBy.length; i++) {
            var propertyName = messages.summarizeBy[i]; //get the name of the property from our summarizeby list
            if(i>0) { //if we're not on the first item, add our separator...
                if(messages.separator==="(") { //a little special handling if the separator is parens
                    summarizedString+=" (";
                }
                else {
                    summarizedString+=" " + messages.separator+" "; //otherwise it's just a separator buffered by spaces
                }
            }
            summarizedString+=currentObj[propertyName]; //and add it to the string
            //check for closing parens also
            if(i>0) {
                if(messages.separator==="(") {
                    summarizedString+=")"; //if we are doing parens, add a closing parens
                }
            }
        }
        //now add an OBJECT to our array of summarized choices -- the name will be our summarized string, and the value we actually grab is the index
        allSummarizedChoices.push({name: summarizedString, value: index}); 
    });

    //next, fire up inquirer with our customized list of choices
    var inquirer = require('inquirer');
    var questions = [ {
        type: 'list',
        name: 'userChoice',
        message: 'I found the following results:',
        choices: allSummarizedChoices
      }];

      inquirer.prompt(questions).then(answers => {
        //find the index of the choice we selected:
        var index = answers.userChoice;
        //grab the specific object we want to display
        var selectedItem = resultsArr[index]; 
        //now, go through our messages and display the info using our custom text
        console.group();
        messages.descriptors.forEach(function(desc) {
            console.log(desc.description + " " + selectedItem[desc.property]);
        });
        console.groupEnd();
      });

}