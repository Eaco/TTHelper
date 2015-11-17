/**
 * Created by Ben on 8/24/2015.
 */
var Room = require('../app/models/room');
var User = require('../app/models/user');

module.exports = function (io) {
    io.sockets.on('connection', function (socket) {
        console.log('connected!!');

        socket.on('here', function (user) {
            socket.to(socket.room).broadcast.emit('here', user);
        });

        socket.on('message', function (msg) {
            Room.findOne({name: socket.room.name}, function (err, curroom) {
                if (curroom) {
                    if (curroom.messages == null)
                        curroom.messages = [];
                    console.log("Pushing " + msg);
                    curroom.messages.push(msg);
                    curroom.save(function (err) {
                        console.log('room updated successfully');
                    });
                    socket.room = curroom;
                    console.log(curroom.messages);
                }
                else {
                    curroom.messages = [];
                    curroom.messages.push(msg);
                    socket.room = curroom;
                }
//                console.log(socket.room)
            });
            io.to(socket.room.name).emit('message', msg);
        });
        socket.on('clear', function () {
            io.to(socket.room).emit('clearing');
        });
        socket.on('poster', function (post) {
            Room.findOne({name: socket.room.name}, function (err, curroom) {
                if (curroom) {
                    curroom.posts.push(post);
                    curroom.save(function (err) {
                        console.log('room updated successfully');
                    });
                    socket.room = curroom;
                }
                else {
                    console.log("Room not found to post in")
                }
                // console.log(socket.room)
            });
            console.log('Posting...' + post.image);
            io.to(socket.room.name).emit('post', post);

        });
        socket.on('characterAdded', function (char) {
            Room.findOne({name: socket.room.name}, function (err, curroom) {
                if (curroom) {
                    console.log(char.stats['0']);
                    curroom.characters.push(char);
                    curroom.save(function (err) {
                        console.log('room updated successfully');
                    });
                    socket.room = curroom;
                }
                else {
                    console.log(socket.room + " was now found")
                    curroom = new Room;
                    curroom.characters = [];
                    curroom.characters.push(char);
                    socket.room = curroom;
                }
                console.log(socket.room)
            });
        });

        socket.on('roomChange', function (room, fn) {
            socket.leave(socket.room);
            Room.findOne({name: room}, function (err, curroom) {
                if (curroom) {
                    console.log("found the room");
                    //.currentroom =    curroom;
                }
                else {
                    var newRoom = Room({name: room});
                    newRoom.save(function (err) {
                        if (err) throw err;

                        console.log("new room created: " + room);
                    });
                    curroom = newRoom;
                }

                socket.room = curroom;
                socket.join(curroom.name);
                console.log(socket.room.name);
                console.log(curroom.characters);
                fn(curroom);                        //HOLY CRAP THIS MAKES NO SENSE AT ALL
            });
            //console.log('gone to room: ' + room);
        });

        socket.on("roomAdded", function (room, user) {
            console.log("hey");
            User.findOne({'local.email': user.local.email}, function (err, foundUser) {
                if (foundUser) {
                    // console.log("pushing room to user " + user.local.email + " campaigns: " + room);
                    Room.findOne({name: room}, function (err, foundRoom) {
                        if (foundRoom) {
                            foundUser.campaigns.push(foundRoom.name);
                            foundUser.save(function (err) {
                                console.log("campaign added to user:" + foundUser.local.email);
                            });
                        }
                        else {
                            var newRoom = Room({name: room});
                            newRoom.save(function (err) {
                                if (err) throw err;

                                console.log("new room created: " + room);
                            });
                            foundUser.campaigns.push(newRoom.name);
                            foundUser.save(function (err) {
                                console.log("campaign added to user:" + foundUser.local.email);
                            });
                        }
                    });
                }
                else {
                    console.log("uhhhhh..... user not found.....");
                }
            })
        });

        socket.on('statAdd', function (room, stat) {
            console.log('statAdd');
            Room.findOne({name: room}, function (err, foundRoom) {
                if (foundRoom) {
                    foundRoom.stats.push(stat);
                    console.log("saving '" + stat + "' to room")
                    foundRoom.save(function (err) {
                        console.log('stat added');
                    });
                };
            });
        });


        socket.on('descriptionUpdate', function (room, des) {
            Room.findOne({name: room}, function (err, foundRoom) {
                if (foundRoom) {
                    foundRoom.description = des;
                    foundRoom.save(function (err) {
                        console.log("updating room description: " + foundRoom.name);
                    });
                }
                else {
                    console.log('description could not find room ' + room);
                }
            });
        });

        socket.on('removeCharacter', function (room, num) {
            console.log("Removing character");
            Room.findOne({name: room}, function (err, foundRoom) {
                foundRoom.characters.splice(num, 1);
                foundRoom.save(function (err) {
                    console.log("Removing character from room: " + foundRoom.name);
                });
            })
        });

        socket.on('removeStat', function (room, num) {
            console.log("Removing Stat");
            Room.findOne({name: room}, function (err, foundRoom) {
                var statRemoved = foundRoom.stats[num];
                foundRoom.characters.forEach(function(char, index, charArray){
                    delete charArray[index].stats[statRemoved];
                });
                foundRoom.stats.splice(num.toString(), 1);
                console.log(foundRoom.characters);
                foundRoom.save(function (err) {
                    console.log("Removing Stat from room: " + foundRoom.name);
                    console.log(foundRoom)
                });
            });
        });
    })
};