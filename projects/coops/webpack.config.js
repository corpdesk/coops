const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({

  name: 'coops',

  exposes: {
    './Component': './projects/coops/src/app/app.component.ts',
    './PagesModule': './projects/coops/src/app/pages/pages.module.ts',
    './LoginComponent': './projects/coops/src/app/account/auth/login/login.component.ts',
    './UserFrontModule': './projects/coops/src/app/modules/user/user-front.module.ts',
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

});
