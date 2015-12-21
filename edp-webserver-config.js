exports.port = 8848;
exports.directoryIndexes = true;
exports.documentRoot = __dirname;

var BABEL_OPTIONS = {
    modules: 'amd',
    compact: false,
    ast: false,
    sourceMaps: false
};

exports.getLocations = function () {
    return [
        {
            // Under `test` directory but not spec file, this takes priority to `source` rule
            location: /^\/test\/[^\/]+\.js(\?.+)?/,
            handler: [
                file()
            ]
        },
        {
            // All source and spec files
            key: 'source',
            location: /^\/(src|test)(\/[^\/]+)*\.js\?/,
            handler: [
                babel(BABEL_OPTIONS)
            ]
        },
        {
            location: /^.*$/,
            handler: [
                file()
            ]
        }
    ];
};

exports.injectResource = function ( res ) {
    for ( var key in res ) {
        global[ key ] = res[ key ];
    }
};
