//dependencies
//---------------------------------------------------------------------------------------------
var express = require("express");
const db = require("./databases");
const multer  = require('multer')
const userModelInstance = require("./databases/models/user.js");
var session = require('express-session')
var fs = require('fs');
var sendEmail = require("./utils/sendEmail")
const bcrypt = require('bcrypt');
const saltRounds = 10;
const cartItemModel = require("./databases/models/cartItem.js");
const productModel = require("./databases/models/product.js");

//initializers
//---------------------------------------------------------------------------------------------
var app = express();
db.init();
const salt = bcrypt.genSaltSync(saltRounds);
const userModel = userModelInstance.model;
const userRoleEnums = userModelInstance.userRoleEnums;


//multipart/form-data; boundary=----WebKitFormBoundary4rFQUo2jcF8k1xvy
//------------------------------------------------------------------------------------------

app.set('view engine' , 'ejs');
app.use(express.urlencoded());
app.use(express.json());
app.use(express.static("profile_pics"));
app.use(express.static("productImg"));
app.use(express.static("scripts"));
app.use(express.static("styles"));
app.use(express.static("temp"));

app.use(session({
    secret: 'This is my secret birader',
    resave: false,
    saveUninitialized: true
  }))


// multer setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "profile_pics")
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })
  
const upload = multer({ storage: storage })

const storage2 = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "productImg")
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })

const productImg = multer({storage : storage2});
//routers
//--------------------------------------------------------------------------------------------

app.get("/",function(request,response){
    //console.log(request.session.isLoggedIn);
    readProduct(function(error,product){
        //console.log(product.length);
            if(error){
                response.status(404).end();
            }
            
            else if(request.session.isLoggedIn){
                request.session.length+=5
                if(product.length<request.session.length){
                    request.session.length = product.length
                }
                
                if(request.session.userType==userRoleEnums.admin){
                    response.render("adminHome",{
                        username: request.session.username ,
                        profile_picture : request.session.profile_picture ,
                        product : product,
                        length : request.session.length,
                        userType : request.session.userType
                    });
                    return;
                }

                response.render("home",{
                    username: request.session.username ,
                    profile_picture : request.session.profile_picture ,
                    product : product,
                    length : request.session.length,
                    userType : request.session.userType
                });    
            }
            else{
                if(!request.session.length){
                    if(product.length<5){
                        request.session.length = product.length
                    }
                    else{
                        request.session.length=5;
                    }
                }
                else{
                    request.session.length+=5;
                    if(product.length<request.session.length){
                        request.session.length = product.length
                    }
                }
                response.render("home",{
                    username: "" ,
                    profile_picture : "" ,
                    product : product,
                    length : request.session.length,
                    userType : 2
                });
            }
    })  
})

app.get("/login",function(request,response){
    response.status(200).render('login',{error : ""});
})

app.post("/login",function(request,response){
    var username = request.body.username;
    var password = request.body.password;
    //console.log(username,typeof(username),password,typeof(password));
    userModel.findOne({username : username , password : password})
    .then(function(user){
         //console.log(user);
         if(user.isVerified==false){
             response.render("login",{error : "Please Verify Your email"});
             return;
         }
         request.session.userId = user._id;
         request.session.username = user.username;
         request.session.profile_picture = user.profile_picture;
         request.session.length = 5;
         request.session.userType = user.userType;
 
         request.session.isLoggedIn = true;
 
         readProduct(function(error,product){
            if(error){
                response.status(404).end();
            }
            else{
                if(product.length<5){
                    request.session.length = product.length
                }
                else{
                    request.session.length=5;
                }
                if(request.session.userType==userRoleEnums.admin){
                    response.render("adminHome",{
                        username: request.session.username ,
                        profile_picture : request.session.profile_picture ,
                        product : product,
                        length : request.session.length,
                        userType : request.session.userType
                    });
                    return;
                }
                response.render("home",{
                    username: request.session.username , 
                    profile_picture : request.session.profile_picture ,
                    product : product,
                    length : request.session.length,
                    userType : request.session.userType
                });
            }
        })
 
    })
    .catch(function(){
         response.render("login",{error : "User Not Found"});
    })
})

app.get("/signUp",function(request,response){
    response.status(200).render('signUp',{error : ""});
})

app.post("/signUp",upload.single("profile_picture"),function(request,response){
    var user = request.body;

    var username = user.username;
    var password = (user.password);
    var email = user.email;
    var profile_picture = request.file;

    if(!username){
        response.render("signUp",{error : "Username is compulsory"});
        return;
    }

    if(!password){
        response.render("signUp",{error : "Password is compulsory"});
        return;
    }

    if(!email){
        response.render("signUp",{error : "e-mail is compulsory"});
        return;
    }

    if(!profile_picture){
        response.render("signUp",{error : "profile pic required"});
        return;
    }

    userModel.create({
        username : username,
        password : password,
        email : email,
        profile_picture : profile_picture.filename,
        isVerified : false,
        userType : userRoleEnums.customer
    })
    .then(function(user){
        var userid = user._id;
        //console.log(userid);
        var url = '<a href = "http://localhost:5500/verifyEmail/'+userid+'" >Verify karle bhai</a>'
        sendEmail(
            user.email,
            "Welcome To E-com",
            "Please Click the below link to verify your email",
            url,
            function(error){
                if(error){
                    response.render("login",{error : "verification failed"});
                }
                else{
                    response.render("login",{error : "Please Check email and verify"});
                }
            }
        );
    })
    .catch(function(error){
        response.render("signUp",{error : error});
    })
})

