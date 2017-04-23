import express from 'express';
import path from 'path';

import admin from './modules/admin';

const app = express();

app.set('port', (process.env.PORT || 5000));

app.use('/', express.static(path.join(__dirname, 'public')));

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index', { version: process.env.VERSION || 'local' });
});

app.use('/admin', admin);

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});
