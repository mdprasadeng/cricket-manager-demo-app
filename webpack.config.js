const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const Dotenv = require("dotenv-webpack");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    publicPath: "/", // ensure routing works
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new Dotenv(),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    compress: true,
    port: 2020,
    proxy: [
      {
        context: ["/relayer"],
        target: "https://cm-relayer.dev.munna-bhai.xyz",
        changeOrigin: true,
        secure: false,
        pathRewrite: { "^/relayer": "" },
      },
    ],
  },
  resolve: {
    fallback: {
      process: require.resolve("process/browser"),
    },
  },
};
