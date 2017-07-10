'use strict';

angular
  .module('SlickChatApp', [
    'firebase',
    'angular-md5',
    'ui.router',
    'ngResource'
  ])
  .config(function ($stateProvider, $urlRouterProvider,FirebaseConfig) {
    $stateProvider
      .state('home', {
          url: '/',
          templateUrl: 'home/home.html',
          resolve: {
              requireNoAuth: function($state,cognitoService){
                  var userPool = cognitoService.getUserPool();
                  var currentUser = userPool.getCurrentUser();
                  if(currentUser !== null){
                      $state.go('channels');
                  }
              }
          }
      })
      .state('login', {
          url: '/login',
          controller: 'LoginCtrl as loginCtrl',
          templateUrl: 'auth/login/login.html',
          resolve: {
              requireNoAuth: function($state,cognitoService){
                  var userPool = cognitoService.getUserPool();
                  var currentUser = userPool.getCurrentUser();
                  if(currentUser !== null){
                      $state.go('channels.welcome');
                  }
              }
          }
      }).state('register', {
          url: '/register',
          controller: 'RegisterCtrl as registerCtrl',
          templateUrl: 'auth/register/register.html',
          resolve: {
               requireNoAuth: function($state,cognitoService){
                   var userPool = cognitoService.getUserPool();
                   var currentUser = userPool.getCurrentUser();
                   if(currentUser !== null){
                       $state.go('channels');
                   }
               }
          }
      }).state('activate', {
        url: '/activate',
        controller: 'ActivateCtrl as activateCtrl',
        templateUrl: 'auth/activate/activate.html',
        resolve: {
                requireNoAuth: function($state, cognitoService){
                    var userPool = cognitoService.getUserPool();
                    var currentUser = userPool.getCurrentUser();
                    if(currentUser !== null){
                        $state.go('channels');
                    }
                }
        },
        params: {
            email: null,
            password: null
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
            requireAuth: function($state,cognitoService){
                var userPool = cognitoService.getUserPool();
                var currentUser = userPool.getCurrentUser();

                console.log("Logged In");
                if(currentUser === null){
                    $state.go('home');
                }
            }
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
            // profile: function (Auth,cognitoService,$state) {
            //     var userPool = cognitoService.getUserPool();
            //     var cognitoUser = cognitoService.getUser(userPool, Auth.getUserEmail());
            //     var authenticationDetails = cognitoService.getAuthenticationDetails(Auth.getUserEmail(), Auth.getUserPassword());
            //
            //     cognitoUser.authenticateUser(authenticationDetails, {
            //         onSuccess: function (result) {
            //             var accessToken = result.getAccessToken().getJwtToken();
            //             authCtrl.accessToken = accessToken;
            //
            //             var currentUser = userPool.getCurrentUser();
            //             console.log(currentUser);
            //
            //             $state.go('channels');
            //         },
            //         onFailure: function (err) {
            //             $state.go('home');
            //         }
            //     });
            // }
        },
        params: {
            email: null,
            password: null,
            activation: false
        }
    }).state('channels.welcome', {
        url: '/',
        templateUrl: 'channels/home/welcome.html',
        controller: 'ChannelsCtrl as channelsCtrl',
        resolve:  {
            requireAuth: function($state,cognitoService,$stateParams){
                var params = $stateParams;
                if(params.activation){
                    var cognitoUser = cognitoService.getUser(params.email);
                    var authenticationDetails = cognitoService.getAuthenticationDetails(params.email, params.password);

                    cognitoUser.authenticateUser(authenticationDetails, {
                        onSuccess: function (result) {
                            //var accessToken = result.getAccessToken().getJwtToken();
                            // loginCtrl.accessToken = accessToken
                            params.activation = false;
                            console.log("Logged In ");
                            $state.go('channels.welcome');
                        },
                        onFailure: function (err) {
                            $state.go('home');
                        }
                    });
                }
                var userPool = cognitoService.getUserPool();
                var currentUser = userPool.getCurrentUser();

                console.log("Logged In");
                if(currentUser === null){
                    $state.go('home');
                }
            }
        }
    }).state('channels.create', {
        url: '/create',
        templateUrl: 'channels/channels/create.html',
        controller: 'ChannelsCtrl as channelsCtrl',
        resolve:{

        }
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
