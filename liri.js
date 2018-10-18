//CODE THAT RUNS WHEN WE FIRST RUN THIS PROGRAM:

//GLOBAL VARIABLES
var request = require('request');
var clear = require('clear');
var moment = require('moment');
var fs = require('fs');

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
    //start by clearing the console so that liri will have room to operate
    clear();
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
    //first, join together the band name
    //if no bandname was provided, we'll use our default (Feed Me)
    var bandName = (arguments.length ? arguments.join(" ") : "Feed Me");

    //log the command itself to our logfile
    logFile("concert-this " + bandName);

    console.log("Searching for appearances by " + bandName +"...");
    //otherwise, we attempt to make the request!
    request("https://rest.bandsintown.com/artists/" + bandName + "/events?app_id=codingbootcamp", function (error, response, data) {
        if(error) {
            return console.log('Sorry, something went wrong:', error); // Print the error if one occurred
        }
        //NOTE: there appears to be a problem with the object we receive from bandsintown when we input garbage data (a band that doesn't exist)
        //The response is '{warn=Not Found}' which JSON.parse chokes on
        //As a result I've added a try/catch to handle this possibility
        try {
            var eventList = JSON.parse(data); //note: we expect to receive back an array of objects
        }
        catch(err) {
            console.log("Sorry, I can't find any bands named " + bandName);
            return;
        }
        //assuming that we found the band itself, we now determine if there are any concert dates
        //if the band is not touring, the array of event objects will be empty
        if(eventList.length>0) { 
            //go through each of the events and grab exactly what we want  
            var allEvents = [];

            eventList.forEach(currentEvent => {
                //put together a reasonable location string based on what we have:
                 var location = currentEvent.venue.city + (currentEvent.venue.region ? " " + currentEvent.venue.region : "") + ", " +    currentEvent.venue.country;
        
                var humanreadableDate = moment(currentEvent.datetime).format("MM/DD/YYYY");

                //now put together a simplified object to store all our info!
                var newConcert = {
                    band: currentEvent.lineup.join(", "),
                    venue: currentEvent.venue.name,
                    location: location,
                    date: humanreadableDate
                };
                allEvents.push(newConcert); 
            });

            //lastly, show the results to the user
            var customText = [
            {property: "venue", description: "Live at"}, 
            {property: "band", description: "Full Lineup:"}, 
            {property: "date", description: "Appearing on"}, 
            {property: "location", description: "In"}, 
            ];

            displayResults(allEvents, {summarizeBy: ["date", "location"], separator: "", descriptors: customText});
        }
        else {
            console.log("Sorry, " + bandName + " must not be on tour. I couldn't find any concerts for them.");
            logFile("Error: no concerts are currently found for the band " + bandName);
        }
    });

}

function lookUpSong(arguments) {

    //ASSUMPTION: the user is providing only one song name, possibly separated by spaces
    //First, see if the user provided anything - if not, you'll use a default
    var songName; 
    (arguments.length>0? songName = arguments.join(" ") : songName = "The Sign by Ace of Base");
    console.log("Searching for " + songName + "...");
    //log what we attempted to search for:
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

        logFile("spotify-this-song " + songName);
        var allSongs = data.tracks.items;
        //first, check if we received any song info - if not, end the search 
        if(allSongs.length===0) {
            console.log("Sorry, I didn't find any songs by that name.");
            logFile("Error: no song found by the name " + songName);
            return;
        }
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
    
    //log our search info to the logfile
    logFile("movie-this " + movieName);

    //begin a request
    request('http://www.omdbapi.com/?apikey=trilogy&t='+movieName, function (error, response, result) {
            if(error) {
                return console.log("Sorry, something went wrong: " + error);
            }
        
          //otherwise if we received a response, attempt to grab the results we want!
            currentMovie = JSON.parse(result); //parse the results into a JSON object
            if(currentMovie.Response==="True") { //if the search response was true, there is a movie for us to look at!
                console.log("Searching for the movie " + movieName + "...");
               
                var myMovie = {
                    title: currentMovie.Title,
                    year: currentMovie.Year,
                    imdb: currentMovie.imdbRating,
                    rottentomatoes: "N/A",
                    producedIn: currentMovie.Country,
                    language: currentMovie.Language,
                    plot: currentMovie.Plot,
                    actors: currentMovie.Actors
                };

             //NOTE: we have to do a little extra work to find rotten tomatoes rating
             //first, make sure that this movie HAS in-depth ratings - not all do!
                if(currentMovie.Ratings.length>0) {
                    for(let i=0; i<currentMovie.Ratings.length; i++) { 
                            if(currentMovie.Ratings[i].Source==="Rotten Tomatoes") {
                                myMovie.rottentomatoes = currentMovie.Ratings[i].Value;
                                break;
                            }    
                        } 
                }      
                //finally our result object is complete!
                //We will now show all results to the user...
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
                 displayResults([myMovie], {summarizeBy: ["title", "year"], separator: "(", descriptors: customText});
            }
            else { //otherwise, the response was false - the movie database didn't have anything by that name
                console.log("Sorry, I couldn't find any movies by that name.");
                logFile("Error: no movie found by the name " + movieName);
            }
    });   
}

