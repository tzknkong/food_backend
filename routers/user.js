const router = require('koa-router')()
const userService = require('../service/user')
router
    /**
     * register
     */
    .post('/api/user', async ctx => {
        const {
            email,
            password
        } = ctx.request.body

        let isExist = await userService.find('email', email)
        if (isExist) {
            return ctx.body = {
                code: -1,
                message: 'the email already exists'
            }
        }
        let user = await userService.register(email, password)
        ctx.cookies.set(
            '_id', user._id, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: false,
                overwrite: false
            }
        );
        ctx.body = {
            code: 200,
            data: {
                _id: user._id
            },
            message: 'success'
        }
    })

    .post('/api/user/authorization', async ctx => {
        const authorization = ctx.headers.authorization
        if (!authorization) {
            return ctx.body = {
                code: -1,
                message: 'please set the request header [Authorization]'
            }
        }
        let auth = authorization.replace('HT ', '').split(':')
        let email = auth[0]
        let password = auth[1]
        let user = await userService.login(email, password)
        if (!user) {
            return ctx.body = {
                code: -1,
                message: 'login failed,confirm your email and password'
            }
        }

        ctx.cookies.set(
            '_id', user._id, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: false,
                overwrite: false
            }
        );

        ctx.body = {
            code: 200,
            data: {
                _id: user._id
            },
            message: 'success'
        }
    })

    .get('/api/user/:id', async ctx => {
        const _id = ctx.params.id
        let user = await userService.find({
            _id
        })
        if (!user) {
            return ctx.body = {
                code: -1,
                message: 'fail to get user information'
            }
        }
        ctx.body = {
            code: 200,
            data: {
                email: user.email,
                nickname: user.nickname,
                avatar: user.avatar,
                DOB: user.DOB,
                country: user.country,
                address: user.address,
                creted: user.creted,
                updated: user.updated
            },
            message: 'success'
        }
    })
 
    .put('/api/user/:id', async ctx => {
        const _id = ctx.params.id
        const user = ctx.request.body
        await userService.update(_id, user).then(res => {
            if (res) {
                ctx.body = {
                    code: 200,
                    data: res,
                    message: 'success'
                }
            }
        })
    })
module.exports = router