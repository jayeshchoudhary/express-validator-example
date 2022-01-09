const userDataValidate = (req, res, next) => {
  let errorMessage = "";
  if (!req.body.userName) {
    errorMessage = "username is required";
  }
  if (!req.body.password) {
    errorMessage = "password is required";
  }
  if (req.body.password.length < 5) {
    errorMessage = "password should have atleast 5 characters";
  }
  if (
    req.body.email.match(
      '/^(([^<>()[]\\.,;:s@"]+(.[^<>()[]\\.,;:s@"]+)*)|(".+"))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/'
    )
  ) {
    errorMessage = "provide valid email";
  }

  // send error
  if (errorMessage) {
    res.status(400).json({ success: false, errorMessage });
  }

  next();
};

const { body } = require("express-validator");

const userDataValidateChainableAPI = [
  body("userName")
    .exists({ checkFalsy: true })
    .withMessage("User name is required")
    .isString()
    .withMessage("User name should be string"),
  body("password")
    .exists()
    .withMessage("Password is required")
    .isString()
    .withMessage("Password should be string")
    .isLength({ min: 5 })
    .withMessage("Password should be at least 5 characters"),
  body("email").optional().isEmail().withMessage("Provide valid email"),
  body("gender")
    .optional()
    .isString()
    .withMessage("Gender should be string")
    .isIn(["Male", "Female", "Other"])
    .withMessage("Gender value is invalid"),
  body("dateOfBirth")
    .optional()
    .isDate()
    .withMessage("DOB should be valid date"),
  body("phoneNumber")
    .optional()
    .isString()
    .withMessage("phone number should be string")
    .custom((value) => {
      if (value.length !== 10) {
        return Promise.reject("Phone number should be 10 digits");
      } else {
        return true;
      }
    }),
];

const userDataValidateSchemaBased = {
  userName: {
    exists: {
      errorMessage: "User name is required",
      options: { checkFalsy: true },
    },
    isString: { errorMessage: "User name should be string" },
  },
  password: {
    exists: { errorMessage: "Password is required" },
    isString: { errorMessage: "password should be string" },
    isLength: {
      options: { min: 5 },
      errorMessage: "Password should be at least 5 characters",
    },
  },
  email: {
    isEmail: { errorMessage: "Please provide valid email" },
  },
  gender: {
    isString: { errorMessage: "Gender should be string" },
    isIn: {
      options: [["Male", "Female", "Other"]],
      errorMessage: "Gender is invalid",
    },
  },
  dateOfBirth: {
    isDate: { errorMessage: "DOB should be string" },
  },
  phoneNumber: {
    isString: { errorMessage: "phone number should be string" },
    options: (value) => {
      value.length === 10;
    },
    errorMessage: "Phone number should be 10 digits",
  },
};

module.exports = {
  userDataValidate,
  userDataValidateChainableAPI,
  userDataValidateSchemaBased,
};
