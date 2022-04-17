process.env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({
  module: 'CommonJS',
})

module.exports = {
  require: [
    'tsconfig-paths/register',
    'ts-node/register',
    './src/helpers/test/register.ts',
  ],
  'watch-files': ['./src/**/*.ts'],
  // 'loader': 'ts-node/esm',
  // "node-option": ["experimental-specifier-resolution=node", "loader=ts-node/esm"],
}
