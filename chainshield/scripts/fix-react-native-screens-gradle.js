const fs = require('fs');
const path = require('path');

const buildGradlePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-screens',
  'android',
  'build.gradle'
);

if (!fs.existsSync(buildGradlePath)) {
  process.exit(0);
}

const original = fs.readFileSync(buildGradlePath, 'utf8');
const brokenBlock = `if (isRunningInContextOfScreensRepo()) {\n    apply from: 'spotless.gradle'\n}`;
const fixedBlock = `if (isRunningInContextOfScreensRepo()) {\n    def spotlessGradle = file('spotless.gradle')\n    if (spotlessGradle.exists()) {\n        apply from: spotlessGradle\n    }\n}`;

if (!original.includes(brokenBlock) || original.includes(fixedBlock)) {
  process.exit(0);
}

fs.writeFileSync(buildGradlePath, original.replace(brokenBlock, fixedBlock));
console.log('Patched react-native-screens/android/build.gradle to tolerate missing spotless.gradle');