const router = require("express").Router();
const UserController = require("../controllers/user.controller");
const { checkSchema } = require("express-validator");
const {
  userDataValidate,
  userDataValidateSchemaBased,
  userDataValidateChainableAPI,
} = require("../validations/user.validation");

// using traditional validation middleware
router.post("/traditional", userDataValidate, UserController.addUser);

// using chain api validation from express-validator
router.post("/chainApi", userDataValidateChainableAPI, UserController.addUser);

// using schema-based validation from express-validator
router.post(
  "/schama-based",
  checkSchema(userDataValidateSchemaBased),
  UserController.addUser
);

module.exports = router;
