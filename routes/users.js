const router = require('koa-router')()

let Model = require('../modules/sql/models/user')

const md5 = require('md5')

const fs = require('fs')
const path = require('path')

const moment = require('moment')

let secret = fs.readFileSync(path.join(__dirname, '../publicKey.pub'), 'utf-8')

const config = require('../config')

function getToken (username, secret, updatedAt, device) {
  return {
    token: md5(username + secret + updatedAt + device),
    expiredAt: parseInt(moment().add(config.tokenExpired, 'hours').format('x'))
  }
}

let auth = async (ctx, token) => {
  let user = await Model.find({
    token
  })
  if (user && user.length) {
    if (user[0].expiredAt < new Date().valueOf()) {
      ctx.body = {
        status: 1,
        message: 'token失效'
      }
      return false
    } else {
      ctx.body = {
        status: 0
      }
      return user[0]
    }
  } else {
    ctx.body = {
      status: 1,
      message: 'token失效'
    }
    return false
  }
}

router.get('/', function (ctx, next) {
  ctx.body = 'this is a users response!'
})

router.get('/bar', function (ctx, next) {
  ctx.body = 'this is a users/bar response'
})

router.get('/user', async (ctx) => {
  const token = ctx.request.query.token
  let user = await auth(ctx, token)
  ctx.body = {
    username: user.username,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    key: {
      token: user.token,
      expiredAt: user.expiredAt
    }
  }
})

router.post('/auth', async (ctx) => {
  return await auth(ctx, ctx.request.body.token)
})

router.post('/login', async (ctx, next) => {
  let body = ctx.request.body
  let user = await Model.find({
    username: body.username
  })
  const time = new Date().valueOf()
  let message = ''
  if (user && user.length > 0) {
    const password = md5(body.password)
    if (password === user[0].password) {
      const token = getToken(user.username, secret, time, 'web')
      await Model.update({
        _id: user[0]._id
      }, {
        updatedAt: time,
        token: token.token,
        expiredAt: token.expiredAt
      })
      ctx.body = {
        status: 0,
        userInfo: {
          username: user[0].username,
          createdAt: user[0].createdAt,
          updatedAt: time
        },
        key: token
      }
    } else {
      message = '用户名或密码错误！'
    }
  } else {
    message = '用户名或密码错误！'
  }
  if (message) {
    ctx.body = {
      status: 1,
      message
    }
  }
})

router.post('/register', async (ctx, next) => {
  const time = new Date().valueOf()
  const body = ctx.request.body
  let token = getToken(body.username, secret, time, 'web')
  let db = new Model({
    username: body.username,
    password: md5(body.password),
    createdAt: time,
    updatedAt: time,
    token: token.token,
    expiredAt: token.expiredAt
  })
  let oldUsername = await Model.find({
    username: body.username
  })
  if (oldUsername && oldUsername.length > 0) {
    ctx.body = {
      status: 1,
      message: '用户名已存在！'
    }
  } else {
    await db.save(err => {
      console.log(err)
    })
    // await db.find({})
    ctx.body = {
      status: 0,
      userInfo: {
        username: body.username,
        createdAt: time,
        updatedAt: time
      },
      key: token
    }
  }
})

module.exports = router
