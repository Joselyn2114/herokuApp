//Funciona tipo Listener HTTP
//Acá se declaran todas las rutas y se atienden las solicitudes de las páginas

var express = require('express');
var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackConfig = require('../webpack.config');
var bodyParser = require('body-parser');
var multer = require('multer');

const productsRepository = require("./servidor/productsRepository");
const ordersRepository = require("./servidor/ordersRepository");
const accountsRepository = require("./servidor/accountsRepository");
const categoriesRepository = require("./servidor/categoriesRepository");



var app = express();
//MOTOR DE PLANTILLAS
app.set('view engine', 'ejs');
app.set('views',__dirname + '/cliente/views');

app.set('port', (process.env.PORT || 3000)); //puerto donde escucharemos las solicitudes.
app.use('/static', express.static('dist'));  //declaramos la carpeta pública que nuestros usuarios puedan ver -> la renombramos como Static
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true})); // decodificación de caracteres
app.use(webpackDevMiddleware(webpack(webpackConfig))); //webpackDevMiddleware permite a app(Express) comunicarse con Webpack

// Configuración de multer para guardar archivos en el directorio "dist/e-commerse/images"
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './dist/e-commerse/images');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Usar el nombre original del archivo
    }
});

const upload = multer({ storage: storage });

var config = {
    user: 'ua261ode3rta9v',
    host: 'ce1r1ldap2qd4b.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com', 
    database: 'd2m9in89i2llrk', 
    ssl: { rejectUnauthorized: false},  
    password: 'p8afbf3922c7fa691d3c68ece4f172dc6ef26c3315e6afa350f24356d9d4632e8',
    port: '5432'    
  };

const oProductsRepository = new productsRepository(config);
const oOrdersRepository = new ordersRepository(config);
const oAccountsRepository = new accountsRepository(config);
const oCategoriesRepository = new categoriesRepository(config);


app.get('/',function(req,res,next){//Creamos las rutas o secciones que va tener nuestra página. 
    oOrdersRepository.getOrders()
    .then(data => {
        res.render("product-admin/index", {orders : data});
    })
    .catch(error => {
        console.error("Error al obtener ordenes:", error);
        // Manejar errores
    });     
});

app.get('/index.html',function(req,res,next){
    oOrdersRepository.getOrders()
    .then(data => {
        res.render("product-admin/index", {orders : data});
    })
    .catch(error => {
        console.error("Error al obtener ordenes:", error);
        // Manejar errores
    });  
});

app.get('/accounts.html',function(req,res,next){
    oAccountsRepository.getAccounts()
    .then(data => {
        res.render("product-admin/accounts", {accounts : data});
    })
    .catch(error => {
        console.error("Error al obtener accounts:", error);
        // Manejar errores
    }); 
});

app.get('/add-product.html',function(req,res,next){    
    oCategoriesRepository.getCategories()
    .then(data => {
        res.render("product-admin/add-product", {categories : data});
    })
    .catch(error => {
        console.error("Error al obtener categories:", error);
        // Manejar errores
    }); 
});

app.get('/edit-product.html',function(req,res,next){
    res.render("product-admin/edit-product");
});

app.get('/login.html',function(req,res,next){
    res.render("product-admin/login");
});

app.get('/products.html',function(req,res,next){
    oProductsRepository.getProductos()
    .then(data => {
        res.render("product-admin/products", {products: data});
    })
    .catch(error => {
        console.error("Error al obtener productos:", error);
        // Manejar errores
    });    
});

app.post('/products.html',upload.single('fileInput'),function(req,res,next){
    oProductsRepository.addProducto(req.body,req.file.originalname)
    .then(dataInsert => {
        //Solicita todos los productos
        oProductsRepository.getProductos()
            .then(data => {
                res.render("product-admin/products", {products: data});
            })
            .catch(error => {
                console.error("Error al obtener productos:", error);
                // Manejar errores
            });  
            })
    .catch(error => {
        console.error("Error al agregar producto:", error);
        // Manejar errores
    });   
    if (!req.file) {    
    console.log("Error obteniendo el archivo de imagen");
    }      
});


//RUTAS SITIO E-COMMERSE ALDEA MODA
app.get('/product.html', function(req, res, next) {
   
    oProductsRepository.getProductos()
    .then(data => {
        res.render("e-commerce/product", { products: data });
    })
    .catch(error => {
        console.error("Error al obtener productos e-commerce:", error);
        // Manejar errores
    });    
});

app.get('/home.html', function(req, res, next) {
   
    oProductsRepository.getProductos()
    .then(data => {
        res.render("e-commerce/home", { products: data });
    })
    .catch(error => {
        console.error("Error al obtener productos para home e-commerce:", error);
        // Manejar errores
    });    
});

app.listen(app.get('port'),()=>{ //listener en el puesto especificado
    console.log('servidor activo');//Una vez inicializado mostrará esto por consola.
});