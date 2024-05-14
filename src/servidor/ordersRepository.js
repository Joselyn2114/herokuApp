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
                        client.query('SELECT * FROM OrderClient order by id desc', (error, res) => {
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

        saveOrder(order) {
            return new Promise((resolve, reject) => {
                const client = new Client(this.oConfig);
                client.connect(error => {
                    if (error) {
                        console.log("Error al establecer la conexión a la BD -- " + error);
                        reject(error);
                    } else {
                        console.log("Conexión exitosa");
                        const { status, client: clientName, location, order_date, est_delivery_date } = order;
                        const query = `
                            INSERT INTO OrderClient (status, client, location, order_date, est_delivery_date)
                            VALUES ($1, $2, $3, $4, $5)
                            RETURNING *
                        `;
                        const values = [status, clientName, location, order_date, est_delivery_date];
                        client.query(query, values, (error, res) => {
                            if (error) {
                                console.log("Error al insertar en DB --" + error);
                                reject(error);
                            } else {
                                client.end();
                                resolve(res.rows[0]);
                            }
                        });
                    }
                });
            });
        }
        
    
}
module.exports = OrdersRepository;

