const express = require("express");
const router = express.Router();

exports.getAllUsers = (req, res) =>
{
    // Logic to get all users
    res.send("Get all users");
}


router.get("/", exports.getAllUsers);



module.exports = router;