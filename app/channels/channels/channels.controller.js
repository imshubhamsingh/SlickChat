/**
 * Created by shubham on 8/7/17.
 */

angular.module('SlickChatApp')
    .controller('ChannelsCtrl', function($state, Auth, Users,cognitoService,$scope,md5,socket,channels,userDetailsAndMessages){
        var channelsCtrl = this;

        console.log(userDetailsAndMessages);

        // channelsCtrl.profile.online = true;

        channelsCtrl.profile = "";
        channelsCtrl.channels = channels.channelsList;
        console.log(channelsCtrl.channels);
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


        channelsCtrl.changeChannel = function (channel) {
            channelsCtrl.channelSelected.name = channel.name;
            channelsCtrl.channelSelected.createdBy = channel.createdBy;
            channelsCtrl.channelSelected.description = channel.description;
            channelsCtrl.channelSelected.users = channel.users
        };

        channelsCtrl.addChannels = function () {
            console.log({
                name:channelsCtrl.newChannel.name,
                createdBy:channelsCtrl.fullName,
                description:channelsCtrl.newChannel.description,
                users:[channelsCtrl.fullName]
            });
            socket.emit('send:newChannel', {
                name:channelsCtrl.newChannel.name,
                createdBy:channelsCtrl.fullName,
                description:channelsCtrl.newChannel.description,
                users:[channelsCtrl.fullName]
            });
            channelsCtrl.channels.push({
                name:channelsCtrl.newChannel.name,
                createdBy:channelsCtrl.fullName,
                description:channelsCtrl.newChannel.description,
                users:[channelsCtrl.fullName]
            });
            $('#createChannel').modal('hide')
        };

        socket.on('send:newChannel', function (newChannel) {
            //console.log(message);
            if(newChannel.createdBy !==channelsCtrl.displayName){
                // //console.log(message);
                channelsCtrl.channels.push(newChannel);
                ////console.log("pushed messages")
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
            //console.log(message);
            if(message.user !==channelsCtrl.displayName){
                // //console.log(message);
                channelsCtrl.messages.push(message);
                ////console.log("pushed messages")
            }
        });

        // socket.on('change:name', function (data) {
        //     changeName(data.oldName, data.newName);
        // });
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
                socket.emit('send:message', {
                    channel: channelsCtrl.channelSelected,
                    user: channelsCtrl.displayName,
                    message: channelsCtrl.message,
                    userImage:channelsCtrl.getGravatar,
                    time: currentdate.timeNow()+" "+currentdate.getDate() + "/"+ (currentdate.getMonth()+1)  + "/"+ currentdate.getFullYear(),
                });

                // add the message to our model locally

                channelsCtrl.messages.push({
                    channel: channelsCtrl.channelSelected,
                    user: channelsCtrl.displayName,
                    text: channelsCtrl.message,
                    time: currentdate.timeNow()+" "+currentdate.getDate() + "/"+ (currentdate.getMonth()+1)  + "/"+ currentdate.getFullYear(),
                    userImage:channelsCtrl.getGravatar
                });
                // clear message box
                channelsCtrl.message = '';
            }
        }


    });
