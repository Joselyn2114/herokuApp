const { Client } = require("pg");

class OrdersRepository{
    constructor(oConfig){
        this.oConfig = oConfig;
    }

    /*
        Obtiene todos las ordenes almacenados en la base de datos.
    */
        getOrders() {
            return new Promise((resolve, reject) => {
                // Conección a base de datos postgresql
                const client = new Client(this.oConfig);
                client.connect(error => {
                    if (error) {
                        console.log("Error al establecer la conexión a la BD -- " + error);
                        reject(error);
                    } else {
                        console.log("Conexión exitosa");
                        client.query('SELECT * FROM OrderClient', (error, res) => {
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
module.exports = OrdersRepository;

