const router = require("express").Router();
const { User } = require("../models/user");
const bcrypt = require("bcryptjs");
const Joi = require("joi");

router.post("/", async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error)
            return res.status(400).send({ message: error.details[0].message });

        const user = await User.findOne({ email: req.body.email });
        console.log("User found:", user);

        if (!user)
            return res.status(401).send({ message: "Invalid Email or Password" });

        console.log("Password from front end:", req.body.password);

        const validPassword = await bcrypt.compare(
            req.body.password,
            String(user.password)
        );
        console.log("Password comparison result:", validPassword);

        if (!validPassword)
            return res.status(401).send({ message: "Invalid Email or Password" });

        if (!user.verified)
            return res.status(401).send({ message: "User is not verified. Please verify your account." });

        const token = user.generateAuthToken();
        res.status(200).send({ data: token, message: "Logged in successfully" });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

const validate = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required().label("Email"),
        password: Joi.string().required().label("Password"),
    });
    return schema.validate(data);
};

module.exports = router;
