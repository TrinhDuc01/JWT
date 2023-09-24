const db = require("../models")


const userController = {
    getAllUsers: async (req, res) => {
        try {
            const user = await db.User.findAll();
            res.status(200).json(user)
        } catch (error) {
            res.status(500).json(error)
        }
    },

    deleteUser: async (req, res) => {
        try {
            const user = await db.User.findOne({
                where: {
                    id: req.params.id
                }
            })
            res.status(200).json("Delete successfully");
        } catch (error) {
            res.status(500).json(error);
        }
    }
    ,
    test: async (req, res) => {
        try {
            const user = await db.User.findAll({
                where: {
                    id: req.body.id,
                },
                include: db.RefreshToken
            })
            console.log(user)
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json(error);
        }
    }
}

module.exports = userController;