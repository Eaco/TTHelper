(function () {
    var app = angular.module('characters', []);
    var socket = io.connect();
    app.run(function($rootScope){

        $rootScope.post = posts;
        $rootScope.$on('roomChanged', function(event, room){
            $rootScope.roomname = room.name;
            chars.length = 0;                               //clears the array without breaking angular
            console.log("room changed to: " + room.name);
            console.log("characters now: " + room.characters);
            room.characters.forEach(function(roomchar){
                chars.push(roomchar);
            });

        });



        $rootScope.$on('roomChanged', function(event, room){            //crappy thing that needs to be fixed anyway. Fix it someday TODO
            console.log("MESSAGE TIMEEEE");
            $('#chatbox').empty();
            if(room.messages == null)
                room.messages = [];
            room.messages.forEach(function(message){
                $('#chatbox').append($('<p class="message">').text(message));
            });
            var chat = document.getElementById("chatbox");
            chat.scrollTop = chat.scrollHeight - chat.clientHeight;


        });

        $rootScope.$on('roomChanged', function(event, room){
            if(room.description!= null){
                $rootScope.description = room.description;
            }
            else{
                $rootScope.description = "";
            }
            console.log("wooooooooooo toots  " + room.description);
            console.log(room.description);
            $rootScope.$apply();
        });

        $rootScope.$on('roomChanged', function(event, room){            //crappy thing that needs to be fixed anyway. Fix it someday TODO
            $rootScope.post.length = 0;
            console.log("fixin the posts");
            room.posts.forEach(function(post){
                console.log(post);
                $rootScope.post.unshift(post);
            });


            $rootScope.$apply();

        });

    });


    app.controller('charController', function ($scope) {
        this.stats = ["Name", "Class", "HP"];
        this.characters = chars;
    });

    app.controller('charAdder', function ($scope) {
        this.character = {};

        this.addCharacter = function (character) {
            console.log(this.character);
            character.characters.push(this.character);
            socket.emit('characterAdded', this.character);
            this.character = {};
            console.log(chars);
        };


        socket.on('characterAdded', function(char){
            chars.push(char);
            console.log(chars);
            $scope.$apply();
        });
    });

    app.controller('descriptionController',function($scope){

        $("#description-saver").click(function(){
            $scope.description = $('#description-box').val();
            socket.emit("descriptionUpdate", $scope.roomname, $scope.description);
        })


    });


    var chars = [];
    var messages = [];

    app.controller('imgController', function ($scope) {
        $scope.post = posts;


        socket.on('post', function (post) {
            $scope.post = posts;
            $scope.post.forEach(function(prost){
                console.log('*************** \n' + prost.title +prost.image + prost.text + '\n***************')
            });
            console.log('We got a post! ' + post.image);
            $scope.post.unshift(post);
            $scope.$apply();
        });


    });
    app.controller('imageAdder', function ($scope) {
        this.tempImage;
        this.tempTitle;
        this.tempText;
        this.addImage = function (imageHolder) {
            console.log(this.tempImage);
            var ham = {image: this.tempImage, title: this.tempTitle, text: this.tempText};
            //$scope.post.unshift(ham);
            this.tempImage = '';
            this.tempTitle = '';
            this.tempText = '';
            console.log('Title is ' + ham.title);
            socket.emit('poster', ham);
        };


    });


    var posts = [];

    app.controller('chatter', function ($scope) {
        this.msg= messages;
        //socket.emit('here');
        $('#watid').submit(function () {
            if ($('#m').val().length > 0) {
                socket.emit('message', $('#m').val());
                $('#m').val('');
            }
            return false;
        });
        $('#send').click(function () {
            socket.emit('clear');
        });
        socket.on('message', function (msg) {
            var chat = document.getElementById("chatbox");
            var isAtBottom = (chat.scrollHeight - chat.clientHeight <= chat.scrollTop + 4);

            $('#chatbox').append($('<p class="message">').text(msg));

            if (isAtBottom) chat.scrollTop = chat.scrollHeight - chat.clientHeight;
        });
        socket.on('here', function (user) {
            $('#chatbox').append($('<p>'+ user +' CONNECTED</p>'));
        });
        socket.on('clearing', function () {
            $('#chatbox').empty();
        });

    });

    app.controller('pageController', function () {
        this.currentPage = 0;
        this.secondarypage = 0;
        this.description = 0;
    });

    app.controller('userController', function($scope){
        $scope.user;
        $.getJSON("/user_data", function(data) {
            // Make sure the data contains the username as expected before using it
            if (data.hasOwnProperty('username')) {
                console.log('it has username: ' + data.username.local.email);
                $scope.user = data.username;

                if ($scope.user.campaigns.length > 0)
                {
                    socket.emit('roomChange', $scope.user.campaigns[0], function(room){
                        $scope.$emit('roomChanged', room);
                    });
                }

                //$scope.user.campaigns = ["WarHammer","Classic Dnd"];
                $scope.$apply();
                console.log("campaigns: " + $scope.user.campaigns)
            }
        });

        this.newRoom;
        this.addRoom = function(){
            socket.emit("roomAdded", this.newRoom, $scope.user);
            $scope.user.campaigns.push(this.newRoom);

           // $scope.$apply();
        };

        $('#room').change(function(){
            console.log($scope.user.campaigns);
            socket.emit('roomChange', $('#room').val(), function(room){
                if(room.posts[0] != null)
                    console.log("woo" + room.posts[0].title);

                $scope.$emit('roomChanged', room);
            });
            socket.emit('here', $scope.user.local.email);
        })



    });
})();

