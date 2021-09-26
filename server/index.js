const express =require("express")

const app=express()
app.set('secret', 'i2u34y12oi3u4y8')
app.use('/uploads',express.static(__dirname+'/uploads'))
app.use('/', express.static(__dirname + '/web'))
app.use('/admin', express.static(__dirname + '/admin'))
app.use(require('cors')())
app.use(express.json())
require('./plugins/db')(app)
require('./routes/admin')(app)
require('./routes/web')(app)

app.listen(3000,()=>{
    console.log("3000端口启动成功")
})