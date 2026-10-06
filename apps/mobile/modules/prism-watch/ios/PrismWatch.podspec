Pod::Spec.new do |s|
  s.name           = 'PrismWatch'
  s.version        = '1.0.0'
  s.summary        = 'Talks to the Prism Apple Watch app.'
  s.description    = 'Sends today\'s doses and the next appointment to the watch, and receives doses logged on the watch.'
  s.author         = 'PRISM'
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.frameworks = 'WatchConnectivity'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,swift}"
end
