const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('expo/config-plugins');

/**
 * App Store Connect rejects a watch app whose version doesn't match its
 * iPhone app, and @bacons/apple-targets stamps watch targets "1.0". This
 * writes the watch app's Info.plist on every prebuild with the app's own
 * version and build number, so the two always match.
 */
module.exports = function withWatchVersion(config) {
  return withDangerousMod(config, [
    'ios',
    async (modConfig) => {
      const file = path.join(modConfig.modRequest.projectRoot, 'targets', 'watch', 'Info.plist');
      const version = String(modConfig.version ?? '1.0');
      const build = String(modConfig.ios?.buildNumber ?? '1');
      fs.writeFileSync(
        file,
        [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
          '<plist version="1.0">',
          '<dict>',
          '  <key>CFBundleShortVersionString</key>',
          `  <string>${version}</string>`,
          '  <key>CFBundleVersion</key>',
          `  <string>${build}</string>`,
          '</dict>',
          '</plist>',
          '',
        ].join('\n'),
      );
      return modConfig;
    },
  ]);
};
