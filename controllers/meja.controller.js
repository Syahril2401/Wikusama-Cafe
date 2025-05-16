/**function utk mengolah request dan memberikan response */
/**call model meja */
const mejaModel = require(`../models/index`).meja

const { request } = require("express")
/**call joi library */
const joi = require(`joi`)

/**define func to validate input of meja / validasi data meja harus terisi semua*/ 
const validateMeja = async (input) => {
    /**define rules of validation */
    let rules = joi.object().keys({
        nomor_meja: joi.string().required(),
        status: joi.boolean().required()
    })

    /**validation proses */
    let { error } = rules.validate(input)

    if (error) {
        /**arrange a error massage of validation */
        let massage = error
            .details
            .map(item => item.massage)
            .join(`,`)
        return {
            status: false,
            massage: massage
        }
    }
    return { status: true }
}

/**create and export function to load meja */
exports.getMeja = async (request, response) => {
    try {
        /**call meja from db using model */
        let meja = await mejaModel.findAll()

        /**give a response within meja */
        return response.json({
            status: true,
            data: meja
        })

    } catch (error) {
        return response.json({
            status: false,
            massage: error.massage
        })
    }

}

/**create and export func to filter available meja */
exports.availableMeja = async (request, response) => {
    try {
        /**define param for status true */
        let param = { status: true }

        /**get data meja from db with defined filter */
        let meja = await mejaModel.findAll({ where: param })

        /**give response */
        return response.json({
            status: true,
            data: meja
        })

    } catch (error) {
        return response.json({
            status: false,
            massage: error.massage
        })
    }
}

/**create and export func to add new meja */
exports.addMeja = async (request, response) => {
    try {
        /**validate data */
        let resultValidation = validateMeja(request.body)
        if (resultValidation.status) {
            return response.json({
                status: false,
                massage: resultValidation.massage
            })
        }

        /**insert data meja to db using model */
        await mejaModel.create(request.body)

        /**give a response to tell that insert has success */
        return response.json({
            status: true,
            massage: `Data meja berhasil ditambahkan`
        })

    } catch (error) {
        return response.json({
            status: false,
            massage: error.massage
        })
    }
}

/**create and export func to update meja */
exports.updateMeja = async (request, response) => {
    try {
        /** get parameter for update */
        let id_meja = request.params.id_meja

        /**validate data meja */
        let resultValidation = validateMeja(request.body)
        if (!resultValidation.status) {
            return response.json({
                status: false,
                massage: resultValidation.massage
            })
        }

        /**run update meja using model*/
        await mejaModel.update(request.body, {
            where: { id_meja: id_meja }
        })

        /**give response */
        return response.json({
            status: true,
            massage: `Data meja berhasil diubah`
        })



    } catch (error) {
        return response.json({
            status: false,
            massage: error.massage
        })
    }
}

/**create and export function to delete meja */
exports.deleteMeja = async (request, response) =>{
    try {
        /**get id_meja that will be delete */
        let id_meja = request.params.id_meja

        /**run delete meja using model */
        await mejaModel.destroy({
            where: {id_meja: id_meja}
        })

        /**give response */
        return response.json({
            status: true,
            massage: `Data meja berhasil di hapus`
        })


    } catch (error) {
        return response.json({
            status: false,
            massage: error.massage
        })
    }
}