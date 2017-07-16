/**
 * Created by shubham on 8/7/17.
 */

angular.module('SlickChatApp')
    .controller('ChannelsCtrl', function($state, Auth, Users,cognitoService,$scope,md5,socket,channels,userDetailsAndMessages){
        var channelsCtrl = this;

        //console.log(userDetailsAndMessages);

        // channelsCtrl.profile.online = true;

        channelsCtrl.profile = "";
        //console.log(channels.channelsList);
        channelsCtrl.channels = channels.channelsList;
        //console.log(channelsCtrl.channels);
        channelsCtrl.channelSelected = {
            name:channelsCtrl.channels[0].name,
            createdBy:channelsCtrl.channels[0].createdBy,
            description:channelsCtrl.channels[0].description,
            users:channelsCtrl.channels[0].users
        };
        channelsCtrl.newChannel = {
            name:"",
            createdBy:"",
            description:""
        };

        channelsCtrl.channelSelectedUsers = channelsCtrl.channels[0].users;
        channelsCtrl.displayName = userDetailsAndMessages.userDetails.displayName;
        channelsCtrl.userEmail = userDetailsAndMessages.userDetails.email;
        channelsCtrl.fullName = userDetailsAndMessages.userDetails.name;
        channelsCtrl.messages = userDetailsAndMessages.userMessages;
        channelsCtrl.getGravatar = userDetailsAndMessages.userDetails.getGravatar;
        channelsCtrl.message ="";
        channelsCtrl.allUser = userDetailsAndMessages.userList;

        channelsCtrl.creatChannelError ="";


        channelsCtrl.changeChannel = function (channel) {
            channelsCtrl.channelSelected.name = channel.name;
            channelsCtrl.channelSelected.createdBy = channel.createdBy;
            channelsCtrl.channelSelected.description = channel.description;
            channelsCtrl.channelSelected.users = channel.users;
            //console.log(channel.name);
            //console.log(channelsCtrl.messages[channel.name]);
        };

        channelsCtrl.addChannels = function () {
            var alreadyChannel = false;
            for(var i = 0 ;i<channelsCtrl.channels.length;i++){
                if(channelsCtrl.channels[i].name === channelsCtrl.newChannel.name ){
                    channelsCtrl.creatChannelError = "Channel with this name already exits";
                    return;
                }
            }

            // //console.log({
            //     name:channelsCtrl.newChannel.name,
            //     createdBy:channelsCtrl.fullName,
            //     description:channelsCtrl.newChannel.description,
            //     users:[channelsCtrl.userEmail]
            // });
            socket.emit('send:newChannel', {
                name:channelsCtrl.newChannel.name,
                createdBy:channelsCtrl.fullName,
                description:channelsCtrl.newChannel.description,
                users:[channelsCtrl.userEmail]
            });
            channelsCtrl.channels.push({
                name:channelsCtrl.newChannel.name,
                createdBy:channelsCtrl.fullName,
                description:channelsCtrl.newChannel.description,
                users:[channelsCtrl.email]
            });

            $('#createChannel').modal('hide')
        };

        socket.on('send:newChannel', function (newChannel) {
            ////console.log(message);
            if(newChannel.createdBy !==channelsCtrl.displayName){
                // ////console.log(message);
                channelsCtrl.channels.push(newChannel);
                //////console.log("pushed messages")
            }
        });
        channelsCtrl.newChannel = {
            name: ''
        };

        channelsCtrl.createChannel = function(){
            if(channelsCtrl.newChannel.name!=='')
            channelsCtrl.channels.push({name:channelsCtrl.newChannel.name});
            channelsCtrl.newChannel.name = '';
        };
        channelsCtrl.logout = function(){
            socket.emit('useLogOut', {
                userName: channelsCtrl.displayName
            });
            //////console.log(channelsCtrl.displayName);
            cognitoService.getUser(channelsCtrl.userEmail).signOut();
            $state.go('home');
        };


        socket.on('send:message', function (message) {
            //console.log(message);
            ////console.log(message);
            if(message.displayName !== channelsCtrl.displayName){
                if(channelsCtrl.messages[message.channel]===undefined){
                    channelsCtrl.messages[message.channel] = [];
                }
                // ////console.log(message);
                channelsCtrl.messages[message.channel].push({
                    user: message.user,
                    message: message.message,
                    userImage:message.userImage,
                    time: message.time
                });
                //////console.log("pushed messages")
                var alreadyUser = false;
                for(var i = 0; i<channelsCtrl.channelSelected.users.length;i++){
                    if(channelsCtrl.channelSelected.users[i] === message.email) {
                        alreadyUser = true;
                    }
                }
                if(!alreadyUser){
                    channelsCtrl.channelSelected.users.push(message.email)
                }
            }
        });

        // socket.on('change:name', function (data) {
        //     changeName(data.oldName, data.newName);
        // });
        socket.on('user:login', function (data) {
            for(var i=0;i<channelsCtrl.allUser.length;i++){
                if(data.name === channelsCtrl.allUser[i].name){
                    // ////console.log(message);
                    channelsCtrl.allUser[i].online = true;
                    //////console.log("pushed messages")
                    return;
                }
            }
            channelsCtrl.allUser.push(data);
        });

        socket.on('user:join', function (data) {
            ////console.log(data)
        });


        socket.on('user:left', function (data) {
            for (var i = 0; i < channelsCtrl.allUser.length; i++) {
                if ( channelsCtrl.allUser[i].name === data.name) {
                    channelsCtrl.allUser[i].online = false;
                    ////console.log(channelsCtrl.allUser[i]);
                }
            }
        });

        socket.on('allUsers',function (data) {
            // ////console.log(data);
            for(var i =0; i<channelsCtrl.allUser.length;i++){
                if(channelsCtrl.allUser[i] !== undefined){
                    if(channelsCtrl.allUser[i].name === data.newUserLogin.name){
                        return;
                    }
                }
            }
            // ////console.log(channelsCtrl.allUser);
            channelsCtrl.allUser.push(data.newUserLogin);
        });



        Date.prototype.timeNow = function(){ return ((this.getHours() < 10)?"0":"") + ((this.getHours()>12)?(this.getHours()-12):this.getHours()) +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds() + ((this.getHours()>12)?('pm'):'am'); };

        channelsCtrl.sendMessage = function () {

            if(channelsCtrl.message ==="" || channelsCtrl.message === undefined || channelsCtrl.message.length===0){
               return;
            }else{
                // ////console.log(channelsCtrl.message.length);
                var currentdate = new Date();
                var formatedDate = currentdate.timeNow()+" "+currentdate.getDate() + "/"+ (currentdate.getMonth()+1)  + "/"+ currentdate.getFullYear()
                socket.emit('send:message', {
                    channel: channelsCtrl.channelSelected.name,
                    user: channelsCtrl.displayName,
                    message: channelsCtrl.message,
                    userImage:channelsCtrl.getGravatar,
                    time: formatedDate,
                    email:channelsCtrl.userEmail
                });

                // add the message to our model locally
                if(channelsCtrl.messages[channelsCtrl.channelSelected.name] === undefined){
                    channelsCtrl.messages[channelsCtrl.channelSelected.name] = [];
                }
                channelsCtrl.messages[channelsCtrl.channelSelected.name].push({
                    user: channelsCtrl.displayName,
                    message: channelsCtrl.message,
                    userImage:channelsCtrl.getGravatar,
                    time: formatedDate
                });
                var alreadyUser = false;
                for(var i = 0; i<channelsCtrl.channelSelected.users.length;i++){
                    if(channelsCtrl.channelSelected.users[i] === channelsCtrl.userEmail){
                        alreadyUser = true;
                    }
                }
                if(!alreadyUser){
                    channelsCtrl.channelSelected.users.push(channelsCtrl.userEmail)
                }

                //console.log(channelsCtrl.channelSelected.users);
                channelsCtrl.message = '';
            }
        };

        channelsCtrl.responsive = false;

        channelsCtrl.responsiveToggle = function () {
            channelsCtrl.responsive = (channelsCtrl.responsive === false);
        }

    });
