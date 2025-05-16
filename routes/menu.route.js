const express = require(`express`)
const app = express()

/**load controller of menu */
const menuController = require(`../controllers/menu.controller`)

/**call authorization method */
const { authorization } = require("../controllers/auth.controller")

/**create route for add menu */
app.post('/menu',authorization(["admin", "kasir","manajer"]),  menuController.addMenu)

/**create route to get all menu */
app.get('/menu',authorization(["admin", "kasir","manajer"]),  menuController.getMenu)

/**create route for search menu */
app.post('/menu/find',authorization(["admin", "kasir","manajer"]),  menuController.findMenu)

/**create route for update menu */
app.put(`/menu/:id_menu`,authorization(["admin", "kasir","manajer"]),  menuController.updateMenu)

/** create route for delete menu*/
app.delete(`/menu/:id_menu`,authorization(["admin", "kasir","manajer"]),  menuController.deleteMenu)

/**export app */
module.exports = app
