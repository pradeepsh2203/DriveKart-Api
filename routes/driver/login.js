const express = require("express");
const router = express.Router();
const { Driver } = require("../../schema/driver");
const jwt = require("jsonwebtoken");
const otpGen = require("otp-generator");
const OTP = require("../../schema/otp");

router.post("/login", async (req, res) => {
	try {
		const { username, password } = req.body;
		const driverData = await Driver.findOne({ username, password });

		if (!driverData) {
			res.status(200).send("Either Username or Password is incorrect");
		} else {
			const token = jwt.sign(
				{
					sub: driverData.id,
				},
				process.env.JWT_SECRET,
				{ expiresIn: "1day", issuer: "DriveKart" }
			);
			res.status(200).json({
				token,
				user: driverData,
			});
		}
	} catch (err) {
		console.log("Error occured while Login the user", érr.message);
		res.status(503).send("Server Internal Error");
	}
});

router.post("/otp/generate", async (req, res) => {
	try {
		const { email } = req.body;

		const otp = otpGen.generate(6, {
			lowerCaseAlphabets: false,
			upperCaseAlphabets: false,
			specialChars: false,
		});
		console.log("OTP", otp);
		const otp_doc = new OTP({ otp });
		await otp_doc.save();
		const result = await Driver.findOneAndUpdate(
			{ email },
			{ otp: otp_doc.id }
		);
		res.send("OTP has been sent successfully");
		console.log(result);
	} catch (err) {
		console.log("Error occured while generating OTP", err.message);
		res.status(503).send("Server Internal Error");
	}
});

router.post("/otp/verify", async (req, res) => {
	try {
		const { email, otp } = req.body;
		const driver = await Driver.findOne({ email });

		const OTP_doc = await OTP.findById(driver.otp);

		if (!OTP_doc) {
			res.status(203).send("Your OTP has expired");
		} else {
			if (OTP_doc.compareOTP(otp)) {
				const token = jwt.sign(
					{
						sub: driver.id,
					},
					process.env.JWT_SECRET,
					{ expiresIn: "1day", issuer: "DriveKart" }
				);
				res.status(200).json({
					token,
					user: driver,
				});
			} else {
				res.status(203).send("Your OTP is incorrect");
			}
		}
	} catch (err) {
		console.log("Error occured while verifying the otp", err.message);
		res.status(503).send("Server Internal Error");
	}
});

module.exports = router;