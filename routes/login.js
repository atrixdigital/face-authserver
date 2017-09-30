const express = require('express');
const oxford = require('project-oxford'), client = new oxford.Client('f6a99bdaf2984db0bc9033a37d6d6c74','westcentralus');
let router = express.Router();
var shortid = require('shortid');
var base64Img = require('base64-img');
var fs = require('fs');

var app = require('../firebase');

var faceListId = '121';



router.post('/login',function(req,res){
    var photoBase64 = req.body.photo;

    var uid = shortid.generate();

    new Promise(
        function(resolve,reject){
            let currentImg;
            base64Img.img(photoBase64, './files/', uid , function(err, filepath) {
                if(err) {
                    console.log(err);
                    reject("err");
                }
                    currentImg = filepath; 
              
            });

            setTimeout(function(){
                resolve('success'); // Yay! Everything went well!
               }, 2000);
    }).then(function(data){
        console.log(data);
       
                client.face.detect({
                    path: 'files/'+uid+'.jpg',
                    returnFaceId: true
                    })
                    .then(response => {

                        fs.unlink("files/"+uid+".jpg", function (err) {
                          if (err) throw err;
                          console.log('File deleted!', "files/"+uid+".jpg");
                        });  

                        console.log(response);
                      
                      if(response.length === 1){

                      
                        /*sending the detected face id to the project-oxford "similar()" */
                        client.face.similar(response[0].faceId, {
                            candidateFaceListId: faceListId,
                            maxCandidates: "1",
                            mode:"matchFace"	
                        }).then(response => {
                            /*for finding the face with higest confidence*/
                            console.log(response);
                            let higest = response[0];
                            
                          

                            console.log(higest.confidence);

                            if(higest.confidence > 0.7){

                                  app.database().ref('/users/' + higest.persistedFaceId).once('value').then(function(snapshot) {
                                       console.log(snapshot.val());
                                        
                                       if(snapshot.val() === null){
                                        res.json({success:fasle,data:"No record found in database"}); 
                                       }else{
                                        res.json({success:true,data:snapshot.val()}); 
                                       }

                                           
                                    })

                            } else{

                                res.json({success:true,data:"Not a Member. Scan again"});

                            }

                          

                         }).catch(err =>{
                            console.log("Error: " + err.message);
                            res.json({success:false, data:err});
                        }) 

                    }else{
                        res.json({success:false, data:"Invalid photo"}); 
                    }
                       

         }).catch(err =>{
            console.log("Error: " + err.message);
            res.json({success:false, data:err});
    
         });
        
   
},function(err){
    
console.log("error accured" + err);

res.json({success:false,data:err});
    
});

});

module.exports = router;