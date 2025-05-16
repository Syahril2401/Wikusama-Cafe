const { request, response } = require("../routes/user.route")
const { Op } = require(`sequelize`)


/** load model of transaksi */
const transaksiModel = require(`../models/index`).transaksi

/** load model of detail transaksi */
const detailModel = require(`../models/index`).detail_transaksi

/** load model of menu */
const menuModel = require(`../models/index`).menu
const userModel = require(`../models/index`).user

const Sequelize = require('sequelize');
const mejaModel = require("../models/index").meja

const sequelize = new Sequelize('wikusama_cafe', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

  // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
  operatorsAliases: false
});

/** create and export function to add transaksi */
exports.addTransaksi = async (request, response) => {
    try {
        /** prepare data to add in transaksi */
        let newTransaksi = {
            tgl_transaksi: request.body.tgl_transaksi,
            id_user: request.body.id_user,
            id_meja: request.body.id_meja,
            nama_pelanggan: request.body.nama_pelanggan,
            status: `belum_bayar`
        }

        /** execute add transaksi using model */
        let insertTransaksi = await transaksiModel.create(newTransaksi)

        /** get the lates id of new transaksi */
        let latesID = insertTransaksi.id_transaksi

        /** insert last ID in each of detail */
        /** assume that arrDetail is array type */
        let arrDetail = request.body.detail_transaksi

        /** loop each arrDetail to insert last ID
         * and harga
         */
        for (let i = 0; i < arrDetail.length; i++) {
            arrDetail[i].id_transaksi = latesID

            /** get selected menu based on id_menu */
            let selectedMenu = await menuModel.findOne({
                where: {id_menu: arrDetail[i].id_menu}
            })

            /** add harga in each of detail */
            arrDetail[i].harga = selectedMenu?.harga
        }

        /** execute insert detail transaksi using model */
        /** bulkCreate => create dalam jumlah besar */
        await detailModel.bulkCreate(arrDetail)

        await mejaModel.update({
            status: 0
        },
        {where: {id_meja: request.body.id_meja}})

        /** give a response */
        return response.json({
            status: true,
            message: `Data transaksi telah ditambahkan`
        })
        
    } catch (error) {
        return response.json({
            status: false,
            message: error.message
        })
    }
}

/** create and export function to edit transaksi */
exports.updateTransaksi = async (request, response) => {
    try {
        let id_transaksi = request.params.id_transaksi
        let dataTransaksi = {
            tgl_transaksi: request.body.tgl_transaksi,
            id_user: request.body.id_user,
            id_meja: request.body.id_meja,
            nama_pelanggan: request.body.nama_pelanggan,
            status: request.body.status
        }

        await transaksiModel.update(
            dataTransaksi, {
                where: {id_transaksi: id_transaksi}
            }
        )

        await detailModel.destroy({
            where: {id_transaksi: id_transaksi}
        })

        let arrDetail = request.body.detail_transaksi

        for (let i = 0; i < arrDetail.length; i++) {
            arrDetail[i].id_transaksi = id_transaksi
            
            let selectedMenu = await menuModel.findOne({
                where: {id_menu: arrDetail[i].id_menu}
            })

            arrDetail[i].harga = selectedMenu?.harga
            
        }

        await detailModel.bulkCreate(arrDetail)

        await mejaModel.update({
            status: 1
        },
        {where: {id_meja: request.body.id_meja}})

        return response.json({
            status: true,
            message: `Data transaksi telah diupdate `
        })
    } catch (error) {
        return response.json({
            status: false,
            message: error.message
        }) 
    }
}

/**delete transaksi */
exports.deleteTransaksi = async (request, response) =>{
    try {
        /**get id that will be delete */
        let id_transaksi = request.params.id_transaksi

        /**execute delete detail using model  */
        await detailModel.destroy({
            where: {id_transaksi: id_transaksi}
        })

        /**execute delete transaksi using model */
        await transaksiModel.destroy({
            where: {id_transaksi: id_transaksi}
        })

        /**give a response */
        return response.json ({
            status: true,
            message: `Data transaksi telah dimusnahkan`
        })

    } catch (error) {
        return response.json({
            status: false,
            message: error.message
        }) 
    }
}

/**create and export func to get all transaksi */
exports.getTransaksi = async (request, response) => {
    try {
        /**get all a=data using model */
        let result = await transaksiModel.findAll({
            include: [
                "meja",
                "user",
                {
                    model: detailModel,
                    as:"detail_transaksi",
                    include: ["menu"]
                }
            ]
        })

        /**give a response */
        return response.json({
            status: true,
            data: result
        })
        
    } catch (error) {
        return response.json({
            status: false,
            message: error.message
        }) 
    }
}

exports.findTransaksi = async (request, response) => {
    try {
        let keyword = request.body.keyword
        let result = await transaksiModel.findAll({
            include: [
                "meja",
                {
                    model: userModel, as: "user", where: {
                        [Op.or]: {
                            nama_user: { [Op.substring]: keyword }
                        }
                    }
                },
                {model: detailModel, as: "detail_transaksi", include: ["menu"]}
            ]
        })

        return response.json({
            status: true,
            data: result
        })
    } catch (error) {
        return response.json({
            status: false,
            message: error.message
        })
    }
}

exports.chart = async (request, response) => {
    try {
        const [results, metadata] = await sequelize.query(
            `SELECT m.nama_menu, SUM(dt.jumlah) AS jumlah_beli 
            FROM detail_transaksi dt JOIN menu m ON
            dt.id_menu = m.id_menu GROUP BY m.nama_menu ORDER BY jumlah_beli DESC LIMIT 5`);

            return response.json({
                status: true,
                data: results
            })
    } catch (error) {
        return response.json({
            status: false,
            message: error.message
        })
    }
}