import jwt from "jsonwebtoken";

export const middlewareController = {

    //xac thuc nguoi dung
    verifyToken: (req, res, next) => {
        const token = req.headers.token;
        if (token) {
            const accessToken = token.split(" ")[1];
            try {
                const user = jwt.verify(accessToken, process.env.ACCESS_TOKEN)
                req.user = user;
                console.log(user)
                return next();
            } catch (error) {
                return res.status(403).json("Token is not valid");
            }
        }
        return res.status(401).json("You are not authenticated");
    },

    verifyTokenAndAdminAuth: (req, res, next) => {
        middlewareController.verifyToken(req, res, () => {
            // nguyen cai khuc duoi la truyen callback cho next tai ham verifyToken
            if (req.user.id == req.params.id || req.user.isadmin) return next();
            return res.status(403).json("You are not allowed to delete other");
        })
    }
}

