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

Once you have completed a search in liri, your results will also be timestamped and saved within the logfile 'log.txt' so you can review them later.

# Commands
## concert-this _band name_ 
Search for appearances by your favorite band! Liri will attempt to find upcoming concerts where they will appear. Liri

*Default:* If no band name is provided, liri will search for "Feed Me". 

Liri will display a list of results. Use the up and down arrow keys to view all results, then 'Enter' to select. Select 'Quit' when you'd like to end.

```
Live at: (Name of the venue where the band will appear)
Full lineup: (All the artists that will be appearing alongside your band)
Appearing on: MM/DD/YYYY 
In: (City/state/country of performance)
```

[View it in action](https://drive.google.com/file/d/1Tqqu3S-6xRMZ0eso7WJ8pV0sgrhXZVN-/view)

## spotify-this-song _song name_
Find information about a song you heard on the radio! 

*Default:* If no song name is provided, liri will search for "The Sign".

Liri will display a list of results. Use the up and down arrow keys to view all results, then 'Enter' to select. Select 'Quit' when you'd like to end.

```
Song Name: (Full title of the selected song)
By: (The artist who recorded this version)
From the album: (The album where this song can be found)
Listen to a sample: (A Spotify link to the song so that you can hear it if you have a Spotify account!)
```

[View it in action](https://drive.google.com/file/d/1Tr2tr1CCoDQMl9K8YzqS0ZUeXm9rz1pe/view)

## movie-this _movie title_
Look up a movie (by title) on IMDB!

*Default:* If no movie title is provided, liri will search for "Mr. Nobody".

Liri will display a list of results. Use the up and down arrow keys to view all results, then 'Enter' to select. Select 'Quit' when you'd like to end.

```
Movie Title: (Full title of the movie)
Year Released: (Year the movie came out)
IMDB Rating: (Rating from IMDB if available)
Rotten Tomatoes Score: (Tomatometer rating, if available)
Production Occurred In: (Countries where filming occurred)
Languages: (Languages the movie is available in)
Synopsis: (Plot summary)
Starring: (Key actors)
```

[View it in action](https://drive.google.com/file/d/1jzFHNFzzJe-Cilk2lLa6XI8OBaJRZAna/view)

## do-what-it-says _filename_
Liri will attempt to read instructions from a plain text (UTF8 encoded) file that includes a comma separated liri command and then string of arguments.

*Default:* If no filename is provided, liri will search for "random.txt" in the liri directory.

[View it in action](https://drive.google.com/file/d/120YfmBkLmmXXGE0bmNJvYGZE5BTDfkEg/view)

**NOTE:** at this time, liri can only parse one command from a file.

## help
If you forget what commands are available, simply type 'help' with no arguments for a reminder!
[View it in action](https://drive.google.com/file/d/1Jw3F0zmWIqJo9Owb01g6n_cDMcfwfeUy/view)

# Future Enhancements
* Read multiple liri commands from the same text file
* Configurable liri environment variables to set (or remove!) default search items