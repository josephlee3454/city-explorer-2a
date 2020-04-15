'use strict';

//libraries

//My server
const express = require('express'); //it allows access to express
const app = express();// allows you to put methoids in express
const superagent =require('superagent');
require('dotenv').config();//grabs varibles from hiding spot from env file

//the underpaid secuirty gaurd
const cors = require('cors');// allows you to allow access to different sources with some security
app.use(cors());// invokes cors

const PORT = process.env.PORT || 3001; // defines port as either whats inside .env or 3001




//application gets location and sends a request to server
app.get('/location', (request, response) => {

  try{// tests for errors 
    let city = request.query.city;//grab city data from qury
    let key = process.env.GEOCODE_API_KEY;
    const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
    console.log('city', city)
    superagent.get(url)
        .then(results => {
          let searchCity = results.body[0];
          console.log('searchCity, city');
          let location = new Location(searchCity, city);
          console.log('locationData', location);
          response.status(200).send(location);
        })
  }
  catch(err){// if it fails the error test it sets it below
    response.status(500).send(err)// sends error 500 
    console.error('you messed up')
  }
})

app.get('/weather', (request, response) =>{
  // figure out what the front end sent us
  // console.log('this is the information the front end sent us', request.query);
  // { search_query: 'seattle',
  // formatted_query: 'Lynnwood, Snohomish County, Washington, USA',
  // latitude: '47.8278656',
  // longitude: '-122.3053932' }
  // let city = request.query.search_query;
  // let formatted_query = request.query.formatted_query;
  // let latitude = request.query.latitude;
  // let longitude = request.query.longitude;


  // get data from the darksky file
  let weather = require('./data/darksky.json');
  let weatherArray = weather.daily.data;

  // run it through a constructor function
  const finalWeatherArray = weatherArray.map(day => {
    return new Weather(day);
  })
  // send it to the frontend
  response.send(finalWeatherArray);
})



//constructor function
function Location(obj, city){
  this.search_query = city;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

function Weather(obj){
  this.time = new Date(obj.time * 1000).toDateString();
  this.forecast = obj.summary;
}

//if response is a 404 messeage then the log will say 
app.get('*',(request,response)=>{
  response.status(404).send('sorry something is wrong');
  })
  // tells you its lisenting to the port 
  app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
  })