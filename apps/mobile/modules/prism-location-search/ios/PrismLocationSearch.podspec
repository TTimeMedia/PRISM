Pod::Spec.new do |s|
  s.name           = 'PrismLocationSearch'
  s.version        = '1.0.0'
  s.summary        = 'Apple MapKit address and place autocomplete for PRISM.'
  s.description    = 'Wraps MKLocalSearchCompleter so appointment locations can be searched like a map.'
  s.author         = 'PRISM'
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,swift}"
end
