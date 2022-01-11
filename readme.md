When working with Node.js it is very common to receive data in `request (body, query, params)`, and based on that data we perform some operations on DB and return the results.

Since the data will be coming from external resources like Client-side UI (browsers), programs that consume our API, Postman (API testing client) etc. hence we need to make sure that the data we are receiving should be properly validated before passing it to the controller or DB.

In this tutorial, we will be taking a look at the best and easiest way to validate request data using [express-validator](https://express-validator.github.io/docs/) package

> Not validating data can lead to unwanted data, program crashing, malicious hacker attack so it is always recommended to validate data first before doing any operation on it

> 💡 all the examples included in the tutorial are available on my [github repo](https://github.com/jayeshchoudhary/express-validator-example)

## Basic Project Setup

In this tutorial, we will be building an express.js app with some API endpoints `POST - /api/user` and validate incoming req data

```bash
# Create the project folder
$ mkdir express-validator-example

# Navigate into the project folder
$ cd express-validator-example

# Initialize project
$ npm init -y

# install express
$ npm install express
```

**Project structure** <br>

we will be following best practice by using modular approach where everything is placed in a different file, this will make our code structured and maintainable

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1641746320375/SEB3krM1R.png)

**index.js**

```javascript
const express = require("express");

const app = express();
const PORT = 3000;
const userRouter = require("./routes/user.router");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// routes middleware
app.use("/api/user", userRouter);

app.listen(PORT, () => console.log("Server listening on port", PORT));
```

**routes/user.router.js**

```javascript
const router = require("express").Router();
const UserController = require("../controllers/user.controller");
const { userDataValidate } = require("../validations/user.validation");

router.post("/", userDataValidate, UserController.addUser);

module.exports = router;
```

**controllers/user.controller.js**

```javascript
const addUser = (req, res, next) => {
  const userData = {
    userName: req.body.userName,
    password: req.body.password,
    email: req.body.email,
  };

  try {
    // save data to DB
    User.create(userData);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports = { addUser };
```

**validations/user.validation.js**

```javascript
const userDataValidate = (req, res, next) => {
  // todo
};

module.exports = { userDataValidate };
```

## Traditional way of data validation

let's validate user data received by hitting `/api/user` without using any external libraries

**user.validation.js**

```javascript
const userDataValidate = (req, res, next) => {
  if (!req.body.userName) {
    throw Error("username is required");
  }
  if (!req.body.password) {
    throw Error("password is required");
  }
  if (req.body.password.length < 5) {
    throw Error("password should have atleast 5 characters");
  }
  if (!isValidEmail()) {
    throw Error("provide valid email");
  }
  // .... and so on
};

module.exports = { userDataValidate };
```

> as you can see there are lot of validation if() checks. and if our api had 10-15 keys then the validation function will going to be very long and prone to errors

## Introduction to `express-validator`

According to express-validator docs

> express-validator is a set of
> [express.js](http://expressjs.com/) middlewares that wraps [validator.js](https://github.com/validatorjs/validator.js) validator and sanitizer functions.

express-validator makes data validation very simple and easy to maintain. also it is the most popular choice in node.js for validations

## installation

```
npm install --save express-validator
```

## Usage

Since each validation rule in express-validator is separate middleware, hence we can pass an array of validation rules to middleware in `user.router.js`

let's write user validation of data on various fields

`add below code to user.validation.js`

```javascript
const { body } = require("express-validator");

const userDataValidateChainMethod = [
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
```

**Explanation:** <br>
`express-validator` provides chainable functions which we add as many validation rules as we want

In the code above we have used below validation middleware

- `body()`: this will only validate req.body fields (if you want to validate param, query of request then param(), query() are also available) <br>
  there is also check() available which will search for key in whole req object but only for req.body use body()
- `exists()`: for required fields (makes field compulsory to include) <br>
  there is also `checkFalsy: true` option available which also check if a value should not contain falsy value like "", null, undefined
- `withMessage()`: custom message to display when validation fails
- `isString()`: checks if value is string
- `isDate()`: checks if it is valid date
- `optional()`: value is optional
- `isIn()`: check if input value contains one of value present in array.
- `isEmail()`: checks for valid email id
- `custom()`: write a custom validator for your own needs (you can also write async DB lookup validations here)
- `isLength({min: 2, max: 10})`: check for min and max characters in value

**Other common validator's**

- `isNumeric()`: checks if value is number
- `bail()`: Stops running validations if any of the previous ones have failed.
- `isMobilePhone()`: checks if input is valid phone number

> 💡 To explore other validator functions refer to [validator.js](https://www.npmjs.com/package/validator)

Now using `userDataValidateChainableAPI`, your `/routes/user.router.js` will be like this:

**user.router.js**

```javascript
router.post("/", userDataValidateChainMethod, UserController.addUser);
```

## Error handing

To get the errors from user validation use `validationResult()` from the express-validator

In the user controller we will check the errors from the validation. if there are any then return all the errors

**user.controller.js**

```javascript
const { validationResult } = require("express-validator");

const addUser = (req, res, next) => {
  try {
    const errors = validationResult(req);

    // if there is error then return Error
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    // save data to DB
    User.create(req.body);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports = { addUser };
```

### Error Object

When the `POST - /api/user` is hit then we will get errors (if we have not provided req.body as required by our schema)

Below is how the error object will look like

```JSON
{
    "success": false,
    "errors": [
        {
            "value": "tet",
            "msg": "Password should be at least 5 characters",
            "param": "password",
            "location": "body"
        },
        {
            "value": "test.gmail",
            "msg": "Provide valid email",
            "param": "email",
            "location": "body"
        }
    ]
}
```

## Schama based validation

The chain api for validation provided by `express-validator` is great but it can also get very hard to read if a single field has many validations. then a single validation middleware will have chain function hell

To solve this problem there is also **schema-based validation** in `express-validator`. this offers a clear approach where instead of chaining new function for new validation we have an object with key and values as validation schema at one place.

`checkSchema()` takes schema object as parameter and will be placed inside our user router middleware

let's create same validation in schema-based validation

**user.validation.js**

```javascript
const userDataValidateSchemaBased = checkSchema({
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
});
```

To use schema based object our user.router.js will look like this

checkSchema() is used for schema validation

**user.router.js**

```javascript
router.post(
  "/schama-based",
  checkSchema(userDataValidateSchemaBased),
  UserController.addUser
);
```

## Testing `/api/user` using Postman

![postman test](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/u3joc26z5gb0ht9rwhz5.png)

## Conclusion

- successfully used express-validator package to easily validate input for Node.js apps
- Schema based validation is even faster and convenient
- Also can sanitize data for improved security

## References

[1] [Form Data Validation in Node.js with express-validator](https://stackabuse.com/form-data-validation-in-nodejs-with-express-validator/)
[2] [How to make input validation simple and clean in your Express.js app
](https://www.freecodecamp.org/news/how-to-make-input-validation-simple-and-clean-in-your-express-js-app-ea9b5ff5a8a7/) <br>

## Links

1. express-validator official [docs](https://express-validator.github.io/docs/)
2. validator.js [docs](https://www.npmjs.com/package/validator)
3. Find all the code examples in my [github repo](https://github.com/jayeshchoudhary/express-validator-example)

<a href="https://www.buymeacoffee.com/jayeshchoudhary" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 30px !important;width: 10px !important;" ></a>
