'use strict';

//libraries

//My server
const express = require('express'); //it allows access to express
const app = express();// allows you to put methoids in express

require('dotenv').config();//grabs varibles from hiding spot from env file

//the underpaid secuirty gaurd
const cors = require('cors');// allows you to allow access to different sources with some security
app.use(cors());// invokes cors

const PORT = process.env.PORT || 3001; // defines port as either whats inside .env or 3001

//application gets location and sends a request to server
app.get('/location',(request,response)=>{

  try{// tests for errors 
    let city = request.query.city;//grab city data from qury
    console.log(city);// should output city dat in console 
    let geo = require('./data/geo.json');// allows access to json 
  
    let location = new Location(geo[0],city)// uses constructor of Location to make a new location instance using the parameters which is the first index of geo and city which was defined in the query up above
    response.send(location);//sends location instance we just defined to the request
  }
  catch(err){// if it fails the error test it sets it below
    response.status(500).send(err)// sends error 500 
    console.error(err)
  }
})

app.get('/weather', (request, response) =>{
  // figure out what the front end sent us
  // console.log('this is the information the front end sent us', request.query);
  // { search_query: 'seattle',
  // formatted_query: 'Lynnwood, Snohomish County, Washington, USA',
  // latitude: '47.8278656',
  // longitude: '-122.3053932' }
  let city = request.query.search_query;
  let formatted_query = request.query.formatted_query;
  let latitude = request.query.latitude;
  let longitude = request.query.longitude;


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