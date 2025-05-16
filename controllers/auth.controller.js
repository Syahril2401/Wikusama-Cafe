/**call library jwt */
const jwt = require (`jsonwebtoken`)

/**load model of user */
const userModel = require(`../models/index`).user

/**call md5 library */
const md5 = require(`md5`)

async function verifyToken(token){
    try {
        let secretKey = 'sixnature joss'
        let decode = jwt.verify(token, secretKey)
        return true
    } catch (error) {
        return false
    }
}

exports.authentication = async (request,response) => {
    try {
        /**grab ussername and password */
        let params = {
            username: request.body.username,
            password: md5(request.body.password)
        }

        /**check username exists */
        let result = await userModel.findOne(
            {
                where: params
            }
        )

        /**validate result */
        if(result){
            /**if user has exists, generete token */
            /**define secret key of jwt */
            let secretKey = 'sixnature joss'
            /**define header of jwt */
            let header = {
                algorithm: "HS256"
            }
            /**define payload */
            let payload = JSON.stringify(result)
            /**do generete token using jwt */
            let token = jwt.sign(payload,secretKey,header)
            /**give a response */
            return response.json({
                status: true,
                token: token,
                message: `login berhasil`,
                data: result
            })
        }else{
            /**if user doesn't exist */
            /**give a response */
            return response.json({
                status: false,
                message: 'username atau password tidak cocok'
            })
        }
    } catch (error) {
        return response.json({
            status: false,
            message: error.message
        })
    }
}

exports.authorization = (roles) =>{
    return async function (request, response, next){
        try {
            /**grab data header */
            let headers = request.headers.authorization

        /**grab data token */
        /**exp :bearer ebuiadnoiaowda0c0392r0hna */
            let token = headers?.split(" ")[1]
        /**? digunakan utk antisipasi variabel tbs bernilai null / undefine 
         * split digunakan memecah string mrnjadi array
        */

        if (token == null) {
            return response.status(401).json({
                status: false,
                message: "Unauthorized User!"
            })
        }

            /**veryfy token */
            if(! await verifyToken(token)){
                return response
                .status(401)
                .json({
                    status: false,
                    message: `INVALID TOKEN`
                })
            }

            /**decrypt token to plain text */
            let plainText = jwt.decode(token)

            /**check allowed roles */
            if(!roles.includes(plainText?.role)){
                return response
                .status(403)
                .json({
                    status: false,
                    message: `FORBIDDEN ACCESS`
                })
            }

            next()

        } catch (error) {
            return response.json({
                status: false,
                message: error.message
            })
        }
    }
}