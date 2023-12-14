const express = require('express');
const ejs = require('ejs');
const path = require('path');
// const fs = require('fs');

const app = express();
const port = 3000;

const { MongoClient, ServerApiVersion } = require('mongodb');


// Middleware to parse incoming request bodies
app.use(express.urlencoded({ extended: true }));

// Body parser middleware to parse JSON in the request body
app.use(express.json());
// Set EJS as the view engine
app.set('view engine', 'ejs'); // Set EJS as the view engine

// Set up static files
app.use(express.static(path.join(__dirname, 'public')));

// Define routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Function to connect to database and return all records in it

const  getPassword= async (data)=>{
   // get value from formData
   const uri = data.uri;
   console.log(`uri: ${uri}`)

   const database_name = data.database;
   console.log(`databas: ${database_name}`)

   const collection_name = data.collection;
   console.log(`collection: ${collection_name}`)

   const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  
  try {
      // Connect the client to the server	(optional starting in v4.7)
      console.log("start to connect to database")
      await client.connect();

      // Get db and collection
      
      const db = client.db(database_name);
      
      const collection = db.collection(collection_name);

      // Get cursor
      const cursor =  collection.find({}, { projection: { _id: 0 } });

      const records = await cursor.toArray();

      return records;

  } 
  finally {
      // Ensures that the client will close when you finish/error
      await client.close();
  }
}


// Your route to handle the POST request
app.post('/password', async (req, res) => {

  // test();
  // res.send(req.body)
  try {
    const records = await getPassword(req.body);

    // Respond to the client with the retrieved records
    // res.json(records);

    // redirect to an new page
    res.redirect(`/result?data=${encodeURIComponent(JSON.stringify(records))}`);

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/result', (req, res) => {
  // Retrieve the data from the query parameter
  const data = JSON.parse(decodeURIComponent(req.query.data || '[]'));

  // Render the EJS template with the retrieved data
  res.render('result', { data });
});




// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
