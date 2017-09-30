const express = require('express');
const oxford = require('project-oxford'), client = new oxford.Client('f6a99bdaf2984db0bc9033a37d6d6c74','westcentralus');
let router = express.Router();
var base64Img = require('base64-img');

// Key 1: f6a99bdaf2984db0bc9033a37d6d6c74
// Key 2: fded2dba0369421f8e7da3d8bf44ef89


var app = require('../firebase');
var cloudinary = require('cloudinary');
var cloudConfig = require('../cloudinary');


cloudinary.config(cloudConfig);





router.post('/signup',function(req,res){
    var name = req.body.name;
    var photoBase64 = req.body.photo;
    var faceListId = '121';

  new Promise(
        function(resolve,reject){
            let currentImg;
            base64Img.img(photoBase64, './files/', name, function(err, filepath) {
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
            

                cloudinary.v2.uploader.upload('./files/'+name+'.jpg', function(error, result) {
                if(error){
                    console.log("err occured");
                    res.json({success:false,data:error.message})
                }
                
                    console.log(result.url);
                    // we will have the result which has the url of picture
                    // we will now check if it has a face or not
                    client.face.detect({
                        url: result.url,
                        returnFaceId: true
                        }).then(function(data){

                            console.log(data.length);
                            if(data.length === 1){
                                console.log("This is data", data[0].faceId);
                                //  send data to face Api
                                //Send data to congitive API 
                                    let c = client.face;
                                    let f = c.faceList;

                                 // here we will check if that face is not already in the list
                                client.face.similar(data[0].faceId, {
                                        candidateFaceListId: faceListId,
                                        maxCandidates: "1",
                                        mode:"matchFace"    
                                    }).then(response => {
                                        /*for finding the face with higest confidence*/
                                        console.log(response);
                                        let higest = response[0];

                                        console.log(higest.confidence);

                                        if(higest.confidence > 0.7){
                                          res.json({success:false, data:"Already have an account with this face"});  
                                        }else{

                                            f.addFace(faceListId,{
                                                url:result.url,
                                                userData: name
                                            })
                                            .then((response)=>{/*Handle PersistantId into Data if no error found*/
                                                console.log(response);
                                                // save the data to firebase
                                                let data = {
                                                    // face_id:response.persistedFaceId,
                                                    face_list_id:faceListId,
                                                    name:name,
                                                    imgUrl: result.url
                                                }
                                                console.log(data);               
                                                console.log("face added " + data.name + " in list " + data.face_list_id );

                                                // save the data to firebase
                                                app.database().ref('users/').child(response.persistedFaceId).set(data).then(function(data){
                                                    res.json({success:true,data:data});    
                                                }).catch(function(error){
                                                    res.json({success:false,data:error});
                                                });
                                                
                                                
                                            
                                            }).catch((err)=>{
                                                res.json({success:false,data:err.message}); 
                                            });

                                        }
                                        
                                       

                                     }).catch(err =>{
                                        console.log("Error: " + err.message);
                                        res.json({success:false, data:err});
                                    })

                            }else{
                                res.json({success:false,data:"Invalid photo"});  
                            }

                        }).catch(function(err){
                            res.json({success:false,data:err.message})
                            console.log("Error in face detection"+ err.message);
                        })



                });


            },function(error){
              res.json({success:false,data:error.message});
            });



})

module.exports = router