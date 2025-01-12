module.exports = {
    webpack: {
        configure: {
            module: {
                rules: [
                    {
                        test: /\.md$/,
                        type: 'asset/source'
                    }
                ]
            }
        }
    }
}; 