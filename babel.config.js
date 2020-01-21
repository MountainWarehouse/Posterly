module.exports = {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
        [
            'rewrite-require',
            {
                aliases: {
                    joi: 'joi-react-native'
                }
            }
        ]
    ]
};
