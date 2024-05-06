const { Client } = require("pg");

class AccountsRepository{
    constructor(oConfig){
        this.oConfig = oConfig;
    }

    /*
        Obtiene todos las cuentas almacenados en la base de datos.
    */
        getAccounts() {
            return new Promise((resolve, reject) => {
                // Conección a base de datos postgresql
                const client = new Client(this.oConfig);
                client.connect(error => {
                    if (error) {
                        console.log("Error al establecer la conexión a la BD -- " + error);
                        reject(error);
                    } else {
                        console.log("Conexión exitosa");
                        client.query('SELECT * FROM account', (error, res) => {
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

        // Buscar el correo 
        getAccountByEmail(email) {
            return new Promise((resolve, reject) => {
                // Conección a base de datos postgresql
                const client = new Client(this.oConfig);
                client.connect(error => {
                    if (error) {
                        console.log("Error al establecer la conexión a la BD -- " + error);
                        reject(error);
                    } else {
                        console.log("Conexión exitosa");
                        const query = 'SELECT * FROM account WHERE email = $1';
                        client.query(query, [email], (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result.rows[0]); // Devuelve la primera fila (el primer usuario encontrado)
                            }
                        });
                    }

                });
            });
        }
        
    
}
module.exports = AccountsRepository;

