const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { Sequelize, DataTypes } = require("sequelize"); //import the Sequelize library and the DataTypes object from the sequelize module
const cors = require("cors"); //cors middleware to enable cross origin resource sharing; allows web apps loaded in one domain to access resources in another domain

const app = express(); //create an express app
const port = 3002; 
const corsOptions = {
  origin: "*", //allows all origins
  credentials: true,
  access_control_allow_credentials: true, 
  optionSuccessStatus: 200, 
};


app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, "public"))); //serve static files from the public directory; static files are files that don't change and aren't server-generated, but must be sent to the browser when requested
app.use(bodyParser.json()); //parse incoming request bodies in a middleware before your handlers, parses strings into json objects

const sequelize = new Sequelize("currency_converter", "username", "password", { //initialize a new Sequelize library instance and connects to the database "currency_converter"
  host: "localhost",
  dialect: "sqlite",
  storage: "./database.sqlite",

});

const Favorite = sequelize.define("Favorite", { //define a new model called Favorite
  base: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  target: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

sequelize.sync(); //synchronize the model with the database, creating the table if it doesn't exist

//app.POST = method provided by express framework 
app.post("/favorites", async (req, res) => { //Defining a new POST endpoint at the path /favorites.
  try { //try block used to wrap code that might throw an error
    const { base, target } = req.body; //destructures the request body to get the base and target properties
    const favorite = await Favorite.create({ base, target });
    res.status(201).json(favorite);
  } catch (error) { //if error is thrown, control moves to catch block
    res.status(500).json({ error: error.message });
  }
});

app.get("/favorites", async (req, res) => { //defines GET route to retrieve all favorites from the database
  try {
    const favorites = await Favorite.findAll();
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });

sequelize.sync().then(() => { //ensures that the database is synced before starting the server
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});
