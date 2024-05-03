const { Client } = require("pg");

class CategoriesRepository{
    constructor(oConfig){
        this.oConfig = oConfig;
    }

    /*
        Obtiene todos las categorías almacenados en la base de datos.
    */
        getCategories() {
            return new Promise((resolve, reject) => {
                // Conección a base de datos postgresql
                const client = new Client(this.oConfig);
                client.connect(error => {
                    if (error) {
                        console.log("Error al establecer la conexión a la BD -- " + error);
                        reject(error);
                    } else {
                        console.log("Conexión exitosa en CategoriesRepository");
                        client.query('SELECT * FROM category', (error, res) => {
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
        
    
}
module.exports = CategoriesRepository;

