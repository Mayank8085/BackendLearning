require('dotenv').config();
const express = require('express');
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookies = require('cookie-parser');
const User = require('./model/user');
const auth = require('./middleware/auth');


require('./config/database').connect();

const app = express();

app.use(express.json());
app.use(cookies());

app.get('/', (req, res) => {
    res.send("<h1>Hello World</h1>");
    });

app.post("/register",async (req, res) => {
    try {
        const {firstname, lastname, email, password} = req.body;
    if (!firstname || !lastname || !email || !password) {
        return res.status(400).send("Please enter all fields");
    }

    const existingUser= await User.findOne({email: email}); //promise
    if (existingUser) {
        return res.status(400).send("User already exists");
    }

    const encryptedPassword = await bycrypt.hash(password, 10);
    const user = await User.create({
        firstname,
        lastname,
        email : email.toLowerCase(),
        password: encryptedPassword
    });

    const token = jwt.sign({
        user_id: user._id,
        email: user.email
    }, process.env.TOKEN_SECRET,
    {
        expiresIn: "2h"

    }
    );

    user.token = token;
    user.password = undefined;



    res.status(200).json(user);

        
    } catch (error) {
        res.status(500).send(error);
        
    }




}
    )

app.post("/login", async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return res.status(400).send("Please enter all fields");
        }

        const user = await User.findOne({email: email});
        if (!user) {
            return res.status(400).send("User does not exist");
        }

        const isMatch = await bycrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send("Incorrect password");
        }
        const token = jwt.sign({
            user_id: user._id,
            email: user.email
        }, process.env.TOKEN_SECRET,
        {
            expiresIn: "2h"
        }
        );
        user.token = token;
        user.password = undefined;
        // res.status(201).json(user);

        //cookies
        const options = {
            expires: new Date(Date.now() + 1000 * 60 * 60 * 2),
            httpOnly: true
        };
        res.cookie("token", token, options).json(
            {
                message: "Logged in successfully",
                user,
                token
            }
        );

    

    } catch (error) {
        res.status(500).send(error);
    }
});

app.get("/dashboard", auth, async (req, res) => {
    res.status(200).json({
        message: "Welcome to your dashboard"
    });
});

    


module.exports = app;

