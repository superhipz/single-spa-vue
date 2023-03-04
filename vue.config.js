const { defineConfig } = require("@vue/cli-service")

const PORTS = require("../public/DEV_PORT")
const externals = require("../public/external")
const PACKAGE = require("./package.json")

const PACKAGE_NAME = PACKAGE.name.split("/")[1]
const isProd = process.env.NODE_ENV == "production"
module.exports = defineConfig(() => {
    let configureWebpack = {
        output: {
            libraryTarget: "system"
        },
        externals
    }

    if (!isProd) {
        configureWebpack.output.filename = PACKAGE_NAME + "/js/" + PACKAGE_NAME + ".js"
    }

    return {
        configureWebpack,
        transpileDependencies: true,
        filenameHashing: false,
        devServer: {
            port: PORTS[PACKAGE_NAME]
        },
        outputDir: "../dist/smit-payment",
        assetsDir: isProd ? "../smit-payment" : ""
    }
})
