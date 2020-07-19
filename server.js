
//requier
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');

//main variables 
const app = express();
const PORT = process.env.PORT || 4000; 
const client = new pg.Client(process.env.DATABASE_URL);
//uses 
app.use(express.static('./public'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(methodOverride('_method'));


//================(Routes)======================\\
app.get('/',homePageHandler);
app.get('/addToFav',addToFavHandler);
app.get('/selectedData',selectedDataHandler);
app.get('/details/:digi_id',detailsHandler);
app.put('/update/:update_id',updateHandler);
app.delete('/delete/:delete_id',deleteHandler)

//================(Routes Hanndlers)======================\\
function homePageHandler(req,res){
    let url ='https://digimon-api.herokuapp.com/api/digimon';
    superagent.get(url)
    .then(data=>{
        let digiArray = data.body.map(val=>{
            return new Digimon(val)
        })
        res.render('index',{data:digiArray})
    })
}

function Digimon(val){
    this.name = val.name   || 'none';
    this.image = val.img   || 'none' ;
    this.level = val.level || 'none';

}

 function addToFavHandler(req,res){

    let {name,image,level}=req.query;
    let sql = 'INSERT INTO digi_test (name,image,level) VALUES($1,$2,$3);'
    let safevalues=[name,image,level];
    client.query(sql,safevalues).then(()=>{
        res.redirect('/selectedData')
    })

 }

 function  selectedDataHandler(req,res){
     let sql ='SELECT * FROM digi_test;';
     client.query(sql).then(result=>{
         res.render('pages/favorite',{data:result.rows})
     })
 }

 function detailsHandler(req,res){
     let param = req.params.digi_id;
     let sql = 'SELECT * FROM digi_test WHERE id=$1;';
     let safevalues = [param];
     client.query(sql,safevalues).then(val=>{
         res.render('pages/details',{data:val.rows[0]})
     })
 }


 function updateHandler (req,res){
     let param = req.params.update_id;
     let {name,image,level}=req.body;
     let sql = 'UPDATE digi_test set name=$1,image=$2,level=$3 WHERE id=$4'
     let safevalues=[name,image,level,param];
     client.query(sql,safevalues).then(()=>{
         res.redirect(`/details/${param}`)

     })


 }

 function deleteHandler(req,res){
     let param = req.params.delete_id;
     let sql='DELETE FROM digi_test WHERE id=$1;';
    let safevalues=[param];
    client.query(sql,safevalues).then(()=>{
        res.redirect('/selectedData')
    })
 }

client.connect().then(()=>{
    app.listen(PORT,()=>{
        console.log(`working on ${PORT}`);
    });
});
