const { defineConfig } = require("@vue/cli-service")

const PORTS = require("../../../public/DEV_PORT")
const PACKAGE = require("./package.json")

const PACKAGE_NAME = PACKAGE.name.split("/")[1]

module.exports = defineConfig(() => {
    let configureWebpack = {
        output: {
            libraryTarget: "system"
        },
        externals: ["vue", "vue-router", /^@smit\/.+/]
    }

    if (process.env.NODE_ENV == "development") {
        configureWebpack.output.filename = PACKAGE_NAME + "/js/" + PACKAGE_NAME + ".js"
    }

    return {
        configureWebpack,
        transpileDependencies: true,
        filenameHashing: false,
        devServer: {
            port: PORTS[PACKAGE_NAME]
        }
    }
})
