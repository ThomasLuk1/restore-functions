const { db } = require('../util/admin')
const config = require('../util/config')

exports.getFishForUser = (req, res) => {
    db
        .collection('fish')
        .where('user', '==', req.user.handle)
        .get()
        .then((docs) => {
            fishes = []
            docs.forEach((doc) => {
                let fishName = doc.data().type
                let leftFish = getFishURL(`${fishName}_left`)
                let rightFish = getFishURL(`${fishName}_right`)
                let fishObject = {
                    fishName: fishName,
                    leftFish: leftFish,
                    rightFish: rightFish
                }
                fishes.push(fishObject);
              });
            res.json(fishes);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'Something went wrong'})
        })
}

function getFishURL(fishName) {
    return `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${fishName}.png?alt=media`
}
exports.addFishForUser = (req, res) => {
    if (req.body.type === '') return res.status(400).json({ err: 'Must not be empty'})

    const newFish = {
        user: req.user.handle,
        type: req.body.type
    }
    
    db.collection('fish').add(newFish)
    .then(() => {
        res.json(newFish);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ error: 'Something went wrong'})
    })
}

