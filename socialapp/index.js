const express = require('express');
const format=require('date-format');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();


const swaggerDocument = YAML.load('./swagger.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


const PORT= process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.status(200).send('<h1>Hello World! </h1>');
});

app.get('/api/v1/instagram', (req, res) => {
    const instagram = {
        "username": "Mayank",
        "followers": "1,000",
        "following": "1,000",
        "date": Date.now()
    }
    res.status(200).json(instagram);
});

app.get('/api/v1/facebook', (req, res) => {
    const facebook = {
        username: "MayankSahu",
        followers: 1000,
        following: 100,
        date: new Date()
    }
    res.status(200).json(facebook);
});

app.get('/api/v1/linkedin', (req, res) => {
    const linkedin = {
        "username": "Mayank Sahu",
        "followers": "1,00",
        "following": "1,00",
        "date": format('dd-MM-yyyy [hh:mm:ss]', new Date())
    }
    res.status(200).json(linkedin);
});

app.get('/api/v1/:token', (req, res) => {
    const token = req.params.token;
    res.status(200).send(`<h1>Welcome to Social App!</h1> <h2>Your token is: ${token}</h2>`);
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


