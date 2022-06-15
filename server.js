const path = require('path')
const fs = require('fs')
const express = require('express')
const app = express()
const cors = require('cors')

app.use(express.json())
app.use(cors());

// connect to MongoDB
const {MongoClient} = require('mongodb')


const url = "mongodb+srv://ahmed:ahmed@cluster0.wpzicz4.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(url)
let db;
const conn =async()=>{
  
    await client.connect()
    console.log("Connected");
     db = client.db('çw2')

    // db.collection('lessons').insertMany([
    //     {
    //         "id": "1",
    //         "image":"images/biology.png" ,
    //         "subject":"Biology",
    //         "location":"Lyon",
    //         "price":280,
    //         "availableInventory":5  
    //     },
    //     {
    //         "id": "2",
    //         "subject":"Chemistry",
    //         "location":"Muscat",
    //         "price":215 ,
    //         "availableInventory":10,
    //         "image":"images/chemistry.jpg"   
    //     },
    //     {
    //         "id": "3",
    //         "subject":"Commerce",
    //         "location":"Delhi",
    //         "price":230,
    //         "availableInventory":5,
    //         "image":"images/commerce.png"   
    //     },
    //     {
    //         "id": "4",
    //         "subject":"Computer",
    //         "location":"Karachi",
    //         "price":110,
    //         "availableInventory":5,
    //         "image":"images/computer.png"   
    //     },
    //     {
    //         "id": "5",
    //         "subject":"Economics",
    //         "location":"Gdansk",
    //         "price":150,
    //         "availableInventory":5,
    //         "image":"images/economics.jpg"   
    //     },
    //     {
    //         "id": "6",
    //         "subject":"English",
    //         "location":"Tokyo",
    //         "price":200,
    //         "availableInventory":5,
    //         "image":"images/english.png"   
    //     },
    //     {
    //         "id": "7",
    //         "subject":"Geography",
    //         "location":"Riyadh",
    //         "price":110,
    //         "availableInventory":5,
    //         "image":"images/geography.jpg"   
    //     },
    //     {
    //         "id": "8",
    //         "subject":"Gymnastics",
    //         "location":"Cairo",
    //         "price":120,
    //         "availableInventory":5,
    //         "image":"images/gym.png"   
    //     },
    //     {
    //         "id": "9",
    //         "subject":"History ",
    //         "location":"Dubai",
    //         "price":180,
    //         "availableInventory":5,
    //         "image":"images/History.png"   
    //     },
    //     {
    //         "id": "10",
    //         "subject":"Maths",
    //         "location":"London",
    //         "price":100,
    //         "availableInventory":5,
    //         "image":"images/maths.jpg"   
    //     },
        
    // ])
}
conn()
// MongoClient.connect(url,async (err, client) => {
//     try {
//         db = await client.db('cw2')  
//     } catch (error) {
//         console.log(error);
//     }

// })
// get the collection name
app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName)
    return next()
})

// Logging middleware
app.use(function(req, res, next){
    console.log("Request type: "+req.method)
    console.log("Request url: "+req.url)
    console.log("Request date: "+new Date())
    console.log("Request IP: "+req.ip)
    next()
})

app.get('/', (req, res) => {
    res.send("Welcome to entry point")
})

// Get all lessons
app.get('/collection/:collectionName', (req, res) => {
    req.collection.find({}).toArray((err, results) => {
        if (err) return next(err)
        res.send(results)
    })
})

// Add new order
app.post('/collection/:collectionName', (req, res) => {
    let doc = JSON.stringify(req.body)
    req.collection.insertOne(doc, (err, result) => {
        if (err) return next(err)
        res.send({msg: "order added successfully"})
    })
})

// Update spaces
app.put('/collection/:collectionName', (req, res) => {
    const body = req.body;
    const arr = []
    arr.push(body)
    arr.forEach((item) => {
        let filter = { id: item.id }
        let new_value = { $set: {availableInventory: item.availableInventory} }
        let options = { safe: true, multi: false }
        req.collection.updateOne(filter, new_value, options, (err, result) => {
            if (err) return next(err)
        })
    });
    console.log(arr);
    console.log(body);
    res.send({msg: "spaces successfully updated"})
})

// back end search function
app.get('/collection/:collectionName/filter', (req, res) => {
    let search_keyword = req.query.search
    req.collection.find({}).toArray((err, results) => {
        if (err) return next(err)
        let filteredList = results.filter((lesson) => {
            return lesson.subject.toLowerCase().match(search_keyword.toLowerCase()) || lesson.location.toLowerCase().match(search_keyword.toLowerCase())
        });  
        res.send(filteredList)
    })
})

// Static file middleware
app.use(function(req, res, next){
    var filePath = path.join(__dirname, "static", req.url)
    fs.stat(filePath, function(err, fileInfo){
        if (err) {
            next()
            return
        }
        if (fileInfo.isFile()) {
            res.sendFile(filePath)
        }
        else{
            next()
        }
    })
})

app.use(function(req, res){
    res.status(404)
    res.send("file not found")
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log("Running on port 3000")
})