/**
 * Created by shubham on 12/7/17.
 */

// Keep track of which names are used so that there are no duplicates
var userNames = (function () {
    var uN = this;
    uN.names = [];
    uN.message = [];

        // find the lowest unused "guest" name and claim it
    var setUserName = function (data) {
        for(var i=0;i<uN.names.length;i++){
            if(uN.names[i].name === data.name){
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
        console.log("=======uN.message=====");
        console.log(uN.message);
        return uN.message;
    };


    // serialize claimed names as an array
    var getUsersList = function () {
        var res = [];
        for(var i = 0;i<uN.names.length;i++) {
            res.push(uN.names[i]);
        }
        return res;
    };

    var free = function (name) {
        if (names[name]) {
            delete names[name];
        }
    };

    return {
        free: free,
        setUserName: setUserName,
        getUsersList: getUsersList,
        message: getMessage,
        sendMessage: sendMessage
    };
}());
// export function for listening to the socket
module.exports = function (socket) {
    // send the new user their name and a list of users
    socket.on('init', function (data) {
        userNames.setUserName(data);
        socket.emit('allUsers',{
            usersList :userNames.getUsersList(),
            messages: userNames.sendMessage()
        });
        socket.emit('initMessages',{
            messages :userNames.sendMessage()
        })
    });

    // notify other clients that a new user has joined
    // socket.broadcast.emit('user:join', {
    //     name: name
    // });

    // broadcast a user's message to other users
    socket.on('send:message', function (data) {
        userNames.get

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

    // clean up when a user leaves, and broadcast it to other users
    // socket.on('disconnect', function () {
    //     socket.broadcast.emit('user:left', {
    //         name: name
    //     });
    //     userNames.free(name);
    // });
};