app.get("/logout",function(request,response){
   // console.log("receivieved");
    request.session.destroy();
    response.status(200).send("/");
})


app.get("/loadMore",function(request,response){
    
    
    var usertype;
    if(request.session.isLoggedIn){
        usertype = request.session.userType
    }
    else{
        usertype=1;
    }
    readProduct(function(error,product){
        if(error){
            response.status(404).end();
        }
        if(product.length<request.session.length){
            request.session.length = product.length
            if(usertype==userRoleEnums.admin){
                response.render("adminHome",{
                    username: request.session.username ,
                    profile_picture : request.session.profile_picture ,
                    product : product,
                    length : request.session.length,
                    userType : request.session.userType
                });
                return;
            }
            response.render("home",{
                username: request.session.username,
                profile_picture : request.session.profile_picture ,
                product : product,
                length : product.length,
                userType : usertype
            });
        }
        else{
            response.status(200).end("/");
            //console.log(request.session.length);
            //response.render("home",{username: request.session.username , profile_picture : request.session.profile_picture ,product : product,length : request.session.length});
        }
    })
})


app.get("/verifyEmail/:userId",function(request,response){    
    //console.log("erveca");
    var currUserId = request.params.userId;
    //console.log(currUserId)
    userModel.updateOne({_id : currUserId},{$set : {isVerified : true}})
    .then(function(data){
        console.log(data);
        if(data.matchedCount==0){
            response.render("login",{error : "Something went wrong !!"});
            return;
        }
        response.render("login",{error : "Veification Successful"});
    })
    .catch(function(){
        response.render("login",{error : "Verification failed"});
    })
})

app.get("/changePasswordPage",function(request,response){
    response.send("/changePassword");
})

app.get("/changePassword",function(request,response){
    //console.log(request.session.isLoggedIn);
    if(request.session.isLoggedIn){
        response.render("changePassword",{error: ""});
        return;
    }
    response.render("login",{error : "Please Login"});
})

app.post("/changePassword",function(request,response){
    //console.log(request.body.isLoggedIn);
    if(!request.session.isLoggedIn){
        response.render("login",{error : "Please Login"});
        return;
    }
    userModel.updateOne(
        {
            username : request.session.username,
            password : request.body.oldPassword
        },
        {
            $set : {
                password : request.body.newPassword
            }
        }
    )
    .then(function(data){
        if(data.matchedCount==0){
            response.render("changePassword" , {error : "Old Password Didn't Match"});
            return;
        }
        response.redirect("/");
    })
    .catch(function(error){
        response.render("changePassword" , {error : "Old Password Didn't Match"});
    })
})

app.route("/forgotPassword").get(function(request,response){
    response.render("forgotPassword",{error : ""});
})
.post(function(request,response){
    if(!request.body.email){
        response.render("forgotPassword",{error:"Enter your email bitch"});
        return;
    }
    userModel.findOne({email:request.body.email}).then(function(data){
        if(!data){
            response.render("forgotPassword",{error : "Entered email is not registered with us"});
            return;
        }
        sendEmail(
            request.body.email,
            "Change your E-com Password",
            "",
            '<a href = "http://localhost:5500/forgotPasswordPage/'+request.body.email+'">Reset Password</a>',
            function(error){
                if(error){
                    response.render("forgotPassword",{error : "Something is Not right"})
                }
                else{
                    //console.log("xfcgvjhbkjnlk");
                    response.render("forgotPassword",{error : "Reset Password Link is Sent to registered Email"});
                }
            }
        )
    }).catch(function(){
        response.render("forgotPassword",{error : "something is not right"});
    })  
})

app.get("/forgotPasswordPage/:email",function(request,response){
    var currEmail = request.params.email;
    request.session.email = currEmail;
    response.render("newPassword",{error:""});
})

app.post("/forgotPasswordPage/",function(request,response){
    var currEmail = request.session.email;
    request.session.destroy();

    if(request.body.newPassword==""){
        response.render("newPassword",{error:"please enter a valid password"});
    }
    else{
        userModel.updateOne({email:currEmail},{$set : {password:request.body.newPassword}})
        .then(function(){
            response.render("login",{error:"Password change Successfully"});
        })
        .catch(function(){
            response.render("newPassword",{error:"Something wwnt wrong"});
        })
    }
})


