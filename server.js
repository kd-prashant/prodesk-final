require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Schemas
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const careerSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  resume: String,
  createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model("Contact", contactSchema);
const Career = mongoose.model("Career", careerSchema);

// Routes

// Contact Form
app.post("/contact", async (req, res) => {
  try {
    await Contact.create(req.body);
    res.send("Contact Saved Successfully");
  } catch (error) {
    res.status(500).send("Error saving contact");
  }
});

// Career Form
app.post("/career", upload.single("resume"), async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const newCareer = new Career({
      name,
      email,
      phone,
      message,
      resume: req.file ? req.file.filename : null
    });

    await newCareer.save();

    // res.send("Career Application Saved Successfully");
    res.json({ message: "Career Application Saved Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error saving career");
  }
});

// Admin Page Data
app.post("/admin-login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin123") {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

app.post("/admin-data", async (req, res) => {
  const { username, password } = req.body;

  if (username !== "admin" || password !== "admin123") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const contacts = await Contact.find();
  const careers = await Career.find();

  res.json({ contacts, careers });
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});