const { CheckerPlugin } = require('awesome-typescript-loader')
const TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin;
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');


module.exports = [{
  mode: 'production',
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
              outputPath: 'images',
              context: 'dist'
            }
          },
        ],
      }
    ]
  },
  node: {
    __dirname: false
  },
  plugins: [
      new CleanWebpackPlugin(),
      new CheckerPlugin(),
      new CopyPlugin([
        { from: 'public/index.html', to: '.' },
        { from: 'src/assets', to: './assets' }
      ])
  ],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
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
  mode: 'production',
  entry: './src/entry.ts',
  target: 'electron-main',
  module: {
    rules: [{
      test: /\.ts$/,
      include: /src/,
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

