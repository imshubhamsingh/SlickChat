'use strict';

angular
  .module('ChitChatApp', [
    'firebase',
    'angular-md5',
    'ui.router'
  ])
  .config(function ($stateProvider, $urlRouterProvider,FirebaseConfig) {
    $stateProvider
      .state('home', {
          url: '/',
          templateUrl: 'home/home.html',
          resolve: {
              // requireNoAuth: function($state, Auth){
              //     return Auth.$requireSignIn().then(function(auth){
              //         $state.go('channels');
              //     }, function(error){
              //         return;
              //     });
              // }
              // requireNoAuth: function ($state, Auth,cognitoService) {
              //     var authenticationDetails = cognitoService.getAuthenticationDetails(Auth.getUserEmail(), Auth.getUserPassword());
              //     var userPool = cognitoService.getUserPool();
              //     var cognitoUser = cognitoService.getUser(userPool, Auth.getUserEmail());
              //     cognitoUser.authenticateUser(authenticationDetails, {
              //         onSuccess: function (result) {
              //             console.log('access token + ' + result.getAccessToken().getJwtToken());
              //
              //             //POTENTIAL: Region needs to be set if not already set previously elsewhere.
              //             AWS.config.region = '<region>';
              //
              //             AWS.config.credentials = new AWS.CognitoIdentityCredentials({
              //                 IdentityPoolId : '...', // your identity pool id here
              //                 Logins : {
              //                     // Change the key below according to the specific region your user pool is in.
              //                     'cognito-idp.<region>.amazonaws.com/<YOUR_USER_POOL_ID>' : result.getIdToken().getJwtToken()
              //                 }
              //             });
              //             $state.go('channels');
              //             // Instantiate aws sdk service objects now that the credentials have been updated.
              //             // example: var s3 = new AWS.S3();
              //
              //         },
              //         onFailure: function(err) {
              //             alert(err);
              //         }
              //     });
              //
              //
              // }
          }
      })
      .state('login', {
          url: '/login',
          controller: 'LoginCtrl as loginCtrl',
          templateUrl: 'auth/login/login.html',
          resolve: {
              // requireNoAuth: function($state, Auth){
              //     return Auth.$requireSignIn().then(function(auth){
              //         $state.go('home');
              //     }, function(error){
              //         return;
              //     });
              // }
          }
      }).state('register', {
          url: '/register',
          controller: 'RegisterCtrl as registerCtrl',
          templateUrl: 'auth/register/register.html',
          resolve: {
              // requireNoAuth: function($state, Auth){
              //     return Auth.$requireSignIn().then(function(auth){
              //         $state.go('home');
              //     }, function(error){
              //         return;
              //     });
              // }
          }
      }).state('activate', {
        url: '/activate',
        controller: 'ActivateCtrl as activateCtrl',
        templateUrl: 'auth/activate/activate.html',
        resolve: {
                // requireNoAuth: function($state, Auth){
                //     return Auth.$requireSignIn().then(function(auth){
                //         $state.go('home');
                //     }, function(error){
                //         return;
                //     });
                // }
        }
    }).state('profile', {
        url: '/profile',
        controller: 'ProfileCtrl as profileCtrl',
        templateUrl: 'users/profile.html',
        resolve: {
            auth: function($state, Users, Auth){
                return Auth.$requireSignIn().catch(function(){
                    $state.go('home');
                });
            },
            profile: function(Users, Auth){
                return Auth.$requireSignIn().then(function(auth){
                    return Users.getProfile(auth.uid).$loaded();
                });
            }
        }
    }).state('channels', {
        url: '/channels',
        controller: 'ChannelsCtrl as channelsCtrl',
        templateUrl: 'channels/index.html',
        resolve: {
            // channels: function (Channels){
            //     return Channels.$loaded();
            // },
            // profile: function ($state, Auth, Users){
            //     return Auth.$requireSignIn().then(function(auth){
            //         return Users.getProfile(auth.uid).$loaded().then(function (profile){
            //             if(profile.displayName){
            //                 return profile;
            //             } else {
            //                 $state.go('profile');
            //             }
            //         });
            //     }, function(error){
            //         $state.go('home');
            //     });
            // }
            profile: function (Auth,cognitoService,$state) {
                var userPool = cognitoService.getUserPool();
                var cognitoUser = cognitoService.getUser(userPool, Auth.getUserEmail());
                var authenticationDetails = cognitoService.getAuthenticationDetails(Auth.getUserEmail(), Auth.getUserPassword());

                cognitoUser.authenticateUser(authenticationDetails, {
                    onSuccess: function (result) {
                        var accessToken = result.getAccessToken().getJwtToken();
                        authCtrl.accessToken = accessToken;

                        var currentUser = userPool.getCurrentUser();
                        console.log(currentUser);

                        $state.go('channels');
                    },
                    onFailure: function (err) {
                        $state.go('home');
                    }
                });
            }
        }
    }).state('channels.create', {
        url: '/create',
        templateUrl: 'channels/channels/create.html',
        controller: 'ChannelsCtrl as channelsCtrl'
    }).state('channels.messages', {
        url: '/{channelId}/messages',
        templateUrl: 'channels/messages/messages.html',
        controller: 'MessagesCtrl as messagesCtrl',
        resolve: {
            messages: function($stateParams, Messages){
                return Messages.forChannel($stateParams.channelId).$loaded();
            },
            channelName: function($stateParams, channels){
                return '#'+channels.$getRecord($stateParams.channelId).name;
            }
        }
    }).state('channels.direct', {
        url: '/{uid}/messages/direct',
        templateUrl: 'channels/messages/messages.html',
        controller: 'MessagesCtrl as messagesCtrl',
        resolve: {
            messages: function($stateParams, Messages, profile){
                return Messages.forUsers($stateParams.uid, profile.$id).$loaded();
            },
            channelName: function($stateParams, Users){
                return Users.all.$loaded().then(function(){
                    return '@'+Users.getDisplayName($stateParams.uid);
                });
            }
        }
    });

    firebase.initializeApp(FirebaseConfig);
    $urlRouterProvider.otherwise('/');
  })
    .constant('FirebaseConfig', {
        apiKey: 'AIzaSyDXYKlcoWu21K4-vQOuy7eqD3fOYn7WImw',
        authDomain: 'slackclone-830fc.firebaseapp.com',
        databaseURL: 'https://slackclone-830fc.firebaseio.com/'
    });


