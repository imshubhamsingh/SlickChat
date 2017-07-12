/**
 * Created by shubham on 8/7/17.
 */

angular.module('SlickChatApp')
    .controller('ChannelsCtrl', function($state, Auth, Users,cognitoService,$scope,md5,socket){
        var channelsCtrl = this;
        // $sce.trustAsResourceUrl('http://gnaman.pythonanywhere.com')
        // $http.jsonp('http://gnaman.pythonanywhere.com').then(function(response){
        //   console.log(response);
        // },function (response) {
        //   console.log(response);
        // });
        //
        // var x = $resource('http://gnaman.pythonanywhere.com', {user: '1'});
        // console.log("This is the response", x);

        var userPool = cognitoService.getUserPool();
        var currentUser = userPool.getCurrentUser();

        // channelsCtrl.profile.online = true;

        channelsCtrl.profile = "";
        channelsCtrl.channels = [
            {name: 'project'},
            {name: 'atom'},
            {name: 'angular'}
            ];
        channelsCtrl.channelSelected = channelsCtrl.channels[0].name;
        channelsCtrl.getDisplayName = "";
        channelsCtrl.getGravatar = "";
        channelsCtrl.users = "";
        channelsCtrl.displayName ="";
        channelsCtrl.userEmail = "";

        currentUser.getSession(function(err, session) {
                if (err) {
                    // alert(err);
                    console.log(err);
                    return;
                }
                console.log('session validity: ' + session.isValid());
            });
        currentUser.getUserAttributes(function(err, result) {
                if (err) {
                    //alert(err);
                    console.log(err);
                    console.log('error during Get Attribute');
                    return;
                }
                console.log(result);

                for (var i = 0; i < result.length; i++) {
                    if(result[i].getName() === "name"){
                        channelsCtrl.displayName = result[i].getValue();
                        channelsCtrl.displayName = channelsCtrl.displayName.split(' ')[0];
                    }
                    if(result[i].getName() === "email"){
                        channelsCtrl.userEmail = result[i].getValue();
                        channelsCtrl.getGravatar = '//www.gravatar.com/avatar/' + md5.createHash(channelsCtrl.userEmail) + '?d=retro';
                        console.log(channelsCtrl.getGravatar)
                    }
                }
                $scope.$apply();
            });

        //console.log(channelsCtrl.displayName);

        // Users.setOnline(profile.$id);

        channelsCtrl.changeChannel = function (channelName) {
            channelsCtrl.channelSelected = channelName;
        };

        channelsCtrl.newChannel = {
            name: ''
        };

        channelsCtrl.createChannel = function(){
            if(channelsCtrl.newChannel.name!=='')
            channelsCtrl.channels.push({name:channelsCtrl.newChannel.name});
            channelsCtrl.newChannel.name = '';
            // channelsCtrl.channels.$add(channelsCtrl.newChannel).then(function(ref){
            //     $state.go('channels.messages', {channelId: ref.key});
            // });
        };
        channelsCtrl.logout = function(){
            cognitoService.getUser(channelsCtrl.userEmail).signOut();
            $state.go('home');
        };


        socket.on('init', function (data) {
            $scope.name = data.name;
            $scope.users = data.users;
        });

        socket.on('send:message', function (message) {
            console.log(message);
            $scope.messages.push(message);
        });

        socket.on('change:name', function (data) {
            changeName(data.oldName, data.newName);
        });

        socket.on('user:join', function (data) {
            $scope.messages.push({
                user: 'chatroom',
                text: 'User ' + data.name + ' has joined.'
            });
            $scope.users.push(data.name);
        });

        // add a message to the conversation when a user disconnects or leaves the room
        socket.on('user:left', function (data) {
            $scope.messages.push({
                user: 'chatroom',
                text: 'User ' + data.name + ' has left.'
            });
            var i, user;
            for (i = 0; i < $scope.users.length; i++) {
                user = $scope.users[i];
                if (user === data.name) {
                    $scope.users.splice(i, 1);
                    break;
                }
            }
        });

        // Private helpers
        // ===============

        var changeName = function (oldName, newName) {
            // rename user in list of users
            var i;
            for (i = 0; i < $scope.users.length; i++) {
                if ($scope.users[i] === oldName) {
                    $scope.users[i] = newName;
                }
            }

            $scope.messages.push({
                user: 'chatroom',
                text: 'User ' + oldName + ' is now known as ' + newName + '.'
            });
        };

        // Methods published to the scope
        // ==============================

        $scope.changeName = function () {
            socket.emit('change:name', {
                name: $scope.newName
            }, function (result) {
                if (!result) {
                    alert('There was an error changing your name');
                } else {

                    changeName($scope.name, $scope.newName);

                    $scope.name = $scope.newName;
                    $scope.newName = '';
                }
            });
        };

        $scope.messages = [];
        Date.prototype.timeNow = function(){ return ((this.getHours() < 10)?"0":"") + ((this.getHours()>12)?(this.getHours()-12):this.getHours()) +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds() + ((this.getHours()>12)?('PM'):'AM'); };

        channelsCtrl.sendMessage = function () {
            if($scope.message !=="" || $scope.message !== undefined){
                socket.emit('send:message', {
                    message: $scope.message
                });
                var currentdate = new Date();
                // add the message to our model locally
                $scope.messages.push({
                    user: channelsCtrl.displayName,
                    text: $scope.message,
                    time: currentdate.timeNow()+" "+currentdate.getDate() + "/"+ (currentdate.getMonth()+1)  + "/"+ currentdate.getFullYear()
                });

                // clear message box
                $scope.message = '';
            };
            }


    });
