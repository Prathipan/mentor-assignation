import express from "express"
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

const app = express();
app.use(express.json());
dotenv.config();

// const MONGO_URL = "mongodb://localhost";
const MONGO_URL = process.env.MONGO_URL;

async function createConnection() {
 const client = new MongoClient(MONGO_URL);
 await client.connect();
 console.log("mongo is connected");
 return client;
}
const client = await createConnection();

app.get("/" , (req , res) => {
    console.log("node app is running");
    res.send("HELLO node app");
});

app.post("/createMentor" , async (req,res) => {
    const data = req.body;
    const result = await client.db("ClassDB").collection("mentor").insertOne(data);
    res.send(result);
})

app.post("/createStudent" ,async (req,res) => {
    const data = req.body;
    const result = await client.db("ClassDB").collection("student").insertOne(data);
    res.send(result);
})

app.put("/addmentor/:name" , async (req,res) => {
    const {name} = req.params;
    // console.log(name);
    const studentsToAdd = req.body.students;
    // console.log(studentsToAdd);
    const result = await client.db("ClassDB").collection("mentor").updateMany({ "name": name }, { $set : { studentsAssigned : studentsToAdd } });
    studentsToAdd.map((async (student) => {
        let result = await client.db("ClassDB").collection("student").updateMany({ name: student }, { $set: { mentor: name } });
    }))
    res.send(result);
});

app.put("/changementor/:studentname" , async (req,res) => {
    const {studentname} = req.params;
    const mentor = req.body.mentor;
    // console.log(studentname);
    const result = await client.db("ClassDB").collection("student").updateOne({"name" : studentname} , {$set : {mentor : mentor}});
    res.send(result);
})

app.get("/studentdetails/:id" , async (req,res) => {
    const {id} = req.params;
    console.log(id);
    const result = await client.db("ClassDB").collection("mentor").find({"id" : id},{studentsAssigned : 1}).toArray();
    console.log(result);
    res.send(result);
})
 
const PORT = process.env.PORT;
app.listen(PORT , () => {
    console.log(`app is running on port ${PORT}`);
});