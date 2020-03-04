//dependencies required for the app
var express    = require("express");
var bodyParser = require("body-parser");
morgan = require('morgan');
jwt    = require('jsonwebtoken');
config = require('./configurations/config');
cors   = require('cors');
var app = express();

//set secret
app.set('Secret', config.secret);
// cors 
app.use(cors({credentials: true, origin: 'http://localhost:4200'}));
// use morgan to log requests to the console
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
//render css files
app.use(express.static("public"));

// parse application/json
app.use(bodyParser.json());
const  ProtectedRoutes = express.Router(); 
app.use('/api', ProtectedRoutes);
ProtectedRoutes.use((req, res, next) =>{

     
    // check header or url parameters or post parameters for token
    var token = req.headers['access-token'];
  
    // decode token
    if (token) {
  
      // verifies secret and checks exp
      jwt.verify(token, app.get('Secret'), (err, decoded) =>{      
        if (err) {
          return res.json({ success: false, message: 'Failed to authenticate token.' });    
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;    
          next();
        }
      });
  
    } else {
  
      // if there is no token
      // return an error
      return res.status(403).send({ 
     
          message: 'No token provided.' 
      });
  
    }
  });

  //set app to listen on port 3000
app.listen(3000, function() {
    console.log("server is running on port 3000");
});

/*app.get('/', function(req, res) {
    res.send('Hello world  ! app is running on http://localhost:3000/');
});
*/
app.post('/authenticate',(req,res)=>{

    if(req.body.username==="shryans-ja"){

        if(req.body.password==="gameoverstartagain"){
             //if eveything is okey let's create our token 
         
        const payload = {
            check:  true
 
          };

          var token = jwt.sign(payload, app.get('Secret'), {
            expiresIn: 1440 // expires in 24 hours
          });
  
          // return the informations to the client
          res.json({
            message: 'authentication done ',
            token: token
          });
       
        }else{
            res.json({message:"please check your password !"})
        }

    }else{
       
        res.json({message:"user not found !"})

    }

});

//placeholders for added task
var task = ["REST APIs", "API to authenticate ", "APi to todod curd"];
//placeholders for removed task
var complete = ["finish Test "];

//post route for adding new task 
app.post("/addtask", function(req, res) {
    var newTask = req.body.newtask;
    //add the new task from the post route
    task.push(newTask);
    res.redirect("/");
});

app.post("/removetask", function(req, res) {
    var completeTask = req.body.check;
    //check for the "typeof" the different completed task, then add into the complete task
    if (typeof completeTask === "string") {
        complete.push(completeTask);
        //check if the completed task already exits in the task when checked, then remove it
        task.splice(task.indexOf(completeTask), 1);
    } else if (typeof completeTask === "object") {
        for (var i = 0; i < completeTask.length; i++) {
            complete.push(completeTask[i]);
            task.splice(task.indexOf(completeTask[i]), 1);
        }
    }
    res.redirect("/");
});

//render the ejs and display added task, completed task
app.get("/", function(req, res) {
    res.render("index", { task: task, complete: complete });
});

