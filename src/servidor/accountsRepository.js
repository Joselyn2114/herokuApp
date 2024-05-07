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

         /*
        Obtener información de una cuenta por id
        */

        getAccountById(id) {
            return new Promise((resolve, reject) => {
                // Conección a base de datos postgresql
                const client = new Client(this.oConfig);
                client.connect(error => {
                    if (error) {
                        console.log("Error al establecer la conexión a la BD -- " + error);
                        reject(error);
                    } else {
                        console.log("Conexión exitosa");
                        client.query(`SELECT * FROM account WHERE id = ${id} LIMIT 1`, (error, res) => {
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

         /*
        Actualiza una cuenta mediante su id
        */

        updateAccount(account) {
            return new Promise((resolve, reject) => {
                // Conección a base de datos postgresql
                const client = new Client(this.oConfig);
                client.connect(error => {
                    if (error) {
                        console.log("Error al establecer la conexión a la BD -- " + error);
                        reject(error);
                    } else {
                        if(account.id != -1){
                            console.log('entró para actualizar cuenta: '+ account.id);
                            client.query(`UPDATE account SET nombre = '${account.name}', email = '${account.email}', password = '${account.password}', phone = '${account.phone}' WHERE id = ${account.id}`, (error, res) => {
                                if (error) {
                                    console.log("Error en el update de account en DB --" + error);
                                    reject(error);
                                } else {
                                    client.end();
                                    resolve();
                                }
                            });
                        }else{
                            client.query(`INSERT INTO account (nombre, email, password, phone) VALUES ($1, $2, $3, $4)`, 
                                [account.name, account.email, account.password, account.phone], 
                                (error, res) => {
                                    if (error) {
                                        console.log("Error en el insert de account en DB --" + error);
                                        reject(error);
                                    } else {
                                        client.end();
                                        resolve();
                                    }
                                });                               
                        }
                    }
                });
            });
        }

         /*
        Elimina una cuenta mediante su id
        */

        deleteAccount(id) {
            return new Promise((resolve, reject) => {
                // Conección a base de datos postgresql
                const client = new Client(this.oConfig);
                client.connect(error => {
                    if (error) {
                        console.log("Error al establecer la conexión a la BD -- " + error);
                        reject(error);
                    } else {
                        console.log("Conexión exitosa");
                        client.query(` DELETE FROM account WHERE id = ${id}`, (error, res) => {
                            if (error) {
                                console.log("Error en el delete de account en DB --" + error);
                                reject(error);
                            } else {
                                client.end();
                                resolve();
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

