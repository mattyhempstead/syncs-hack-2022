require("dotenv").config();
const express = require("express");

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.post('/editing/image/process', (req, res) => {
  //res.send('Got a PUT request at /user')
  res.json({
      type:"SUCCESS",
      resource: {
          type: "JPG",
          url: "https://i.kym-cdn.com/entries/icons/original/000/000/475/HasANyone.jpg",
          width: 900,
          height:900
      }
  });
})


app.listen(process.env.PORT || 3000);
