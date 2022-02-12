// Importing libraries
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const DealerRoutes= require("./routes/dealer/signup")
require("dotenv").config();

// Routes
const DriverLoginRouter = require("./routes/driver/login");

// All the middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ strict: false }));
app.use(cors());

// Database Connnection
mongoose.connect(process.env.DB_URI, () => {
	console.log("Database Connected");
});

// Routes
app.use("/driver", DriverLoginRouter);
app.get("/", (req, res) => {
	res.send("Your server is woking fine!!");
});

app.listen(process.env.PORT || 3000, () => {
	console.log("Server is running on port", process.env.PORT || 3000);
});

app.use("/dealer", DealerRoutes);
