const path = require("path");

const DIST_DIR = path.resolve(__dirname, "dist");
const SRC_DIR = path.resolve(__dirname, "src");

module.exports = {
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: "babel-loader",
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  devServer: {
    static: [DIST_DIR, SRC_DIR],
    https: {
        key: "localhost-key.pem",
        cert: "localhost.pem"
    },
    port: 9090,
    allowedHosts: "all",
  },
};
