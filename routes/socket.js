/**
 * Created by shubham on 12/7/17.
 */

// Keep track of which names are used so that there are no duplicates
var userNames = (function () {
    var uN = this;
    uN.names = [];

        // find the lowest unused "guest" name and claim it
    var setUserName = function (name) {
        for(var i=0;i<uN.names.length;i++){
            if(uN.names[i].name === name){
                return;
            }
        }
        uN.names.push({name: name});
        console.log(uN.names)
    };

    // serialize claimed names as an array
    var get = function () {
        var res = [];
        for (user in names) {
            res.push(user);
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
        get: get,
        setUserName: setUserName
    };
}());
Date.prototype.timeNow = function(){ return ((this.getHours() < 10)?"0":"") + ((this.getHours()>12)?(this.getHours()-12):this.getHours()) +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds() + ((this.getHours()>12)?('PM'):'AM'); };
// export function for listening to the socket
module.exports = function (socket) {
    // send the new user their name and a list of users
    socket.on('init', function (data) {
        userNames.setUserName(data.name);
        console.log(data.name);
    });

    // notify other clients that a new user has joined
    // socket.broadcast.emit('user:join', {
    //     name: name
    // });

    // broadcast a user's message to other users
    socket.on('send:message', function (data) {
        var currentdate = new Date();
        console.log(currentdate);
        console.log(data);

        socket.broadcast.emit('send:message', {
            user: data.user,
            text: data.message,
            time: currentdate.timeNow()+" "+currentdate.getDate() + "/"+ (currentdate.getMonth()+1)  + "/"+ currentdate.getFullYear()
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
