(function () {
    var app = angular.module('characters', []);
    var socket = io.connect();
    app.run(function ($rootScope) {

        $rootScope.post = posts;
        $rootScope.$on('roomChanged', function (event, room) {
            $rootScope.roomname = room.name;
            chars.length = 0;                               //clears the array without breaking angular
            console.log("room changed to: " + room.name);
            //console.log("characters now: " + room.characters);
            room.characters.forEach(function (roomchar) {
                chars.push(roomchar);
            });

        });


        $rootScope.$on('roomChanged', function (event, room) {            //crappy thing that needs to be fixed anyway. Fix it someday TODO
            //console.log("MESSAGE TIMEEEE");
            $('#chatbox').empty();
            if (room.messages == null)
                room.messages = [];
            room.messages.forEach(function (message) {
                $('#chatbox').append($('<p class="message">').text(message.usr + ":    " + message.msg));
            });
            var chat = document.getElementById("chatbox");
            chat.scrollTop = chat.scrollHeight - chat.clientHeight;


        });
        $rootScope.$on('roomChanged', function (event, room) {
            $rootScope.stats = [];
            //console.log('updateing stats')
            if (room.stats) {
                room.stats.forEach(function (stat) {
                    $rootScope.stats.push(stat);
                });
            }
            else {
                room.stats = [];
            }

        });

        $rootScope.$on('roomChanged', function (event, room) {
            if (room.description != null) {
                $rootScope.Descy = room.description;
            }
            else {
                $rootScope.Descy = "";
            }

            //console.log(room.description);
            $rootScope.$apply();
        });

        $rootScope.$on('roomChanged', function (event, room) {            //crappy thing that needs to be fixed anyway. Fix it someday TODO
            $rootScope.post.length = 0;
            //console.log("fixin the posts");
            room.posts.forEach(function (post) {
                //console.log(post);
                $rootScope.post.unshift(post);
            });


            $rootScope.$apply();

        });

    });

    //--------Global variables
    var chars = [];
    var messages = [];
    var stats = ["Name", "Class", "HP"];


    app.controller('charController', function ($scope) {
        //this.stats = $scope.stats;
        this.characters = chars;
        this.newstat;

        this.addStat = function () {
            $('#StatModal').modal('hide');
            //console.log("newstats");
            $scope.stats.push(this.newstat);
            socket.emit('statAdd', $scope.roomname, this.newstat);
            this.newstat = "";
        };

        this.removeStat = function (num) {
            console.log("removing index " + num + " from stats");
            $scope.stats.splice(num, 1);
            socket.emit("removeStat", $scope.roomname, num);
            $scope.$apply();
        };

        this.remove = function (num) {
            console.log("removing " + num + " from characters");
            this.characters.splice(num, 1);
            console.log("socket.emit(removeCharacter, " + $scope.roomname + ", " + num + ");");
            socket.emit("removeCharacter", $scope.roomname, num);
        }

    });

    app.controller('charAdder', function ($scope) {
        this.character = {};

        this.addCharacter = function (character) {
            console.log('adding character' + this.character.name);
            //console.log(this.character);
            character.characters.push(this.character);
            socket.emit('characterAdded', this.character);
            this.character = {};
            console.log(chars);
        };


        socket.on('characterAdded', function (char) {
            chars.push(char);
            $scope.$apply();
        });
    });


    app.controller('descriptionController', function ($scope, $rootScope) {

        $("#description-saver").click(function () {
            $rootScope.Descy = $('#description-box').val();
            $('#description-box').val('');
            socket.emit("descriptionUpdate", $scope.roomname, $rootScope.Descy);
        });
    });


    app.controller('imgController', function ($scope) {
        $scope.post = posts;


        socket.on('post', function (post) {
            $scope.post = posts;
            $scope.post.forEach(function (prost) {
                console.log('*************** \n' + prost.title + prost.image + prost.text + '\n***************')
            });
            $scope.post.unshift(post);
            $scope.$apply();
        });


    });
    app.controller('imageAdder', function ($scope) {
        this.tempImage;
        this.tempTitle;
        this.tempText;
        this.addImage = function (imageHolder) {
            var ham = {image: this.tempImage, title: this.tempTitle, text: this.tempText};
            //$scope.post.unshift(ham);
            this.tempImage = '';
            this.tempTitle = '';
            this.tempText = '';
            socket.emit('poster', ham);
        };


    });


    var posts = [];

    app.controller('chatter', function ($scope) {
        this.msg = messages;
        //socket.emit('here');
        $('#watid').submit(function () {
            if ($('#m').val().length > 0) {
                socket.emit('message', {msg: $('#m').val(), usr: $scope.user.local.email});
                $('#m').val('');
            }
            return false;
        });
        $('#send').click(function () {
            socket.emit('clear');
        });
        socket.on('message', function (msg) {
            console.log("getting a message");
            var chat = document.getElementById("chatbox");
            var isAtBottom = (chat.scrollHeight - chat.clientHeight <= chat.scrollTop + 4);
            console.log(msg);
            $('#chatbox').append($('<p class="message">').text(msg.usr + ":    " + msg.msg));

            if (isAtBottom) chat.scrollTop = chat.scrollHeight - chat.clientHeight;
        });
        socket.on('here', function (user) {
            $('#chatbox').append($('<p>' + user + ' CONNECTED</p>'));
        });
        socket.on('clearing', function () {
            $('#chatbox').empty();
        });

    });


    app.controller('pageController', function () {
        this.currentPage = 0;
        this.secondarypage = 0;
        this.description = 0;
        this.editPage = 0;
    });

    app.controller('calendarController', function () {
        $('#calendar').fullCalendar({
            dayClick: function (date, jsEvent, view) {
                console.log('clickerooo');
                // change the day's background color just for fun
                $(this).css('background-color', 'red');
            }
        });
    });

    app.controller('userController', function ($rootScope, $scope) {
        $rootScope.user;
        $.getJSON("/user_data", function (data) {
            // Make sure the data contains the username as expected before using it
            if (data.hasOwnProperty('username')) {
                console.log('it has username: ' + data.username.local.email);
                $rootScope.user = data.username;

                if ($rootScope.user.campaigns.length > 0) {
                    socket.emit('roomChange', $rootScope.user.campaigns[0], function (room) {
                        $scope.$emit('roomChanged', room);
                    });
                }

                //$rootScope.user.campaigns = ["WarHammer","Classic Dnd"];
                $scope.$apply();
                //console.log("campaigns: " + $rootScope.user.campaigns)
            }
        });

        this.newRoom;
        this.addRoom = function () {
            $('#myModal').modal('hide');
            if ($.inArray(this.newRoom, $rootScope.user.campaigns)) {
                socket.emit("roomAdded", this.newRoom, $rootScope.user);
                $rootScope.user.campaigns.push(this.newRoom);
                if ($rootScope.user.campaigns.length == 1) {
                    console.log('doopadoo');
                    socket.emit('roomChange', this.newRoom, function (room) {
                        //if(room.posts[0] != null)
                        $scope.$emit('roomChanged', room);
                    });
                }
            }
            else {
                console.log("Room Already Exists");
            }
        };

        $('#room').change(function () {
            socket.emit('roomChange', $('#room').val(), function (room) {
                //if(room.posts[0] != null)
                $scope.$emit('roomChanged', room);
            });
            socket.emit('here', $rootScope.user.local.email);
        })

    });
})();

