const express = require('express');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
    cloud_name: 'dbpnculx9', 
    api_key: '373226971469266', 
    api_secret: 'F7DWcT_Pk0dS9FaRdO0pEGeUkLU',
    secure: true
  });

const app = express();


app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload(
    {
        useTempFiles: true,
        tempFileDir: './tmp/'
    }
));

app.get('/myget', (req, res) => {
    
    console.log(req.body);
    res.send(req.query);
})

app.post('/mypost', async (req, res) => {
    //for multiple files
    let imageArray = [];
    if(req.files) {
        const files = req.files.samplefile;
        for(let i = 0; i < files.length; i++) {
            let result= await cloudinary.uploader.upload(files[i].tempFilePath,{
                folder: 'user'
            })

            imageArray.push(result.secure_url);
        }
        let details = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            imageArray
            };

            console.log(details);

            res.send(details);
        }
    
    
    
    // ## for single file
    // let file =  req.files.samplefile;
    // result = await cloudinary.uploader.upload(file.tempFilePath, {
    //     folder:"user"
    // },function(error, result) {
    //     console.log(result);
    //     res.send(result);
    // });

    // res.send(result);


})

app.get("/mygetform", (req, res) => {
    res.render('getform');
})

app.get("/mypostform", (req, res) => {
    res.render('postform');
})
    

app.listen(4000 , () => {
    console.log('Server is running on port 4000');}
);
