/**
 * Created by shubham on 12/7/17.
 */

// Keep track of which names are used so that there are no duplicates

var slickChat = (function () {
    var sc = this;
    sc.userMessages = {};
    sc.channels = [
         {
            name: "Project training",
            createdBy: "Shubham",
            users: ["imshubhamsingh007@gmail.com"],
            description: "We do something cool everyday"
        },
        {
            name: "angularjs",
            createdBy: "Shubham",
            users: ["imshubhamsingh007@gmail.com"],
            description: "Angularjs is fun"
        }
    ];

    sc.channelMessages = {
        "Project training":[],
        "angularjs": []

    };
    sc.users = [];

    var setNewUser = function (user) {
        var userPresent = false;
        var i=0;
        for(;i<sc.users.length;i++){
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
            // console.log("new user to list: ");
            // console.log(sc.users[i--]);
        }
    };

    var channelList = function () {
        return sc.channels;
    };
    var userList = function () {
        return sc.users;
    };

    var addUserstoChannel = function (email,channel) {
        console.log(channel+"------");
        for(var i = 0; i<sc.channels.length;i++){
            if(sc.channels[i].name === channel){
                for(var j = 0; j<sc.channels[i].users.length;j++){
                    if(sc.channels[i].users[j] === email){
                        return;
                    }
                }
                sc.channels[i].users.push(email);
            }
        }
    };

    var addChannel = function (channelDetails) {
        sc.channels.push({
            name: channelDetails.name,
            createdBy :channelDetails.createdBy,
            users: channelDetails.users,
            description : channelDetails.description
        });
        sc.channelMessages[channelDetails.name]=[];

        //console.log("new channel added: "+channelDetails.name);
    };

    var channelMessageList = function (message) {
        console.log(message);
        if(sc.channelMessages[message.channel] === undefined){
            sc.channelMessages[message.channel] = [];
        }
      sc.channelMessages[message.channel].push({
          user: message.user,
          message: message.message,
          time: message.time,
          userImage: message.userImage
      })
    };

    var returnChannelMessageList = function () {
        return sc.channelMessages;
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
        setUserOffline: setUserOffline,
        userList:userList,
        addUserstoChannel:addUserstoChannel
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
            channel: data.channel,
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
        slickChat.setNewUser(data);
        socket.emit('allUsers',{
            newUserLogin :data
        });
       // console.log(slickChat.userList());
        socket.emit('initMessages',{
            messages :slickChat.returnChannelMessageList(),
            userList: slickChat.userList()
        });
        socket.broadcast.emit('user:login',{
            name: data.name,
            userImage:data.userImage,
            online:true
        });
        // socket.broadcast.emit('user:join', {
        //     userName: data.name
        // });
        // console.log(data.name);
    });

    // notify other clients that a new user has joined
    // socket.broadcast.emit('user:join', {
    //     name: name
    // });

    // broadcast a user's message to other users
    socket.emit('allUsers',{
        usersList :slickChat.userList(),
        messages: slickChat.returnChannelMessageList()
    });

    socket.on('send:message', function (data) {
        slickChat.channelMessageList(data);
        var alreadyUser = false;
        for(var i = 0; i<slickChat.channelList().length;i++){
            if(slickChat.channelList()[i].name === data.channel){
                for(var j = 0; j<slickChat.channelList()[i].users.length;j++){
                    if(slickChat.channelList()[i].users[j] === data.user){
                        alreadyUser = true;
                    }
                }
            }
        }
        if(!alreadyUser){
            slickChat.addUserstoChannel(data.email,data.channel);
            console.log("new user");
        }
        socket.broadcast.emit('send:message', {
            channel:data.channel,
            user: data.user,
            message: data.message,
            time: data.time,
            userImage: data.userImage,
            email: data.email
        });
    });
    socket.on('send:newChannel', function (data) {
        slickChat.addChannel(data);
        socket.broadcast.emit('send:newChannel', {
            name: data.name,
            createdBy :data.createdBy,
            users: data.users,
            description : data.description
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
        slickChat.setUserOffline(data.userName);
        console.log(data.userName);
        socket.broadcast.emit('user:left', {
            name: data.userName
        });
    });

    socket.on('getChannelsList',function () {
        console.log("request for channel list made");
        console.log(slickChat.channelList());
        socket.emit('ChannelsListReceived',{
            channelsList:slickChat.channelList()
        });
    });
    // socket.on('getChannelsList', function( valueName, setValueResult ) {
    //
    //     var value = slickChat.channelList(); //Do something with value here
    //      console.log(slickChat.channelList());
    //     if( value ) {
    //         setValueResult({
    //             success : true,
    //             data : value
    //         });
    //     } else {
    //         setValueResult({
    //             success : false,
    //             message : "Unable to retrieve value"
    //         });
    //     }
    // });
};
