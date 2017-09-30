const express = require('express');
const oxford = require('project-oxford'), client = new oxford.Client('f6a99bdaf2984db0bc9033a37d6d6c74','westcentralus');
let router = express.Router();
var base64Img = require('base64-img');
var shortid = require('shortid');
var fs = require('fs');


var cloudinary = require('cloudinary');
var cloudConfig = require('../cloudinary');


cloudinary.config(cloudConfig);



router.post('/analyze',function(req,res){
	
	var photoBase64 = req.body.photo;
	var uid = shortid.generate();
    
  new Promise(
        function(resolve,reject){
            let currentImg;
            base64Img.img(photoBase64, './files/', uid, function(err, filepath) {
                if(err) {
                    return console.log(err);
                    reject(err);
                }
                    currentImg = filepath; 
              
            });

            setTimeout(function(){
                resolve('success'); // Yay! Everything went well!
               }, 2000);
         })
        .then(function(data){
            console.log(data);

             
            

                // we will have the result which has the url of picture
                    // we will now check if it has a face or not
                    client.face.detect({
                        path: "files/"+uid+".jpg",
                        analyzesAge: true,
                        analyzesEmotion: true,
                        analyzesGender	: true,
                        analyzesGlasses: true,
                        analyzesSmile : true

                        }).then(function(data){

                          if(data.length === 1){

                            fs.unlink("files/"+uid+".jpg", function (err) {
              							  if (err) throw err;
              							  console.log('File deleted!', "files/"+uid+".jpg");
              							});  

                            console.log(data[0]);

                            
                              

                            var emotion = data[0].faceAttributes.emotion;
                             var higiestEmotion;
                             var high = emotion['anger'];

                            for( var key in emotion){
                            	if(emotion[key] > high){
                                    high = emotion[key];
                                    higiestEmotion = key;
                            	}
                            }
                            
                             
                            
                             var attributes = {
                                  smile: data[0].faceAttributes.smile*100,
                                  gender : data[0].faceAttributes.gender,
                                  age : data[0].faceAttributes.age,
                                  glasses: data[0].faceAttributes.glasses ,
                                  emotion: higiestEmotion  

                             } 
                            res.json({success:true,data:attributes});


                             }else{
                           res.json({success:false,data:"Invalid photo. Send photo with single face only"});  
                        }   

                        

                        }).catch(function(err){
                            res.json({success:false,data:err.message})
                            console.log("Error in face detection"+ err.message);
                        })


                   


                


            },function(error){
              res.json({success:false,data:error.message});
            });

})



module.exports = router