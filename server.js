require("dotenv").config(); // Import dotenv for environment variables
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5002; // Use Render's dynamic port or fallback to 5002

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: "https://lovely-sawine-55aadf.netlify.app", // Replace with your Netlify frontend domain
  methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed methods
}));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Define Schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  done: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
});

// Define Model
const Contact = mongoose.model("Contact", contactSchema);

// GET all contacts
app.get("/contacts", async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    res.status(500).send("Error fetching contacts");
  }
});

// POST create contact
app.post("/submit", async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).send("Contact created successfully");
  } catch (error) {
    res.status(500).send("Error creating contact");
  }
});

// PUT update contact
app.put("/update/:id", async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!contact) return res.status(404).send("Contact not found");
    res.send("Contact updated successfully");
  } catch (error) {
    res.status(500).send("Error updating contact");
  }
});

// PUT toggle "done" status
app.put("/toggle-done/:id", async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).send("Contact not found");
    contact.done = !contact.done;
    await contact.save();
    res.send("Done status updated successfully");
  } catch (error) {
    res.status(500).send("Error updating status");
  }
});

// DELETE a contact
app.delete("/delete/:id", async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).send("Contact not found");
    res.send("Contact deleted successfully");
  } catch (error) {
    res.status(500).send("Error deleting contact");
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
