/**
 * Created by shubham on 8/7/17.
 */

angular.module('SlickChatApp')
    .controller('ChannelsCtrl', function($state, Auth, Users,cognitoService,$scope,md5,socket,channels){
        var channelsCtrl = this;

        var userPool = cognitoService.getUserPool();
        var currentUser = userPool.getCurrentUser();

        // channelsCtrl.profile.online = true;

        channelsCtrl.profile = "";
        channelsCtrl.channels = channels.channelsList;
        console.log(channelsCtrl.channels);
        channelsCtrl.channelSelected = channelsCtrl.channels[0].name;
        channelsCtrl.channelCreator = channelsCtrl.channels[0].createdBy;
        channelsCtrl.channelDescription = channelsCtrl.channels[0].description;
        channelsCtrl.channelSelectedUsers = channelsCtrl.channels[0].users;
        channelsCtrl.getDisplayName = "";
        channelsCtrl.getGravatar = "";
        channelsCtrl.users = "";
        channelsCtrl.displayName ="";
        channelsCtrl.userEmail = "";
        channelsCtrl.allUser = [];

        currentUser.getSession(function(err, session) {
                if (err) {
                    // alert(err);
                    //console.log(err);
                    return;
                }
                // //console.log('session validity: ' + session.isValid());
            });
        currentUser.getUserAttributes(function(err, result) {
                if (err) {
                    //alert(err);
                    //console.log(err);
                    //console.log('error during Get Attribute');
                    return;
                }
                // //console.log(result);

                for (var i = 0; i < result.length; i++) {
                    if(result[i].getName() === "name"){
                        channelsCtrl.displayName = result[i].getValue();
                        channelsCtrl.displayName = channelsCtrl.displayName.split(' ')[0];
                    }
                    if(result[i].getName() === "email"){
                        channelsCtrl.userEmail = result[i].getValue();
                        channelsCtrl.getGravatar = '//www.gravatar.com/avatar/' + md5.createHash(channelsCtrl.userEmail) + '?d=retro';
                        // //console.log(channelsCtrl.getGravatar)
                    }
                 }
                //console.log(channelsCtrl.allUser);
                   socket.emit('init', {
                       name: channelsCtrl.displayName,
                       userImage:channelsCtrl.getGravatar
                 });

                  socket.on('initMessages',function (data) {
                      //console.log(data);
                      channelsCtrl.messages = data.messages;
                      channelsCtrl.allUser = data.userList;
                      // //console.log(channelsCtrl.allUser);
                  });

                $scope.$apply();
            });

        ////console.log(channelsCtrl.displayName);

        // Users.setOnline(profile.$id);

        channelsCtrl.changeChannel = function (channel) {
            channelsCtrl.channelSelected = channel.name;
            channelsCtrl.channelCreator = channel.createdBy;
            channelsCtrl.channelDescription = channel.description;
        };

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
            //console.log(data);
            // //console.log(channelsCtrl.allUser);
            //     for(var i = 0 ;i<channelsCtrl.allUser.length;i++){
            //         if(channelsCtrl.allUser[i] !== undefined){
            //             if(channelsCtrl.allUser[i].name === data.userName){
            //                 if(channelsCtrl.allUser[i].online !==true)
            //                 channelsCtrl.allUser[i].online = true;
            //             }
            //         }
            //     }
        });

        socket.on('user:join', function (data) {
            //console.log(data)
        });


        socket.on('user:left', function (data) {
            for (var i = 0; i < channelsCtrl.allUser.length; i++) {
                if ( channelsCtrl.allUser[i].name === data.userName) {
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


        channelsCtrl.messages = [];
        channelsCtrl.message ="";
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
