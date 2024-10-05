let express = require('express');
let app = express();
let http = require('http');
let server = http.createServer(app);
let {v4 : uuidV4} = require('uuid');
let socket = require('socket.io');
let bodyParser = require('body-parser');


let io = socket(server);
let users = [];
let userJoined = false;
let mainUser;

app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static('public'));
app.set('view engine' , 'ejs');



app.get('/' , (req , res)=>{

    res.render('intro');

});

app.post('/createRoom' , (req , res)=>{

    userJoined = false;
   
    Username = req.body.username;

   res.redirect(`/${uuidV4()}`);



});
app.post('/joinRoom' , (req , res)=>{

    userJoined = true;

    

    joinName = req.body.username;
    let sourceRoom = req.body.roomcode;

    

  
   res.redirect(`${sourceRoom}`);

});

app.get('/:room' , (req , res)=>{
    
 
  
 
    res.render('room' , {RoomId : req.params.room});
   

   
  

});



io.on('connection' , (socket)=>{

  let roomName;

  let myClients;

mainUser = socket.id;
 
   socket.on('join-room' , (room)=>{

    roomName = room;

  

    if(userJoined)
    {
        socket.nickname = joinName;
       
    }else{
        socket.nickname = Username;
      
    }
  


    socket.join(room);
    

    var clients = io.sockets.adapter.rooms[room].sockets;

    if(!userJoined)
    {
    clients[socket.id] = Username;
    }else{
        clients[socket.id] = joinName;
    }

    myClients = clients;

     io.to(roomName).emit('getUsers', clients);
        
      

       

    })
   
    socket.on('disconnect' , ()=>{

    io.to(roomName).emit('getUsers', myClients);
    
    });
  
      

      socket.on('message' , (data)=>{

      

      
        socket.to(roomName).broadcast.emit('recieved-message' , {data : data.message , username : socket.nickname});
          
         

           
        });

        
        socket.on('send-Image' , (data)=>{

          

            socket.to(roomName).broadcast.emit('recieved-image' , {data : data.data , username : socket.nickname});


          })


          socket.on('send-video' , (data)=>{

            socket.to(roomName).broadcast.emit('recieved-video' , {data : data.data , username : socket.nickname});

          });

          socket.on('send-audio' , (data)=>{

            socket.to(roomName).broadcast.emit('recieved-audio' , {data : data.data , username : socket.nickname});
          });

          socket.on('typing' , (data)=>{
           if(data.data != '')
           {
              socket.to(roomName).broadcast.emit('is-typing' , {message : socket.nickname +' '+data.data});
           }else{
            socket.to(roomName).broadcast.emit('is-typing' , {message : ''});
           }
            
          });




});




server.listen(8080);