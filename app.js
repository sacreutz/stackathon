const express = require('express')
const path = require('path');
const app = express()
const port = 3000

app.use('/style', express.static(path.join(__dirname, '/style')))
app.use('/scripts', express.static(path.join(__dirname, '/scripts')))
app.use('/samples', express.static(path.join(__dirname, '/samples')))

app.get('/', (req, res, next) => {
  res.sendFile(path.join(__dirname, './index.html'))
});

app.use((err, req, res, next) => {
  console.error(err, err.stack)
  res.status(500).send(err);
})

app.listen(port, () => console.log(`Listening on port ${port}!`))


