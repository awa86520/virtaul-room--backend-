const express = require("express");
const { getAllUsers } = require("../controllers/getuserController");

const router = express.Router();

router.get("/all", getAllUsers);

module.exports = router;
