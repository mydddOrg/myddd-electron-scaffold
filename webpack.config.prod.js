const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');


module.exports = [{
  mode: 'production',
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
      new CopyPlugin({
        patterns: [
          { from: 'public/index.html', to: '.' },
          { from: 'src/assets', to: './assets' }
        ],
      })
  ],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
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

