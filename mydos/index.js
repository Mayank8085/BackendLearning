const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const fileUpload = require('express-fileupload');

const app = express();

app.use(express.json());
app.use(fileUpload());

const swaggerDocument = YAML.load('./swagger.yaml');



app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

let courses=[
    {
        id: 1,
        name: 'course1',
        price : 100

    },
    {
        id: 2,
        name: 'course2',
        price : 200
    },
    {
        id: 3,
        name: 'course3',
        price : 300
    }
]

app.get('/api/v1/mayank', (req, res) => {
    res.send("hello from mayank Doc's")
})

app.get('/api/v1/msobject', (req, res) => {
    res.send({
        name: 'mayank',
        age: 20,
        city: 'pune'

    })
})

app.get('/api/v1/courses', (req, res) => {
    res.send(courses)
})

app.get('/api/v1/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id))
    if(!course) return res.status(404).send('The course with the given ID was not found')
    res.send(course)
})

app.post('/api/v1/courses', (req, res) => {
    

    const course = {
        id: courses.length + 1,
        name: req.body.name,
        price: req.body.price
    }
    courses.push(course);
    res.send(course)
})

app.get("/api/v1/coursequery", (req, res) => {
    
    let location = req.query.location;
    let device = req.query.device;
  
    res.send({ location, device });
})

app.post("/api/v1/courseupload", (req, res) => {
    console.log(req.headers);

    if (Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.');
    }
    const file = req.files.file;

    file.mv(`${__dirname}/images/${file.name}`, err => {
        if (err) return res.status(500).send(err);
        res.send(`File uploaded!`);
    });
});

// console.log(req.headers);
//   const file = req.files.file;
//   console.log(file);
//   let path = __dirname + "/images/" + Date.now() + ".jpg";

//   file.mv(path, (err) => {
//     res.send(true);
//   });


app.listen(5000, () => {
    console.log('Server is running on port 5000');
    });