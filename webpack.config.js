const path = require('path');

module.exports = {
    entry: './src/index.ts', // Your entry point
    output: {
        filename: 'bundle.js', // Output file
        path: path.resolve(__dirname, 'dist'), // Output directory
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    devServer: {
        static: path.join(__dirname, 'dist'), // Ensure this is pointing to the dist folder
        port: 8080,
        open: true, // This ensures the page automatically opens in the browser
    },
    mode: 'development', // For development
};