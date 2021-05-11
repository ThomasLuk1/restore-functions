const functions = require("firebase-functions");
const express = require('express')
const { response, request } = require("express");
const cors = require('cors');

const app = express();
app.use(cors())
const FBAuth = require('./util/fbAuth')

const { getAllScreams, postOneScream, getScream, commentOnScream, likeScream, unlikeScream } = require('./handlers/screams')

const { getAllEvents, postOneEvent, getEvent, commentOnEvent, goingEvent, ungoingEvent, interestedEvent, uninterestedEvent, getGoingEvents, getNotGoingEvents, getPopularEvents, getFriendEvents } = require('./handlers/events')

const  { signup, login, uploadImage, addUserDetails, getAuthenticatedUser, handleFriendRequest, getAllFriends, getAllRequests, sendRequest, changeBackgroundTheme } = require('./handlers/users')

const  { addFishForUser, getFishForUser } = require('./handlers/aquarium')

// Scream Routes
app.get('/screams', getAllScreams)
app.post('/scream', FBAuth, postOneScream)
app.get('/scream/:screamId', getScream);
app.get('/scream/:screamId/like', FBAuth, likeScream)
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream)
app.post('/scream/:screamId/comment', FBAuth, commentOnScream)

// Event Routes
app.get('/events', getAllEvents)
app.post('/event', FBAuth, postOneEvent)
app.get('/event/:eventId', getEvent);
app.post('/event/:eventId/going', FBAuth, goingEvent)
app.post('/event/:eventId/ungoing', FBAuth, ungoingEvent)
app.post('/event/:eventId/interested', FBAuth, interestedEvent)
app.post('/event/:eventId/uninterested', FBAuth, uninterestedEvent)
app.post('/event/:eventId/comment', FBAuth, commentOnEvent)
app.get('/events/going', FBAuth, getGoingEvents)
app.get('/events/notgoing', FBAuth, getNotGoingEvents)
app.get('/events/getPopularEvents', FBAuth, getPopularEvents)
app.get('/events/getFriendEvents', FBAuth, getFriendEvents)

// Users Routes
app.post('/signup', signup)
app.post('/login', login)
app.post('/user/image', FBAuth, uploadImage)
app.post('/user', FBAuth, addUserDetails)
app.get('/user', FBAuth, getAuthenticatedUser)
app.post('/user/handleFriendRequest', FBAuth, handleFriendRequest)
app.post('/user/sendRequest', FBAuth, sendRequest)
app.get('/user/getAllFriends', FBAuth, getAllFriends)
app.get('/user/getAllRequests', FBAuth, getAllRequests)
app.post('/user/changeBackgroundTheme', FBAuth, changeBackgroundTheme)

// Aquarium Routes
app.post('/aquarium/fish/add', FBAuth, addFishForUser)
app.get('/aquarium/getAllFishForUser', FBAuth, getFishForUser)

exports.api = functions.https.onRequest(app);
