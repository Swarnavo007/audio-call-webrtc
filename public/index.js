const socket = io('/');
const peer = new Peer(undefined, {
  secure: true, 
  host: 'video-call-sp-peer.herokuapp.com', 
  port: 443,
});
let myVideoStream;
let myId;
let userCount=0;
var videoGrid = document.getElementById('videoDiv')
var myvideo = document.createElement('video');
myvideo.muted = true;
const peerConnections = {}
navigator.mediaDevices.getUserMedia({
  video:false,
  audio:true
}).then((stream)=>{
  myVideoStream = stream;
  addVideo(myvideo , stream);
  peer.on('call' , call=>{
    call.answer(stream);
      const vid = document.createElement('video');
    call.on('stream' , userStream=>{
      addVideo(vid , userStream);
    })
    call.on('error' , (err)=>{
      alert(err)
    })
  })
}).catch(err=>{
    alert(err.message)
})
peer.on('open' , (id)=>{
  myId = id;
  socket.emit("newUser" , id , roomID);
})
peer.on('error' , (err)=>{
  alert(err.type);
});
socket.on('userJoined' , id=>{
  console.log("new user joined")
  userCount = userCount + 1;
  console.log(userCount);
  document.getElementById('audio').innerHTML = "New User connected, Lets chat"
  document.getElementById('userCount').innerHTML = "Number of users " + userCount;
  setTimeout(()=>{
    document.getElementById('audio').innerHTML = "";
    document.getElementById('userCount').innerHTML = "";
  }, 3000)
  const call  = peer.call(id , myVideoStream);
  const vid = document.createElement('video');
  call.on('error' , (err)=>{
    alert(err);
  })
  call.on('stream' , userStream=>{
    addVideo(vid , userStream);
  })
  call.on('close' , ()=>{
    vid.remove();
    console.log("user disconect")
    userCount = userCount - 1;
    document.getElementById('audio').innerHTML = "One user disconnected"
    document.getElementById('userCount').innerHTML = "Number of users " + userCount;
    setTimeout(()=>{
      document.getElementById('audio').innerHTML = "";
      document.getElementById('userCount').innerHTML = "";
    }, 5000)
  })
  peerConnections[id] = call;
})
socket.on('userDisconnect' , id=>{
  if(peerConnections[id]){
    peerConnections[id].close();
  }
})
function addVideo(video , stream){
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video);
}