app.post("/getProduct",function(request,response){
    var id = request.body;
    //console.log(id);
    readProduct(function(error,data){
        if(error){
            response.status(404).end();
        }
        else{
            var currProduct = data.filter(function(product){
                if(product._id==id.id){
                    return true;
                }
            })
            //console.log(currProduct);
            response.status(200).send(JSON.stringify(currProduct[0]));
        }
    })
})

app.post("/addToCart",function(request,response){
    var product = request.body;
    //console.log(product);
    if(request.session.isLoggedIn){
        cartItemModel.findOne({product_id : product.id,userId : request.session.userId}).then(function(data){
            if(data==null){
                readProduct(function(error,data){
                    if(error){
                        response.status(409).send();
                    }
                    else{
                        var currProduct = data.filter(function(element){
                            if(element._id==product.id){
                                return true;
                            }
                        })
                        
                        //console.log(currProduct);
                        cartItemModel.create({
                            product_id : currProduct[0]._id,
                            img : currProduct[0].img,
                            title : currProduct[0].title,
                            description : currProduct[0].description,
                            userId : request.session.userId
                        })
                        .then(function(data){
                            //console.log(data);
                            response.status(200).end();
                        })
                        .catch(function(){
                            response.status(409).end();
                        })
                    }
                })
            }
            else{
                response.status(409).send();
            }
        })
    }
    else{
        response.status(401).send();
    }
    
})

app.get("/goToMyCart",function(request,response){
    if(request.session.isLoggedIn){
        
        cartItemModel.find({userId : request.session.userId})
        .then(function(array){
            response.status(200).render('cart',{error:"",products : array});
        })
        .catch(function(){
            var array = [];
            response.status(404).render('cart',{error : "Something is Not right",products : array});
        })

    }
    else{
        response.status(404).render('login',{error : "Please Login"});
    }
})

app.get("/myCart",function(request,response){
    if(request.session.isLoggedIn){
        response.status(200).send("/goToMyCart");
    }
    else{
        response.status(404).end();
    }
})

app.post("/updateQuantity",function(request,response){
    if(request.operation==="D"&&parseInt(request.quantity)<=0){
        response.status(422).send();
        return;
    }
    //console.log(request.body);
    cartItemModel.updateOne(
        {
            userId : request.session.userId,
            product_id : request.body.product_id
        },
        { 
            $set : {
                quantity : parseInt(request.body.quantity)
            }
    })
    .then(function(data){
        console.log(data);
        response.status(200).send();
    })
    .catch(function(){
        response.status(404).send();
    })
})


app.post("/removeFromCart",function(request,response){
    cartItemModel.deleteOne({product_id : request.body.product_id,userId:request.session.userId})
    .then(function(data){
        if(data.deletedCount==0){
            response.status(404).send();
        }
        else{
            response.status(200).send();
        }
    })
    .catch(function(){
        response.status(404).send();
    })
})


app.get("/addProductPage",function(request,response){
    
    if(!request.session.isLoggedIn){
        response.render("login",{error : "Please Login"});
        return;
    }

    if(request.session.userType==2){{
        response.render("login",{error : "Unauthorized to access this page BITCH"});
        return;
    }}
    response.render("addproduct",{error : ""});
})


app.route("/ProductManipulate")
.post(productImg.single("img"),function(request,response){
    if(request.body.title==""||request.body.description==""||request.body.stock==""||!request.file){
        response.render("addProductPage",{error : "Fields cannot be empty"});
    }

    productModel.create({
        img : request.file.filename,
        title : request.body.title,
        description : request.body.description,
        stock : parseInt(request.body.stock)
    })
    .then(function(product){
        response.status(200).redirect("/");
    })
    .catch(function(error){
        response.status(404).render("addProduct",{error:"Something went wrong"});
    })
})
.delete(function(request,response){
    var id = request.body.id;
    productModel.deleteOne({_id : id})
    .then(function(data){
        if(data.deletedCount==0){
            response.status(404).send();
        }
        else{
            response.status(200).send();
        }
    })
    .catch(function(error){
        response.status(404).end();
    })
})

app.get("/editProductPage/:product_id",function(request,response){
    var id = request.params.product_id;

    productModel.findOne({_id : id})
    .then(function(data){
        console.log(data);
        if(data!=null){
            response.render("editProduct",{product : data , product_id : id,error : ""});
        }
        else{
            response.status(404).send()
        }   
    })
    .catch(function(){
        response.status(404).send();
    })
})

app.post("/productUpdate/:product_id",function(request,response){
    var id = request.params.product_id;
    productModel.updateOne({_id : id},{$set : request.body})
    .then(function(data){
        console.log(data);
        response.redirect("/")
    })
    .catch(function(){
        response.redirect("/");
    })
})

//--------------------------------------------------------------------------------------------

function readProduct(callback){
    productModel.find({})
    .then(function(data){
        //console.log(data);
        callback(null,data);
    })
    .catch(function(error){
        callback(error,null);
    })
}



//-------------------------------------------------------------------------
app.listen(5500,()=>{
    console.log("Server is live on port 5500");
})