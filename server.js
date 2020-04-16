'use strict';

//libraries

//My server
const express = require('express'); //it allows access to express
const app = express();// allows you to put methoids in express

//pg
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
//superagent
const superagent =require('superagent');
require('dotenv').config();//grabs varibles from hiding spot from env file

//the underpaid secuirty gaurd
const cors = require('cors');// allows you to allow access to different sources with some security
app.use(cors());// invokes cors

const PORT = process.env.PORT || 3001; // defines port as either whats inside .env or 3001


//location

//application gets location and sends a request to server
app.get('/location', (request, response) => {

    let city = request.query.city;//grab city data from qury
    let key = process.env.GEOCODE_API_KEY;
    console.log('city', city);
    let url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;
    superagent.get(url)
        .then(results => {
          let location = new Location(results.body[0]);
          console.log('locationData', location);
          response.status(200).send(location);
        }).catch(err => {// if it fails the error test it sets it below
    response.status(500).send(err);// sends error 500 
    console.error('you messed up');
  })
})
///weather
app.get('/weather', (request, response) =>{
  console.log(request.query)
  // get data from the darksky file
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
  }).catch(err=>{
    console.log('its messed up', err)
    response.send(err)
  })
})
app.get('/trails', (request, response) => {
  let {latitude,longitude} = request.query;
  let trailKey =process.env.TRAILS_API_KEY;
  let urlTrail = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxDistance=10&key=${trailKey}`;
 
  superagent.get(urlTrail)
    .then(results => {
      let trail = results.body.trails;
      const dataObj = trail.map(trail => new Trail(trail));
      response.status(200).send(dataObj);
    }).catch(err=>{
      console.log('its messed up', err)
      response.send(err)
    });
});

//constructor function
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

//if response is a 404 messeage then the log will say 
app.get('*',(request,response)=>{
  response.status(404).send('sorry something is wrong');
  })
  // tells you its lisenting to the port 
  client.connect()
  .then(() => {
  app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
  })
}).catch(err => {
  console.log('hey your misssing stuff', err);
  response.status(500).send(err);
})