const path = require("path");

const { CheckerPlugin } = require('awesome-typescript-loader')
const TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin;
const CopyPlugin = require('copy-webpack-plugin');


module.exports = [
  {
  mode: 'development',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader'
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'assets',
              name:'[name].[ext]'
            }
          },
        ],
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    index: 'index.html',
    compress: true,
    port: 3000,
    hot: true,
    writeToDisk: true
  },
  node: {
    __dirname: false
  },
  plugins: [
      new CheckerPlugin(),
      new CopyPlugin([
        { from: 'public/index.html', to: '.' },
        { from: 'src/assets', to: './assets' }
      ]),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', 'css'],
    plugins: [
      new TsConfigPathsPlugin(/* { tsconfig, compiler } */)
    ]
  },
  externals: { 
    'sqlite3':'commonjs sqlite3',
    "fs": 'require("fs")',
  }
},
{
  mode: 'development',
  entry: './src/entry.ts',
  target: 'electron-main',
  module: {
    rules: [{
      test: /\.ts$/,
      use: [{ loader: 'awesome-typescript-loader' }]
    }]
  },
  node: {
    __dirname: false
  },
  output: {
    path: __dirname + '/',
    filename: 'entry.js'
  }
}
];

