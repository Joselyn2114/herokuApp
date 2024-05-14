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

const { Pool } = require('pg');
const fs = require('fs');
//const jsonPath = require("diste-commerse/provinciasCantones");

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
    host: 'cb5ajfjosdpmil.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com', 
    database: 'dbilccvauucbvg', 
    ssl: { rejectUnauthorized: false},  
    password: 'pf7ded34ee4f5b87cb0f6269e2525158e29c916ca8fc24e9c9fff28835d8f2525',
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
        console.log(data);
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
    oCategoriesRepository.getCategories()
    .then(data => {
        res.render("product-admin/edit-product",{categories : data, product: req.query});
    })
    .catch(error => {
        console.error("Error al obtener categories:", error);
        // Manejar errores
    }); 
});

app.get('/shoping-cart.html', function(req, res, next) {
    res.render('e-commerce/shoping-cart', {product : req.query}); 
});



app.get('/login.html',function(req,res,next){
    res.render("product-admin/login");
});

app.get('/products.html',function(req,res,next){
    // Verificar si el parámetro "borrarProducto" existe en la consulta
    if (req.query.borrarProducto) {
        oProductsRepository.borrarProducto(req.query.borrarProducto)
        .then(() => {
            // Después de borrar el producto, obtener los productos actualizados
            return oProductsRepository.getProductos();
        })
        .then(data => {
            res.render ("product-admin/products", {products: data});
        })
        .catch(error => {
            console.error("Error al borrar u obtener productos: ", error);
        });
    } else if (req.query.productIds) {// Verifica si fué seleccionado uno o varios productos a ser eliminados

        var arrayIdProductos = Array.isArray(req.query.productIds) ? req.query.productIds : [req.query.productIds];

        oProductsRepository.borrarListaProducto(arrayIdProductos)
        .then(() => {
            // Después de borrar los producto, obtener los productos actualizados
            return oProductsRepository.getProductos();
        })
        .then(data => {
            res.render ("product-admin/products", {products: data});
        })
        .catch(error => {
            console.error("Error al borrar productos seleccionados u obtener productos: ", error);
        });
    } 
    else { // si no se proporciona el parámetro para borrar el producto, simplemente obtiene los productos
        oProductsRepository.getProductos()
        .then(data => {
        res.render("product-admin/products", {products: data});
    })
        .catch(error => {
        console.error("Error al obtener productos:", error);
        // Manejar errores
    }); 

    }
 
});


app.post('/products.html', upload.single('fileInput'), function(req, res, next) {
    const imageName = req.file ? req.file.originalname : req.body.imageName;
    const imageText = req.body.imageText; // Obtener el texto de la imagen

    oProductsRepository.addOrUpdateProducto(req.body, imageName, imageText) // Pasar el texto de la imagen a la función addOrUpdateProducto
        .then(dataInsert => {
            // Solicita todos los productos
            oProductsRepository.getProductos()
                .then(data => {
                    res.render("product-admin/products", {
                        products: data
                    });
                })
                .catch(error => {
                    console.error("Error al obtener productos:", error);
                    // Manejar errores
                });
        })
        .catch(error => {
            console.error("Error al agregar o actualizar producto:", error);
            // Manejar errores
        });
    if (!req.file && !req.body.imageName) {
        console.log("Error obteniendo el archivo de imagen");
    }
});


app.post('/loadAccount',function(req,res,next){
    
    oAccountsRepository.getAccountById(req.body.id)
    .then(data => {
        res.json(data);
    })
    .catch(error => {
        console.error("Error al cargar cuenta por id : ", error);
        // Manejar errores
    });    
});

app.post('/updateAccount',function(req,res,next){
    oAccountsRepository.updateAccount(req.body)
    .then(() => {
        console.log('actualizó con éxito!')
        res.redirect('/accounts.html');
    })
    .catch(error => {
        console.error("Error al actualizar cuenta: ", error);
        // Manejar errores
    });    
});

app.post('/deleteAccount',function(req,res,next){
    oAccountsRepository.deleteAccount(req.body.id)
    .then(() => {
        console.log('eliminó la cuenta con éxito!')
        res.redirect('/accounts.html');
    })
    .catch(error => {
        console.error("Error al eliminar la cuenta: ", error);
        // Manejar errores
    });    
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

app.post('/login.html', function(req, res, next) {
    const { email, password } = req.body;
    console.log("Correo recibido:", email);
    console.log("Contraseña recibida:", password);
    // Realiza una consulta en la base de datos para verificar las credenciales del usuario
    oAccountsRepository.getAccountByEmail(email)
        .then(account => {
            if (account && account.password === password) {
                console.error("Validación de credenciales exitosa");
                // Las credenciales son válidas, redirige al usuario al sitio de administración de productos 
                res.redirect('/index.html');
            } else {
                console.error("Password incorrecto");
                // Las credenciales son inválidas, renderiza la página de inicio de sesión con un mensaje de error
                res.render('product-admin/login', { error: 'Credenciales inválidas' });
            }
        })
        .catch(error => {
            console.error("Error al verificar las credenciales:", error);
            // Manejar errores
            res.render('product-admin/login', { error: 'Error al verificar las credenciales' });
        });
});

app.post('/guardar-orden', async (req, res) => {
    try {
        const pool = new Pool(config);        
        const { name, province, city, postcode} = req.body;
        /*
        // Crear un objeto con los datos de la orden
        const order = {
            status,
            client,
            location,
            order_date,
            est_delivery_date
        };

        // Guardar la orden utilizando el método saveOrder del repositorio de órdenes
        const savedOrder = await oOrdersRepository.saveOrder(order);
        */
        // Inserta la nueva orden en la base de datos
        const result = await pool.query(
            'INSERT INTO OrderClient (status, client, location, order_date, est_delivery_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            ['Completed', name, province+" / "+city+" / "+ postcode, new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()]
        );
        console.log ('Insertado correctamente');
        res.status(201).send('Orden guardada correctamente.');
    } catch (error) {
        console.error('Error al guardar la orden:', error);
        res.status(500).send('Error interno del servidor.');
    }
});

// // Función para cargar el JSON desde el archivo
// function cargarJSON(jsonPath) {
//     try {
//         const jsonData = fs.readFileSync(jsonPath, 'utf8');
//         return JSON.parse(jsonData);
//     } catch (error) {
//         console.error('Error al cargar el archivo JSON:', error);
//         return null;
//     }
// }

// // JSON con la información de los cantones
// const cantonesData = cargarJSON(jsonPath);

// // Si el JSON se cargó correctamente, puedes utilizarlo para cargar dinámicamente los cantones
// if (cantonesData) {
//     // Aquí puedes colocar tu lógica para cargar los cantones basados en la provincia seleccionada
// } else {
//     console.error('No se pudo cargar el archivo JSON.');
// }

app.listen(app.get('port'),()=>{ //listener en el puesto especificado
    console.log('servidor activo');//Una vez inicializado mostrará esto por consola.
});