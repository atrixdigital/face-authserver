const express = require('express');
const oxford = require('project-oxford'), client = new oxford.Client('f6a99bdaf2984db0bc9033a37d6d6c74','westcentralus');
let router = express.Router();
var shortid = require('shortid');
var base64Img = require('base64-img');

var app = require('../firebase');
var cloudinary = require('cloudinary');
var cloudConfig = require('../cloudinary');

cloudinary.config(cloudConfig);

var faceListId = '120';



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
        // res.json({success:true,data:data});

        //  upload to cloudinary
        cloudinary.v2.uploader.upload('./files/'+uid+'.jpg', function(error, result) {
            if(error){
                console.log("err occured");
                res.json({success:false,data:error})
            }
            
                console.log(result.url);
                // res.json({success:true,data:result.url});
                client.face.detect({
                    url: result.url,
                    returnFaceId: true
                    })
                    .then(response => {
                        console.log(response);
                      
                      if(response.length === 1){

                      
                        /*sending the detected face id to the project-oxrord "similar()" */
                        client.face.similar(response[0].faceId, {
                            candidateFaceListId: faceListId,
                            maxCandidates: "3",
                            mode:"matchFace"	
                        }).then(response => {
                            /*for finding the face with higest confidence*/
                            console.log(response);
                            let higest = response[0];
                            
                            for (var i = 1; i < 3; i++)
                            {	
                                if(response[i].confidence > higest.confidence)
                                    higest = response[i];

                                console.log(higest);
                            }

                            console.log(higest); 

                            app.database().ref('/users/' + higest.persistedFaceId).once('value').then(function(snapshot) {
                               console.log(snapshot.val());
                                
                               if(snapshot.val() === null){
                                res.json({success:fasle,data:"No record found in data base"}); 
                               }else{
                                res.json({success:true,data:snapshot.val()}); 
                               }

                                   
                            })

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
        
    });
},function(err){
    
console.log("error accured" + err);

res.json({success:false,data:err});
    
});

});

module.exports = router;