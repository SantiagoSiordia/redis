const express = require("express");
const axios = require("axios");
const cors = require("cors");
const redis = require("redis");

const DEFAULT_EXPIRATION = 3600;

const redisClient = redis.createClient();
redisClient.on("error", (err) => console.log("Redis Client Error", err));

(async () => {
  await redisClient.connect();
})();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/photos", async (req, res) => {
  const albumId = req.query.albumId;

  const photos = await redisClient.get(`photos?albumId=${albumId}`);

  if (photos != null) return res.json(JSON.parse(photos));

  const { data } = await axios.get(
    "https://jsonplaceholder.typicode.com/photos",
    { params: { albumId } }
  );

  redisClient.setEx(
    `photos?albumId=${albumId}`,
    DEFAULT_EXPIRATION,
    JSON.stringify(data)
  );

  res.json(data);
});

app.get("/photos/:id", async (req, res) => {
  const { data } = await axios.get(
    `https://jsonplaceholder.typicode.com/photos/${req.params.id}`
  );

  res.json(data);
});

app.listen(3000);
