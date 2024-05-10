const { Client } = require("pg");

class ProductsRepository{
    constructor(oConfig){
        this.oConfig = oConfig;
    }

    /* Obtiene todos los productos almacenados en la base de datos.  */
        getProductos() {
            return new Promise((resolve, reject) => {
                // Conección a base de datos postgresql
                const client = new Client(this.oConfig);
                client.connect(error => {
                    if (error) {
                        console.log("Error al establecer la conexión a la BD -- " + error);
                        reject(error);
                    } else {
                        console.log("Conexión exitosa");
                        client.query('SELECT * FROM PRODUCT', (error, res) => {
                            if (error) {
                                console.log("Error en select DB --" + error);
                                reject(error);
                            } else {
                                client.end();
                                resolve(res.rows);
                            }
                        });
                    }
                });
            });
        }

        /* Agrega o actualiza un nuevo producto a la base de datos*/

        addOrUpdateProducto(product, imageName, imageDescription){
            return new Promise((resolve, reject) => {
                // Conexión a base de datos postgresql                
                const client = new Client(this.oConfig);
                client.connect(error => {
                    if (error) {
                        console.log("Error al establecer la conexión a la BD -- " + error);
                        reject(error);
                    } else {
                        console.log("Conexión exitosa");
                        if(product.productId == 0){ // si productId es 0 significa que es un nuevo producto
                            client.query(`Insert into Product(name,in_stock,price,category_name,image_name, image_description) values('${product.name}',${product.in_stock},${product.price},'${product.category}','${imageName}', '${imageDescription}')`, (error, res) => {
                                if (error) {
                                    console.log("Error en Insert Producto DB -- " + error);
                                    reject(error);
                                } else {
                                    client.end();
                                    console.log("Producto agregado con éxito");
                                    resolve();
                                }
                            });
                        }else{// si productId es diferente de 0 significa que es un producto a actualizar
                            client.query(`Update Product Set name = '${product.name}', in_stock = ${product.in_stock}, price = ${product.price}, category_name = '${product.category}', image_name = '${imageName}', image_description = '${imageDescription}'  Where id = ${product.productId}`, (error, res) => {
                                if (error) {
                                    console.log("Error en Update de Producto DB -- " + error);
                                    reject(error);
                                } else {
                                    client.end();
                                    console.log("Producto actualizado con éxito");
                                    resolve();
                                }
                            });
                        }
                    }
                });
            });
        }
        
        
        /* Función para borrar un producto por su ID*/

        borrarProducto(productId) {
            return new Promise((resolve, reject) => { 
                // Conexión a base de datos postgresql
                const client = new Client(this.oConfig);
                client.connect(error => {
                    if(error) {
                        console.log("Error al establecer la conexión a la BD -- " + error);
                        reject(error);
                    } else {
                        console.log("Conexión exitosa");
                        client.query(`DELETE FROM product WHERE id = ${productId}`, (error, res) => {
                            if(error) {
                                console.log("Error al borrar el producto -- " + error);
                                reject(error);
                            } else{
                                client.end();
                                console.log("Producto borrado con éxito");
                                resolve();
                            }
                        });

                    }


                });
            });
        }

        /* Función para borrar lista de productos por su ID*/

        borrarListaProducto(listaIdProducto) {
            return new Promise((resolve, reject) => { 
                // Conexión a base de datos postgresql
                const client = new Client(this.oConfig);
                client.connect(error => {
                    if(error) {
                        console.log("Error al establecer la conexión a la BD -- " + error);
                        reject(error);
                    } else {
                        console.log("Conexión exitosa");
                        const listaIdProductoString = listaIdProducto.join(',');
                        client.query(`DELETE FROM product WHERE id = ANY(array[${listaIdProductoString}])`, (error, res) => {
                            if(error) {
                                console.log("Error al borrar lista de productos -- " + error);
                                reject(error);
                            } else{
                                client.end();
                                console.log("Lista de productos borrados con éxito");
                                resolve();
                            }
                        });

                    }


                });
            });
        }
    
}
module.exports = ProductsRepository;