//attempts to parse liri instructions that are found within a file - assumes they are comma separated
//in the form <command>,<arguments>
function lookUpInstructions(arguments) {

    //first, determine if the user tried to provide a filename in their arguments
    //if not, we will default to 'random.txt'
    var filename; 
    (arguments.length>0 ? filename = arguments.join("") : filename = "random.txt");

    console.log("Reading liri commands from " + filename + "...");
    
    //attempt to open the file and read in its contents
    fs.readFile(filename, 'utf8', function(err, data) {
        if(err) {
            return console.log("Sorry, there was a problem reading from the file (" + filename + "):\n" + err);
        }
        logFile("do-what-it-says " + filename);
        //first, parse the results into an array (assuming that the original file is comma separated)
        var fileArguments = data.split(",");

        //pop off the first thing we encounter in the file results, as we assume it's the command
        var fileCommand = fileArguments.shift();

        if(!isLiriCommand(fileCommand)) {
            console.log("I'm sorry, your file needs to start with a valid liri command, then a comma before any arguments.");
            logFile("Error: file contains an invalid command sequence.");
            return;
        }

        //and call liri based on the command + the array of any remaining arguments
        liri(fileCommand, fileArguments);
    });
}

//determines if a string is a valid liri command
function isLiriCommand(word) {
    return ((word==="spotify-this-song")||(word==="movie-this")||(word==="do-what-it-says")||(word==="concert-this")||(word==="help"));
}

//logs commands/arguments/searches to a log file
//assumes that results will be objects that need to be stringified
function logFile(whatToLog) {
    fs.appendFile('log.txt',"[" + moment().format("MM/DD/YYYY h:mm a") +"] " + whatToLog+"\n", 'utf8', function(err) {
        if(err) {
            return console.log("Sorry, there was an error writing to the log file: " + err);
        }
        //otherwise we successfully wrote to the file!
    });
}

//this function allows the user to look through the results of their previous search in a user-friendly way 
//assumes that 'resultsArr' is an array of objects, and 'messages' is a message object that tells us what verbose descriptions to display when showing each property on that object
function displayResults(resultsArr, messages) {
    //first, create the list of summary string(s) that we'll be displaying to the user in a custom menu
    var allSummarizedChoices = [];
    //for each object in the array that we provided...
    resultsArr.forEach(function(currentObj, index) {
        var summarizedString = "";
        for(let i=0; i<messages.summarizeBy.length; i++) {
            var propertyName = messages.summarizeBy[i]; //get the name of the property from our summarizeby list
            if(i>0) { //if we're not on the first item, add our separator...
                if(messages.separator==="(") { //a little special handling if the separator is parens
                    summarizedString+=" (";
                }
                else {
                    summarizedString+=" " + messages.separator+" "; //otherwise it's just the separator buffered by spaces
                }
            }
            summarizedString+=currentObj[propertyName]; //and add it to the string
            //check for closing parens also
            if(i>0 && messages.separator==="(") {
                summarizedString+=")"; //if we are doing parens, add a closing parens
            }
        }
        //now add an OBJECT to our array of summarized choices -- the name property will be our summarized string, and the value we actually grab is the index of the original item in the results array
        allSummarizedChoices.push({name: summarizedString, value: index}); 
    });
    
    //finally, add a default that is our signal to quit: a choice with an index valut outside of the array
    allSummarizedChoices.push({name: 'Quit', value: -1});

    //now, fire up inquirer with our customized list of choices -- using recursion to manage this
    var inquirer = require('inquirer');
    var questions = [ {
        type: 'list',
        name: 'userChoice',
        message: "Here's everything I found:",
        choices: allSummarizedChoices
      }];

    //NOTE: we define and use this recursion to keep showing results untilt he user tells us to stop :)
    function displayChoiceMenu() {
      inquirer.prompt(questions).then(answers => {
        //find the index of the choice we selected
        //if it's -1, we're going to stop!
        var index = answers.userChoice;
        if(index>=0) {
            //put a separator in our logfile
            //grab the specific object we want to display
            var selectedItem = resultsArr[index]; 
            //now, go through our messages and display the info using our custom text
            //start by clearing the screen
            clear();
            var logItems = "";
            console.group();
            messages.descriptors.forEach(function(desc) {
            //NOTE: here we check that the object has the property we're looking for before trying to output it!
            if(selectedItem.hasOwnProperty(desc.property)) {
                //display the customized description for each property...
                console.log(desc.description + " " + selectedItem[desc.property]);
                //..and log the same to our logFile
                logItems+=desc.description + " " + selectedItem[desc.property] + "\n";
            }
             });
            console.groupEnd();
            console.log("\n");
            //now recurse to display our menu again!
            //NOTE: we will ALSO stop recursing if there was only one result -- no reason to go back to the menu
            logFile("\n" + logItems+"==============");
            if(resultsArr.length>1) {
                displayChoiceMenu();
            }
            else {
                console.log("That's all I have for this topic! Goodbye!");
            }
        }
        else { //otherwise, if we selected our 'quit' option, we are quitting liri
            console.log("Goodbye!");
        }
      });
    }
    //Call the menu display at least once to get it started
    displayChoiceMenu();
}

