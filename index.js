const express = require('express');
const app     = express();

app.get('/', (req, res) => {
  res.send('FshyBot | arc.moe');
});

app.listen(3000, () => console.log('Server running on port 3000'));
