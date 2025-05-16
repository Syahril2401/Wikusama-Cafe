const express = require(`express`)
const app = express()
app.use(express.json())

/**call authentication from controller*/
const authController = require(`../controllers/auth.controller`)

/**create route for auth  */
app.post(`/auth`, authController.authentication)



module.exports = app