import bcrypt from "bcryptjs"
import db from "../models";
import jwt from "jsonwebtoken"

// ma hoa pass
const hashPass = (pass) => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(pass, salt);
    return hash
}

const dePass = (pass, hashPass) => {
    return bcrypt.compareSync(pass, hashPass);
}

let refreshTokens = [];
const authController = {
    //register
    registerUser: async (req, res) => {
        const passwordHash = hashPass(req.body.password)
        try {
            //create new user
            const newUser = await db.User.create({
                username: req.body.username,
                email: req.body.email,
                password: passwordHash,
                isadmin: req.body.isadmin
            });
            await newUser.save();
            res.status(200).json(newUser)
        } catch (error) {
            res.status(500).json(error)
        }
    },

    //generate access token 

    generateToken: (payload, KEY, date) => {
        return jwt.sign(payload, KEY, {
            expiresIn: date
        })
    },

    //login user
    loginUser: async (req, res) => {
        try {
            //tim ten tai khoan trong db
            const user = await db.User.findOne({
                where: {
                    username: req.body.username
                },
            })
            //so sanh mat khau
            const checkPass = dePass(req.body.password, user.password);
            if (!user && !checkPass) {
                res.status(404).json("Wrong username or password")
            }

            //tao token
            const payload = {
                id: user.id,
                username: user.username,
                isadmin: user.isadmin
            }
            const accessToken = authController.generateToken(payload, process.env.ACCESS_TOKEN, "30s");

            let refreshToken;
            //luu refresh token vao database
            const checkIssetRefreshToken = await db.RefreshToken.findOne({
                where: { UserId: user.id }
            })
            if (checkIssetRefreshToken) {
                refreshToken = checkIssetRefreshToken.token
            }
            else {
                refreshToken = authController.generateToken(payload, process.env.REFRESH_TOKEN, "365d");
                const saveRefreshToken = await db.RefreshToken.create({ token: refreshToken, UserId: user.id })
                await saveRefreshToken.save
            }
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: false,
                path: "/",
                sameSite: "strict"
            });

            res.status(200).json({ user, accessToken })
        } catch (error) {
            res.status(500).json(error)
        }
    },


    requestRefreshToken: async (req, res) => {
        // lay refresh token tu user
        const refreshToken = req.cookies.refreshToken;// lay refesh token tu cookie
        console.log(refreshToken)
        if (!refreshToken) return res.status(401).json("You're not authenticated, khong co refresh token");

        //kiem tra trong db co refresh token nay khong
        const oldRefreshTokenDB = await db.RefreshToken.findOne({ where: { token: refreshToken } });
        if (!oldRefreshTokenDB) return res.status(403).json("Refresh Token is not valid");
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, user) => {
            if (err) {
                console.log(err)
            }
            // thay bao loi payload co expried nen loi
            const userPayload = {
                id: user.id,
                username: user.username,
                isadmin: user.isadmin
            }

            //create new access token va refreshtoken
            const newAccessToken = authController.generateToken(userPayload, process.env.ACCESS_TOKEN, "30s");
            const newRefreshToken = authController.generateToken(userPayload, process.env.REFRESH_TOKEN, "365d");
            //luu refresh token moi vao db
            oldRefreshTokenDB.token = newRefreshToken;
            oldRefreshTokenDB.save();

            //luu refresh token moi vao cookie
            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: false,
                path: "/",
                sameSite: "strict"
            });
            return res.status(200).json({ newAccessToken });
        });
    },
    // logOUt
    logoutUser: async (req, res) => {
        res.clearCookie("refreshToken");
        res.status(200).json("Logout successfully")
    }

}

export default authController;