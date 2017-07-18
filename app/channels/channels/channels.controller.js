/**
 * Created by shubham on 8/7/17.
 */

angular.module('SlickChatApp')
    .controller('ChannelsCtrl', function($state, Auth,cognitoService,$scope,md5,socket,channels,userDetails,messages){
        var channelsCtrl = this;
        channelsCtrl.details = userDetails;
        channelsCtrl.profile = "";
        channelsCtrl.channels = channels.channelsList;
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
        channelsCtrl.displayName = userDetails.displayName;
        channelsCtrl.userEmail = userDetails.email;
        channelsCtrl.fullName = userDetails.name;
        channelsCtrl.messages = messages.userMessages;
        channelsCtrl.getGravatar = userDetails.getGravatar;
        channelsCtrl.message ="";
        channelsCtrl.allUser = messages.userList;

        channelsCtrl.creatChannelError ="";

        channelsCtrl.changeChannel = function (channel) {
            channelsCtrl.channelSelected.name = channel.name;
            channelsCtrl.channelSelected.createdBy = channel.createdBy;
            channelsCtrl.channelSelected.description = channel.description;
            channelsCtrl.channelSelected.users = channel.users;
        };

        channelsCtrl.addChannels = function () {
            var alreadyChannel = false;
            for(var i = 0 ;i<channelsCtrl.channels.length;i++){
                if(channelsCtrl.channels[i].name === channelsCtrl.newChannel.name ){
                    channelsCtrl.creatChannelError = "Channel with this name already exits";
                    return;
                }
            }
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

            if(newChannel.createdBy !==channelsCtrl.displayName){

                channelsCtrl.channels.push(newChannel);

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
            ////console.log(channelsCtrl.displayName);
            cognitoService.getUser(channelsCtrl.userEmail).signOut();
            $state.go('home');
        };


        socket.on('send:message', function (message) {
           // console.log(message);
            if(message.displayName !== channelsCtrl.displayName){
                if(channelsCtrl.messages[message.channel]===undefined){
                    channelsCtrl.messages[message.channel] = [];
                }
                // //console.log(message);
                channelsCtrl.messages[message.channel].push({
                    user: message.user,
                    message: message.message,
                    userImage:message.userImage,
                    time: message.time
                });
                ////console.log("pushed messages")
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

        socket.on('user:login', function (data) {
            for(var i=0;i<channelsCtrl.allUser.length;i++){
                if(data.name === channelsCtrl.allUser[i].name){
                    // //console.log(message);
                    channelsCtrl.allUser[i].online = true;
                    ////console.log("pushed messages")
                    return;
                }
            }
            channelsCtrl.allUser.push(data);
        });

        socket.on('user:join', function (data) {
            //console.log(data)
        });


        socket.on('user:left', function (data) {
            for (var i = 0; i < channelsCtrl.allUser.length; i++) {
                if ( channelsCtrl.allUser[i].name === data.name) {
                    channelsCtrl.allUser[i].online = false;
                    //console.log(channelsCtrl.allUser[i]);
                }
            }
        });

        socket.on('allUsers',function (data) {
            // //console.log(data);
            for(var i =0; i<channelsCtrl.allUser.length;i++){
                if(channelsCtrl.allUser[i] !== undefined){
                    if(channelsCtrl.allUser[i].name === data.newUserLogin.name){
                        return;
                    }
                }
            }
            // //console.log(channelsCtrl.allUser);
            channelsCtrl.allUser.push(data.newUserLogin);
        });



        Date.prototype.timeNow = function(){ return ((this.getHours() < 10)?"0":"") + ((this.getHours()>12)?(this.getHours()-12):this.getHours()) +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds() + ((this.getHours()>12)?('pm'):'am'); };

        channelsCtrl.sendMessage = function () {

            if(channelsCtrl.message ==="" || channelsCtrl.message === undefined || channelsCtrl.message.length===0){
               return;
            }else{
                // //console.log(channelsCtrl.message.length);
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
                    console.log(channelsCtrl.channelSelected.users[i]);
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
