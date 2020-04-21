'use strict';

//libraries

//My server
require('dotenv').config();//grabs varibles from hiding spot from env file
const express = require('express'); //it allows access to express
const app = express();// allows you to put methoids in express
//the underpaid secuirty gaurd
const cors = require('cors');// allows you to allow access to different sources with some security

//pg
const pg = require('pg');
console.log(process.env.DATABASE_URL);
const client = new pg.Client(process.env.DATABASE_URL);
//superagent
const superagent = require('superagent');

app.use(cors());// invokes cors


const PORT = process.env.PORT || 3001; // defines port as either whats inside .env or 3001



client.on('error', err => errorHandler(err));




//location

//application gets location and sends a request to server
app.get('/location', (request, response) => {

    let city = request.query.city;//grab city data from qury
    let sql = 'SELECT * FROM locations WHERE search_query=$1;';
    let safevalues = [city];
    let key = process.env.GEOCODE_API_KEY;//creates the a key for using the api in the .env 
    client.query(sql,safevalues)
      .then(results => {
        if(results.rowCount.lenght>0){
          console.log('city in db:', city);
          response.send(results.rows[0]);
          }else {
            console.log('did not find your citry:', city)
            let url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;
            superagent.get(url)
            .then(results => {
              let location = new Location(results.body[0], city);
              response.status(200).send(location);
            }).catch(err => errorHandler(err, response));
            console.error('you messed up')

          }
  });
});
///weather
app.get('/weather', (request, response) =>{
  console.log(request.query)
  // get data from the darksky file
  let weather = [];
  let lat = request.query.latitude;
  let lon = request.query.longitude;
  let key = process.env.WEATHER_API_KEY;
  let Weatherurl = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${key}&days=7`;
  
  superagent.get(Weatherurl)
  .then(results => {
    console.log(results);
    let wData = results.body.data;
    let wArr = wData.map(day =>{
      return new Weather(day);
      
     })
    response.status(200).send(wArr);
  })
  // .catch(err=> errorHandler(err, response));
  //   console.log('its messed up', err)
  });
  //trails
app.get('/trails', (request, response) => {
  let {latitude,longitude} = request.query;
  let trailKey =process.env.TRAILS_API_KEY;
  let urlTrail = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxDistance=10&key=${trailKey}`;
  superagent.get(urlTrail)
    .then(results => {
      const dataObj = results.body.trails.map(trail => new Trail(trail));
      response.status(200).send(dataObj);
    });
});
//movies
app.get('/movies', (request, response) => {
  let location = request.query.search_query;
  let movieKey = process.env.MOVIE_API_KEY
  console.log(request.search_query);
  let url = `https://api.themoviedb.org/3/search/movie?api_key=${movieKey}&language=en-US&query=${location}&page=1`;
  superagent.get(url)
  .then(results => {
  console.log('movie results via superagent ', results.body.results);
  let movieData = results.body;
  let movieResults = movieData.map((obj) => (new Movie (obj)));

  response.status(200).send(movieResults);
  })
  // .catch(err => {
  //   console.error(err);
  //   response.status(500).send(err);
  // }).catch(err => errorHandler(err, response));
});
app.get('/yelp', (request,response)=>{
  let city = request.query.city;
  let url = `https://api.yelp.com/v3/businesses/search?location=${city}`;
  superagent.get(url)
  .set({"Authorization": `Bearer ${process.env.YELP_API_KEY}`
})
  .then(results => {
    let newYelp = results.body.businesses.map(obj => new Yelp(obj));
    
    response.status(200).send(newYelp);
  })
  // .catch(err => errorhandler(err, response));
});


  

//constructor function
//movie constructor
function Movie(obj){
  this.title = obj.title;
  this.overview = obj.overview;
  this.average_votes = obj.vote_average;
  this.total_votes = obj.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w300_and_h450_bestv2${obj.backdrop_path}`;
  this.popularity = obj.popularity;
  this.released_on = obj.release_date;
}
function Location(obj, city){
  this.search_query = city;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

function Weather(obj){
  this.time = new Date(obj.datetime * 1000).toDateString();
  this.forecast = obj.weather.description;
}
function Trail(obj){
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.stars = obj.stars;
  this.summary = obj.summary;
  this.trail_url = obj.url;
  this.conditions = obj.conditionStatus;
  this.condition_date = obj.conditionDate.slice(0,10);
  this.condition_time = obj.conditionDate.slice(11,19);
  }

function Yelp(obj){
  this.name = obj.name;
  this.image_url = obj.image_url;
  this.price = obj.price;
  this.rating = obj.rating;
  this.url = obj.url;
}

function errorHandler (err, response){
  console.error(err);
  if(response){
    response.status(500).send('Sorry, I can\'t help with that.');
  }
}

//if response is a 404 messeage then the log will say 
app.get('*',(request,response)=>{
  response.status(404).send('sorry something is wrong');
  })
//turn on server
client.connect()
  .then(()=> {
    app.listen(PORT, () => {
      console.log(`listening on ${PORT}`);
    });
  });