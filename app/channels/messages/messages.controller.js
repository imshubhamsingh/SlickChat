/**
 * Created by shubham on 8/7/17.
 */
// profile, channelName, messages
angular.module('SlickChatApp')
    .controller('MessagesCtrl', function(socket,$stateParams){
        var messagesCtrl = this;
        console.log($stateParams);
        messagesCtrl.messageType = $stateParams.messageType;
        messagesCtrl.messages = $stateParams.channelMessages;
        messagesCtrl.channelName = $stateParams.channelName;
        // messagesCtrl.messages = messages;
        // messagesCtrl.channelName = channelName;
        //
        // messagesCtrl.message = '';
        //
        // messagesCtrl.sendMessage = function (){
        //     if(messagesCtrl.message.length > 0){
        //         messagesCtrl.messages.$add({
        //             uid: profile.$id,
        //             body: messagesCtrl.message,
        //             timestamp: firebase.database.ServerValue.TIMESTAMP
        //         }).then(function (){
        //             messagesCtrl.message = '';
        //         });
        //     }
        // };
        // socket.on('send:message', function (message) {
        //     //console.log(message);
        //     if(message.user !==channelsCtrl.displayName){
        //         // //console.log(message);
        //         channelsCtrl.messages.push(message);
        //         ////console.log("pushed messages")
        //     }
        // });
        messagesCtrl.i = 0;
    });
