const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (_env, argv) => {
  const isProduction = argv.mode === "production";
  const isDevelopment = !isProduction;

  const config = {
    devtool: isDevelopment && "cheap-module-source-map",
    entry: './frontend/src/index.js',
    output: {
      path: path.resolve(__dirname, 'frontend', 'dist'),
      filename: 'bundle.js',
      publicPath: './',
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
              cacheDirectory: true,
              cacheCompression: false,
              envName: isProduction ? "production" : "development"
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx']
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'frontend', 'public', 'index.html'),
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'frontend', 'dist'),
      },
      compress: true,
      port: 8080,
    },
  };
  return config;
};
