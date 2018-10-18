# liri
Liri - your command line digital assistant!  Liri allows you to quickly look up information about your favorite movies, songs, concerts and more - all from the comfort of your command line.

# Major features include:
* Search for information about song (by title) using Spotify's vast database of music (and get a preview link!)
* View plot synopsis, cast list, and more for your favorite movies via IMDB
* Look up concert dates and venues for the bands you adore via Bandsintown
* Execute a liri command stored in a comma-separated text file
* (For developers) Define custom results menus and messages with a simple object format

## Requirements
* Your favorite command line such as [git] (https://git-scm.com)
* An active installation of [node](https://nodejs.org/en/)
* The following [npm](https://www.npmjs.com/) packages:
    * Require
    * Node-spotify-api
    * Clear
    * FS
    * Moment
    * Dotenv
* Your very own spotify API key and secret - obtainable via [spotify's developer website] (https://developer.spotify.com/documentation/web-api/)

# Installation
* Clone liri to a local repository on your machine via the git bash command: git clone git@github.com:kmtenhouse/liri.git'
* Run 'npm install' within the liri directory to install all required packages
* Create a .env file and save your API keys in it with the following format:
```
# Spotify API keys

SPOTIFY_ID=your-spotify-id
SPOTIFY_SECRET=your-spotify-secret
```

# Using Liri
Once installed, liri is simple to use via node!  Simply execute 'node liri.js _command arguments_' from your liri directory. 'Commands' are a single liri key word, and arguments are expected as a space-separated list. If no arguments are provided, a 'default' search will be executed.

Liri supports the following commands:
* concert-this _band name_ 
* spotify-this-song _song name_
* movie-this _movie title_
* do-what-it-says _filename_
* help 

# Commands
## concert-this _band name_ 
Search for appearances by your favorite band! Liri will attempt to find upcoming concerts where they will appear.

*Default:* If no band name is provided, liri will search for "Feed Me". 

## spotify-this-song _song name_
Find information about a song you heard on the radio! 

*Default:* If no song name is provided, liri will search for "The Sign".

## movie-this _movie title_
Look up a movie (by title) on IMDB!

*Default:* If no movie title is provided, liri will search for "Mr. Nobody".

## do-what-it-says _filename_
Liri will attempt to read instructions from a plain text (UTF8 encoded) file that includes a comma separated liri command and then string of arguments.

*Default:* If no filename is provided, liri will search for "random.txt" in the liri directory.

**NOTE:** at this time, liri can only parse one command from a file.

## help
If you forget what commands are available, simply type 'help' with no arguments for a reminder!
![Screenshot of Liri Help](https://github.com/kmtenhouse/liri/raw/master/assets/images/liri-help.jpg)

# Future Enhancements
* Read multiple liri commands from the same text file
* Configurable liri environment variables to set (or remove!) default search items