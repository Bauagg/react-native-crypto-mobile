/**
 * Konfigurasi dinamis di atas app.json.
 * Build dengan APP_VARIANT=dev (profil "dev" di eas.json) menghasilkan aplikasi terpisah
 * ("Algo Bot Dev", package ...algobotpro.dev) supaya bisa terpasang berdampingan
 * dengan versi produksi dan tidak saling menimpa.
 */
module.exports = ({ config }) => {
  if (process.env.APP_VARIANT !== 'dev') return config;

  return {
    ...config,
    name: 'Algo Bot Dev',
    scheme: `${config.scheme}-dev`,
    android: {
      ...config.android,
      package: `${config.android.package}.dev`,
    },
  };
};
