/**
 * Created by shubham on 12/7/17.
 */

// Keep track of which names are used so that there are no duplicates

var slickChat = (function () {
    var sc = this;
    var channelMessages = {};
    var channels = [
        {
            name: "Project training",
            createdBy :"Shubham Singh",
            user: ["Shubham Singh"],
            description :"We do something cool everyday"
        }
    ];
    var userMessages = {};
    var users = [];

    var setNewUser = function (user) {
        var userPresent = false;
        for(var i=0;i<sc.users.length;i++){
            if(sc.users[i].name === user.name){
                console.log("returning user: "+ sc.users);
                userPresent = true;
                sc.users[i].online = true;
                return;
            }
        }
        if(userPresent === false){
            sc.users.push({
                name: user.name,
                userImage:user.userImage,
                online:true
            });
            console.log("new user to list: "+ sc.users);
        }
    };

    var channelList = function () {
        return sc.channels;
    };

    var addChannel = function (channelDetails,creatorName) {
        sc.channels.push({
            name: channelDetails.name,
            createdBy :creatorName,
            user: [creatorName],
            description : channelDetails.description
        });
        console.log("new channel added: "+channelDetails.name);
    };

    var channelMessageList = function (channelName,message) {
      sc.channelMessages[channelName].push({
          user: message.user,
          text: message.message,
          time: message.time,
          userImage: message.userImage
      })
    };

    var returnChannelMessageList = function (channelName) {
        return sc.channelMessages[channelName];
    };

    var setUserOffline = function (userName) {
        for(var i=0;i<sc.users.length;i++){
            if(sc.users[i].name === userName){
                sc.users[i].online = false;
                return;
            }
        }
    };

    return{
        setNewUser:setNewUser,
        channelList:channelList,
        channelMessageList:channelMessageList,
        addChannel:addChannel,
        returnChannelMessageList:returnChannelMessageList,
        setUserOffline: setUserOffline
    }


}());
var userNames = (function () {
    var uN = this;
    uN.names = [];
    uN.message = [];


        // find the lowest unused "guest" name and claim it
    var setUserName = function (data) {
        for(var i=0;i<uN.names.length;i++){
            if(uN.names[i].name === data.name){
                uN.names[i].online = true;
                return;
            }
        }
        uN.names.push({name: data.name,userImage:data.userImage,online:true});
        console.log(uN.names)
    };

    var getMessage = function (data) {
        uN.message.push({
            user: data.user,
            text: data.message,
            time: data.time,
            userImage: data.userImage
        })
    };
    var sendMessage = function () {
        // console.log("=======uN.message=====");
        // console.log(uN.message);
        return uN.message;
    };

    var getUsersList = function () {
        return uN.names;
    };

    var setUserOffline = function (userName) {
        for(var i=0;i<uN.names.length;i++){
            if(uN.names[i].name === userName){
                uN.names[i].online = false;
                return;
            }
        }
    };


    // serialize claimed names as an array
    var newUserLogin = function () {
        return uN.names;
    };

    var free = function (name) {
        if (names[name]) {
            delete names[name];
        }
    };

    return {
        free: free,
        setUserName: setUserName,
        newUserLogin: newUserLogin,
        getmessage: getMessage,
        sendMessage: sendMessage,
        getUsersList: getUsersList,
        setUserOffline:setUserOffline
    };
}());
// export function for listening to the socket
module.exports = function (socket) {
    // send the new user their name and a list of users
    socket.on('init', function (data) {
        userNames.setUserName(data);
        socket.emit('allUsers',{
            newUserLogin :data
        });
        socket.emit('initMessages',{
            messages :userNames.sendMessage(),
            userList:userNames.getUsersList()
        });
        socket.emit('user:login',{
            userName: data.name
        });
        socket.broadcast.emit('user:join', {
            userName: data.name
        });
        console.log(data.name);
    });

    // notify other clients that a new user has joined
    // socket.broadcast.emit('user:join', {
    //     name: name
    // });

    // broadcast a user's message to other users
    socket.emit('allUsers',{
        usersList :userNames.getUsersList(),
        messages: userNames.sendMessage()
    });

    socket.on('send:message', function (data) {
        userNames.getmessage(data);
        socket.broadcast.emit('send:message', {
            user: data.user,
            text: data.message,
            time: data.time,
            userImage: data.userImage
        });
    });

    // validate a user's name change, and broadcast it on success
    socket.on('change:name', function (data, fn) {
        if (userNames.claim(data.name)) {
            var oldName = name;
            userNames.free(oldName);

            name = data.name;

            socket.broadcast.emit('change:name', {
                oldName: oldName,
                newName: name
            });

            fn(true);
        } else {
            fn(false);
        }
    });


    socket.on('useLogOut', function (data) {
        console.log(data);
        userNames.setUserOffline(data.userName);
        console.log(data.userName);
        socket.emit('user:left', {
            userName: data.userName
        });
    });


};
