const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://newspaperDB:4od7NDkjdNSkKUYU@cluster0.ibuouo3.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // collections
    const articles = client.db("newspaperDB").collection("articles");
    const publishers = client.db("newspaperDB").collection("publishers");

    // post a article
    app.post("/articles", async (req, res) => {
      const article = req.body;
      const result = await articles.insertOne(article);
      res.send(result);
    });

    // get all articles
    app.get("/articles", async (req, res) => {
      const result = await articles.find().toArray();
      res.send(result);
    });

    // get article by id
    app.get("/article/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await articles.findOne(query);
      res.send(result);
    });

    // delete a article
    app.delete("/articles/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await articles.deleteOne(filter);
      res.send(result);
    });

    // approved articles
    app.get("/approvedArticles", async (req, res) => {
      const query = { status: "approved" };
      const result = await articles.find(query).toArray();
      res.send(result);
    });

    // update article status
    app.put("/articles/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedStatus = req.body;
      const doc = {
        $set: {
          status: updatedStatus.status,
        },
      };
      const result = await articles.updateOne(filter, doc, options);
      res.send(result);
    });

    // update article by id
    app.put("/updateArticle/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = req.body;
      const doc = {
        $set: {
          title: updatedDoc.title,
          image: updatedDoc.image,
          publisher: updatedDoc.publisher,
          publisherImage: updatedDoc.publisherImage,
          tag: updatedDoc.tag,
          description: updatedDoc.description,
        },
      };
      const result = await articles.updateOne(filter, doc, options);
      res.send(result);
    });

    // sorted articles by view
    app.get("/articlesByView", async (req, res) => {
      const query = { status: "approved" };
      const options = {
        sort: { views: -1 },
        projection: { image: 1, title: 1 },
      };
      const result = await articles.find(query, options).toArray();
      res.send(result);
    });

    // premium articles
    app.get("/premiumArticles", async (req, res) => {
      const query = {
        isPremium: true,
        status: "approved",
      };
      const result = await articles.find(query).toArray();
      res.send(result);
    });

    // articles by author email
    app.get("/articleByAuthor/:email", async (req, res) => {
      const email = req.params.email;
      const query = { authorEmail: email };
      const result = await articles.find(query).toArray();
      res.send(result);
    });

    // publisher api
    app.get("/publishers", async (req, res) => {
      const result = await publishers.find().toArray();
      res.send(result);
    });

    // publisher by publisher name
    app.get("/publisher/:publisher", async (req, res) => {
      const publisherParams = req.params.publisher;
      const query = { publisher: publisherParams };
      const result = await publishers.findOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// server status
app.get("/", (req, res) => {
  res.send("Newspaper server is running");
});
app.listen(port, () => {
  console.log(`Newspaper server is running at ${port}`);
});
