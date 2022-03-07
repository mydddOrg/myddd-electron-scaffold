const path = require("path");

const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');


module.exports = [
  {
    mode: 'development',
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader'
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.less$/i,
          use: ['style-loader', 'css-loader','less-loader'],
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                outputPath: 'assets',
                name: '[name].[ext]'
              }
            },
          ],
        }
      ]
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      compress: true,
      port: 3000,
      hot: true
    },
    node: {
      __dirname: false
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: 'public/index.html', to: '.' },
          { from: 'src/assets', to: './assets' }
        ],
      })
    ],
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', 'css'],
      plugins: [
        new TsConfigPathsPlugin(/* { tsconfig, compiler } */)
      ],
      fallback: {
        "fs": false,
        "tls": false,
        "net": false,
        "path": false,
        "zlib": false,
        "http": false,
        "https": false,
        "stream": false
      }
    },
    externals: {
      'sqlite3': 'commonjs sqlite3',
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
        use: [{ loader: 'ts-loader' }]
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

