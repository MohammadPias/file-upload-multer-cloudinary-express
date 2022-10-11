const express = require("express");
const multer = require('multer');
const path = require("path");
const cors = require("cors");
const cloudinary = require('cloudinary').v2;
require('dotenv').config();
const fs = require("fs")


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
const port = process.env.PORT || 5000;

// cloudinary config

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// upload cloudinary

const uploadImage = async (imagePath) => {
    const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: true,
    };

    try {
        // Upload the image
        const result = await cloudinary.uploader.upload(imagePath, options);
        console.log(result, "upload result");
        return { id: result.public_id, url: result.url };
    } catch (error) {
        new Error("File can't upload!");
    }
};

const up_dest = "./uploads";
let fileName = "";



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, up_dest)
    },
    filename: (req, file, cb) => {
        const fileExt = path.extname(file.originalname);
        fileName = file.originalname
            .replace(fileExt, "")
            .toLocaleLowerCase()
            .split(" ")
            .join("-") + "-" + Date.now() + fileExt;
        cb(null, fileName)
    }
})
const upload = multer({
    storage,
    limits: {
        fileSize: 1000000,
    },
    fileFilter: (req, file, cb) => {
        // console.log(file);
        if (file.mimetype === "image/jpg" ||
            file.mimetype === "image/png" ||
            file.mimetype === "image/jpeg") {
            cb(null, true)
        } else {
            cb(new Error("Only jpg, jpeg and png file are allowed!"))
        }
    }
})



app.post("/upload", upload.single("avatar"), async (req, res, next) => {
    // res.status(201).json(`http://localhost:5000/uploads/${fileName}`)
    const imgUrl = await uploadImage(req.file.path)
    console.log(imgUrl)
    fs.unlinkSync(req.file.path)
    res.status(201).json(imgUrl)
})



// error handling

app.use((err, req, res, next) => {
    if (err) {
        if (err instanceof multer.MulterError) {
            res.status(500).send("Your file wasn't uploaded!!")
        } else {
            res.status(500).send(err.message)
        }
    }
})

app.get("/", (req, res) => {
    res.send("Welcome to File Upload Server")
})

app.listen(port, () => {
    console.log(`listening port on ${port}`)
})