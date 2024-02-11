// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  supabaseUrl:'https://zrzdptljtpgfutrzaqfq.supabase.co',
  supabaseKey:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyemRwdGxqdHBnZnV0cnphcWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjQyNjAyMzksImV4cCI6MTk3OTgzNjIzOX0.5cddPWXKD2OV_A-ORc8LVTsEuZHt88Dbtxr1Y2XsUjQ'
};
// const setEnv = () => {
//   const fs = require('fs');
//   const writeFile = fs.writeFile;
//   const targetPath = './src/environments/environment.ts';
//   const colors = require('colors');
//   require('dotenv').config({
//     path: 'src/environments/.env'
//   });
//   // `environment.ts` file structure
//   const envConfigFile = `export const environment = {
//   apiKey: '${**process.env.API_KEY**}',
//   production: true,
//   };
//   `;
//   writeFile(targetPath, envConfigFile, (err) => {
//     if (err) {
//       console.error(err);
//       throw err;
//     }
//   });
//   setEnv();

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
