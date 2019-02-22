const path = require('path');

const env = process.env.NODE_ENV || 'development';

if(env === 'development' || env === 'test') {
    const config = require(path.join(__dirname, 'config.json'));
    let envConfig = config[env];

    Object.keys(envConfig).forEach(key => process.env[key] = envConfig[key]);
}