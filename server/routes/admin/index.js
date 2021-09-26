module.exports = app => {
    const express = require('express')
    const jwt = require('jsonwebtoken')
    const AdminUser = require('../../models/AdminUser')
    const authMiddleware = require('../../middleware/auth')
    const router = express.Router({
        mergeParams: true
    })
    router.post('', async (req, res) => {
        const model = await req.Model.create(req.body)
        res.send(model)
    })
    // 资源列表
    router.get('/', async (req, res) => {
        const queryOptions = {}
        if (req.Model.modelName === 'Category') {
            queryOptions.populate = 'parent'
        }
        //setOptions将链式调用转化为对象的形式
        const items = await req.Model.find().setOptions(queryOptions).limit(100)
        res.send(items)
    })
    // 资源详情
    router.get('/:id', async (req, res) => {
        const model = await req.Model.findById(req.params.id)
        res.send(model)
    })
    // 更新资源
    router.put('/:id', async (req, res) => {
        const model = await req.Model.findByIdAndUpdate(req.params.id, req.body)
        res.send(model)
    })
    // 删除资源
    router.delete('/:id', async (req, res) => {
        await req.Model.findByIdAndDelete(req.params.id)
        res.send({
            success: true
        })
    })
    //上传图片
    const multer = require('multer')
    const upload = multer({
        dest: __dirname + '/../../uploads'
    })
    app.post('/admin/api/upload', authMiddleware(),upload.single('file'), async (req, res) => {
        const file = req.file
        file.url=`http://localhost:3000/uploads/${file.filename}`
        res.send(file)
    })

    //登录接口
    app.post('/admin/api/login', async (req, res) => {
        const { username, password } = req.body
        // 1.根据用户名找用户
    
        const user = await AdminUser.findOne({ username }).select('+password')
        if(!user){
            return res.status(422).send({
                message:'用户不存在'
            })
        }
        // 2.校验密码
        const isValid = require('bcryptjs').compareSync(password, user.password)
        if(!isValid){
            return res.status(422).send({
                message:'密码错误'
            })
        }
        const jwt = require('jsonwebtoken')
        // 3.返回token
        const token = jwt.sign({ id: user._id }, app.get('secret'))
        res.send({ token })
      })
    
    const resourceMiddleware = require('../../middleware/resource')
    //通用CRUD接口
    app.use('/admin/api/rest/:resource', authMiddleware(),resourceMiddleware(), router)
    app.use(async (err, req, res, next) => {
         console.log(err)
        res.status(err.statusCode || 500).send({
          message: err.message
        })
      })
}