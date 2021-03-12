const { db } = require('../util/admin')

// fetch all events
exports.getAllEvents = (req, res) => {
    db
    .collection('events')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
        let events = [];
        data.forEach(doc => {
            events.push({
                eventId: doc.id,
                name: doc.data().name,
                description: doc.data().description,
                date: doc.data().date,
                startTime: doc.data().startTime,
                endTime: doc.data().endTime,
                location: doc.data().location,
                city: doc.data().city,
                state: doc.data().state,
                zipCode: doc.data().zipCode,
                organizerName: doc.data().organizerName,
                contactNumber: doc.data().contactNumber,
                fish: doc.data().fish,
                userHandle: doc.data().userHandle,
                createdAt: doc.data().createdAt,
                commentCount: doc.data().commentCount,
                goingCount: doc.data().goingCount,
                interestedCount: doc.data().interestedCount
            })
        })
        return res.json(events);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json({ error: error.code})
    })
}

// Puts one event into the events collection
exports.postOneEvent = (req, res) => {
    if (req.body.name.trim() === '') {
        return res.status(400).json({ body: 'Name must not be empty' });
    }
    const newEvent = {
        name: req.body.name,
        description: req.body.description,
        date: req.body.date,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        location: req.body.location,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode,
        organizerName: req.body.organizerName,
        contactNumber: req.body.contactNumber,
        fish: req.body.fish,
        userHandle: req.user.handle,
        createdAt: new Date().toISOString(),
        imageUrl: req.user.imageUrl,
        goingCount: 0,
        commentCount: 0,
        interestedCount: 0,
    }

   db
    .collection('events')
    .add(newEvent)
    .then(doc => {
        const resEvent = newEvent;
        resEvent.eventId = doc.id;
        res.json({message: `document ${doc.id} created successfully`})
    })
    .catch((err) => {
        res.status(500).json({error: 'something went wrong'})
        console.error(err);
    })
}

// fetch all information for one event
exports.getEvent = (req, res) => {
    let eventData = {};
    db.doc(`/events/${req.params.eventId}`)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          return res.status(404).json({ error: 'Event not found' });
        }
        eventData = doc.data();
        eventData.eventId = doc.id;
        return db
          .collection('comments')
          .orderBy('createdAt', 'desc')
          .where('eventId', '==', req.params.eventId)
          .get();
      })
      .then((data) => {
          console.log(data)
        eventData.comments = [];
        data.forEach((doc) => {
          eventData.comments.push(doc.data());
        });
        return res.json(eventData);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: err.code });
      });
  };

// comment on a event
exports.commentOnEvent = (req, res) => {
    if (req.body.body.trim() === '') return res.status(400).json({ err: 'Must not be empty'})

    const newComment = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        eventId: req.params.eventId,
        userHandle: req.user.handle,
        userImage: req.user.imageUrl
    };

    db.doc(`/events/${req.params.eventId}`).get()
    .then(doc => {
        if(!doc.exists) {
            return res.status(404).json({ error: 'Event not found'})
        }
        return doc.ref.update({ commentCount: doc.data().commentCount + 1})
        })
        .then(() => {
            return db.collection('comments').add(newComment);
        })
        .then(() => {
            res.json(newComment);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'Something went wrong'})
        })
    }

// going  a event
exports.goingEvent = (req, res) => {
    const goingDocument = db.collection('goings').where('userHandle', '==', req.user.handle)
        .where('eventId', '==', req.params.eventId).limit(1);
    const eventDocument = db.doc(`/events/${req.params.eventId}`);

    let eventData;
    
    eventDocument.get()
    .then(doc => {
        if(doc.exists) {
            eventData = doc.data();
            eventData.eventId = doc.id;
            return goingDocument.get()
        } else {
            return res.status(404).json({ error: 'Event not found'})
        }
    })
    .then(data => {
        if (data.empty){
            return db.collection('goings').add({
                eventId: req.params.eventId,
                userHandle: req.user.handle
            })
            .then(() => {
                eventData.goingCount++
                return eventDocument.update({ goingCount: eventData.goingCount})
            })
            .then(() => {
                return res.json(eventData);
            })
        } else { 
            return res.status(400).json({ error: 'Event already goingd'})
        }
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({ error: err.code})
    })
}


