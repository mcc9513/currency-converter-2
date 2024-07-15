const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { Sequelize, DataTypes } = require("sequelize");
const cors = require("cors");

const app = express();
const port = 3002;
const corsOptions = {
  origin: "*",
  credentials: true,
  access_control_allow_credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

const sequelize = new Sequelize("currency_converter", "username", "password", {
  host: "localhost",
  dialect: "sqlite",
  storage: "./database.sqlite",

});

const Favorite = sequelize.define("Favorite", {
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

sequelize.sync();

app.post("/favorites", async (req, res) => {
  try {
    const { base, target } = req.body;
    const favorite = await Favorite.create({ base, target });
    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/favorites", async (req, res) => {
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

sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});
