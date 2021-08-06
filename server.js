
const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();

app.use(express.static(path.join(__dirname, '/public')));

// countries_list = countries.map((c) => c.name)

// console.log(countries_list)

// console.log(countries[0].name)
// console.log(countries[0].cities[0].name)

// const {translate} = require('@paiva/translation-google');
 
// translate([
//   countries[0].cities[0].name  
// ], {from:'en', to: 'ar'}).then(res => {
//     console.log(res.text);
//     console.log(res.from.language.iso);
// }).catch(err => {
//     console.error(err);
// });

router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/views/main.html'));
  // res.render(path.join(__dirname+'/index.html'), {countries:countries_list});
  //__dirname : It will resolve to your project folder.
});

// router.get('/countries',function(req,res){
//   res.send(countries_list);
//   // res.render(path.join(__dirname+'/index.html'), {countries:countries_list});
//   //__dirname : It will resolve to your project folder.
// });

//add the router
app.use('/', router);
app.listen(process.env.port || 5501);

console.log('Running at Port 5501');