exports.ungoingEvent = (req, res) => {
    const goingDocument = db.collection('goings').where('userHandle', '==', req.user.handle)
        .where('eventId', '==', req.params.eventId).limit(1);
    const eventDocument = db.doc(`/events/${req.params.eventId}`);

    let eventData;
    
    eventDocument.get()
    .then(doc => {
        if(doc.exists) {
            eventData = doc.data();
            eventData.eventId = doc.id;
            return goingDocument.get()
        } else {
            return res.status(404).json({ error: 'Event not found'})
        }
    })
    .then(data => {
        if (data.empty){
            return res.status(400).json({ error: 'Event not goingd'})
        } else { 
            return db.doc(`/goings/${data.docs[0].id}`).delete()
            .then(() => {
                eventData.goingCount--;
                return eventDocument.update({ goingCount: eventData.goingCount})
            })
            .then(() => {
                res.json(eventData);
            })
        }
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({ error: err.code})
    })
}


// interested  a event
exports.interestedEvent = (req, res) => {
    const interestedDocument = db.collection('interesteds').where('userHandle', '==', req.user.handle)
        .where('eventId', '==', req.params.eventId).limit(1);
    const eventDocument = db.doc(`/events/${req.params.eventId}`);

    let eventData;
    
    eventDocument.get()
    .then(doc => {
        if(doc.exists) {
            eventData = doc.data();
            eventData.eventId = doc.id;
            return interestedDocument.get()
        } else {
            return res.status(404).json({ error: 'Event not found'})
        }
    })
    .then(data => {
        if (data.empty){
            return db.collection('interesteds').add({
                eventId: req.params.eventId,
                userHandle: req.user.handle
            })
            .then(() => {
                eventData.interestedCount++
                return eventDocument.update({ interestedCount: eventData.interestedCount})
            })
            .then(() => {
                return res.json(eventData);
            })
        } else { 
            return res.status(400).json({ error: 'Event already interestedd'})
        }
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({ error: err.code})
    })
}


exports.uninterestedEvent = (req, res) => {
    const interestedDocument = db.collection('interesteds').where('userHandle', '==', req.user.handle)
        .where('eventId', '==', req.params.eventId).limit(1);
    const eventDocument = db.doc(`/events/${req.params.eventId}`);

    let eventData;
    
    eventDocument.get()
    .then(doc => {
        if(doc.exists) {
            eventData = doc.data();
            eventData.eventId = doc.id;
            return interestedDocument.get()
        } else {
            return res.status(404).json({ error: 'Event not found'})
        }
    })
    .then(data => {
        if (data.empty){
            return res.status(400).json({ error: 'Event not interested'})
        } else { 
            return db.doc(`/interesteds/${data.docs[0].id}`).delete()
            .then(() => {
                eventData.interestedCount--;
                return eventDocument.update({ interestedCount: eventData.interestedCount})
            })
            .then(() => {
                res.json(eventData);
            })
        }
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({ error: err.code})
    })
}

// fetches events that the current user is going to
exports.getGoingEvents = (req, res) => { 
    db
    .collection('goings')
    .where('userHandle', '==', req.user.handle)
    .get()
    .then(data => {
        let goings = [];
        data.forEach(doc => {
            goings.push(doc.data().eventId)
        })
        return goings;
    })
    .then(eventIds => {
        const refs = eventIds.map(id => db.doc(`events/${id}`))
        db.getAll(...refs)
        .then(events => {
            events = events.map(doc => doc.data())
            return res.json(events)
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({ error: err.code})
    })
}

// fetches all the events that the current user is not signed up to
exports.getNotGoingEvents = (req, res) => { 
    db
    .collection('goings')
    .where('userHandle', '==', req.user.handle)
    .get()
    .then(data => {
        let goings = [];
        data.forEach(doc => {
            goings.push(doc.data().eventId)
        })
        return goings;
    })
    .then(goingEventIds => {
        db
        .collection('events')
        .get()
        .then(events => {
            result = []
            goingSet = new Set(goingEventIds)
            console.log(goingEventIds)
            events.forEach(doc => {
                if (!goingSet.has(doc.id)) {
                    result.push(doc.data())
                }
            })
            return res.json(result)
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({ error: err.code})
    })
}