const { query } = require('express');
const express = require ('express');
const fs = require('fs'); 
const { getRandomImage } = require('../data/sqlite');
const database = require('../data/sqlite');

// open the database
database.connect();


const router = express.Router ();

router.get ('/', (req, res) => {
  res.send('Ça marche!');
});

router.get ('/image', async function(req, res){
  let idphoto = req.query.idcurrent;

  if(!/^[a-zA-Z0-9_.]*$/.test(idphoto))
  {
    const image= await database.getRandomImage();
    res.send(fs.readFileSync(image.Path));
  }
  console.log((new Date()).toUTCString()+' - ' +idphoto);
  const image= await database.getImage2(idphoto);
  if(image==undefined || !image)
  {
    const image= await database.getRandomImage();
    res.send(fs.readFileSync(image.Path));
    return;
  }

  
  const path = image.Path;
  if(isPhoto(path)){
    console.log((new Date()).toUTCString()+' - ' +path);
    let data = fs.readFileSync(path);
    res.send(data);
    return;
  }
  else{
    const image= await database.getRandomImage();
    res.send(fs.readFileSync(image.Path));
  }
});


router.get ('/next', async (req, res) => {
  const image= await database.getRandomImage();
  res.send(image.Name);
});


router.get ('/favicon.ico', (req, res) => {
  var data = fs.readFileSync('client/image/logo.ico');
  res.send(data);
});

isPhoto =function (path)
{
  return /^.*(\.jpg|\.jpeg)$/i.test(path);
}


module.exports = router;
