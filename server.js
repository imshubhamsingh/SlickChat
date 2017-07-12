/**
 * Created by shubham on 10/7/17.
 */

var express = require('express'),
    app = express(),
    path = require('path'),
    cors = require('cors'),
    fallback = require('express-history-api-fallback');

const port = process.env.PORT || 3312;

app.use(cors());
app.use(express.static(path.join(__dirname,'./app')));
app.use(fallback('public/index.html', {root: __dirname}));

app.listen(port, function () {
    console.log('Server Running a port ' + port);
});
